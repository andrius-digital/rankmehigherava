import { ArrowRight, Star } from "lucide-react";
import WistiaVideo from "./WistiaVideo";

const TestimonialVideoSection = () => {
  return (
    <section className="relative py-12 lg:py-24 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm tracking-wider uppercase mb-2">
            REAL RESULTS FROM REAL BUSINESSES
          </p>
          <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl leading-tight text-foreground">
            Hear It From Our <span className="text-primary">Clients</span>
          </h2>
        </div>

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Client 1 - Brick Paver/Home Service */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 group">
            <div className="p-2">
              <WistiaVideo videoId="nvr47a3klm" aspectRatio="16:9" />
            </div>

            <div className="p-6 space-y-4">
              <div>
                {/* 5 Star Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">5.0 Google Reviews</span>
                </div>

                <h3 className="font-heading font-bold text-xl text-foreground">"Phones Ringing Off The Hook"</h3>
                <p className="text-sm text-muted-foreground mt-1">Multi-Crew Home Service Business</p>
              </div>

              <blockquote className="border-l-2 border-primary pl-3 py-1">
                <p className="italic text-sm text-muted-foreground leading-relaxed">
                  "Since we started, we've had to hire more crews just to keep up. The lead flow is consistent, high-quality, and completely automated."
                </p>
              </blockquote>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-primary/5 rounded p-2 text-center">
                  <span className="block text-lg font-bold text-primary">3x</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Lead Volume</span>
                </div>
                <div className="bg-primary/5 rounded p-2 text-center">
                  <span className="block text-lg font-bold text-primary">#1</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Google Rank</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client 2 - Premier Carpet Service */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 group">
            <div className="p-2">
              <WistiaVideo videoId="p7mhup45ir" aspectRatio="16:9" />
            </div>

            <div className="p-6 space-y-4">
              <div>
                {/* 5 Star Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">5.0 Google Reviews</span>
                </div>

                <h3 className="font-heading font-bold text-xl text-foreground">"Dominating Local Search"</h3>
                <p className="text-sm text-muted-foreground mt-1">Premier Carpet Service</p>
              </div>

              <blockquote className="border-l-2 border-primary pl-3 py-1">
                <p className="italic text-sm text-muted-foreground leading-relaxed">
                  "I've worked with other agencies, but nobody understands detailed local SEO like this team. We are dominating the map pack in our entire service area."
                </p>
              </blockquote>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-primary/5 rounded p-2 text-center">
                  <span className="block text-lg font-bold text-primary">Top 3</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Map Pack</span>
                </div>
                <div className="bg-primary/5 rounded p-2 text-center">
                  <span className="block text-lg font-bold text-primary">100%</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ROI Focus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm mb-4">Join 300+ Local Businesses Dominating Their Market</p>
          <a href="#audit-form" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
            GET YOUR FREE AUDIT
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialVideoSection;
