import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Megaphone,
  Video,
  Target,
  Users,
  TrendingUp,
  Calendar,
  ChevronDown,
  Phone,
  Zap,
  Play,
} from "lucide-react";
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

const faqItems = [
  {
    q: "How much should I budget for Meta ads?",
    a: "For local service businesses, we typically recommend starting with $1,500–3,000/month in ad spend. This gives us enough data to optimize quickly while generating real leads. We'll give you a custom recommendation based on your market and goals.",
  },
  {
    q: "What kind of content do you create?",
    a: "We shoot professional video content showing your team at work, customer testimonials, before/after transformations, and educational content that builds trust. All tailored for Meta ads and social media — not generic stock footage.",
  },
  {
    q: "How quickly will I see leads?",
    a: "Most clients see their first leads within the first week of ads going live. It typically takes 2–4 weeks to fully optimize targeting and get to a consistent cost-per-lead. We provide weekly updates so you always know what's happening.",
  },
  {
    q: "What makes your ads different from boosted posts?",
    a: "Boosted posts are like throwing money at the wall. We build complete funnels — strategic ad creative, targeted audiences, landing pages designed to convert, and follow-up sequences. It's a system, not a hope.",
  },
  {
    q: "Do you guarantee results?",
    a: "We guarantee our work ethic and expertise. While we can't control every variable in advertising, we only continue working with clients where we're producing positive ROI. If it's not working, we'll tell you honestly and pivot or part ways.",
  },
  {
    q: "Can you combine Content & Ads with SEO?",
    a: "Absolutely — and we recommend it. Paid ads get you leads now; SEO builds your organic pipeline over time. Many of our clients run both. Ask us about our combined packages.",
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
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a }
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
        {/* Enhanced Ambient Light Overlays — exact copy from Index.tsx */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* ─── HERO — DESKTOP ─── */}
          <section className="hidden lg:flex min-h-[calc(100vh-80px)] items-center pt-28 pb-8">
            <div className="container mx-auto px-8 max-w-7xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">

                {/* LEFT — Copy */}
                <div className="space-y-5 text-left">
                  {/* Stars + tagline */}
                  <div className="flex items-center gap-2 animate-fade-in">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground font-orbitron">
                      <span className="text-foreground font-bold">Every campaign we run</span> is <span className="text-primary font-bold">profitable</span>
                    </span>
                  </div>

                  {/* H1 + description */}
                  <div className="space-y-4">
                    <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-black leading-[1.1] font-orbitron tracking-tight">
                      <span className="text-foreground">We Shoot Content</span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary animate-gradient-x">
                        Build Your Funnel
                      </span>
                      <br />
                      <span className="text-foreground text-3xl xl:text-4xl 2xl:text-5xl">And Run Your Ads.</span>
                    </h1>
                    <p className="text-base xl:text-lg text-muted-foreground max-w-xl leading-relaxed">
                      Stop burning money on DIY ads with iPhone photos. We come to your location, shoot <strong>professional content</strong>, build <strong>high-converting funnels</strong>, and run <strong>Meta ad campaigns</strong> that put qualified leads directly in your pipeline.
                    </p>
                  </div>

                  {/* Glassy info card — exact structure from homepage */}
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-white font-bold text-sm font-orbitron">
                        First leads in 7 days. Professional content + done-for-you ads included.
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground pl-2">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">•</span>
                        <span><strong className="text-foreground">Custom ad spend + management fee.</strong> On-site content shoot • Funnel build • Weekly optimization • Monthly strategy call • No long-term contracts</span>
                      </div>
                    </div>
                  </div>

                  {/* Two CTA buttons — exact structure from homepage */}
                  <div className="flex flex-row gap-4">
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <div className="relative flex items-center justify-center gap-2">
                        <Megaphone className="w-5 h-5 text-red-400" />
                        <span>Book Your Strategy Session</span>
                      </div>
                    </button>
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        See How It Works
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>

                  {/* Feature pills — exact structure from homepage */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
                    {['We Shoot the Content', 'We Build the Funnel', 'We Run the Ads', 'Month-to-Month'].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-muted-foreground font-orbitron">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — Visual element + stat cards */}
                <div className="relative space-y-4">
                  {/* Video play mockup — same border/glow treatment as homepage screenshot */}
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
                        <p className="mt-4 text-white/80 text-sm lg:text-base font-medium font-orbitron">
                          Watch: Our Content + Ads Strategy
                        </p>
                        <p className="text-white/40 text-xs mt-1">Real campaigns. Real results.</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                          <Video className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-orbitron">Content + Meta Ads</p>
                          <p className="text-[11px] text-white/60">Full-service done-for-you campaigns</p>
                        </div>
                        <span className="ml-auto px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] font-bold text-green-400">ACTIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Three stat cards — exact structure from homepage */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-green-400 font-orbitron">7</div>
                      <div className="text-xs text-muted-foreground">Days to First Lead</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-primary font-orbitron">3x</div>
                      <div className="text-xs text-muted-foreground">Better Than DIY Ads</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-green-400 font-orbitron">100%</div>
                      <div className="text-xs text-muted-foreground">Done For You</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ─── HERO — MOBILE ─── */}
          <section className="lg:hidden pt-20 pb-5 px-4">
            {/* Stars */}
            <div className="flex items-center justify-center gap-2 mb-[18px]">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-orbitron">
                <span className="text-foreground font-bold">Every campaign</span> is <span className="text-primary font-bold">profitable</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl font-black leading-tight font-orbitron mb-[14px] text-center">
              <span className="text-foreground">We Shoot Content, </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Build Your Funnel</span>
              <br />
              <span className="text-foreground text-xl sm:text-2xl">And Run Your Ads.</span>
            </h1>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-center">
              Stop burning money on DIY ads with iPhone photos. We come to you, shoot <strong>professional content</strong>, build <strong>high-converting funnels</strong>, and run <strong>Meta ad campaigns</strong> that fill your calendar with qualified leads.
            </p>

            {/* Info card */}
            <div className="space-y-2 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-white font-bold text-xs font-orbitron">
                  First leads in 7 days. Professional content + done-for-you ads included.
                </span>
              </div>
              <div className="text-xs text-muted-foreground pl-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span><strong className="text-foreground">Custom ad spend + management fee.</strong> On-site content shoot • Funnel build • Weekly optimization • No long-term contracts</span>
                </div>
              </div>
            </div>

            {/* Video mockup */}
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/20 mb-4 group">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-red-600/30 rounded-xl blur-md opacity-50" />
              <div className="relative z-10 aspect-video bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <button className="group/play relative" onClick={openCalendly}>
                    <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-50 group-hover/play:opacity-80 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-xl">
                      <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </div>
                  </button>
                  <p className="mt-3 text-white/80 text-xs font-orbitron">Watch: Our Content + Ads Strategy</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Video className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-orbitron">Content + Meta Ads</p>
                    <p className="text-[10px] text-white/60">Full-service done-for-you campaigns</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[9px] font-bold text-green-400">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons — mobile */}
            <div className="flex flex-col gap-[10px] mb-3">
              <button
                onClick={openCalendly}
                className="group w-full px-5 py-[14px] rounded-xl bg-red-500/10 backdrop-blur-md border-2 border-red-500/40 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0" />
                <Megaphone className="w-4 h-4 text-red-400 relative z-10" />
                <span className="relative z-10">Book Your Strategy Session</span>
              </button>
              <button
                onClick={openCalendly}
                className="group w-full px-5 py-[14px] rounded-xl bg-white/5 backdrop-blur-md border-2 border-white/20 text-white font-bold text-sm hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  See How It Works
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="font-orbitron">Trusted by local businesses across America</span>
            </div>
          </section>

          {/* ─── WHAT WE DO SECTION ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
              <div className="text-center mb-6">
                <h2 className="font-orbitron font-black text-3xl lg:text-4xl mb-3">
                  <span className="text-foreground">The Complete </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Content & Ads Package</span>
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
                  Everything you need to get qualified leads from paid advertising — without lifting a finger.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Video, title: "On-Site Content Shoots", desc: "We come to your location with professional equipment and capture real footage of your team in action. No stock footage. No iPhone photos." },
                  { icon: Target, title: "Sales Funnel Creation", desc: "Landing pages, lead magnets, and email sequences that turn ad clicks into booked jobs. Every element is tested and optimized." },
                  { icon: Megaphone, title: "Meta Ads Management", desc: "Facebook and Instagram ads optimized for local service businesses — not generic campaigns. We target your exact customer profile." },
                  { icon: Users, title: "Qualified Lead Delivery", desc: "We filter out tire-kickers. You only talk to people who are ready to book. No more wasted calls with people who aren't serious." },
                  { icon: TrendingUp, title: "Weekly Optimization", desc: "We monitor your campaigns daily and optimize weekly. You get a full performance report every month with real numbers." },
                  { icon: Calendar, title: "Content Calendar", desc: "Consistent social presence without you lifting a finger. We plan, create, and schedule content that keeps your brand top-of-mind." },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 group"
                  >
                    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-primary/20 p-5 h-full">
                      <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-3">
                        <feature.icon className="w-5 h-5 text-red-400" />
                      </div>
                      <h3 className="font-orbitron font-bold text-sm text-foreground mb-2">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── AGENCY BANNER — exact structure from homepage ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="relative p-5 lg:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-cyan-500/0 border border-cyan-500/20 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-orbitron text-cyan-400 font-bold uppercase tracking-wider">Full-Service Creative Agency</span>
                </div>
                <h3 className="font-orbitron font-black text-xl lg:text-2xl text-foreground mb-3">
                  We Handle <span className="text-cyan-400">Everything</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-3">
                  We're not a faceless agency that sends you a generic ad template and calls it a day. We come to <strong className="text-foreground">your location</strong>, shoot <strong className="text-foreground">real content</strong>, build your <strong className="text-foreground">complete funnel</strong>, and manage your ads — all under one roof.
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  You're always <strong className="text-foreground">one Telegram message away</strong> from your team. No ticket systems, no waiting 3 days for a reply. Real humans who care about your results.
                </p>
              </div>
            </div>
          </section>

          {/* ─── PRICING SECTION — exact structure from homepage ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-3">
                  <span className="text-foreground">Simple, </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Transparent Pricing</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                  No hidden fees, no long-term contracts. Know exactly what you're investing before we even talk.
                </p>
              </div>

              <div className="relative p-5 lg:p-6 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl border border-white/15">
                <div className="grid lg:grid-cols-2 gap-6 items-center">
                  <div className="text-center lg:text-left space-y-5">
                    <div>
                      <div className="mb-1">
                        <span className="text-4xl lg:text-5xl font-black font-orbitron text-foreground">Custom Quote</span>
                      </div>
                      <p className="text-base text-muted-foreground mb-1">Based on your market, goals, and ad spend</p>
                      <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                        <span className="text-2xl lg:text-3xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">$1,500–$3,000</span>
                        <span className="text-muted-foreground text-base">/mo ad spend</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Ad spend goes directly to Meta — zero markup</p>
                      <p className="text-sm text-primary font-bold mt-3">Book a call and we'll map out your exact investment.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                      <h4 className="font-orbitron font-bold text-xs text-foreground mb-2">What's in the Setup</h4>
                      <ul className="space-y-1.5">
                        {[
                          'On-site professional content shoot',
                          'Ad creative (video + static formats)',
                          'Landing page / sales funnel build',
                          'Audience research & targeting setup',
                          'Meta Ads account configuration',
                          'Tracking & conversion pixel setup',
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="block text-xl font-black font-orbitron text-foreground">7</span>
                        <span className="text-[10px] text-muted-foreground">Days to First Lead</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="block text-xl font-black font-orbitron text-foreground">100%</span>
                        <span className="text-[10px] text-muted-foreground">Done For You</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="block text-xl font-black font-orbitron text-foreground">0</span>
                        <span className="text-[10px] text-muted-foreground">Long-Term Contracts</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <h4 className="font-orbitron font-bold text-sm text-foreground mb-2">What's Included Every Month</h4>
                      <ul className="space-y-1.5">
                        {[
                          'Meta Ads management & optimization',
                          'Weekly campaign performance review',
                          'New ad creative every 4–6 weeks',
                          'Monthly strategy call with your team',
                          'Lead quality monitoring & filtering',
                          'Telegram support — fast responses',
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="font-orbitron font-bold text-xs text-foreground mb-1">How It Works</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        We start with a strategy session to understand your business and ideal customer. Then we come to your location for the content shoot. We build your funnel and launch ads — typically within 2 weeks of signing. You get weekly updates and a monthly report showing exactly what you spent and what you got back.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                      <h4 className="font-orbitron font-bold text-xs text-cyan-400 mb-1">Why Content + Ads Together?</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Most agencies run ads with stock photos or low-quality creative — and wonder why results are poor. <strong className="text-foreground">Professional content is the difference</strong> between a $50 cost-per-lead and a $15 cost-per-lead. We handle both sides so nothing gets lost in translation.
                      </p>
                    </div>

                    <button
                      onClick={openCalendly}
                      className="group w-full px-6 py-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/15 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:bg-white/10 hover:border-white/25 hover:scale-[1.01] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
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

          {/* ─── HOW IT WORKS — exact structure from homepage ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.03] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">How It </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Works</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                  From strategy call to qualified leads in your inbox. Here's exactly what happens.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-0">
                {[
                  {
                    step: '01',
                    title: 'Strategy Session',
                    description: 'We learn your business, ideal customers, and what makes you different. We map out your complete content and ads strategy — no generic playbooks. You see exactly what we\'ll build before we start.',
                    icon: Target,
                    color: 'red',
                  },
                  {
                    step: '02',
                    title: 'On-Site Content Shoot',
                    description: 'Our team comes to your location with professional equipment. We capture real footage of your team, your work, and your results. This is the content that will power your ads — authentic, high-quality, and built to convert.',
                    icon: Video,
                    color: 'red',
                  },
                  {
                    step: '03',
                    title: 'Funnel & Campaign Build',
                    description: 'We build your landing pages, ad creatives, and targeting strategy. Everything is designed to convert — not just to look good. We set up tracking so we know exactly which ads are producing leads.',
                    icon: Megaphone,
                    color: 'red',
                  },
                  {
                    step: '04',
                    title: 'Launch, Optimize & Scale',
                    description: 'Ads go live. We monitor daily, optimize weekly, and report monthly on your ROI. When something works, we scale it. When something doesn\'t, we fix it fast. You always know exactly what\'s happening.',
                    icon: TrendingUp,
                    color: 'red',
                  },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-6 lg:gap-8">
                    <div className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.color === 'cyan' ? 'bg-cyan-500/15 border border-cyan-500/30' :
                        'bg-red-500/15 border border-red-500/30'
                      }`}>
                        <item.icon className={`w-6 h-6 ${
                          item.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'
                        }`} />
                      </div>
                      {i < 3 && (
                        <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-white/20 to-transparent my-2" />
                      )}
                    </div>
                    <div className="pb-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-orbitron text-muted-foreground font-bold">STEP {item.step}</span>
                      </div>
                      <h3 className="font-orbitron font-bold text-lg lg:text-xl text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={openCalendly}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-sm hover:bg-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 font-orbitron"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  Ready to Start? Book Your Free Strategy Call
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>

          {/* ─── FAQ — exact structure from homepage ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">Frequently Asked </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Questions</span>
                </h2>
              </div>

              <div className="space-y-3">
                {faqItems.map((faq, i) => (
                  <details key={i} className="group rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <summary className="flex items-center justify-between p-4 lg:p-5 cursor-pointer list-none select-none hover:bg-white/5 transition-colors">
                      <span className="font-orbitron font-bold text-sm lg:text-base text-foreground pr-4">{faq.q}</span>
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-4 lg:px-5 pb-4 lg:pb-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>

              <div className="text-center mt-8">
                <p className="text-muted-foreground text-sm mb-3">Still have questions?</p>
                <button
                  onClick={openCalendly}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-sm hover:bg-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 font-orbitron"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  Talk to Us
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>

          {/* ─── FINAL CTA — exact structure from homepage ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-red-500/15 via-red-600/10 to-red-500/15 border border-red-500/30 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0" />
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-orbitron mb-3 text-foreground">
                    Ready To Scale With Paid Ads?
                  </h2>
                  <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
                    We take on businesses that are serious about growth — not tire-kickers looking for the cheapest option. If you want qualified leads and a team that operates like yours, let's talk.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <button
                      onClick={openCalendly}
                      className="group relative px-8 py-4 rounded-xl bg-red-500/20 backdrop-blur-md border-2 border-red-500/40 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/30 hover:border-red-500/60 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Megaphone className="w-5 h-5 text-red-400" />
                        Book Your Strategy Session
                      </span>
                    </button>
                    <Link
                      to="/services/seo"
                      className="group px-8 py-4 rounded-xl bg-white/5 backdrop-blur-md border-2 border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] transition-all duration-300 font-orbitron flex items-center justify-center gap-2"
                    >
                      Explore SEO Services
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {['Professional content included', 'No long-term contracts', 'First leads in 7 days', 'Cancel anytime'].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
