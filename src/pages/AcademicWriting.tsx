import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import FAQSection from "@/components/seo/FAQSection";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, PenTool, FileText, CheckCircle2, GraduationCap, Clock, DollarSign, Shield } from "lucide-react";

const AcademicWriting = () => {
  const faqs = [
    { question: "What types of academic writing jobs are available?", answer: "SkillBridge offers essays, research papers, dissertations, case studies, literature reviews, lab reports, annotated bibliographies, and more. Jobs range from high school to postgraduate level across multiple subjects including business, science, humanities, and technology." },
    { question: "What qualifications do I need for academic writing?", answer: "You need strong English writing skills, research capability, and familiarity with academic formatting (APA, MLA, Chicago, Harvard). While a university degree is beneficial, what matters most is the quality of your work. We review every submission for quality." },
    { question: "How much can I earn as an academic writer?", answer: "Earnings vary by job complexity, word count, and your membership tier. Simple essays may pay $5–$15, while complex dissertations and research papers can pay $50–$200+. Pro and VIP members get access to higher-paying assignments." },
    { question: "How are academic writing submissions reviewed?", answer: "Every submission is reviewed by our quality assurance team for originality, formatting, grammar, and adherence to instructions. Approved submissions receive guaranteed payment. If revisions are needed, you'll receive detailed feedback." },
    { question: "Can I specialize in certain subjects?", answer: "Yes! You can browse jobs by subject area and choose only the topics you're confident writing about. This lets you leverage your expertise for higher quality and faster completion times." },
  ];

  const jobSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Freelance Academic Writer",
    description: "Write academic papers, essays, and research documents for clients worldwide. Work remotely on your own schedule.",
    datePosted: "2026-02-01",
    employmentType: "FREELANCE",
    hiringOrganization: { "@type": "Organization", name: "SkillBridge", sameAs: "https://newrevolution.co.ke" },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: "Worldwide" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Academic Writing Jobs Online — Earn Writing Papers | SkillBridge"
        description="Find freelance academic writing jobs on SkillBridge. Write essays, research papers, dissertations & more. Guaranteed payments, flexible hours. Join 750K+ writers."
        canonical="https://newrevolution.co.ke/academic-writing"
      />
      <SchemaMarkup schema={jobSchema} />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <BreadcrumbNav items={[{ label: "Home", href: "/" }, { label: "Remote Jobs", href: "/remote-jobs" }, { label: "Academic Writing" }]} />

          <section className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">High-Demand Category</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Academic Writing Jobs — <span className="gradient-text">Earn Writing Papers Online</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8 text-balance">
              Turn your writing skills into a reliable income. SkillBridge connects skilled academic writers with a steady stream of essays, research papers, dissertations, and more. No bidding, no competing on price — just quality work with guaranteed pay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  Start Writing Today <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/jobs">View Writing Jobs</Link>
              </Button>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">Why Academic Writers Choose SkillBridge</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Academic writing is one of the most in-demand freelance skills globally. Millions of students and professionals need well-researched, well-written papers — and they're willing to pay for quality. SkillBridge gives you direct access to this demand.</p>
              <p>Unlike traditional freelance platforms where you bid against hundreds of writers and race to the bottom on pricing, SkillBridge uses a membership model. You join, browse curated jobs, pick what interests you, submit your work, and get paid. It's that simple.</p>
              <p>Our quality-controlled system means your work is valued. There's no room for low-quality mills — every submission is reviewed, and writers who consistently deliver great work get access to premium, higher-paying assignments.</p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Types of Academic Writing Jobs</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: FileText, title: "Essays & Papers", desc: "Argumentative, persuasive, expository, and narrative essays across all subjects." },
                { icon: BookOpen, title: "Research Papers", desc: "In-depth research documents with proper citations and methodology." },
                { icon: GraduationCap, title: "Dissertations & Theses", desc: "Advanced academic documents for graduate and postgraduate students." },
                { icon: PenTool, title: "Case Studies & Reports", desc: "Business case studies, lab reports, book reviews, and literature reviews." },
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
            <h2 className="text-3xl font-bold text-foreground mb-6">What You Need to Succeed</h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Strong command of English grammar, spelling, and academic tone",
                "Ability to conduct thorough research using credible sources",
                "Knowledge of academic formatting styles (APA, MLA, Chicago, Harvard)",
                "Attention to detail and ability to follow specific instructions",
                "Time management skills to meet deadlines consistently",
                "A computer or laptop with reliable internet access",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Earning Potential</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { tier: "Regular", range: "$5 – $20/task", desc: "Standard essays and short papers" },
                { tier: "Pro", range: "$15 – $80/task", desc: "Research papers and detailed assignments" },
                { tier: "VIP", range: "$30 – $200+/task", desc: "Dissertations, theses, and complex projects" },
              ].map((t, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t.tier} Tier</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{t.range}</p>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16 glass-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Explore Related Opportunities</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "All Remote Jobs", to: "/remote-jobs" },
                { label: "AI Training Jobs", to: "/ai-training" },
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Earn as an Academic Writer?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Join SkillBridge and access curated academic writing jobs with guaranteed payments. Your writing skills deserve a premium platform.</p>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth">
                Create Your Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AcademicWriting;
