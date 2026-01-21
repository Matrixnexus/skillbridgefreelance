import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader2, Shield, ExternalLink, CreditCard, Lock, AlertCircle } from 'lucide-react';
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
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const planDetails = {
    regular: { name: 'Regular', price: 15, tier: 'regular' },
    pro: { name: 'Pro', price: 25, tier: 'pro' },
    vip: { name: 'VIP', price: 45, tier: 'vip' },
  };

  const currentPlan = plan && plan in planDetails ? planDetails[plan as keyof typeof planDetails] : null;

  // Load LIVE PayPal SDK
  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    
    console.log('Loading LIVE PayPal with Client ID:', clientId ? 'Set' : 'Missing');
    
    if (!clientId) {
      console.error('PayPal Client ID is missing. Check your environment variables.');
      setError('Payment system configuration error. Please contact support.');
      return;
    }

    // Remove any existing PayPal script
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&disable-funding=venmo,card`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ LIVE PayPal SDK loaded successfully');
      setIsPayPalScriptLoaded(true);
    };
    
    script.onerror = (err) => {
      console.error('❌ Failed to load LIVE PayPal SDK:', err);
      setError('Failed to load payment system. Please refresh the page or contact support.');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on component unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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

  const createPayPalOrder = async () => {
    if (!user || !currentPlan) return null;

    try {
      console.log('Creating LIVE PayPal order for:', currentPlan.tier);
      
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          tier: currentPlan.tier,
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create payment order');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      console.log('LIVE PayPal order created:', data.orderId);
      setPaypalOrderId(data.orderId);
      return data.orderId;
    } catch (error: any) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  };

  const initializePayPalButtons = () => {
    if (!window.paypal || !isPayPalScriptLoaded || !currentPlan) {
      console.log('PayPal SDK not ready');
      return;
    }

    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }

    try {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
          height: 55,
          tagline: false
        },
        
        createOrder: async (data: any, actions: any) => {
          console.log('LIVE PayPal createOrder triggered');
          setIsProcessing(true);
          setError(null);
          
          try {
            const orderId = await createPayPalOrder();
            setIsProcessing(false);
            return orderId;
          } catch (error: any) {
            setIsProcessing(false);
            setError(error.message || 'Failed to create payment order.');
            throw error;
          }
        },
        
        onApprove: async (data: any, actions: any) => {
          console.log('✅ LIVE PayPal payment approved:', data.orderID);
          setIsProcessing(true);
          
          try {
            // Capture payment
            const { data: captureData, error: captureError } = await supabase.functions.invoke('capture-paypal-order', {
              body: { orderId: data.orderID }
            });

            if (captureError || !captureData?.success) {
              console.warn('Capture may have failed, redirecting for verification');
              window.location.href = `https://skillbridgefreelance.netlify.app/payment-success?order_id=${data.orderID}&user_id=${user?.id}`;
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
              window.location.href = `https://skillbridgefreelance.netlify.app/payment-success?order_id=${data.orderID}&user_id=${user?.id}`;
            }, 1000);
            
          } finally {
            setIsProcessing(false);
          }
        },
        
        onError: (err: any) => {
          console.error('❌ LIVE PayPal error:', err);
          setIsProcessing(false);
          setError('Payment failed. Please try again or use a different payment method.');
        },
        
        onCancel: (data: any) => {
          console.log('LIVE PayPal payment cancelled');
          setIsProcessing(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process.',
            variant: 'destructive',
          });
        }
        
      }).render('#paypal-button-container');
      
      console.log('✅ LIVE PayPal buttons initialized');
      
    } catch (error) {
      console.error('Error initializing PayPal buttons:', error);
      setError('Payment system error. Please try the manual option below.');
    }
  };

  const handleDirectPayPal = () => {
    if (!user || !currentPlan) return;
    
    setIsProcessing(true);
    
    createPayPalOrder()
      .then(orderId => {
        if (orderId) {
          // Direct PayPal checkout URL (LIVE)
          const paypalCheckoutUrl = `https://www.paypal.com/checkoutnow?token=${orderId}`;
          window.open(paypalCheckoutUrl, '_blank', 'noopener,noreferrer');
          
          toast({
            title: 'PayPal Checkout Opened',
            description: 'Complete your payment in the PayPal window.',
          });
        }
      })
      .catch(error => {
        setError(error.message);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  useEffect(() => {
    if (isPayPalScriptLoaded && currentPlan) {
      initializePayPalButtons();
    }
  }, [currentPlan, isPayPalScriptLoaded]);

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
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Live Payment</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-500 font-medium mb-1">Live PayPal Payment</p>
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
                  Monthly subscription - Live payment
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
              {/* PayPal Button Container */}
              <div id="paypal-button-container" className="min-h-[55px]">
                {!isPayPalScriptLoaded && (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading PayPal...</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button
                  onClick={handleDirectPayPal}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open PayPal in New Window
                </Button>
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
              <p>Secure live payment via PayPal</p>
            </div>
            <p className="text-xs">You will be redirected for automatic verification after payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;