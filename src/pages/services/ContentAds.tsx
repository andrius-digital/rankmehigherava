import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, XCircle, Play, Video, Megaphone, Target, Users, TrendingUp, Calendar, Star, AlertTriangle, Zap } from "lucide-react";
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
  "Running ads yourself but burning money on unqualified leads",
  "No professional content — just iPhone photos that don't convert",
  "Agencies charge a fortune but can't show real ROI",
  "You know you should be on social media but don't have time",
];

const features = [
  {
    icon: Video,
    title: "On-Site Content Shoots",
    description: "We come to you with professional equipment and capture real footage of your team in action.",
    color: "red",
  },
  {
    icon: Target,
    title: "Sales Funnel Creation",
    description: "Landing pages, lead magnets, and email sequences that turn clicks into booked jobs.",
    color: "red",
  },
  {
    icon: Megaphone,
    title: "Meta Ads Management",
    description: "Facebook and Instagram ads optimized for local service businesses — not generic campaigns.",
    color: "red",
  },
  {
    icon: Users,
    title: "Qualified Lead Delivery",
    description: "We filter out tire-kickers. You only talk to people ready to book.",
    color: "red",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "See exactly what you're spending and what you're getting back — no hidden metrics.",
    color: "red",
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Consistent social presence without you lifting a finger.",
    color: "red",
  },
];

const process = [
  {
    step: "01",
    title: "Strategy Session",
    description: "We learn your business, ideal customers, and what makes you different from competitors. No generic playbooks — this is built for you.",
    icon: Target,
    color: "red",
  },
  {
    step: "02",
    title: "On-Site Content Shoot",
    description: "Our team comes to your location and captures professional video and photo content that actually converts — real people, real work, real results.",
    icon: Video,
    color: "red",
  },
  {
    step: "03",
    title: "Funnel & Campaign Build",
    description: "We build your landing pages, ad creatives, and targeting strategy. Everything is built to convert — not just to look good.",
    icon: Megaphone,
    color: "red",
  },
  {
    step: "04",
    title: "Launch & Optimize",
    description: "Ads go live. We monitor daily, optimize weekly, and report monthly on your ROI. You always know exactly what's happening.",
    icon: TrendingUp,
    color: "red",
  },
];

const stats = [
  { stat: "7", label: "Days to First Lead", desc: "Most clients see leads within the first week of launch" },
  { stat: "3x", label: "Better Than DIY", desc: "Professional content outperforms iPhone photos every time" },
  { stat: "100%", label: "Done For You", desc: "We handle content, funnels, and ads — you just close the leads" },
];

const faqItems = [
  {
    question: "How much should I budget for Meta ads?",
    answer: "For local service businesses, we typically recommend starting with $1,500–3,000/month in ad spend. This gives us enough data to optimize quickly while generating real leads. We'll give you a custom recommendation based on your market and goals.",
  },
  {
    question: "What kind of content do you create?",
    answer: "We shoot professional video content showing your team at work, customer testimonials, before/after transformations, and educational content that builds trust. All tailored for Meta ads and social media — not generic stock footage.",
  },
  {
    question: "How quickly will I see leads?",
    answer: "Most clients see their first leads within the first week of ads going live. It typically takes 2–4 weeks to fully optimize targeting and get to a consistent cost-per-lead. We provide weekly updates so you always know what's happening.",
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

const ContentAds = () => {
  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, "_blank");
    }
  };

  return (
    <>
      <Helmet>
        <title>Content & Ads for Local Businesses | Meta Ads, Video Production & Funnels | Rank Me Higher</title>
        <meta
          name="description"
          content="Professional content shoots, Meta ad campaigns, and sales funnels that deliver qualified leads. We come to you, create the content, and run the ads. Book your strategy session."
        />
        <meta property="og:title" content="Content & Ads for Local Businesses | Rank Me Higher" />
        <meta property="og:description" content="Professional content shoots, Meta ad campaigns, and sales funnels that deliver qualified leads." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rankmehigher.com/services/content-ads" />
        <meta property="og:site_name" content="Rank Me Higher" />
        <meta property="og:image" content="https://rankmehigher.com/assets/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Content & Ads | Rank Me Higher" />
        <meta name="twitter:description" content="Content shoots, Meta ads, and sales funnels for local businesses." />
        <link rel="canonical" href="https://rankmehigher.com/services/content-ads" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Content & Ads Production",
          "provider": { "@type": "Organization", "name": "Rank Me Higher", "url": "https://rankmehigher.com" },
          "description": "Professional content shoots, Meta ad campaigns, and sales funnels that deliver qualified leads for local businesses.",
          "url": "https://rankmehigher.com/services/content-ads",
          "areaServed": "United States",
          "serviceType": "Content Marketing & Advertising"
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": { "@type": "Answer", "text": item.answer }
          }))
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rankmehigher.com/" },
            { "@type": "ListItem", "position": 2, "name": "Content & Ads", "item": "https://rankmehigher.com/services/content-ads" }
          ]
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient Background — matches homepage */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* HERO SECTION */}
          <section className="pt-28 lg:pt-36 pb-12 lg:pb-20">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left — Copy */}
                <div className="space-y-6">
                  {/* Stars + trust */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground font-orbitron">
                      Full-Service Creative + Media
                    </span>
                  </div>

                  {/* Pain hook */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-orbitron text-red-400 font-bold">Running ads but burning money?</span>
                  </div>

                  {/* H1 */}
                  <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] font-orbitron tracking-tight">
                    <span className="text-foreground">Content + Ads</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary animate-gradient-x">
                      That Actually Convert
                    </span>
                  </h1>

                  <h2 className="font-orbitron font-bold text-base md:text-lg text-muted-foreground">
                    On-Site Shoots &bull; Sales Funnels &bull; Done-For-You Ads
                  </h2>

                  <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
                    We come to your location, shoot{" "}
                    <strong className="text-foreground">professional content</strong>, build
                    high-converting{" "}
                    <strong className="text-foreground">sales funnels</strong>, and run{" "}
                    <strong className="text-foreground">Meta ad campaigns</strong> that put
                    qualified leads directly in your pipeline.
                  </p>

                  {/* CTAs — homepage style */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Megaphone className="w-4 h-4 text-red-400" />
                        Book Your Strategy Session
                      </span>
                    </button>
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-sm hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        See How It Works
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40">
                    {["We Shoot the Content", "We Build the Funnels", "We Run the Ads"].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-muted-foreground font-orbitron">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — Video placeholder + stats */}
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-primary/40 to-red-600/40 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-red-600/30 rounded-2xl blur-lg opacity-60" />
                    <div className="relative z-10 aspect-video bg-black/80 flex items-center justify-center">
                      <div className="text-center">
                        <button className="group/play relative" onClick={openCalendly}>
                          <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-50 group-hover/play:opacity-80 transition-opacity" />
                          <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-xl group-hover/play:scale-110 transition-transform">
                            <Play className="w-8 h-8 lg:w-10 lg:h-10 text-white ml-1" fill="white" />
                          </div>
                        </button>
                        <p className="mt-4 text-white/80 text-sm font-orbitron">
                          Watch: Our Content + Ads Strategy
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {stats.map((s) => (
                      <div key={s.label} className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                        <div className="text-2xl font-bold text-primary font-orbitron">{s.stat}</div>
                        <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PAIN POINTS */}
          <section className="py-12 lg:py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.03] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl lg:text-4xl font-black font-orbitron mb-4">
                  <span className="text-foreground">Sound </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Familiar?</span>
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {painPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
                  >
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-foreground text-sm">{point}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-orbitron text-primary font-bold">
                    We handle <span className="text-foreground">everything</span> — content, funnels, and ads.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="py-12 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black font-orbitron mb-4">
                  <span className="text-foreground">The Complete </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Content & Ads Package</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base">
                  Everything you need to get qualified leads from paid advertising — without lifting a finger.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300"
                  >
                    <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4 group-hover:bg-red-500/25 transition-colors">
                      <feature.icon className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="font-orbitron font-bold text-sm text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="py-12 lg:py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.03] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black font-orbitron mb-4">
                  <span className="text-foreground">How It </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Works</span>
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base">
                  From strategy to qualified leads in your inbox.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-0">
                {process.map((item, i) => (
                  <div key={i} className="relative flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-red-500/15 border border-red-500/30">
                        <item.icon className="w-6 h-6 text-red-400" />
                      </div>
                      {i < process.length - 1 && (
                        <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-white/20 to-transparent my-2" />
                      )}
                    </div>
                    <div className="pb-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-orbitron text-muted-foreground font-bold">STEP {item.step}</span>
                      </div>
                      <h3 className="font-orbitron font-bold text-base text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PRICING HINT */}
          <section className="py-12 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="relative p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl border border-white/15">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-orbitron text-primary font-bold uppercase tracking-wider">Transparent Pricing</span>
                    </div>
                    <h2 className="font-orbitron font-black text-2xl lg:text-3xl text-foreground mb-3">
                      Content + Ads, Done Right
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      We don't do one-size-fits-all packages. Every campaign is custom-built for your market, your offer, and your goals. Book a strategy call and we'll map out exactly what it takes to get you profitable leads.
                    </p>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                      <h4 className="font-orbitron font-bold text-xs text-foreground mb-2">Typical Investment Range</h4>
                      <ul className="space-y-1.5">
                        {[
                          "Ad spend: $1,500–$3,000/mo (goes directly to Meta)",
                          "Management + content: custom quote",
                          "Funnel build: one-time setup fee",
                          "No long-term contracts — month-to-month",
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="font-orbitron font-bold text-xs text-foreground mb-2">What's Included</h4>
                      <ul className="space-y-1.5">
                        {[
                          "On-site professional content shoot",
                          "Ad creative (video + static)",
                          "Landing page / funnel build",
                          "Meta Ads setup & management",
                          "Weekly optimization & reporting",
                          "Monthly strategy review call",
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={openCalendly}
                      className="group w-full px-6 py-3.5 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.01] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/15 group-hover:to-red-500/10 transition-all duration-500" />
                      <span className="relative z-10">Get Your Custom Quote — Book a Call</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[11px] text-muted-foreground text-center">Free consultation. No credit card needed.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA BANNER */}
          <section className="py-12 lg:py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.03] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10 text-center">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-red-500/5 to-transparent border border-primary/20">
                <h2 className="font-orbitron font-black text-2xl lg:text-3xl text-foreground mb-4">
                  Ready To Scale With Paid Ads?
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base mb-6 max-w-xl mx-auto">
                  Book a strategy session and we'll map out your complete content + ads plan. See real campaign examples and get a custom ROI estimate.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={openCalendly}
                    className="group relative px-8 py-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      Book Your Strategy Session
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  <Link
                    to="/services/seo"
                    className="group relative px-8 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-sm hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden flex items-center justify-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                    <span className="relative">Explore SEO Services</span>
                    <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <p className="text-muted-foreground text-xs mt-4">
                  No obligations &bull; Custom strategy &bull; See real campaign examples
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-12 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black font-orbitron">
                  <span className="text-foreground">Frequently Asked </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Questions</span>
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-white/10 rounded-xl px-5 bg-white/5 backdrop-blur-md data-[state=open]:border-red-500/40 data-[state=open]:bg-red-500/5 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5 font-orbitron text-sm font-bold">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* INTERNAL LINKS */}
          <section className="py-8 lg:py-12">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
              <div className="text-center mb-6">
                <span className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest">Explore More Services</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "SEO Services", desc: "Dominate Google organically", href: "/services/seo" },
                  { label: "Custom Websites", desc: "Built to rank and convert", href: "/services/websites" },
                  { label: "Outbound Calling", desc: "Reactivate your old leads", href: "/services/outbound" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 text-center"
                  >
                    <div className="font-orbitron font-bold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                      {link.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{link.desc}</div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mx-auto mt-2" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </main>
    </>
  );
};

export default ContentAds;
