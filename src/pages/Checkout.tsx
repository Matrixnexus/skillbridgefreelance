import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const planDetails = {
    regular: { name: 'Regular', price: 15, tier: 'regular' },
    pro: { name: 'Pro', price: 25, tier: 'pro' },
    vip: { name: 'VIP', price: 49, tier: 'vip' },
  };

  const currentPlan = plan && plan in planDetails ? planDetails[plan as keyof typeof planDetails] : null;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!currentPlan) {
      navigate('/pricing');
      return;
    }

    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&disable-funding=credit,card`;
    script.addEventListener('load', () => setPaypalLoaded(true));
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [user, currentPlan, navigate]);

  useEffect(() => {
    if (paypalLoaded && paypalRef.current && currentPlan && window.paypal) {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: currentPlan.price.toString(),
                currency_code: 'USD'
              },
              description: `SkillBridge ${currentPlan.name} Membership - 1 Month`
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setIsProcessing(true);
          try {
            const order = await actions.order.capture();

            if (order.status === 'COMPLETED') {
              const expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + 1);

              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  membership_tier: currentPlan.tier,
                  membership_expires_at: expiresAt.toISOString(),
                  daily_tasks_used: 0,
                })
                .eq('id', user!.id);

              if (updateError) throw updateError;

              const { error: transactionError } = await supabase
                .from('transactions')
                .insert({
                  user_id: user!.id,
                  type: 'subscription',
                  amount: -currentPlan.price,
                  status: 'completed',
                  description: `${currentPlan.name} Membership - Monthly Subscription`,
                  reference_id: order.id
                });

              if (transactionError) throw transactionError;

              await refreshProfile();

              toast({
                title: 'Payment Successful',
                description: `You've been upgraded to ${currentPlan.name} membership!`,
              });

              navigate('/dashboard');
            }
          } catch (error: any) {
            console.error('Payment processing error:', error);
            toast({
              title: 'Payment Error',
              description: 'Failed to process payment. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          toast({
            title: 'Payment Failed',
            description: 'There was an error processing your payment.',
            variant: 'destructive',
          });
        }
      }).render(paypalRef.current);
    }
  }, [paypalLoaded, currentPlan, user, navigate, toast, refreshProfile]);

  if (!currentPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="glass-card p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              Upgrade to {currentPlan.name} membership
            </p>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-foreground">
                {currentPlan.name} Membership
              </span>
              <span className="text-3xl font-bold text-primary">
                ${currentPlan.price}
                <span className="text-sm text-muted-foreground font-normal">/month</span>
              </span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Billed monthly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>7-day money-back guarantee</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
            {isProcessing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Processing payment...</span>
              </div>
            ) : (
              <div ref={paypalRef} />
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
            <p className="mt-2">Secure payment powered by PayPal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    paypal: any;
  }
}

export default Checkout;
