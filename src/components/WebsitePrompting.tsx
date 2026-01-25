import { useState } from "react";
import { ChevronDown, Copy, Check, Sparkles, Home, Store, Wrench, Construction } from "lucide-react";
import FuturisticWrapper from "./ui/FuturisticWrapper";

interface PromptTemplate {
    title: string;
    prompt: string;
}

interface BusinessTypePrompts {
    [key: string]: {
        name: string;
        icon: any;
        hasServiceAreas: boolean;
        examples: string[];
        templates: PromptTemplate[];
    };
}

const businessTypePrompts: BusinessTypePrompts = {
    homeServices: {
        name: "Home Services",
        icon: Home,
        hasServiceAreas: true,
        examples: ["Window Washing", "Deck Maintenance", "HVAC", "Concrete Shield Coatings", "Landscaping", "Pool Cleaning"],
        templates: [
            {
                title: "Service Area Hero",
                prompt: `Create a hero section for a [SERVICE_TYPE] business serving [CITY/REGION].

HERO STRUCTURE:
- Dark background (#0a0a0b)
- Bold headline: "Professional [SERVICE_TYPE] in [CITY]"
- Subheadline: "[MAIN_BENEFIT] - Serving [SERVICE_AREAS]"
- Trust badge: "500+ Happy Homeowners" with 5 stars
- Primary CTA: "Get Free Quote" (red gradient button)
- Secondary CTA: Phone number with "Call Now" label
- Service area badges below (e.g., "Chicago • Naperville • Aurora")

COPY STYLE:
- Direct, benefit-focused
- Emphasize local presence
- Include guarantee or timeframe
- Under 20 words per element`
            },
            {
                title: "Service Areas Section",
                prompt: `Design a service areas section for [SERVICE_TYPE] business.

LAYOUT:
- Section title: "Areas We Serve"
- Grid of city/region cards (3-4 columns desktop, 1-2 mobile)
- Each card: City name, checkmark icon, "Book Service" link
- Map background (optional, subtle opacity)

CITIES TO INCLUDE: [LIST_OF_CITIES]

STYLING:
- Dark cards with red accent borders
- Hover effect: scale + glow
- Mobile-responsive grid
- SEO-optimized (H2 for title, H3 for cities)`
            },
            {
                title: "Home Services FAQ",
                prompt: `Create FAQ section for [SERVICE_TYPE] targeting homeowners in [REGION].

QUESTIONS TO INCLUDE:
1. "How much does [SERVICE_TYPE] cost in [CITY]?"
2. "Do you serve [NEARBY_CITY]?"
3. "What areas do you cover?"
4. "How quickly can you schedule service?"
5. "Are you licensed and insured?"

ANSWER FORMAT:
- Direct, under 30 words
- Include service areas naturally
- Mention guarantee/warranty
- End with CTA ("Book your service today")

SEO: Proper H2/H3 hierarchy, location keywords`
            }
        ]
    },
    localBusiness: {
        name: "Local Businesses",
        icon: Store,
        hasServiceAreas: false,
        examples: ["Truck Repair Shop", "PPF Garage", "Car Garage", "Auto Detailing", "Tire Shop"],
        templates: [
            {
                title: "Location-Based Hero",
                prompt: `Create a hero for [BUSINESS_TYPE] at [ADDRESS/LOCATION].

HERO ELEMENTS:
- Headline: "[BUSINESS_NAME] - [CITY]'s Trusted [BUSINESS_TYPE]"
- Subheadline: "[MAIN_BENEFIT] - Located at [LANDMARK/AREA]"
- Trust indicators: Years in business, Google rating, customer count
- Primary CTA: "Visit Us Today" or "Book Appointment"
- Address + phone prominently displayed
- Hours of operation badge

LOCATION EMPHASIS:
- Include neighborhood/landmark
- "Conveniently located near [LANDMARK]"
- Parking information if relevant
- Map embed or "Get Directions" link`
            },
            {
                title: "Local Business Services Grid",
                prompt: `Design services section for [BUSINESS_TYPE] in [CITY].

SERVICES STRUCTURE:
- 3-4 main services in grid layout
- Each service card:
  * Icon (wrench, car, tools, etc.)
  * Service name (bold, uppercase)
  * 1-line benefit
  * "Learn More" link
  * Pricing indicator (if applicable)

EXAMPLE SERVICES FOR AUTO SHOP:
- Oil Changes & Maintenance
- Brake Repair & Replacement
- Engine Diagnostics
- Tire Services

STYLING: Dark cards, red icons, hover effects`
            },
            {
                title: "Local Business Social Proof",
                prompt: `Create social proof section for [BUSINESS_NAME] in [CITY].

ELEMENTS TO INCLUDE:
- Google rating (5 stars) + review count
- "Trusted by [NUMBER]+ [CITY] residents"
- 2-3 customer testimonials (short quotes)
- Years in business badge
- Certifications/affiliations (if any)

TESTIMONIAL FORMAT:
- Customer name + vehicle/service type
- 15-20 word quote
- 5-star rating
- Photo placeholder

LAYOUT: Dark bg, testimonial cards in 2-column grid`
            }
        ]
    }
};

const styleBrainRules = {
    colors: [
        { name: "Background", value: "#0a0a0b", usage: "Primary dark bg" },
        { name: "Card Background", value: "#0f0f10", usage: "Elevated surfaces" },
        { name: "Primary Red", value: "#ef4444", usage: "CTAs, accents" },
        { name: "Red Dark", value: "#dc2626", usage: "Hover states" },
        { name: "Text Primary", value: "#ffffff", usage: "Headlines" },
        { name: "Text Secondary", value: "#a1a1aa", usage: "Body copy" }
    ],
    typography: [
        "Headlines: Bold/Black weight, uppercase for impact",
        "Body: 16-18px base, 1.6 line-height for readability",
        "Font: System fonts or Orbitron for futuristic feel",
        "Hierarchy: H1 (48-72px) > H2 (36-48px) > H3 (24-32px)"
    ],
    principles: [
        "Dark aesthetic + red accents for premium feel",
        "Bold uppercase headlines for authority",
        "Punchy minimal copy (under 20 words/section)",
        "Social proof above the fold (stars, stats)",
        "CTA within 3 seconds of landing",
        "Mobile-first responsive design",
        "SEO hierarchy: H1 > H2 > H3 structure",
        "Local SEO: City/region keywords naturally integrated",
        "Trust indicators: Reviews, years in business, guarantees",
        "Clear contact info: Phone, address, hours"
    ]
};

interface WebsitePromptingProps {
    submissionData?: {
        businessName?: string;
        businessType?: string;
        serviceAreas?: string[];
        location?: string;
        mainBenefit?: string;
    };
}

export default function WebsitePrompting({ submissionData }: WebsitePromptingProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [showStyleBrain, setShowStyleBrain] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
    const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);

    const copyToClipboard = async (text: string, id: string) => {
        // Replace placeholders with actual data if available
        let finalPrompt = text;
        if (submissionData) {
            finalPrompt = text
                .replace(/\[BUSINESS_NAME\]/g, submissionData.businessName || '[BUSINESS_NAME]')
                .replace(/\[SERVICE_TYPE\]/g, submissionData.businessType || '[SERVICE_TYPE]')
                .replace(/\[BUSINESS_TYPE\]/g, submissionData.businessType || '[BUSINESS_TYPE]')
                .replace(/\[CITY\]/g, submissionData.location || '[CITY]')
                .replace(/\[REGION\]/g, submissionData.location || '[REGION]')
                .replace(/\[MAIN_BENEFIT\]/g, submissionData.mainBenefit || '[MAIN_BENEFIT]')
                .replace(/\[SERVICE_AREAS\]/g, submissionData.serviceAreas?.join(', ') || '[SERVICE_AREAS]')
                .replace(/\[LIST_OF_CITIES\]/g, submissionData.serviceAreas?.join(', ') || '[LIST_OF_CITIES]');
        }

        await navigator.clipboard.writeText(finalPrompt);
        setCopiedPrompt(id);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <FuturisticWrapper>
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a0a0b] via-[#0f0f10] to-[#0a0a0b] border-2 border-primary/30 shadow-2xl shadow-primary/10">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-red-600 to-primary rounded-3xl blur-xl opacity-20" />

                    <div className="relative p-6 lg:p-8">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-black text-foreground font-orbitron">
                                        Website Prompting
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        AI-powered templates for high-converting websites
                                    </p>
                                </div>
                            </div>

                            {/* Submission Data Preview */}
                            {submissionData && (
                                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                    <h3 className="text-sm font-bold text-foreground mb-2">Client Submission Data</h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {submissionData.businessName && (
                                            <div>
                                                <span className="text-muted-foreground">Business:</span>{' '}
                                                <span className="text-foreground font-bold">{submissionData.businessName}</span>
                                            </div>
                                        )}
                                        {submissionData.businessType && (
                                            <div>
                                                <span className="text-muted-foreground">Type:</span>{' '}
                                                <span className="text-foreground font-bold">{submissionData.businessType}</span>
                                            </div>
                                        )}
                                        {submissionData.location && (
                                            <div>
                                                <span className="text-muted-foreground">Location:</span>{' '}
                                                <span className="text-foreground font-bold">{submissionData.location}</span>
                                            </div>
                                        )}
                                        {submissionData.serviceAreas && submissionData.serviceAreas.length > 0 && (
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">Service Areas:</span>{' '}
                                                <span className="text-foreground font-bold">{submissionData.serviceAreas.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Business Type Selection */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-foreground mb-4 font-orbitron flex items-center gap-2">
                                <Construction className="w-5 h-5 text-primary" />
                                Select Business Type
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(businessTypePrompts).map(([key, businessType]) => {
                                    const Icon = businessType.icon;
                                    const isSelected = selectedBusinessType === key;

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedBusinessType(isSelected ? null : key)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border/50 bg-card/30 hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary' : 'bg-primary/20'
                                                    }`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-foreground mb-1">{businessType.name}</h4>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        {businessType.hasServiceAreas ? 'With Service Areas' : 'Fixed Location'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {businessType.examples.slice(0, 3).map((example, idx) => (
                                                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground">
                                                                {example}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Prompt Templates for Selected Business Type */}
                        {selectedBusinessType && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-foreground mb-4 font-orbitron flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    {businessTypePrompts[selectedBusinessType].name} Templates
                                </h3>
                                <div className="space-y-3">
                                    {businessTypePrompts[selectedBusinessType].templates.map((template, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-background/50 border border-border/30">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <h4 className="font-bold text-foreground">{template.title}</h4>
                                                <button
                                                    onClick={() => copyToClipboard(template.prompt, `${selectedBusinessType}-${idx}`)}
                                                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors flex-shrink-0"
                                                    title="Copy prompt"
                                                >
                                                    {copiedPrompt === `${selectedBusinessType}-${idx}` ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                            <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
                                                {template.prompt}
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Agency Style Brain */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowStyleBrain(!showStyleBrain)}
                                className="w-full px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Wrench className="w-5 h-5 text-primary" />
                                    <span className="font-bold text-foreground font-orbitron">Agency Style Brain</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-primary transition-transform ${showStyleBrain ? 'rotate-180' : ''}`} />
                            </button>

                            {showStyleBrain && (
                                <div className="mt-4 p-4 rounded-xl bg-background/50 border border-border/30 space-y-4">
                                    {/* Colors */}
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground mb-3">Color Tokens</h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                            {styleBrainRules.colors.map((color) => (
                                                <div key={color.name} className="p-2 rounded-lg bg-card/30 border border-border/20">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div
                                                            className="w-6 h-6 rounded border border-white/20"
                                                            style={{ backgroundColor: color.value }}
                                                        />
                                                        <span className="text-xs font-bold text-foreground">{color.name}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{color.value}</p>
                                                    <p className="text-[10px] text-muted-foreground">{color.usage}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Typography */}
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground mb-3">Typography Rules</h4>
                                        <ul className="space-y-1">
                                            {styleBrainRules.typography.map((rule, idx) => (
                                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{rule}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Core Principles */}
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground mb-3">Core Principles</h4>
                                        <ul className="space-y-1">
                                            {styleBrainRules.principles.map((principle, idx) => (
                                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                                    <span className="text-primary mt-1">✓</span>
                                                    <span>{principle}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </FuturisticWrapper>
        </div>
    );
}
