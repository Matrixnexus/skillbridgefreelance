import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import FAQSection from "@/components/seo/FAQSection";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, DollarSign, Clock, Shield, CheckCircle2, Smartphone, TrendingUp } from "lucide-react";

const WatchAndEarn = () => {
  const faqs = [
    { question: "How does Watch & Earn work on SkillBridge?", answer: "Watch & Earn allows you to earn money by watching short educational and promotional videos on our platform. Each completed video earns you a small reward that accumulates in your account balance. It's a simple, passive way to boost your earnings between freelance tasks." },
    { question: "How much can I earn from watching videos?", answer: "Earnings per video vary based on your membership tier and the video type. Premium tier members earn higher rates per view. While Watch & Earn alone won't replace a full income, it's a great supplement to your freelance earnings on the platform." },
    { question: "Is Watch & Earn available on mobile?", answer: "Yes! You can watch videos and earn money from any device — smartphone, tablet, or computer. Our platform is fully responsive and optimized for mobile viewing." },
    { question: "Do I need a paid membership to use Watch & Earn?", answer: "Watch & Earn is available to all active members with a Regular, Pro, or VIP membership. The amount you earn per video scales with your membership tier." },
    { question: "When can I withdraw my Watch & Earn money?", answer: "Your Watch & Earn income is combined with your other platform earnings. Once your total balance meets the minimum withdrawal threshold, you can request a withdrawal via M-Pesa, PayPal, or bank transfer." },
  ];

  const steps = [
    { icon: Play, title: "Watch Videos", desc: "Browse our curated video library and watch short clips on your schedule." },
    { icon: DollarSign, title: "Earn Rewards", desc: "Each completed video adds money directly to your SkillBridge balance." },
    { icon: TrendingUp, title: "Withdraw Earnings", desc: "Cash out your accumulated earnings via M-Pesa, PayPal, or bank transfer." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Watch Videos & Earn Money Online | SkillBridge"
        description="Earn money watching videos on SkillBridge. A simple, passive income stream alongside your freelance work. Available on all devices. Join 750K+ earners today."
        canonical="https://newrevolution.co.ke/watch-and-earn"
      />
      <SchemaMarkup schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Watch & Earn - Earn Money Watching Videos",
        description: "Earn money by watching videos on SkillBridge",
        url: "https://newrevolution.co.ke/watch-and-earn",
        publisher: { "@type": "Organization", name: "SkillBridge", url: "https://newrevolution.co.ke" }
      }} />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Watch & Earn" }]} />

          <section className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Passive Income Feature</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Watch Videos & <span className="gradient-text">Earn Money Online</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8 text-balance">
              Looking for an easy way to earn money online? SkillBridge's Watch & Earn feature lets you earn real money by watching short videos. It's the simplest passive income stream — no special skills required, just your time and attention.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  Start Earning Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/pricing">View Membership Plans</Link>
              </Button>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">What is Watch & Earn?</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Watch & Earn is a unique feature on SkillBridge that pays you for watching short video content. These videos range from educational tutorials and product demonstrations to promotional content from our partners.</p>
              <p>Unlike sketchy "get paid to watch" schemes you find elsewhere, SkillBridge is a legitimate platform trusted by over 750,000 freelancers. Your Watch & Earn income is tracked transparently in your dashboard, and you can withdraw it alongside your freelance earnings.</p>
              <p>Think of it as a bonus income stream. Between completing freelance tasks, you can relax, watch a few videos, and still be earning. It's especially popular with freelancers during slower periods or while waiting for new jobs to be posted.</p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">How Watch & Earn Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <s.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Why Watch & Earn on SkillBridge?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Smartphone, title: "Works on Any Device", desc: "Watch from your phone, tablet, or computer. Our platform is fully responsive." },
                { icon: Clock, title: "Your Schedule", desc: "No deadlines, no pressure. Watch whenever you have a free moment." },
                { icon: Shield, title: "Legitimate & Secure", desc: "No hidden fees, no data selling. A transparent earning system you can trust." },
                { icon: DollarSign, title: "Real Money, Real Withdrawals", desc: "Not points or gift cards — actual cash you can withdraw to M-Pesa or PayPal." },
              ].map((b, i) => (
                <div key={i} className="glass-card p-6 flex gap-4">
                  <b.icon className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Maximize Your Earnings</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Watch & Earn is most powerful when combined with other earning features on SkillBridge:</p>
              <ul className="space-y-3">
                {[
                  "Complete freelance tasks for your primary income",
                  "Watch videos during downtime for passive earnings",
                  "Refer friends using your 6-digit code to earn $5 per referral",
                  "Upgrade your membership tier for higher per-video rates",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-16 glass-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Explore More Ways to Earn</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Remote Freelance Jobs", to: "/remote-jobs" },
                { label: "Refer & Earn $5", to: "/refer-and-earn" },
                { label: "Academic Writing", to: "/academic-writing" },
                { label: "AI Training Jobs", to: "/ai-training" },
                { label: "View Pricing", to: "/pricing" },
              ].map((link) => (
                <Button key={link.to} variant="outline" size="sm" asChild>
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </section>

          <FAQSection faqs={faqs} />

          <section className="glass-card p-10 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Start Watching, Start Earning</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Join SkillBridge today and unlock Watch & Earn alongside thousands of freelance opportunities. Your first video is just a click away.</p>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth">
                Create Free Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WatchAndEarn;
