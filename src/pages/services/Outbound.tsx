import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, CheckCircle, XCircle, Play, Phone, Users, Calendar, DollarSign, RefreshCw, Headphones } from "lucide-react";
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
  "You have a database of past customers who never came back",
  "Your team is too busy working to make follow-up calls",
  "You're sitting on revenue but don't have time to extract it",
  "Cold calling feels awkward and you hate doing it",
];

const features = [
  {
    icon: Phone,
    title: "Live Human Agents",
    description: "Real people, not robots. Trained specifically on your business and services.",
  },
  {
    icon: RefreshCw,
    title: "Database Reactivation",
    description: "We call your past customers and bring them back for repeat service.",
  },
  {
    icon: Calendar,
    title: "Direct Booking",
    description: "Appointments go straight to your calendar. No back-and-forth needed.",
  },
  {
    icon: DollarSign,
    title: "Guaranteed ROI",
    description: "If we don't generate more revenue than you spend, we keep working for free.",
  },
  {
    icon: Users,
    title: "CRM Integration",
    description: "Syncs with HouseCallPro, Jobber, ServiceTitan, and more.",
  },
  {
    icon: Headphones,
    title: "Inbound Support",
    description: "We also handle incoming calls so you never miss a new lead.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Connect Your Database",
    description: "We integrate with your CRM and pull your past customer list. You tell us who to call.",
  },
  {
    step: "02",
    title: "Train Our Agents",
    description: "We learn your services, pricing, and scheduling so our team sounds like your team.",
  },
  {
    step: "03",
    title: "We Start Calling",
    description: "Our agents call your past customers, re-engage them, and book them for service.",
  },
  {
    step: "04",
    title: "You Do The Work",
    description: "Show up to booked appointments. We handle the outreach, you handle the service.",
  },
];

const results = [
  { metric: "2 Days", label: "To Deploy" },
  { metric: "35%", label: "Avg. Reactivation Rate" },
  { metric: "5-10x", label: "Typical ROI" },
];

const faqItems = [
  {
    question: "How is this different from a call center?",
    answer: "Traditional call centers use scripts and minimum wage workers who sound robotic. Our agents are trained specifically on your business — they know your services, your pricing, and how you work. Customers think they're talking to someone from your company.",
  },
  {
    question: "What does 'guaranteed ROI' actually mean?",
    answer: "Simple: if the revenue from booked jobs doesn't exceed what you pay us, we continue working at no additional charge until it does. We only win when you win.",
  },
  {
    question: "How quickly can you start calling?",
    answer: "We can be making calls within 2 business days of signing up. We just need access to your customer database and a quick training call to learn your business.",
  },
  {
    question: "What if customers get annoyed by the calls?",
    answer: "We're not pushy telemarketers. Our approach is friendly and value-focused: 'Hey, we noticed it's been a while — wanted to check if you need any service before the season starts.' Most customers appreciate the reminder.",
  },
  {
    question: "Do you handle inbound calls too?",
    answer: "Yes. We can answer your incoming calls, capture new leads, and book appointments — so you never miss a call while you're on a job.",
  },
  {
    question: "What CRMs do you integrate with?",
    answer: "We work with HouseCallPro, Jobber, ServiceTitan, Housecall Pro, and most major field service management software. If you use something else, we can usually make it work.",
  },
];

const Outbound = () => {
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
        <title>Live Outbound Sales Agents | Database Reactivation | Guaranteed ROI | Rank Me Higher</title>
        <meta 
          name="description" 
          content="Reactivate your existing customer database with live human agents. We call your past clients, book them for service again, and guarantee ROI. Deploy in 2 days." 
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
                      Guaranteed ROI Or We Work Free
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">
                      Sitting on a goldmine of past customers you haven't called?
                    </span>
                  </div>

                  <h1 className="font-heading font-black text-3xl md:text-4xl lg:text-5xl leading-tight">
                    <span className="text-primary">Reactivate</span>
                    <span className="text-foreground"> Your Database</span>
                    <br />
                    <span className="text-foreground">We </span>
                    <span className="text-primary">Call Your Clients</span>
                    <span className="text-foreground"> & </span>
                    <span className="text-primary">Book Them Again</span>
                  </h1>

                  <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground">
                    Live Human Agents • Deploy In 2 Days • Guaranteed ROI
                  </h2>

                  <p className="text-muted-foreground leading-relaxed">
                    Your past customers already trust you. Our <span className="font-semibold text-foreground">trained live agents</span> call them, remind them it's time for service, and <span className="font-semibold text-foreground">book appointments directly to your calendar</span>. You just show up and do the work.
                  </p>

                  <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                    Book Your Strategy Call
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-sm">
                      Live agents • CRM sync • 2-day deployment • ROI guaranteed
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
                          Hear A Sample Call
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Results Stats */}
          <section className="py-12 bg-card/50 border-y border-border/50">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="grid grid-cols-3 gap-8">
                {results.map((result, index) => (
                  <div key={index} className="text-center">
                    <p className="font-heading font-black text-3xl md:text-4xl text-primary">
                      {result.metric}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {result.label}
                    </p>
                  </div>
                ))}
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
                  Let us call them for you — <span className="font-bold text-primary">guaranteed ROI</span>.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  What You Get With <span className="text-primary">Live Outbound Agents</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  A complete outbound sales team without the hiring, training, or management headaches.
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

          {/* How It Works Section */}
          <section className="py-16 lg:py-24 bg-card/30">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                  How It <span className="text-primary">Works</span>
                </h2>
                <p className="text-muted-foreground">
                  From signup to booked appointments in 2 days.
                </p>
              </div>

              <div className="space-y-6">
                {howItWorks.map((item, index) => (
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
                Ready To Reactivate Your Customer Database?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Book a call and we'll show you exactly how many past customers we can bring back — with guaranteed ROI.
              </p>
              <Button onClick={openCalendly} variant="hero" size="xl" className="group">
                Book Your Strategy Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-muted-foreground text-sm mt-4">
                Deploy in 2 days • Live human agents • Guaranteed ROI
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

export default Outbound;