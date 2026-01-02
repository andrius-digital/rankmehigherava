import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Brain,
    Globe,
    Search,
    Phone,
    DollarSign,
    ArrowRight,
    LogOut,
    GraduationCap,
    Sparkles,
    Users,
    Music,
    UsersRound,
    Palette,
    Building2,
    Mic,
    CreditCard,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import HUDOverlay from '@/components/ui/HUDOverlay';
import AvaAvatar from '@/components/agency/AvaAvatar';
import StatusIndicator from '@/components/agency/StatusIndicator';
import MissionClock from '@/components/agency/MissionClock';

const AgencyDashboard: React.FC = () => {
    const { signOut } = useAuth();

    // Agency Cards
    const agencyCards = [
        {
            id: 'ava-voice-calls',
            title: 'AVA Voice Calls',
            icon: Mic,
            description: 'Voice chat analytics & lead tracking',
            href: '/ava-voice-calls',
            color: 'cyan'
        }
    ];

    // AI Lab Cards
    const aiLabCards = [
        {
            id: 'ava-training',
            title: 'AVA Training',
            icon: GraduationCap,
            description: 'Train and configure AVA AI assistant',
            href: '/ava-training',
            color: 'purple'
        },
        {
            id: 'ava-rank-me-higher',
            title: 'AVA SEO',
            icon: Brain,
            description: 'AI SEO Tool developed by Rank Me Higher. Rank on autopilot with zero effort.',
            href: '/avaseo',
            color: 'cyan'
        },
        {
            id: 'cdl-agency-onboard',
            title: 'CDL Agency Onboard',
            icon: Users,
            description: 'AI Powered Driver Brokerage Software for Carriers & Recruiters',
            href: '/cdl-agency-portal',
            color: 'blue'
        },
        {
            id: 'drum-kit-bazaar',
            title: 'Drum Kit Bazaar',
            icon: Music,
            description: 'Automated Sample Pack AI Tool',
            href: '#',
            color: 'orange'
        }
    ];

    // Website Cards
    const websiteCards = [
        {
            id: 'client-portal',
            title: 'Agency Client Portal',
            icon: UsersRound,
            description: 'Profile Setup & Data Submission',
            href: '/client-portal',
            color: 'green'
        },
        {
            id: 'build-website',
            title: 'Build New Website',
            icon: Palette,
            description: 'AI Design & Deployment',
            href: '/website-prompting',
            color: 'green'
        }
    ];

    // Accounting Cards
    const accountingCards = [
        {
            id: 'subscriptions',
            title: 'Subscriptions',
            icon: CreditCard,
            description: 'Manage recurring subscriptions',
            href: '/subscriptions',
            color: 'emerald'
        },
        {
            id: 'team-tracker',
            title: 'Team Tracker',
            icon: Clock,
            description: 'Payroll & time tracking',
            href: '/team-tracker',
            color: 'emerald'
        }
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>AVA Admin Panel | Rank Me Higher</title>
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="border-b border-primary/20 bg-card/30 backdrop-blur-xl sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <AvaAvatar />
                                <div>
                                    <h1 className="font-orbitron text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                        AVA ADMIN PANEL
                                    </h1>
                                    <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase">
                                        AI Marketing System by Rank Me Higher
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-lg bg-card/50 border border-primary/20">
                                    <StatusIndicator status="online" label="Agency Node" />
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
                    <div className="max-w-7xl mx-auto space-y-12">
                        {/* Agency Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h2 className="font-orbitron text-2xl font-bold text-foreground">Agency</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {agencyCards.map((card) => {
                                    const Icon = card.icon;
                                    const colorClasses = {
                                        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
                                        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
                                        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
                                        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
                                        green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400'
                                    };
                                    return (
                                        <Link
                                            key={card.id}
                                            to={card.href}
                                            className="group relative bg-card/20 backdrop-blur-md border border-cyan-500/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-all hover:translate-y-[-4px] overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
                                            <div className="relative z-10 space-y-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[card.color as keyof typeof colorClasses]} border flex items-center justify-center`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">{card.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{card.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-cyan-400 text-sm font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Open <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        {/* AI Lab Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="font-orbitron text-2xl font-bold text-foreground">AI Lab</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {aiLabCards.map((card) => {
                                    const Icon = card.icon;
                                    const colorClasses = {
                                        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
                                        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
                                        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
                                        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
                                        green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400'
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
                                                    Open <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Websites Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-green-400" />
                                </div>
                                <h2 className="font-orbitron text-2xl font-bold text-foreground">Websites</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                {websiteCards.map((card) => {
                                    const Icon = card.icon;
                                    const colorClasses = {
                                        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
                                        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
                                        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
                                        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
                                        green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400'
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
                                                    Open <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        {/* SEO Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                    <Search className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="font-orbitron text-2xl font-bold text-foreground">SEO</h2>
                            </div>
                            <div className="bg-card/10 backdrop-blur-md border border-primary/10 rounded-2xl p-8 text-center">
                                <p className="text-muted-foreground">SEO cards coming soon...</p>
                            </div>
                        </section>

                        {/* Call Center Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-orange-400" />
                                </div>
                                <h2 className="font-orbitron text-2xl font-bold text-foreground">Call Center</h2>
                            </div>
                            <div className="bg-card/10 backdrop-blur-md border border-primary/10 rounded-2xl p-8 text-center">
                                <p className="text-muted-foreground">Call Center cards coming soon...</p>
                            </div>
                        </section>

                        {/* Accounting Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="font-orbitron text-2xl font-bold text-foreground">Accounting</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                {accountingCards.map((card) => {
                                    const Icon = card.icon;
                                    const colorClasses = {
                                        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
                                        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
                                        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
                                        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
                                        green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
                                        emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400'
                                    };
                                    return (
                                        <Link
                                            key={card.id}
                                            to={card.href}
                                            className="group relative bg-card/20 backdrop-blur-md border border-primary/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-all hover:translate-y-[-4px] overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                                            <div className="relative z-10 space-y-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[card.color as keyof typeof colorClasses]} border flex items-center justify-center`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">{card.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{card.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Open <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AgencyDashboard;
