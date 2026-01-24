import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Briefcase,
    Users,
    DollarSign,
    BarChart3,
    TrendingUp,
    Globe,
    Plus,
    Settings,
    CreditCard,
    Clock,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HUDOverlay from '@/components/ui/HUDOverlay';
import PortalSwitcher from '@/components/PortalSwitcher';
import { PopupSection } from '@/components/ui/popup-section';

// Mock data for demo
const mockResellerData = {
    name: 'White Label Agency',
    totalClients: 12,
    activeClients: 10,
    pendingClients: 2,
    monthlyRevenue: 3500,
    commission: 30,
    clients: [
        { id: 1, name: 'Client A', website: 'clienta.com', plan: 'Professional', status: 'active', monthlyValue: 299 },
        { id: 2, name: 'Client B', website: 'clientb.com', plan: 'Basic', status: 'active', monthlyValue: 149 },
        { id: 3, name: 'Client C', website: 'clientc.com', plan: 'Professional', status: 'active', monthlyValue: 299 },
        { id: 4, name: 'Client D', website: 'clientd.com', plan: 'Enterprise', status: 'pending', monthlyValue: 499 },
        { id: 5, name: 'Client E', website: 'cliente.com', plan: 'Basic', status: 'active', monthlyValue: 149 },
    ],
    recentPayouts: [
        { date: '2026-01-15', amount: 1050, status: 'completed' },
        { date: '2025-12-15', amount: 980, status: 'completed' },
        { date: '2025-11-15', amount: 890, status: 'completed' },
    ]
};

const ResellerPortal: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClients = mockResellerData.clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.website.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Reseller Portal | Rank Me Higher</title>
                <meta name="description" content="Manage your white-label clients and track commissions." />
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                <span className="font-orbitron text-[10px] tracking-[0.2em] text-purple-400 uppercase">Reseller Account</span>
                            </div>
                            <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-white via-purple-400 to-pink-500 bg-clip-text text-transparent mb-3">
                                RESELLER PORTAL
                            </h1>
                            <PortalSwitcher />
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                            <Button
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all font-orbitron text-[8px] uppercase tracking-widest text-white font-bold"
                            >
                                <Plus className="w-3 h-3" />
                                Add Client
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1.5 font-orbitron text-[8px] uppercase tracking-widest text-muted-foreground"
                            >
                                <Settings className="w-3 h-3" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-card/20 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="text-[10px] font-orbitron text-muted-foreground uppercase">Total Clients</span>
                        </div>
                        <p className="text-2xl font-orbitron font-bold text-purple-400">{mockResellerData.totalClients}</p>
                        <p className="text-[10px] text-muted-foreground">{mockResellerData.activeClients} active, {mockResellerData.pendingClients} pending</p>
                    </div>
                    <div className="bg-card/20 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-orbitron text-muted-foreground uppercase">Monthly Revenue</span>
                        </div>
                        <p className="text-2xl font-orbitron font-bold text-emerald-400">${mockResellerData.monthlyRevenue}</p>
                        <p className="text-[10px] text-muted-foreground">From all clients</p>
                    </div>
                    <div className="bg-card/20 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-orbitron text-muted-foreground uppercase">Commission Rate</span>
                        </div>
                        <p className="text-2xl font-orbitron font-bold text-cyan-400">{mockResellerData.commission}%</p>
                        <p className="text-[10px] text-muted-foreground">Of client payments</p>
                    </div>
                    <div className="bg-card/20 backdrop-blur-xl border border-orange-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-orange-400" />
                            <span className="text-[10px] font-orbitron text-muted-foreground uppercase">Est. Payout</span>
                        </div>
                        <p className="text-2xl font-orbitron font-bold text-orange-400">${Math.round(mockResellerData.monthlyRevenue * (mockResellerData.commission / 100))}</p>
                        <p className="text-[10px] text-muted-foreground">This month</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Clients List */}
                    <div className="lg:col-span-2 bg-card/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    <h2 className="font-orbitron text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">Your Clients</h2>
                                </div>
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[8px]">
                                    {mockResellerData.clients.length} clients
                                </Badge>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-3 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background/50 border-white/10 focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* Clients Table */}
                        <div className="divide-y divide-white/5">
                            {filteredClients.map((client) => (
                                <div key={client.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                                <Globe className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{client.name}</p>
                                                <p className="text-xs text-muted-foreground">{client.website}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <Badge className={`font-orbitron text-[8px] ${
                                                    client.status === 'active'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                }`}>
                                                    {client.status}
                                                </Badge>
                                                <p className="text-sm font-orbitron font-bold text-foreground mt-1">${client.monthlyValue}/mo</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Recent Payouts */}
                        <div className="bg-card/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-emerald-400" />
                                    <h3 className="font-orbitron text-xs font-bold text-foreground uppercase tracking-wider">Recent Payouts</h3>
                                </div>
                            </div>
                            <div className="p-3 space-y-2">
                                {mockResellerData.recentPayouts.map((payout, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-emerald-500/20">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">${payout.amount}</p>
                                            <p className="text-[10px] text-muted-foreground">{payout.date}</p>
                                        </div>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[8px]">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {payout.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-card/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-purple-400" />
                                    <h3 className="font-orbitron text-xs font-bold text-foreground uppercase tracking-wider">Quick Actions</h3>
                                </div>
                            </div>
                            <div className="p-3 space-y-2">
                                <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground">
                                    <Plus className="w-4 h-4 mr-2 text-purple-400" />
                                    Add New Client
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground">
                                    <BarChart3 className="w-4 h-4 mr-2 text-cyan-400" />
                                    View Reports
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground">
                                    <Settings className="w-4 h-4 mr-2 text-orange-400" />
                                    Account Settings
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground">
                                    <Mail className="w-4 h-4 mr-2 text-emerald-400" />
                                    Contact Support
                                </Button>
                            </div>
                        </div>

                        {/* Commission Info */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                <h3 className="font-orbitron text-xs font-bold text-purple-400 uppercase tracking-wider">Your Commission</h3>
                            </div>
                            <p className="text-3xl font-orbitron font-bold text-foreground mb-1">{mockResellerData.commission}%</p>
                            <p className="text-sm text-muted-foreground">on all client payments</p>
                            <div className="mt-3 pt-3 border-t border-purple-500/20">
                                <p className="text-[10px] text-muted-foreground">Next payout on the 15th</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResellerPortal;
