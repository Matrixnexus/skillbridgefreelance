import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import FAQSection from "@/components/seo/FAQSection";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, DollarSign, Gift, CheckCircle2, Share2, UserPlus, Wallet } from "lucide-react";

const ReferAndEarn = () => {
  const faqs = [
    { question: "How does the SkillBridge referral program work?", answer: "When you sign up and activate a membership (Regular, Pro, or VIP), you receive a unique 6-digit referral code. Share this code with friends. When they create an account and enter your code during sign-up, a bonus is added to your pending earnings. Once they activate a paid membership, your bonus is confirmed and available for withdrawal." },
    { question: "Where do I find my referral code?", answer: "Your 6-digit referral code is displayed on your Dashboard under the Referrals section. You must have an active paid membership (Regular, Pro, or VIP) to view and share your code." },
    { question: "How much do I earn per referral?", answer: "Your bonus depends on the plan your referral subscribes to: $0.50 (KSH 50) for Regular, $1 (KSH 100) for Pro, and $2 (KSH 200) for VIP. There's no limit to how many people you can refer." },
    { question: "When can I withdraw my referral earnings?", answer: "Referral earnings are credited to your account once the referred person pays for a membership. You can then withdraw them alongside your other earnings via M-Pesa, PayPal, or bank transfer once you meet the minimum withdrawal amount." },
    { question: "Is there a limit to how many people I can refer?", answer: "No! You can refer unlimited people. The more active members you bring to SkillBridge, the more you earn." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Refer & Earn Up to $2 Per Referral | SkillBridge"
        description="Earn up to $2 for every friend who joins SkillBridge through your referral code. Unlimited referrals, real cash withdrawals. Share your 6-digit code and start earning today."
        canonical="https://newrevolution.co.ke/refer-and-earn"
      />
      <SchemaMarkup schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Refer & Earn - SkillBridge Referral Program",
        description: "Earn $5 for every friend referred to SkillBridge",
        url: "https://newrevolution.co.ke/refer-and-earn",
        publisher: { "@type": "Organization", name: "SkillBridge", url: "https://newrevolution.co.ke" }
      }} />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Refer & Earn" }]} />

          <section className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Up to $2 Per Successful Referral</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Refer Friends & <span className="gradient-text">Earn Up to $2 Each</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8 text-balance">
              Your network is worth money. SkillBridge's referral program rewards you up to $2 (KSH 200) for every person who joins through your unique 6-digit code. No cap on referrals, no complicated rules — just share, they join, and you earn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  Get Your Referral Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/pricing">View Membership Plans</Link>
              </Button>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">How the Referral Program Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Share2, step: "1", title: "Share Your Code", desc: "Find your unique 6-digit code on your dashboard. Share it via WhatsApp, social media, or in person." },
                { icon: UserPlus, step: "2", title: "They Sign Up", desc: "Your friend creates a SkillBridge account and enters your referral code during registration." },
                { icon: Wallet, step: "3", title: "You Get Paid", desc: "Your bonus appears as pending ($0.50–$2 based on their plan). Once they activate a paid membership, the bonus is confirmed and withdrawable." },
              ].map((s, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <s.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3">{s.step}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Why SkillBridge Referrals Are Worth It</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Most referral programs give you pennies or worthless points. SkillBridge is different. You earn real dollars — up to $2 per successful referral — that you can withdraw as actual cash via M-Pesa, PayPal, or bank transfer.</p>
              <p>There's also no cap. Refer 10 friends and earn real money. Our most active community members treat referrals as a significant income stream alongside their freelance work.</p>
              <p>And it's mutually beneficial. The people you refer gain access to a premium freelancing platform with curated jobs, guaranteed payments, and real earning potential. You're not spamming — you're sharing an opportunity.</p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Tips for Maximizing Referral Earnings</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Share your code on social media with a personal testimonial about your experience",
                "Post in WhatsApp groups, Telegram channels, and Facebook freelancer communities",
                "Create short videos or posts explaining how SkillBridge works",
                "Help your referrals get started — the faster they activate, the faster you earn",
                "Combine referral earnings with freelance work and Watch & Earn for maximum income",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-16 glass-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">More Ways to Earn on SkillBridge</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Remote Freelance Jobs", to: "/remote-jobs" },
                { label: "Watch & Earn", to: "/watch-and-earn" },
                { label: "Academic Writing", to: "/academic-writing" },
                { label: "AI Training Jobs", to: "/ai-training" },
                { label: "Browse All Jobs", to: "/jobs" },
              ].map((link) => (
                <Button key={link.to} variant="outline" size="sm" asChild>
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </section>

          <FAQSection faqs={faqs} />

          <section className="glass-card p-10 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Start Referring, Start Earning</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Create your SkillBridge account, activate a membership, and get your unique 6-digit referral code. Every friend you bring earns you up to $2 (KSH 200).</p>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth">
                Join SkillBridge Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReferAndEarn;
