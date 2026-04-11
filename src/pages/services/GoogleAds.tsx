import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Search,
  Target,
  TrendingUp,
  Users,
  Zap,
  Play,
  ChevronDown,
  Phone,
  Calendar,
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
    q: "How much should I budget for Google Ads?",
    a: "For local service businesses, we typically recommend $1,000–$3,000/month in ad spend to start. This gives us enough data to optimize quickly and generate consistent leads. We'll provide a custom recommendation based on your market, competition, and goals.",
  },
  {
    q: "What's the difference between Google Ads and Google Guarantee (LSAs)?",
    a: "Google Ads are traditional search ads that appear at the top of Google search results. Google Guarantee (Local Services Ads) are a newer format specifically for service businesses — they appear above traditional ads with a 'Google Guaranteed' badge, which builds trust. We manage both to maximize your visibility.",
  },
  {
    q: "How quickly will I see leads?",
    a: "Most clients see their first leads within 3–7 days of launching. It typically takes 2–4 weeks to fully optimize targeting and keywords for the best cost-per-lead. We provide weekly reports so you always know what's happening.",
  },
  {
    q: "What makes your Google Ads management different?",
    a: "Most agencies run generic campaigns. We build custom landing pages for each ad group, use AI to optimize bids and targeting, and focus obsessively on cost-per-lead and ROI. We only continue working with clients where we're producing positive results.",
  },
  {
    q: "Do you manage Google Guarantee (LSAs)?",
    a: "Yes. Google Guarantee is perfect for service businesses because it builds trust with the Google badge. We manage your LSA account, optimize your profile, respond to leads quickly, and track performance. Many clients run both LSAs and traditional Google Ads for maximum coverage.",
  },
  {
    q: "Can I combine Google Ads with SEO?",
    a: "Absolutely — and we recommend it. Google Ads get you leads immediately; SEO builds your organic pipeline over time. Many of our clients run both for maximum market dominance. Ask about our combined packages.",
  },
  {
    q: "What happens if the ads aren't working?",
    a: "We'll tell you honestly. If we're not producing positive ROI after 4 weeks of optimization, we'll either pivot the strategy or part ways. We only work with clients where we can deliver real results.",
  },
];

const GoogleAds = () => {
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
        <title>Google Ads Management for Local Businesses | Search Ads & LSAs | Rank Me Higher</title>
        <meta
          name="description"
          content="Expert Google Ads management for local service businesses. Search ads, Google Guarantee (LSAs), and custom landing pages that deliver qualified leads. Book your strategy session."
        />
        <meta property="og:title" content="Google Ads Management for Local Businesses | Rank Me Higher" />
        <meta property="og:description" content="Google Ads, Local Services Ads (LSAs), and search marketing that delivers qualified leads for service businesses." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rankmehigher.com/services/google-ads" />
        <meta property="og:site_name" content="Rank Me Higher" />
        <meta property="og:image" content="https://rankmehigher.com/assets/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Google Ads Management | Rank Me Higher" />
        <meta name="twitter:description" content="Google Ads and LSA management for local businesses." />
        <link rel="canonical" href="https://rankmehigher.com/services/google-ads" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Google Ads Management",
          "provider": { "@type": "Organization", "name": "Rank Me Higher", "url": "https://rankmehigher.com" },
          "description": "Expert Google Ads management including search ads, Google Guarantee (Local Services Ads), and custom landing pages for local service businesses.",
          "url": "https://rankmehigher.com/services/google-ads",
          "areaServed": "United States",
          "serviceType": "Google Ads Management & PPC Advertising"
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
            { "@type": "ListItem", "position": 2, "name": "Google Ads", "item": "https://rankmehigher.com/services/google-ads" }
          ]
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Enhanced Ambient Light Overlays */}
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
                      <span className="text-foreground font-bold">Dominate Google search</span> in your market
                    </span>
                  </div>

                  {/* H1 + description */}
                  <div className="space-y-4">
                    <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-black leading-[1.1] font-orbitron tracking-tight">
                      <span className="text-foreground">Google Ads That</span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary animate-gradient-x">
                        Actually Convert
                      </span>
                      <br />
                      <span className="text-foreground text-3xl xl:text-4xl 2xl:text-5xl">Into Qualified Leads</span>
                    </h1>
                    <p className="text-base xl:text-lg text-muted-foreground max-w-xl leading-relaxed">
                      Stop wasting money on poorly managed Google Ads. We build <strong>custom landing pages</strong>, optimize <strong>search campaigns</strong>, manage <strong>Google Guarantee ads</strong>, and deliver <strong>qualified leads</strong> directly to your phone.
                    </p>
                  </div>

                  {/* Glassy info card */}
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-white font-bold text-sm font-orbitron">
                        First leads in 3–7 days. Custom landing pages + done-for-you optimization included.
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground pl-2">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">•</span>
                        <span><strong className="text-foreground">$1,000–$3,000/mo ad spend + management.</strong> Custom landing pages • Keyword research • LSA management • Weekly optimization • Monthly ROI reports • No long-term contracts</span>
                      </div>
                    </div>
                  </div>

                  {/* Two CTA buttons */}
                  <div className="flex flex-row gap-4">
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <div className="relative flex items-center justify-center gap-2">
                        <Search className="w-5 h-5 text-red-400" />
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

                  {/* Feature pills */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
                    {['Search Ads', 'Google Guarantee (LSAs)', 'Custom Landing Pages', 'Month-to-Month'].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-muted-foreground font-orbitron">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — Visual element + stat cards */}
                <div className="relative space-y-4">
                  {/* Google Ads dashboard mockup */}
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
                          Watch: Our Google Ads Strategy
                        </p>
                        <p className="text-white/40 text-xs mt-1">Real campaigns. Real ROI.</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <Search className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-orbitron">Google Ads Management</p>
                          <p className="text-[11px] text-white/60">Search ads + LSA campaigns</p>
                        </div>
                        <span className="ml-auto px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] font-bold text-green-400">ACTIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Three stat cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-green-400 font-orbitron">3–7</div>
                      <div className="text-xs text-muted-foreground">Days to First Lead</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-primary font-orbitron">2–4x</div>
                      <div className="text-xs text-muted-foreground">Better ROI Than DIY</div>
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
                <span className="text-foreground font-bold">Dominate Google</span> search
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl font-black leading-tight font-orbitron mb-[14px] text-center">
              <span className="text-foreground">Google Ads That </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Actually Convert</span>
              <br />
              <span className="text-foreground text-xl sm:text-2xl">Into Qualified Leads</span>
            </h1>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-center">
              Stop wasting money on poorly managed Google Ads. We build <strong>custom landing pages</strong>, optimize <strong>search campaigns</strong>, and deliver <strong>qualified leads</strong> directly to your phone.
            </p>

            {/* Info card */}
            <div className="space-y-2 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-white font-bold text-xs font-orbitron">
                  First leads in 3–7 days. Custom landing pages + done-for-you optimization included.
                </span>
              </div>
              <div className="text-xs text-muted-foreground pl-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span><strong className="text-foreground">$1,000–$3,000/mo ad spend + management.</strong> Custom landing pages • Keyword research • LSA management • Weekly optimization • No long-term contracts</span>
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
                  <p className="mt-3 text-white/80 text-xs font-orbitron">Watch: Our Google Ads Strategy</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-orbitron">Google Ads Management</p>
                    <p className="text-[10px] text-white/60">Search ads + LSA campaigns</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[9px] font-bold text-green-400">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-[10px] mb-3">
              <button
                onClick={openCalendly}
                className="group w-full px-5 py-[14px] rounded-xl bg-red-500/10 backdrop-blur-md border-2 border-red-500/40 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0" />
                <Search className="w-4 h-4 text-red-400 relative z-10" />
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Google Ads Package</span>
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
                  Everything you need to dominate Google search and get qualified leads — without lifting a finger.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Search, title: "Search Ads Management", desc: "We research keywords, write compelling ad copy, and optimize bids to maximize ROI. Every dollar is tracked and optimized." },
                  { icon: Target, title: "Google Guarantee (LSAs)", desc: "Local Services Ads with the Google Guaranteed badge build trust instantly. We manage your profile, respond to leads, and track performance." },
                  { icon: TrendingUp, title: "Custom Landing Pages", desc: "Generic landing pages don't convert. We build custom pages for each ad group, optimized for your specific offer and audience." },
                  { icon: Users, title: "Audience Targeting", desc: "We target your exact customer profile by location, search intent, and behavior. No wasted clicks on unqualified traffic." },
                  { icon: Zap, title: "Weekly Optimization", desc: "We monitor your campaigns daily and optimize weekly. Pausing underperformers, scaling winners, and testing new keywords constantly." },
                  { icon: Calendar, title: "Monthly Strategy Calls", desc: "You get a dedicated account manager who reviews your performance, explains the numbers, and plans next month's strategy." },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 group"
                  >
                    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-primary/20 p-5 h-full">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-3">
                        <feature.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="font-orbitron font-bold text-sm text-foreground mb-2">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── AGENCY BANNER ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="relative p-5 lg:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-cyan-500/0 border border-cyan-500/20 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-orbitron text-cyan-400 font-bold uppercase tracking-wider">Full-Service PPC Agency</span>
                </div>
                <h3 className="font-orbitron font-black text-xl lg:text-2xl text-foreground mb-3">
                  Google Ads + SEO = <span className="text-cyan-400">Market Dominance</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-3">
                  Google Ads get you leads <strong className="text-foreground">immediately</strong>. SEO builds your organic pipeline <strong className="text-foreground">over time</strong>. Together, they dominate your market. We manage both so nothing gets lost in translation.
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  You're always <strong className="text-foreground">one Telegram message away</strong> from your team. Real humans who care about your results, not a faceless support ticket system.
                </p>
              </div>
            </div>
          </section>

          {/* ─── PRICING SECTION ─── */}
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
                      <p className="text-base text-muted-foreground mb-1">Based on your market, competition, and goals</p>
                      <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                        <span className="text-2xl lg:text-3xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">$1,000–$3,000</span>
                        <span className="text-muted-foreground text-base">/mo ad spend</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Ad spend goes directly to Google — zero markup</p>
                      <p className="text-sm text-primary font-bold mt-3">Book a call and we'll map out your exact investment.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                      <h4 className="font-orbitron font-bold text-xs text-foreground mb-2">What's in the Setup</h4>
                      <ul className="space-y-1.5">
                        {[
                          'Keyword research & strategy',
                          'Ad copy writing (search ads)',
                          'Custom landing page build',
                          'Google Guarantee (LSA) setup',
                          'Conversion tracking & pixels',
                          'Bid strategy configuration',
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
                        <span className="block text-xl font-black font-orbitron text-foreground">3–7</span>
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
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                      <h4 className="font-orbitron font-bold text-sm text-foreground mb-2">What's Included Every Month</h4>
                      <ul className="space-y-1.5">
                        {[
                          'Google Ads account management',
                          'Keyword optimization & testing',
                          'Ad copy refresh & A/B testing',
                          'Google Guarantee (LSA) management',
                          'Weekly campaign performance review',
                          'Monthly strategy call with your team',
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="font-orbitron font-bold text-xs text-foreground mb-1">How It Works</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        We start with a strategy session to understand your business, competition, and goals. We research keywords, build custom landing pages, and launch your campaigns. You get weekly updates and a monthly report showing exactly what you spent and what you got back.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                      <h4 className="font-orbitron font-bold text-xs text-cyan-400 mb-1">Why Google Ads + SEO Together?</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Google Ads get you leads today. SEO builds your organic pipeline for tomorrow. <strong className="text-foreground">Together, you dominate</strong> — paid traffic + organic traffic = unstoppable growth. We manage both.
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

          {/* ─── HOW IT WORKS ─── */}
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
                    title: 'Strategy & Research',
                    description: 'We analyze your market, research keywords, study your competitors, and map out your complete Google Ads strategy. You see exactly what we\'ll build before we start.',
                    icon: Target,
                  },
                  {
                    step: '02',
                    title: 'Campaign Build & Setup',
                    description: 'We build custom landing pages, write compelling ad copy, set up conversion tracking, and configure your Google Ads account. Everything is tested and ready to go.',
                    icon: Search,
                  },
                  {
                    step: '03',
                    title: 'Launch & Optimization',
                    description: 'Ads go live. We monitor daily, optimize bids and keywords weekly, and test new variations constantly. You get a weekly performance report.',
                    icon: TrendingUp,
                  },
                  {
                    step: '04',
                    title: 'Scale & Refine',
                    description: 'When something works, we scale it. When something doesn\'t, we fix it fast. Monthly strategy calls keep you informed and aligned on next steps.',
                    icon: Zap,
                  },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-6 lg:gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-blue-500/15 border border-blue-500/30">
                        <item.icon className="w-6 h-6 text-blue-400" />
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

          {/* ─── FAQ ─── */}
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

          {/* ─── FINAL CTA ─── */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-red-500/15 via-red-600/10 to-red-500/15 border border-red-500/30 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0" />
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-orbitron mb-3 text-foreground">
                    Ready To Dominate Google Search?
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
                        <Search className="w-5 h-5 text-red-400" />
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
                    {['Search Ads + LSAs', 'No long-term contracts', 'First leads in 3–7 days', 'Cancel anytime'].map((item) => (
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

export default GoogleAds;
