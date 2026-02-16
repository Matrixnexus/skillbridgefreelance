import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = [
    {
      name: "Regular",
      price: 6,
      priceKsh: 750,
      period: "year",
      description: "Perfect for getting started",
      icon: Zap,
      features: [
        "Access to Regular tier jobs",
        "Up to 4 tasks per day",
        "Standard review time",
        "Email support",
        "Basic earnings dashboard",
      ],
      cta: "Start Regular",
      variant: "outline" as const,
      popular: false,
      tier: "regular",
    },
    {
      name: "Pro",
      price: 7,
      priceKsh: 850,
      period: "year",
      description: "Most popular for professionals",
      icon: Star,
      features: [
        "Access to Regular + Pro jobs",
        "Up to 6 tasks per day",
        "Priority review (24h)",
        "Priority email support",
        "Advanced analytics",
        "Skill badges & reputation",
      ],
      cta: "Go Pro",
      variant: "hero" as const,
      popular: true,
      tier: "pro",
    },
    {
      name: "VIP",
      price: 8,
      priceKsh: 999,
      period: "year",
      description: "For serious professionals",
      icon: Crown,
      features: [
        "Access to ALL job tiers",
        "10 tasks per day (Highest paying picks)",
        "Express review (12h)",
        "24/7 priority support",
        "Premium analytics & insights",
        "Featured profile badge",
        "Early access to new jobs",
      ],
      cta: "Become VIP",
      variant: "premium" as const,
      popular: false,
      tier: "vip",
    },
  ];

  const handleSelectPlan = (tier: string) => {
    console.log(`Selecting ${tier} plan. User logged in: ${!!user}`);
    
    if (!user) {
      // If user is not logged in, redirect to auth page
      navigate('/auth');
    } else {
      // If user is logged in, redirect to checkout with selected plan
      navigate(`/checkout?plan=${tier}`);
    }
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Pricing Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Choose Your{" "}
            <span className="gradient-text">Membership Level</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Invest in your freelance career. Higher tiers unlock more jobs, faster payouts, and premium features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative glass-card p-8 flex flex-col ${
                plan.popular
                  ? "border-primary/50 ring-2 ring-primary/20"
                  : ""
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

              {/* Plan Header */}
              <div className="mb-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                  plan.popular ? "from-primary/20 to-primary/10" : "from-secondary to-muted"
                } flex items-center justify-center mb-4`}>
                  <plan.icon className={`w-7 h-7 ${plan.popular ? "text-primary" : "text-foreground"}`} />
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
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {/* Debug info - remove in production */}
              <div className="text-xs text-muted-foreground mt-4">
                Click to select {plan.tier} plan
              </div>
            </div>
          ))}
        </div>

        {/* Trust Note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            All plans include instant guaranteed verification. No questions asked or delayed services.
          </p>
        </div>
        
        {/* Additional CTA for non-logged in users */}
        {!user && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              <span className="text-primary font-medium">Note:</span> You'll need to create an account or log in to purchase a membership.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;