import { UserPlus, Search, FileCheck, Wallet } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      step: "01",
      title: "Create Your Profile",
      description:
        "Sign up, verify your email, and choose a membership plan that fits your goals.",
    },
    {
      icon: Search,
      step: "02",
      title: "Browse Curated Jobs",
      description:
        "Access hand-picked, verified jobs from real clients. No spam, no scams, just quality work.",
    },
    {
      icon: FileCheck,
      step: "03",
      title: "Submit Your Work",
      description:
        "Complete tasks within deadlines and submit directly on the platform for review.",
    },
    {
      icon: Wallet,
      step: "04",
      title: "Get Paid Securely",
      description:
        "After admin approval, your earnings are credited instantly. Withdraw anytime.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Your Path to{" "}
            <span className="gradient-text">Professional Success</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to start earning with curated, high-quality projects
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              
              <div className="glass-card-hover p-8 h-full relative z-10">
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-5xl font-bold text-muted/20">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
