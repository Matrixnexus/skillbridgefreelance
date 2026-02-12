import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";

async function getPesapalToken(): Promise<string> {
  const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");

  if (!consumerKey || !consumerSecret) {
    throw new Error("Pesapal credentials not configured");
  }

  const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`);
  }

  return data.token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Pesapal sends IPN as GET with query params
    const url = new URL(req.url);
    const orderTrackingId = url.searchParams.get("OrderTrackingId");
    const orderMerchantReference = url.searchParams.get("OrderMerchantReference");
    const orderNotificationType = url.searchParams.get("OrderNotificationType");

    console.log("Pesapal IPN received:", { orderTrackingId, orderMerchantReference, orderNotificationType });

    if (!orderTrackingId || !orderMerchantReference) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get transaction status from Pesapal
    const pesapalToken = await getPesapalToken();

    const statusResponse = await fetch(
      `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${pesapalToken}`,
        },
      }
    );

    const statusData = await statusResponse.json();
    console.log("Pesapal transaction status:", statusData);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Map Pesapal status codes: 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
    const paymentId = orderMerchantReference;
    const pesapalStatus = statusData.payment_status_description?.toUpperCase();

    if (pesapalStatus === "COMPLETED" || statusData.status_code === 1) {
      // Update payment to completed
      const { data: payment } = await supabase
        .from("payments")
        .update({
          status: "completed",
          paypal_order_id: orderTrackingId,
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (payment) {
        // Activate membership
        const tierMap: Record<string, string> = { regular: "regular", pro: "pro", vip: "vip" };
        const membershipTier = tierMap[payment.plan] || "regular";
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await supabase
          .from("profiles")
          .update({
            membership_tier: membershipTier,
            membership_expires_at: expiresAt.toISOString(),
          })
          .eq("id", payment.user_id);

        // Create subscription record
        await supabase.from("subscriptions").insert({
          user_id: payment.user_id,
          plan: payment.plan,
          plan_name: payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1),
          status: "active",
          expires_at: expiresAt.toISOString(),
          paypal_order_id: orderTrackingId,
        });

        // Create notification
        await supabase.from("notifications").insert({
          user_id: payment.user_id,
          title: "Payment Successful!",
          message: `Your ${payment.plan} membership has been activated via M-Pesa/Pesapal.`,
          type: "payment_success",
        });

        console.log(`Membership activated for user ${payment.user_id} - ${membershipTier}`);
      }
    } else if (pesapalStatus === "FAILED" || statusData.status_code === 2) {
      await supabase
        .from("payments")
        .update({ status: "failed", paypal_order_id: orderTrackingId })
        .eq("id", paymentId);
    }

    // Pesapal expects a 200 response
    return new Response(
      JSON.stringify({
        orderNotificationType,
        orderTrackingId,
        orderMerchantReference,
        status: 200,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Pesapal IPN error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
