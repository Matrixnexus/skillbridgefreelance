import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, Crown, ArrowRight, ArrowLeft, Shield, CreditCard } from 'lucide-react';

const Pricing = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Regular',
      price: 6,
      priceKsh: 750,
      period: 'year',
      description: 'Perfect for getting started',
      icon: Zap,
      features: [
        'Access to Regular tier jobs',
        'Up to 4 tasks per day',
        'Standard review time',
        'Email support',
        'Basic earnings dashboard',
        'Yearly billing',
      ],
      tier: 'regular',
      cta: 'Start Regular',
      variant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Pro',
      price: 7,
      priceKsh: 850,
      period: 'year',
      description: 'Most popular for professionals',
      icon: Star,
      features: [
        'Access to Regular + Pro jobs',
        'Up to 6 tasks per day',
        'Priority review (24h)',
        'Priority email support',
        'Advanced analytics',
        'Yearly billing',
        'Skill badges & reputation',
      ],
      tier: 'pro',
      cta: 'Go Pro',
      variant: 'hero' as const,
      popular: true,
    },
    {
      name: 'VIP',
      price: 8,
      priceKsh: 999,
      period: 'year',
      description: 'For serious professionals',
      icon: Crown,
      features: [
        'Access to ALL job tiers',
        'Unlimited tasks per day',
        'Express review (12h)',
        '24/7 priority support',
        'Premium analytics & insights',
        'Yearly billing',
        'Featured profile badge',
        'Early access to new jobs',
      ],
      tier: 'vip',
      cta: 'Become VIP',
      variant: 'premium' as const,
      popular: false,
    },
  ];

  const handleSelectPlan = (tier: string) => {
    console.log(`Selecting ${tier} plan. User logged in: ${!!user}`);
    
    if (!user) {
      // Redirect to auth page with a return URL
      navigate(`/auth?redirect=${encodeURIComponent(`/checkout?plan=${tier}`)}`);
    } else {
      // User is logged in, go directly to checkout
      navigate(`/checkout?plan=${tier}`);
    }
  };

  const isCurrentPlan = (tier: string) => {
    return profile?.membership_tier === tier;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          {user && (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          )}

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm text-primary font-medium">Membership Plans</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Choose Your{' '}
              <span className="gradient-text">Membership Level</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Invest in your freelance career. Higher tiers unlock more jobs, faster payouts, and premium features.
            </p>
          </div>

          {/* Payment Method Notice */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="glass-card p-6 border border-blue-500/20">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Secure Payments</h3>
                  <p className="text-muted-foreground">
                    Pay via PayPal (USD) or Pesapal/M-Pesa (KSH) for East African users. All payments are yearly and processed securely.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 text-sm bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative glass-card p-8 flex flex-col ${
                  plan.popular
                    ? 'border-primary/50 ring-2 ring-primary/20'
                    : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan(plan.tier) && (
                  <div className="absolute -top-4 right-4">
                    <div className="px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-medium">
                      Current Plan
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                    plan.popular ? 'from-primary/20 to-primary/10' : 'from-secondary to-muted'
                  } flex items-center justify-center mb-4`}>
                    <plan.icon className={`w-7 h-7 ${plan.popular ? 'text-primary' : 'text-foreground'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    KSH {plan.priceKsh} <span className="text-xs">(for East African users)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                    <span className="text-sm text-blue-400 font-medium">
                      PayPal Secure Payment
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.variant}
                  size="lg"
                  className="w-full group"
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={isCurrentPlan(plan.tier)}
                >
                  {isCurrentPlan(plan.tier) ? 'Current Plan' : plan.cta}
                  {!isCurrentPlan(plan.tier) && (
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Trust Note */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              All plans include guaranteed payments and dedicated customer care.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-muted-foreground">
                  We accept PayPal (USD) and Pesapal/M-Pesa (KSH) for East African users. You can pay with your PayPal balance, credit/debit card, M-Pesa, or Airtel Money.
                </p>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  How does the payment process work?
                </h3>
                <p className="text-muted-foreground">
                  When you select a plan, you'll choose PayPal or Pesapal as your payment gateway. After payment confirmation, your yearly membership will be activated automatically.
                </p>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade at any time and the difference will be prorated. Downgrades take effect at the end of your billing cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;