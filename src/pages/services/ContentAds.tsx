import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, CheckCircle2, ChevronDown, Megaphone, Target, Video, TrendingUp, Users, Flame, Calendar, DollarSign, BarChart3, Zap, Shield, Eye, Play, Phone, AlertTriangle, X, Check, Sparkles } from "lucide-react";
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

const ContentAds = () => {
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
        <title>Short-Form Ads & Meta Ad Campaigns | Content That Converts | Rank Me Higher</title>
        <meta
          name="description"
          content="We create killer short-form video ads and run profitable Meta campaigns. Every single one of our agency campaigns is profitable. We choose who we work with."
        />
      </Helmet>

      <main className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* HERO SECTION - Desktop */}
          <section className="hidden lg:flex min-h-[calc(100vh-80px)] items-center pt-28 pb-8">
            <div className="container mx-auto px-8 max-w-7xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-5 text-left">
                  <div className="flex items-center gap-2 animate-fade-in">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground font-orbitron">
                      <span className="text-foreground font-bold">100% Campaign Profitability</span> — Every. Single. One.
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-black leading-[1.1] font-orbitron tracking-tight">
                      <span className="text-foreground">We Create</span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary animate-gradient-x">
                        Killer Short-Form Ads
                      </span>
                      <br />
                      <span className="text-foreground text-3xl xl:text-4xl 2xl:text-5xl">& Run Profitable Meta Campaigns.</span>
                    </h1>
                    <p className="text-base xl:text-lg text-muted-foreground max-w-xl leading-relaxed">
                      We don't just run ads — we <strong>create scroll-stopping short-form video content</strong> and build <strong>high-ROI Meta ad campaigns</strong> that print money. Every single campaign we manage is profitable. We're selective about who we work with because our reputation depends on results.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                      <Flame className="w-5 h-5 text-red-400" />
                      <span className="text-white font-bold text-sm font-orbitron">
                        We choose who we work with. Not the other way around.
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground pl-2">
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">•</span>
                        <span><strong className="text-foreground">Short-form video ads + Meta campaign management.</strong> We create the content, run the ads, and deliver qualified leads. You focus on closing.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row gap-4">
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <div className="relative flex items-center justify-center gap-2">
                        <Megaphone className="w-5 h-5 text-red-400" />
                        <span>Apply to Work With Us</span>
                      </div>
                    </button>
                    <button
                      onClick={openCalendly}
                      className="group relative px-7 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        See Our Results
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
                    {['100% Profitable Campaigns', 'Short-Form Video', 'Meta Ads', 'Selective Clients'].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-muted-foreground font-orbitron">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT SIDE — Stats + Visual */}
                <div className="relative space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-primary/40 to-red-600/40 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-red-600/30 rounded-2xl blur-lg opacity-60" />
                    <div className="relative z-10 aspect-video bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                      <div className="text-center space-y-4 p-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs font-orbitron text-green-400 font-bold">ALL CAMPAIGNS PROFITABLE</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-6xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">100%</p>
                          <p className="text-sm text-muted-foreground font-orbitron">Campaign Profitability Rate</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-4">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xl font-black font-orbitron text-red-400">3-8x</p>
                            <p className="text-[10px] text-muted-foreground">Avg ROAS</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xl font-black font-orbitron text-cyan-400">$8-25</p>
                            <p className="text-[10px] text-muted-foreground">Cost Per Lead</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xl font-black font-orbitron text-green-400">0</p>
                            <p className="text-[10px] text-muted-foreground">Unprofitable</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-red-400 font-orbitron"><Video className="w-6 h-6 mx-auto" /></div>
                      <div className="text-xs text-muted-foreground mt-1">Short-Form Ads</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-cyan-400 font-orbitron"><Target className="w-6 h-6 mx-auto" /></div>
                      <div className="text-xs text-muted-foreground mt-1">Meta Campaigns</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-2xl font-bold text-green-400 font-orbitron"><DollarSign className="w-6 h-6 mx-auto" /></div>
                      <div className="text-xs text-muted-foreground mt-1">Profitable Results</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MOBILE HERO */}
          <section className="lg:hidden pt-20 pb-5 px-4">
            <div className="flex items-center justify-center gap-2 mb-[18px]">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-orbitron">
                <span className="text-foreground font-bold">100% Profitable</span> — Every Campaign
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black leading-tight font-orbitron mb-[14px] text-center">
              <span className="text-foreground">We Create </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Killer Short-Form Ads</span>
              <br />
              <span className="text-foreground text-xl sm:text-2xl">& Run Profitable Meta Campaigns.</span>
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-center">
              We don't just run ads — we <strong>create scroll-stopping short-form video content</strong> and build <strong>high-ROI Meta ad campaigns</strong> that print money. We're selective about who we work with.
            </p>

            <div className="space-y-2 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <Flame className="w-4 h-4 text-red-400" />
                <span className="text-white font-bold text-xs font-orbitron">
                  We choose who we work with. Not the other way around.
                </span>
              </div>
            </div>

            {/* Stats Card - Mobile */}
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/20 mb-5">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-red-600/30 rounded-xl blur-md opacity-50" />
              <div className="relative z-10 bg-gradient-to-br from-black via-gray-900 to-black p-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-orbitron text-green-400 font-bold">ALL CAMPAIGNS PROFITABLE</span>
                </div>
                <p className="text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">100%</p>
                <p className="text-xs text-muted-foreground font-orbitron mt-1">Campaign Profitability Rate</p>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-lg font-black font-orbitron text-red-400">3-8x</p>
                    <p className="text-[9px] text-muted-foreground">Avg ROAS</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-lg font-black font-orbitron text-cyan-400">$8-25</p>
                    <p className="text-[9px] text-muted-foreground">Cost/Lead</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-lg font-black font-orbitron text-green-400">0</p>
                    <p className="text-[9px] text-muted-foreground">Unprofitable</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[10px] mb-3">
              <button
                onClick={openCalendly}
                className="group w-full px-5 py-[14px] rounded-xl bg-red-500/10 backdrop-blur-md border-2 border-red-500/40 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0" />
                <Megaphone className="w-4 h-4 text-red-400 relative z-10" />
                <span className="relative z-10">Apply to Work With Us</span>
              </button>
              <button
                onClick={openCalendly}
                className="group w-full px-5 py-[14px] rounded-xl bg-white/5 backdrop-blur-md border-2 border-white/20 text-white font-bold text-sm hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] transition-all duration-300 font-orbitron flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  See Our Results
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="font-orbitron">Selective — we only take profitable clients</span>
            </div>
          </section>

          {/* AD EXAMPLES SHOWCASE PLACEHOLDER */}
          <section className="pt-4 pb-2 lg:pt-6 lg:pb-4 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
              <div className="text-center mb-6">
                <h2 className="font-orbitron font-black text-3xl lg:text-4xl mb-3">
                  <span className="text-foreground">Our</span>{' '}
                  <span className="text-primary">Ad Creative</span>
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
                  Scroll-stopping short-form videos that turn viewers into buyers. Examples coming soon.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              <div className="overflow-hidden">
                <div className="flex gap-4 animate-scroll-left hover:[animation-play-state:paused]">
                  {[
                    { title: "Before/After Reveal", type: "Reels Ad", result: "3.2x ROAS" },
                    { title: "Customer Testimonial", type: "Story Ad", result: "5.1x ROAS" },
                    { title: "Process Breakdown", type: "Reels Ad", result: "4.7x ROAS" },
                    { title: "Offer Announcement", type: "Feed Ad", result: "2.8x ROAS" },
                    { title: "Team Behind the Scenes", type: "Story Ad", result: "6.3x ROAS" },
                    { title: "Quick Tip Series", type: "Reels Ad", result: "3.9x ROAS" },
                    { title: "Before/After Reveal", type: "Reels Ad", result: "3.2x ROAS" },
                    { title: "Customer Testimonial", type: "Story Ad", result: "5.1x ROAS" },
                    { title: "Process Breakdown", type: "Reels Ad", result: "4.7x ROAS" },
                    { title: "Offer Announcement", type: "Feed Ad", result: "2.8x ROAS" },
                    { title: "Team Behind the Scenes", type: "Story Ad", result: "6.3x ROAS" },
                    { title: "Quick Tip Series", type: "Reels Ad", result: "3.9x ROAS" },
                  ].map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-[220px] md:w-[260px] group">
                      <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-primary/20">
                        <div className="relative overflow-hidden aspect-[9/16] bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                          <div className="text-center space-y-3">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
                              <Play className="w-6 h-6 text-red-400 ml-0.5" fill="currentColor" />
                            </div>
                            <p className="text-xs text-muted-foreground font-orbitron">{item.type}</p>
                          </div>
                        </div>
                        <div className="px-3 py-2.5 flex items-center justify-between">
                          <div>
                            <h4 className="font-orbitron font-bold text-xs text-foreground">{item.title}</h4>
                            <p className="text-[10px] text-muted-foreground">{item.type}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400">{item.result}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* WHY WE'RE SELECTIVE SECTION */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="relative p-5 lg:p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-500/0 border border-red-500/20 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-3">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span className="text-[10px] font-orbitron text-red-400 font-bold uppercase tracking-wider">Our Standard</span>
                </div>
                <h3 className="font-orbitron font-black text-xl lg:text-2xl text-foreground mb-3">
                  We Don't Take <span className="text-primary">Everyone</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-3">
                  Every single campaign we run is profitable. That's not an accident — it's because we're <strong className="text-foreground">extremely selective</strong> about who we work with. We study your business, your market, and your competition before we agree to take you on. If we don't believe we can deliver a positive ROI, we'll tell you upfront.
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Our reputation is built on <strong className="text-foreground">results, not client count</strong>. We'd rather have 10 profitable clients than 100 break-even ones. That's why we choose who we work with — not the other way around.
                </p>
              </div>
            </div>
          </section>

          {/* WHAT WE DO — COMPARISON */}
          <section className="py-2 lg:py-3 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-orbitron text-red-400 font-bold">Reality Check</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">Are Your Ads</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">Burning Your Money?</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                  If you're boosting posts, using stock photos in ads, or working with an agency that "manages" your campaigns with generic templates — you're leaving money on the table. Or worse, throwing it away.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-12 items-stretch">
                <div className="relative group flex flex-col">
                  <div className="absolute -top-3 left-6 z-10 px-4 py-1.5 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-400 text-xs font-orbitron font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    Generic Agency Ads
                  </div>
                  <div className="p-6 rounded-2xl bg-red-500/5 border-2 border-red-500/30 relative overflow-hidden flex flex-col flex-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
                    <div className="space-y-1.5 flex-1 mt-4">
                      {[
                        "Stock photos that scream 'fake'",
                        "Boosted posts with zero strategy",
                        "No custom video — just images and text",
                        "Broad targeting that wastes budget",
                        "No follow-up system for leads",
                        "Monthly reports but no real results",
                        "You're one of 50+ clients they barely touch"
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-red-400" />
                        <span className="font-orbitron text-xs font-bold text-red-400">Typical Result</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-orbitron font-black text-red-400">0.8x</span>
                        <span className="text-xs text-red-400/70 mb-1">ROAS (Losing Money)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group flex flex-col">
                  <div className="absolute -top-3 left-6 z-10 px-4 py-1.5 rounded-full bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/30 text-cyan-400 text-xs font-orbitron font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    Rank Me Higher Ads
                  </div>
                  <div className="p-6 rounded-2xl bg-cyan-500/5 border-2 border-cyan-500/30 relative overflow-hidden flex flex-col flex-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
                    <div className="space-y-1.5 flex-1 mt-4">
                      {[
                        "Custom short-form video ads that stop the scroll",
                        "Data-driven Meta campaigns with proven structure",
                        "Professional video content shot for your brand",
                        "Laser-targeted audiences based on real data",
                        "Full lead follow-up funnels & automations",
                        "Weekly optimization — we're in the account daily",
                        "Selective roster — your campaign gets real attention"
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span className="font-orbitron text-xs font-bold text-cyan-400">Our Average Result</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-orbitron font-black text-cyan-400">3-8x</span>
                        <span className="text-xs text-cyan-400/70 mb-1">ROAS (Profitable)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-12">
                {[
                  {
                    icon: Video,
                    stat: "100%",
                    label: "Custom Video",
                    desc: "Every ad is shot specifically for your brand — no stock footage, no templates"
                  },
                  {
                    icon: Target,
                    stat: "100%",
                    label: "Campaign Profitability",
                    desc: "Every single campaign we've ever managed has been profitable. Zero exceptions."
                  },
                  {
                    icon: Users,
                    stat: "Selective",
                    label: "Client Roster",
                    desc: "We don't work with everyone. We vet businesses to ensure we can deliver results."
                  }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                    <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-orbitron font-black text-primary mb-1">{item.stat}</div>
                    <div className="font-orbitron font-bold text-sm text-foreground mb-1">{item.label}</div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* WHAT'S INCLUDED */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-3">
                  <span className="text-foreground">What You </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Get</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                  A complete content and ads machine — from video creation to qualified leads in your pipeline.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Video, title: "Short-Form Video Ads", desc: "We create scroll-stopping 15-60 second video ads optimized for Reels, Stories, and Feed. Hooks that grab attention in the first 0.5 seconds." },
                  { icon: Target, title: "Meta Campaign Management", desc: "Full Facebook & Instagram ad management. Campaign structure, audience targeting, budget optimization, and daily monitoring." },
                  { icon: Sparkles, title: "Ad Creative Strategy", desc: "We don't guess — we test. Multiple ad variations, A/B testing hooks, copy, and visuals to find what prints money for your business." },
                  { icon: BarChart3, title: "Performance Dashboards", desc: "Real-time access to your campaign data. See exactly what you're spending, what you're getting, and your cost per lead." },
                  { icon: Users, title: "Qualified Lead Delivery", desc: "We filter out tire-kickers. Our funnels qualify leads before they reach you so you only talk to people ready to buy." },
                  { icon: Zap, title: "Follow-Up Automations", desc: "SMS and email follow-up sequences that nurture leads automatically. No lead falls through the cracks." },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center mb-3">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-orbitron font-bold text-sm text-foreground mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.03] to-transparent" />
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl font-black leading-tight font-orbitron mb-4">
                  <span className="text-foreground">How It </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">Works</span>
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                  From application to profitable campaigns — here's exactly what happens.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-0">
                {[
                  {
                    step: '01',
                    title: 'Application & Vetting',
                    description: 'You apply to work with us. We review your business, market, and competition. If we believe we can deliver a strong ROI, we move forward. If not, we\'ll tell you honestly.',
                    icon: Shield,
                    color: 'red',
                  },
                  {
                    step: '02',
                    title: 'Strategy & Content Creation',
                    description: 'We build your ad strategy — hooks, angles, audiences, and funnels. Then we create killer short-form video ads designed to stop the scroll and drive action.',
                    icon: Video,
                    color: 'red',
                  },
                  {
                    step: '03',
                    title: 'Launch & Optimize',
                    description: 'Campaigns go live on Meta. We monitor daily, test new creatives weekly, and optimize targeting continuously. You see every dollar spent and every lead generated.',
                    icon: Target,
                    color: 'red',
                  },
                  {
                    step: '04',
                    title: 'Scale What Works',
                    description: 'Once we find winning ads, we scale aggressively. More budget on winners, kill losers fast. The goal is simple — maximum qualified leads at the lowest cost.',
                    icon: TrendingUp,
                    color: 'cyan',
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
                  Ready? Apply for a Strategy Call
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
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
                {[
                  {
                    q: 'Why do you say you\'re selective about clients?',
                    a: 'Because our 100% profitability record matters to us. We don\'t take on businesses where we can\'t deliver results. Before we agree to work together, we study your market, competition, and offer. If the math doesn\'t work, we\'ll be honest about it. We\'d rather say no than deliver a bad result.',
                  },
                  {
                    q: 'What kind of video content do you create?',
                    a: 'Short-form video ads — 15 to 60 seconds — optimized for Instagram Reels, Stories, and Facebook Feed. We focus on strong hooks in the first 0.5 seconds, authentic visuals, and clear calls to action. Before/after reveals, testimonials, process breakdowns, and offer announcements.',
                  },
                  {
                    q: 'How much ad spend do I need?',
                    a: 'We typically recommend $1,500-$5,000/month in Meta ad spend for local service businesses. This gives us enough budget to test, optimize, and scale. We\'ll give you a custom recommendation based on your market and goals during our strategy session.',
                  },
                  {
                    q: 'What\'s the difference between boosted posts and what you do?',
                    a: 'Boosted posts are throwing money at the wall. We build complete campaign structures — custom audiences, lookalike targeting, retargeting funnels, multiple ad creatives, landing pages, and follow-up automations. It\'s a machine, not a prayer.',
                  },
                  {
                    q: 'How quickly will I see results?',
                    a: 'Most clients see their first qualified leads within the first 7 days of campaigns going live. It takes 2-4 weeks to fully optimize and get to a predictable cost-per-lead. We provide weekly updates so you always know exactly what\'s happening.',
                  },
                  {
                    q: 'Do you guarantee results?',
                    a: 'We guarantee our work ethic, expertise, and commitment. Our 100% campaign profitability record speaks for itself. That said — we only take on clients where we genuinely believe we can deliver. If we accept you, it\'s because we\'re confident we can make you money.',
                  },
                  {
                    q: 'Can you work with my existing website?',
                    a: 'Yes. Our ad campaigns drive traffic to optimized landing pages we build specifically for your offers. If your website needs work, we can also build you a custom-coded website through our web development service. But the ads work independently.',
                  },
                  {
                    q: 'What industries do you work with?',
                    a: 'We specialize in local service businesses — contractors, auto shops, cleaning companies, med spas, dental practices, and similar. If your business relies on local customers and you can handle more leads, we want to talk.',
                  },
                ].map((faq, i) => (
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

          {/* FINAL CTA */}
          <section className="py-4 lg:py-6 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
              <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-red-500/15 via-red-600/10 to-red-500/15 border border-red-500/30 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0" />
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-orbitron mb-3 text-foreground">
                    Ready to Run Ads That Actually Make Money?
                  </h2>
                  <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
                    We're not for everyone — and that's by design. If you're a local business serious about growth and ready to invest in real ad campaigns, apply to work with us.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <button
                      onClick={openCalendly}
                      className="group relative px-8 py-4 rounded-xl bg-red-500/20 backdrop-blur-md border-2 border-red-500/40 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/30 hover:border-red-500/60 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Megaphone className="w-5 h-5 text-red-400" />
                        Apply for a Strategy Session
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {['100% Profitable Campaigns', 'Short-Form Video', 'Selective Roster', 'Real Results Only'].map((item) => (
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
