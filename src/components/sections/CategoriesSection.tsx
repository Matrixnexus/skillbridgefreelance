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
} from "lucide-react";

const CategoriesSection = () => {
  const categories = [
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
  ];

  return (
    <section id="categories" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Job Categories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">20+ Categories</span> of Quality Work
          </h2>
          <p className="text-lg text-muted-foreground">
            From data entry to AI training, find work that matches your skills and interests
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group glass-card-hover p-5 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.jobs} jobs available
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
