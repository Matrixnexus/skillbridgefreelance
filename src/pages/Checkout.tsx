import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  Shield, 
  CreditCard, 
  Lock, 
  AlertCircle,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';

declare global {
  interface Window {
    paypal: any;
  }
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedButton, setCopiedButton] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'direct' | 'link' | 'mobile'>('direct');
  const [showQRCode, setShowQRCode] = useState(false);

  const planDetails = {
    regular: { 
      name: 'Regular', 
      price: 15, 
      tier: 'regular',
      hostedButtonId: 'W3KQGR87LQRH8',
      paymentLink: 'https://www.paypal.com/ncp/payment/W3KQGR87LQRH8'
    },
    pro: { 
      name: 'Pro', 
      price: 25, 
      tier: 'pro',
      hostedButtonId: 'BGAP4WS73X4DQ',
      paymentLink: 'https://www.paypal.com/ncp/payment/BGAP4WS73X4DQ'
    },
    vip: { 
      name: 'VIP', 
      price: 45, 
      tier: 'vip',
      hostedButtonId: 'LZRR3X4VP4PQL',
      paymentLink: 'https://www.paypal.com/ncp/payment/LZRR3X4VP4PQL'
    },
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
  }, [user, currentPlan, navigate]);

  const copyToClipboard = (text: string, buttonType: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedButton(buttonType);
        toast({
          title: 'Copied!',
          description: `${buttonType} copied to clipboard`,
        });
        setTimeout(() => setCopiedButton(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: 'Copy failed',
          description: 'Please select and copy manually',
          variant: 'destructive',
        });
      });
  };

  const handlePaymentComplete = async (orderId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Verify payment using your edge function
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          orderId,
          userId: user?.id,
          plan: currentPlan?.tier
        }
      });

      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      toast({
        title: 'Payment Successful!',
        description: `Your ${currentPlan?.name} membership has been activated.`,
        variant: 'default',
      });

      // Redirect to dashboard after successful payment
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Payment verification error:', error);
      setError(error.message || 'Failed to verify payment. Please contact support.');
      
      toast({
        title: 'Verification Required',
        description: 'Please check your email for payment confirmation.',
        variant: 'destructive',
      });

      // Fallback: Redirect to success page with verification
      setTimeout(() => {
        window.location.href = `https://skillbridgefreelance.netlify.app/payment-success?order_id=${orderId}&user_id=${user?.id}&plan=${currentPlan?.tier}`;
      }, 3000);

    } finally {
      setIsProcessing(false);
    }
  };

  const createAndProcessPayment = async () => {
    if (!user || !currentPlan) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create a payment record in your database first
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          plan: currentPlan.tier,
          amount: currentPlan.price,
          status: 'pending'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create the verification URL
      const verificationUrl = `https://skillbridgefreelance.netlify.app/payment-success?payment_id=${paymentData.id}&user_id=${user.id}&plan=${currentPlan.tier}&amount=${currentPlan.price}`;
      
      // Encode the verification URL in the return URL
      const returnUrl = encodeURIComponent(verificationUrl);
      const cancelUrl = encodeURIComponent('https://skillbridgefreelance.netlify.app/pricing');
      
      // Construct PayPal URL with hosted button and custom return URLs
      const paypalUrl = `${currentPlan.paymentLink}?return=${returnUrl}&cancel_return=${cancelUrl}`;
      
      // Open PayPal in new window
      const paypalWindow = window.open(paypalUrl, '_blank', 'width=600,height=700');
      
      if (!paypalWindow) {
        toast({
          title: 'Popup blocked',
          description: 'Please allow popups for this site to continue.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'PayPal Opened',
        description: 'Complete your payment in the PayPal window.',
      });

      // Poll for payment completion
      const checkPayment = setInterval(async () => {
        try {
          const { data: updatedPayment, error: checkError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentData.id)
            .single();

          if (checkError) throw checkError;

          if (updatedPayment.status === 'completed') {
            clearInterval(checkPayment);
            paypalWindow?.close();
            await handlePaymentComplete(updatedPayment.paypal_order_id || paymentData.id);
          } else if (updatedPayment.status === 'failed') {
            clearInterval(checkPayment);
            paypalWindow?.close();
            throw new Error('Payment failed. Please try again.');
          }
        } catch (error) {
          console.error('Payment check error:', error);
        }
      }, 3000); // Check every 3 seconds

      // Set timeout for payment window
      setTimeout(() => {
        clearInterval(checkPayment);
        paypalWindow?.close();
        setIsProcessing(false);
      }, 300000); // 5 minutes timeout

    } catch (error: any) {
      console.error('Payment creation error:', error);
      setError(error.message || 'Failed to initiate payment.');
      setIsProcessing(false);
      
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderDirectButton = () => {
    if (!currentPlan) return null;

    const buttonClass = `pp-${currentPlan.hostedButtonId}`;
    const style = `.${buttonClass}{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}`;

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <style>{style}</style>
          
          <div className="inline-grid justify-items-center align-content-start gap-2 w-full max-w-sm">
            <Button
              onClick={createAndProcessPayment}
              disabled={isProcessing}
              className="bg-[#FFD140] hover:bg-[#FFC820] text-black font-bold py-6 px-8 rounded-lg text-lg w-full max-w-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${currentPlan.price} with PayPal`
              )}
            </Button>
            
            <div className="flex items-center gap-2 mt-2">
              <img 
                src="https://www.paypalobjects.com/images/Debit_Credit.svg" 
                alt="cards" 
                className="h-6"
              />
              <span className="text-xs text-muted-foreground flex items-center"> 
                Powered by 
                <img 
                  src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
                  alt="paypal" 
                  className="h-3 ml-1 inline"
                />
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const formHtml = `<div>
  <style>.pp-${currentPlan.hostedButtonId}{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}</style>
  <form action="${currentPlan.paymentLink}" method="post" target="_blank" style="display:inline-grid;justify-items:center;align-content:start;gap:0.5rem;">
    <input class="pp-${currentPlan.hostedButtonId}" type="submit" value="Buy Now" />
    <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" />
    <section style="font-size: 0.75rem;"> Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" style="height:0.875rem;vertical-align:middle;"/></section>
  </form>
</div>`;
              copyToClipboard(formHtml, 'HTML Button Code');
            }}
            className="gap-2"
            disabled={isProcessing}
          >
            {copiedButton === 'HTML Button Code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy HTML Button Code
          </Button>
        </div>
      </div>
    );
  };

  const renderPaymentLink = () => {
    if (!currentPlan) return null;

    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Direct Payment Link
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 p-2 bg-background rounded text-sm break-all">
              {currentPlan.paymentLink}
            </code>
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(currentPlan.paymentLink, 'Payment Link')}
              className="shrink-0"
              disabled={isProcessing}
            >
              {copiedButton === 'Payment Link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="default"
              onClick={createAndProcessPayment}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Open Payment Link
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowQRCode(!showQRCode)}
              className="gap-2"
              disabled={isProcessing}
            >
              <QrCode className="w-4 h-4" />
              {showQRCode ? 'Hide' : 'Show'} QR Code
            </Button>
          </div>
        </div>

        {showQRCode && (
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <div className="bg-white p-4 rounded-lg mb-2">
              <QRCode 
                value={currentPlan.paymentLink}
                size={200}
                level="H"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to open the payment page on your mobile device
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMobilePayment = () => {
    if (!currentPlan) return null;

    const mobilePaymentUrl = `${currentPlan.paymentLink}?native_xo=1`;

    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile Payment
          </h3>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg mb-2 inline-block">
                <QRCode 
                  value={mobilePaymentUrl}
                  size={200}
                  level="H"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Scan QR code with your phone camera to pay with PayPal app
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <code className="flex-1 p-2 bg-background rounded text-sm break-all">
                {mobilePaymentUrl}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(mobilePaymentUrl, 'Mobile Payment Link')}
                className="shrink-0"
                disabled={isProcessing}
              >
                {copiedButton === 'Mobile Payment Link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="default"
                onClick={createAndProcessPayment}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay on Mobile Device'
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-foreground">
            <strong>How it works:</strong>
          </p>
          <ol className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-decimal">
            <li>Scan the QR code with your phone camera</li>
            <li>It will open the PayPal app</li>
            <li>Complete the payment in the app</li>
            <li>Return to this page for automatic verification</li>
          </ol>
        </div>
      </div>
    );
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
              Upgrade to {currentPlan.name} membership - ${currentPlan.price}/month
            </p>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
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
                  <span>Automatic payment verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Instant membership activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Secure PayPal hosted payment</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Choose Payment Method</h2>
              <div className="text-sm text-muted-foreground">
                Select your preferred way to pay
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
              <Button
                variant={paymentMethod === 'direct' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('direct')}
                className="h-auto py-3"
                disabled={isProcessing}
              >
                <div className="flex flex-col items-center">
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span className="text-sm">Direct Payment</span>
                  <span className="text-xs text-muted-foreground mt-1">PayPal Checkout</span>
                </div>
              </Button>
              
              <Button
                variant={paymentMethod === 'link' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('link')}
                className="h-auto py-3"
                disabled={isProcessing}
              >
                <div className="flex flex-col items-center">
                  <ExternalLink className="w-5 h-5 mb-1" />
                  <span className="text-sm">Payment Link</span>
                  <span className="text-xs text-muted-foreground mt-1">URL & QR Code</span>
                </div>
              </Button>
              
              <Button
                variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('mobile')}
                className="h-auto py-3"
                disabled={isProcessing}
              >
                <div className="flex flex-col items-center">
                  <Smartphone className="w-5 h-5 mb-1" />
                  <span className="text-sm">Mobile Payment</span>
                  <span className="text-xs text-muted-foreground mt-1">Phone App</span>
                </div>
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm text-green-500 font-medium mb-1">Automatic Verification System</p>
                  <p className="text-sm text-foreground">
                    After payment, our system will <strong>automatically verify</strong> and activate your membership.
                    No manual steps required!
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Payment Amount:</span>
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">${currentPlan.price}.00</span>
                <span className="text-sm text-muted-foreground">USD - Live Payment</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly recurring payment - Cancel anytime
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

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <span className="text-muted-foreground mb-2">Processing your payment...</span>
              <span className="text-xs text-muted-foreground">Please complete the payment in the PayPal window</span>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethod === 'direct' ? (
                renderDirectButton()
              ) : paymentMethod === 'link' ? (
                renderPaymentLink()
              ) : (
                renderMobilePayment()
              )}
              
              <div className="text-center">
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              <p>Secure & Automatic Payment Processing</p>
            </div>
            <p className="text-xs">
              Payments are processed by PayPal. Membership is activated automatically after payment verification.
            </p>
            <div className="mt-4 flex justify-center items-center gap-4">
              <img 
                src="https://www.paypalobjects.com/images/Debit_Credit.svg" 
                alt="Credit Cards" 
                className="h-6"
              />
              <img 
                src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
                alt="PayPal" 
                className="h-5"
              />
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs">Automatic Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;