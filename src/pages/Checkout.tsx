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
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'pesapal'>('paypal');
  const [paypalMode, setPaypalMode] = useState<'direct' | 'link' | 'mobile'>('direct');
  const [showQRCode, setShowQRCode] = useState(false);
  const [pesapalPaymentId, setPesapalPaymentId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const planDetails = {
    regular: { 
      name: 'Regular', 
      price: 15, 
      priceKsh: 1500,
      tier: 'regular',
      hostedButtonId: 'W3KQGR87LQRH8',
      paymentLink: 'https://www.paypal.com/ncp/payment/W3KQGR87LQRH8'
    },
    pro: { 
      name: 'Pro', 
      price: 25, 
      priceKsh: 2500,
      tier: 'pro',
      hostedButtonId: 'BGAP4WS73X4DQ',
      paymentLink: 'https://www.paypal.com/ncp/payment/BGAP4WS73X4DQ'
    },
    vip: { 
      name: 'VIP', 
      price: 45, 
      priceKsh: 4500,
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

  // Poll for Pesapal payment status
  useEffect(() => {
    if (!pesapalPaymentId) return;

    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase.functions.invoke('pesapal-status', {
          body: { paymentId: pesapalPaymentId },
        });

        if (error) return;

        if (data?.status === 'completed') {
          clearInterval(interval);
          setPesapalPaymentId(null);
          setIsProcessing(false);
          toast({
            title: 'Payment Successful!',
            description: `Your ${currentPlan?.name} membership has been activated via M-Pesa.`,
          });
          setTimeout(() => navigate('/dashboard'), 2000);
        } else if (data?.status === 'failed') {
          clearInterval(interval);
          setPesapalPaymentId(null);
          setIsProcessing(false);
          setError('Payment failed. Please try again.');
        }
      } catch (e) {
        console.error('Status check error:', e);
      }
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPesapalPaymentId(null);
      setIsProcessing(false);
    }, 600000); // 10 min timeout

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pesapalPaymentId, currentPlan, navigate, toast]);

  const copyToClipboard = (text: string, buttonType: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedButton(buttonType);
        toast({ title: 'Copied!', description: `${buttonType} copied to clipboard` });
        setTimeout(() => setCopiedButton(null), 2000);
      })
      .catch(() => {
        toast({ title: 'Copy failed', description: 'Please select and copy manually', variant: 'destructive' });
      });
  };

  const handlePaymentComplete = async (orderId: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { orderId, userId: user?.id, plan: currentPlan?.tier },
      });
      if (error) throw new Error(error.message || 'Payment verification failed');
      if (!data.success) throw new Error(data.error || 'Payment verification failed');

      toast({ title: 'Payment Successful!', description: `Your ${currentPlan?.name} membership has been activated.` });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setError(error.message || 'Failed to verify payment. Please contact support.');
      toast({ title: 'Verification Required', description: 'Please check your email for payment confirmation.', variant: 'destructive' });
      setTimeout(() => {
        window.location.href = `https://skillbridgefreelance.netlify.app/payment-success?order_id=${orderId}&user_id=${user?.id}&plan=${currentPlan?.tier}`;
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const createAndProcessPaypalPayment = async () => {
    if (!user || !currentPlan) return;
    setIsProcessing(true);
    setError(null);

    try {
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({ user_id: user.id, plan: currentPlan.tier, amount: currentPlan.price, status: 'pending' })
        .select()
        .single();

      if (paymentError) throw paymentError;

      const verificationUrl = `https://skillbridgefreelance.netlify.app/payment-success?payment_id=${paymentData.id}&user_id=${user.id}&plan=${currentPlan.tier}&amount=${currentPlan.price}`;
      const returnUrl = encodeURIComponent(verificationUrl);
      const cancelUrl = encodeURIComponent('https://skillbridgefreelance.netlify.app/pricing');
      const paypalUrl = `${currentPlan.paymentLink}?return=${returnUrl}&cancel_return=${cancelUrl}`;
      
      const paypalWindow = window.open(paypalUrl, '_blank', 'width=600,height=700');
      if (!paypalWindow) {
        toast({ title: 'Popup blocked', description: 'Please allow popups for this site.', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }

      toast({ title: 'PayPal Opened', description: 'Complete your payment in the PayPal window.' });

      const checkPayment = setInterval(async () => {
        try {
          const { data: updatedPayment } = await supabase.from('payments').select('*').eq('id', paymentData.id).single();
          if (updatedPayment?.status === 'completed') {
            clearInterval(checkPayment);
            paypalWindow?.close();
            await handlePaymentComplete(updatedPayment.paypal_order_id || paymentData.id);
          } else if (updatedPayment?.status === 'failed') {
            clearInterval(checkPayment);
            paypalWindow?.close();
            setError('Payment failed. Please try again.');
            setIsProcessing(false);
          }
        } catch (e) { console.error('Payment check error:', e); }
      }, 3000);

      setTimeout(() => { clearInterval(checkPayment); paypalWindow?.close(); setIsProcessing(false); }, 300000);
    } catch (error: any) {
      console.error('Payment creation error:', error);
      setError(error.message || 'Failed to initiate payment.');
      setIsProcessing(false);
      toast({ title: 'Payment Error', description: 'Failed to initiate payment. Please try again.', variant: 'destructive' });
    }
  };

  const handlePesapalPayment = async () => {
    if (!user || !currentPlan) return;
    setIsProcessing(true);
    setError(null);

    try {
      const callbackUrl = `${window.location.origin}/checkout?plan=${plan}&pesapal=callback`;

      if (!phoneNumber.trim()) {
        setError('Please enter your M-Pesa phone number.');
        setIsProcessing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('pesapal-create-order', {
        body: {
          plan: currentPlan.tier,
          amount: currentPlan.priceKsh,
          currency: 'KES',
          phoneNumber: phoneNumber.trim(),
          callbackUrl,
        },
      });

      if (error) throw new Error(error.message || 'Failed to create Pesapal order');
      if (!data?.redirect_url) throw new Error('No redirect URL received from Pesapal');

      setPesapalPaymentId(data.payment_id);

      toast({ title: 'Redirecting to Pesapal', description: 'Complete your M-Pesa payment on the Pesapal page.' });

      // Open Pesapal payment page
      const pesapalWindow = window.open(data.redirect_url, '_blank', 'width=600,height=700');
      if (!pesapalWindow) {
        // Fallback: redirect in same window
        window.location.href = data.redirect_url;
      }
    } catch (error: any) {
      console.error('Pesapal payment error:', error);
      setError(error.message || 'Failed to initiate M-Pesa payment.');
      setIsProcessing(false);
      toast({ title: 'Payment Error', description: error.message || 'Failed to initiate payment.', variant: 'destructive' });
    }
  };

  // Check for Pesapal callback
  useEffect(() => {
    const pesapalCallback = searchParams.get('pesapal');
    const orderTrackingId = searchParams.get('OrderTrackingId');

    if (pesapalCallback === 'callback' && orderTrackingId) {
      toast({ title: 'Payment Processing', description: 'Verifying your M-Pesa payment...' });
      // The IPN will handle the actual verification
    }
  }, [searchParams, toast]);

  if (!currentPlan) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="glass-card p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              Upgrade to {currentPlan.name} membership - ${currentPlan.price}/month
            </p>
          </div>

          {/* Order Summary */}
          <div className="mb-8 p-6 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">{currentPlan.name} Membership</span>
                <span className="text-3xl font-bold text-primary">
                  ${currentPlan.price}<span className="text-sm text-muted-foreground font-normal">/month</span>
                </span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Automatic payment verification</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Instant membership activation</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Secure payment processing</span></div>
              </div>
            </div>
          </div>

          {/* Payment Gateway Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Choose Payment Gateway</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('paypal')}
                disabled={isProcessing}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === 'paypal'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
                    alt="PayPal" 
                    className="h-5"
                  />
                  {paymentMethod === 'paypal' && <Check className="w-4 h-4 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-muted-foreground">Pay with PayPal, credit/debit card</p>
                <div className="mt-2">
                  <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" className="h-5" />
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('pesapal')}
                disabled={isProcessing}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === 'pesapal'
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-border hover:border-green-500/40'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-green-600 text-lg">Pesapal</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">M-Pesa</span>
                  {paymentMethod === 'pesapal' && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
                <p className="text-sm text-muted-foreground">Pay with M-Pesa, Airtel Money, cards</p>
                <div className="mt-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">STK Push supported</span>
                </div>
              </button>
            </div>

            {/* PayPal sub-modes */}
            {paymentMethod === 'paypal' && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button variant={paypalMode === 'direct' ? 'default' : 'outline'} onClick={() => setPaypalMode('direct')} className="h-auto py-2" disabled={isProcessing}>
                  <div className="flex flex-col items-center">
                    <CreditCard className="w-4 h-4 mb-1" />
                    <span className="text-xs">Direct</span>
                  </div>
                </Button>
                <Button variant={paypalMode === 'link' ? 'default' : 'outline'} onClick={() => setPaypalMode('link')} className="h-auto py-2" disabled={isProcessing}>
                  <div className="flex flex-col items-center">
                    <ExternalLink className="w-4 h-4 mb-1" />
                    <span className="text-xs">Link</span>
                  </div>
                </Button>
                <Button variant={paypalMode === 'mobile' ? 'default' : 'outline'} onClick={() => setPaypalMode('mobile')} className="h-auto py-2" disabled={isProcessing}>
                  <div className="flex flex-col items-center">
                    <QrCode className="w-4 h-4 mb-1" />
                    <span className="text-xs">QR Code</span>
                  </div>
                </Button>
              </div>
            )}

            {/* Security badge */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm text-green-500 font-medium mb-1">Automatic Verification</p>
                  <p className="text-sm text-foreground">
                    After payment, your membership is activated <strong>automatically</strong>. No manual steps required!
                  </p>
                </div>
              </div>
            </div>

            {/* Amount display */}
            <div className="glass-card p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Payment Amount:</span>
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                {paymentMethod === 'pesapal' ? (
                  <span className="text-2xl font-bold text-foreground">KSH {currentPlan.priceKsh.toLocaleString()}</span>
                ) : (
                  <span className="text-2xl font-bold text-foreground">${currentPlan.price}.00</span>
                )}
                <span className="text-sm text-muted-foreground">{paymentMethod === 'pesapal' ? 'KES' : 'USD'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Monthly recurring payment - Cancel anytime</p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
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

          {/* Payment Actions */}
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <span className="text-muted-foreground mb-2">Processing your payment...</span>
              <span className="text-xs text-muted-foreground">
                {paymentMethod === 'pesapal'
                  ? 'Complete the M-Pesa payment. Check your phone for STK push.'
                  : 'Complete the payment in the PayPal window.'}
              </span>
              {pesapalPaymentId && (
                <p className="text-xs text-muted-foreground mt-4">
                  Waiting for payment confirmation... This may take a moment.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethod === 'pesapal' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      M-Pesa Phone Number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="phone"
                        type="tel"
                        placeholder="e.g. 0712345678 or 254712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Enter the phone number registered with M-Pesa</p>
                  </div>
                  <Button
                    onClick={handlePesapalPayment}
                    disabled={isProcessing || !phoneNumber.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg rounded-lg"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    Pay KSH {currentPlan.priceKsh.toLocaleString()} with M-Pesa
                  </Button>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      You'll receive an STK push on your phone to complete payment via M-Pesa, or be redirected to Pesapal for Airtel Money/card.
                    </p>
                  </div>
                </div>
              ) : paypalMode === 'direct' ? (
                <div className="space-y-4">
                  <Button
                    onClick={createAndProcessPaypalPayment}
                    disabled={isProcessing}
                    className="w-full bg-[#FFD140] hover:bg-[#FFC820] text-black font-bold py-6 text-lg rounded-lg"
                  >
                    Pay ${currentPlan.price} with PayPal
                  </Button>
                  <div className="flex items-center justify-center gap-2">
                    <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" className="h-6" />
                    <span className="text-xs text-muted-foreground flex items-center">
                      Powered by
                      <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" className="h-3 ml-1 inline" />
                    </span>
                  </div>
                </div>
              ) : paypalMode === 'link' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Payment Link
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <code className="flex-1 p-2 bg-background rounded text-sm break-all">{currentPlan.paymentLink}</code>
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(currentPlan.paymentLink, 'Payment Link')} className="shrink-0">
                        {copiedButton === 'Payment Link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button onClick={createAndProcessPaypalPayment} className="gap-2">
                        <ExternalLink className="w-4 h-4" /> Open Payment Link
                      </Button>
                      <Button variant="outline" onClick={() => setShowQRCode(!showQRCode)} className="gap-2">
                        <QrCode className="w-4 h-4" /> {showQRCode ? 'Hide' : 'Show'} QR
                      </Button>
                    </div>
                  </div>
                  {showQRCode && (
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <div className="bg-white p-4 rounded-lg mb-2">
                        <QRCode value={currentPlan.paymentLink} size={200} level="H" />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">Scan to open payment on mobile</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="bg-white p-4 rounded-lg mb-2">
                      <QRCode value={`${currentPlan.paymentLink}?native_xo=1`} size={200} level="H" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center mb-4">Scan with phone camera to pay via PayPal app</p>
                    <Button onClick={createAndProcessPaypalPayment} className="gap-2">
                      Pay on Mobile Device
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button onClick={() => navigate('/pricing')} variant="ghost" size="sm" disabled={isProcessing}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              <p>Secure & Automatic Payment Processing</p>
            </div>
            <p className="text-xs">
              Payments processed by PayPal & Pesapal. Membership activated automatically.
            </p>
            <div className="mt-4 flex justify-center items-center gap-4 flex-wrap">
              <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="Credit Cards" className="h-6" />
              <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="PayPal" className="h-5" />
              <span className="text-xs text-muted-foreground">•</span>
              <span className="font-bold text-green-600 text-sm">Pesapal</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs">M-Pesa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
