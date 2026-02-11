import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import FAQSection from "@/components/seo/FAQSection";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Globe, Clock, DollarSign, Shield, CheckCircle2, Laptop, Users } from "lucide-react";

const RemoteJobs = () => {
  const faqs = [
    { question: "What types of remote jobs are available on SkillBridge?", answer: "SkillBridge offers a wide range of remote freelance jobs including academic writing, data analysis, web development, AI training, virtual assistance, content creation, and more. All jobs are curated and verified for quality." },
    { question: "Do I need experience to apply for remote jobs?", answer: "We have jobs for all skill levels — from entry-level tasks to advanced professional work. Each job listing clearly states the difficulty level and required skills so you can find opportunities that match your expertise." },
    { question: "How do I get paid for remote freelance work?", answer: "Payments are guaranteed once your submission is approved. Earnings appear in your dashboard and can be withdrawn via M-Pesa, PayPal, or bank transfer once you meet the minimum withdrawal threshold." },
    { question: "Is SkillBridge free to join?", answer: "You can browse available jobs for free. To access and submit work, you need an active membership (Regular, Pro, or VIP). Each tier offers different daily task limits and job access levels." },
    { question: "Can I work from anywhere in the world?", answer: "Yes! All jobs on SkillBridge are fully remote. You can work from anywhere with an internet connection, on your own schedule, using your own devices." },
  ];

  const benefits = [
    { icon: Globe, title: "Work From Anywhere", desc: "Complete tasks from home, a café, or while traveling. No commute, no office politics." },
    { icon: Clock, title: "Flexible Schedule", desc: "Choose when you work. Morning person or night owl — it's entirely up to you." },
    { icon: DollarSign, title: "Guaranteed Payments", desc: "Every approved submission is paid. No chasing invoices or waiting months for payment." },
    { icon: Shield, title: "Verified Opportunities", desc: "Every job is vetted by our team. No scams, no fake listings, no wasted time." },
    { icon: Laptop, title: "Low Barrier to Entry", desc: "Many tasks require just a computer and internet. Start earning within hours of signing up." },
    { icon: Users, title: "Supportive Community", desc: "Join thousands of freelancers who share tips, resources, and encouragement." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Remote Freelance Jobs — Work From Home | SkillBridge"
        description="Find verified remote freelance jobs you can do from anywhere. Academic writing, data analysis, web development, AI training & more. Guaranteed payments. Join 750K+ freelancers."
        canonical="https://newrevolution.co.ke/remote-jobs"
      />
      <SchemaMarkup schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Remote Freelance Jobs",
        description: "Find verified remote freelance jobs on SkillBridge",
        url: "https://newrevolution.co.ke/remote-jobs",
        publisher: { "@type": "Organization", name: "SkillBridge", url: "https://newrevolution.co.ke" }
      }} />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Remote Jobs" }]} />

          {/* Hero */}
          <section className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">750K+ Active Freelancers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Remote Freelance Jobs — <span className="gradient-text">Work From Anywhere</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8 text-balance">
              SkillBridge connects you with verified, high-quality remote freelance jobs across dozens of categories. No bidding wars, no race to the bottom — just quality work with guaranteed payments. Whether you're a writer, developer, data analyst, or AI trainer, there's work waiting for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  Start Working Today <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/jobs">Browse Available Jobs</Link>
              </Button>
            </div>
          </section>

          {/* What are remote freelance jobs */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">What Are Remote Freelance Jobs?</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>Remote freelance jobs are tasks or projects you complete independently, from any location with an internet connection. Unlike traditional employment, freelancing gives you the freedom to choose your hours, your workspace, and the projects you take on.</p>
              <p>On SkillBridge, remote freelance jobs are curated and quality-controlled. That means every listing has been verified by our team, every payment is guaranteed upon approval, and every freelancer is treated as a valued professional — not a commodity.</p>
              <p>Our platform is designed for people across Africa and beyond who want to earn a reliable income online. Whether you're supplementing your salary, building a full-time freelance career, or earning while studying, SkillBridge makes it simple and secure.</p>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Why Choose SkillBridge for Remote Work?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="glass-card p-6">
                  <b.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Job Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Popular Remote Job Categories</h2>
            <div className="text-muted-foreground space-y-4">
              <p>SkillBridge hosts jobs across a growing range of categories. Some of our most popular remote freelance job types include:</p>
              <ul className="space-y-3">
                {[
                  "Academic Writing — essays, research papers, dissertations",
                  "Data Analysis — spreadsheets, data entry, statistical work",
                  "Web Development — frontend, backend, full-stack projects",
                  "AI Training — data labeling, prompt engineering, model evaluation",
                  "Content Creation — blog posts, copywriting, social media",
                  "Virtual Assistance — admin tasks, customer support, scheduling",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Create Your Account", desc: "Sign up for free and choose a membership tier that fits your goals." },
                { step: "2", title: "Browse & Accept Jobs", desc: "Explore curated listings, read instructions, and pick tasks you can complete." },
                { step: "3", title: "Submit & Get Paid", desc: "Upload your work, get it reviewed, and receive guaranteed payment on approval." },
              ].map((s, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4">{s.step}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Links */}
          <section className="mb-16 glass-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Explore More on SkillBridge</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Academic Writing Jobs", to: "/academic-writing" },
                { label: "AI Training Jobs", to: "/ai-training" },
                { label: "Watch & Earn", to: "/watch-and-earn" },
                { label: "Refer & Earn", to: "/refer-and-earn" },
                { label: "View Pricing", to: "/pricing" },
              ].map((link) => (
                <Button key={link.to} variant="outline" size="sm" asChild>
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </section>

          <FAQSection faqs={faqs} />

          {/* CTA */}
          <section className="glass-card p-10 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Your Remote Freelance Career?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Join 750,000+ professionals earning from home on SkillBridge. No experience gatekeeping, no endless applications — just real work, real pay.</p>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth">
                Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RemoteJobs;
