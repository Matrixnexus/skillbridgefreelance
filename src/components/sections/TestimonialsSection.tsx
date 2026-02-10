import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Wanjiku Mwangi",
      role: "Content Writer",
      membership: "Pro Member",
      image: "https://res.cloudinary.com/div5p29ly/image/upload/v1770723716/Afro_Kenyan_Girl_fjzzml.jpg?w=150&h=150&fit=crop&crop=face",
      content:
        "SkillBridge completely transformed my freelance career from Nairobi. The curated jobs mean I spend less time searching and more time earning. Made $2,200 in my first month! Bearing in mind it was a part-time job, before I declared it full-time",
      rating: 5,
      earnings: "$12,400",
    },
    {
      name: "Justin Kamau",
      role: "Data Analyst",
      membership: "VIP Member",
      image: "https://res.cloudinary.com/div5p29ly/image/upload/v1770723716/download_xtznhf.jpg?w=150&h=150&fit=crop&crop=face",
      content:
        "From Mombasa to the world! Unlike other platforms, there's no racing to the bottom on price. Clients here value quality, and the guaranteed payments give me peace of mind while working remotely.",
      rating: 5,
      earnings: "$28,750",
    },
    {
      name: "Amina Hassan",
      role: "Virtual Assistant",
      membership: "Pro Member",
      image: "https://res.cloudinary.com/div5p29ly/image/upload/v1770723716/___%EF%B8%8F_0707_007_022____._.__ukofrl.jpg?w=150&h=150&fit=crop&crop=face",
      content:
        "Working from Kisumu has never been more rewarding. The membership model actually works in our favor. Higher barrier to entry means better clients and consistent work. Best decision I've made for my career.",
      rating: 5,
      earnings: "$8,900",
    },
    {
      name: "Brian Kiprop",
      role: "Graphic Designer",
      membership: "VIP Member",
      image: "https://res.cloudinary.com/div5p29ly/image/upload/v1770723716/African_black_men_lnofxr.jpg?w=150&h=150&fit=crop&crop=face",
      content:
        "Priority review and unlimited tasks as a VIP member means I can scale my income without limits from Nakuru. The platform really invests in serious freelancers across Africa.",
      rating: 5,
      earnings: "$45,200",
    },
    {
      name: "Grace Akinyi",
      role: "Digital Marketer",
      membership: "Pro Member",
      image: "https://res.cloudinary.com/div5p29ly/image/upload/v1770723779/Vibes_2_0__________________________________nikon_newyork_nairobikenya_nairobi_nigeria_nikonphotography_kenyafashion_kampala_kenya_goodvibes_gainwithcarlz_gainwiththeepluto_gainwithxtiandela_ghana_cano_gzqhwp.jpg?w=150&h=150&fit=crop&crop=face",
      content:
        "As a freelancer in Eldoret, SkillBridge connected me with international clients who value my work. The platform's escrow system ensures I always get paid on time.",
      rating: 5,
      earnings: "$15,600",
    },
    {
      name: "James Mutiso",
      role: "Web Developer",
      membership: "VIP Member",
      image: "https://res.cloudinary.com/div5p29ly/image/upload/v1770723716/download_1_y7vfrt.jpg?w=150&h=150&fit=crop&crop=face",
      content:
        "From Thika to global markets! The quality of jobs here is exceptional. I've built long-term relationships with clients who appreciate Kenyan talent and professionalism.",
      rating: 5,
      earnings: "$32,800",
    },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Kenyan Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Trusted by{" "}
            <span className="gradient-text">Professionals Across Kenya</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how freelancers from Nairobi to Mombasa are building sustainable careers on SkillBridge
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card-hover p-8"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/30 mb-6" />
              
              {/* Content */}
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.membership}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{testimonial.earnings}</div>
                  <div className="text-xs text-muted-foreground">Total Earned</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kenyan flag accent */}
        <div className="mt-16 flex justify-center items-center gap-4">
          <div className="w-8 h-1 bg-black"></div>
          <div className="w-8 h-1 bg-red-600"></div>
          <div className="w-8 h-1 bg-green-600"></div>
          <div className="text-sm text-muted-foreground ml-4">
            Proudly serving Kenyan talent 🇰🇪
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
