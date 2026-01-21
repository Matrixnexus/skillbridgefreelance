import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader2, Shield, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    paypal: any;
  }
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPayPalScriptLoaded, setIsPayPalScriptLoaded] = useState(false);

  const planDetails = {
    regular: { 
      name: 'Regular', 
      price: 15, 
      tier: 'regular',
      hostedButtonId: 'W3KQGR87LQRH8',
      containerId: 'paypal-container-W3KQGR87LQRH8'
    },
    pro: { 
      name: 'Pro', 
      price: 25, 
      tier: 'pro',
      hostedButtonId: 'BGAP4WS73X4DQ',
      containerId: 'paypal-container-BGAP4WS73X4DQ'
    },
    vip: { 
      name: 'VIP', 
      price: 45, 
      tier: 'vip',
      hostedButtonId: 'LZRR3X4VP4PQL',
      containerId: 'paypal-container-LZRR3X4VP4PQL'
    },
  };

  const currentPlan = plan && plan in planDetails ? planDetails[plan as keyof typeof planDetails] : null;

  // Load PayPal SDK with hosted buttons
  useEffect(() => {
    const clientId = 'BAARlfOaV0tKM0XdcJy3EwF8wtdp3MNBD9IGtP-lvMZA1BrSWO4A8apJv37DAZDBX72a0ap3Of-Q6O24PA';
    
    console.log('Loading PayPal SDK with Hosted Buttons for:', currentPlan?.name);
    
    // Remove any existing PayPal script
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&disable-funding=venmo&currency=USD`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ PayPal SDK with Hosted Buttons loaded successfully');
      setIsPayPalScriptLoaded(true);
      initializePayPalHostedButton();
    };
    
    script.onerror = (err) => {
      console.error('❌ Failed to load PayPal SDK:', err);
      setError('Failed to load payment system. Please refresh the page or contact support.');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on component unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [currentPlan]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!currentPlan) {
      navigate('/pricing');
      return;
    }
  }, [user, currentPlan, navigate]);

  const initializePayPalHostedButton = () => {
    if (!window.paypal || !isPayPalScriptLoaded || !currentPlan) {
      console.log('PayPal SDK not ready yet');
      return;
    }

    // Clear any existing container content
    const container = document.getElementById(currentPlan.containerId);
    if (container) {
      container.innerHTML = '';
    }

    try {
      // Initialize the hosted button for the specific plan
      paypal.HostedButtons({
        hostedButtonId: currentPlan.hostedButtonId,
        onInit: (data: any, actions: any) => {
          console.log(`✅ Hosted button initialized for ${currentPlan.name}`);
        },
        onClick: () => {
          console.log(`User clicked ${currentPlan.name} payment button`);
          setIsProcessing(true);
          setError(null);
        },
        onError: (err: any) => {
          console.error('❌ PayPal button error:', err);
          setIsProcessing(false);
          setError('Payment system error. Please try again or contact support.');
        },
        onApprove: async (data: any, actions: any) => {
          console.log(`✅ Payment approved for ${currentPlan.name}, order ID:`, data.orderID);
          
          try {
            // Capture payment
            const { data: captureData, error: captureError } = await supabase.functions.invoke('capture-paypal-order', {
              body: { orderId: data.orderID }
            });

            if (captureError || !captureData?.success) {
              console.warn('Capture may have failed, redirecting for verification');
              // Redirect to verification page
              window.location.href = `https://skillbridgefreelance.netlify.app/payment-success?order_id=${data.orderID}&user_id=${user?.id}&plan=${currentPlan.tier}`;
              return;
            }

            // Success - refresh and redirect
            await refreshProfile();
            
            toast({
              title: 'Payment Successful!',
              description: `Your ${currentPlan.name} membership has been activated.`,
              variant: 'default',
            });
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
            
          } catch (error: any) {
            console.error('Payment processing error:', error);
            
            // Redirect to verification page as fallback
            toast({
              title: 'Verifying Payment',
              description: 'Redirecting for payment verification...',
            });
            
            setTimeout(() => {
              window.location.href = `https://skillbridgefreelance.netlify.app/payment-success?order_id=${data.orderID}&user_id=${user?.id}&plan=${currentPlan.tier}`;
            }, 1000);
            
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: (data: any) => {
          console.log(`Payment cancelled for ${currentPlan.name}`);
          setIsProcessing(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process.',
            variant: 'destructive',
          });
        }
      }).render(`#${currentPlan.containerId}`);
      
      console.log(`✅ PayPal hosted button rendered for ${currentPlan.name}`);
      
    } catch (error) {
      console.error('Error initializing PayPal hosted button:', error);
      setError('Payment system error. Please try the manual option below.');
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Complete Your Purchase
            </h1>
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
                <span>Live PayPal Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Automatic activation after payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Secure hosted payment button</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Live Payment</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-500 font-medium mb-1">Live PayPal Hosted Payment</p>
                    <p className="text-sm text-foreground">
                      This is a <strong>real payment</strong>. Click below to pay ${currentPlan.price} via PayPal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">${currentPlan.price}.00</span>
                  <span className="text-sm text-muted-foreground">USD - Real Payment</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly subscription - Live hosted payment button
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-500 font-medium mb-1">Error</p>
                      <p className="text-sm text-foreground">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <span className="text-muted-foreground mb-2">Processing payment...</span>
              <span className="text-xs text-muted-foreground">Please wait</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* PayPal Hosted Button Container */}
              <div className="min-h-[55px] flex flex-col items-center">
                <div id={currentPlan.containerId} className="w-full max-w-sm">
                  {!isPayPalScriptLoaded && (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading PayPal...</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the PayPal button to complete your payment
                </p>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              <p>Secure live payment via PayPal Hosted Button</p>
            </div>
            <p className="text-xs">You will be redirected for automatic verification after payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;