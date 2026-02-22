import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Globe,
    MessageSquare,
    CreditCard,
    Bell,
    ExternalLink,
    CheckCircle2,
    Clock,
    HelpCircle,
    Send,
    Loader2,
    AlertCircle,
    Search,
    Building2,
    Layers,
    ArrowLeft,
    Mail,
    ChevronRight,
    ChevronDown,
    Shield,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HUDOverlay from '@/components/ui/HUDOverlay';
import PortalSwitcher from '@/components/PortalSwitcher';
import ClientRequestForm from '@/components/ClientRequestForm';
import ClientRequestsTracker from '@/components/ClientRequestsTracker';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Interface for client service items
interface ClientServiceItem {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    notes: string;
}

// Helper to check if client is a funnel client
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

// Helper to check if client is a reseller account
const isResellerAccount = (client: any): boolean => {
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            return parsed?.is_reseller === true;
        } catch {}
    }
    return false;
};

// Get client logo
const getClientLogo = (client: any): string | null => {
    if (client.logo_files && Array.isArray(client.logo_files) && client.logo_files.length > 0) {
        return client.logo_files[0];
    }
    return null;
};

const ClientDashboard: React.FC = () => {
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { isAdmin, isReseller, resellerId: userResellerId } = useAuth();
    const isResellerUser = isReseller && !isAdmin;

    // Collapsible section state
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        services: true,
        requests: true,
        billing: false,
        support: false,
    });

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Fetch clients - scoped by reseller for reseller users
    const { data: allClients = [], isLoading: clientsLoading } = useQuery({
        queryKey: ['all-clients-for-client-portal', isResellerUser ? userResellerId : 'admin'],
        queryFn: async () => {
            let query = supabase
                .from('clients')
                .select('*')
                .neq('status', 'ARCHIVED')
                .order('created_at', { ascending: false });

            // Reseller users only see clients assigned to their reseller
            if (isResellerUser && userResellerId) {
                query = query.eq('reseller_id', userResellerId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });

    // Filter out resellers and separate websites/funnels
    const websiteClients = allClients.filter(c => !isFunnelClient(c) && !isResellerAccount(c));
    const funnelClients = allClients.filter(c => isFunnelClient(c) && !isResellerAccount(c));

    // Filter by search term
    const filteredWebsites = websiteClients.filter(c => {
        const search = searchTerm.toLowerCase();
        const name = (c.company_name || c.name || '').toLowerCase();
        const website = (c.website_url || '').toLowerCase();
        return name.includes(search) || website.includes(search);
    });

    const filteredFunnels = funnelClients.filter(c => {
        const search = searchTerm.toLowerCase();
        const name = (c.company_name || c.name || '').toLowerCase();
        const website = (c.website_url || '').toLowerCase();
        return name.includes(search) || website.includes(search);
    });

    // Fetch pending requests for all clients
    const { data: pendingRequestsData = [] } = useQuery({
        queryKey: ['all-pending-requests-client-portal'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('client_requests')
                .select('client_id, status')
                .in('status', ['pending', 'in_progress']);
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 30,
        refetchInterval: 30000,
    });

    // Create pending requests map
    const pendingRequestsMap: Record<string, number> = {};
    pendingRequestsData.forEach((req: any) => {
        if (req.client_id) {
            pendingRequestsMap[req.client_id] = (pendingRequestsMap[req.client_id] || 0) + 1;
        }
    });

    // Get selected client data
    const selectedClient = allClients.find(c => c.id === selectedClientId);

    // Fetch client services for selected client
    const { data: clientServices = [], isLoading: servicesLoading } = useQuery({
        queryKey: ['client-services-dashboard', selectedClientId],
        queryFn: async () => {
            if (!selectedClientId) return [];

            // Fetch global service items
            const { data: globalServices, error: globalError } = await supabase
                .from('global_client_services')
                .select('*')
                .order('display_order');

            if (globalError) throw globalError;

            // Fetch client-specific status
            const { data: clientStatus, error: statusError } = await supabase
                .from('client_services_status')
                .select('*')
                .eq('client_id', selectedClientId);

            if (statusError) throw statusError;

            // Merge global services with client status
            const statusMap = new Map(clientStatus?.map(s => [s.service_item_id, s]) || []);

            return globalServices?.map(service => {
                const status = statusMap.get(service.id);
                return {
                    id: service.id,
                    label: service.label,
                    description: service.description,
                    checked: status?.checked || false,
                    notes: status?.notes || ''
                };
            }) || [];
        },
        enabled: !!selectedClientId
    });

    // Fetch client requests count for selected client
    const { data: requestsData } = useQuery({
        queryKey: ['client-requests-count', selectedClientId],
        queryFn: async () => {
            if (!selectedClientId) return { pending: 0, total: 0 };

            const { data, error } = await supabase
                .from('client_requests')
                .select('status')
                .eq('client_id', selectedClientId);

            if (error) throw error;

            const pending = data?.filter(r => r.status === 'pending').length || 0;
            return { pending, total: data?.length || 0 };
        },
        enabled: !!selectedClientId
    });

    // Calculate services completion
    const activeServices = clientServices.filter(s => s.checked);
    const servicesCompletionPercent = clientServices.length > 0
        ? Math.round((activeServices.length / clientServices.length) * 100)
        : 0;

    // Free hours (would come from database in production)
    const freeHoursRemaining = 1;

    // Month label formatter for AI usage
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fmtMonth = (m: string) => { const [y, mo] = m.split('-'); return `${monthLabels[parseInt(mo, 10) - 1]} ${y}`; };

    // Client card component
    const ClientCard: React.FC<{ client: any; type: 'website' | 'funnel' }> = ({ client, type }) => {
        const logo = getClientLogo(client);
        const pendingCount = pendingRequestsMap[client.id] || 0;

        return (
            <button
                onClick={() => setSelectedClientId(client.id)}
                className="relative w-full text-left bg-card/30 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
            >
                {/* Notification Badge */}
                {pendingCount > 0 && (
                    <div className="absolute -top-2 -right-2 z-10 min-w-[22px] h-[22px] px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/50 border-2 border-slate-900">
                        {pendingCount}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {logo ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/30 bg-zinc-900 p-0.5 flex-shrink-0">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                            {type === 'funnel' ? (
                                <Layers className="w-6 h-6 text-cyan-400" />
                            ) : (
                                <Building2 className="w-6 h-6 text-cyan-400" />
                            )}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="font-orbitron text-[7px] px-1.5 py-0 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                {type === 'funnel' ? 'FUNNEL' : 'WEBSITE'}
                            </Badge>
                        </div>
                        <h3 className="font-orbitron font-bold text-sm text-foreground truncate">
                            {client.company_name || client.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground truncate">
                            {client.website_url?.replace('https://', '').replace('http://', '')}
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </button>
        );
    };

    // Collapsible section header
    const SectionHeader: React.FC<{
        sectionKey: string;
        icon: React.ElementType;
        title: string;
        metric?: string;
        badge?: { label: string; variant: 'warning' | 'success' | 'default' };
        notificationCount?: number;
    }> = ({ sectionKey, icon: Icon, title, metric, badge, notificationCount }) => {
        const isOpen = expandedSections[sectionKey];
        return (
            <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card/30 border border-cyan-500/15 hover:border-cyan-500/30 transition-all group"
            >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="font-orbitron text-xs font-bold text-foreground uppercase tracking-wider flex-1 text-left">
                    {title}
                </span>
                {notificationCount && notificationCount > 0 ? (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {notificationCount}
                    </span>
                ) : null}
                {badge && (
                    <Badge className={`font-orbitron text-[7px] ${
                        badge.variant === 'warning' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        badge.variant === 'success' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                        'bg-white/5 text-muted-foreground border-white/10'
                    }`}>
                        {badge.label}
                    </Badge>
                )}
                {metric && (
                    <span className="font-orbitron text-xs text-cyan-400 font-bold">{metric}</span>
                )}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        );
    };

    // ─── CLIENT DASHBOARD (selected) ───────────────────────────
    if (selectedClientId && selectedClient) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                <Helmet>
                    <title>{selectedClient.company_name || selectedClient.name} | Client Portal</title>
                </Helmet>

                <HUDOverlay />

                <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">

                    {/* ── Top Bar: Back + Client Identity ── */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => setSelectedClientId(null)}
                            className="w-9 h-9 rounded-xl bg-card/40 border border-white/10 hover:border-cyan-500/40 flex items-center justify-center transition-all flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                        </button>

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getClientLogo(selectedClient) ? (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-cyan-500/30 bg-zinc-900 p-0.5 flex-shrink-0">
                                    <img src={getClientLogo(selectedClient)!} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="font-orbitron text-base sm:text-lg font-bold text-foreground truncate">
                                    {selectedClient.company_name || selectedClient.name}
                                </h1>
                                {selectedClient.website_url && (
                                    <a
                                        href={selectedClient.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors truncate"
                                    >
                                        {selectedClient.website_url.replace('https://', '').replace('http://', '')}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/25 font-orbitron text-[8px] hidden sm:flex flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                        </Badge>
                    </div>

                    {/* ── Quick Actions Row ── */}
                    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                        <ClientRequestForm
                            clientId={selectedClientId}
                            freeHoursRemaining={freeHoursRemaining}
                            trigger={
                                <Button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 font-orbitron text-[9px] uppercase tracking-widest whitespace-nowrap transition-all">
                                    <Send className="w-3 h-3" />
                                    Submit Request
                                </Button>
                            }
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/30 border border-white/10 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span><span className="text-cyan-400 font-bold">{freeHoursRemaining}h</span> free this month</span>
                        </div>
                        <PortalSwitcher />
                    </div>

                    {/* ── Inline Dashboard Sections ── */}
                    <div className="space-y-3">

                        {/* ── Active Services ── */}
                        <div>
                            <SectionHeader
                                sectionKey="services"
                                icon={CheckCircle2}
                                title="Active Services"
                                metric={`${servicesCompletionPercent}%`}
                            />
                            {expandedSections.services && (
                                <div className="mt-2 space-y-2 pl-2 pr-1">
                                    {servicesLoading ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                        </div>
                                    ) : (
                                        clientServices.map((service) => {
                                            // Parse AI usage data
                                            const isAiUsage = service.id === 'dddddddd-dddd-dddd-dddd-dddddddddddd';
                                            let aiEntries: { month: string; monthly_increment: number; cc_fee: number; amount_to_charge: number }[] = [];
                                            if (isAiUsage && service.notes) {
                                                try {
                                                    const parsed = JSON.parse(service.notes);
                                                    aiEntries = (parsed.entries || [])
                                                        .filter((e: any) => e.paid)
                                                        .sort((a: any, b: any) => b.month.localeCompare(a.month));
                                                } catch { /* ignore */ }
                                            }

                                            return (
                                                <div key={service.id}>
                                                    <div
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                                                            service.checked
                                                                ? 'bg-cyan-500/[0.06] border-cyan-500/20'
                                                                : 'bg-card/20 border-white/5'
                                                        }`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                                                            service.checked ? 'text-cyan-400' : 'text-white/20'
                                                        }`}>
                                                            {service.checked ? (
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${service.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                {service.label}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{service.description}</p>
                                                        </div>
                                                        <Badge className={`text-[7px] flex-shrink-0 ${
                                                            service.checked
                                                                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25'
                                                                : 'bg-white/5 text-muted-foreground/60 border-white/5'
                                                        }`}>
                                                            {service.checked ? 'Active' : 'Off'}
                                                        </Badge>
                                                    </div>

                                                    {/* AI Usage billing history */}
                                                    {isAiUsage && aiEntries.length > 0 && (
                                                        <div className="mt-1.5 ml-9 rounded-lg border border-cyan-500/10 overflow-hidden text-xs">
                                                            <div className="grid grid-cols-4 gap-1 px-3 py-1.5 bg-cyan-500/[0.04] text-[8px] font-orbitron text-muted-foreground uppercase tracking-wider">
                                                                <span>Month</span>
                                                                <span className="text-right">Usage</span>
                                                                <span className="text-right">CC Fee</span>
                                                                <span className="text-right">Total</span>
                                                            </div>
                                                            {aiEntries.map((entry: any) => (
                                                                <div key={entry.month} className="grid grid-cols-4 gap-1 px-3 py-1.5 border-t border-white/5">
                                                                    <span className="text-foreground">{fmtMonth(entry.month)}</span>
                                                                    <span className="text-right text-muted-foreground">${entry.monthly_increment.toFixed(2)}</span>
                                                                    <span className="text-right text-muted-foreground">${entry.cc_fee.toFixed(2)}</span>
                                                                    <span className="text-right text-cyan-400 font-medium">${entry.amount_to_charge.toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                            <div className="grid grid-cols-4 gap-1 px-3 py-1.5 border-t border-cyan-500/15 bg-cyan-500/[0.03] font-medium">
                                                                <span className="text-foreground">Total</span>
                                                                <span className="text-right text-muted-foreground">${aiEntries.reduce((s: number, e: any) => s + e.monthly_increment, 0).toFixed(2)}</span>
                                                                <span className="text-right text-muted-foreground">${aiEntries.reduce((s: number, e: any) => s + e.cc_fee, 0).toFixed(2)}</span>
                                                                <span className="text-right text-cyan-400 font-bold">${aiEntries.reduce((s: number, e: any) => s + e.amount_to_charge, 0).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── My Requests ── */}
                        <div>
                            <SectionHeader
                                sectionKey="requests"
                                icon={MessageSquare}
                                title="My Requests"
                                notificationCount={requestsData?.pending || 0}
                                metric={!requestsData?.pending ? `${requestsData?.total || 0} total` : undefined}
                                badge={requestsData?.pending ? { label: `${requestsData.pending} PENDING`, variant: 'warning' } : undefined}
                            />
                            {expandedSections.requests && (
                                <div className="mt-2">
                                    <ClientRequestsTracker
                                        clientId={selectedClientId}
                                        clientName={selectedClient.name || 'Client'}
                                        isAgencyView={true}
                                    />
                                    <div className="mt-3 px-2">
                                        <ClientRequestForm
                                            clientId={selectedClientId}
                                            freeHoursRemaining={freeHoursRemaining}
                                            trigger={
                                                <Button className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 rounded-xl">
                                                    <Send className="w-4 h-4 mr-2" />
                                                    New Request
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Billing ── */}
                        <div>
                            <SectionHeader
                                sectionKey="billing"
                                icon={CreditCard}
                                title="Billing"
                                badge={{ label: 'ACTIVE', variant: 'success' }}
                            />
                            {expandedSections.billing && (
                                <div className="mt-2 space-y-2 pl-2 pr-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="px-4 py-3 bg-card/20 rounded-lg border border-cyan-500/10">
                                            <p className="text-[9px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Current Plan</p>
                                            <p className="text-base font-orbitron font-bold text-cyan-400">Professional</p>
                                        </div>
                                        <div className="px-4 py-3 bg-card/20 rounded-lg border border-cyan-500/10">
                                            <p className="text-[9px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Billing Status</p>
                                            <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/25">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Active
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 rounded-xl">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Manage Billing
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* ── Support ── */}
                        <div>
                            <SectionHeader
                                sectionKey="support"
                                icon={HelpCircle}
                                title="Support"
                            />
                            {expandedSections.support && (
                                <div className="mt-2 space-y-2 pl-2 pr-1">
                                    <p className="text-sm text-muted-foreground px-1">
                                        Need help? Our team is here to assist you.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Button className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 rounded-xl">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Contact Support
                                        </Button>
                                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-xl border border-white/5">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Email Us
                                        </Button>
                                    </div>
                                    <div className="px-4 py-3 bg-card/20 rounded-lg border border-cyan-500/10">
                                        <p className="text-[9px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Emergency Support</p>
                                        <p className="text-sm text-foreground">Available 24/7 for critical issues</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Bottom spacer for mobile */}
                    <div className="h-6" />
                </div>
            </div>
        );
    }

    // ─── CLIENT SELECTION VIEW ─────────────────────────────────
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Client Portal | Rank Me Higher</title>
                <meta name="description" content="View and manage client dashboards." />
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col gap-3 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="font-orbitron text-[10px] tracking-[0.2em] text-cyan-400 uppercase">Select Client</span>
                        </div>
                        <h1 className="font-orbitron text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-cyan-400 to-cyan-500 bg-clip-text text-transparent mb-3">
                            CLIENT PORTAL
                        </h1>
                        <PortalSwitcher />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search clients by name or website..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-11 bg-card/30 border-cyan-500/20 focus:border-cyan-500/50 font-orbitron text-sm"
                    />
                </div>

                {clientsLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Website Clients */}
                        {filteredWebsites.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <h2 className="font-orbitron text-sm sm:text-base font-bold text-foreground">Websites</h2>
                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px]">
                                        {filteredWebsites.length}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredWebsites.map((client) => (
                                        <ClientCard key={client.id} client={client} type="website" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Funnel Clients */}
                        {filteredFunnels.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <h2 className="font-orbitron text-sm sm:text-base font-bold text-foreground">Funnels</h2>
                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px]">
                                        {filteredFunnels.length}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredFunnels.map((client) => (
                                        <ClientCard key={client.id} client={client} type="funnel" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results */}
                        {filteredWebsites.length === 0 && filteredFunnels.length === 0 && (
                            <div className="text-center py-20">
                                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground font-orbitron">No clients found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;
