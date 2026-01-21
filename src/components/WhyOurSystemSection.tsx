import { Users, BarChart3, ClipboardList, Settings, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const systemCards = [
  {
    icon: Users,
    title: "Proven Expertise",
    description: "Built By Home Service Business Owners Who've Actually Done It"
  },
  {
    icon: BarChart3,
    title: "Strategic Scaling",
    description: "Zero Guesswork: Exact Strategies That Took Us From 1 To 40+ Locations"
  },
  {
    icon: ClipboardList,
    title: "Business Transformation",
    description: "Transform Your Business From Survival Mode To Strategic Growth Machine"
  },
  {
    icon: Settings,
    title: "Tangible Success",
    description: "Real Results, Not Just Empty Promises - We've Walking The Path You Want To Travel"
  }
];

const WhyOurSystemSection = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-background">
      {/* Top connecting glow */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
      {/* Bottom connecting glow */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl leading-tight text-foreground">
            Why Our <span className="text-primary">System</span>?
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {systemCards.map((card, index) => (
            <div
              key={index}
              className="bg-card border border-border/50 rounded-xl p-8 text-center hover:border-primary/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 border border-border/80 rounded-lg flex items-center justify-center bg-card">
                  <card.icon className="w-7 h-7 text-muted-foreground" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="font-heading font-bold text-lg md:text-xl text-foreground mb-3">
                {card.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button variant="hero" size="lg" className="group">
            FREE SEO AUDIT & STRATEGY CALL
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyOurSystemSection;
