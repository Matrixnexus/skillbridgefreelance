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

async function registerIPN(token: string, callbackUrl: string): Promise<string> {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: callbackUrl,
      ipn_notification_type: "GET",
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(`IPN registration failed: ${JSON.stringify(data)}`);
  }

  return data.ipn_id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const { plan, amount, callbackUrl } = await req.json();

    if (!plan || !amount || !callbackUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Pesapal auth token
    const pesapalToken = await getPesapalToken();

    // Register IPN URL
    const ipnUrl = `${supabaseUrl}/functions/v1/pesapal-ipn`;
    const ipnId = await registerIPN(pesapalToken, ipnUrl);

    // Create payment record
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: paymentData, error: paymentError } = await serviceClient
      .from("payments")
      .insert({
        user_id: userId,
        plan,
        amount,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Submit order to Pesapal
    const orderId = paymentData.id;
    const orderPayload = {
      id: orderId,
      currency: "USD",
      amount: Number(amount),
      description: `SkillBridge ${plan} membership`,
      callback_url: callbackUrl,
      notification_id: ipnId,
      billing_address: {
        email_address: userEmail,
        phone_number: "",
        country_code: "KE",
        first_name: userEmail.split("@")[0],
        middle_name: "",
        last_name: "",
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: "",
      },
    };

    const orderResponse = await fetch(
      `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${pesapalToken}`,
        },
        body: JSON.stringify(orderPayload),
      }
    );

    const orderData = await orderResponse.json();
    if (!orderResponse.ok || orderData.error) {
      throw new Error(`Order submission failed: ${JSON.stringify(orderData)}`);
    }

    // Update payment with Pesapal tracking ID
    await serviceClient
      .from("payments")
      .update({ paypal_order_id: orderData.order_tracking_id })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: orderData.redirect_url,
        order_tracking_id: orderData.order_tracking_id,
        payment_id: orderId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Pesapal create order error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
