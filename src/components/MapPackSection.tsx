import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import WistiaVideo from "./WistiaVideo";
import TestimonialVideoSection from "./TestimonialVideoSection";

const videoDiscoverItems = [
  { text: "How we choose the right ", bold: "local keywords", suffix: " for your service area." },
  { text: "The proven process we use to climb into the ", bold: "Map Pack Top 3", suffix: "." },
  { text: "Real examples of local businesses getting ", bold: "more calls, quotes, and bookings", suffix: "." },
  { text: "How Local Map Booster fits into your overall ", bold: "Local & Google SEO", suffix: " strategy." },
  { text: "The exact ", bold: "ranking signals", suffix: " Google uses to decide who shows up first." },
  { text: "Why most local SEO agencies ", bold: "fail to deliver results", suffix: " and how we do it differently." },
];

const ernestWindowsStats = [
  { value: "47%", label: "Increase in Map Pack visibility" },
  { value: "3x", label: "More inbound calls per month" },
  { value: "Top 3", label: "Rankings in 12 target cities" },
];

const businessBenefits = [
  { text: "More visibility in the ", bold: "local Map Pack", suffix: " across the cities you serve." },
  { text: "A steady flow of ", bold: "high-intent local leads", suffix: " who are ready to book now." },
  { text: "Less dependence on paid ads and fewer ", bold: "slow months", suffix: " in your calendar." },
  { text: "Consistent ", bold: "5-star review growth", suffix: " that builds trust and credibility." },
  { text: "Outrank competitors who have been in business ", bold: "longer than you", suffix: "." },
];

const orangeCrewStats = [
  { value: "156%", label: "Increase in organic traffic" },
  { value: "89", label: "Keywords in Top 10 positions" },
  { value: "4.9★", label: "Average review rating" },
];

const seoFeatures = [
  "AI-driven strategies that sends qualified visitors to your Google listing",
  "Find high-intent keywords tailored to your services and local area",
  "Professionally written website content designed to rank and convert",
  "Competitor analysis and outranking strategies",
  "Google Maps optimization and visibility boosting",
  "Gain high-authority, relevant links to boost domain trust",
  "Continuous AI-powered ranking adjustments",
  "Increase online visibility and credibility through media coverage",
  "Monthly SEO Progress Meeting – Review performance, rankings, and opportunities for growth",
  "Custom Reporting Dashboard for complete transparency",
];

const MapPackSection = () => {
  return (
    <>
      {/* Client Case Study 1 - Ernest Windows */}
      <section id="services" className="relative py-12 lg:py-16 bg-background">
        {/* Top connecting glow */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
        {/* Bottom connecting glow */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/20 via-primary/10 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
          {/* Client Header */}
          <div className="text-center mb-8">
            <span className="text-muted-foreground text-xs tracking-wider uppercase">Client</span>
            <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-primary mt-2">
              Ernest Windows
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Longest Standing Rank Me Higher Client
            </p>
          </div>

          {/* Content Grid - Horizontal on Desktop, Stacked on Mobile */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
            {/* Video - Smaller, Contained */}
            <div className="w-full max-w-[280px] lg:max-w-[320px] flex-shrink-0">
              <WistiaVideo videoId="j3c7ejxm34" aspectRatio="9:16" />
            </div>

            {/* Text Content - Enhanced */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h3 className="font-heading font-black text-2xl md:text-3xl text-foreground leading-tight">
                  <span className="text-primary">From 100 To Nearly 3,000</span> Google Reviews & Multiple City Dominance
                </h3>

                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                  When Ernest Windows partnered with Rank Me Higher, they had just 100 reviews. Andrius implemented a comprehensive <span className="text-foreground font-semibold">Reputation Management & Local SEO strategy</span> that skyrocketed their social proof.
                </p>

                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                  Today, they are the undeniable market leader with <span className="text-foreground font-semibold">nearly 3,000 5-star reviews</span>, ranking #1 across 12 different target cities for high-intent keywords like "window washing near me" and "gutter cleaning experts."
                </p>
              </div>

              {/* Key Results Grid */}
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Check className="w-4 h-4" />
                    Review Velocity
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Automated review requests increased feedback by <span className="text-foreground font-semibold">300%</span></p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Check className="w-4 h-4" />
                    Map Pack Dominance
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Secured <span className="text-foreground font-semibold">Top 3 positions</span> in competitive Chicago suburbs</p>
                </div>
              </div>

              {/* Stats Row - Professional */}
              <div className="grid grid-cols-3 gap-6 py-5 border-y border-border/40 bg-card/20 rounded-lg px-4">
                {ernestWindowsStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-heading font-black text-2xl lg:text-3xl text-primary drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
                      {stat.value}
                    </div>
                    <div className="text-[10px] lg:text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Testimonial - Clean */}
              <blockquote className="border-l-4 border-primary pl-4 py-3 bg-gradient-to-r from-primary/10 to-transparent rounded-r-xl">
                <p className="italic text-foreground/90 font-medium text-sm leading-relaxed">
                  "Andrius transformed our online presence. We went from being just another window washer to the <span className="text-primary">#1 rated company in Illinois</span>. The phone literally hasn't stopped ringing."
                </p>
                <footer className="mt-2 text-xs font-bold text-primary tracking-wide flex items-center gap-2">
                  — ERNEST, OWNER <span className="w-1 h-1 rounded-full bg-border"></span> ERNEST WINDOWS
                </footer>
              </blockquote>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button variant="hero" size="lg" className="group shadow-lg shadow-primary/20">
                  GET THE SAME RESULTS
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="relative py-16 lg:py-24 bg-card/50">
        {/* Top connecting glow */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
        {/* Bottom connecting glow */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl leading-tight">
              <span className="text-primary">300+ Local Businesses</span>
              <span className="text-foreground"> Use </span>
              <span className="text-primary">Local Map Booster</span>
              <span className="text-foreground"> To Rank In The </span>
              <span className="text-primary">Top 3 On Google</span>
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Plug Into The Same Local SEO System Our Clients Use To Win More{" "}
              <span className="text-primary">"Near Me"</span> Searches, Phone Calls, And Booked Jobs.
            </p>
          </div>

          {/* Plan Selector Label */}
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase mb-6">
            CHOOSE THE PLAN THAT FITS YOUR MARKET
          </p>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border border-primary/50 rounded-xl p-6 space-y-3 hover:border-primary hover:bg-primary/5 transition-all duration-300">
              <h3 className="font-heading font-bold text-lg text-primary">5-Mile Radius</h3>
              <p className="font-medium text-foreground text-sm">10 Local Keywords</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Perfect If You Want To Dominate Searches Close To Your Main Location And Lock In The Best Nearby "Window Cleaning Near Me" Style Traffic.
              </p>
            </div>
            <div className="border border-primary/50 rounded-xl p-6 space-y-3 hover:border-primary hover:bg-primary/5 transition-all duration-300">
              <h3 className="font-heading font-bold text-lg text-primary">10-Mile Radius</h3>
              <p className="font-medium text-foreground text-sm">20 Local Keywords</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ideal For Service Areas That Cover Multiple Suburbs Or Towns And Need Visibility Across A Wider Local Territory.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-6">
            <p className="text-muted-foreground text-xs">
              All Plans Are Built Around Your{" "}
              <span className="text-primary">Google Business Profile</span> And Tailored To Your Neighborhoods.
            </p>

            <Button variant="hero" size="lg" className="group">
              GET YOUR MAP AUDIT
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Client Case Study 2 - Orange Crew */}
      <section id="results" className="relative py-12 lg:py-16 bg-background">
        {/* Top connecting glow */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
        {/* Bottom connecting glow */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/20 via-primary/10 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
          {/* Client Header */}
          <div className="text-center mb-8">
            <span className="text-muted-foreground text-xs tracking-wider uppercase">Client</span>
            <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-primary mt-2">
              Orange Crew Junk Removal
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Full Marketing Transformation
            </p>
          </div>

          {/* Content Grid - Horizontal on Desktop, Stacked on Mobile */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
            {/* Video - Smaller, Contained */}
            <div className="w-full max-w-[280px] lg:max-w-[320px] flex-shrink-0">
              <WistiaVideo videoId="plkbh1ssks" aspectRatio="9:16" />
            </div>

            {/* Text Content - Enhanced */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h3 className="font-heading font-black text-2xl md:text-3xl text-foreground leading-tight">
                  <span className="text-primary">From Invisible To Dominating</span> Multiple Service Areas
                </h3>

                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                  Orange Crew came to us with a common problem: great service, but zero visibility. Rank Me Higher took over their entire digital strategy—rebuilding their website for conversion, optimizing their Google Business Profile, and launching a targeted <span className="text-foreground font-semibold">Local SEO campaign</span>.
                </p>

                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                  The result? They went from chasing leads to owning their market. We didn't just get them ranked; we built a <span className="text-foreground font-semibold">lead generation engine</span> that delivers daily high-ticket jobs across multiple suburbs.
                </p>
              </div>

              {/* Key Results Grid */}
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Check className="w-4 h-4" />
                    Traffic Explosion
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Organic search traffic grew by <span className="text-foreground font-semibold">156%</span> in under 6 months</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Check className="w-4 h-4" />
                    Keyword Dominance
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Ranking <span className="text-foreground font-semibold">#1</span> for high-value terms like "estate cleanout"</p>
                </div>
              </div>

              {/* Stats Row - Professional */}
              <div className="grid grid-cols-3 gap-6 py-5 border-y border-border/40 bg-card/20 rounded-lg px-4">
                {orangeCrewStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-heading font-black text-2xl lg:text-3xl text-primary drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
                      {stat.value}
                    </div>
                    <div className="text-[10px] lg:text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Testimonial - Clean */}
              <blockquote className="border-l-4 border-primary pl-4 py-3 bg-gradient-to-r from-primary/10 to-transparent rounded-r-xl">
                <p className="italic text-foreground/90 font-medium text-sm leading-relaxed">
                  "Before working with the team, we were invisible online. Now we're showing up in the <span className="text-primary">top spots across multiple suburbs</span> and getting calls every single day."
                </p>
                <footer className="mt-2 text-xs font-bold text-primary tracking-wide flex items-center gap-2">
                  — DIMITRI, OWNER <span className="w-1 h-1 rounded-full bg-border"></span> ORANGE CREW
                </footer>
              </blockquote>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button variant="hero" size="lg" className="group shadow-lg shadow-primary/20">
                  SEE IF WE CAN DO THIS FOR YOU
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Videos Section */}
      <TestimonialVideoSection />

      {/* Local & Google SEO Section */}
      <section className="relative py-16 lg:py-28 bg-card/40 overflow-hidden">
        {/* Top connecting glow */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
        {/* Bottom connecting glow */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />

        {/* Decorative background circles */}
        <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Real Results Visual */}
            <div className="relative order-2 lg:order-1">
              {/* Dynamic Glow behind image */}
              <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-[2rem] animate-pulse" />

              <div className="relative group">
                <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] transform transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-1">
                  <img
                    src="/assets/seo-results-collage.png"
                    alt="Local SEO Results Proof"
                    className="w-full h-auto object-cover"
                  />
                  {/* Glass overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60 pointer-events-none" />

                  {/* Floating Result Badge */}
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md border border-primary/30 rounded-lg px-3 py-2 flex items-center gap-2 shadow-xl animate-bounce-slow">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold tracking-tight uppercase">Verified Results</span>
                  </div>
                </div>

                {/* Decorative Frame Elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              </div>
            </div>

            {/* Right Column - Persuasive Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-3">
                <h3 className="font-heading font-black text-3xl md:text-4xl lg:text-5xl text-primary leading-tight uppercase tracking-tighter">
                  Local & <span className="text-foreground">Google SEO</span>
                </h3>
                <div className="h-1.5 w-24 bg-primary rounded-full" />
              </div>

              <p className="text-muted-foreground leading-relaxed text-base lg:text-lg font-medium">
                Our "Scale System" doesn't just get you listed—it makes you <span className="text-foreground font-bold italic">impossible to ignore</span>.
              </p>

              <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                We blend advanced <span className="text-primary font-semibold">AI data-mining</span> with aggressive backlink strategies to force your business into the only place that matters: the first page of Google.
              </p>

              <div className="space-y-4 pt-2">
                <h4 className="text-foreground font-bold text-sm tracking-[0.2em] uppercase flex items-center gap-2">
                  <div className="w-8 h-[1px] bg-primary" />
                  The Power Features:
                </h4>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {seoFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 group">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground text-[13px] leading-tight group-hover:text-foreground transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button variant="hero" size="lg" className="group h-14 px-10 text-lg shadow-[0_10px_30px_rgba(239,68,68,0.3)]">
                  CLAIM YOUR MARKET NOW
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Button>
                <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase tracking-widest text-center lg:text-left ml-2">
                  Limited slots available for new service areas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MapPackSection;
