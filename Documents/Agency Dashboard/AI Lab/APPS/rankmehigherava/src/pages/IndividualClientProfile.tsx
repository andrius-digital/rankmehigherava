import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Building2,
    Globe,
    Phone,
    Mail,
    MapPin,
    ArrowLeft,
    ExternalLink,
    Calendar,
    Clock,
    Activity,
    FileText,
    Settings,
    BarChart3,
    CheckCircle2,
    XCircle,
    Github,
    Server,
    UserCheck,
    ShieldCheck,
    Link2,
    MessageSquare,
    CreditCard,
    Wrench,
    DollarSign,
    Home,
    History,
    Receipt,
    Plus,
    Layers,
    List,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    Briefcase,
    Image as ImageIcon,
    X,
    ZoomIn,
    TrendingUp,
    Edit2,
    Upload,
    Bell,
    Trash2,
    PenLine,
    Save,
    MoreVertical,
    Search,
    Database,
    Lock,
    Key,
    Shield,
    Zap,
    Send,
    Share2,
    Users,
    User,
    Star,
    Heart,
    Bookmark,
    Tag,
    Package,
    Code,
    Terminal,
    Wifi,
    Cloud,
    Download,
    RefreshCw,
    Play,
    Pause,
    Video,
    Camera,
    Mic,
    Music,
    Map,
    Navigation,
    Compass,
    Target,
    Award,
    Trophy,
    Gift,
    ShoppingCart,
    Store,
    Truck,
    Plane,
    Car,
    Rocket,
    Flame,
    Sun,
    Moon,
    Palette,
    Paintbrush,
    Scissors,
    Wrench as ToolIcon,
    Hammer,
    Cpu,
    HardDrive,
    Monitor,
    Smartphone,
    Tablet,
    Watch,
    Headphones,
    Speaker,
    Radio,
    Tv,
    Gamepad2,
    Bot,
    Brain,
    Sparkles,
    Lightbulb,
    AlertCircle,
    Info,
    HelpCircle,
    MessageCircle,
    AtSign,
    Hash,
    Link as LinkIcon,
    Paperclip,
    Folder,
    FolderOpen,
    File,
    FileCode,
    FilePlus,
    FileCheck,
    ClipboardCheck,
    ClipboardList,
    ListChecks,
    LayoutDashboard,
    PieChart,
    LineChart,
    Percent,
    Calculator,
    Wallet,
    Banknote,
    Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { compressImage } from '@/utils/imageCompression';

// Checklist item interface
interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    notes: string;
    isDefault?: boolean; // Default items cannot be deleted
    display_order?: number;
}

// Global checklist item from Supabase
interface GlobalChecklistItem {
    id: string;
    label: string;
    description: string;
    display_order: number;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

// Client-specific checklist status from Supabase
interface ClientChecklistStatus {
    id: string;
    client_id: string;
    checklist_item_id: string;
    checked: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

// Global client service item from Supabase
interface GlobalClientService {
    id: string;
    label: string;
    description: string;
    display_order: number;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

// Client-specific service status from Supabase
interface ClientServiceStatus {
    id: string;
    client_id: string;
    service_item_id: string;
    checked: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

// Service item interface (combined)
interface ServiceItem {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    notes: string;
    isDefault?: boolean;
    display_order?: number;
}

// Toggle Item Component with expandable notes, edit and delete functionality
const ToggleItem = ({
    label,
    description,
    checked,
    onChange,
    icon: Icon,
    color = 'cyan',
    notes = '',
    onNotesChange,
    placeholder = 'Add notes for the team...',
    onEdit,
    onDelete,
    canDelete = false
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'cyan' | 'emerald' | 'purple' | 'orange';
    notes?: string;
    onNotesChange?: (notes: string) => void;
    placeholder?: string;
    onEdit?: (newLabel: string, newDescription: string) => void;
    onDelete?: () => void;
    canDelete?: boolean;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [isEditingItem, setIsEditingItem] = useState(false);
    const [localNotes, setLocalNotes] = useState(notes);
    const [editLabel, setEditLabel] = useState(label);
    const [editDescription, setEditDescription] = useState(description || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const colorClasses = {
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    };

    const handleSaveNotes = () => {
        onNotesChange?.(localNotes);
        setIsEditingNotes(false);
    };

    const handleSaveItemEdit = () => {
        if (onEdit && editLabel.trim()) {
            onEdit(editLabel.trim(), editDescription.trim());
            setIsEditingItem(false);
        }
    };

    const handleCancelItemEdit = () => {
        setEditLabel(label);
        setEditDescription(description || '');
        setIsEditingItem(false);
    };

    return (
        <div className="rounded-xl bg-card/20 border border-white/5 hover:border-white/10 transition-all overflow-hidden">
            <div
                className="flex items-center justify-between py-3 px-4 cursor-pointer"
                onClick={() => !isEditingItem && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${colorClasses[color]}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    {isEditingItem ? (
                        <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="w-full px-2 py-1 text-sm bg-zinc-900/50 border border-purple-500/30 rounded text-foreground focus:outline-none focus:border-purple-400"
                                placeholder="Item name"
                                autoFocus
                            />
                            <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full px-2 py-1 text-[10px] bg-zinc-900/50 border border-purple-500/30 rounded text-muted-foreground focus:outline-none focus:border-purple-400"
                                placeholder="Description (optional)"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveItemEdit}
                                    className="px-2 py-1 text-[10px] bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelItemEdit}
                                    className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{label}</p>
                            {description && <p className="text-[10px] text-muted-foreground truncate">{description}</p>}
                        </div>
                    )}
                </div>
                {!isEditingItem && (
                    <div className="flex items-center gap-2">
                        {(onEdit || (onDelete && canDelete)) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <button className="p-1 hover:bg-white/5 rounded transition-colors">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                                    {onEdit && (
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditingItem(true);
                                            }}
                                            className="text-xs cursor-pointer"
                                        >
                                            <PenLine className="w-3 h-3 mr-2" />
                                            Edit Item
                                        </DropdownMenuItem>
                                    )}
                                    {onDelete && canDelete && (
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDeleteConfirm(true);
                                            }}
                                            className="text-xs text-red-400 cursor-pointer focus:text-red-400"
                                        >
                                            <Trash2 className="w-3 h-3 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        <div onClick={(e) => e.stopPropagation()}>
                            <Switch checked={checked} onCheckedChange={onChange} />
                        </div>
                    </div>
                )}
            </div>

            {isExpanded && !isEditingItem && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">Team Notes</span>
                        {!isEditingNotes && (
                            <button
                                onClick={() => setIsEditingNotes(true)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                <Edit2 className="w-3 h-3" />
                                Edit
                            </button>
                        )}
                    </div>

                    {isEditingNotes ? (
                        <div className="space-y-2">
                            <textarea
                                value={localNotes}
                                onChange={(e) => setLocalNotes(e.target.value)}
                                placeholder={placeholder}
                                className="w-full px-3 py-2 text-sm bg-zinc-900/50 border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 resize-none"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setLocalNotes(notes);
                                        setIsEditingNotes(false);
                                    }}
                                    className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-md hover:bg-cyan-500/30 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {notes || <span className="italic text-muted-foreground/50">No notes yet. Click Edit to add.</span>}
                        </p>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-zinc-900 border-red-500/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">Delete Checklist Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{label}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete?.();
                                setShowDeleteConfirm(false);
                            }}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// Form Field Display Component
const FormField = ({ 
    label, 
    value, 
    badge = false,
    link = false 
}: { 
    label: string; 
    value: string; 
    badge?: boolean;
    link?: boolean;
}) => (
    <div>
        <p className="text-[9px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        {badge ? (
            <Badge className={`font-orbitron text-[10px] ${value === 'Yes' || value === 'Include' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                {value}
            </Badge>
        ) : link ? (
            <a href={value?.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm hover:underline flex items-center gap-1">
                {value} <ExternalLink className="w-3 h-3" />
            </a>
        ) : (
            <p className="text-foreground text-sm">{value || 'N/A'}</p>
        )}
    </div>
);

// Featured demo client - Off Tint
const offTintClient = {
    id: 'off-tint',
    name: 'Off Tint',
    company_name: 'Off Tint',
    website_url: 'https://off-tint.com',
    email: 'info@off-tint.com',
    phone: '(312) 555-TINT',
    primary_services: ['Window Tinting', 'Ceramic Coating', 'PPF Installation', 'Interior Detailing'],
    brand_voice: 'Professional, Premium, Automotive Expert',
    target_audience: 'Car enthusiasts, luxury vehicle owners, fleet managers',
    status: 'ACTIVE',
    notes: 'Featured client - Premium automotive services provider in Chicago area.',
    created_at: '2024-01-15T00:00:00Z',
};

// Property Refresh Maids - PDF submission Jan 2026
const propertyRefreshClient = {
    id: 'property-refresh-maids',
    name: 'Property Refresh Maids',
    company_name: 'Property Refresh Maids',
    website_url: 'https://propertyrefreshmaids.com',
    email: 'propertyrefreshinc@gmail.com',
    phone: '(224) 386-4836',
    primary_services: ['Regular Cleaning', 'Deep Cleaning', 'Move In/Out Cleaning', 'Post Construction Cleaning'],
    brand_voice: 'Professional, Reliable, Thorough',
    target_audience: 'Homeowners and businesses in the North Chicago suburbs seeking high-quality cleaning services',
    status: 'PENDING',
    notes: 'Onboarded via PDF submission Jan 2026.',
    created_at: '2026-01-11T00:00:00Z',
    // Full Form Submission Data
    form_submission: {
        // Section 1: Business Information
        official_company_name: 'Property Refresh Maids',
        owns_domain: true,
        domain_name: 'www.propertyrefreshmaids.com',
        business_phone: '(224) 386-4836',
        business_email: 'propertyrefreshinc@gmail.com',
        job_requests_email: 'propertyrefreshinc@gmail.com',
        // Section 2: Location & Hours
        main_city: 'Northbrook',
        state_province: 'IL',
        service_areas: [
            'Northbrook, IL', 'Winnetka, IL', 'Glencoe, IL', 'Wilmette, IL', 'Kenilworth, IL',
            'Evanston, IL', 'Skokie, IL', 'Niles, IL', 'Northfield, IL', 'Mt Prospect, IL',
            'Glenview, IL', 'Deerfield, IL', 'Riverwoods, IL', 'Lincolnshire, IL', 'Highland Park, IL',
            'Bannockburn, IL', 'Lake Forest, IL', 'Lake Bluff, IL', 'Gurnee, IL', 'Libertyville, IL',
            'Mettawa, IL', 'Grayslake, IL', 'Vernon Hills, IL', 'Mundelein, IL', 'Long Grove, IL',
            'Buffalo Grove, IL', 'Arlington Heights, IL', 'Wheeling, IL', 'Prospect Heights, IL',
            'Park Ridge, IL', 'Palatine, IL', 'Inverness, IL', 'Rolling Meadows, IL', 'Kildeer, IL',
            'Barrington, IL', 'North of Chicago city'
        ],
        display_address: false,
        business_address: '3287 Monitor Ln, Long Grove, IL 60047',
        show_operating_hours: true,
        operating_hours: {
            monday: { open: true, hours: '8 AM - 5 PM' },
            tuesday: { open: true, hours: '8 AM - 5 PM' },
            wednesday: { open: true, hours: '8 AM - 5 PM' },
            thursday: { open: true, hours: '8 AM - 5 PM' },
            friday: { open: true, hours: '8 AM - 5 PM' },
            saturday: { open: true, hours: '8 AM - 2 PM' },
            sunday: { open: false, hours: 'Closed' }
        },
        // Section 3: Focus & Services
        service_category: 'House Cleaning',
        services: [
            { name: 'Regular Cleaning / Recurring House Cleaning', description: 'Dusting all accessible surfaces, Vacuuming and mopping, Making beds, changing linens, Stove, oven and fridge exterior cleaning, mirrors and glass fixtures cleaning, Wiping of exterior cabinets surfaces, toilets, tubs, showers cleaning and disinfecting' },
            { name: 'Deep Cleaning / Move In-Out Cleaning', description: 'Regular cleaning + baseboards, ceiling fans, stove, oven, fridge and cabinets interior cleaning' },
            { name: 'Post Construction Cleaning', description: 'Thorough cleaning after construction work' }
        ],
        include_service_pages: true,
        show_pricing: true,
        one_service_page: false,
        pages_to_include: ['Blog Page', 'About Us Page', 'Contact Page'],
        free_estimates: true,
        customer_action: 'Request a free quote � you receive their contact details',
        client_type: 'Both residential and commercial',
        typical_job_length: '1-5 business days, depending on client preference and availability',
        // Section 4: Process & Operations
        service_process: ['Received a request', 'Schedule an on site estimate or a service', 'Crew comes over to perform the job'],
        emergency_services: ['Same-day repairs', 'Temporary fixes until full service'],
        service_methods: 'Need advise on that',
        guarantees: 'We will come back to re-clean if anything was missed. Reasonable refund if re-cleaning is not possible for any reason.',
        unique_selling_points: 'High intense training. Technician goes through training process in the company locations first, then works with supervisor only, technician can work alone after supervisor approved as ready.',
        // Section 5: Trust & Credibility
        customer_trust: 'Positive ratings on Google, Yelp, Facebook, Angie, Thumbtack, Nextdoor, etc.',
        certifications: 'BBB',
        insurance_support: false,
        // Section 6: Team & Story
        founder_message: "Property Refresh's professional cleaning crew members work in teams or alone depending on the need. They are equipped with their own cleaning supplies (vacuum cleaners, detergents, mops etc.). We hire only the very best cleaners and ensure they are properly trained. All our crew members are insured, bonded and experienced.",
        // Section 7: Branding & Visuals
        website_colors: 'Dark blue, light blue, white, gray. Check out https://www.property-refresh.com/house-cleaning',
        has_specific_font: false,
        has_brand_book: false,
        // Section 8: Online Presence
        google_profile: true,
        google_reviews: true,
        google_reviews_link: 'https://maps.app.goo.gl/6py4a3mLXN7eV6fB7',
        social_media_links: [
            'https://www.yelp.com/biz/property-refresh-buffalo-grove-4?osq=PropertyRefresh&override_cta=Get+a+quote',
            'https://www.facebook.com/PropertyRefreshInc/',
            'https://www.angi.com/companylist/us/il/buffalo-grove/property-refresh-inc-reviews-9129224.htm',
            'https://nextdoor.com/page/property-refresh-buffalo-grove-il',
            'https://www.instagram.com/propertyrefreshinc/?hl=en'
        ],
        has_work_photos: true,
        // Section 9: Offers, Payments, Financing
        special_offers: true,
        special_offers_details: 'Discount for the 1st time service',
        financing: false,
        // Section 10: Content & Inspiration
        additional_notes: 'Need advise'
    }
};

// Klean And Fresh Housekeeping LLC - Full JotForm submission Dec 11, 2025
const kleanAndFreshClient = {
    id: 'klean-and-fresh',
    name: 'Klean And Fresh Housekeeping LLC',
    company_name: 'Klean And Fresh Housekeeping LLC',
    website_url: 'https://kleanandfresh.com',
    email: 'contact@kleanandfresh.com',
    phone: '(619) 346-1985',
    primary_services: ['Monthly Upkeep', 'Biweekly Upkeep', 'Weekly Upkeep', 'Room Reset', 'Kitchen Reset', 'Standard Deep Clean', 'Standard Kitchen Deep Clean'],
    brand_voice: 'Professional, Reliable, Eco-Friendly',
    target_audience: 'Busy professionals, homeowners in San Diego area seeking high-quality cleaning services',
    status: 'ACTIVE',
    notes: 'Onboarded via JotForm Dec 11, 2025.',
    created_at: '2025-12-11T10:38:00Z',
    // Full Form Submission Data
    form_submission: {
        // Section 1: Business Information
        official_company_name: 'Klean And Fresh Housekeeping LLC',
        owns_domain: true,
        domain_name: 'www.kleanandfresh.com',
        business_phone: '(619) 346-1985',
        business_email: 'contact@kleanandfresh.com',
        job_requests_email: 'contact@kleanandfresh.com',
        // Section 2: Location & Hours
        main_city: 'San Diego',
        state_province: 'CA',
        service_areas: [
            'Ramona, CA', 'San Diego Country Estates, CA', 'Santa Ysabel, CA', 'Julian, CA', 'Ranchita, CA',
            'Warner Springs, CA', 'Jacumba Hot Springs, CA', 'Tecate, CA (U.S. side)', 'Wynola, CA', 'Bonita, CA',
            'Chula Vista, CA', 'Eastlake, CA', 'Otay Ranch, CA', 'Otay Mesa, CA', 'Otay Mesa West, CA',
            'San Ysidro, CA', 'Imperial Beach, CA', 'National City, CA', 'Egger Highlands, CA', 'Nestor, CA',
            'Palm City, CA', 'South San Diego, CA', 'La Mesa, CA', 'El Cajon, CA', 'Santee, CA',
            'Lakeside, CA', 'Alpine, CA', 'Harbison Canyon, CA', 'Dehesa, CA', 'Jamul, CA',
            'Spring Valley, CA', 'Casa de Oro, CA', 'Mt. Helix, CA', 'Rancho San Diego, CA', 'Fletcher Hills, CA',
            'Bostonia, CA', 'Blossom Valley, CA', 'Pine Valley, CA', 'Descanso, CA', 'Guatay, CA',
            'Boulevard, CA', '4S Ranch, CA', 'Rancho Bernardo, CA', 'Rancho Pe�asquitos, CA', 'Black Mountain Ranch, CA',
            'Del Sur, CA', 'Scripps Ranch, CA', 'Mira Mesa, CA', 'Sabre Springs, CA', 'Carmel Mountain Ranch, CA',
            'Poway, CA', 'San Marcos, CA', 'Escondido, CA', 'Valley Center, CA', 'Twin Oaks Valley, CA',
            'Hidden Meadows, CA', 'Bonsall, CA', 'Fallbrook, CA', 'Rainbow, CA', 'Pala, CA',
            'Pauma Valley, CA', 'Cardiff-by-the-Sea, CA', 'Leucadia, CA', 'Olivenhain, CA', 'La Costa, CA',
            'Rancho Santa Fe, CA', 'Fairbanks Ranch, CA', 'La Jolla, CA', 'Pacific Beach, CA', 'Mission Beach, CA',
            'Point Loma, CA', 'Ocean Beach, CA', 'Clairemont, CA', 'Kearny Mesa, CA', 'Linda Vista, CA',
            'Serra Mesa, CA', 'Mission Valley, CA', 'Normal Heights, CA', 'North Park, CA', 'South Park, CA',
            'Hillcrest, CA', 'Bankers Hill, CA', 'Old Town, CA', 'Golden Hill, CA', 'Midtown, CA',
            'Torrey Pines, CA', 'Torrey Hills, CA', 'Sorrento Valley, CA', 'Sorrento Mesa, CA', 'Carmel Valley, CA',
            'San Diego, CA', 'Carlsbad, CA', 'Chula Vista, CA', 'Coronado, CA', 'Del Mar, CA',
            'Encinitas, CA', 'Escondido, CA', 'Imperial Beach, CA', 'La Mesa, CA', 'Lemon Grove, CA',
            'National City, CA', 'Oceanside, CA', 'Poway, CA', 'San Marcos, CA', 'Santee, CA',
            'Solana Beach, CA', 'Vista, CA'
        ],
        display_address_on_website: false,
        business_address: '1776 Eldora Street',
        business_city: 'Lemon Grove',
        business_state: 'CA',
        business_zip: '91945',
        display_hours_on_website: true,
        operating_hours: {
            monday: { open: '7 AM', close: '8 PM', is_open: true },
            tuesday: { open: '7 AM', close: '8 PM', is_open: true },
            wednesday: { open: '7 AM', close: '8 PM', is_open: true },
            thursday: { open: '7 AM', close: '8 PM', is_open: true },
            friday: { open: '7 AM', close: '8 PM', is_open: true },
            saturday: { open: '7 AM', close: '8 PM', is_open: true },
            sunday: { open: '7 AM', close: '8 PM', is_open: true },
        },
        // Section 3: Services
        service_category: 'Home Cleaning Services',
        services_list: [
            { name: 'Monthly Upkeep', price: '$75/room', description: 'A scheduled, high-detail maintenance service designed to keep your home consistently clean, healthy, and reset every month. We focus on preventing buildup in kitchens, bathrooms, floors, and high-touch areas, using eco-friendly products and hotel-grade methods.' },
            { name: 'Biweekly Upkeep', price: '$67.50/room', description: 'A scheduled, high-detail maintenance service designed to keep your home consistently clean, healthy, and reset every month. We focus on preventing buildup in kitchens, bathrooms, floors, and high-touch areas, using eco-friendly products and hotel-grade methods.' },
            { name: 'Weekly Upkeep', price: '$60/room', description: 'A scheduled, high-detail maintenance service designed to keep your home consistently clean, healthy, and reset every month. We focus on preventing buildup in kitchens, bathrooms, floors, and high-touch areas, using eco-friendly products and hotel-grade methods.' },
            { name: 'Room Reset', price: '$100/room', description: 'A focused, high-impact deep clean for a single room that restores it to a like-new state. We dismantle, detail, and sanitize every surface�scrubbing buildup, removing hidden grime, and refreshing the space with eco-friendly, hotel-grade methods.' },
            { name: 'Kitchen Reset', price: '$200', description: 'A comprehensive deep restoration of your kitchen, designed to eliminate buildup and restore a polished, like-new feel. We detail every surface�counters, cabinets, appliances, fixtures, glass, and hard-to-reach areas�removing grease, grime, and hidden residue.' },
            { name: 'Standard Deep Clean', price: '$150/room', description: 'A thorough, detail-forward clean that goes deeper than regular maintenance but without the full dismantling of a Reset. We address buildup on surfaces, baseboards, floors, fixtures, and high-touch areas while refreshing the room\'s overall feel.' },
            { name: 'Standard Kitchen Deep Clean', price: '$300', description: 'A solid, above-maintenance deep clean focused on restoring cleanliness and removing moderate buildup throughout the kitchen. We clean exterior appliance surfaces, accessible cabinet fronts, backsplash, counters, sink, fixtures, and flooring.' },
        ],
        include_service_page: true,
        display_pricing_on_website: false,
        service_page_type: 'Separate Pages',
        pages_to_include: ['Service Pages', 'Blog Page', 'About Page', 'Contact Page', 'Service Area Pages'],
        free_estimates: true,
        customer_action: 'They request a free quote � you receive their contact details.',
        client_type: 'Residential only',
        job_duration: 'Upkeep room cleanings take anywhere from 30-60 minutes per room, Standard Deep Cleanings take ~2hrs per room, Standard Kitchen Deep Cleanings take ~4hrs, Full Room Resets take on average 10 working hours per room, Full Kitchen Resets take on average 20 working hours.',
        homeowner_challenges: 'Common challenges homeowners face in San Diego include a lack of time, proper tools, and the specialized skills needed to keep a home deeply clean and consistently maintained. Many busy professionals simply don\'t have the bandwidth to take on detailed cleaning tasks.',
        // Section 4: Process & Operations
        service_process: '1. Initial Contact & Service Match\nWhen a homeowner reaches out, we quickly identify which service fits their needs�Monthly Upkeep, a Standard Deep Clean, or a full Reset. We confirm scope, timelines, and expectations so clients know exactly what will be handled.\n\n2. Walkthrough or Assessment (Virtual or In-Person)\nFor deep or restorative services, we perform a brief walkthrough to evaluate the condition of the home, note problem areas, and align on priorities.\n\n3. Proposal & Scheduling\nWe deliver a clear service outline and schedule the job at a time convenient for the homeowner.\n\n4. The Cleaning Process\nOur team arrives prepared with professional eco-friendly solutions and commercial-grade equipment.\n\n5. Final Review & Completion\nAt the end of the service, we conduct a walkthrough with the homeowner to ensure every priority was addressed.',
        emergency_services: ['No emergency services'],
        service_options: 'We offer three structured service tiers designed to meet homeowners at different levels of need. Our Monthly Upkeep service provides routine maintenance using eco-friendly products and efficient, hotel-style cleaning methods.',
        guarantees: 'Our guarantee: If our client feels like a spot was missed we\'ll come back within 48 hours to fix it or their service is free.',
        unique_value: 'Truly Deep Cleaning: We reset your home to like-new condition by cleaning far beyond the surface. Every nook, cranny, and fixture is meticulously addressed � going above and beyond what standard maid services offer.\n\nEco-Friendly & Safe: Our cleaning approach is non-toxic and eco-conscious, ensuring a healthy home environment. We use high-end equipment like HEPA-filter vacuums and steam cleaners to remove dirt, allergens, and germs without harsh chemicals.\n\nPremium, Reliable Service: Enjoy peace of mind with our vetted, trustworthy cleaning team and consistently high-quality results.',
        // Section 5: Trust & Credibility
        quality_trust: '4 Years in business, Multiple years of working experience behind each cleaner, we use HEPA certified vacuums, high powered steamers, and vetted eco-friendly products. Our business is covered under liability insurance, and each cleaning is backed by a 48 hour guarantee: if we miss a spot we\'ll come back or the service is free.',
        accreditations: 'BBB Accredited, Angi 2025 Super Service Award, Thumbtack Top Pro',
        insurance_help: ['This does not apply for my business'],
        // Section 6: Team & Story
        founder_message: 'Jakob Scott, Founder � In 2021 I began this work as a side gig because I always enjoyed how cleaning made me feel, especially when my own space was clean. I found I loved talking to the people I worked for at the end of the job, as they were often hardworking and had lived interesting lives. At the same time, many of these folks had struggled to find reliable help with their home. I began to understand more how valuable time, focus, and consistency were for myself and the people I worked for. That\'s why my aim over the past four years is to provide quality cleaners with these same values for the many clients who trust me. It\'s with focus, consistency, and a clean home that we can tackle life on life\'s terms.',
        team_members: 'Not at this time',
        community_giving: 'We actively donate profits to the San Diego Narcotics Anonymous fellowship',
        core_values: 'Articulate Quality\nTailor Service\nEarn Trust',
        // Section 7: Branding & Visuals
        has_logo: true,
        logo_url: 'Klean AF Logo',
        website_colors: 'If you have solid ideas, I\'m flexible in my branding. Personally I like black and sand/tan/white, and those are the colors of our uniforms. I\'m open to new ideas if there\'s data/proof that it sells or catches attention better.',
        has_specific_font: true,
        font_name: 'Times New Roman type style, classic and professional. It matches my logo somewhat too. But I\'m open',
        has_brand_book: false,
        // Section 8: Online Presence
        google_business_profile: 'https://share.google/mcy5Y2kDxTq9zcvXl',
        google_reviews: 'Yes - display on website',
        other_reviews_link: 'https://www.thumbtack.com/ca/lemon-grove/house-cleaning/klean-af/service/516078354765774857',
        social_media_links: [
            'www.linkedin.com/in/jakob-scott-5a8944196',
            'https://www.youtube.com/@KleanAF_SanDiego',
            'https://www.instagram.com/kleanafsd/',
            'https://www.facebook.com/profile.php?id=61581143906695',
            'https://nextdoor.com/page/klean-and-fresh-lemon-grove-ca',
            'https://x.com/kleanafsd?s=11'
        ],
        work_photos_link: 'https://drive.google.com/file/d/1LRoNBtYn6mim4ky9aTQ76eqXX2Ap45X1/view?usp=drive_link',
        work_photos_note: 'These are the raw videos I have, I\'m not sure what would be best for you to use so if you let me know if you\'re looking for something more precise I can solely include those assets in a separate folder',
        // Section 9: Offers, Payments, Financing
        special_offers: true,
        special_offers_details: 'If clients prepay for a year they get three months off, if they prepay for six months they get 1 month off. Baked into the service price clients get 10% discounts for biweekly services and 20% discounts for weekly services',
        financing: true,
        financing_details: 'We offer financing through Wisetack',
        // Section 10: Content & Inspiration
        competitor_websites: [
            'https://metlahousecleaningsandiego.com/',
            'https://www.maid2cleansd.com/',
            'https://www.mollymaid.com/locations/california/solana-beach/'
        ],
        additional_notes: 'No, I\'m open to what works'
    }
};

// Image Gallery Component with popup support
const ImageGallery = ({ 
    images, 
    label, 
    onImageClick 
}: { 
    images: string[] | undefined | null; 
    label: string; 
    onImageClick: (url: string) => void;
}) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
        return (
            <div>
                <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-2">{label}</p>
                <p className="text-foreground text-sm">No images uploaded</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-2">{label}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((url: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => onImageClick(url)}
                        className="relative aspect-square rounded-lg overflow-hidden border border-cyan-500/20 hover:border-cyan-400 transition-all group"
                    >
                        <img 
                            src={url} 
                            alt={`${label} ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const IndividualClientProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isOffTint = id === 'off-tint';
    const isKleanAndFresh = id === 'klean-and-fresh';
    const isPropertyRefresh = id === 'property-refresh-maids';
    const isFeaturedClient = isOffTint || isKleanAndFresh || isPropertyRefresh;

    // Client Services state - now synced with Supabase
    const [clientServices, setClientServices] = useState<ServiceItem[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);

    // Add new service dialog state
    const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
    const [newServiceLabel, setNewServiceLabel] = useState('');
    const [newServiceDescription, setNewServiceDescription] = useState('');

    // Fetch global client services from Supabase
    const { data: globalClientServices, refetch: refetchGlobalServices } = useQuery({
        queryKey: ['global-client-services'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('global_client_services')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data as GlobalClientService[];
        },
    });

    // Fetch client-specific service status from Supabase
    const { data: clientServicesStatus, refetch: refetchServicesStatus } = useQuery({
        queryKey: ['client-services-status', id],
        queryFn: async () => {
            if (!id) return [];
            const { data, error } = await supabase
                .from('client_services_status')
                .select('*')
                .eq('client_id', id);
            if (error) throw error;
            return data as ClientServiceStatus[];
        },
        enabled: !!id,
    });

    // Combine global services with client-specific status
    useEffect(() => {
        if (globalClientServices) {
            const combined: ServiceItem[] = globalClientServices.map(item => {
                const clientStatus = clientServicesStatus?.find(s => s.service_item_id === item.id);
                return {
                    id: item.id,
                    label: item.label,
                    description: item.description,
                    checked: clientStatus?.checked ?? false,
                    notes: clientStatus?.notes ?? '',
                    isDefault: item.is_default,
                    display_order: item.display_order,
                };
            });
            setClientServices(combined);
            setServicesLoading(false);
        }
    }, [globalClientServices, clientServicesStatus]);

    // Helper functions for client services management
    const updateServiceItem = async (itemId: string, updates: Partial<ServiceItem>) => {
        // Optimistic update
        setClientServices(prev =>
            prev.map(item => item.id === itemId ? { ...item, ...updates } : item)
        );

        // Only sync 'checked' and 'notes' to client_services_status (per-client)
        if (id && ('checked' in updates || 'notes' in updates)) {
            const existingStatus = clientServicesStatus?.find(s => s.service_item_id === itemId);

            if (existingStatus) {
                // Update existing status
                await supabase
                    .from('client_services_status')
                    .update({
                        checked: 'checked' in updates ? updates.checked : existingStatus.checked,
                        notes: 'notes' in updates ? updates.notes : existingStatus.notes,
                    })
                    .eq('id', existingStatus.id);
            } else {
                // Insert new status
                await supabase
                    .from('client_services_status')
                    .insert({
                        client_id: id,
                        service_item_id: itemId,
                        checked: 'checked' in updates ? updates.checked : false,
                        notes: 'notes' in updates ? updates.notes : '',
                    });
            }
            refetchServicesStatus();
        }
    };

    const addServiceItem = async () => {
        if (!newServiceLabel.trim()) return;

        // Get the next display order
        const maxOrder = Math.max(...(globalClientServices?.map(i => i.display_order) || [0]), 0);

        // Insert into global_client_services (syncs to all clients)
        const { error } = await supabase
            .from('global_client_services')
            .insert({
                label: newServiceLabel.trim(),
                description: newServiceDescription.trim(),
                display_order: maxOrder + 1,
                is_default: false,
            });

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to add service item',
                variant: 'destructive',
            });
            return;
        }

        // Refetch to sync
        refetchGlobalServices();

        setNewServiceLabel('');
        setNewServiceDescription('');
        setShowAddServiceDialog(false);

        toast({
            title: 'Service Added',
            description: 'Service item added and synced to all clients',
        });
    };

    const deleteServiceItem = async (itemId: string) => {
        // Delete from global_client_services (cascades to client_services_status)
        const { error } = await supabase
            .from('global_client_services')
            .delete()
            .eq('id', itemId);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete service item',
                variant: 'destructive',
            });
            return;
        }

        // Optimistic update
        setClientServices(prev => prev.filter(item => item.id !== itemId));
        refetchGlobalServices();

        toast({
            title: 'Service Deleted',
            description: 'Service item removed from all clients',
        });
    };

    const editServiceItem = async (itemId: string, newLabel: string, newDescription: string) => {
        // Update global_client_services (syncs to all clients)
        const { error } = await supabase
            .from('global_client_services')
            .update({
                label: newLabel,
                description: newDescription,
            })
            .eq('id', itemId);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to update service item',
                variant: 'destructive',
            });
            return;
        }

        // Optimistic update
        setClientServices(prev =>
            prev.map(item => item.id === itemId ? { ...item, label: newLabel, description: newDescription } : item)
        );
        refetchGlobalServices();

        toast({
            title: 'Service Updated',
            description: 'Service item updated across all clients',
        });
    };

    // Calculate services completion percentage
    const servicesCompletionPercent = clientServices.length > 0
        ? Math.round((clientServices.filter(item => item.checked).length / clientServices.length) * 100)
        : 0;

    // Management checklist state - now synced with Supabase
    const [managementChecklist, setManagementChecklist] = useState<ChecklistItem[]>([]);
    const [checklistLoading, setChecklistLoading] = useState(true);

    // Add new checklist item dialog state
    const [showAddChecklistDialog, setShowAddChecklistDialog] = useState(false);
    const [newChecklistLabel, setNewChecklistLabel] = useState('');
    const [newChecklistDescription, setNewChecklistDescription] = useState('');

    // Fetch global checklist items from Supabase
    const { data: globalChecklistItems, refetch: refetchGlobalChecklist } = useQuery({
        queryKey: ['global-checklist-items'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('global_checklist_items')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data as GlobalChecklistItem[];
        },
    });

    // Fetch client-specific checklist status from Supabase
    const { data: clientChecklistStatus, refetch: refetchClientStatus } = useQuery({
        queryKey: ['client-checklist-status', id],
        queryFn: async () => {
            if (!id) return [];
            const { data, error } = await supabase
                .from('client_checklist_status')
                .select('*')
                .eq('client_id', id);
            if (error) throw error;
            return data as ClientChecklistStatus[];
        },
        enabled: !!id,
    });

    // Combine global items with client-specific status
    useEffect(() => {
        if (globalChecklistItems) {
            const combined: ChecklistItem[] = globalChecklistItems.map(item => {
                const clientStatus = clientChecklistStatus?.find(s => s.checklist_item_id === item.id);
                return {
                    id: item.id,
                    label: item.label,
                    description: item.description,
                    checked: clientStatus?.checked ?? false,
                    notes: clientStatus?.notes ?? '',
                    isDefault: item.is_default,
                    display_order: item.display_order,
                };
            });
            setManagementChecklist(combined);
            setChecklistLoading(false);
        }
    }, [globalChecklistItems, clientChecklistStatus]);

    // Helper functions for checklist management
    const updateChecklistItem = async (itemId: string, updates: Partial<ChecklistItem>) => {
        // Optimistic update
        setManagementChecklist(prev =>
            prev.map(item => item.id === itemId ? { ...item, ...updates } : item)
        );

        // Only sync 'checked' and 'notes' to client_checklist_status (per-client)
        if (id && ('checked' in updates || 'notes' in updates)) {
            const existingStatus = clientChecklistStatus?.find(s => s.checklist_item_id === itemId);

            if (existingStatus) {
                // Update existing status
                await supabase
                    .from('client_checklist_status')
                    .update({
                        checked: 'checked' in updates ? updates.checked : existingStatus.checked,
                        notes: 'notes' in updates ? updates.notes : existingStatus.notes,
                    })
                    .eq('id', existingStatus.id);
            } else {
                // Insert new status
                const currentItem = managementChecklist.find(i => i.id === itemId);
                await supabase
                    .from('client_checklist_status')
                    .insert({
                        client_id: id,
                        checklist_item_id: itemId,
                        checked: 'checked' in updates ? updates.checked : false,
                        notes: 'notes' in updates ? updates.notes : '',
                    });
            }
            refetchClientStatus();
        }
    };

    const addChecklistItem = async () => {
        if (!newChecklistLabel.trim()) return;

        // Get the next display order
        const maxOrder = Math.max(...(globalChecklistItems?.map(i => i.display_order) || [0]), 0);

        // Insert into global_checklist_items (syncs to all clients)
        const { data: newItem, error } = await supabase
            .from('global_checklist_items')
            .insert({
                label: newChecklistLabel.trim(),
                description: newChecklistDescription.trim(),
                display_order: maxOrder + 1,
                is_default: false,
            })
            .select()
            .single();

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to add checklist item',
                variant: 'destructive',
            });
            return;
        }

        // Refetch to sync
        refetchGlobalChecklist();

        setNewChecklistLabel('');
        setNewChecklistDescription('');
        setShowAddChecklistDialog(false);

        toast({
            title: 'Item Added',
            description: 'Checklist item added and synced to all clients',
        });
    };

    const deleteChecklistItem = async (itemId: string) => {
        // Delete from global_checklist_items (cascades to client_checklist_status)
        const { error } = await supabase
            .from('global_checklist_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete checklist item',
                variant: 'destructive',
            });
            return;
        }

        // Optimistic update
        setManagementChecklist(prev => prev.filter(item => item.id !== itemId));
        refetchGlobalChecklist();

        toast({
            title: 'Item Deleted',
            description: 'Checklist item removed from all clients',
        });
    };

    const editChecklistItem = async (itemId: string, newLabel: string, newDescription: string) => {
        // Update global_checklist_items (syncs to all clients)
        const { error } = await supabase
            .from('global_checklist_items')
            .update({
                label: newLabel,
                description: newDescription,
            })
            .eq('id', itemId);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to update checklist item',
                variant: 'destructive',
            });
            return;
        }

        // Optimistic update
        setManagementChecklist(prev =>
            prev.map(item => item.id === itemId ? { ...item, label: newLabel, description: newDescription } : item)
        );
        refetchGlobalChecklist();

        toast({
            title: 'Item Updated',
            description: 'Checklist item updated across all clients',
        });
    };

    // Calculate completion percentage
    const checklistCompletionPercent = managementChecklist.length > 0
        ? Math.round((managementChecklist.filter(item => item.checked).length / managementChecklist.length) * 100)
        : 0;

    // Image popup state
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Edit mode and editable fields state
    const [isEditing, setIsEditing] = useState(false);
    const [editFields, setEditFields] = useState({
        name: '',
        company_name: '',
        website_url: '',
        email: '',
        phone: '',
        services: [] as string[],
    });
    const [newService, setNewService] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Logo upload state
    const [logoFiles, setLogoFiles] = useState<string[]>([]);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [logoLoadError, setLogoLoadError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Reset logo error when logoFiles changes (new upload)
    useEffect(() => {
        if (logoFiles.length > 0) {
            setLogoLoadError(false);
        }
    }, [logoFiles]);
    const queryClient = useQueryClient();
    
    // Stripe payment state
    const [showChargeDialog, setShowChargeDialog] = useState(false);
    const [chargeAmount, setChargeAmount] = useState('');
    const [chargeDescription, setChargeDescription] = useState('');
    const [chargeService, setChargeService] = useState('website');
    const [chargeServiceManual, setChargeServiceManual] = useState('');
    const [useManualService, setUseManualService] = useState(false);
    const [isCreatingCharge, setIsCreatingCharge] = useState(false);
    
    // Service templates state
    const [serviceTemplates, setServiceTemplates] = useState([
        { id: 'website', name: 'Website Hosting & Maintenance', defaultAmount: '199' },
        { id: 'seo', name: 'SEO Services', defaultAmount: '299' },
        { id: 'design', name: 'Design Services', defaultAmount: '150' },
        { id: 'development', name: 'Development Services', defaultAmount: '250' },
        { id: 'social', name: 'Social Media Management', defaultAmount: '199' },
        { id: 'other', name: 'Other Services', defaultAmount: '0' },
    ]);
    const [showEditTemplates, setShowEditTemplates] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

    // Fetch onboarding number based on created_at order (only for database clients)
    const { data: onboardingNumber } = useQuery({
        queryKey: ['client-onboarding-number', id],
        queryFn: async () => {
            if (isFeaturedClient || !id) return null;
            
            // Get all clients ordered by created_at
            const { data: allClients, error } = await supabase
                .from('clients')
                .select('id, created_at')
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            // Find the index of current client (1-based)
            const index = allClients?.findIndex(c => c.id === id);
            return index !== undefined && index !== -1 ? index + 1 : null;
        },
        enabled: !!id && !isFeaturedClient,
    });

    // Fetch client data from database (skip for featured clients)
    const { data: dbClient, isLoading, error } = useQuery({
        queryKey: ['client', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id && !isFeaturedClient,
    });

    // Use featured client data or database client
    // For database clients, parse notes field as form_submission if it's valid JSON
    const getClientWithFormData = () => {
        if (isOffTint) return offTintClient;
        if (isKleanAndFresh) return kleanAndFreshClient;
        if (isPropertyRefresh) return propertyRefreshClient;
        if (!dbClient) return null;
        
        // Try to parse notes as form_submission JSON
        let form_submission = null;
        if (dbClient.notes) {
            try {
                const parsed = JSON.parse(dbClient.notes);
                if (typeof parsed === 'object' && parsed !== null) {
                    form_submission = parsed;
                }
            } catch {
                // Notes is not JSON, keep as regular notes
            }
        }
        
        return {
            ...dbClient,
            form_submission,
            // If notes was JSON, clear it so it doesn't show raw JSON in UI
            notes: form_submission ? null : dbClient.notes,
        };
    };
    
    const client = getClientWithFormData();

    // Fetch Stripe customer data (subscription and payment history)
    const { data: stripeData, isLoading: isLoadingStripe } = useQuery({
        queryKey: ['stripe-customer-data', id, client?.email, client?.stripe_customer_id],
        queryFn: async () => {
            if (!client) return null;
            
            // Get email from client record or form_submission
            const customerEmail = client.email || client.form_submission?.businessEmail || client.form_submission?.email;
            const customerId = client.stripe_customer_id;

            if (!customerEmail && !customerId) {
                return null; // No email or Stripe ID, can't fetch data
            }

            const { data, error } = await supabase.functions.invoke('stripe-get-customer-data', {
                body: {
                    customerEmail,
                    customerId,
                },
            });

            if (error) {
                console.error('Error fetching Stripe data:', error);
                return null; // Return null on error, don't throw
            }

            if (data && !data.success) {
                console.error('Stripe function returned error:', data.error);
                return null;
            }

            return data;
        },
        enabled: !!client && (!!client.email || !!client.form_submission?.businessEmail || !!client.form_submission?.email || !!client.stripe_customer_id),
        refetchInterval: 60000, // Refetch every minute to keep data fresh
    });

    // Initialize edit fields when entering edit mode
    useEffect(() => {
        if (client && !isFeaturedClient && isEditing) {
            // Only initialize if editFields are empty or out of sync
            if (!editFields.name && !editFields.company_name) {
                setEditFields({
                    name: client.name || '',
                    company_name: client.company_name || '',
                    website_url: client.website_url || '',
                    email: client.email || '',
                    phone: client.phone || '',
                    services: client.primary_services || [],
                });
            }
        }
    }, [isEditing, client, isFeaturedClient]);

    // Initialize edit fields and logo when client data loads (only when not editing)
    useEffect(() => {
        if (client && !isFeaturedClient && !isEditing) {
            setEditFields({
                name: client.name || '',
                company_name: client.company_name || '',
                website_url: client.website_url || '',
                email: client.email || '',
                phone: client.phone || '',
                services: client.primary_services || [],
            });
            
            // Initialize logo from form_submission
            // Sync from database but preserve logoFiles state if it's already set (prevents clearing during refetch)
            const logos = client.form_submission?.logo_files;
            if (logos) {
                const logoUrl = Array.isArray(logos) ? logos[0] : logos;
                // Only set if it's a valid URL (not just text like "Client Logo")
                const isValidUrl = logoUrl && (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:'));
                if (isValidUrl) {
                    setLogoFiles(prev => {
                        // If we already have a logo in state, keep it (might be a recently uploaded logo)
                        // Only update if the database logo is different from what we have
                        if (prev && prev.length > 0 && prev[0] === logoUrl) {
                            return prev; // Same logo, no change needed
                        }
                        // If state is empty or different, update from database
                        return [logoUrl];
                    });
                }
            }
            // Don't clear logoFiles if form_submission doesn't have logo_files - preserves uploaded logo
        }
    }, [client, isFeaturedClient]);
    
    // Handle logo file selection and upload
    const handleLogoFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || isFeaturedClient || !id || !dbClient) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Logo must be less than 10MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingLogo(true);
        try {
            // Compress image if needed
            const compressedResult = await compressImage(file);
            const fileToUpload = compressedResult.file;

            // Upload to Supabase storage
            const fileExt = fileToUpload.name.split(".").pop();
            const fileName = `client-logos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("website-submissions-files")
                .upload(fileName, fileToUpload, {
                    contentType: fileToUpload.type,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("website-submissions-files")
                .getPublicUrl(fileName);

            const logoUrl = urlData.publicUrl;
            console.log('Uploaded logo URL:', logoUrl);

            // Get existing notes or form_submission data
            let notesData = {};
            if (dbClient.notes) {
                try {
                    notesData = JSON.parse(dbClient.notes);
                } catch {
                    notesData = {};
                }
            }

            // Update logo_files in notes
            const updatedNotes = {
                ...notesData,
                logo_files: [logoUrl],
            };

            const { error: updateError } = await supabase
                .from('clients')
                .update({
                    notes: JSON.stringify(updatedNotes),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            setLogoFiles([logoUrl]);
            setLogoLoadError(false); // Reset error state on successful upload
            queryClient.invalidateQueries({ queryKey: ['client', id] });
            queryClient.invalidateQueries({ queryKey: ['all-clients'] });

            toast({
                title: "Logo uploaded",
                description: "Client logo has been updated successfully.",
            });
        } catch (error) {
            console.error('Logo upload error:', error);
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploadingLogo(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle save
    const handleSave = async () => {
        if (isFeaturedClient || !id || !dbClient) return;

        setIsSaving(true);
        try {
            const updateData = {
                name: editFields.name || null,
                company_name: editFields.company_name || null,
                website_url: editFields.website_url || null,
                email: editFields.email || null,
                phone: editFields.phone || null,
                primary_services: editFields.services.length > 0 ? editFields.services : null,
            };

            console.log('Saving client data:', updateData);

            const { data, error } = await supabase
                .from('clients')
                .update(updateData)
                .eq('id', id)
                .select();

            console.log('Save result:', { data, error });

            if (error) throw error;

            // Force refetch all client-related queries
            await queryClient.invalidateQueries({ queryKey: ['client', id] });
            await queryClient.invalidateQueries({ queryKey: ['all-clients'] });
            await queryClient.invalidateQueries({ queryKey: ['client-onboarding-number', id] });

            // Refetch immediately
            await queryClient.refetchQueries({ queryKey: ['client', id] });

            setIsEditing(false);
            toast({
                title: "Client updated",
                description: "Client information has been saved successfully.",
            });
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (client) {
            setEditFields({
                name: client.name || '',
                company_name: client.company_name || '',
                website_url: client.website_url || '',
                email: client.email || '',
                phone: client.phone || '',
                services: client.primary_services || [],
            });
            setNewService('');
        }
        setIsEditing(false);
    };

    if (isLoading && !isFeaturedClient) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-orbitron text-muted-foreground">Loading client data...</p>
                </div>
            </div>
        );
    }

    if ((error || !client) && !isFeaturedClient) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="font-orbitron text-destructive mb-4">Client not found</p>
                    <Link to="/client-portal" className="text-primary hover:underline font-orbitron text-sm">
                        ? Back to Portal
                    </Link>
                </div>
            </div>
        );
    }

    // Parse services from primary_services if available
    const services = client.primary_services || [];
    
    // Detect if this is a funnel client (no website_url)
    const isFunnelClient = !client.website_url;
    
    // Debug: Log form_submission data for funnel clients
    if (isFunnelClient && client.form_submission) {
        console.log('Funnel client form_submission:', client.form_submission);
        console.log('Logo files:', client.form_submission?.logo_files);
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>{client.company_name || client.name} | Client Profile</title>
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                {/* Back Button */}
                <Link 
                    to="/client-portal" 
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-orbitron text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portal
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div className="flex items-start gap-4">
                        {/* Client Logo - from form submission or uploaded */}
                        {(() => {
                            // Get favicon from website URL using Google's favicon service
                            const websiteUrl = client.website_url;
                            const faviconUrl = websiteUrl ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(websiteUrl)}&sz=128` : null;

                            if (faviconUrl) {
                                return (
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-cyan-500/30 bg-zinc-900 p-2 shadow-lg shadow-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                        <img
                                            src={faviconUrl}
                                            alt={`${client.company_name || client.name} logo`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                );
                            }

                            // No website URL - show building icon
                            return (
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-8 h-8 text-cyan-400" />
                                </div>
                            );
                        })()}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-orbitron text-[10px] tracking-[0.2em] text-emerald-400 uppercase">Active Client</span>
                            </div>
                            <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                {client.company_name || client.name}
                            </h1>
                            <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase mt-2">
                                Client ID: #{onboardingNumber !== null && onboardingNumber !== undefined ? onboardingNumber : (isFeaturedClient ? 'N/A' : '...')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {client.website_url && (
                            <a
                                href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-orbitron text-sm text-cyan-400"
                            >
                                <Globe className="w-4 h-4" />
                                Visit Website
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                        {!isFeaturedClient && (
                            <Button 
                                variant="ghost"
                                size="sm" 
                                className="font-orbitron text-[10px] bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:text-cyan-300"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <Settings className="w-3 h-3 mr-2" />
                                {isEditing ? 'Cancel' : 'Edit Client'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - Client Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-card/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-cyan-500/10 bg-cyan-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-cyan-400" />
                                        <h2 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase">Client Information</h2>
                                    </div>
                                    {!isFeaturedClient && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="h-7 px-2 text-[10px] font-orbitron text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                        >
                                            <Edit2 className="w-3 h-3 mr-1" />
                                            {isEditing ? 'Cancel' : 'Edit'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Client Name</p>
                                    {isEditing && !isFeaturedClient ? (
                                        <Input
                                            value={editFields.name}
                                            onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                                            className="bg-background border-cyan-500/30 focus:border-cyan-400"
                                            placeholder="Client name"
                                        />
                                    ) : (
                                        <p className="text-foreground font-medium">{client.name || 'Not set'}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Company Name</p>
                                    {isEditing && !isFeaturedClient ? (
                                        <Input
                                            value={editFields.company_name}
                                            onChange={(e) => setEditFields({ ...editFields, company_name: e.target.value })}
                                            className="bg-background border-cyan-500/30 focus:border-cyan-400"
                                            placeholder="Company name"
                                        />
                                    ) : (
                                        <p className="text-foreground font-medium">{client.company_name || 'Not set'}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Website URL</p>
                                    {isEditing && !isFeaturedClient ? (
                                        <Input
                                            value={editFields.website_url}
                                            onChange={(e) => setEditFields({ ...editFields, website_url: e.target.value })}
                                            className="bg-background border-cyan-500/30 focus:border-cyan-400"
                                            placeholder="https://example.com"
                                        />
                                    ) : (
                                        client.website_url ? (
                                            <a
                                                href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-cyan-400 font-medium text-sm hover:text-cyan-300 hover:underline transition-colors inline-flex items-center gap-1"
                                            >
                                                {client.website_url}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <p className="text-foreground text-sm">Not set</p>
                                        )
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Contact Email</p>
                                    {isEditing && !isFeaturedClient ? (
                                        <Input
                                            type="email"
                                            value={editFields.email}
                                            onChange={(e) => setEditFields({ ...editFields, email: e.target.value })}
                                            className="bg-background border-cyan-500/30 focus:border-cyan-400"
                                            placeholder="email@example.com"
                                        />
                                    ) : (
                                        <p className="text-foreground text-sm">{client.email || 'Not set'}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
                                    {isEditing && !isFeaturedClient ? (
                                        <Input
                                            type="tel"
                                            value={editFields.phone}
                                            onChange={(e) => setEditFields({ ...editFields, phone: e.target.value })}
                                            className="bg-background border-cyan-500/30 focus:border-cyan-400"
                                            placeholder="(123) 456-7890"
                                        />
                                    ) : (
                                        <p className="text-foreground text-sm">{client.phone || 'Not set'}</p>
                                    )}
                                </div>
                                {isEditing && !isFeaturedClient && (
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            disabled={isSaving}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                                
                                {/* Services */}
                                <div>
                                    <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-2">Services</p>
                                    {isEditing && !isFeaturedClient ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                                {editFields.services.map((service: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-orbitron text-cyan-400 flex items-center gap-1">
                                                        {service}
                                                        <button
                                                            onClick={() => setEditFields({
                                                                ...editFields,
                                                                services: editFields.services.filter((_, idx) => idx !== i)
                                                            })}
                                                            className="ml-1 text-cyan-400 hover:text-red-400 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newService}
                                                    onChange={(e) => setNewService(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newService.trim()) {
                                                            e.preventDefault();
                                                            setEditFields({
                                                                ...editFields,
                                                                services: [...editFields.services, newService.trim()]
                                                            });
                                                            setNewService('');
                                                        }
                                                    }}
                                                    placeholder="Add service..."
                                                    className="bg-background border-cyan-500/30 focus:border-cyan-400 text-sm h-8"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (newService.trim()) {
                                                            setEditFields({
                                                                ...editFields,
                                                                services: [...editFields.services, newService.trim()]
                                                            });
                                                            setNewService('');
                                                        }
                                                    }}
                                                    disabled={!newService.trim()}
                                                    className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 h-8"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {services.length > 0 ? services.map((service: string, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-orbitron text-cyan-400">
                                                    {service}
                                                </span>
                                            )) : (
                                                <span className="text-muted-foreground text-sm">No services listed</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Client Services */}
                        <div className="bg-card/20 backdrop-blur-xl border border-emerald-500/20 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-emerald-500/10 bg-emerald-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-emerald-400" />
                                        <h2 className="font-orbitron text-xs font-bold tracking-wider text-emerald-400 uppercase">Client Services</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-orbitron text-muted-foreground">Completion</span>
                                        <span className="text-sm font-orbitron font-bold text-emerald-400">
                                            {servicesCompletionPercent}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {/* Loading state */}
                                {servicesLoading && (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        Loading services...
                                    </div>
                                )}
                                {/* Dynamic service items */}
                                {!servicesLoading && clientServices.map((item) => {
                                    // Smart icon selection based on keywords in label
                                    const getServiceIcon = () => {
                                        const label = item.label.toLowerCase();

                                        // Default items by known IDs
                                        if (item.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') return Globe;
                                        if (item.id === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') return TrendingUp;
                                        if (item.id === 'cccccccc-cccc-cccc-cccc-cccccccccccc') return MessageSquare;

                                        // Keyword-based icons
                                        if (label.includes('website') || label.includes('hosting') || label.includes('domain')) return Globe;
                                        if (label.includes('upgrade') || label.includes('update') || label.includes('enhance')) return TrendingUp;
                                        if (label.includes('sms') || label.includes('phone') || label.includes('call') || label.includes('automation')) return MessageSquare;
                                        if (label.includes('email') || label.includes('mail')) return Mail;
                                        if (label.includes('seo') || label.includes('search')) return Search;
                                        if (label.includes('social') || label.includes('media')) return Share2;
                                        if (label.includes('design') || label.includes('graphic')) return Palette;
                                        if (label.includes('support') || label.includes('help')) return HelpCircle;
                                        if (label.includes('analytics') || label.includes('report')) return BarChart3;
                                        if (label.includes('content') || label.includes('blog')) return FileText;
                                        if (label.includes('video') || label.includes('youtube')) return Video;
                                        if (label.includes('photo') || label.includes('image')) return Camera;
                                        if (label.includes('ad') || label.includes('marketing') || label.includes('campaign')) return Target;
                                        if (label.includes('maintenance') || label.includes('manage')) return Settings;
                                        if (label.includes('security') || label.includes('ssl')) return Shield;
                                        if (label.includes('backup') || label.includes('storage')) return HardDrive;
                                        if (label.includes('ai') || label.includes('bot') || label.includes('ava')) return Bot;

                                        // Default
                                        return CheckCircle2;
                                    };

                                    return (
                                        <ToggleItem
                                            key={item.id}
                                            label={item.label}
                                            description={item.description}
                                            icon={getServiceIcon()}
                                            checked={item.checked}
                                            onChange={(checked) => updateServiceItem(item.id, { checked })}
                                            color="emerald"
                                            notes={item.notes}
                                            onNotesChange={(notes) => updateServiceItem(item.id, { notes })}
                                            placeholder="Add notes..."
                                            onEdit={(newLabel, newDescription) => editServiceItem(item.id, newLabel, newDescription)}
                                            onDelete={() => deleteServiceItem(item.id)}
                                            canDelete={!item.isDefault}
                                        />
                                    );
                                })}

                                {/* Add New Service Button */}
                                <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
                                    <DialogTrigger asChild>
                                        <button className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 border-dashed hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2 text-emerald-400">
                                            <Plus className="w-4 h-4" />
                                            <span className="text-sm font-medium">Add Service</span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-900 border-emerald-500/30">
                                        <DialogHeader>
                                            <DialogTitle className="font-orbitron text-emerald-400">Add New Service</DialogTitle>
                                            <DialogDescription className="text-muted-foreground">
                                                This service will be added to all client profiles. Toggle states remain per-client.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest">Service Name</Label>
                                                <Input
                                                    value={newServiceLabel}
                                                    onChange={(e) => setNewServiceLabel(e.target.value)}
                                                    placeholder="e.g., SEO Optimization"
                                                    className="bg-background border-emerald-500/30 focus:border-emerald-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest">Description (Optional)</Label>
                                                <Input
                                                    value={newServiceDescription}
                                                    onChange={(e) => setNewServiceDescription(e.target.value)}
                                                    placeholder="e.g., Monthly SEO reports & optimization"
                                                    className="bg-background border-emerald-500/30 focus:border-emerald-400"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowAddServiceDialog(false);
                                                        setNewServiceLabel('');
                                                        setNewServiceDescription('');
                                                    }}
                                                    className="flex-1 border-white/10"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={addServiceItem}
                                                    disabled={!newServiceLabel.trim()}
                                                    className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Service
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN - Management Toggles */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card/20 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-purple-500/10 bg-purple-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-purple-400" />
                                        <h2 className="font-orbitron text-xs font-bold tracking-wider text-purple-400 uppercase">Management Checklist</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-orbitron text-muted-foreground">Completion</span>
                                        <span className="text-sm font-orbitron font-bold text-cyan-400">
                                            {checklistCompletionPercent}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {/* Loading state */}
                                {checklistLoading && (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        Loading checklist...
                                    </div>
                                )}
                                {/* Dynamic checklist items */}
                                {!checklistLoading && managementChecklist.map((item) => {
                                    // Smart icon selection based on keywords in label
                                    const getIcon = () => {
                                        const label = item.label.toLowerCase();

                                        // Default items by ID
                                        if (item.id === 'telegram') return MessageSquare;
                                        if (item.id === 'github') return Github;
                                        if (item.id === 'dns') return Link2;
                                        if (item.id === 'vps') return Server;
                                        if (item.id === 'leads') return Bell;

                                        // Communication & Messaging
                                        if (label.includes('telegram') || label.includes('chat') || label.includes('message')) return MessageSquare;
                                        if (label.includes('email') || label.includes('mail') || label.includes('inbox')) return Mail;
                                        if (label.includes('sms') || label.includes('text')) return Smartphone;
                                        if (label.includes('phone') || label.includes('call')) return Phone;
                                        if (label.includes('notification') || label.includes('alert') || label.includes('remind')) return Bell;
                                        if (label.includes('contact') || label.includes('support')) return MessageCircle;

                                        // Development & Technical
                                        if (label.includes('github') || label.includes('git') || label.includes('repo')) return Github;
                                        if (label.includes('code') || label.includes('develop') || label.includes('programming')) return Code;
                                        if (label.includes('terminal') || label.includes('command') || label.includes('cli')) return Terminal;
                                        if (label.includes('api') || label.includes('endpoint') || label.includes('webhook')) return Zap;
                                        if (label.includes('database') || label.includes('db') || label.includes('sql')) return Database;
                                        if (label.includes('server') || label.includes('vps') || label.includes('host')) return Server;
                                        if (label.includes('deploy') || label.includes('release') || label.includes('launch')) return Rocket;
                                        if (label.includes('build') || label.includes('compile')) return Hammer;
                                        if (label.includes('test') || label.includes('qa') || label.includes('quality')) return ClipboardCheck;
                                        if (label.includes('bug') || label.includes('fix') || label.includes('debug')) return ToolIcon;

                                        // Domain & DNS
                                        if (label.includes('dns') || label.includes('nameserver') || label.includes('domain')) return Link2;
                                        if (label.includes('ssl') || label.includes('https') || label.includes('certificate') || label.includes('secure')) return Lock;
                                        if (label.includes('url') || label.includes('link') || label.includes('redirect')) return LinkIcon;

                                        // Cloud & Storage
                                        if (label.includes('cloud') || label.includes('aws') || label.includes('azure') || label.includes('gcp')) return Cloud;
                                        if (label.includes('backup') || label.includes('restore')) return HardDrive;
                                        if (label.includes('storage') || label.includes('file') || label.includes('upload')) return Folder;
                                        if (label.includes('download')) return Download;
                                        if (label.includes('sync') || label.includes('update') || label.includes('refresh')) return RefreshCw;

                                        // Analytics & Marketing
                                        if (label.includes('analytics') || label.includes('tracking') || label.includes('ga4') || label.includes('google analytics')) return BarChart3;
                                        if (label.includes('seo') || label.includes('search') || label.includes('keyword')) return Search;
                                        if (label.includes('pixel') || label.includes('facebook') || label.includes('meta')) return Target;
                                        if (label.includes('report') || label.includes('dashboard') || label.includes('metric')) return PieChart;
                                        if (label.includes('conversion') || label.includes('funnel')) return TrendingUp;
                                        if (label.includes('campaign') || label.includes('ad') || label.includes('marketing')) return Sparkles;

                                        // Security & Access
                                        if (label.includes('password') || label.includes('credential') || label.includes('login')) return Key;
                                        if (label.includes('auth') || label.includes('permission') || label.includes('access')) return Shield;
                                        if (label.includes('2fa') || label.includes('mfa') || label.includes('verification')) return ShieldCheck;
                                        if (label.includes('user') || label.includes('account') || label.includes('profile')) return User;
                                        if (label.includes('team') || label.includes('member') || label.includes('staff')) return Users;

                                        // Content & Media
                                        if (label.includes('image') || label.includes('photo') || label.includes('picture')) return Camera;
                                        if (label.includes('video') || label.includes('youtube') || label.includes('vimeo')) return Video;
                                        if (label.includes('audio') || label.includes('podcast') || label.includes('sound')) return Mic;
                                        if (label.includes('content') || label.includes('blog') || label.includes('article') || label.includes('post')) return FileText;
                                        if (label.includes('document') || label.includes('doc') || label.includes('pdf')) return File;
                                        if (label.includes('design') || label.includes('ui') || label.includes('ux') || label.includes('graphic')) return Palette;
                                        if (label.includes('logo') || label.includes('brand') || label.includes('identity')) return Paintbrush;

                                        // Business & Finance
                                        if (label.includes('payment') || label.includes('stripe') || label.includes('billing')) return CreditCard;
                                        if (label.includes('invoice') || label.includes('receipt')) return Receipt;
                                        if (label.includes('subscription') || label.includes('plan') || label.includes('pricing')) return DollarSign;
                                        if (label.includes('wallet') || label.includes('balance')) return Wallet;
                                        if (label.includes('contract') || label.includes('agreement') || label.includes('legal')) return FileCheck;
                                        if (label.includes('client') || label.includes('customer')) return Briefcase;
                                        if (label.includes('lead') || label.includes('prospect') || label.includes('form')) return ClipboardList;

                                        // E-commerce
                                        if (label.includes('shop') || label.includes('store') || label.includes('ecommerce')) return Store;
                                        if (label.includes('cart') || label.includes('checkout') || label.includes('order')) return ShoppingCart;
                                        if (label.includes('product') || label.includes('inventory') || label.includes('stock')) return Package;
                                        if (label.includes('shipping') || label.includes('delivery')) return Truck;

                                        // Social Media
                                        if (label.includes('social') || label.includes('share') || label.includes('post')) return Share2;
                                        if (label.includes('review') || label.includes('rating') || label.includes('feedback')) return Star;
                                        if (label.includes('follow') || label.includes('subscribe') || label.includes('like')) return Heart;

                                        // Location & Maps
                                        if (label.includes('location') || label.includes('address') || label.includes('gmb') || label.includes('google business')) return MapPin;
                                        if (label.includes('map') || label.includes('direction')) return Map;

                                        // AI & Automation
                                        if (label.includes('ai') || label.includes('bot') || label.includes('chatbot') || label.includes('ava')) return Bot;
                                        if (label.includes('automat') || label.includes('workflow') || label.includes('zapier')) return Zap;
                                        if (label.includes('smart') || label.includes('intelligent')) return Brain;

                                        // Misc
                                        if (label.includes('setup') || label.includes('config') || label.includes('setting')) return Settings;
                                        if (label.includes('install') || label.includes('integrate')) return Cpu;
                                        if (label.includes('complete') || label.includes('done') || label.includes('finish')) return CheckCircle2;
                                        if (label.includes('schedule') || label.includes('calendar') || label.includes('date') || label.includes('time')) return Calendar;
                                        if (label.includes('list') || label.includes('task') || label.includes('todo')) return ListChecks;
                                        if (label.includes('tag') || label.includes('label') || label.includes('category')) return Tag;
                                        if (label.includes('bookmark') || label.includes('save') || label.includes('favorite')) return Bookmark;
                                        if (label.includes('info') || label.includes('about') || label.includes('detail')) return Info;
                                        if (label.includes('help') || label.includes('faq') || label.includes('question')) return HelpCircle;
                                        if (label.includes('home') || label.includes('main') || label.includes('landing')) return Home;
                                        if (label.includes('global') || label.includes('world') || label.includes('international')) return Globe;

                                        // Default
                                        return CheckCircle2;
                                    };

                                    return (
                                        <ToggleItem
                                            key={item.id}
                                            label={item.label}
                                            description={item.description}
                                            icon={getIcon()}
                                            checked={item.checked}
                                            onChange={(checked) => updateChecklistItem(item.id, { checked })}
                                            color="purple"
                                            notes={item.notes}
                                            onNotesChange={(notes) => updateChecklistItem(item.id, { notes })}
                                            placeholder="Add notes..."
                                            onEdit={(newLabel, newDescription) => editChecklistItem(item.id, newLabel, newDescription)}
                                            onDelete={() => deleteChecklistItem(item.id)}
                                            canDelete={!item.isDefault}
                                        />
                                    );
                                })}

                                {/* Add New Item Button */}
                                <Dialog open={showAddChecklistDialog} onOpenChange={setShowAddChecklistDialog}>
                                    <DialogTrigger asChild>
                                        <button className="w-full py-3 px-4 rounded-xl bg-purple-500/10 border border-purple-500/20 border-dashed hover:bg-purple-500/20 hover:border-purple-500/40 transition-all flex items-center justify-center gap-2 text-purple-400">
                                            <Plus className="w-4 h-4" />
                                            <span className="text-sm font-medium">Add Checklist Item</span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-900 border-purple-500/30">
                                        <DialogHeader>
                                            <DialogTitle className="font-orbitron text-purple-400">Add New Checklist Item</DialogTitle>
                                            <DialogDescription className="text-muted-foreground">
                                                This item will be added to all client profiles. Toggle states remain per-client.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest">Item Name</Label>
                                                <Input
                                                    value={newChecklistLabel}
                                                    onChange={(e) => setNewChecklistLabel(e.target.value)}
                                                    placeholder="e.g., SSL Certificate Installed"
                                                    className="bg-background border-purple-500/30 focus:border-purple-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest">Description (Optional)</Label>
                                                <Input
                                                    value={newChecklistDescription}
                                                    onChange={(e) => setNewChecklistDescription(e.target.value)}
                                                    placeholder="e.g., HTTPS enabled for the domain"
                                                    className="bg-background border-purple-500/30 focus:border-purple-400"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowAddChecklistDialog(false);
                                                        setNewChecklistLabel('');
                                                        setNewChecklistDescription('');
                                                    }}
                                                    className="flex-1 border-white/10"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={addChecklistItem}
                                                    disabled={!newChecklistLabel.trim()}
                                                    className="flex-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Item
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Stripe Payment & Subscription Card */}
                        <div className="bg-card/20 backdrop-blur-xl border border-emerald-500/20 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-emerald-500/10 bg-emerald-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-emerald-400" />
                                        <h2 className="font-orbitron text-xs font-bold tracking-wider text-emerald-400 uppercase">Payment & Subscription</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Current Subscription Info */}
                                <div className="space-y-2">
                                    {stripeData?.currentSubscription ? (
                                        <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-emerald-500/20">
                                            <div>
                                                <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Current Subscription</p>
                                                <p className="text-sm font-medium text-foreground">{stripeData.currentSubscription.planName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">
                                                    {stripeData.currentSubscription.interval === 'month' ? 'Monthly' : 
                                                     stripeData.currentSubscription.interval === 'year' ? 'Yearly' : 
                                                     stripeData.currentSubscription.interval}
                                                </p>
                                                <p className="text-sm font-bold text-emerald-400">${stripeData.currentSubscription.amount}/{stripeData.currentSubscription.interval === 'month' ? 'mo' : 'yr'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-emerald-500/20">
                                            <div>
                                                <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Current Subscription</p>
                                                <p className="text-sm font-medium text-muted-foreground">{isLoadingStripe ? 'Loading...' : 'No active subscription'}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-emerald-500/20">
                                        <div>
                                            <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Total Paid</p>
                                            <p className="text-sm font-medium text-foreground">All Time</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-cyan-400">
                                                {isLoadingStripe ? '...' : `$${stripeData?.totalPaid?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Payment History */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <History className="w-3 h-3 text-emerald-400" />
                                        <p className="text-[10px] font-orbitron text-emerald-400 uppercase tracking-widest">Recent Payments</p>
                                    </div>
                                    <ScrollArea className="h-32">
                                        <div className="space-y-2 pr-2">
                                            {isLoadingStripe ? (
                                                <div className="text-center py-4 text-xs text-muted-foreground">Loading payment history...</div>
                                            ) : stripeData?.recentInvoices && stripeData.recentInvoices.length > 0 ? (
                                                stripeData.recentInvoices.map((payment: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-card/20 rounded-lg border border-emerald-500/10">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-foreground truncate">{payment.description}</p>
                                                            <p className="text-[9px] text-muted-foreground">{payment.date}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-2">
                                                            <Badge className={`text-[8px] ${payment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                                                                {payment.status}
                                                            </Badge>
                                                            <p className="text-xs font-bold text-emerald-400">${payment.amount}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-xs text-muted-foreground">No payment history yet</div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                                
                                {/* Create Charge Button */}
                                <Dialog open={showChargeDialog} onOpenChange={setShowChargeDialog}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400/50 font-orbitron text-[10px]"
                                        >
                                            <Plus className="w-3 h-3 mr-2" />
                                            Create Charge
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-card border-emerald-500/30">
                                        <DialogHeader>
                                            <DialogTitle className="font-orbitron text-emerald-400">Create New Charge</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest">Service</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowEditTemplates(!showEditTemplates)}
                                                            className="h-6 px-2 text-[9px] text-emerald-400 hover:bg-emerald-500/10"
                                                        >
                                                            <Edit2 className="w-3 h-3 mr-1" />
                                                            Edit Templates
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                {!useManualService ? (
                                                    <Select 
                                                        value={chargeService} 
                                                        onValueChange={(value) => {
                                                            setChargeService(value);
                                                            const template = serviceTemplates.find(t => t.id === value);
                                                            if (template && template.defaultAmount) {
                                                                setChargeAmount(template.defaultAmount);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-background border-emerald-500/30">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {serviceTemplates.map((template) => (
                                                                <SelectItem key={template.id} value={template.id}>
                                                                    {template.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        value={chargeServiceManual}
                                                        onChange={(e) => setChargeServiceManual(e.target.value)}
                                                        placeholder="Enter service name manually..."
                                                        className="bg-background border-emerald-500/30"
                                                    />
                                                )}
                                                
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Switch
                                                        checked={useManualService}
                                                        onCheckedChange={setUseManualService}
                                                        className="data-[state=checked]:bg-emerald-500"
                                                    />
                                                    <Label className="text-[10px] text-muted-foreground cursor-pointer">
                                                        Enter service manually
                                                    </Label>
                                                </div>
                                                
                                                {/* Edit Templates Section */}
                                                {showEditTemplates && (
                                                    <div className="mt-4 p-3 bg-card/50 rounded-lg border border-emerald-500/20 space-y-2 max-h-48 overflow-y-auto">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[10px] font-orbitron text-emerald-400 uppercase">Service Templates</p>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setServiceTemplates([...serviceTemplates, { id: `new-${Date.now()}`, name: 'New Service', defaultAmount: '0' }]);
                                                                    setEditingTemplate(`new-${Date.now()}`);
                                                                }}
                                                                className="h-6 px-2 text-[9px] text-emerald-400"
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" />
                                                                Add
                                                            </Button>
                                                        </div>
                                                        {serviceTemplates.map((template, idx) => (
                                                            <div key={template.id} className="flex items-center gap-2 p-2 bg-background/50 rounded border border-emerald-500/10">
                                                                {editingTemplate === template.id ? (
                                                                    <div className="flex-1 space-y-2">
                                                                        <Input
                                                                            value={template.name}
                                                                            onChange={(e) => {
                                                                                const updated = [...serviceTemplates];
                                                                                updated[idx] = { ...updated[idx], name: e.target.value };
                                                                                setServiceTemplates(updated);
                                                                            }}
                                                                            className="h-7 text-xs bg-background border-emerald-500/30"
                                                                            placeholder="Service name"
                                                                        />
                                                                        <Input
                                                                            type="number"
                                                                            value={template.defaultAmount}
                                                                            onChange={(e) => {
                                                                                const updated = [...serviceTemplates];
                                                                                updated[idx] = { ...updated[idx], defaultAmount: e.target.value };
                                                                                setServiceTemplates(updated);
                                                                            }}
                                                                            className="h-7 text-xs bg-background border-emerald-500/30"
                                                                            placeholder="Default amount"
                                                                        />
                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => setEditingTemplate(null)}
                                                                                className="h-6 px-2 text-[8px]"
                                                                            >
                                                                                Save
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => {
                                                                                    setServiceTemplates(serviceTemplates.filter(t => t.id !== template.id));
                                                                                    setEditingTemplate(null);
                                                                                }}
                                                                                className="h-6 px-2 text-[8px] text-destructive"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-foreground truncate">{template.name}</p>
                                                                            <p className="text-[9px] text-muted-foreground">Default: ${template.defaultAmount}</p>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setEditingTemplate(template.id)}
                                                                            className="h-6 px-2 text-[8px]"
                                                                        >
                                                                            <Edit2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest mb-2 block">Amount ($)</Label>
                                                <Input
                                                    type="number"
                                                    value={chargeAmount}
                                                    onChange={(e) => setChargeAmount(e.target.value)}
                                                    placeholder="199.00"
                                                    className="bg-background border-emerald-500/30"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest mb-2 block">Description</Label>
                                                <Textarea
                                                    value={chargeDescription}
                                                    onChange={(e) => setChargeDescription(e.target.value)}
                                                    placeholder="Describe the charge..."
                                                    rows={3}
                                                    className="bg-background border-emerald-500/30"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    onClick={async () => {
                                                        if (!chargeAmount || parseFloat(chargeAmount) <= 0) {
                                                            toast({
                                                                title: "Invalid amount",
                                                                description: "Please enter a valid charge amount.",
                                                                variant: "destructive",
                                                            });
                                                            return;
                                                        }
                                                        
                                                        const serviceName = useManualService ? chargeServiceManual : (serviceTemplates.find(t => t.id === chargeService)?.name || chargeService);
                                                        if (!serviceName || serviceName.trim() === '') {
                                                            toast({
                                                                title: "Service required",
                                                                description: "Please select or enter a service name.",
                                                                variant: "destructive",
                                                            });
                                                            return;
                                                        }
                                                        
                                                        setIsCreatingCharge(true);
                                                        try {
                                                            // Stripe API Integration
                                                            // This will create an invoice and charge the client
                                    
                                                            
                                                            // Get client email or Stripe customer ID
                                                            const customerEmail = client?.email || client?.form_submission?.businessEmail || client?.form_submission?.email;
                                                            const customerId = client?.stripe_customer_id;
                                                            
                                                            if (!customerEmail && !customerId) {
                                                                throw new Error('Client email or Stripe customer ID is required.');
                                                            }
                                                            
                                                            // Amount in cents (Stripe uses cents)
                                                            const amountInCents = Math.round(parseFloat(chargeAmount) * 100);
                                                            const finalDescription = chargeDescription || `${serviceName} - ${new Date().toLocaleDateString()}`;
                                                            
                                                            // Call Supabase Edge Function for Stripe integration (recommended)
                                                            // OR use direct Stripe API call if you have a backend endpoint
                                                            const { data, error: stripeError } = await supabase.functions.invoke('stripe-create-invoice', {
                                                                body: {
                                                                    customerEmail,
                                                                    customerId,
                                                                    amount: amountInCents,
                                                                    description: finalDescription,
                                                                    serviceName,
                                                                    clientId: id,
                                                                },
                                                            });
                                                            
                                                            // Check if data contains an error first (function returned error in body with 200 status)
                                                            if (data && !data.success) {
                                                                const errorMsg = data.error || 'Unknown error from Edge Function';
                                                                console.error('Stripe function returned error in data:', errorMsg);
                                                                throw new Error(errorMsg);
                                                            }
                                                            
                                                            // Check for errors in response (network errors, non-2xx status codes)
                                                            if (stripeError) {
                                                                console.error('Stripe function error - full error object:', JSON.stringify(stripeError, null, 2));
                                                                console.error('Response data (if any):', data);
                                                                
                                                                // Check if error has a context with the response body
                                                                const errorContext = (stripeError as any)?.context;
                                                                let errorMsg = stripeError.message || 'Unknown error';
                                                                
                                                                // Try to extract error from response body if available
                                                                if (errorContext?.body) {
                                                                    try {
                                                                        const parsedBody = typeof errorContext.body === 'string' 
                                                                            ? JSON.parse(errorContext.body) 
                                                                            : errorContext.body;
                                                                        if (parsedBody?.error) {
                                                                            errorMsg = parsedBody.error;
                                                                        }
                                                                    } catch (parseError) {
                                                                        console.error('Failed to parse error body:', parseError);
                                                                    }
                                                                }
                                                                
                                                                // Also check data for error if it exists despite error being set
                                                                if (data?.error) {
                                                                    errorMsg = data.error;
                                                                }
                                                                
                                                                // If message contains non-2xx, try to provide more helpful context
                                                                if (errorMsg.includes('non-2xx') || errorMsg.includes('status code')) {
                                                                    errorMsg = `Stripe API error. Check Supabase function logs or verify STRIPE_SECRET_KEY is set correctly. Original: ${errorMsg}`;
                                                                }
                                                                
                                                                throw new Error(errorMsg);
                                                            }
                                                            
                                                            toast({
                                                                title: "Invoice created successfully",
                                                                description: `$${chargeAmount} invoice has been created and sent to ${customerEmail || 'client'}.`,
                                                            });
                                                        
                                                            setShowChargeDialog(false);
                                                            setChargeAmount('');
                                                            setChargeDescription('');
                                                            setChargeService('website');
                                                            setChargeServiceManual('');
                                                            setUseManualService(false);
                                                            
                                                            // Refresh client data if needed
                                                            queryClient.invalidateQueries({ queryKey: ['client', id] });
                                                        } catch (error) {
                                                            console.error('Charge creation error:', error);
                                                            let errorMessage = "Please try again.";
                                                            
                                                            // Extract actual error message
                                                            if (error instanceof Error) {
                                                                errorMessage = error.message;
                                                            } else if (typeof error === 'object' && error !== null) {
                                                                if ('message' in error) {
                                                                    errorMessage = String(error.message);
                                                                } else if ('error' in error && typeof error.error === 'string') {
                                                                    errorMessage = error.error;
                                                                }
                                                            }
                                                            
                                                            // Check for specific error types
                                                            if (errorMessage.includes('Failed to send') || errorMessage.includes('not available') || errorMessage.includes('404')) {
                                                                errorMessage = `Function not found. Please verify 'stripe-create-invoice' is deployed. Error: ${errorMessage}`;
                                                            } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                                                                errorMessage = `Authentication error. Please refresh and try again. Error: ${errorMessage}`;
                                                            } else if (errorMessage.includes('STRIPE_SECRET_KEY')) {
                                                                errorMessage = `Stripe secret key not configured in Supabase secrets. Error: ${errorMessage}`;
                                                            }
                                                            
                                                            toast({
                                                                title: "Charge failed",
                                                                description: errorMessage,
                                                                variant: "destructive",
                                                            });
                                                        } finally {
                                                            setIsCreatingCharge(false);
                                                        }
                                                    }}
                                                    disabled={isCreatingCharge}
                                                    className="flex-1 bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                                                >
                                                    {isCreatingCharge ? 'Processing...' : 'Create Charge'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowChargeDialog(false);
                                                        setChargeAmount('');
                                                        setChargeDescription('');
                                                        setChargeService('website');
                                                        setChargeServiceManual('');
                                                        setUseManualService(false);
                                                        setShowEditTemplates(false);
                                                        setEditingTemplate(null);
                                                    }}
                                                    disabled={isCreatingCharge}
                                                    className="border-emerald-500/30 text-emerald-400"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Onboarding Form Card */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Onboarding Form Card - Shows Website or Funnel based on client type */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className={`bg-gradient-to-br ${isFunnelClient ? 'from-cyan-500/10' : 'from-orange-500/10'} via-card/20 to-transparent backdrop-blur-xl border ${isFunnelClient ? 'border-cyan-500/30 hover:border-cyan-400/50' : 'border-orange-500/30 hover:border-orange-400/50'} rounded-2xl overflow-hidden cursor-pointer transition-all group`}>
                                    <div className={`px-5 py-4 border-b ${isFunnelClient ? 'border-cyan-500/10 bg-cyan-500/5' : 'border-orange-500/10 bg-orange-500/5'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {isFunnelClient ? (
                                                    <Layers className="w-5 h-5 text-cyan-400" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-orange-400" />
                                                )}
                                                <h2 className={`font-orbitron text-sm font-bold tracking-wider uppercase ${isFunnelClient ? 'text-cyan-400' : 'text-orange-400'}`}>
                                                    {isFunnelClient ? 'Funnel Submission' : 'Website Onboarding Form'}
                                                </h2>
                                            </div>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-orbitron text-[8px]">
                                                SUBMITTED
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 text-sm mb-4">
                                            <Calendar className={`w-4 h-4 ${isFunnelClient ? 'text-cyan-400' : 'text-orange-400'}`} />
                                            <span className="text-muted-foreground">Submitted:</span>
                                            <span className="text-foreground font-medium">
                                                {client.created_at ? new Date(client.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </span>
                                        </div>
                                        
                                        {/* Preview of sections - Different for funnel vs website */}
                                        {isFunnelClient ? (
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                    <Building2 className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-[9px] font-orbitron text-cyan-400">Business Info</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                    <Layers className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-[9px] font-orbitron text-cyan-400">Funnel Details</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                    <ImageIcon className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-[9px] font-orbitron text-cyan-400">Branding</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                    <FileText className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-[9px] font-orbitron text-cyan-400">Notes</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                    <Building2 className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-[9px] font-orbitron text-cyan-400">Business Info</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <MapPin className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-[9px] font-orbitron text-emerald-400">Location</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                                    <Briefcase className="w-3 h-3 text-purple-400" />
                                                    <span className="text-[9px] font-orbitron text-purple-400">Services</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                                    <Settings className="w-3 h-3 text-yellow-400" />
                                                    <span className="text-[9px] font-orbitron text-yellow-400">Operations</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={`flex items-center justify-center gap-2 font-orbitron text-xs transition-colors ${isFunnelClient ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-orange-400 group-hover:text-orange-300'}`}>
                                            <Eye className="w-4 h-4" />
                                            <span>Click to View Full Application</span>
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            
                            {/* Full Form Modal */}
                            <DialogContent className={`max-w-4xl max-h-[90vh] p-0 bg-background/95 backdrop-blur-xl border ${isFunnelClient ? 'border-cyan-500/30' : 'border-orange-500/30'}`}>
                                <DialogHeader className={`px-6 py-4 border-b ${isFunnelClient ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
                                    <DialogTitle className="flex items-center gap-3">
                                        {isFunnelClient ? (
                                            <Layers className="w-5 h-5 text-cyan-400" />
                                        ) : (
                                            <FileText className="w-5 h-5 text-orange-400" />
                                        )}
                                        <span className={`font-orbitron text-lg ${isFunnelClient ? 'text-cyan-400' : 'text-orange-400'}`}>
                                            {isFunnelClient ? 'Funnel Submission' : 'Website Onboarding Form'}
                                        </span>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-orbitron text-[10px] ml-2">
                                            SUBMITTED
                                        </Badge>
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <ScrollArea className="max-h-[calc(90vh-80px)]">
                                    <div className="p-6 space-y-3">
                                        {/* FUNNEL CLIENT - Simplified Form */}
                                        {isFunnelClient ? (
                                            <>
                                                {/* Funnel Section 1: Business Info */}
                                                <Collapsible defaultOpen>
                                                    <CollapsibleTrigger className="w-full">
                                                        <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="w-4 h-4 text-cyan-400" />
                                                                <span className="font-orbitron text-sm font-bold text-cyan-400">1. Business Info</span>
                                                            </div>
                                                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <FormField label="Company Name" value={client.company_name || client.name} />
                                                                <FormField label="Business Email" value={client.email} />
                                                                <FormField label="Business Phone" value={client.phone || client.form_submission?.business_phone || 'N/A'} />
                                                            </div>
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>

                                                {/* Funnel Section 2: Funnel Details */}
                                                <Collapsible defaultOpen>
                                                    <CollapsibleTrigger className="w-full">
                                                        <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <Layers className="w-4 h-4 text-cyan-400" />
                                                                <span className="font-orbitron text-sm font-bold text-cyan-400">2. Funnel Details</span>
                                                            </div>
                                                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                            <FormField label="Funnel Goal" value={client.form_submission?.funnel_goal || 'N/A'} />
                                                            <FormField label="Target Audience" value={client.form_submission?.target_audience || 'N/A'} />
                                                            <FormField label="Main Offer" value={client.form_submission?.main_offer || 'N/A'} />
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>

                                                {/* Funnel Section 3: Branding */}
                                                <Collapsible defaultOpen>
                                                    <CollapsibleTrigger className="w-full">
                                                        <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <ImageIcon className="w-4 h-4 text-cyan-400" />
                                                                <span className="font-orbitron text-sm font-bold text-cyan-400">3. Branding</span>
                                                            </div>
                                                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                            <FormField label="Brand Colors" value={client.form_submission?.website_colors || 'N/A'} />
                                                            {/* Logo display - handle array or single value */}
                                                            {(() => {
                                                                const logos = client.form_submission?.logo_files;
                                                                if (!logos) return <FormField label="Logo" value="No logo uploaded" />;
                                                                
                                                                const logoArray = Array.isArray(logos) ? logos : [logos];
                                                                if (logoArray.length === 0 || !logoArray[0]) {
                                                                    return <FormField label="Logo" value="No logo uploaded" />;
                                                                }
                                                                
                                                                return (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-2 uppercase font-orbitron">Logo</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {logoArray.map((url: string, idx: number) => (
                                                                                <img 
                                                                                    key={idx}
                                                                                    src={url} 
                                                                                    alt={`Logo ${idx + 1}`}
                                                                                    className="w-24 h-24 object-contain rounded-lg border border-cyan-500/30 bg-zinc-900 p-2 cursor-pointer hover:border-cyan-400 transition-colors"
                                                                                    onClick={() => setSelectedImage(url)}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>

                                                {/* Funnel Section 4: Additional Notes */}
                                                {client.form_submission?.additional_notes && (
                                                    <Collapsible>
                                                        <CollapsibleTrigger className="w-full">
                                                            <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-cyan-400" />
                                                                    <span className="font-orbitron text-sm font-bold text-cyan-400">4. Additional Notes</span>
                                                                </div>
                                                                <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                            </div>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                                <p className="text-sm text-foreground whitespace-pre-wrap">{client.form_submission.additional_notes}</p>
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                        {/* WEBSITE CLIENT - Full Form */}
                                        {/* Section 1: Business Information */}
                                        <Collapsible defaultOpen>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">1. Business Info</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField label="1.1 Official company name" value={client.form_submission?.official_company_name || client.company_name} />
                                                        <FormField label="1.2 Domain name" value={client.form_submission?.domain_name || client.website_url} link />
                                                        <FormField label="1.3 Business Phone" value={client.form_submission?.business_phone || client.phone} />
                                                        <FormField label="1.4 Business Email" value={client.form_submission?.business_email || client.email} />
                                                        <FormField label="1.5 Email for job requests" value={client.form_submission?.job_requests_email || client.email} />
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 2: Location & Hours */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">2. Location & Hours</span>
                                                        {client.form_submission?.service_areas && (
                                                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[8px] ml-2">
                                                                {client.form_submission.service_areas.length} areas
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <FormField label="2.1 Main City" value={client.form_submission?.main_city || 'N/A'} />
                                                    {client.form_submission?.service_areas && Array.isArray(client.form_submission.service_areas) && client.form_submission.service_areas.length > 0 && (
                                                        <div>
                                                            <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-2">2.2 Service Areas</p>
                                                            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                                                {client.form_submission.service_areas.map((area: string, i: number) => (
                                                                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400/80 text-[8px] font-orbitron">
                                                                        {area}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {client.form_submission?.business_address && (
                                                        <div>
                                                            <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">2.3 Business Address</p>
                                                            <p className="text-foreground text-sm">
                                                                {client.form_submission.business_address}, {client.form_submission.business_city}, {client.form_submission.business_state} {client.form_submission.business_zip}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {client.form_submission?.operating_hours && typeof client.form_submission.operating_hours === 'object' && (
                                                        <div>
                                                            <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-2">2.4 Operating Hours</p>
                                                            <div className="grid grid-cols-7 gap-1">
                                                                {Object.entries(client.form_submission.operating_hours).map(([day, hours]: [string, any]) => (
                                                                    <div key={day} className="text-center p-2 rounded bg-black/20">
                                                                        <p className="text-[8px] text-muted-foreground capitalize">{day.slice(0, 3)}</p>
                                                                        <p className="text-[9px] text-cyan-400">{hours?.open || '-'}</p>
                                                                        <p className="text-[9px] text-cyan-300">{hours?.close || '-'}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 3: Services */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">3. Services</span>
                                                        {client.form_submission?.services_list && (
                                                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[8px] ml-2">
                                                                {client.form_submission.services_list.length} services
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <FormField label="3.1 Service Category" value={client.form_submission?.service_category || 'N/A'} />
                                                    {client.form_submission?.services_list && Array.isArray(client.form_submission.services_list) && client.form_submission.services_list.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">3.2 Services</p>
                                                            {client.form_submission.services_list.map((service: any, i: number) => (
                                                                <div key={i} className="flex items-start justify-between p-2 rounded bg-black/20 border border-cyan-500/10">
                                                                    <div className="flex-1">
                                                                        <span className="text-foreground text-sm font-medium">{service.name}</span>
                                                                        <p className="text-muted-foreground text-[10px] line-clamp-1">{service.description}</p>
                                                                    </div>
                                                                    <span className="text-cyan-400 text-xs font-orbitron ml-2">{service.price}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <FormField label="3.3 Include service page" value={client.form_submission?.include_service_page ? 'Yes' : 'No'} badge />
                                                        <FormField label="3.4 Show pricing" value={client.form_submission?.display_pricing_on_website ? 'Yes' : 'No'} badge />
                                                        <FormField label="3.5 Service page type" value={client.form_submission?.service_page_type || 'N/A'} />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <FormField label="3.6 Free estimates" value={client.form_submission?.free_estimates ? 'Yes' : 'No'} badge />
                                                        <FormField label="3.7 Customer action" value={client.form_submission?.customer_action || 'N/A'} />
                                                        <FormField label="3.8 Client type" value={client.form_submission?.client_type || 'N/A'} />
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 4: Operations */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Settings className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">4. Operations</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">4.1 Describe your service process</p>
                                                        <p className="text-foreground text-sm whitespace-pre-line">{client.form_submission?.service_process || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">4.2 Guarantees or warranties</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.guarantees || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">4.3 What makes your business unique</p>
                                                        <p className="text-foreground text-sm whitespace-pre-line">{client.form_submission?.unique_value || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 5: Trust & Credibility */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">5. Trust</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">5.1 How can customers trust your work quality</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.quality_trust || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">5.2 Accreditations & Certifications</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.accreditations || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 6: Team & Story */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">6. Team & Story</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">6.1 Founder's message</p>
                                                        <p className="text-foreground text-sm whitespace-pre-line">{client.form_submission?.founder_message || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">6.2 Team members</p>
                                                        <p className="text-foreground text-sm whitespace-pre-line">{client.form_submission?.team_members || 'Not provided'}</p>
                                                    </div>
                                                    <FormField label="6.3 Has company logo" value={client.form_submission?.has_logo ? 'Yes' : 'No'} badge />
                                                    <ImageGallery 
                                                        images={client.form_submission?.logo_files} 
                                                        label="6.3 Logo Files" 
                                                        onImageClick={setSelectedImage}
                                                    />
                                                    <ImageGallery 
                                                        images={client.form_submission?.founder_photos} 
                                                        label="6.4 Founder/Owner Photos" 
                                                        onImageClick={setSelectedImage}
                                                    />
                                                    <ImageGallery 
                                                        images={client.form_submission?.team_photos} 
                                                        label="6.5 Team Photos" 
                                                        onImageClick={setSelectedImage}
                                                    />
                                                    <ImageGallery 
                                                        images={client.form_submission?.work_photos} 
                                                        label="6.6 Work Photos" 
                                                        onImageClick={setSelectedImage}
                                                    />
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">6.7 Community giving</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.community_giving || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">6.8 Core values</p>
                                                        <p className="text-foreground text-sm whitespace-pre-line">{client.form_submission?.core_values || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 7: Branding & Visuals */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">7. Branding</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">7.1 Website colors</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.website_colors || 'Not provided'}</p>
                                                    </div>
                                                    <FormField label="7.2 Has specific font" value={client.form_submission?.has_specific_font ? 'Yes' : 'No'} badge />
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">7.3 Font name</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.font_name || 'Not provided'}</p>
                                                    </div>
                                                    <FormField label="7.4 Has brand book" value={client.form_submission?.has_brand_book ? 'Yes' : 'No'} badge />
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">7.5 Brand book link</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.brand_book_link || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 8: Online Presence */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">8. Online Presence</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <FormField label="8.1 Google Business Profile" value={client.form_submission?.google_business_profile || 'Not provided'} link />
                                                    <FormField label="8.2 Display Google reviews" value={client.form_submission?.google_reviews || 'Not provided'} />
                                                    <FormField label="8.3 Other reviews link" value={client.form_submission?.other_reviews_link || 'Not provided'} link />
                                                    <FormField label="8.4 Yelp link" value={client.form_submission?.yelp_link || 'Not provided'} link />
                                                    <FormField label="8.5 Instagram link" value={client.form_submission?.instagram_link || 'Not provided'} link />
                                                    <FormField label="8.6 Facebook link" value={client.form_submission?.facebook_link || 'Not provided'} link />
                                                    <FormField label="8.7 TikTok link" value={client.form_submission?.tiktok_link || 'Not provided'} link />
                                                    <FormField label="8.8 Work photos link" value={client.form_submission?.work_photos_link || 'Not provided'} link />
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 9: Offers & Financing */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">9. Offers</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <FormField label="9.1 Do you have any special offers" value={client.form_submission?.special_offers ? 'Yes' : 'No'} badge />
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">9.2 Special offers details</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.special_offers_details || 'Not provided'}</p>
                                                    </div>
                                                    <FormField label="9.3 Do you offer financing" value={client.form_submission?.financing ? 'Yes' : 'No'} badge />
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">9.4 Financing details</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.financing_details || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Section 10: Final */}
                                        <Collapsible>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-transparent border border-cyan-500/30 hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <List className="w-4 h-4 text-cyan-400" />
                                                        <span className="font-orbitron text-sm font-bold text-cyan-400">10. Final</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-3 border-x border-b border-cyan-500/20 rounded-b-lg bg-cyan-500/5">
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-2">10.1 Competitor websites you admire</p>
                                                        {client.form_submission?.competitor_websites && Array.isArray(client.form_submission.competitor_websites) && client.form_submission.competitor_websites.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {client.form_submission.competitor_websites.map((url: string, i: number) => (
                                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" 
                                                                       className="block text-cyan-400 text-xs hover:underline truncate">
                                                                        {url}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-foreground text-sm">Not provided</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">10.2 Additional notes</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.additional_notes || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">10.3 Work photos</p>
                                                        <p className="text-foreground text-sm">{client.form_submission?.work_photos?.length ? `${client.form_submission.work_photos.length} photos uploaded` : 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        {/* Brand & Status Summary */}
                                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4 mt-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">Brand Voice</p>
                                                    <p className="text-foreground text-sm">{client.brand_voice || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">Target Audience</p>
                                                    <p className="text-foreground text-sm">{client.target_audience || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-orbitron text-muted-foreground uppercase mb-1">Status</p>
                                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[10px]">
                                                        {client.status || 'PENDING'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                            </>
                                        )}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>

                    </div>
                </div>
            </div>

            {/* Image Popup Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Full size preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default IndividualClientProfile;
