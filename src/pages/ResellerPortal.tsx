import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Briefcase,
    Users,
    DollarSign,
    TrendingUp,
    Globe,
    Plus,
    Settings,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Search,
    MoreHorizontal,
    Mail,
    Phone,
    Building2,
    Eye,
    Edit2,
    Trash2,
    UserPlus,
    ChevronRight,
    X,
    Clock,
    ArrowUpRight,
    Send,
    Copy,
    Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import HUDOverlay from '@/components/ui/HUDOverlay';
import PortalSwitcher from '@/components/PortalSwitcher';
import { toast } from 'sonner';
import {
    Reseller,
    ResellerWithStats,
    ResellerClient,
    ResellerPayout,
    fetchResellersWithStats,
    createReseller,
    updateReseller,
    deleteReseller,
    activateReseller,
    fetchResellerClients,
    fetchResellerPayouts,
    assignClientToReseller,
    removeClientFromReseller,
    fetchAvailableClients,
    getResellerStats,
    CreateResellerData
} from '@/services/resellerService';

// Reseller Detail Panel Component
interface ResellerDetailPanelProps {
    reseller: ResellerWithStats;
    onClose: () => void;
    onUpdate: () => void;
}

const ResellerDetailPanel: React.FC<ResellerDetailPanelProps> = ({ reseller, onClose, onUpdate }) => {
    const [clients, setClients] = useState<ResellerClient[]>([]);
    const [payouts, setPayouts] = useState<ResellerPayout[]>([]);
    const [availableClients, setAvailableClients] = useState<Array<{ id: string; name: string; email: string | null; company_name: string | null; website_url: string | null; status: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAssignClient, setShowAssignClient] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [monthlyValue, setMonthlyValue] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'payouts'>('overview');
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        loadData();
    }, [reseller.id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [clientsData, payoutsData, availableData] = await Promise.all([
                fetchResellerClients(reseller.id),
                fetchResellerPayouts(reseller.id),
                fetchAvailableClients()
            ]);
            setClients(clientsData);
            setPayouts(payoutsData);
            setAvailableClients(availableData);
        } catch (error) {
            console.error('Error loading reseller data:', error);
            toast.error('Failed to load reseller data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignClient = async () => {
        if (!selectedClientId || !monthlyValue) {
            toast.error('Please select a client and enter monthly value');
            return;
        }
        try {
            await assignClientToReseller(reseller.id, selectedClientId, parseFloat(monthlyValue));
            toast.success('Client assigned successfully');
            setShowAssignClient(false);
            setSelectedClientId('');
            setMonthlyValue('');
            loadData();
            onUpdate();
        } catch (error) {
            console.error('Error assigning client:', error);
            toast.error('Failed to assign client');
        }
    };

    const handleRemoveClient = async (clientId: string) => {
        try {
            await removeClientFromReseller(clientId);
            toast.success('Client removed from reseller');
            loadData();
            onUpdate();
        } catch (error) {
            console.error('Error removing client:', error);
            toast.error('Failed to remove client');
        }
    };

    const copyInviteLink = () => {
        const inviteLink = `${window.location.origin}/auth?invite=${reseller.id}`;
        navigator.clipboard.writeText(inviteLink);
        setCopiedLink(true);
        toast.success('Invite link copied!');
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const stats = reseller.stats || { total_clients: 0, active_clients: 0, monthly_revenue: 0, pending_commission: 0 };

    return (
        <div className="fixed inset-0 z-50 lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-[500px] bg-background border-l border-white/10 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-card/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/25">
                        {reseller.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">{reseller.name}</h2>
                        <p className="text-xs text-muted-foreground">{reseller.company_name || reseller.email}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Status & Quick Stats */}
            <div className="p-4 border-b border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <Badge className={`font-orbitron text-[10px] ${
                        reseller.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        reseller.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                        {reseller.status}
                    </Badge>
                    {reseller.status === 'pending' && (
                        <Button
                            size="sm"
                            onClick={copyInviteLink}
                            className="h-7 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                        >
                            {copiedLink ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                            {copiedLink ? 'Copied!' : 'Copy Invite Link'}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card/30 rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-muted-foreground uppercase font-orbitron">Monthly Revenue</p>
                        <p className="text-xl font-bold text-emerald-400">${stats.monthly_revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-card/30 rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-muted-foreground uppercase font-orbitron">Commission ({reseller.commission_rate}%)</p>
                        <p className="text-xl font-bold text-orange-400">${stats.pending_commission.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {(['overview', 'clients', 'payouts'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-xs font-orbitron uppercase tracking-wider transition-colors ${
                            activeTab === tab
                                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <div className="bg-card/30 rounded-lg p-4 border border-white/5 space-y-3">
                                    <h3 className="font-orbitron text-xs uppercase text-muted-foreground">Contact Info</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-cyan-400" />
                                            <span>{reseller.email}</span>
                                        </div>
                                        {reseller.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-cyan-400" />
                                                <span>{reseller.phone}</span>
                                            </div>
                                        )}
                                        {reseller.website_url && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Globe className="w-4 h-4 text-cyan-400" />
                                                <a href={reseller.website_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                                    {reseller.website_url}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-card/30 rounded-lg p-4 border border-white/5 space-y-3">
                                    <h3 className="font-orbitron text-xs uppercase text-muted-foreground">Performance</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">{stats.total_clients}</p>
                                            <p className="text-xs text-muted-foreground">Total Clients</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-emerald-400">{stats.active_clients}</p>
                                            <p className="text-xs text-muted-foreground">Active Clients</p>
                                        </div>
                                    </div>
                                </div>

                                {reseller.notes && (
                                    <div className="bg-card/30 rounded-lg p-4 border border-white/5 space-y-2">
                                        <h3 className="font-orbitron text-xs uppercase text-muted-foreground">Notes</h3>
                                        <p className="text-sm text-muted-foreground">{reseller.notes}</p>
                                    </div>
                                )}

                                <div className="bg-card/30 rounded-lg p-4 border border-white/5 space-y-2">
                                    <h3 className="font-orbitron text-xs uppercase text-muted-foreground">Timeline</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Created</span>
                                            <span>{new Date(reseller.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {reseller.onboarded_at && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Onboarded</span>
                                                <span>{new Date(reseller.onboarded_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'clients' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-orbitron text-xs uppercase text-muted-foreground">Assigned Clients</h3>
                                    <Button
                                        size="sm"
                                        onClick={() => setShowAssignClient(true)}
                                        className="h-7 text-xs bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/25"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Assign
                                    </Button>
                                </div>

                                {clients.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No clients assigned yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {clients.map((client) => (
                                            <div key={client.id} className="bg-card/30 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                                        <Globe className="w-4 h-4 text-cyan-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{client.client?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-muted-foreground">{client.client?.website_url || client.client?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <p className="font-bold text-emerald-400">${client.monthly_value}/mo</p>
                                                        <Badge className={`text-[8px] ${
                                                            client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                            {client.status}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveClient(client.id)}
                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Assign Client Dialog */}
                                <Dialog open={showAssignClient} onOpenChange={setShowAssignClient}>
                                    <DialogContent className="bg-card border-white/10">
                                        <DialogHeader>
                                            <DialogTitle>Assign Client to {reseller.name}</DialogTitle>
                                            <DialogDescription>
                                                Select a client and set their monthly value.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Select Client</Label>
                                                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                                    <SelectTrigger className="bg-background/50 border-white/10">
                                                        <SelectValue placeholder="Choose a client..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableClients.map((client) => (
                                                            <SelectItem key={client.id} value={client.id}>
                                                                {client.name} {client.company_name && `(${client.company_name})`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Monthly Value ($)</Label>
                                                <Input
                                                    type="number"
                                                    value={monthlyValue}
                                                    onChange={(e) => setMonthlyValue(e.target.value)}
                                                    placeholder="299"
                                                    className="bg-background/50 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setShowAssignClient(false)}>Cancel</Button>
                                            <Button onClick={handleAssignClient} className="bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/25">
                                                Assign Client
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        {activeTab === 'payouts' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-orbitron text-xs uppercase text-muted-foreground">Payout History</h3>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Total Paid</p>
                                        <p className="font-bold text-emerald-400">${reseller.total_commission_paid.toLocaleString()}</p>
                                    </div>
                                </div>

                                {payouts.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No payouts yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {payouts.map((payout) => (
                                            <div key={payout.id} className="bg-card/30 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">${payout.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge className={`text-[8px] ${
                                                    payout.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    payout.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    {payout.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Main Component
const ResellerPortal: React.FC = () => {
    const [resellers, setResellers] = useState<ResellerWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedReseller, setSelectedReseller] = useState<ResellerWithStats | null>(null);
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [resellerToDelete, setResellerToDelete] = useState<Reseller | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateResellerData>({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        website_url: '',
        commission_rate: 30,
        notes: ''
    });

    useEffect(() => {
        loadResellers();
    }, []);

    const loadResellers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchResellersWithStats();
            setResellers(data);
        } catch (error) {
            console.error('Error loading resellers:', error);
            // Use mock data for demo
            setResellers([
                {
                    id: '1',
                    user_id: null,
                    name: 'John Smith',
                    email: 'john@whitelabel.agency',
                    phone: '+1 555-0123',
                    company_name: 'White Label Agency',
                    website_url: 'https://whitelabel.agency',
                    commission_rate: 30,
                    status: 'active',
                    notes: 'Premium partner since 2024',
                    total_revenue: 12500,
                    total_commission_paid: 3750,
                    created_at: '2024-06-15T00:00:00Z',
                    updated_at: '2024-12-01T00:00:00Z',
                    onboarded_at: '2024-06-20T00:00:00Z',
                    last_login_at: '2026-01-30T00:00:00Z',
                    stats: { total_clients: 8, active_clients: 7, monthly_revenue: 2450, pending_commission: 735 }
                },
                {
                    id: '2',
                    user_id: null,
                    name: 'Sarah Johnson',
                    email: 'sarah@digitalmarketing.co',
                    phone: '+1 555-0456',
                    company_name: 'Digital Marketing Co',
                    website_url: 'https://digitalmarketing.co',
                    commission_rate: 25,
                    status: 'active',
                    notes: null,
                    total_revenue: 8200,
                    total_commission_paid: 2050,
                    created_at: '2024-09-01T00:00:00Z',
                    updated_at: '2024-11-15T00:00:00Z',
                    onboarded_at: '2024-09-05T00:00:00Z',
                    last_login_at: '2026-01-28T00:00:00Z',
                    stats: { total_clients: 5, active_clients: 5, monthly_revenue: 1650, pending_commission: 412.5 }
                },
                {
                    id: '3',
                    user_id: null,
                    name: 'Mike Wilson',
                    email: 'mike@growthpartners.io',
                    phone: null,
                    company_name: 'Growth Partners',
                    website_url: null,
                    commission_rate: 30,
                    status: 'pending',
                    notes: 'Awaiting onboarding call',
                    total_revenue: 0,
                    total_commission_paid: 0,
                    created_at: '2026-01-25T00:00:00Z',
                    updated_at: '2026-01-25T00:00:00Z',
                    onboarded_at: null,
                    last_login_at: null,
                    stats: { total_clients: 0, active_clients: 0, monthly_revenue: 0, pending_commission: 0 }
                },
                {
                    id: '4',
                    user_id: null,
                    name: 'Emily Chen',
                    email: 'emily@webstudio.dev',
                    phone: '+1 555-0789',
                    company_name: 'Web Studio',
                    website_url: 'https://webstudio.dev',
                    commission_rate: 35,
                    status: 'active',
                    notes: 'High performer - special rate',
                    total_revenue: 18900,
                    total_commission_paid: 6615,
                    created_at: '2024-03-10T00:00:00Z',
                    updated_at: '2024-12-20T00:00:00Z',
                    onboarded_at: '2024-03-15T00:00:00Z',
                    last_login_at: '2026-01-31T00:00:00Z',
                    stats: { total_clients: 12, active_clients: 10, monthly_revenue: 3800, pending_commission: 1330 }
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateReseller = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and email are required');
            return;
        }
        try {
            await createReseller(formData);
            toast.success('Reseller created successfully');
            setShowOnboardModal(false);
            setFormData({ name: '', email: '', phone: '', company_name: '', website_url: '', commission_rate: 30, notes: '' });
            loadResellers();
        } catch (error) {
            console.error('Error creating reseller:', error);
            toast.error('Failed to create reseller');
        }
    };

    const handleActivateReseller = async (reseller: Reseller) => {
        try {
            await activateReseller(reseller.id);
            toast.success(`${reseller.name} has been activated`);
            loadResellers();
        } catch (error) {
            console.error('Error activating reseller:', error);
            toast.error('Failed to activate reseller');
        }
    };

    const handleDeleteReseller = async () => {
        if (!resellerToDelete) return;
        try {
            await deleteReseller(resellerToDelete.id);
            toast.success('Reseller deleted');
            setShowDeleteDialog(false);
            setResellerToDelete(null);
            if (selectedReseller?.id === resellerToDelete.id) {
                setSelectedReseller(null);
            }
            loadResellers();
        } catch (error) {
            console.error('Error deleting reseller:', error);
            toast.error('Failed to delete reseller');
        }
    };

    // Filter resellers
    const filteredResellers = resellers.filter(reseller => {
        const matchesSearch =
            reseller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reseller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (reseller.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
        const matchesStatus = statusFilter === 'all' || reseller.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate totals
    const totals = {
        totalResellers: resellers.length,
        activeResellers: resellers.filter(r => r.status === 'active').length,
        pendingResellers: resellers.filter(r => r.status === 'pending').length,
        totalMonthlyRevenue: resellers.reduce((sum, r) => sum + (r.stats?.monthly_revenue || 0), 0),
        totalPendingCommission: resellers.reduce((sum, r) => sum + (r.stats?.pending_commission || 0), 0),
        totalClients: resellers.reduce((sum, r) => sum + (r.stats?.total_clients || 0), 0)
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Reseller Management | Admin Portal</title>
                <meta name="description" content="Manage your reseller partners and track their performance." />
            </Helmet>

            <HUDOverlay />

            <div className={`relative z-10 transition-all duration-300 ${selectedReseller ? 'lg:mr-[500px]' : ''}`}>
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    {/* Header */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="font-orbitron text-[10px] tracking-[0.2em] text-cyan-400 uppercase">Admin Portal</span>
                                </div>
                                <h1 className="font-orbitron text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-cyan-400 to-cyan-500 bg-clip-text text-transparent mb-3">
                                    RESELLER MANAGEMENT
                                </h1>
                                <PortalSwitcher />
                            </div>

                            <Button
                                onClick={() => setShowOnboardModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 transition-all font-orbitron text-xs uppercase tracking-widest text-white font-bold shadow-lg shadow-cyan-500/25"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Onboard Reseller</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-card/20 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <span className="text-[9px] md:text-[10px] font-orbitron text-muted-foreground uppercase">Resellers</span>
                            </div>
                            <p className="text-xl md:text-2xl font-orbitron font-bold text-cyan-400">{totals.totalResellers}</p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground">{totals.activeResellers} active, {totals.pendingResellers} pending</p>
                        </div>
                        <div className="bg-card/20 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-4 h-4 text-cyan-400" />
                                <span className="text-[9px] md:text-[10px] font-orbitron text-muted-foreground uppercase">Total Clients</span>
                            </div>
                            <p className="text-xl md:text-2xl font-orbitron font-bold text-cyan-400">{totals.totalClients}</p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground">Across all resellers</p>
                        </div>
                        <div className="bg-card/20 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-[9px] md:text-[10px] font-orbitron text-muted-foreground uppercase">Monthly Revenue</span>
                            </div>
                            <p className="text-xl md:text-2xl font-orbitron font-bold text-emerald-400">${totals.totalMonthlyRevenue.toLocaleString()}</p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground">From reseller clients</p>
                        </div>
                        <div className="bg-card/20 backdrop-blur-xl border border-orange-500/20 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-4 h-4 text-orange-400" />
                                <span className="text-[9px] md:text-[10px] font-orbitron text-muted-foreground uppercase">Pending Payouts</span>
                            </div>
                            <p className="text-xl md:text-2xl font-orbitron font-bold text-orange-400">${totals.totalPendingCommission.toLocaleString()}</p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground">Commission this month</p>
                        </div>
                    </div>

                    {/* Resellers List */}
                    <div className="bg-card/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        {/* List Header */}
                        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-cyan-400" />
                                    <h2 className="font-orbitron text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">Your Resellers</h2>
                                </div>
                                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px] w-fit">
                                    {filteredResellers.length} resellers
                                </Badge>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="p-3 border-b border-white/5 flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search resellers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background/50 border-white/10 focus:border-cyan-500/50"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] bg-background/50 border-white/10">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Resellers Table */}
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredResellers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No resellers found</p>
                                <Button
                                    variant="link"
                                    onClick={() => setShowOnboardModal(true)}
                                    className="text-cyan-400 mt-2"
                                >
                                    Onboard your first reseller
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredResellers.map((reseller) => {
                                    const stats = reseller.stats || { total_clients: 0, active_clients: 0, monthly_revenue: 0, pending_commission: 0 };
                                    return (
                                        <div
                                            key={reseller.id}
                                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                                                selectedReseller?.id === reseller.id ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' : ''
                                            }`}
                                            onClick={() => setSelectedReseller(reseller)}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg font-bold text-cyan-400">
                                                            {reseller.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-medium text-foreground truncate">{reseller.name}</p>
                                                            <Badge className={`font-orbitron text-[8px] flex-shrink-0 ${
                                                                reseller.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                                reseller.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                                'bg-red-500/20 text-red-400 border-red-500/30'
                                                            }`}>
                                                                {reseller.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{reseller.company_name || reseller.email}</p>
                                                    </div>
                                                </div>

                                                {/* Stats - Hidden on mobile, shown on md+ */}
                                                <div className="hidden md:flex items-center gap-6">
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold text-foreground">{stats.active_clients}</p>
                                                        <p className="text-[10px] text-muted-foreground">Clients</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold text-emerald-400">${stats.monthly_revenue.toLocaleString()}</p>
                                                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold text-orange-400">${stats.pending_commission.toLocaleString()}</p>
                                                        <p className="text-[10px] text-muted-foreground">{reseller.commission_rate}% Commission</p>
                                                    </div>
                                                </div>

                                                {/* Mobile Stats */}
                                                <div className="flex md:hidden items-center gap-2">
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-emerald-400">${stats.monthly_revenue.toLocaleString()}</p>
                                                        <p className="text-[9px] text-muted-foreground">{stats.active_clients} clients</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-card border-white/10">
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedReseller(reseller); }}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {reseller.status === 'pending' && (
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleActivateReseller(reseller); }}>
                                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                    Activate
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-400 focus:text-red-400"
                                                                onClick={(e) => { e.stopPropagation(); setResellerToDelete(reseller); setShowDeleteDialog(true); }}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reseller Detail Panel */}
            {selectedReseller && (
                <ResellerDetailPanel
                    reseller={selectedReseller}
                    onClose={() => setSelectedReseller(null)}
                    onUpdate={loadResellers}
                />
            )}

            {/* Onboard Reseller Modal */}
            <Dialog open={showOnboardModal} onOpenChange={setShowOnboardModal}>
                <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-orbitron">Onboard New Reseller</DialogTitle>
                        <DialogDescription>
                            Add a new reseller partner. They will receive an invite to create their account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Smith"
                                    className="bg-background/50 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@agency.com"
                                    className="bg-background/50 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 555-0123"
                                    className="bg-background/50 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    placeholder="Agency Name"
                                    className="bg-background/50 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input
                                    value={formData.website_url}
                                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                    placeholder="https://agency.com"
                                    className="bg-background/50 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Commission Rate (%)</Label>
                                <Input
                                    type="number"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 30 })}
                                    placeholder="30"
                                    className="bg-background/50 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional notes about this reseller..."
                                className="bg-background/50 border-white/10 min-h-[80px]"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="ghost" onClick={() => setShowOnboardModal(false)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateReseller} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/25">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create Reseller
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-card border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reseller</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {resellerToDelete?.name}? This will also remove all their client assignments. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReseller} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ResellerPortal;
