import { Building2, DollarSign, Users, MapPin } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "20+ Years",
    description: "Experience In Home Service Business Industry",
  },
  {
    icon: DollarSign,
    value: "$20 Million +",
    description: "Generated For Local Service Businesses",
  },
  {
    icon: Users,
    value: "300+ Active Clients",
    description: "On Our Local Map Booster Tool",
  },
  {
    icon: MapPin,
    value: "40+ Own GBP Locations",
    description: "Across Our 8 Figure Local Business",
  },
];

const StatsSection = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-card/50">
      {/* Top connecting glow */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
      
      {/* Bottom connecting glow */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg lg:text-xl text-primary mb-2">
                {stat.value}
              </h3>
              <p className="text-muted-foreground text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
