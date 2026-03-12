import { Helmet } from "react-helmet-async";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Briefcase, Code2, TrendingUp, Video, Users, 
  ArrowRight, X, Send, CheckCircle2, MapPin, Clock,
  BarChart3, Mail, Zap, ChevronLeft, ChevronRight, Calculator, Link2, Check, Phone
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AIScreeningQuiz from "@/components/AIScreeningQuiz";

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
  hourlyMin: number;
  hourlyMax: number;
  minHours?: number;
  maxHours?: number;
  commission?: string;
  commissionRate?: number;
  salesRangeMin?: number;
  salesRangeMax?: number;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
}

const positions: Position[] = [
  {
    id: "sales-agent-warm-leads",
    title: "Sales Agent Warm Leads",
    department: "Sales",
    type: "Part-time",
    location: "Remote",
    icon: Phone,
    color: "cyan",
    shortDescription: "Call warm leads from our database — flat rate + commission on every sale.",
    salary: "$3/hr + 1% Comm · 25 hrs/wk",
    hourlyMin: 3,
    hourlyMax: 3,
    minHours: 25,
    maxHours: 25,
    commission: "1% commission on every sale closed",
    commissionRate: 0.01,
    salesRangeMin: 10000,
    salesRangeMax: 30000,
    description: "We're looking for a sales agent to call warm leads from our existing database. These are recurring clients of home service businesses (window washing, deck maintenance, etc.) who have already worked with the company — so it's an easy, warm conversation. You just need to get the lead interested and patch them through to the manager who will close and schedule. No cold prospecting, no finding your own leads.",
    responsibilities: [
      "Call warm leads using our provided list",
      "Follow a simple calling script",
      "Speak clearly and politely on the phone",
      "Take notes and update call results",
      "Patch interested leads to the manager for closing",
      "Handle multiple tasks while calling",
    ],
    requirements: [
      "Good English communication skills",
      "Able to multitask",
      "Comfortable making phone calls",
      "Stable internet connection and headset",
      "Reliable and willing to work night shift (10 PM – 3 AM PH time)",
      "Previous call center or cold calling experience is a plus",
    ],
    perks: [
      "$3/hr flat + 1% commission on every sale closed",
      "25 hours per week — part-time",
      "Work from home — fully remote",
      "Warm leads only — no cold prospecting",
      "Schedule: 10:00 PM – 3:00 AM PH time",
    ],
  },
  {
    id: "media-buyer",
    title: "Media Buyer (Meta)",
    department: "Marketing",
    type: "Contract / Full-time",
    location: "Remote",
    icon: TrendingUp,
    color: "cyan",
    shortDescription: "Run Meta ad campaigns that generate real leads for local businesses.",
    salary: "$3–$7/hr · 20–40 hrs/week",
    hourlyMin: 3,
    hourlyMax: 7,
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
    salary: "$3–$7/hr · 20–40 hrs/week",
    hourlyMin: 3,
    hourlyMax: 7,
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
    salary: "$1.75–$2/hr · 20–40 hrs/week",
    hourlyMin: 1.75,
    hourlyMax: 2,
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
    id: "senior-automation-specialist",
    title: "Senior Automation Specialist",
    department: "Software Engineers",
    type: "Full-time",
    location: "Remote",
    icon: Zap,
    color: "cyan",
    shortDescription: "Lead complex automation architecture across client operations at scale.",
    salary: "$4–$5/hr · 20–40 hrs/week",
    hourlyMin: 4,
    hourlyMax: 5,
    description: "Take the lead on our most complex automation projects. You'll architect end-to-end systems using N8N and GoHighLevel, mentor junior specialists, and own the reliability of our client-facing automations. This role is for someone who's been in the trenches and can build systems that don't break.",
    responsibilities: [
      "Architect and lead complex multi-step automation workflows in N8N and GoHighLevel",
      "Oversee and review automations built by junior team members",
      "Design scalable systems for client onboarding, follow-ups, and reporting",
      "Troubleshoot critical production automation failures and ensure uptime",
      "Collaborate directly with the founder on automation strategy and tooling decisions",
    ],
    requirements: [
      "2+ years of hands-on experience with N8N, GoHighLevel, and API integrations",
      "Proven track record of building reliable, production-grade automations",
      "Deep understanding of webhooks, data flows, error handling, and retry logic",
      "Experience with Replit and Claude Code is a strong plus",
      "Leadership mindset — you can mentor others and own outcomes",
    ],
    perks: [
      "Schedule: 9 AM – 4 PM CT, Monday – Friday",
      "Performance bonuses + leadership growth path",
      "Fully remote — work from anywhere",
      "Direct collaboration with agency founder",
    ],
  },
  {
    id: "senior-software-engineer",
    title: "Senior Software Engineer",
    department: "Software Engineers",
    type: "Full-time",
    location: "Remote",
    icon: Code2,
    color: "cyan",
    shortDescription: "Lead SaaS development, manage engineers, and own our internal products.",
    salary: "$4–$5/hr · 20–40 hrs/week",
    hourlyMin: 4,
    hourlyMax: 5,
    description: "Own and lead the development of our internal SaaS products. You'll manage other engineers, make architectural decisions, and build production-grade software using vibe coding tools. This role focuses on our own platforms — not client automations — covering everything from security and databases to CRM integrations, domains, and hosting.",
    responsibilities: [
      "Lead development of internal SaaS products and agency tools",
      "Manage and mentor junior software engineers on the team",
      "Make architectural decisions on databases, security, hosting, and infrastructure",
      "Build and maintain CRM integrations, domain management, and deployment pipelines",
      "Code review, enforce best practices, and ensure production reliability",
    ],
    requirements: [
      "3+ years of software engineering experience",
      "Deep understanding of vibe coding with Replit and Claude Code",
      "Strong knowledge of security, databases (SQL), CRMs, domains, and hosting",
      "Experience managing or mentoring other engineers",
      "Comfortable making decisions and owning outcomes independently",
    ],
    perks: [
      "Schedule: 9 AM – 4 PM CT, Monday – Friday",
      "Leadership role with direct impact on company products",
      "Performance bonuses + equity discussion for top performers",
      "Fully remote — work from anywhere",
      "Direct collaboration with agency founder",
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
    salary: "$3–$7/hr · 20–40 hrs/week",
    hourlyMin: 3,
    hourlyMax: 7,
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
    salary: "$3–$7/hr · 20–40 hrs/week",
    hourlyMin: 3,
    hourlyMax: 7,
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
  const [submitted, setSubmitted] = useState(false);
  const [activeDept, setActiveDept] = useState("All");
  const [isHovered, setIsHovered] = useState(false);
  const [mobileCardIndex, setMobileCardIndex] = useState(0);
  const [calcHours, setCalcHours] = useState(30);
  const [calcRate, setCalcRate] = useState(5);
  const [calcCurrency, setCalcCurrency] = useState<'USD' | 'PHP' | 'PKR' | 'INR'>('USD');
  const [linkCopied, setLinkCopied] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const filteredPositions = activeDept === "All" ? positions : positions.filter(p => p.department === activeDept);

  useEffect(() => {
    const positionId = searchParams.get("position");
    if (positionId) {
      const found = positions.find(p => p.id === positionId);
      if (found) {
        setCalcHours(30);
        setCalcRate(found.hourlyMin);
        setSelectedPosition(found);
      }
    }
  }, [searchParams]);

  const openPosition = (position: Position) => {
    setCalcHours(30);
    setCalcRate(position.hourlyMin);
    setSelectedPosition(position);
    setSearchParams({ position: position.id });
  };

  const copyPositionLink = (positionId: string) => {
    const url = `${window.location.origin}/careers?position=${positionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({ title: "Link copied!", description: "Share this link with applicants." });
    });
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && mobileCardIndex < filteredPositions.length - 1) {
        setMobileCardIndex(prev => prev + 1);
      } else if (diff < 0 && mobileCardIndex > 0) {
        setMobileCardIndex(prev => prev - 1);
      }
    }
  }, [mobileCardIndex, filteredPositions.length]);

  const closeModal = () => {
    setSelectedPosition(null);
    setShowForm(false);
    setSubmitted(false);
    setLinkCopied(false);
    searchParams.delete("position");
    setSearchParams(searchParams);
  };

  const colorMap = (color: 'red' | 'cyan') => color === "cyan"
    ? { bg: "bg-cyan-500/5", border: "border-cyan-500/20", hover: "hover:border-cyan-400/50", icon: "text-cyan-400", iconBg: "bg-cyan-500/15", tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", glow: "shadow-cyan-500/10" }
    : { bg: "bg-red-500/5", border: "border-red-500/20", hover: "hover:border-red-500/40", icon: "text-red-400", iconBg: "bg-red-500/15", tag: "bg-red-500/10 text-red-400 border-red-500/20", glow: "shadow-red-500/10" };

  return (
    <>
      <Helmet>
        <title>Careers | Rank Me Higher</title>
        <meta name="description" content="Join the Rank Me Higher team. We're hiring talented people in automation, marketing, design, and development. Remote positions available." />
        <meta property="og:title" content="Careers | Rank Me Higher" />
        <meta property="og:description" content="Join the Rank Me Higher team. We're hiring in automation, marketing, design, and development. Remote positions available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rankmehigher.com/careers" />
        <meta property="og:image" content="https://rankmehigher.com/assets/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Careers | Rank Me Higher" />
        <meta name="twitter:description" content="Join our team. Remote positions in automation, marketing, design, and development." />
        <link rel="canonical" href="https://rankmehigher.com/careers" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Open Positions at Rank Me Higher",
          "itemListElement": positions.map((pos, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "JobPosting",
              "title": pos.title,
              "description": pos.description,
              "datePosted": "2025-01-01",
              "employmentType": "CONTRACTOR",
              "jobLocationType": "TELECOMMUTE",
              "hiringOrganization": { "@type": "Organization", "name": "Rank Me Higher", "sameAs": "https://rankmehigher.com" },
              "applicantLocationRequirements": { "@type": "Country", "name": "Worldwide" }
            }
          }))
        })}</script>
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
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-orbitron font-bold tracking-widest text-muted-foreground uppercase">Featured Roles</h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                LIVE
              </div>
            </div>
          </div>

          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="flex gap-3 w-max"
              style={{
                animation: `marquee ${positions.length * 8}s linear infinite`,
                animationPlayState: isHovered ? "paused" : "running",
              }}
            >
              {[...positions, ...positions].map((position, idx) => {
                const c = colorMap(position.color);
                return (
                  <div
                    key={`${position.id}-${idx}`}
                    onClick={() => openPosition(position)}
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
            </div>
          </div>
        </section>

        {/* Department Filter + Grid */}
        <section className="py-6 relative">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => { setActiveDept(dept); setMobileCardIndex(0); }}
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

            {/* Desktop: Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPositions.map((position) => {
                const c = colorMap(position.color);
                return (
                  <button
                    key={position.id}
                    onClick={() => openPosition(position)}
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

            {/* Mobile: Swipeable Single Card */}
            {filteredPositions.length > 0 && (
              <div className="sm:hidden">
                <div
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {(() => {
                    const safeIndex = Math.min(mobileCardIndex, filteredPositions.length - 1);
                    const position = filteredPositions[safeIndex];
                    const c = colorMap(position.color);
                    return (
                      <button
                        key={position.id}
                        onClick={() => openPosition(position)}
                        className={`w-full text-left p-5 rounded-xl backdrop-blur-md border transition-all duration-300 ${c.bg} ${c.border}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-11 h-11 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
                            <position.icon className={`w-5 h-5 ${c.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-foreground">{position.title}</h3>
                            <p className="text-[11px] text-muted-foreground">{position.department} &middot; {position.type} &middot; {position.location}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{position.shortDescription}</p>
                        {position.salary && (
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 mb-3">
                            <span className="text-[9px] font-bold text-green-400 uppercase">Salary:</span>
                            <span className="text-[11px] font-bold text-foreground">{position.salary}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${c.tag}`}>
                            <Briefcase className="w-3 h-3" /> {position.department}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${c.tag}`}>
                            <Clock className="w-3 h-3" /> {position.type.split(" / ")[0]}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${c.tag}`}>
                            <MapPin className="w-3 h-3" /> {position.location}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-red-400">
                          <span>Tap to view details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between mt-3 px-1">
                  <button
                    onClick={() => setMobileCardIndex(prev => Math.max(0, prev - 1))}
                    disabled={mobileCardIndex === 0}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {filteredPositions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setMobileCardIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === Math.min(mobileCardIndex, filteredPositions.length - 1)
                            ? "bg-red-400 w-4"
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setMobileCardIndex(prev => Math.min(filteredPositions.length - 1, prev + 1))}
                    disabled={mobileCardIndex >= filteredPositions.length - 1}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

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
            className="relative w-full max-w-md lg:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="sticky top-3 float-right mr-3 z-10 flex items-center gap-2">
              <button
                onClick={() => copyPositionLink(selectedPosition.id)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  linkCopied
                    ? 'bg-green-500/20 border-green-500/40'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
                title="Copy link to this position"
              >
                {linkCopied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4 text-white" />}
              </button>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {!showForm && !submitted ? (
              <div className="p-4 lg:p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg ${selectedPosition.color === 'cyan' ? 'bg-cyan-500/15' : 'bg-red-500/15'} flex items-center justify-center`}>
                    <selectedPosition.icon className={`w-4 h-4 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-bold text-sm lg:text-base text-foreground leading-tight">{selectedPosition.title}</h2>
                    <p className="text-[10px] text-muted-foreground">{selectedPosition.department} &middot; {selectedPosition.type} &middot; {selectedPosition.location}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Calculator className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold text-green-400 uppercase font-orbitron tracking-wider">Salary Calculator</span>
                    <span className="ml-auto text-[9px] text-muted-foreground">${selectedPosition.hourlyMin}{selectedPosition.hourlyMin !== selectedPosition.hourlyMax ? `–${selectedPosition.hourlyMax}` : ''}/hr · {(selectedPosition.minHours || 20) === (selectedPosition.maxHours || 40) ? `${selectedPosition.minHours}` : `${selectedPosition.minHours || 20}–${selectedPosition.maxHours || 40}`} hrs/wk</span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2.5">
                    {([
                      { key: 'USD' as const, label: '$ USD' },
                      { key: 'PHP' as const, label: '₱ PHP' },
                      { key: 'PKR' as const, label: '₨ PKR' },
                      { key: 'INR' as const, label: '₹ INR' },
                    ]).map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setCalcCurrency(c.key)}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold font-orbitron tracking-wide border transition-all duration-200 ${
                          calcCurrency === c.key
                            ? 'bg-green-500/15 border-green-500/40 text-green-400'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const multiplier = calcCurrency === 'PHP' ? 56 : calcCurrency === 'PKR' ? 278 : calcCurrency === 'INR' ? 84 : 1;
                    const symbol = calcCurrency === 'PHP' ? '₱' : calcCurrency === 'PKR' ? '₨' : calcCurrency === 'INR' ? '₹' : '$';
                    const minHr = selectedPosition.hourlyMin * multiplier;
                    const maxHr = selectedPosition.hourlyMax * multiplier;
                    const effectiveHours = (selectedPosition.minHours && selectedPosition.minHours === selectedPosition.maxHours) ? selectedPosition.minHours : calcHours;
                    const minWeekly = minHr * effectiveHours;
                    const maxWeekly = maxHr * effectiveHours;
                    const minMonthly = minWeekly * 4.33;
                    const maxMonthly = maxWeekly * 4.33;
                    const fmt = (n: number) => Math.round(n).toLocaleString();
                    const range = (min: number, max: number) => Math.round(min) === Math.round(max) ? `${symbol}${fmt(min)}` : `${symbol}${fmt(min)}–${fmt(max)}`;
                    return (
                      <>
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground">Hours per week</span>
                            <span className="text-xs font-bold text-foreground font-orbitron">{effectiveHours} hrs</span>
                          </div>
                          {(selectedPosition.minHours || 20) === (selectedPosition.maxHours || 40) ? (
                            <div className="text-[10px] text-muted-foreground mt-1">Fixed {selectedPosition.minHours} hrs/week</div>
                          ) : (
                            <>
                              <input
                                type="range"
                                min={selectedPosition.minHours || 20}
                                max={selectedPosition.maxHours || 40}
                                value={calcHours}
                                onChange={(e) => setCalcHours(Number(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-green-400"
                                style={{ accentColor: '#4ade80', background: 'rgba(255,255,255,0.08)' }}
                              />
                              <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                                <span>{selectedPosition.minHours || 20} hrs</span>
                                <span>{selectedPosition.maxHours || 40} hrs</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-md bg-white/5 border border-white/10 p-2 text-center">
                            <div className="text-[8px] text-muted-foreground mb-0.5 uppercase">Weekly</div>
                            <div className="text-[11px] font-bold text-green-400 font-orbitron">{range(minWeekly, maxWeekly)}</div>
                          </div>
                          <div className="rounded-md bg-white/5 border border-white/10 p-2 text-center">
                            <div className="text-[8px] text-muted-foreground mb-0.5 uppercase">Monthly</div>
                            <div className="text-[11px] font-bold text-green-400 font-orbitron">{range(minMonthly, maxMonthly)}</div>
                          </div>
                          <div className="rounded-md bg-white/5 border border-white/10 p-2 text-center">
                            <div className="text-[8px] text-muted-foreground mb-0.5 uppercase">Yearly</div>
                            <div className="text-[11px] font-bold text-green-400 font-orbitron">{range(minMonthly * 12, maxMonthly * 12)}</div>
                          </div>
                        </div>
                        {selectedPosition.commission && (
                          <div className="mt-2 text-[9px] text-green-400/70 text-center">
                            + {selectedPosition.commission} (not included above)
                          </div>
                        )}
                        {selectedPosition.commissionRate && selectedPosition.salesRangeMin && selectedPosition.salesRangeMax && (() => {
                          const rate = selectedPosition.commissionRate;
                          const commMin = selectedPosition.salesRangeMin * rate * multiplier;
                          const commMax = selectedPosition.salesRangeMax * rate * multiplier;
                          return (
                            <div className="mt-2 rounded-md bg-yellow-500/5 border border-yellow-500/20 p-2">
                              <div className="text-[9px] font-bold text-yellow-400 uppercase font-orbitron tracking-wider mb-1.5 text-center">Commission Earnings Estimate</div>
                              <div className="text-[9px] text-muted-foreground text-center mb-1.5">
                                Based on {symbol}{fmt(selectedPosition.salesRangeMin * multiplier)}–{symbol}{fmt(selectedPosition.salesRangeMax * multiplier)}/mo in sales at {(rate * 100)}%
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-md bg-white/5 border border-white/10 p-1.5 text-center">
                                  <div className="text-[7px] text-muted-foreground mb-0.5 uppercase">Monthly</div>
                                  <div className="text-[10px] font-bold text-yellow-400 font-orbitron">{symbol}{fmt(commMin)}–{symbol}{fmt(commMax)}</div>
                                </div>
                                <div className="rounded-md bg-white/5 border border-white/10 p-1.5 text-center">
                                  <div className="text-[7px] text-muted-foreground mb-0.5 uppercase">Yearly</div>
                                  <div className="text-[10px] font-bold text-yellow-400 font-orbitron">{symbol}{fmt(commMin * 12)}–{symbol}{fmt(commMax * 12)}</div>
                                </div>
                                <div className="rounded-md bg-green-500/5 border border-green-500/20 p-1.5 text-center">
                                  <div className="text-[7px] text-muted-foreground mb-0.5 uppercase">Total /mo</div>
                                  <div className="text-[10px] font-bold text-green-400 font-orbitron">{symbol}{fmt(minMonthly + commMin)}–{symbol}{fmt(maxMonthly + commMax)}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{selectedPosition.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                  <div>
                    <h4 className="font-orbitron font-bold text-[9px] text-foreground mb-1 tracking-wider uppercase">What You'll Do</h4>
                    <div className="space-y-0.5">
                      {selectedPosition.responsibilities.map((item, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className={`w-2.5 h-2.5 shrink-0 mt-0.5 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                          <span className="text-[10px] text-muted-foreground leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-orbitron font-bold text-[9px] text-foreground mb-1 tracking-wider uppercase">What We're Looking For</h4>
                    <div className="space-y-0.5">
                      {selectedPosition.requirements.map((item, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <ArrowRight className={`w-2.5 h-2.5 shrink-0 mt-0.5 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                          <span className="text-[10px] text-muted-foreground leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-orbitron font-bold text-[9px] text-foreground mb-1 tracking-wider uppercase">Perks</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedPosition.perks.map((item, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[9px] font-medium text-green-400">
                        <CheckCircle2 className="w-2 h-2" /> {item}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-2 rounded-lg bg-red-500/15 backdrop-blur-md border border-red-500/30 text-white font-bold text-[11px] hover:bg-red-500/25 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-2 font-orbitron"
                >
                  <Send className="w-3 h-3" />
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
              <AIScreeningQuiz
                position={selectedPosition.title}
                department={selectedPosition.department}
                positionColor={selectedPosition.color}
                onBack={() => setShowForm(false)}
                onComplete={() => {
                  setSubmitted(true);
                  toast({
                    title: "Application Received!",
                    description: `Thanks for applying for ${selectedPosition.title}. We'll review your AI assessment and get back to you soon.`,
                  });
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Careers;
