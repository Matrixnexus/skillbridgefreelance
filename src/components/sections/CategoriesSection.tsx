import {
  FileText,
  Search,
  PenTool,
  Languages,
  Palette,
  Video,
  Share2,
  TrendingUp,
  Mail,
  Users,
  ClipboardList,
  Target,
  BarChart3,
  Brain,
  ImageIcon,
  Bug,
  Smartphone,
  Headphones,
  Code,
  Database,
  Briefcase,
  Camera,
  Mic,
  Music,
  BookOpen,
  Globe,
  Calculator,
  Home,
  Car,
  Heart,
  GraduationCap,
  Layout,
  Cloud,
  Shield,
  Wrench,
  DollarSign,
  Lightbulb,
  PieChart,
  MessageSquare,
  Zap,
  Cpu,
  ShoppingCart,
  Building,
  Film,
  Gamepad,
  Truck,
  Coffee,
  Globe2,
  Bookmark,
  Key,
  FileCode,
  Server,
  SmartphoneCharging,
  CreditCard,
  Atom,
  FlaskConical,
  Scale,
  PaintBucket,
  Calendar,
  Gift,
  PhoneCall,
  Award,
  Package,
  DownloadCloud,
  UploadCloud,
} from "lucide-react";

const CategoriesSection = () => {
  const categories = [
    // Original categories
    { icon: FileText, name: "Data Entry", jobs: 245, color: "from-blue-500/20 to-blue-600/20" },
    { icon: Search, name: "Web Research", jobs: 189, color: "from-purple-500/20 to-purple-600/20" },
    { icon: PenTool, name: "Content Writing", jobs: 312, color: "from-pink-500/20 to-pink-600/20" },
    { icon: Languages, name: "Translation", jobs: 156, color: "from-green-500/20 to-green-600/20" },
    { icon: Palette, name: "Graphic Design", jobs: 278, color: "from-orange-500/20 to-orange-600/20" },
    { icon: Video, name: "Video Editing", jobs: 134, color: "from-red-500/20 to-red-600/20" },
    { icon: Share2, name: "Social Media", jobs: 223, color: "from-cyan-500/20 to-cyan-600/20" },
    { icon: TrendingUp, name: "SEO Tasks", jobs: 167, color: "from-lime-500/20 to-lime-600/20" },
    { icon: Mail, name: "Email Marketing", jobs: 98, color: "from-amber-500/20 to-amber-600/20" },
    { icon: Users, name: "Virtual Assistance", jobs: 345, color: "from-teal-500/20 to-teal-600/20" },
    { icon: ClipboardList, name: "Product Listing", jobs: 187, color: "from-indigo-500/20 to-indigo-600/20" },
    { icon: Target, name: "Lead Generation", jobs: 145, color: "from-rose-500/20 to-rose-600/20" },
    { icon: BarChart3, name: "Surveys", jobs: 234, color: "from-violet-500/20 to-violet-600/20" },
    { icon: Brain, name: "AI Data Labeling", jobs: 412, color: "from-emerald-500/20 to-emerald-600/20" },
    { icon: ImageIcon, name: "Image Annotation", jobs: 289, color: "from-sky-500/20 to-sky-600/20" },
    { icon: Bug, name: "Software Testing", jobs: 167, color: "from-fuchsia-500/20 to-fuchsia-600/20" },
    { icon: Smartphone, name: "UX Feedback", jobs: 123, color: "from-yellow-500/20 to-yellow-600/20" },
    { icon: Headphones, name: "Customer Support", jobs: 198, color: "from-slate-500/20 to-slate-600/20" },
    { icon: Code, name: "Copywriting", jobs: 267, color: "from-blue-500/20 to-cyan-600/20" },
    { icon: Database, name: "Transcription", jobs: 178, color: "from-purple-500/20 to-pink-600/20" },
    
    // New Technical & Development Categories
    { icon: Code, name: "Web Development", jobs: 432, color: "from-blue-600/20 to-indigo-600/20" },
    { icon: Smartphone, name: "App Development", jobs: 289, color: "from-purple-600/20 to-pink-600/20" },
    { icon: FileCode, name: "Frontend Development", jobs: 321, color: "from-cyan-500/20 to-blue-600/20" },
    { icon: Server, name: "Backend Development", jobs: 298, color: "from-green-600/20 to-emerald-600/20" },
    { icon: Database, name: "Database Management", jobs: 187, color: "from-orange-500/20 to-red-600/20" },
    { icon: Cloud, name: "Cloud Computing", jobs: 156, color: "from-sky-500/20 to-blue-600/20" },
    { icon: Shield, name: "Cybersecurity", jobs: 134, color: "from-red-500/20 to-rose-600/20" },
    { icon: Cpu, name: "DevOps", jobs: 112, color: "from-teal-500/20 to-cyan-600/20" },
    
    // New Creative & Design Categories
    { icon: Camera, name: "Photography", jobs: 178, color: "from-purple-500/20 to-violet-600/20" },
    { icon: Mic, name: "Voice Over", jobs: 145, color: "from-pink-500/20 to-rose-600/20" },
    { icon: Music, name: "Music Production", jobs: 98, color: "from-yellow-500/20 to-amber-600/20" },
    { icon: Layout, name: "UI/UX Design", jobs: 267, color: "from-indigo-500/20 to-purple-600/20" },
    { icon: PaintBucket, name: "Illustration", jobs: 189, color: "from-orange-500/20 to-yellow-600/20" },
    { icon: BookOpen, name: "Proofreading", jobs: 167, color: "from-emerald-500/20 to-green-600/20" },
    { icon: Film, name: "Animation", jobs: 123, color: "from-red-500/20 to-orange-600/20" },
    
    // New Business & Marketing Categories
    { icon: DollarSign, name: "Financial Analysis", jobs: 156, color: "from-green-500/20 to-emerald-600/20" },
    { icon: PieChart, name: "Data Analysis", jobs: 234, color: "from-blue-500/20 to-cyan-600/20" },
    { icon: MessageSquare, name: "Business Consulting", jobs: 145, color: "from-purple-500/20 to-pink-600/20" },
    { icon: Building, name: "Project Management", jobs: 198, color: "from-orange-500/20 to-amber-600/20" },
    { icon: ShoppingCart, name: "E-commerce Management", jobs: 167, color: "from-teal-500/20 to-green-600/20" },
    { icon: Lightbulb, name: "Business Planning", jobs: 123, color: "from-yellow-500/20 to-amber-600/20" },
    { icon: Zap, name: "Digital Marketing", jobs: 345, color: "from-red-500/20 to-pink-600/20" },
    
    // New Writing & Translation Categories
    { icon: BookOpen, name: "Technical Writing", jobs: 189, color: "from-indigo-500/20 to-purple-600/20" },
    { icon: Globe, name: "Transcreation", jobs: 134, color: "from-blue-500/20 to-sky-600/20" },
    { icon: PenTool, name: "Script Writing", jobs: 145, color: "from-emerald-500/20 to-teal-600/20" },
    { icon: Bookmark, name: "Ghostwriting", jobs: 112, color: "from-gray-500/20 to-slate-600/20" },
    { icon: FileText, name: "Resume Writing", jobs: 178, color: "from-amber-500/20 to-yellow-600/20" },
    
    // New Administrative Categories
    { icon: Calculator, name: "Accounting", jobs: 156, color: "from-green-500/20 to-emerald-600/20" },
    { icon: Calendar, name: "Calendar Management", jobs: 123, color: "from-red-500/20 to-rose-600/20" },
    { icon: PhoneCall, name: "Telemarketing", jobs: 134, color: "from-blue-500/20 to-cyan-600/20" },
    { icon: Gift, name: "Event Planning", jobs: 145, color: "from-purple-500/20 to-pink-600/20" },
    
    // New Specialized Categories
    { icon: GraduationCap, name: "Tutoring", jobs: 189, color: "from-orange-500/20 to-amber-600/20" },
    { icon: Heart, name: "Health & Wellness", jobs: 167, color: "from-pink-500/20 to-rose-600/20" },
    { icon: Home, name: "Interior Design", jobs: 123, color: "from-yellow-500/20 to-orange-600/20" },
    { icon: Car, name: "AutoCAD Design", jobs: 112, color: "from-teal-500/20 to-green-600/20" },
    { icon: Gamepad, name: "Game Development", jobs: 145, color: "from-indigo-500/20 to-purple-600/20" },
    { icon: Truck, name: "Supply Chain", jobs: 134, color: "from-gray-500/20 to-slate-600/20" },
    { icon: Coffee, name: "Food Services", jobs: 89, color: "from-amber-500/20 to-yellow-600/20" },
    { icon: Globe2, name: "Travel Planning", jobs: 78, color: "from-emerald-500/20 to-teal-600/20" },
    
    // New Legal & Professional Services
    { icon: Scale, name: "Legal Services", jobs: 145, color: "from-blue-500/20 to-indigo-600/20" },
    { icon: Key, name: "Real Estate", jobs: 167, color: "from-green-500/20 to-emerald-600/20" },
    { icon: Award, name: "Quality Assurance", jobs: 134, color: "from-orange-500/20 to-red-600/20" },
    
    // New Mobile & Tech Support
    { icon: SmartphoneCharging, name: "Mobile Repair", jobs: 123, color: "from-purple-500/20 to-pink-600/20" },
    { icon: Wrench, name: "IT Support", jobs: 189, color: "from-teal-500/20 to-cyan-600/20" },
    
    // New Finance & Trading
    { icon: CreditCard, name: "Bookkeeping", jobs: 156, color: "from-green-500/20 to-lime-600/20" },
    { icon: TrendingUp, name: "Stock Trading", jobs: 134, color: "from-red-500/20 to-orange-600/20" },
    
    // New Science & Research
    { icon: Atom, name: "Scientific Research", jobs: 112, color: "from-indigo-500/20 to-blue-600/20" },
    { icon: FlaskConical, name: "Lab Assistance", jobs: 89, color: "from-purple-500/20 to-violet-600/20" },
    
    // New Logistics & Operations
    { icon: Package, name: "Inventory Management", jobs: 145, color: "from-amber-500/20 to-orange-600/20" },
    { icon: UploadCloud, name: "Data Migration", jobs: 112, color: "from-cyan-500/20 to-blue-600/20" },
    { icon: DownloadCloud, name: "Backup Solutions", jobs: 98, color: "from-teal-500/20 to-green-600/20" },
  ];

  return (
    <section id="categories" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Job Categories</span>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              60+ Categories
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Comprehensive Range</span> of Freelance Work
          </h2>
          <p className="text-lg text-muted-foreground">
            From creative design to technical development, find work across 60+ categories matching your expertise
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group glass-card-hover p-5 cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="w-6 h-6 text-foreground group-hover:scale-125 transition-transform" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.jobs.toLocaleString()} jobs
              </p>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;