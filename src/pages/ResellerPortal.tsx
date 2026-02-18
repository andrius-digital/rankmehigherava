import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Briefcase,
    Users,
    Globe,
    Plus,
    MonitorSmartphone,
    Layers,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    ArrowRight,
    Building2,
    RefreshCw,
    AlertTriangle,
    Trash2,
    ExternalLink,
    Mail,
    Loader2,
    Check,
    MoreHorizontal,
    PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import HUDOverlay from '@/components/ui/HUDOverlay';
import PortalSwitcher from '@/components/PortalSwitcher';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Helper: get logo via Google favicon service
const getClientLogo = (client: any): string | null => {
    if (client.website_url) {
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(client.website_url)}&sz=128`;
    }
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            const domain = parsed?.live_domain || parsed?.dummy_domain;
            if (domain) return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
        } catch {}
    }
    return null;
};

// Helper: check if client is a funnel
const isFunnelClient = (client: any): boolean => {
    if (client.brand_voice === 'Funnel Client') return true;
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            if (parsed?.submission_type === 'funnel') return true;
        } catch {}
    }
    return false;
};

// Helper: check if client is a reseller account
const isResellerAccount = (client: any): boolean => {
    if (client.brand_voice === 'Reseller Account') return true;
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            return parsed?.is_reseller === true;
        } catch {}
    }
    return false;
};

// Helper: get reseller parent id from notes
const getResellerParentId = (client: any): string | null => {
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            return parsed?.reseller_parent_id || null;
        } catch {}
    }
    return null;
};

// Helper: check if client is new (created within last 7 days)
const isNewClient = (client: any): boolean => {
    if (!client.created_at) return false;
    const createdAt = new Date(client.created_at);
    const now = new Date();
    const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
};

// Helper: get funnel domains
const getFunnelDomains = (client: any): { dummyDomain: string | null; liveDomain: string | null } => {
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            return {
                dummyDomain: parsed?.dummy_domain || null,
                liveDomain: parsed?.live_domain || null,
            };
        } catch {}
    }
    return { dummyDomain: null, liveDomain: null };
};

const MAX_VISIBLE_CARDS = 6;

const ResellerPortal: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { isAdmin, isReseller, resellerId: userResellerId } = useAuth();

    // For reseller users, lock to their own reseller. For admins, allow switching.
    const isResellerUser = isReseller && !isAdmin;
    const [selectedResellerId, setSelectedResellerId] = useState<string | null>(null);
    const [showResellerDropdown, setShowResellerDropdown] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showOnboardWebsiteForm, setShowOnboardWebsiteForm] = useState(false);
    const [isSubmittingWebsite, setIsSubmittingWebsite] = useState(false);
    const [showAllWebsites, setShowAllWebsites] = useState(false);
    const [showAllFunnels, setShowAllFunnels] = useState(false);

    const [websiteFormData, setWebsiteFormData] = useState({
        companyName: '',
        websiteUrl: '',
        businessEmail: '',
        businessPhone: '',
        primaryServices: '',
        additionalNotes: '',
    });

    const websiteScrollRef = useRef<HTMLDivElement>(null);
    const funnelScrollRef = useRef<HTMLDivElement>(null);

    const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) ref.current.scrollBy({ left: -320, behavior: 'smooth' });
    };
    const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) ref.current.scrollBy({ left: 320, behavior: 'smooth' });
    };

    // Fetch all clients
    const { data: allClients = [], isLoading, error: queryError, refetch } = useQuery({
        queryKey: ['all-clients'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as any[];
        },
        staleTime: 1000 * 60 * 1,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
    });

    // Get all reseller accounts
    const resellerAccounts = allClients.filter(c => isResellerAccount(c) && c.status !== 'ARCHIVED');

    // For reseller users, always use their linked reseller. For admins, use selected or first.
    const activeResellerId = isResellerUser
        ? userResellerId
        : (selectedResellerId || (resellerAccounts.length > 0 ? resellerAccounts[0].id : null));
    const activeReseller = resellerAccounts.find(r => r.id === activeResellerId);

    // Get clients belonging to the selected reseller
    const resellerChildren = allClients.filter(c => {
        if (isResellerAccount(c)) return false;
        if (c.status === 'ARCHIVED') return false;
        const parentId = getResellerParentId(c);
        return parentId === activeResellerId;
    });

    // Search filter helper
    const clientMatchesSearch = (c: any, search: string): boolean => {
        const s = search.toLowerCase();
        return (
            (c.company_name || c.name || '').toLowerCase().includes(s) ||
            (c.website_url || '').toLowerCase().includes(s) ||
            (c.email || '').toLowerCase().includes(s)
        );
    };

    // Split into websites and funnels
    const websiteClients = resellerChildren
        .filter(c => !isFunnelClient(c))
        .filter(c => !globalSearch || clientMatchesSearch(c, globalSearch));

    const funnelClients = resellerChildren
        .filter(c => isFunnelClient(c))
        .filter(c => !globalSearch || clientMatchesSearch(c, globalSearch));

    // Onboard website under current reseller
    const handleOnboardWebsite = async () => {
        if (!websiteFormData.companyName || !activeResellerId) {
            toast({ title: "Missing required fields", description: "Company name is required.", variant: "destructive" });
            return;
        }

        setIsSubmittingWebsite(true);
        try {
            const notesData = {
                submission_type: 'website',
                additional_notes: websiteFormData.additionalNotes,
                reseller_parent_id: activeResellerId,
                reseller_parent_name: activeReseller?.company_name || activeReseller?.name,
                submitted_at: new Date().toISOString(),
            };

            const services = websiteFormData.primaryServices
                ? websiteFormData.primaryServices.split(',').map(s => s.trim()).filter(Boolean)
                : [];

            const { error } = await supabase.from('clients').insert({
                name: websiteFormData.companyName,
                company_name: websiteFormData.companyName,
                website_url: websiteFormData.websiteUrl || null,
                email: websiteFormData.businessEmail || null,
                phone: websiteFormData.businessPhone || null,
                brand_voice: 'Website Client',
                status: 'PENDING',
                primary_services: services.length > 0 ? services : null,
                notes: JSON.stringify(notesData),
            });

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['all-clients'] });
            toast({ title: "Website onboarded!", description: `${websiteFormData.companyName} added under ${activeReseller?.company_name}.` });
            setWebsiteFormData({ companyName: '', websiteUrl: '', businessEmail: '', businessPhone: '', primaryServices: '', additionalNotes: '' });
            setShowOnboardWebsiteForm(false);
        } catch (error) {
            console.error('Onboard error:', error);
            toast({ title: "Failed to onboard", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
        } finally {
            setIsSubmittingWebsite(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-white text-sm">Loading clients...</p>
                </div>
            </div>
        );
    }

    if (queryError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 text-sm mb-2">Error loading data</p>
                    <p className="text-xs text-gray-400">{String(queryError)}</p>
                    <Button onClick={() => refetch()} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Reseller Portal | Rank Me Higher</title>
                <meta name="description" content="Manage your reseller clients and websites." />
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
                {/* Header - matches Agency Portal exactly */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="font-orbitron text-[10px] tracking-[0.2em] text-cyan-400 uppercase">
                                    {activeReseller ? (activeReseller.company_name || activeReseller.name) : 'Reseller Portal'}
                                </span>
                            </div>
                            <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
                                RESELLER PORTAL
                            </h1>
                            <PortalSwitcher />
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                            <button
                                onClick={() => setShowOnboardWebsiteForm(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all font-orbitron text-[8px] uppercase tracking-widest text-white font-bold"
                            >
                                <MonitorSmartphone className="w-2.5 h-2.5" />
                                Onboard New Website
                            </button>
                            {/* Reseller Selector - only for admins */}
                            {!isResellerUser && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowResellerDropdown(!showResellerDropdown)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-transparent hover:bg-cyan-500/10 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400 font-bold"
                                >
                                    <Briefcase className="w-2.5 h-2.5" />
                                    {activeReseller?.company_name || activeReseller?.name || 'Select Reseller'}
                                    <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showResellerDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showResellerDropdown && (
                                    <div className="absolute top-full right-0 mt-1 min-w-[220px] z-50 bg-zinc-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-xl overflow-hidden">
                                        {resellerAccounts.map(reseller => (
                                            <button
                                                key={reseller.id}
                                                onClick={() => {
                                                    setSelectedResellerId(reseller.id);
                                                    setShowResellerDropdown(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-500/10 transition-colors text-left ${
                                                    reseller.id === activeResellerId ? 'bg-cyan-500/15 border-l-2 border-cyan-400' : ''
                                                }`}
                                            >
                                                <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                                    <Briefcase className="w-3 h-3 text-cyan-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-orbitron font-bold text-foreground truncate">
                                                        {reseller.company_name || reseller.name}
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground">
                                                        {allClients.filter(c => !isResellerAccount(c) && c.status !== 'ARCHIVED' && getResellerParentId(c) === reseller.id).length} clients
                                                    </p>
                                                </div>
                                                {reseller.id === activeResellerId && (
                                                    <Check className="w-4 h-4 text-cyan-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            )}
                            <button
                                onClick={() => refetch()}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-orbitron text-[8px] uppercase tracking-widest text-muted-foreground"
                                title="Refresh client list"
                            >
                                <RefreshCw className={`w-2.5 h-2.5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Global Search Bar - same as Agency */}
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search clients by name, email, or domain..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="pl-10 pr-10 h-9 bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 font-orbitron text-xs placeholder:text-muted-foreground/60"
                        />
                        {globalSearch && (
                            <button
                                onClick={() => setGlobalSearch('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* WEBSITES SECTION - matches Agency Portal exactly */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <MonitorSmartphone className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h2 className="font-orbitron text-lg font-bold text-foreground">Websites</h2>
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px]">
                                {websiteClients.length}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scrollLeft(websiteScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button
                                onClick={() => scrollRight(websiteScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-cyan-400" />
                            </button>
                            {websiteClients.length > MAX_VISIBLE_CARDS && (
                                <Dialog open={showAllWebsites} onOpenChange={setShowAllWebsites}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all font-orbitron text-[10px]">
                                            <MoreHorizontal className="w-3 h-3" />
                                            See All
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] bg-background/95 backdrop-blur-xl border-cyan-500/30">
                                        <DialogHeader>
                                            <DialogTitle className="font-orbitron text-cyan-400 flex items-center gap-2">
                                                <MonitorSmartphone className="w-5 h-5" />
                                                All Website Clients ({websiteClients.length})
                                            </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-[60vh] pr-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {websiteClients.map((client) => (
                                                    <Link
                                                        key={client.id}
                                                        to={`/agency/client/${client.id}`}
                                                        className="block bg-gradient-to-br from-card/60 via-card/40 to-transparent border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/60 transition-all"
                                                        onClick={() => setShowAllWebsites(false)}
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {getClientLogo(client) ? (
                                                                <img src={getClientLogo(client)!} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-zinc-900 p-0.5 border border-cyan-500/30" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                                    <Building2 className="w-5 h-5 text-cyan-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <Badge className="bg-primary/20 text-primary border-primary/30 font-orbitron text-[7px] px-1 py-0">
                                                                        WEBSITE
                                                                    </Badge>
                                                                    {isNewClient(client) && (
                                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-orbitron text-[7px] px-1 py-0">
                                                                            NEW
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <h3 className="font-orbitron font-bold text-sm">{client.company_name || client.name}</h3>
                                                                <p className="text-[10px] text-muted-foreground">{client.website_url}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Scrollable Website Cards - same as Agency */}
                    <div
                        ref={websiteScrollRef}
                        className="flex gap-4 overflow-x-auto pt-4 pl-4 pb-2 -ml-4 -mt-2 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {websiteClients.slice(0, MAX_VISIBLE_CARDS).map((client) => {
                            const clientLogo = getClientLogo(client);
                            const clientServices = client.primary_services || [];
                            const clientIsNew = isNewClient(client);
                            const isHighlighted = globalSearch && clientMatchesSearch(client, globalSearch);
                            return (
                                <div key={client.id} className={`relative group flex-shrink-0 w-[300px] snap-start ${isHighlighted ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background rounded-xl' : ''}`}>
                                    <Link
                                        to={`/agency/client/${client.id}`}
                                        className={`block h-full bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-xl border rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 ${isHighlighted ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/20' : 'border-cyan-500/30'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                {clientLogo ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-500/30 bg-zinc-900 p-0.5">
                                                        <img src={clientLogo} alt="Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-cyan-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <Badge className="bg-primary/20 text-primary border-primary/30 font-orbitron text-[7px] px-1 py-0">
                                                        WEBSITE
                                                    </Badge>
                                                    {clientIsNew && (
                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-orbitron text-[7px] px-1 py-0">
                                                            NEW
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-orbitron font-bold text-sm text-foreground truncate">
                                                    {client.company_name || client.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {clientServices.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {clientServices.slice(0, 3).map((service: string, i: number) => (
                                                    <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-orbitron text-muted-foreground">
                                                        {service.length > 20 ? service.substring(0, 20) + '...' : service}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-1 truncate">
                                                <Globe className="w-2.5 h-2.5 text-cyan-400" />
                                                {client.website_url?.replace('https://', '').replace('http://', '') || 'No domain yet'}
                                            </span>
                                            <span className="flex items-center gap-1 text-cyan-400 font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                Open <ArrowRight className="w-2.5 h-2.5" />
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {websiteClients.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground font-orbitron text-xs">
                            {activeReseller
                                ? `No websites under ${activeReseller.company_name || activeReseller.name} yet.`
                                : 'Select a reseller to view websites.'}
                        </div>
                    )}
                </div>

                {/* FUNNELS SECTION - matches Agency Portal exactly */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <Layers className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h2 className="font-orbitron text-lg font-bold text-foreground">Funnels</h2>
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px]">
                                {funnelClients.length}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scrollLeft(funnelScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button
                                onClick={() => scrollRight(funnelScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-cyan-400" />
                            </button>
                            {funnelClients.length > MAX_VISIBLE_CARDS && (
                                <Dialog open={showAllFunnels} onOpenChange={setShowAllFunnels}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all font-orbitron text-[10px]">
                                            <MoreHorizontal className="w-3 h-3" />
                                            See All
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] bg-background/95 backdrop-blur-xl border-cyan-500/30">
                                        <DialogHeader>
                                            <DialogTitle className="font-orbitron text-cyan-400 flex items-center gap-2">
                                                <Layers className="w-5 h-5" />
                                                All Funnel Clients ({funnelClients.length})
                                            </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-[60vh] pr-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {funnelClients.map((client) => {
                                                    const { dummyDomain, liveDomain } = getFunnelDomains(client);
                                                    const domain = liveDomain || dummyDomain;
                                                    return (
                                                        <Link
                                                            key={client.id}
                                                            to={`/agency/client/${client.id}`}
                                                            className="block bg-gradient-to-br from-card/60 via-card/40 to-transparent border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/60 transition-all"
                                                            onClick={() => setShowAllFunnels(false)}
                                                        >
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {getClientLogo(client) ? (
                                                                    <img src={getClientLogo(client)!} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-zinc-900 p-0.5 border border-cyan-500/30" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                                        <Layers className="w-5 h-5 text-cyan-400" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-orbitron text-[7px] px-1 py-0">
                                                                        FUNNEL
                                                                    </Badge>
                                                                    <h3 className="font-orbitron font-bold text-sm">{client.company_name || client.name}</h3>
                                                                    {domain && <p className="text-[10px] text-muted-foreground">{domain}</p>}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Scrollable Funnel Cards - same as Agency */}
                    <div
                        ref={funnelScrollRef}
                        className="flex gap-4 overflow-x-auto pt-4 pl-4 pb-2 -ml-4 -mt-2 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {funnelClients.slice(0, MAX_VISIBLE_CARDS).map((client) => {
                            const clientLogo = getClientLogo(client);
                            const clientServices = client.primary_services || [];
                            const { dummyDomain, liveDomain } = getFunnelDomains(client);
                            const domain = liveDomain || dummyDomain;
                            const isHighlighted = globalSearch && clientMatchesSearch(client, globalSearch);
                            return (
                                <div key={client.id} className={`relative group flex-shrink-0 w-[300px] snap-start ${isHighlighted ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background rounded-xl' : ''}`}>
                                    <Link
                                        to={`/agency/client/${client.id}`}
                                        className={`block h-full bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-xl border rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 ${isHighlighted ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/20' : 'border-cyan-500/30'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                {clientLogo ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-500/30 bg-zinc-900 p-0.5">
                                                        <img src={clientLogo} alt="Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                        <Layers className="w-5 h-5 text-cyan-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-orbitron text-[7px] px-1 py-0">
                                                        FUNNEL
                                                    </Badge>
                                                </div>
                                                <h3 className="font-orbitron font-bold text-sm text-foreground truncate">
                                                    {client.company_name || client.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {clientServices.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {clientServices.slice(0, 3).map((service: string, i: number) => (
                                                    <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-orbitron text-muted-foreground">
                                                        {service.length > 20 ? service.substring(0, 20) + '...' : service}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {domain ? (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Globe className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="truncate">{domain.replace('https://', '').replace('http://', '')}</span>
                                            </div>
                                        ) : client.email ? (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Mail className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        ) : null}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {funnelClients.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground font-orbitron text-xs">
                            {activeReseller
                                ? `No funnels under ${activeReseller.company_name || activeReseller.name} yet.`
                                : 'Select a reseller to view funnels.'}
                        </div>
                    )}
                </div>

                {/* No resellers message */}
                {resellerAccounts.length === 0 && (
                    <div className="text-center py-16">
                        <Briefcase className="w-12 h-12 text-cyan-400/30 mx-auto mb-4" />
                        <p className="font-orbitron text-sm text-muted-foreground mb-2">No reseller accounts yet</p>
                        <p className="text-xs text-muted-foreground mb-4">Create a reseller from the Agency Portal to get started.</p>
                        <Link
                            to="/client-portal"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all font-orbitron text-[10px] uppercase tracking-widest text-white font-bold"
                        >
                            Go to Agency Portal <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Onboard Website Modal */}
            <Dialog open={showOnboardWebsiteForm} onOpenChange={setShowOnboardWebsiteForm}>
                <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-cyan-500/30">
                    <DialogHeader>
                        <DialogTitle className="font-orbitron text-cyan-400 flex items-center gap-2">
                            <MonitorSmartphone className="w-5 h-5" />
                            Onboard Website {activeReseller && (
                                <span className="text-xs text-muted-foreground font-normal">
                                    under {activeReseller.company_name || activeReseller.name}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <Label className="text-xs font-orbitron text-muted-foreground">Company Name *</Label>
                            <Input
                                value={websiteFormData.companyName}
                                onChange={(e) => setWebsiteFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                placeholder="e.g. Chicago Deck Doc"
                                className="mt-1 bg-card/40 border-cyan-500/30 focus:border-cyan-400/60"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-orbitron text-muted-foreground">Website URL</Label>
                            <Input
                                value={websiteFormData.websiteUrl}
                                onChange={(e) => setWebsiteFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                                placeholder="e.g. chicagodeckdoc.com"
                                className="mt-1 bg-card/40 border-cyan-500/30 focus:border-cyan-400/60"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-orbitron text-muted-foreground">Email</Label>
                                <Input
                                    value={websiteFormData.businessEmail}
                                    onChange={(e) => setWebsiteFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                                    placeholder="email@company.com"
                                    className="mt-1 bg-card/40 border-cyan-500/30 focus:border-cyan-400/60"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-orbitron text-muted-foreground">Phone</Label>
                                <Input
                                    value={websiteFormData.businessPhone}
                                    onChange={(e) => setWebsiteFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
                                    placeholder="(555) 123-4567"
                                    className="mt-1 bg-card/40 border-cyan-500/30 focus:border-cyan-400/60"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-orbitron text-muted-foreground">Services (comma separated)</Label>
                            <Input
                                value={websiteFormData.primaryServices}
                                onChange={(e) => setWebsiteFormData(prev => ({ ...prev, primaryServices: e.target.value }))}
                                placeholder="e.g. SEO, Web Design, PPC"
                                className="mt-1 bg-card/40 border-cyan-500/30 focus:border-cyan-400/60"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-orbitron text-muted-foreground">Additional Notes</Label>
                            <Textarea
                                value={websiteFormData.additionalNotes}
                                onChange={(e) => setWebsiteFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                                placeholder="Any additional details..."
                                className="mt-1 bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 min-h-[60px]"
                            />
                        </div>

                        <Button
                            onClick={handleOnboardWebsite}
                            disabled={isSubmittingWebsite || !websiteFormData.companyName}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-orbitron text-xs uppercase tracking-widest"
                        >
                            {isSubmittingWebsite ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Onboarding...</>
                            ) : (
                                <><Plus className="w-4 h-4 mr-2" /> Onboard Website</>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ResellerPortal;
