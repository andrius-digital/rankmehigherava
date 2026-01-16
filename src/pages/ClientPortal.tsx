import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Building2,
    Globe,
    Phone,
    Mail,
    MapPin,
    Clock,
    UserPlus,
    Layout,
    ArrowRight,
    Users,
    Zap,
    Shield,
    TrendingUp,
    Car,
    Sparkles,
    Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Featured client - Off Tint
const offTintClient = {
    id: 'off-tint-featured',
    name: 'Off Tint',
    company_name: 'Off Tint',
    website_url: 'https://off-tint.com',
    email: 'info@off-tint.com',
    phone: '(312) 555-TINT',
    location: 'Chicago, IL',
    industry: 'Automotive Services',
    services: ['Window Tinting', 'Ceramic Coating', 'PPF Installation', 'Interior Detailing'],
    metrics: {
        seoScore: 94,
        monthlyVisitors: '12.4K',
        conversionRate: '8.2%',
        googleRanking: '#1'
    }
};

const ClientPortal: React.FC = () => {
    // Fetch all clients from database
    const { data: dbClients = [], isLoading } = useQuery({
        queryKey: ['all-clients'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('id, name, company_name, website_url, email, phone, created_at')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    // Combine featured client with database clients
    const allClients = [offTintClient, ...dbClients.filter(c => c.company_name !== 'Off Tint')];
    const totalClients = allClients.length;
    const withWebsites = allClients.filter(c => c.website_url).length;
    const pendingSetup = allClients.filter(c => !c.website_url).length;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Agency Client Portal | Rank Me Higher</title>
                <meta name="description" content="Manage your agency clients and their websites." />
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="font-orbitron text-[10px] tracking-[0.2em] text-cyan-400 uppercase">System Active</span>
                        </div>
                        <h1 className="font-orbitron text-4xl font-bold bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            CLIENT PORTAL
                        </h1>
                        <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase mt-2">
                            Manage Your Agency Clients
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link 
                            to="/website-submissions" 
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all font-orbitron text-[10px] uppercase tracking-widest text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105"
                        >
                            <UserPlus className="w-4 h-4" />
                            Onboard New Client
                        </Link>
                        <Link 
                            to="/avaadminpanel" 
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-orbitron text-[10px] uppercase tracking-widest text-muted-foreground"
                        >
                            AVA Admin Panel <Layout className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card/20 backdrop-blur-xl border border-primary/20 rounded-2xl p-4">
                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase">Total Clients</p>
                        <p className="font-orbitron text-2xl font-bold text-foreground">{totalClients}</p>
                    </div>
                    <div className="bg-card/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">
                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase">With Websites</p>
                        <p className="font-orbitron text-2xl font-bold text-cyan-400">{withWebsites}</p>
                    </div>
                    <div className="bg-card/20 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-4">
                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase">Pending Setup</p>
                        <p className="font-orbitron text-2xl font-bold text-yellow-400">{pendingSetup}</p>
                    </div>
                    <div className="bg-card/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">
                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase">This Month</p>
                        <p className="font-orbitron text-2xl font-bold text-cyan-400">1</p>
                    </div>
                </div>

                {/* Client Cards Grid */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                            <Users className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h2 className="font-orbitron text-xl font-bold text-foreground">All Clients</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="font-orbitron text-muted-foreground text-sm">Loading clients...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* OFF TINT - Featured Futuristic Card */}
                            <Link
                                to="/agency/client/off-tint"
                                className="group relative lg:col-span-2 bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20"
                            >
                                {/* Animated Background Effects */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5" />
                                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
                                
                                {/* Scan Line Effect */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent group-hover:animate-pulse" />
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent group-hover:animate-pulse" />
                                </div>

                                <div className="relative z-10 p-8">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Left Side - Main Info */}
                                        <div className="flex-1 space-y-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                                            <Car className="w-8 h-8 text-white" />
                                                        </div>
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[9px] px-2">
                                                                <Sparkles className="w-3 h-3 mr-1" />
                                                                FEATURED
                                                            </Badge>
                                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-orbitron text-[9px]">
                                                                LIVE
                                                            </Badge>
                                                        </div>
                                                        <h3 className="font-orbitron font-bold text-2xl md:text-3xl text-foreground tracking-wide">
                                                            OFF TINT
                                                        </h3>
                                                        <p className="text-sm text-cyan-400/80 font-orbitron">{offTintClient.industry}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Services Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {offTintClient.services.map((service, i) => (
                                                    <span 
                                                        key={i}
                                                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider"
                                                    >
                                                        {service}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Contact Info */}
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Globe className="w-4 h-4 text-cyan-400" />
                                                    <span className="truncate">{offTintClient.website_url}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                                    <span>{offTintClient.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="w-4 h-4 text-cyan-400" />
                                                    <span className="truncate">{offTintClient.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Phone className="w-4 h-4 text-cyan-400" />
                                                    <span>{offTintClient.phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side - Metrics Dashboard */}
                                        <div className="md:w-72 space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center group-hover:border-cyan-500/30 transition-colors">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <Shield className="w-4 h-4 text-cyan-400" />
                                                    </div>
                                                    <p className="font-orbitron text-2xl font-bold text-cyan-400">{offTintClient.metrics.seoScore}</p>
                                                    <p className="text-[9px] font-orbitron text-muted-foreground uppercase">SEO Score</p>
                                                </div>
                                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center group-hover:border-cyan-500/30 transition-colors">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <Activity className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <p className="font-orbitron text-2xl font-bold text-emerald-400">{offTintClient.metrics.monthlyVisitors}</p>
                                                    <p className="text-[9px] font-orbitron text-muted-foreground uppercase">Monthly Visits</p>
                                                </div>
                                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center group-hover:border-cyan-500/30 transition-colors">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <TrendingUp className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                    <p className="font-orbitron text-2xl font-bold text-purple-400">{offTintClient.metrics.conversionRate}</p>
                                                    <p className="text-[9px] font-orbitron text-muted-foreground uppercase">Conversion</p>
                                                </div>
                                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center group-hover:border-cyan-500/30 transition-colors">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <Zap className="w-4 h-4 text-yellow-400" />
                                                    </div>
                                                    <p className="font-orbitron text-2xl font-bold text-yellow-400">{offTintClient.metrics.googleRanking}</p>
                                                    <p className="text-[9px] font-orbitron text-muted-foreground uppercase">Google Rank</p>
                                                </div>
                                            </div>

                                            {/* View Profile Button */}
                                            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 font-orbitron text-sm font-bold group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all">
                                                <span>ACCESS MISSION CONTROL</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Other Clients from Database */}
                            {dbClients.filter(c => c.company_name !== 'Off Tint').map((client) => (
                                <Link
                                    key={client.id}
                                    to={`/agency/client/${client.id}`}
                                    className="group relative bg-card/20 backdrop-blur-md border border-primary/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-all hover:translate-y-[-4px] overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
                                    
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            {client.website_url ? (
                                                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[9px]">
                                                    ACTIVE
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-orbitron text-[9px]">
                                                    PENDING
                                                </Badge>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-orbitron font-bold text-lg text-foreground mb-1 truncate">
                                                {client.company_name || client.name}
                                            </h3>
                                            {client.website_url ? (
                                                <p className="text-xs text-cyan-400 truncate flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    {client.website_url}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">No website configured</p>
                                            )}
                                        </div>

                                        <div className="space-y-1 pt-2 border-t border-primary/10">
                                            {client.email && (
                                                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-2">
                                                    <Mail className="w-3 h-3" />
                                                    {client.email}
                                                </p>
                                            )}
                                            {client.phone && (
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                                    <Phone className="w-3 h-3" />
                                                    {client.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-cyan-400 text-sm font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                                            View Profile <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* Add New Client Card */}
                            <Link
                                to="/website-submissions"
                                className="group relative bg-card/10 backdrop-blur-md border-2 border-dashed border-primary/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all hover:bg-card/20 flex flex-col items-center justify-center min-h-[250px]"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                                    <UserPlus className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h3 className="font-orbitron font-bold text-foreground mb-1">Add New Client</h3>
                                <p className="text-xs text-muted-foreground">Onboard a new client</p>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientPortal;
