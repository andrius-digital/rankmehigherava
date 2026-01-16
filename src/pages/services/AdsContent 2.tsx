import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, CheckCircle, XCircle, Play, Video, Megaphone, Target, Users, TrendingUp, Calendar } from "lucide-react";
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
  "Running ads yourself but wasting money on unqualified leads",
  "No professional content — just iPhone photos that don't convert",
  "Agencies charge a fortune but can't show real ROI",
  "You know you should be on social media but don't have time",
];

const features = [
  {
    icon: Video,
    title: "On-Site Content Shoots",
    description: "We come to you with professional equipment and capture real footage of your team in action.",
  },
  {
    icon: Target,
    title: "Sales Funnel Creation",
    description: "Landing pages, lead magnets, and email sequences that turn clicks into booked jobs.",
  },
  {
    icon: Megaphone,
    title: "Meta Ads Management",
    description: "Facebook and Instagram ads optimized for local service businesses — not generic campaigns.",
  },
  {
    icon: Users,
    title: "Qualified Lead Delivery",
    description: "We filter out tire-kickers. You only talk to people ready to book.",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "See exactly what you're spending and what you're getting back — no hidden metrics.",
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Consistent social presence without you lifting a finger.",
  },
];

const process = [
  {
    step: "01",
    title: "Strategy Session",
    description: "We learn your business, ideal customers, and what makes you different from competitors.",
  },
  {
    step: "02",
    title: "On-Site Content Shoot",
    description: "Our team comes to your location and captures professional video and photo content.",
  },
  {
    step: "03",
    title: "Funnel & Campaign Build",
    description: "We build your landing pages, ad creatives, and targeting strategy.",
  },
  {
    step: "04",
    title: "Launch & Optimize",
    description: "Ads go live. We monitor daily, optimize weekly, and report monthly on your ROI.",
  },
];

const faqItems = [
  {
    question: "How much should I budget for Meta ads?",
    answer: "For local service businesses, we typically recommend starting with $1,500-3,000/month in ad spend. This gives us enough data to optimize quickly while generating real leads. We'll give you a custom recommendation based on your market and goals.",
  },
  {
    question: "What kind of content do you create?",
    answer: "We shoot professional video content showing your team at work, customer testimonials, before/after transformations, and educational content that builds trust. All tailored for Meta ads and social media — not generic stock footage.",
  },
  {
    question: "How quickly will I see leads?",
    answer: "Most clients see their first leads within the first week of ads going live. It typically takes 2-4 weeks to fully optimize targeting and get to a consistent cost-per-lead. We provide weekly updates so you always know what's happening.",
  },
  {
    question: "What makes your ads different from boosted posts?",
    answer: "Boosted posts are like throwing money at the wall. We build complete funnels — strategic ad creative, targeted audiences, landing pages designed to convert, and follow-up sequences. It's a system, not a hope.",
  },
  {
    question: "Do you guarantee results?",
    answer: "We guarantee our work ethic and expertise. While we can't control every variable in advertising, we only continue working with clients where we're producing positive ROI. If it's not working, we'll tell you honestly and pivot or part ways.",
  },
];

const AdsContent = () => {
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
        <title>Ads & Content for Local Businesses | Meta Ads, Video Production & Funnels | Rank Me Higher</title>
        <meta 
          name="description" 
          content="Professional content shoots, Meta ad campaigns, and sales funnels that deliver qualified leads. We come to you, create the content, and run the ads. Book your strategy session." 
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
                      Full-Service Creative + Media
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">
                      Running ads but burning money on unqualified leads?
                    </span>
                  </div>

                  <h1 className="font-heading font-black text-3xl md:text-4xl lg:text-5xl leading-tight">
                    <span className="text-primary">Professional Content</span>
                    <span className="text-foreground"> + </span>
                    <span className="text-primary">Meta Ads</span>
                    <span className="text-foreground"> That Deliver </span>
                    <span className="text-primary">Qualified Leads</span>
                  </h1>

                  <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground">
                    On-Site Shoots • Sales Funnels • Done-For-You Ads
                  </h2>

                  <p className="text-muted-foreground leading-relaxed">
                    We come to your location, shoot <span className="font-semibold text-foreground">professional content</span>, build high-converting <span className="font-semibold text-foreground">sales funnels</span>, and run <span className="font-semibold text-foreground">Meta ad campaigns</span> that put qualified leads directly in your pipeline.
                  </p>

                  <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                    Book Your Strategy Session
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-sm">
                      We shoot the content • We build the funnels • We run the ads
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
                          See Our Work
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
                  We handle <span className="font-bold text-primary">everything</span> — content, funnels, and ads.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  The Complete <span className="text-primary">Ads & Content Package</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to get qualified leads from paid advertising.
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

          {/* Process Section */}
          <section className="py-16 lg:py-24 bg-card/30">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  How It <span className="text-primary">Works</span>
                </h2>
                <p className="text-muted-foreground">
                  From strategy to qualified leads in your inbox.
                </p>
              </div>

              <div className="space-y-6">
                {process.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-6 p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                      <span className="font-heading font-black text-white text-lg">{item.step}</span>
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
                Ready To Scale With Paid Ads?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Book a strategy session and we'll map out your complete content + ads plan.
              </p>
              <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                Book Your Strategy Session
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-muted-foreground text-sm mt-4">
                No obligations • Custom strategy • See real campaign examples
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

export default AdsContent;