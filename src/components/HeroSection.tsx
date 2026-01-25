import { ArrowRight, Star, XCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import heroBackground from "@/assets/hero-background.webp";

const HeroSection = () => {

  return (
    <section id="hero" className="relative min-h-screen lg:min-h-screen pt-20 lg:pt-32 pb-8 lg:pb-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBackground} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* Star Rating */}
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-muted-foreground text-xs">
              From The Founders Of An 8-Figure Local Business
            </span>
          </div>

          {/* Pain Point */}
          <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
            <XCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs">
              Spending on ads but still no calls? For local businesses doing $300k+/year
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading font-black text-[1.75rem] sm:text-4xl leading-tight animate-fade-in">
            <span className="text-foreground">Hit </span>
            <span className="text-primary">Top 3</span>
            <span className="text-foreground"> On </span>
            <span className="text-primary">Google Maps</span>
            <span className="text-foreground"> Without Spending A Cent </span>
            <span className="text-primary">On Ads</span>
          </h1>

          {/* Video - Between headline and subheadline */}
          <div className="animate-fade-in -mx-2 my-2">
            <div className="relative w-full rounded-xl overflow-hidden border border-primary/30 shadow-xl shadow-primary/20">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: `<style>wistia-player[media-id='k4xdzi49er']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/k4xdzi49er/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style><wistia-player media-id="k4xdzi49er" aspect="1.7777777777777777"></wistia-player>` 
                }} 
              />
            </div>
          </div>

          {/* Subheadline */}
          <h2 className="font-heading font-bold text-lg text-foreground animate-fade-in">
            7 Day Free Trial - No Hidden Fees
          </h2>

          {/* Description - Shortened for mobile */}
          <p className="text-muted-foreground text-sm leading-relaxed animate-fade-in">
            <span className="font-semibold text-foreground">See Week 1 Results Before You Pay. </span>
            Local Map Booster optimizes your Google Business Profile — the only <span className="font-bold text-foreground">AI SEO</span> tool that delivers results this fast.
          </p>

          {/* CTA Button */}
          <Button variant="hero" size="lg" className="group w-full animate-fade-in">
            Book A Call
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Trust Badge */}
          <div className="flex items-start gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-xs">
              300+ Local Businesses Trust Us — we only partner with one business per area.
            </p>
          </div>
        </div>

        {/* Desktop Layout: Side by Side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 animate-fade-in-up">
            {/* Star Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">
                Agency & App From The Founders Of An 8-Figure Local Business
              </span>
            </div>

            {/* Pain Point */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm underline underline-offset-2">
                Spending on ads but still no calls? For local businesses doing $300k+/year
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl leading-tight">
              <span className="text-foreground">Hit </span>
              <span className="text-primary">Top 3</span>
              <span className="text-foreground"> On </span>
              <span className="text-primary">Google Maps</span>
              <br />
              <span className="text-foreground">Without Spending A Cent </span>
              <span className="text-primary">On Ads</span>
            </h1>

            {/* Subheadline */}
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              7 Day Free Trial - No Hidden Fees
            </h2>

            {/* Description */}
            <div className="space-y-2 text-muted-foreground max-w-xl">
              <p className="font-semibold text-foreground">
                See Week 1 Results Before You Pay.
              </p>
              <p className="leading-relaxed">
                Local Map Booster Optimizes Your Google Business Profile And Drives Real Human Activity — The Signals Google Uses To Rank You Higher On Maps. The Only <span className="font-bold text-foreground">AI SEO</span> Tool That Delivers Results This Fast.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button variant="hero" size="xl" className="group">
                Book A Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="flex items-start gap-2 pt-4">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-sm lg:text-base">
                300+ Local Businesses Trust Local Map Booster — and we only partner with one business per area, never your competitor.
              </p>
            </div>
          </div>

          {/* Right Column - Video */}
          <div className="animate-fade-in-right" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-full max-w-2xl mx-auto">
              {/* Ambient glow behind video */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 blur-3xl opacity-60 animate-pulse" />
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-transparent blur-2xl" />
              
              {/* Main Video Frame */}
              <div className="relative z-10 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20">
                {/* Gradient overlay on edges */}
                <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl border border-white/10" />
                <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-primary/10 pointer-events-none z-10 rounded-2xl" />
                
                {/* Wistia Video Embed - Exact embed code */}
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: `<style>wistia-player[media-id='k4xdzi49er']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/k4xdzi49er/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style><wistia-player media-id="k4xdzi49er" aspect="1.7777777777777777"></wistia-player>` 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
