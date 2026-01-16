import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <section id="newsletter" className="relative py-16 lg:py-20 bg-background">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
      {/* Bottom gradient line */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10" />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-heading font-black text-xl md:text-2xl text-foreground">
            Our Newsletter
          </h2>
          <Button variant="hero" size="sm" className="group">
            VIEW ALL
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <Input
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-14 bg-card border-border/50 rounded-xl px-6 text-foreground placeholder:text-muted-foreground focus:border-primary"
            required
          />
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="group h-14 px-8"
          >
            SUBSCRIBE
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
