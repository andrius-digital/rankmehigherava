import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, CheckCircle, XCircle, Play, Search, TrendingUp, MapPin, BarChart3, Target, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting";

const painPoints = [
  "You're invisible on Google — competitors show up first",
  "Paid ads are expensive and leads disappear when you stop",
  "You've tried SEO before but saw no real results",
  "Your website gets traffic but not enough phone calls",
];

const features = [
  {
    icon: MapPin,
    title: "Google Maps Domination",
    description: "Rank in the top 3 of the local map pack where 70% of clicks happen.",
  },
  {
    icon: Search,
    title: "Organic Search Rankings",
    description: "Show up on page 1 for the keywords your customers are searching.",
  },
  {
    icon: TrendingUp,
    title: "Long-Term Growth",
    description: "Build sustainable traffic that compounds month over month.",
  },
  {
    icon: BarChart3,
    title: "Monthly Reporting",
    description: "See exactly how many calls and leads your SEO is generating.",
  },
  {
    icon: Target,
    title: "Local Focus",
    description: "We target your specific service area — not random traffic from across the country.",
  },
  {
    icon: Repeat,
    title: "Continuous Optimization",
    description: "We keep optimizing as Google changes, so your rankings stay strong.",
  },
];

const timeline = [
  {
    month: "Month 1-2",
    title: "Foundation & Technical SEO",
    description: "We audit your site, fix technical issues, optimize your Google Business Profile, and build your content strategy.",
  },
  {
    month: "Month 3-4",
    title: "Authority Building",
    description: "We create optimized content, build local citations, and start earning quality backlinks in your industry.",
  },
  {
    month: "Month 5-6",
    title: "Ranking Momentum",
    description: "You start seeing significant ranking improvements and increased call volume from organic search.",
  },
  {
    month: "Month 6+",
    title: "Domination & Scaling",
    description: "We expand to more keywords and service areas while maintaining your top positions.",
  },
];

const faqItems = [
  {
    question: "Why does SEO take so long to see results?",
    answer: "Google needs time to crawl, index, and trust your website. While you'll see technical improvements immediately and some ranking movement in 30-60 days, significant results typically take 4-6 months. The good news? Once you rank, you keep getting leads without paying per click.",
  },
  {
    question: "How is this different from other SEO agencies?",
    answer: "Most agencies focus on vanity metrics like impressions and rankings for easy keywords. We focus on one thing: getting your phone to ring. We built and scaled our own 8-figure service businesses using these exact strategies before ever offering them to clients.",
  },
  {
    question: "Do I still need to run ads if I do SEO?",
    answer: "That depends on your goals. SEO builds long-term, sustainable traffic at a lower cost per lead. Ads provide immediate results but stop when you stop paying. Many of our clients start with both, then reduce ad spend as their organic traffic grows.",
  },
  {
    question: "What if I've tried SEO before and it didn't work?",
    answer: "Most SEO fails because agencies use outdated tactics or focus on the wrong keywords. We audit exactly what went wrong before, show you the gaps, and build a strategy specifically for local service businesses — not generic e-commerce tactics.",
  },
  {
    question: "How do you report on results?",
    answer: "You get monthly reports showing: keyword rankings, organic traffic, phone calls from organic search, Google Business Profile performance, and a clear plan for the next month. No fluff, just the numbers that matter for your business.",
  },
];

const SEO = () => {
  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, '_blank');
    }
  };

  return (
    <>
      <Helmet>
        <title>SEO Services for Local Businesses | Google Maps & Organic Rankings | Rank Me Higher</title>
        <meta 
          name="description" 
          content="Long-term SEO strategy for growth on Google Maps and Google Search. Dominate local search results and get more calls from customers actively searching for your services." 
        />
      </Helmet>
      
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient Light Overlays */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/15 via-primary/5 to-transparent" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <Navbar />
          
          {/* Hero Section */}
          <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Text */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      From 8-Figure Local Business Owners
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">
                      Tired of paying for every single lead?
                    </span>
                  </div>

                  <h1 className="font-heading font-black text-3xl md:text-4xl lg:text-5xl leading-tight">
                    <span className="text-foreground">Dominate </span>
                    <span className="text-primary">Google Maps</span>
                    <span className="text-foreground"> & </span>
                    <span className="text-primary">Google Search</span>
                  </h1>

                  <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground">
                    Long-Term Strategy For Sustainable Growth
                  </h2>

                  <p className="text-muted-foreground leading-relaxed">
                    Stop renting your leads from Google Ads. We build <span className="font-semibold text-foreground">organic search rankings</span> that bring in customers month after month — without paying per click.
                  </p>

                  <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                    Get Your Free SEO Audit
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-sm">
                      Google Maps + Organic Search • Monthly reporting • Long-term results
                    </p>
                  </div>
                </div>

                {/* Right Column - Video */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-red-900/20 border border-primary/20 shadow-2xl">
                  <div className="aspect-video relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <button className="group relative">
                          <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                          <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 lg:w-10 lg:h-10 text-white ml-1" fill="white" />
                          </div>
                        </button>
                        <p className="mt-4 text-white/80 text-sm lg:text-base font-medium">
                          Watch: Our SEO Strategy Explained
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pain Points Section */}
          <section className="py-16 lg:py-24 bg-card/30">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  Sound <span className="text-primary">Familiar?</span>
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {painPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50"
                  >
                    <XCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <p className="text-muted-foreground text-lg">
                  SEO fixes all of this — <span className="font-bold text-primary">permanently</span>.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  What's Included In Your <span className="text-primary">SEO Strategy</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  A complete local SEO system built for service businesses.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="py-16 lg:py-24 bg-card/30">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  Your SEO <span className="text-primary">Timeline</span>
                </h2>
                <p className="text-muted-foreground">
                  Realistic expectations for long-term success.
                </p>
              </div>

              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-6 p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-gradient-to-br from-primary to-red-600">
                      <span className="font-heading font-bold text-white text-sm">{item.month}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
              <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-6">
                Ready To Own Your Search Results?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Get a free SEO audit showing exactly where you're losing traffic and how we'll fix it.
              </p>
              <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                Get Your Free SEO Audit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-muted-foreground text-sm mt-4">
                No obligations • See your competitor gaps • Custom strategy included
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 lg:py-24 bg-card/30">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground">
                  Frequently Asked <span className="text-primary">Questions</span>
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-primary/50 rounded-lg px-6 bg-background/50 data-[state=open]:border-primary"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <Footer />
        </div>
      </main>
    </>
  );
};

export default SEO;