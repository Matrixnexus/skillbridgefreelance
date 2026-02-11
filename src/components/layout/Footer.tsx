import { Link } from "react-router-dom";
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram,
  Mail,
  MapPin
} from "lucide-react";

const Footer = () => {
  const footerLinks = {
    platform: [
      { name: "How It Works", href: "#how-it-works" },
      { name: "Browse Jobs", href: "/jobs" },
      { name: "Remote Jobs", href: "/remote-jobs" },
      { name: "Pricing", href: "/pricing" },
    ],
    freelancers: [
      { name: "Academic Writing", href: "/academic-writing" },
      { name: "AI Training", href: "/ai-training" },
      { name: "Watch & Earn", href: "/watch-and-earn" },
      { name: "Refer & Earn", href: "/refer-and-earn" },
    ],
    company: [
      // Removed all company links as requested
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      // Removed Cookie Policy and GDPR as requested
    ],
  };

  const socialLinks = [
    { icon: Twitter, label: "Twitter" },
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Facebook, label: "Facebook" },
    { icon: Instagram, label: "Instagram" },
  ];

  // Function to determine if link should be anchor or router link
  const renderLink = (link: { name: string, href: string }) => {
    if (link.href.startsWith('#')) {
      // Anchor link for on-page navigation
      return (
        <a
          href={link.href}
          className="text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          {link.name}
        </a>
      );
    } else {
      // Internal route - use Link component
      return (
        <Link
          to={link.href}
          className="text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          {link.name}
        </Link>
      );
    }
  };

  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Skill<span className="text-primary">Bridge</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The premium platform for professional freelancers. Access curated jobs, guaranteed payments, and build a sustainable career.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">freelance.skillbridge@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Platform Links Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  {renderLink(link)}
                </li>
              ))}
            </ul>
          </div>

          {/* Freelancers Links Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Freelancers</h4>
            <ul className="space-y-3">
              {footerLinks.freelancers.map((link) => (
                <li key={link.name}>
                  {renderLink(link)}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  {renderLink(link)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <div
                key={social.label}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground cursor-default"
                aria-label={social.label}
                title={social.label}
              >
                <social.icon className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
