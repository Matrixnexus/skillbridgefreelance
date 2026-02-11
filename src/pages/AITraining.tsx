import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import FAQSection from "@/components/seo/FAQSection";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Bot, Database, CheckCircle2, Cpu, Zap, TrendingUp, Shield } from "lucide-react";

const AITraining = () => {
  const faqs = [
    { question: "What are AI training jobs?", answer: "AI training jobs involve helping artificial intelligence systems learn and improve. Common tasks include data labeling (tagging images, text, or audio), prompt engineering (writing and evaluating AI prompts), model evaluation (rating AI outputs for quality), and dataset creation. These jobs are essential for companies building AI products." },
    { question: "Do I need technical skills for AI training work?", answer: "Most AI training tasks on SkillBridge don't require programming or engineering skills. You need attention to detail, good judgment, and the ability to follow instructions precisely. Some advanced tasks may require subject-matter expertise in specific fields." },
    { question: "How much do AI training jobs pay?", answer: "Pay varies by task complexity and your membership tier. Simple data labeling tasks may pay $3–$10, while complex prompt engineering and model evaluation tasks can pay $20–$100+. AI training is one of the fastest-growing and best-paying categories on our platform." },
    { question: "Why is AI training in high demand?", answer: "Every AI company — from startups to giants like Google and OpenAI — needs human feedback to train their models. This creates massive, ongoing demand for human evaluators, data labelers, and prompt engineers. It's one of the most future-proof freelance skills you can develop." },
    { question: "Can I do AI training jobs on my phone?", answer: "Some simpler tasks like image labeling and text classification can be done on a smartphone. However, for the best experience and access to higher-paying tasks, we recommend using a laptop or desktop computer." },
  ];

  const jobSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "AI Training Data Specialist",
    description: "Help train AI models through data labeling, prompt engineering, and model evaluation. Work remotely on your own schedule.",
    datePosted: "2026-02-01",
    employmentType: "FREELANCE",
    hiringOrganization: { "@type": "Organization", name: "SkillBridge", sameAs: "https://newrevolution.co.ke" },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: "Worldwide" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Training Jobs — Data Labeling & Prompt Engineering | SkillBridge"
        description="Find AI training jobs on SkillBridge. Data labeling, prompt engineering, model evaluation & more. No coding required. Guaranteed payments. Join the AI workforce."
        canonical="https://newrevolution.co.ke/ai-training"
      />
      <SchemaMarkup schema={jobSchema} />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Remote Jobs", href: "/remote-jobs" }, { label: "AI Training" }]} />

          <section className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Fastest Growing Category</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              AI Training Jobs — <span className="gradient-text">Shape the Future of AI</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8 text-balance">
              The AI revolution needs human intelligence. SkillBridge connects you with paid AI training tasks — data labeling, prompt engineering, model evaluation, and more. No coding required, just your judgment and attention to detail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  Start AI Training Work <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/jobs">View AI Jobs</Link>
              </Button>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">What Is AI Training?</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Artificial intelligence doesn't learn on its own — it needs humans. AI training is the process of providing data, feedback, and evaluations that help machine learning models become smarter, more accurate, and more useful.</p>
              <p>When you do AI training work on SkillBridge, you're directly contributing to the development of AI systems used by millions of people. Tasks can include labeling images so a self-driving car can recognize objects, writing prompts that help a chatbot respond better, or evaluating whether an AI's answer is accurate and helpful.</p>
              <p>This is one of the most exciting and future-proof freelance fields. As AI continues to grow, the demand for human trainers only increases. Companies like Google, OpenAI, and Meta all rely on human evaluators — and you can be part of that workforce through SkillBridge.</p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Types of AI Training Tasks</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Database, title: "Data Labeling", desc: "Tag and classify images, text, audio, or video to create training datasets for AI models." },
                { icon: Bot, title: "Prompt Engineering", desc: "Write, test, and refine prompts that help AI assistants generate better responses." },
                { icon: Cpu, title: "Model Evaluation", desc: "Rate AI outputs for accuracy, relevance, safety, and helpfulness to improve model quality." },
                { icon: Zap, title: "Dataset Creation", desc: "Create structured datasets from raw information to train specialized AI systems." },
              ].map((t, i) => (
                <div key={i} className="glass-card p-6 flex gap-4">
                  <t.icon className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Why AI Training Is the Future of Freelancing</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: TrendingUp, title: "Growing Demand", desc: "The AI industry is projected to reach $1.8 trillion by 2030. Human trainers are essential at every stage." },
                { icon: Shield, title: "Future-Proof Skill", desc: "Unlike jobs AI might automate, AI training requires human judgment — making it inherently resistant to automation." },
                { icon: Brain, title: "Accessible to Everyone", desc: "You don't need a computer science degree. If you can follow instructions and think critically, you can do this work." },
              ].map((b, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <b.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Skills That Help You Succeed</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Attention to detail — AI training requires precision in labeling and evaluation",
                "Critical thinking — assessing AI outputs requires good judgment",
                "Following instructions — each task has specific guidelines that must be adhered to",
                "Subject matter expertise — knowledge in specific fields unlocks premium tasks",
                "Patience and consistency — quality matters more than speed in AI training",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-16 glass-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Explore More Opportunities</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "All Remote Jobs", to: "/remote-jobs" },
                { label: "Academic Writing", to: "/academic-writing" },
                { label: "Watch & Earn", to: "/watch-and-earn" },
                { label: "Refer & Earn $5", to: "/refer-and-earn" },
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Join the AI Training Workforce</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">The AI industry needs you. Sign up for SkillBridge and start earning from AI training tasks today — no coding required.</p>
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

export default AITraining;
