import { ArrowRight, Check } from "lucide-react";
import { Button } from "./ui/button";

const WhyTop3Section = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-background">
      {/* Top connecting glow */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
      {/* Bottom connecting glow */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm tracking-wider uppercase flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary" />
            HI, WE'RE RANK ME HIGHER — EXPERTS IN LOCAL SEO.
          </p>
          <h2 className="font-heading font-black text-3xl md:text-4xl lg:text-5xl leading-tight text-foreground mb-6">
            We Help Local Businesses Lock In The Top 3 Spots On Google Maps.
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            After Building An 8-Figure Local Business From The Ground Up, We Know Exactly How Hard It Is To Compete On{" "}
            <span className="font-semibold text-foreground">Google Maps</span>. That's Why We Created{" "}
            <span className="font-semibold text-foreground">Local Map Booster</span> — An AI-Powered Local SEO System That Pushes Your{" "}
            <span className="font-semibold text-foreground">Google Business Profile</span> Into The{" "}
            <span className="font-semibold text-foreground">Top 3 "Map Pack" Results</span> And Turns Nearby Searches Into Real Calls, Quotes And Booked Jobs.
          </p>
        </div>

        {/* Content Layout - Visual & Compelling */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Punchy Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-heading font-black text-3xl md:text-4xl text-foreground leading-tight">
                Why The <span className="text-primary italic">Top 3</span> Matters
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                When Someone Searches <span className="text-foreground font-bold">"Near Me"</span> on Google, <span className="text-primary font-bold">92%</span> of the Clicks go to the Map Pack.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                If you aren't in the Top 3, you're effectively invisible. We fix that by sending real local signals that force Google to recognize you as the #1 choice in your area.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Dominate Competition</h4>
                  <p className="text-xs text-muted-foreground">Outrank established competitors in under 30 days.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Verified Local Authority</h4>
                  <p className="text-xs text-muted-foreground">Build instant trust with a glowing Google Business Profile.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="hero" size="lg" className="group h-14 px-10">
                GET THE MAP SCAN
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Column - High Impact Visual */}
          <div className="relative">
            {/* Ambient background glow */}
            <div className="absolute -inset-10 bg-primary/15 blur-3xl rounded-full animate-pulse" />

            <div className="relative rounded-2xl overflow-hidden border border-primary/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-card/40 backdrop-blur-sm group">
              <img
                src="/assets/seo-results-collage.png"
                alt="Map Pack Dominance Proof"
                className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />

              {/* Floating Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-lg border border-primary/30 p-4 rounded-xl shadow-2xl transform transition-transform group-hover:translate-y-[-5px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Market Analysis</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full" />)}
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground">"Rank Me Higher took us from invisible to #1 across 5 different towns in 3 weeks."</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">— LOCAL ROOFING PARTNER</p>
              </div>
            </div>

            {/* Decorative Corner Flairs */}
            <div className="absolute -top-4 -right-4 w-20 h-20 border-t-2 border-r-2 border-primary/30 rounded-tr-3xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 border-b-2 border-l-2 border-primary/30 rounded-bl-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTop3Section;
