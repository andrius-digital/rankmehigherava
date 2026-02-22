import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { 
  Briefcase, Code2, Headphones, TrendingUp, Video, Users, 
  ArrowRight, X, Send, CheckCircle2, MapPin, Clock, DollarSign,
  Palette, BarChart3, Mail, Globe, Megaphone, PenTool
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

const Careers = () => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
    experience: "",
    why: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition) return;

    setIsSubmitting(true);

    try {
      const telegramMessage = `📋 <b>New Job Application</b>\n\n<b>Position:</b> ${selectedPosition.title}\n<b>Department:</b> ${selectedPosition.department}\n\n<b>Name:</b> ${formData.name}\n<b>Email:</b> ${formData.email}\n<b>Phone:</b> ${formData.phone || "Not provided"}\n<b>Portfolio:</b> ${formData.portfolio || "Not provided"}\n\n<b>Experience:</b>\n${formData.experience}\n\n<b>Why RMH:</b>\n${formData.why}`;

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

  return (
    <>
      <Helmet>
        <title>Careers | Rank Me Higher</title>
        <meta name="description" content="Join the Rank Me Higher team. We're hiring talented people in automation, marketing, design, and development. Remote positions available." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar />

        <section className="pt-28 pb-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
                <Briefcase className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-orbitron text-red-400 font-bold tracking-wider">WE'RE HIRING</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black leading-tight font-orbitron mb-6">
                <span className="text-foreground">Build the Future </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">With Us.</span>
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We're a fast-moving agency that uses AI and custom code to help local businesses dominate online. 
                If you're talented, hungry, and want to work on things that matter — we want to hear from you.
              </p>
            </div>

            <div className="grid gap-4">
              {positions.map((position) => {
                const colorClasses = position.color === "cyan"
                  ? { bg: "bg-cyan-500/5", border: "border-cyan-500/20", hover: "hover:border-cyan-400/40", icon: "text-cyan-400", iconBg: "bg-cyan-500/15", tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" }
                  : { bg: "bg-white/[0.03]", border: "border-white/10", hover: "hover:border-red-500/30", icon: "text-red-400", iconBg: "bg-red-500/15", tag: "bg-red-500/10 text-red-400 border-red-500/20" };

                return (
                  <button
                    key={position.id}
                    onClick={() => setSelectedPosition(position)}
                    className={`w-full text-left p-5 lg:p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 group ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover} hover:scale-[1.01]`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colorClasses.iconBg} flex items-center justify-center shrink-0`}>
                        <position.icon className={`w-5 h-5 ${colorClasses.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-orbitron font-bold text-base lg:text-lg text-foreground">{position.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{position.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClasses.tag}`}>
                            <Briefcase className="w-2.5 h-2.5" /> {position.department}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClasses.tag}`}>
                            <Clock className="w-2.5 h-2.5" /> {position.type}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClasses.tag}`}>
                            <MapPin className="w-2.5 h-2.5" /> {position.location}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${colorClasses.icon} shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 mt-1`} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 text-center p-8 rounded-2xl bg-white/[0.03] border border-white/10">
              <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">Don't see your role?</h3>
              <p className="text-sm text-muted-foreground mb-4">We're always looking for talented people. Send us your resume and tell us what you're great at.</p>
              <a
                href="mailto:seo@rankmehigher.com?subject=General Application - Rank Me Higher"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/15 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm hover:bg-red-500/25 hover:border-red-500/50 transition-all duration-300 font-orbitron"
              >
                <Mail className="w-4 h-4 text-red-400" />
                Send Your Resume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {selectedPosition && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {!showForm && !submitted ? (
              <div className="p-6 lg:p-8">
                <div className={`w-14 h-14 rounded-xl ${selectedPosition.color === 'cyan' ? 'bg-cyan-500/15' : 'bg-red-500/15'} flex items-center justify-center mb-4`}>
                  <selectedPosition.icon className={`w-6 h-6 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                </div>

                <h2 className="font-orbitron font-bold text-xl lg:text-2xl text-foreground mb-1">{selectedPosition.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs text-muted-foreground">{selectedPosition.department}</span>
                  <span className="text-xs text-muted-foreground">-</span>
                  <span className="text-xs text-muted-foreground">{selectedPosition.type}</span>
                  <span className="text-xs text-muted-foreground">-</span>
                  <span className="text-xs text-muted-foreground">{selectedPosition.location}</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{selectedPosition.description}</p>

                <div className="mb-5">
                  <h4 className="font-orbitron font-bold text-xs text-foreground mb-2 tracking-wider uppercase">What You'll Do</h4>
                  <div className="space-y-1.5">
                    {selectedPosition.responsibilities.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedPosition.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`} />
                        <span className="text-xs text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="font-orbitron font-bold text-xs text-foreground mb-2 tracking-wider uppercase">What We're Looking For</h4>
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
                  <h4 className="font-orbitron font-bold text-xs text-foreground mb-2 tracking-wider uppercase">Perks</h4>
                  <div className="space-y-1.5">
                    {selectedPosition.perks.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <DollarSign className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-500/15 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm hover:bg-red-500/25 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 font-orbitron"
                >
                  Apply for This Position
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : submitted ? (
              <div className="p-6 lg:p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="font-orbitron font-bold text-xl text-foreground mb-2">Application Sent!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Thanks for applying for <strong>{selectedPosition.title}</strong>. We'll review your application and get back to you within a few days.
                </p>
                <button
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/15 transition-all duration-300 font-orbitron"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 lg:p-8">
                <button
                  onClick={() => setShowForm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 inline-flex items-center gap-1"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" /> Back to details
                </button>

                <h2 className="font-orbitron font-bold text-lg text-foreground mb-1">Apply: {selectedPosition.title}</h2>
                <p className="text-xs text-muted-foreground mb-6">Fill out the form below and we'll review your application.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs text-muted-foreground mb-1.5 block">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-red-500/50 text-sm"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs text-muted-foreground mb-1.5 block">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-red-500/50 text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs text-muted-foreground mb-1.5 block">Phone / WhatsApp</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-red-500/50 text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="portfolio" className="text-xs text-muted-foreground mb-1.5 block">Portfolio / LinkedIn / Website</Label>
                    <Input
                      id="portfolio"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-red-500/50 text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-xs text-muted-foreground mb-1.5 block">Relevant Experience *</Label>
                    <Textarea
                      id="experience"
                      required
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-red-500/50 text-sm min-h-[80px]"
                      placeholder="Tell us about your relevant experience, skills, and projects..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="why" className="text-xs text-muted-foreground mb-1.5 block">Why Rank Me Higher? *</Label>
                    <Textarea
                      id="why"
                      required
                      value={formData.why}
                      onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-red-500/50 text-sm min-h-[80px]"
                      placeholder="What excites you about this role and our agency?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-500/15 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm hover:bg-red-500/25 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 font-orbitron disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
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
