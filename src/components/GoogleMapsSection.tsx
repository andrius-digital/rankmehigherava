import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const locations = [
  {
    name: "Chicago Downtown Office",
    subtitle: "Main Headquarters",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d756162.3511999145!2d-89.10336606875!3d42.2409575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2d4ccadc9941%3A0xd064f8a30b6e0311!2sRank%20Me%20Higher%20%7C%20Local%20Map%20Booster!5e0!3m2!1sen!2sus!4v1766727316800!5m2!1sen!2sus"
  },
  {
    name: "Mundelein Office",
    subtitle: "Rank Me Higher HQ",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d756162.3511999145!2d-89.10336606875!3d42.2409575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880f97124a6673d1%3A0xc46cda5f1037977e!2sRank%20Me%20Higher!5e0!3m2!1sen!2sus!4v1766727302314!5m2!1sen!2sus"
  }
];

const GoogleMapsSection = () => {
  return (
    <section className="relative py-12 lg:py-16 bg-background">
      {/* Border top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-xs tracking-widest uppercase mb-2">
            OUR OFFICES
          </p>
          <h2 className="font-heading font-black text-xl md:text-2xl leading-tight text-foreground">
            Visit Us At Our <span className="text-primary">Two Locations</span>
          </h2>
        </div>

        {/* Maps Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {locations.map((location, index) => (
            <div 
              key={index}
              className="border border-primary/30 rounded-xl overflow-hidden bg-card/30"
            >
              <iframe
                src={location.embedUrl}
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={location.name}
              />
              <div className="p-4 text-center border-t border-border/30">
                <p className="font-heading font-bold text-foreground">{location.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{location.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="lg" className="group">
            OPEN IN GOOGLE MAPS
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-muted-foreground text-xs mt-2">
            Click to get directions, check reviews, and see our live Google Business Profile.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GoogleMapsSection;
