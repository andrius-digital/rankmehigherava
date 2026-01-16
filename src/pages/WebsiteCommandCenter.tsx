import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
    ArrowLeft,
    Rocket,
    FileText,
    Sparkles,
    ClipboardList,
    Copy,
    Check,
    Download,
    ExternalLink,
    Link as LinkIcon,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Palette,
    Type,
    Zap,
    Home,
    Store
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GridOverlay from "@/components/agency/GridOverlay";
import FuturisticWrapper from "@/components/ui/FuturisticWrapper";

// Mock data - replace with actual Supabase queries
const mockSubmissions = [
    {
        id: 1,
        clientName: "Crystal Clear Window Washing",
        businessType: "Window Washing",
        location: "Chicago, IL",
        serviceAreas: ["Chicago", "Naperville", "Aurora"],
        mainBenefit: "Streak-Free Windows in 24 Hours",
        submittedAt: "2025-01-28T10:30:00",
        status: 'ready' as const,
        email: "contact@crystalclear.com",
        phone: "(773) 555-0123"
    },
    {
        id: 2,
        clientName: "Elite Auto Detailing",
        businessType: "Auto Detailing",
        location: "1234 Main St, Chicago",
        serviceAreas: [],
        mainBenefit: "Premium Paint Protection",
        submittedAt: "2025-01-27T14:20:00",
        status: 'new' as const,
        email: "info@eliteauto.com",
        phone: "(312) 555-0456"
    }
];

const agencyBrainRules = [
    {
        icon: Palette,
        title: "Dark Aesthetic + Teal Accents",
        description: "Primary: #0a0a0b | Accent: #14b8a6 (teal-500)",
        color: "teal"
    },
    {
        icon: Type,
        title: "Bold Typography Hierarchy",
        description: "H1 (48-72px) > H2 (36-48px) > H3 (24-32px) | Orbitron for headers",
        color: "teal"
    },
    {
        icon: Zap,
        title: "Punchy Copy - No Fluff",
        description: "Under 20 words per section. Direct, benefit-focused, action-oriented",
        color: "teal"
    },
    {
        icon: CheckCircle2,
        title: "Social Proof Above Fold",
        description: "5-star ratings, client count, testimonials in hero section",
        color: "teal"
    },
    {
        icon: Clock,
        title: "CTA Within 3 Seconds",
        description: "Primary action button visible immediately on page load",
        color: "teal"
    },
    {
        icon: Sparkles,
        title: "Mobile-First Always",
        description: "Design for mobile, enhance for desktop. Test on actual devices",
        color: "teal"
    }
];

const promptTemplates = {
    hero: [
        {
            title: "Service Area Hero",
            prompt: `Create hero section for [BUSINESS_NAME] - [SERVICE_TYPE] in [LOCATION].

STRUCTURE:
- Dark bg (#0a0a0b), teal accent (#14b8a6)
- H1: "Professional [SERVICE_TYPE] in [CITY]"
- Subhead: "[MAIN_BENEFIT] - Serving [SERVICE_AREAS]"
- 5-star trust badge: "500+ Happy Customers"
- Primary CTA: "Get Free Quote" (teal gradient button)
- Phone: [PHONE] with "Call Now" label
- Service area badges below

COPY RULES: Direct, under 20 words, benefit-focused`
        },
        {
            title: "Local Business Hero",
            prompt: `Create hero for [BUSINESS_NAME] at [LOCATION].

ELEMENTS:
- H1: "[BUSINESS_NAME] - [CITY]'s Trusted [SERVICE_TYPE]"
- Subhead: "[MAIN_BENEFIT]"
- Trust: Google rating + years in business
- CTA: "Visit Us Today" or "Book Appointment"
- Address + phone prominent
- Map embed or directions link`
        }
    ],
    services: [
        {
            title: "3-Column Service Grid",
            prompt: `Services section for [BUSINESS_NAME]:

LAYOUT: 3 cards, dark bg, teal icons
Each card:
- Icon (relevant to service)
- Service name (bold, uppercase)
- 1-line benefit (under 10 words)
- "Learn More" link
- Hover: scale + teal glow

Mobile: Stack vertically`
        }
    ],
    socialProof: [
        {
            title: "Stats Bar",
            prompt: `Stats section: Dark bg, 3-4 metrics
Format: "[NUMBER]+ [LABEL]"
- Teal gradient numbers
- Small labels below
- Animated counters on scroll
Keep labels 2-3 words max`
        }
    ],
    cta: [
        {
            title: "Urgency CTA",
            prompt: `CTA block:
- Bold headline with urgency
- Teal gradient button
- Risk reversal text
- Trust badge
Center-aligned, mobile-optimized`
        }
    ],
    faq: [
        {
            title: "Accordion FAQ",
            prompt: `FAQ section:
- Dark accordion items
- Teal chevron icons
- Bold questions (H3)
- Concise answers (under 30 words)
- Proper H2>H3 hierarchy for SEO`
        }
    ]
};

const WebsiteCommandCenter = () => {
    const [activeTab, setActiveTab] = useState<'onboarding' | 'prompting' | 'builder' | 'submissions'>('onboarding');
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [selectedBusinessType, setSelectedBusinessType] = useState<'homeServices' | 'localBusiness' | null>(null);

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedItem(id);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const generateLovablePrompt = (submission: typeof mockSubmissions[0]) => {
        const hasServiceAreas = submission.serviceAreas.length > 0;
        const businessCategory = hasServiceAreas ? 'Home Services' : 'Local Business';

        return `Build a high-converting landing page for ${submission.clientName}.

BUSINESS INFO:
- Type: ${submission.businessType} (${businessCategory})
- Location: ${submission.location}
${hasServiceAreas ? `- Service Areas: ${submission.serviceAreas.join(', ')}` : ''}
- Main Benefit: ${submission.mainBenefit}
- Contact: ${submission.phone} | ${submission.email}

AGENCY STYLE BRAIN:
✓ Dark aesthetic (#0a0a0b) + teal accents (#14b8a6)
✓ Bold typography: Orbitron headers, clean body font
✓ Punchy copy: Under 20 words per section
✓ Social proof above fold: 5-star rating, customer count
✓ CTA within 3 seconds: Prominent "Get Free Quote" button
✓ Mobile-first responsive design
✓ SEO hierarchy: H1 > H2 > H3 structure

SECTIONS TO BUILD:
1. Hero: ${hasServiceAreas ? 'Service area focus' : 'Location-based'}, trust badge, dual CTAs
2. Social Proof: Stats or testimonials
3. Services: 3-column grid with benefits
4. ${hasServiceAreas ? 'Service Areas: Grid of cities served' : 'Location Info: Map + directions'}
5. FAQ: 5-7 questions, SEO-optimized
6. Final CTA: Urgency-based with guarantee

Deploy in under 60 minutes. Keep it clean, conversion-focused, and premium.`;
    };

    const tabs = [
        { id: 'onboarding' as const, label: '1. Onboarding', icon: FileText },
        { id: 'prompting' as const, label: '2. Agency Brain', icon: Sparkles },
        { id: 'builder' as const, label: '3. Builder', icon: Rocket },
        { id: 'submissions' as const, label: '4. Submissions', icon: ClipboardList }
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Website Command Center | AVA Admin Panel</title>
                <meta name="description" content="Deploy high-converting websites in under 60 minutes" />
            </Helmet>

            <GridOverlay />

            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <header className="border-b border-border/30 bg-card/20 backdrop-blur-xl sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/avaadminpanel">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        AVA Admin Panel
                                    </Button>
                                </Link>
                                <div className="h-6 w-px bg-border/50" />
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                                        <Rocket className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                                            Website Command Center
                                        </h1>
                                        <p className="text-sm text-teal-400">
                                            Deploy high-converting websites in under 60 minutes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-7xl mx-auto">
                        <FuturisticWrapper>
                            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a0a0b] via-[#0f0f10] to-[#0a0a0b] border-2 border-teal-500/30">
                                {/* Glow effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 rounded-3xl blur-xl opacity-20" />

                                <div className="relative">
                                    {/* Tab Navigation */}
                                    <div className="border-b border-border/30 bg-card/20 backdrop-blur-sm">
                                        <div className="flex overflow-x-auto">
                                            {tabs.map((tab) => {
                                                const Icon = tab.icon;
                                                const isActive = activeTab === tab.id;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${isActive
                                                                ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                                                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card/30'
                                                            }`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        <span className="font-bold text-sm">{tab.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6 lg:p-8">
                                        {/* ONBOARDING TAB */}
                                        {activeTab === 'onboarding' && (
                                            <div className="space-y-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-foreground mb-2">Client Onboarding</h2>
                                                        <p className="text-muted-foreground">Send this form to clients to gather website requirements</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => copyToClipboard(window.location.origin + '/website-submissions', 'form-link')}
                                                        variant="outline"
                                                        className="gap-2"
                                                    >
                                                        {copiedItem === 'form-link' ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LinkIcon className="w-4 h-4" />
                                                                Copy Form Link
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Recent Submissions Preview */}
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground mb-4">Recent Submissions</h3>
                                                    <div className="space-y-3">
                                                        {mockSubmissions.slice(0, 3).map((sub) => (
                                                            <div key={sub.id} className="p-4 rounded-xl bg-card/30 border border-border/50 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2 h-2 rounded-full ${sub.status === 'new' ? 'bg-cyan-400 animate-pulse' :
                                                                            sub.status === 'ready' ? 'bg-teal-400' : 'bg-green-400'
                                                                        }`} />
                                                                    <div>
                                                                        <p className="font-bold text-foreground">{sub.clientName}</p>
                                                                        <p className="text-xs text-muted-foreground">{sub.businessType} • {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setActiveTab('submissions')}
                                                                    className="gap-2"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Embedded Form Preview */}
                                                <div className="p-6 rounded-xl bg-card/20 border border-border/30">
                                                    <p className="text-sm text-muted-foreground text-center">
                                                        Form preview coming soon. For now, use the "Copy Form Link" button above to share with clients.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* AGENCY BRAIN & PROMPTING TAB */}
                                        {activeTab === 'prompting' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-foreground mb-2">Agency Style Brain</h2>
                                                    <p className="text-muted-foreground">Our signature design system and prompt templates</p>
                                                </div>

                                                {/* Style Rules */}
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground mb-4">Core Design Principles</h3>
                                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {agencyBrainRules.map((rule, idx) => {
                                                            const Icon = rule.icon;
                                                            return (
                                                                <div key={idx} className="p-4 rounded-xl bg-card/30 border border-teal-500/20">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                                                            <Icon className="w-5 h-5 text-teal-400" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-sm text-foreground mb-1">{rule.title}</h4>
                                                                            <p className="text-xs text-muted-foreground leading-relaxed">{rule.description}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Business Type Selection */}
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground mb-4">Select Business Type</h3>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => setSelectedBusinessType(selectedBusinessType === 'homeServices' ? null : 'homeServices')}
                                                            className={`p-4 rounded-xl border-2 transition-all text-left ${selectedBusinessType === 'homeServices'
                                                                    ? 'border-teal-500 bg-teal-500/10'
                                                                    : 'border-border/50 bg-card/30 hover:border-teal-500/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <Home className={`w-6 h-6 ${selectedBusinessType === 'homeServices' ? 'text-teal-400' : 'text-muted-foreground'}`} />
                                                                <div>
                                                                    <h4 className="font-bold text-foreground mb-1">Home Services</h4>
                                                                    <p className="text-xs text-muted-foreground">With service areas (HVAC, Window Washing, etc.)</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedBusinessType(selectedBusinessType === 'localBusiness' ? null : 'localBusiness')}
                                                            className={`p-4 rounded-xl border-2 transition-all text-left ${selectedBusinessType === 'localBusiness'
                                                                    ? 'border-teal-500 bg-teal-500/10'
                                                                    : 'border-border/50 bg-card/30 hover:border-teal-500/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <Store className={`w-6 h-6 ${selectedBusinessType === 'localBusiness' ? 'text-teal-400' : 'text-muted-foreground'}`} />
                                                                <div>
                                                                    <h4 className="font-bold text-foreground mb-1">Local Business</h4>
                                                                    <p className="text-xs text-muted-foreground">Fixed location (Auto Shop, Garage, etc.)</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Prompt Templates */}
                                                {selectedBusinessType && (
                                                    <div>
                                                        <h3 className="text-lg font-bold text-foreground mb-4">Prompt Templates</h3>
                                                        <div className="space-y-4">
                                                            {Object.entries(promptTemplates).map(([category, templates]) => (
                                                                <div key={category}>
                                                                    <button
                                                                        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                                                                        className="w-full p-4 rounded-xl bg-card/30 border border-border/50 hover:border-teal-500/30 transition-all flex items-center justify-between"
                                                                    >
                                                                        <span className="font-bold text-foreground capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                                        <span className="text-teal-400">{expandedCategory === category ? '−' : '+'}</span>
                                                                    </button>
                                                                    {expandedCategory === category && (
                                                                        <div className="mt-2 space-y-2">
                                                                            {templates.map((template, idx) => (
                                                                                <div key={idx} className="p-4 rounded-xl bg-background/50 border border-border/30">
                                                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                                                        <h4 className="font-bold text-sm text-foreground">{template.title}</h4>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() => copyToClipboard(template.prompt, `${category}-${idx}`)}
                                                                                        >
                                                                                            {copiedItem === `${category}-${idx}` ? (
                                                                                                <Check className="w-4 h-4 text-green-400" />
                                                                                            ) : (
                                                                                                <Copy className="w-4 h-4" />
                                                                                            )}
                                                                                        </Button>
                                                                                    </div>
                                                                                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{template.prompt}</pre>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* BUILDER TAB */}
                                        {activeTab === 'builder' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-foreground mb-2">Website Builder</h2>
                                                    <p className="text-muted-foreground">Quick-launch to your preferred website builder</p>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <a
                                                        href="https://lovable.dev"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-6 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/30 hover:border-teal-500/50 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                                                <ExternalLink className="w-6 h-6 text-teal-400" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-foreground">Launch Website Builder</h3>
                                                                <p className="text-xs text-muted-foreground">Open in new tab</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">Start building with AI-powered prompts</p>
                                                    </a>

                                                    <div className="p-6 rounded-xl bg-card/30 border border-border/50">
                                                        <h3 className="font-bold text-foreground mb-3">Active Projects</h3>
                                                        <p className="text-sm text-muted-foreground">No active builds</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* SUBMISSIONS TAB */}
                                        {activeTab === 'submissions' && (
                                            <div className="space-y-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-foreground mb-2">Form Submissions</h2>
                                                        <p className="text-muted-foreground">All client onboarding submissions</p>
                                                    </div>
                                                    <Button variant="outline" className="gap-2">
                                                        <Download className="w-4 h-4" />
                                                        Export All
                                                    </Button>
                                                </div>

                                                {/* Submissions Table */}
                                                <div className="space-y-3">
                                                    {mockSubmissions.map((submission) => (
                                                        <div key={submission.id} className="p-4 rounded-xl bg-card/30 border border-border/50">
                                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <h3 className="font-bold text-foreground">{submission.clientName}</h3>
                                                                        <span className={`text-xs px-2 py-1 rounded-full ${submission.status === 'new' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                                                                                submission.status === 'ready' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' :
                                                                                    'bg-green-500/10 text-green-400 border border-green-500/30'
                                                                            }`}>
                                                                            {submission.status === 'new' ? 'New' : submission.status === 'ready' ? 'Ready' : 'Complete'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                                                        <p className="text-muted-foreground">{submission.businessType}</p>
                                                                        <p className="text-muted-foreground">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => copyToClipboard(generateLovablePrompt(submission), `website-${submission.id}`)}
                                                                        className="gap-2"
                                                                    >
                                                                        {copiedItem === `website-${submission.id}` ? (
                                                                            <>
                                                                                <Check className="w-4 h-4" />
                                                                                Copied!
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Sparkles className="w-4 h-4" />
                                                                                Copy Website Prompt
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="gap-2">
                                                                        <Download className="w-4 h-4" />
                                                                        PDF
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="gap-2">
                                                                        <Eye className="w-4 h-4" />
                                                                        Details
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </FuturisticWrapper>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WebsiteCommandCenter;
