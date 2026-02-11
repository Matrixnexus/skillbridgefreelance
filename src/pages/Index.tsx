import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import TrustSection from "@/components/sections/TrustSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import SEOHead from "@/components/seo/SEOHead";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SkillBridge",
  url: "https://newrevolution.co.ke",
  logo: "https://newrevolution.co.ke/favicon.ico",
  description: "The premium platform for professional freelancers. Access curated jobs, guaranteed payments, and build a sustainable career.",
  contactPoint: { "@type": "ContactPoint", email: "freelance.skillbridge@gmail.com", contactType: "customer support" },
  sameAs: []
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="SkillBridge — Premium Freelance Jobs Platform | Earn Online"
        description="Access curated, high-quality freelance jobs. Academic writing, AI training, data analysis & more. Guaranteed payments, no bidding wars. Join 750K+ freelancers."
        canonical="https://newrevolution.co.ke/"
      />
      <SchemaMarkup schema={orgSchema} />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CategoriesSection />
        <PricingSection />
        <TestimonialsSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
