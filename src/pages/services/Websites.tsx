import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, CheckCircle, XCircle, Play, Globe, Bot, Zap, Clock, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Declare Calendly global type
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting";

const painPoints = [
  "Your current website looks outdated and doesn't convert",
  "You're losing leads because no one answers after hours",
  "Competitors are ranking above you on Google",
  "You're paying monthly fees but seeing zero results",
];

const features = [
  {
    icon: Globe,
    title: "Custom Built Website",
    description: "Not a template. A fully custom site designed to convert visitors into paying customers.",
  },
  {
    icon: Bot,
    title: "AI Receptionist Included",
    description: "24/7 AI that answers calls, books appointments, and never misses a lead.",
  },
  {
    icon: Zap,
    title: "Full Automation Stack",
    description: "Automated follow-ups, appointment reminders, and review requests built-in.",
  },
  {
    icon: Clock,
    title: "2 Week Delivery",
    description: "From scratch to fully active in 14 days. No 3-month timelines.",
  },
  {
    icon: Shield,
    title: "SEO Optimized",
    description: "Built to rank on Google from day one with proper technical SEO.",
  },
  {
    icon: MessageSquare,
    title: "CRM Integration",
    description: "Syncs with HouseCallPro, Jobber, ServiceTitan, and more.",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery Call",
    description: "We learn about your business, goals, and what's not working with your current setup.",
  },
  {
    step: "02",
    title: "Design & Build",
    description: "Our team builds your custom website and configures all automations.",
  },
  {
    step: "03",
    title: "Launch & Train",
    description: "We launch your site and train you on the AI receptionist and automation tools.",
  },
  {
    step: "04",
    title: "Ongoing Support",
    description: "We stay with you to optimize, update, and ensure everything runs smoothly.",
  },
];

const faqItems = [
  {
    question: "How is this different from a regular website?",
    answer: "Most web designers hand you a pretty template and disappear. We build a complete lead generation system — a custom website that ranks on Google, an AI receptionist that answers 24/7, and automation that follows up with every lead automatically. It's not just a website, it's your entire front office.",
  },
  {
    question: "What does the AI Receptionist actually do?",
    answer: "The AI Receptionist answers calls when you can't, captures lead information, books appointments directly to your calendar, and even handles basic customer questions. It works 24/7/365 — nights, weekends, holidays. You never miss a lead again.",
  },
  {
    question: "Do I need to be tech-savvy to use this?",
    answer: "Not at all. We handle all the technical setup and provide simple training. If you can use a smartphone, you can manage your new system. Plus, we're always a call away for support.",
  },
  {
    question: "What if I already have a website?",
    answer: "We'll migrate everything over — your content, your domain, your SEO history. We often improve rankings in the transition because we fix technical issues the previous site had.",
  },
  {
    question: "How long until I see results?",
    answer: "Your website goes live in 2 weeks. The AI receptionist starts capturing leads immediately. Most clients see increased call volume within the first month as their Google presence improves.",
  },
];

const Websites = () => {
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
        <title>Custom Websites with AI Receptionist | 2 Week Delivery | Rank Me Higher</title>
        <meta
          name="description"
          content="Get a custom-built website with AI receptionist, automated follow-ups, and full CRM integration. From scratch to live in 2 weeks. Book your free consultation."
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
                  {/* Star Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Trusted by 300+ Local Businesses
                    </span>
                  </div>

                  {/* Pain Point */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">
                      Tired of websites that look pretty but don't bring in customers?
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="font-heading font-black text-3xl md:text-4xl lg:text-5xl leading-tight">
                    <span className="text-foreground">Get A </span>
                    <span className="text-primary">Custom Website</span>
                    <span className="text-foreground"> With </span>
                    <span className="text-primary">AI Receptionist</span>
                    <span className="text-foreground"> In </span>
                    <span className="text-primary">2 Weeks</span>
                  </h1>

                  {/* Subheadline */}
                  <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground">
                    From Scratch To Fully Active — No 3-Month Timelines
                  </h2>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    Stop losing leads to voicemail. We build <span className="font-semibold text-foreground">custom websites that rank on Google</span> and include an <span className="font-semibold text-foreground">AI receptionist that answers 24/7</span>, books appointments, and follows up automatically.
                  </p>

                  {/* CTA Button */}
                  <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                    Book Your Free Consultation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Trust Badge */}
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-sm">
                      2 week delivery guaranteed • AI receptionist included • Full automation stack
                    </p>
                  </div>
                </div>

                {/* Right Column - Video Placeholder */}
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
                          See How It Works
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
                  We fix all of this — in <span className="font-bold text-primary">2 weeks</span>.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  Everything You Get With Your <span className="text-primary">Custom Website</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Not just a website — a complete lead generation and customer capture system.
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
                  From first call to live website in 2 weeks.
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
                Ready To Stop Losing Leads?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Book a free consultation and see exactly how we'll build your custom website with AI receptionist — delivered in 2 weeks.
              </p>
              <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                Book Your Free Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-muted-foreground text-sm mt-4">
                No obligations • See your custom plan • 2 week delivery guaranteed
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

export default Websites;