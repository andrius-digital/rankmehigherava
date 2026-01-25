import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Globe,
    BarChart3,
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
    ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HUDOverlay from '@/components/ui/HUDOverlay';
import PortalSwitcher from '@/components/PortalSwitcher';
import { PopupSection } from '@/components/ui/popup-section';
import ClientRequestForm from '@/components/ClientRequestForm';
import ClientRequestsTracker from '@/components/ClientRequestsTracker';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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

    // Fetch all clients
    const { data: allClients = [], isLoading: clientsLoading } = useQuery({
        queryKey: ['all-clients-for-client-portal'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .neq('status', 'ARCHIVED')
                .order('created_at', { ascending: false });
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

    // Client card component
    const ClientCard: React.FC<{ client: any; type: 'website' | 'funnel' }> = ({ client, type }) => {
        const logo = getClientLogo(client);
        const pendingCount = pendingRequestsMap[client.id] || 0;

        return (
            <button
                onClick={() => setSelectedClientId(client.id)}
                className="relative w-full text-left bg-card/30 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
            >
                {/* Notification Badge */}
                {pendingCount > 0 && (
                    <div className="absolute -top-2 -right-2 z-10 min-w-[22px] h-[22px] px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/50 border-2 border-slate-900">
                        {pendingCount}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {logo ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-500/30 bg-zinc-900 p-0.5 flex-shrink-0">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                            {type === 'funnel' ? (
                                <Layers className="w-6 h-6 text-emerald-400" />
                            ) : (
                                <Building2 className="w-6 h-6 text-emerald-400" />
                            )}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className={`font-orbitron text-[7px] px-1.5 py-0 ${
                                type === 'funnel'
                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}>
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
                    <ChevronRight className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </button>
        );
    };

    // If a client is selected, show their dashboard
    if (selectedClientId && selectedClient) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                <Helmet>
                    <title>{selectedClient.company_name || selectedClient.name} | Client Portal</title>
                </Helmet>

                <HUDOverlay />

                <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
                    {/* Header with Back Button */}
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedClientId(null)}
                                    className="mb-3 text-muted-foreground hover:text-foreground -ml-2"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to All Clients
                                </Button>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="font-orbitron text-[10px] tracking-[0.2em] text-emerald-400 uppercase">
                                        Viewing as Client
                                    </span>
                                </div>
                                <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-white via-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-3">
                                    CLIENT PORTAL
                                </h1>
                                <PortalSwitcher />
                            </div>

                            <div className="flex gap-1.5 flex-wrap">
                                <ClientRequestForm
                                    clientId={selectedClientId}
                                    freeHoursRemaining={freeHoursRemaining}
                                    trigger={
                                        <Button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition-all font-orbitron text-[8px] uppercase tracking-widest text-white font-bold">
                                            <Send className="w-3 h-3" />
                                            Request Adjustment
                                        </Button>
                                    }
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1.5 font-orbitron text-[8px] uppercase tracking-widest text-muted-foreground"
                                >
                                    <Bell className="w-3 h-3" />
                                    Notifications
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1.5 font-orbitron text-[8px] uppercase tracking-widest text-muted-foreground"
                                >
                                    <HelpCircle className="w-3 h-3" />
                                    Support
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Client Info Header Card */}
                    <div className="bg-card/20 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {getClientLogo(selectedClient) ? (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/30 bg-zinc-900 p-1">
                                        <img src={getClientLogo(selectedClient)!} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                                        <Globe className="w-8 h-8 text-emerald-400" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="font-orbitron text-xl font-bold text-foreground">
                                        {selectedClient.company_name || selectedClient.name}
                                    </h2>
                                    {selectedClient.website_url && (
                                        <a
                                            href={selectedClient.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            {selectedClient.website_url}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-orbitron text-[10px]">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Free Hours Banner */}
                    <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        <span className="text-orange-400 font-bold">{freeHoursRemaining} hour</span> of free adjustments this month
                                    </p>
                                    <p className="text-xs text-muted-foreground">Additional work billed at $100/hour</p>
                                </div>
                            </div>
                            <ClientRequestForm
                                clientId={selectedClientId}
                                freeHoursRemaining={freeHoursRemaining}
                                trigger={
                                    <Button size="sm" className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30">
                                        <Send className="w-3 h-3 mr-1.5" />
                                        Submit Request
                                    </Button>
                                }
                            />
                        </div>
                    </div>

                    {/* Main Dashboard Card */}
                    <div className="bg-card/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                                <h2 className="font-orbitron text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                                    {selectedClient.company_name || selectedClient.name}'s Dashboard
                                </h2>
                            </div>
                        </div>

                        <div className="p-3 sm:p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                {/* Active Services */}
                                <PopupSection
                                    title="Active Services"
                                    icon={CheckCircle2}
                                    color="emerald"
                                    metric={{ value: `${servicesCompletionPercent}%` }}
                                >
                                    <div className="space-y-3">
                                        {servicesLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            clientServices.map((service) => (
                                                <div
                                                    key={service.id}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                        service.checked
                                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                                            : 'bg-card/30 border-white/10'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                                        service.checked
                                                            ? 'bg-emerald-500/20 border-emerald-500/30'
                                                            : 'bg-white/5 border-white/10'
                                                    }`}>
                                                        {service.checked ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${service.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {service.label}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                                                    </div>
                                                    <Badge className={`text-[8px] ${
                                                        service.checked
                                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                            : 'bg-white/5 text-muted-foreground border-white/10'
                                                    }`}>
                                                        {service.checked ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                        <p className="text-xs text-muted-foreground text-center pt-2">
                                            Contact us to add or modify services
                                        </p>
                                    </div>
                                </PopupSection>

                                {/* My Requests */}
                                <PopupSection
                                    title="My Requests"
                                    icon={MessageSquare}
                                    color="orange"
                                    notificationCount={requestsData?.pending || 0}
                                    badge={requestsData?.pending ? { label: `${requestsData.pending} PENDING`, variant: 'warning' as const } : undefined}
                                    metric={!requestsData?.pending ? { value: requestsData?.total || 0, suffix: ' total' } : undefined}
                                >
                                    <div className="space-y-4">
                                        <ClientRequestsTracker
                                            clientId={selectedClientId}
                                            clientName={selectedClient.name || 'Client'}
                                            isAgencyView={true}
                                        />
                                        <ClientRequestForm
                                            clientId={selectedClientId}
                                            freeHoursRemaining={freeHoursRemaining}
                                            trigger={
                                                <Button className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30">
                                                    <Send className="w-4 h-4 mr-2" />
                                                    New Request
                                                </Button>
                                            }
                                        />
                                    </div>
                                </PopupSection>

                                {/* Billing */}
                                <PopupSection
                                    title="Billing"
                                    icon={CreditCard}
                                    color="cyan"
                                >
                                    <div className="space-y-4">
                                        <div className="p-4 bg-card/30 rounded-lg border border-cyan-500/20">
                                            <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Current Plan</p>
                                            <p className="text-lg font-orbitron font-bold text-cyan-400">Professional</p>
                                        </div>
                                        <div className="p-4 bg-card/30 rounded-lg border border-cyan-500/20">
                                            <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Billing Status</p>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Active
                                            </Badge>
                                        </div>
                                        <Button className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Manage Billing
                                        </Button>
                                    </div>
                                </PopupSection>

                                {/* Support */}
                                <PopupSection
                                    title="Support"
                                    icon={HelpCircle}
                                    color="purple"
                                >
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Need help? Our team is here to assist you with any questions or issues.
                                        </p>
                                        <div className="space-y-2">
                                            <Button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30">
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Contact Support
                                            </Button>
                                            <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                                                <Mail className="w-4 h-4 mr-2" />
                                                Email Us
                                            </Button>
                                        </div>
                                        <div className="p-3 bg-card/30 rounded-lg border border-purple-500/20">
                                            <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-1">Emergency Support</p>
                                            <p className="text-sm text-foreground">Available 24/7 for critical issues</p>
                                        </div>
                                    </div>
                                </PopupSection>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show client selection view
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Client Portal | Rank Me Higher</title>
                <meta name="description" content="View and manage client dashboards." />
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-orbitron text-[10px] tracking-[0.2em] text-emerald-400 uppercase">Select Client</span>
                            </div>
                            <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-white via-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-3">
                                CLIENT PORTAL
                            </h1>
                            <PortalSwitcher />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search clients by name or website..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-card/30 border-emerald-500/20 focus:border-emerald-500/50 font-orbitron"
                    />
                </div>

                {clientsLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Website Clients */}
                        {filteredWebsites.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <h2 className="font-orbitron text-lg font-bold text-foreground">Websites</h2>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-orbitron text-[8px]">
                                        {filteredWebsites.length}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredWebsites.map((client) => (
                                        <ClientCard key={client.id} client={client} type="website" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Funnel Clients */}
                        {filteredFunnels.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <h2 className="font-orbitron text-lg font-bold text-foreground">Funnels</h2>
                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px]">
                                        {filteredFunnels.length}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
