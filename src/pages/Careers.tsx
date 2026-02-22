import { Helmet } from "react-helmet-async";
import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Briefcase, Code2, TrendingUp, Video, Users, 
  ArrowRight, X, Send, CheckCircle2, MapPin, Clock,
  BarChart3, Mail, ChevronLeft, ChevronRight, Zap
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Position {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  icon: any;
  color: 'red' | 'cyan';
  description: string;
  shortDescription: string;
  salary?: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
}

const positions: Position[] = [
  {
    id: "media-buyer",
    title: "Media Buyer (Meta)",
    department: "Marketing",
    type: "Contract / Full-time",
    location: "Remote",
    icon: TrendingUp,
    color: "cyan",
    shortDescription: "Run Meta ad campaigns that generate real leads for local businesses.",
    description: "Run paid ad campaigns on Meta that drive real results for local businesses. You'll manage budgets, build audiences, create winning ad strategies, and scale campaigns that generate leads and revenue.",
    responsibilities: [
      "Plan, launch, and optimize Meta (Facebook & Instagram) ad campaigns",
      "Manage client ad budgets and maximize ROI",
      "Build custom and lookalike audiences for local businesses",
      "Analyze campaign performance and provide weekly reports",
      "A/B test creatives, audiences, copy, and landing pages",
    ],
    requirements: [
      "2+ years managing Meta Ads campaigns",
      "Deep experience with Meta Ads Manager and Business Suite",
      "Strong analytical skills — you love data and ROAS",
      "Experience with local business advertising is a big plus",
      "Track record of profitable campaigns with proof",
    ],
    perks: [
      "Competitive pay + performance bonuses",
      "Remote work with flexible schedule",
      "Access to premium ad tools and resources",
      "Direct impact on client growth",
    ],
  },
  {
    id: "video-editor",
    title: "Video Editor",
    department: "Creative",
    type: "Contract / Part-time",
    location: "Remote",
    icon: Video,
    color: "red",
    shortDescription: "Edit short-form reels, VSLs, and long-form content that converts.",
    description: "Create scroll-stopping video content across all formats. From short-form social reels to high-converting VSLs and polished long-form videos — you'll bring ideas to life through editing that drives results.",
    responsibilities: [
      "Edit short-form video content for social media (Reels, TikTok, Shorts)",
      "Produce high-converting Video Sales Letters (VSLs)",
      "Edit long-form content (interviews, case studies, webinars)",
      "Design motion graphics, text animations, and visual effects",
      "Maintain brand consistency across all video content",
    ],
    requirements: [
      "Proficiency in Premiere Pro, Final Cut, or DaVinci Resolve",
      "Strong portfolio showing short-form, VSL, and long-form edits",
      "Understanding of social media trends, pacing, and hooks",
      "Experience with motion graphics (After Effects) is a plus",
      "Quick turnaround — we move fast",
    ],
    perks: [
      "Creative freedom on projects",
      "Remote with flexible deadlines",
      "Work with a variety of industries and brands",
      "Portfolio-building opportunities",
    ],
  },
  {
    id: "automation-specialist",
    title: "Junior Automation Specialist",
    department: "Software Engineers",
    type: "Contract / Full-time",
    location: "Remote",
    icon: Code2,
    color: "cyan",
    shortDescription: "Build powerful automations with N8N and GoHighLevel that scale operations.",
    salary: "80,000 PKR/month (~$285 USD | ~\u20B116,000 PHP)",
    description: "Design and maintain automation workflows using N8N and GoHighLevel. You'll connect APIs, automate client onboarding, build smart follow-up sequences, and create systems that save the team hundreds of hours.",
    responsibilities: [
      "Design and build automation workflows in N8N and GoHighLevel",
      "Integrate third-party APIs (CRMs, email, SMS, payment platforms)",
      "Build automated client onboarding and follow-up sequences in GHL",
      "Troubleshoot and optimize existing automations for reliability",
      "Document workflows and create reusable templates",
    ],
    requirements: [
      "Experience with N8N, GoHighLevel, and vibe coding tools",
      "We mainly use Replit and Claude Code",
      "You may encounter tools like Vapi, Twilio, etc. depending on the project",
      "Strong understanding of APIs, webhooks, and data flows",
      "Problem-solving mindset — you figure things out",
    ],
    perks: [
      "Schedule: 9 AM \u2013 4 PM CT, Monday \u2013 Friday",
      "Performance bonuses + room to grow",
      "Fully remote — work from anywhere",
    ],
  },
  {
    id: "video-content-manager",
    title: "Video Content Manager",
    department: "Creative",
    type: "Full-time",
    location: "Remote",
    icon: Users,
    color: "red",
    shortDescription: "Manage video shoots, turnaround times, and content delivery pipeline.",
    description: "Own the video content pipeline from start to finish. You'll manage and schedule video shoots, coordinate with editors and clients, ensure turnaround times are met, and make sure every piece of content is delivered on time and on brand.",
    responsibilities: [
      "Plan and schedule video shoots with clients and crew",
      "Manage the content production calendar and deadlines",
      "Coordinate between videographers, editors, and the creative team",
      "Ensure turnaround times are met and deliverables are on schedule",
      "Quality-check all final content before delivery to clients",
    ],
    requirements: [
      "2+ years in content production or project management",
      "Experience managing video production workflows",
      "Excellent organizational and communication skills",
      "Ability to manage multiple projects and deadlines simultaneously",
      "Understanding of social media content formats and trends",
    ],
    perks: [
      "Key leadership role in the creative department",
      "Fully remote with flexible hours",
      "Direct collaboration with agency founder",
      "Room to grow into a senior creative role",
    ],
  },
  {
    id: "local-seo-specialist",
    title: "Local SEO Specialist",
    department: "Marketing",
    type: "Full-time",
    location: "Remote",
    icon: BarChart3,
    color: "cyan",
    shortDescription: "Dominate the Map Pack — GBP optimization, citations, and local rankings.",
    description: "Help local businesses dominate their market. You'll optimize Google Business Profiles, build local citations, manage reviews, and get our clients into the Map Pack — where the real leads come from.",
    responsibilities: [
      "Optimize and manage Google Business Profiles for maximum visibility",
      "Build and audit local citations across directories",
      "Implement review generation and reputation management strategies",
      "Perform local keyword research and competitor analysis",
      "Track local rankings and provide monthly performance reports",
    ],
    requirements: [
      "2+ years of local SEO experience",
      "Deep understanding of Google Map Pack ranking factors",
      "Experience with GBP optimization and local citation building",
      "Familiarity with tools like BrightLocal, Whitespark, or Moz Local",
      "Data-driven with strong analytical skills",
    ],
    perks: [
      "Work on real local businesses and see direct impact",
      "Remote with flexible schedule",
      "Access to premium local SEO tools",
      "Performance-based bonuses",
    ],
  },
];

const departments = ["All", ...Array.from(new Set(positions.map(p => p.department)))];

const Careers = () => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeDept, setActiveDept] = useState("All");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
    experience: "",
    why: "",
  });

  const filteredPositions = activeDept === "All" ? positions : positions.filter(p => p.department === activeDept);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isPaused) return;

    let lastTime = 0;
    const normalSpeed = 0.5;
    const slowSpeed = 0.12;
    let currentSpeed = normalSpeed;

    const step = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      const targetSpeed = isHovered ? slowSpeed : normalSpeed;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      el.scrollLeft += currentSpeed * (delta / 16);

      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, isHovered]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition) return;

    setIsSubmitting(true);

    try {
      const telegramMessage = `\u{1F4CB} <b>New Job Application</b>\n\n<b>Position:</b> ${selectedPosition.title}\n<b>Department:</b> ${selectedPosition.department}\n\n<b>Name:</b> ${formData.name}\n<b>Email:</b> ${formData.email}\n<b>Phone:</b> ${formData.phone || "Not provided"}\n<b>Portfolio:</b> ${formData.portfolio || "Not provided"}\n\n<b>Experience:</b>\n${formData.experience}\n\n<b>Why RMH:</b>\n${formData.why}`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ava-notify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: telegramMessage,
            type: "career_application",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setSubmitted(true);
      toast({
        title: "Application Received!",
        description: `Thanks for applying for ${selectedPosition.title}. We'll review and get back to you soon.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedPosition(null);
    setShowForm(false);
    setSubmitted(false);
    setFormData({ name: "", email: "", phone: "", portfolio: "", experience: "", why: "" });
  };

  const colorMap = (color: 'red' | 'cyan') => color === "cyan"
    ? { bg: "bg-cyan-500/5", border: "border-cyan-500/20", hover: "hover:border-cyan-400/50", icon: "text-cyan-400", iconBg: "bg-cyan-500/15", tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", glow: "shadow-cyan-500/10" }
    : { bg: "bg-red-500/5", border: "border-red-500/20", hover: "hover:border-red-500/40", icon: "text-red-400", iconBg: "bg-red-500/15", tag: "bg-red-500/10 text-red-400 border-red-500/20", glow: "shadow-red-500/10" };

  return (
    <>
      <Helmet>
        <title>Careers | Rank Me Higher</title>
        <meta name="description" content="Join the Rank Me Higher team. We're hiring talented people in automation, marketing, design, and development. Remote positions available." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar />

        {/* Compact Hero */}
        <section className="pt-24 pb-6 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
            <div className="absolute top-10 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-2">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-3">
                  <Zap className="w-3 h-3 text-red-400" />
                  <span className="text-[10px] font-orbitron text-red-400 font-bold tracking-wider">{positions.length} OPEN POSITIONS</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black leading-tight font-orbitron">
                  <span className="text-foreground">Join </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">Our Team</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Remote-first. AI-powered. Building the future of local business marketing.
                </p>
              </div>
              <a
                href="mailto:seo@rankmehigher.com?subject=General Application - Rank Me Higher"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-white/20 transition-all shrink-0"
              >
                <Mail className="w-4 h-4" />
                Don't see your role? Reach out
              </a>
            </div>
          </div>
        </section>

        {/* Featured Positions — Auto-Scrolling Carousel */}
        <section className="pb-4 relative">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-orbitron font-bold tracking-widest text-muted-foreground uppercase">Featured Roles</h2>
                <button
                  onClick={togglePause}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
                    isPaused
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-red-400" : "bg-cyan-400 animate-pulse"}`} />
                  {isPaused ? "PAUSED" : "LIVE"}
                </button>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => scroll("left")} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => scroll("right")} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            onClick={togglePause}
            className={`flex gap-3 overflow-x-auto pb-4 px-4 lg:px-8 cursor-pointer select-none ${isPaused ? "ring-1 ring-red-500/20 ring-inset" : ""}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="shrink-0 w-[max(0px,calc((100vw-72rem)/2+0.5rem))]" />
            {[...positions, ...positions].map((position, idx) => {
              const c = colorMap(position.color);
              return (
                <div
                  key={`${position.id}-${idx}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedPosition(position); }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`group shrink-0 w-[280px] text-left p-4 rounded-xl backdrop-blur-md border transition-all duration-300 cursor-pointer ${c.bg} ${c.border} ${c.hover} hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(255,255,255,0.04)]`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center`}>
                      <position.icon className={`w-4 h-4 ${c.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate">{position.title}</h3>
                      <p className="text-[11px] text-muted-foreground">{position.department}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{position.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${c.tag}`}>
                        <Clock className="w-2.5 h-2.5" /> {position.type.split(" / ")[0]}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${c.tag}`}>
                        <MapPin className="w-2.5 h-2.5" /> {position.location}
                      </span>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${c.icon} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
                  </div>
                </div>
              );
            })}
            <div className="shrink-0 w-4" />
          </div>
        </section>

        {/* Department Filter + Grid */}
        <section className="py-6 relative">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border transition-all duration-200 ${
                    activeDept === dept
                      ? "bg-red-500/15 border-red-500/40 text-red-400"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                  }`}
                >
                  {dept}
                  {dept !== "All" && (
                    <span className="ml-1.5 text-[10px] opacity-60">
                      {positions.filter(p => p.department === dept).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPositions.map((position) => {
                const c = colorMap(position.color);
                return (
                  <button
                    key={position.id}
                    onClick={() => setSelectedPosition(position)}
                    className={`group text-left p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${c.bg} ${c.border} ${c.hover} hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(255,255,255,0.04)]`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
                        <position.icon className={`w-4.5 h-4.5 ${c.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground mb-0.5 group-hover:text-white transition-colors">{position.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">{position.shortDescription}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${c.tag}`}>
                            <Briefcase className="w-2.5 h-2.5" /> {position.department}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${c.tag}`}>
                            <Clock className="w-2.5 h-2.5" /> {position.type.split(" / ")[0]}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${c.icon} shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all mt-1`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredPositions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No open positions in this department right now.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-red-500/10 via-transparent to-cyan-500/10 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Don't see your perfect role?</h3>
                  <p className="text-xs text-muted-foreground">We're always looking for talented people. Send us your resume.</p>
                </div>
              </div>
              <a
                href="mailto:seo@rankmehigher.com?subject=General Application - Rank Me Higher"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-white font-bold text-xs hover:bg-red-500/25 hover:border-red-500/50 transition-all duration-300 font-orbitron shrink-0"
              >
                <Mail className="w-3.5 h-3.5 text-red-400" />
                Send Resume
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Position Detail Modal */}
      {selectedPosition && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: "thin" }}
          >
            <button
              onClick={closeModal}
              className="sticky top-3 float-right mr-3 z-10 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {!showForm && !submitted ? (
              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${selectedPosition.color === 'cyan' ? 'bg-cyan-500/15' : 'bg-red-500/15'} flex items-center justify-center`}>
                    <selectedPosition.icon className={`w-5 h-5 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-bold text-lg lg:text-xl text-foreground">{selectedPosition.title}</h2>
                    <p className="text-xs text-muted-foreground">{selectedPosition.department} &middot; {selectedPosition.type} &middot; {selectedPosition.location}</p>
                  </div>
                </div>

                {selectedPosition.salary && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
                    <span className="text-xs font-bold text-green-400">STARTING SALARY:</span>
                    <span className="text-sm font-bold text-foreground">{selectedPosition.salary}</span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{selectedPosition.description}</p>

                <div className="mb-4">
                  <h4 className="font-orbitron font-bold text-[11px] text-foreground mb-2 tracking-wider uppercase">What You'll Do</h4>
                  <div className="space-y-1.5">
                    {selectedPosition.responsibilities.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                        <span className="text-xs text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-orbitron font-bold text-[11px] text-foreground mb-2 tracking-wider uppercase">What We're Looking For</h4>
                  <div className="space-y-1.5">
                    {selectedPosition.requirements.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ArrowRight className={`w-3 h-3 shrink-0 mt-0.5 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                        <span className="text-xs text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-orbitron font-bold text-[11px] text-foreground mb-2 tracking-wider uppercase">Perks</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPosition.perks.map((item, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] font-medium text-green-400">
                        <CheckCircle2 className="w-2.5 h-2.5" /> {item}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 rounded-xl bg-red-500/15 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm hover:bg-red-500/25 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-2 font-orbitron"
                >
                  <Send className="w-4 h-4" />
                  Apply for This Position
                </button>
              </div>
            ) : submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">Application Sent!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  We've received your application for <strong className="text-foreground">{selectedPosition.title}</strong>. Our team will review it and get back to you soon.
                </p>
                <button onClick={closeModal} className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/15 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 lg:p-8">
                <h3 className="font-orbitron font-bold text-base text-foreground mb-1">Apply for {selectedPosition.title}</h3>
                <p className="text-xs text-muted-foreground mb-5">Fill out the form below and we'll review your application.</p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <Label htmlFor="name" className="text-xs font-medium text-foreground">Full Name *</Label>
                    <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 bg-white/5 border-white/10 text-sm h-9" placeholder="Your full name" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-foreground">Email *</Label>
                    <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 bg-white/5 border-white/10 text-sm h-9" placeholder="your@email.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone" className="text-xs font-medium text-foreground">Phone</Label>
                      <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 bg-white/5 border-white/10 text-sm h-9" placeholder="+1 (555)..." />
                    </div>
                    <div>
                      <Label htmlFor="portfolio" className="text-xs font-medium text-foreground">Portfolio / LinkedIn</Label>
                      <Input id="portfolio" value={formData.portfolio} onChange={(e) => setFormData({...formData, portfolio: e.target.value})} className="mt-1 bg-white/5 border-white/10 text-sm h-9" placeholder="URL" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-xs font-medium text-foreground">Relevant Experience *</Label>
                    <Textarea id="experience" required value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="mt-1 bg-white/5 border-white/10 text-sm min-h-[70px]" placeholder="Tell us about your relevant experience..." />
                  </div>
                  <div>
                    <Label htmlFor="why" className="text-xs font-medium text-foreground">Why Rank Me Higher? *</Label>
                    <Textarea id="why" required value={formData.why} onChange={(e) => setFormData({...formData, why: e.target.value})} className="mt-1 bg-white/5 border-white/10 text-sm min-h-[70px]" placeholder="What excites you about joining our team?" />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                      Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting ? "Sending..." : <>
                        <Send className="w-3.5 h-3.5" /> Submit Application
                      </>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Careers;
