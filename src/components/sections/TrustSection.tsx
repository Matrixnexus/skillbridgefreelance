import { Shield, Lock, CreditCard, Clock, Award, Users } from "lucide-react";

const TrustSection = () => {
  const trustPoints = [
    {
      icon: Shield,
      title: "Verified Jobs Only",
      description: "Every job is manually reviewed and verified before posting. No spam, no scams.",
    },
    {
      icon: Lock,
      title: "Secure Platform",
      description: "Bank-grade encryption protects your data and transactions at all times.",
    },
    {
      icon: CreditCard,
      title: "Guaranteed Payments",
      description: "Funds are held in escrow. Get paid for every approved submission.",
    },
    {
      icon: Clock,
      title: "Fast Payouts",
      description: "From weekly to instant payouts depending on your membership tier.",
    },
    {
      icon: Award,
      title: "Quality Standards",
      description: "Our review process ensures only quality work gets approved and paid.",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Real humans ready to help. Priority support for Pro and VIP members.",
    },
  ];

  return (
    <section id="clients" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Why SkillBridge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Built on{" "}
            <span className="gradient-text">Trust & Transparency</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We're not another gig platform. We're a professional work ecosystem designed for serious freelancers.
          </p>
        </div>

        {/* Trust Points Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="glass-card-hover p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <point.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {point.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
