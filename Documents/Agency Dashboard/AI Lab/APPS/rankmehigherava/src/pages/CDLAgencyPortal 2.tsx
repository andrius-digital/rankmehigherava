import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    Truck,
    Users,
    FileText,
    BarChart3,
    Settings,
    ArrowLeft,
    LogOut,
    Building2,
    UserCheck,
    Briefcase,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import HUDOverlay from '@/components/ui/HUDOverlay';
import AvaAvatar from '@/components/agency/AvaAvatar';
import StatusIndicator from '@/components/agency/StatusIndicator';
import MissionClock from '@/components/agency/MissionClock';

const CDLAgencyPortal: React.FC = () => {
    const { signOut } = useAuth();

    const portalCards = [
        {
            id: 'carriers',
            title: 'Carrier Portal',
            icon: Truck,
            description: 'Manage your fleet, drivers, and operations',
            href: '#',
            color: 'blue',
            stats: 'Active Carriers'
        },
        {
            id: 'recruiters',
            title: 'Recruiter Hub',
            icon: UserCheck,
            description: 'Track leads, manage candidates, and placements',
            href: '#',
            color: 'purple',
            stats: 'Active Recruiters'
        },
        {
            id: 'dispatch',
            title: 'Dispatch Center',
            icon: Briefcase,
            description: 'Real-time load management and routing',
            href: '#',
            color: 'orange',
            stats: 'Active Loads'
        },
        {
            id: 'analytics',
            title: 'Analytics Dashboard',
            icon: BarChart3,
            description: 'Performance metrics and insights',
            href: '#',
            color: 'cyan',
            stats: 'Key Metrics'
        },
        {
            id: 'documents',
            title: 'Document Center',
            icon: FileText,
            description: 'Contracts, compliance, and records',
            href: '#',
            color: 'green',
            stats: 'Documents'
        },
        {
            id: 'settings',
            title: 'System Settings',
            icon: Settings,
            description: 'Configure portal preferences',
            href: '#',
            color: 'red',
            stats: 'Settings'
        }
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>CDL Agency Portal | Brokerage Management</title>
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="border-b border-primary/20 bg-card/30 backdrop-blur-xl sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link to="/avaadminpanel">
                                    <Button variant="ghost" size="icon" className="mr-2">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <Building2 className="w-8 h-8 text-blue-400" />
                                <div>
                                    <h1 className="font-orbitron text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                        CDL AGENCY PORTAL
                                    </h1>
                                    <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase">
                                        Brokerage Management System
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-lg bg-card/50 border border-primary/20">
                                    <StatusIndicator status="online" label="Portal Active" />
                                    <div className="w-px h-4 bg-border" />
                                    <MissionClock />
                                </div>
                                <Button variant="ghost" size="icon" onClick={signOut}>
                                    <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card/20 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Truck className="w-12 h-12 text-blue-400" />
                                </div>
                                <p className="text-xs font-orbitron text-muted-foreground mb-1 uppercase tracking-tighter">Active Carriers</p>
                                <h3 className="text-3xl font-bold font-orbitron text-foreground">24</h3>
                                <div className="mt-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-orbitron">+3 This Month</span>
                                </div>
                            </div>

                            <div className="bg-card/20 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users className="w-12 h-12 text-purple-400" />
                                </div>
                                <p className="text-xs font-orbitron text-muted-foreground mb-1 uppercase tracking-tighter">Active Recruiters</p>
                                <h3 className="text-3xl font-bold font-orbitron text-foreground">12</h3>
                                <div className="mt-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-orbitron">+2 This Month</span>
                                </div>
                            </div>

                            <div className="bg-card/20 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Briefcase className="w-12 h-12 text-orange-400" />
                                </div>
                                <p className="text-xs font-orbitron text-muted-foreground mb-1 uppercase tracking-tighter">Active Loads</p>
                                <h3 className="text-3xl font-bold font-orbitron text-foreground">156</h3>
                                <div className="mt-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-orbitron">+18 Today</span>
                                </div>
                            </div>
                        </div>

                        {/* Portal Cards Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="font-orbitron text-2xl font-bold text-foreground">Portal Modules</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {portalCards.map((card) => {
                                    const Icon = card.icon;
                                    const colorClasses = {
                                        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
                                        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
                                        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
                                        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
                                        green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
                                        red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
                                    };
                                    return (
                                        <Link
                                            key={card.id}
                                            to={card.href}
                                            className="group relative bg-card/20 backdrop-blur-md border border-primary/10 rounded-2xl p-6 hover:border-primary/40 transition-all hover:translate-y-[-4px] overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                                            <div className="relative z-10 space-y-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[card.color as keyof typeof colorClasses]} border flex items-center justify-center`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">{card.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{card.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary text-sm font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Access Module <ArrowLeft className="w-4 h-4 rotate-180" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CDLAgencyPortal;

