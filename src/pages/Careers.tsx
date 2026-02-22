import { Helmet } from "react-helmet-async";
import { useState, useRef } from "react";
import { 
  Briefcase, Code2, Headphones, TrendingUp, Video, Users, 
  ArrowRight, X, Send, CheckCircle2, MapPin, Clock,
  Palette, BarChart3, Mail, Globe, PenTool, ChevronLeft, ChevronRight, Zap
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
  responsibilities: string[];
  requirements: string[];
  perks: string[];
}

const positions: Position[] = [
  {
    id: "n8n-developer",
    title: "N8N Developer",
    department: "Engineering",
    type: "Contract / Part-time",
    location: "Remote",
    icon: Code2,
    color: "cyan",
    shortDescription: "Build automation workflows that connect APIs and save hundreds of hours.",
    description: "Build and maintain complex automation workflows using N8N. You'll design systems that connect APIs, automate client onboarding, and create smart workflows that save hundreds of hours.",
    responsibilities: [
      "Design and build N8N automation workflows for client projects",
      "Integrate third-party APIs (CRMs, email platforms, SMS services)",
      "Troubleshoot and optimize existing automations",
      "Document workflows and create reusable templates",
      "Collaborate with the dev team on custom integrations",
    ],
    requirements: [
      "Proven experience with N8N or similar automation platforms",
      "Strong understanding of APIs, webhooks, and data flows",
      "Problem-solving mindset — you figure things out",
      "Experience with JavaScript/TypeScript is a plus",
      "Portfolio or examples of automation workflows you've built",
    ],
    perks: [
      "Fully remote — work from anywhere",
      "Flexible hours",
      "Work on cutting-edge AI and automation projects",
      "Opportunity to grow into a full-time role",
    ],
  },
  {
    id: "customer-service-va",
    title: "Customer Service VA",
    department: "Client Success",
    type: "Part-time / Full-time",
    location: "Remote",
    icon: Headphones,
    color: "red",
    shortDescription: "Be the friendly voice behind our brand — handle clients with care.",
    description: "Be the friendly voice behind Rank Me Higher. You'll handle client communications, manage support tickets, and ensure every client feels taken care of.",
    responsibilities: [
      "Respond to client inquiries via Telegram, email, and chat",
      "Manage and prioritize support tickets",
      "Follow up on project milestones and deliverables",
      "Schedule calls and meetings for the team",
      "Maintain client records and update CRM",
    ],
    requirements: [
      "Excellent written and verbal English communication",
      "Experience in customer service or virtual assistant roles",
      "Organized, detail-oriented, and proactive",
      "Comfortable with tools like Telegram, Slack, and project management apps",
      "Available during US business hours (flexible)",
    ],
    perks: [
      "Fully remote position",
      "Consistent, reliable work",
      "Be part of a growing agency from the ground floor",
      "Performance bonuses available",
    ],
  },
  {
    id: "media-buyer",
    title: "Media Buyer",
    department: "Marketing",
    type: "Contract / Full-time",
    location: "Remote",
    icon: TrendingUp,
    color: "cyan",
    shortDescription: "Run paid ad campaigns across Google & Meta that drive real leads.",
    description: "Run paid ad campaigns that drive real results for local businesses. You'll manage budgets across Google Ads, Meta, and other platforms to generate leads and grow revenue.",
    responsibilities: [
      "Plan, launch, and optimize paid ad campaigns (Google, Meta, TikTok)",
      "Manage client ad budgets and maximize ROI",
      "Create targeting strategies for local businesses",
      "Analyze campaign performance and provide weekly reports",
      "A/B test creatives, audiences, and landing pages",
    ],
    requirements: [
      "2+ years managing paid ad campaigns",
      "Experience with Google Ads and Meta Ads Manager",
      "Strong analytical skills — you love data",
      "Experience with local business advertising is a big plus",
      "Track record of profitable campaigns",
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
    shortDescription: "Create scroll-stopping video content — reels, testimonials, and more.",
    description: "Create scroll-stopping video content for our agency and our clients. Short-form reels, client testimonials, explainer videos — you'll bring ideas to life through editing.",
    responsibilities: [
      "Edit short-form video content for social media (Reels, TikTok, Shorts)",
      "Create client testimonial and case study videos",
      "Design motion graphics and text animations",
      "Edit long-form content into engaging clips",
      "Maintain brand consistency across all video content",
    ],
    requirements: [
      "Proficiency in Premiere Pro, Final Cut, or DaVinci Resolve",
      "Strong portfolio of short-form video edits",
      "Understanding of social media trends and pacing",
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
    id: "manager-va",
    title: "Manager VA",
    department: "Operations",
    type: "Full-time",
    location: "Remote",
    icon: Users,
    color: "cyan",
    shortDescription: "Run daily operations — coordinate teams and keep projects on track.",
    description: "Help run the day-to-day operations of the agency. You'll coordinate between team members, manage project timelines, and keep everything running smoothly.",
    responsibilities: [
      "Coordinate daily tasks and priorities across the team",
      "Track project timelines and ensure deadlines are met",
      "Manage client onboarding workflows",
      "Prepare reports and status updates for leadership",
      "Handle administrative tasks and document management",
    ],
    requirements: [
      "2+ years in project management or operations",
      "Excellent organizational and multitasking skills",
      "Strong communication — you keep everyone aligned",
      "Experience with project management tools (Asana, Trello, ClickUp)",
      "Self-starter who takes ownership",
    ],
    perks: [
      "Key leadership role in a growing agency",
      "Fully remote with flexible hours",
      "Direct access to agency founder",
      "Room to grow into a senior management position",
    ],
  },
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    department: "Creative",
    type: "Contract / Part-time",
    location: "Remote",
    icon: Palette,
    color: "red",
    shortDescription: "Design stunning visuals — social media graphics to full brand identity.",
    description: "Design stunning visuals for our agency and clients. From social media graphics to brand identity — you'll shape how businesses look online.",
    responsibilities: [
      "Create social media graphics and marketing materials",
      "Design brand identity packages for new clients",
      "Build presentation decks and sales collateral",
      "Create website mockups and UI elements",
      "Maintain design consistency across all assets",
    ],
    requirements: [
      "Proficiency in Figma, Photoshop, and Illustrator",
      "Strong portfolio showcasing brand and marketing design",
      "Eye for modern, clean design trends",
      "Ability to work from brand guidelines",
      "Fast turnaround on revisions",
    ],
    perks: [
      "Creative variety across industries",
      "Remote and flexible",
      "Access to premium design tools",
      "Long-term client relationships",
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
  {
    id: "website-seo-specialist",
    title: "Website SEO Specialist",
    department: "Marketing",
    type: "Full-time",
    location: "Remote",
    icon: Globe,
    color: "red",
    shortDescription: "Own technical SEO — audits, page speed, schema, and on-page strategy.",
    description: "Own the on-site and technical SEO for our clients' websites. You'll run audits, fix crawl issues, optimize page speed, structure content for rankings, and make sure every site we build is a traffic machine.",
    responsibilities: [
      "Perform technical SEO audits and implement on-site fixes",
      "Optimize site architecture, internal linking, and URL structures",
      "Improve Core Web Vitals, page speed, and mobile performance",
      "Research keywords and create on-page content strategies",
      "Implement schema markup, meta tags, and structured data",
    ],
    requirements: [
      "2+ years of technical/on-page SEO experience",
      "Familiarity with tools like Ahrefs, SEMrush, Screaming Frog, or Sitebulb",
      "Understanding of HTML, site architecture, and crawlability",
      "Experience with Core Web Vitals and page speed optimization",
      "Strong analytical skills and attention to detail",
    ],
    perks: [
      "Work on custom-coded websites built for performance",
      "Remote with flexible schedule",
      "Access to premium SEO tools",
      "Performance-based bonuses",
    ],
  },
  {
    id: "content-writer",
    title: "Content Writer",
    department: "Marketing",
    type: "Contract / Part-time",
    location: "Remote",
    icon: PenTool,
    color: "red",
    shortDescription: "Write SEO content that ranks on Google and converts readers into leads.",
    description: "Write compelling blog posts, website copy, and marketing content that ranks on Google and converts readers into customers.",
    responsibilities: [
      "Write SEO-optimized blog posts and articles",
      "Create website copy for client projects",
      "Develop email sequences and marketing funnels",
      "Research industry topics and trending keywords",
      "Edit and proofread content for quality",
    ],
    requirements: [
      "Strong writing skills with a portfolio of published work",
      "Understanding of SEO writing best practices",
      "Ability to write in different brand voices",
      "Research skills and attention to detail",
      "Experience with marketing copy is a plus",
    ],
    perks: [
      "Byline opportunities on published content",
      "Remote with flexible deadlines",
      "Variety of industries to write about",
      "Consistent, ongoing work",
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

        {/* Featured Positions — Horizontal Scroll */}
        <section className="pb-4 relative">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-orbitron font-bold tracking-widest text-muted-foreground uppercase">Featured Roles</h2>
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
            className="flex gap-3 overflow-x-auto pb-4 px-4 lg:px-8 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="shrink-0 w-[max(0px,calc((100vw-72rem)/2+0.5rem))]" />
            {positions.slice(0, 5).map((position) => {
              const c = colorMap(position.color);
              return (
                <button
                  key={position.id}
                  onClick={() => setSelectedPosition(position)}
                  className={`group shrink-0 w-[280px] snap-start text-left p-4 rounded-xl backdrop-blur-md border transition-all duration-300 hover:shadow-lg ${c.bg} ${c.border} ${c.hover} hover:shadow-${position.color === 'cyan' ? 'cyan' : 'red'}-500/5 hover:-translate-y-0.5`}
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
                </button>
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
                    className={`group text-left p-4 rounded-xl backdrop-blur-md border transition-all duration-300 hover:shadow-lg ${c.bg} ${c.border} ${c.hover} hover:-translate-y-0.5`}
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm hover:from-red-500 hover:to-red-400 transition-all duration-300 flex items-center justify-center gap-2"
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
