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
    Users,
    Music,
    UsersRound,
    Palette,
    Building2,
    Mic,
    CreditCard,
    Clock,
    ChevronRight,
    Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import HUDOverlay from '@/components/ui/HUDOverlay';
import AvaAvatar from '@/components/agency/AvaAvatar';
import StatusIndicator from '@/components/agency/StatusIndicator';
import MissionClock from '@/components/agency/MissionClock';
import { useIsMobile } from '@/hooks/use-mobile';

// Color classes for card styling
const colorClasses = {
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400'
};

interface CardItem {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    href: string;
    color: keyof typeof colorClasses;
}

const AgencyDashboard: React.FC = () => {
    const { signOut } = useAuth();
    const isMobile = useIsMobile();

    // All cards organized by section
    const sections = [
        {
            id: 'agency',
            title: 'Agency',
            icon: Building2,
            color: 'cyan' as const,
            cards: [
                {
                    id: 'ava-voice-calls',
                    title: 'AVA Voice Calls',
                    icon: Mic,
                    description: 'Voice chat analytics',
                    href: '/ava-voice-calls',
                    color: 'cyan' as const
                },
                {
                    id: 'task-flow',
                    title: 'Task Flow',
                    icon: Layers,
                    description: 'Project management',
                    href: '/task-flow',
                    color: 'cyan' as const
                }
            ]
        },
        {
            id: 'ai-lab',
            title: 'AI Lab',
            icon: Brain,
            color: 'purple' as const,
            cards: [
                {
                    id: 'ava-training',
                    title: 'AVA Training',
                    icon: GraduationCap,
                    description: 'Train AVA AI',
                    href: '/ava-training',
                    color: 'purple' as const
                },
                {
                    id: 'ava-seo',
                    title: 'AVA SEO',
                    icon: Brain,
                    description: 'AI SEO autopilot',
                    href: '/avaseo',
                    color: 'cyan' as const
                },
                {
                    id: 'cdl-agency',
                    title: 'CDL Agency',
                    icon: Users,
                    description: 'Driver brokerage',
                    href: '/cdl-agency-portal',
                    color: 'blue' as const
                },
                {
                    id: 'drum-kit',
                    title: 'Drum Kit Bazaar',
                    icon: Music,
                    description: 'Sample packs AI',
                    href: '#',
                    color: 'orange' as const
                }
            ]
        },
        {
            id: 'websites',
            title: 'Websites',
            icon: Globe,
            color: 'green' as const,
            cards: [
                {
                    id: 'client-portal',
                    title: 'Client Portal',
                    icon: UsersRound,
                    description: 'Manage clients',
                    href: '/client-portal',
                    color: 'green' as const
                },
                {
                    id: 'build-website',
                    title: 'Build Website',
                    icon: Palette,
                    description: 'AI design',
                    href: '/website-prompting',
                    color: 'green' as const
                }
            ]
        },
        {
            id: 'accounting',
            title: 'Accounting',
            icon: DollarSign,
            color: 'emerald' as const,
            cards: [
                {
                    id: 'subscriptions',
                    title: 'Subscriptions',
                    icon: CreditCard,
                    description: 'Manage billing',
                    href: '/subscriptions',
                    color: 'emerald' as const
                },
                {
                    id: 'team-tracker',
                    title: 'Team Tracker',
                    icon: Clock,
                    description: 'Payroll & time',
                    href: '/team-tracker',
                    color: 'emerald' as const
                }
            ]
        }
    ];

    // Mobile ultra-compact card
    const MobileCard = ({ card }: { card: CardItem }) => {
        const Icon = card.icon;
        return (
            <Link
                to={card.href}
                className="flex items-center gap-2 py-2 px-2.5 bg-card/20 border border-white/5 rounded-lg active:scale-[0.97] active:bg-card/40 transition-all"
            >
                <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${colorClasses[card.color]} border flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs text-foreground truncate">{card.title}</h3>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
            </Link>
        );
    };

    // Desktop card
    const DesktopCard = ({ card }: { card: CardItem }) => {
        const Icon = card.icon;
        return (
            <Link
                to={card.href}
                className="group relative bg-card/20 backdrop-blur-md border border-primary/10 rounded-2xl p-6 hover:border-primary/40 transition-all hover:translate-y-[-4px] overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10 space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[card.color]} border flex items-center justify-center`}>
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
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>AVA Admin Panel | Rank Me Higher</title>
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header - Ultra compact on mobile */}
                <header className={`border-b border-primary/20 bg-card/30 backdrop-blur-xl sticky top-0 z-20 ${isMobile ? 'py-2' : 'py-4'}`}>
                    <div className={`container mx-auto ${isMobile ? 'px-2.5' : 'px-4'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AvaAvatar size={isMobile ? 'sm' as const : 'md' as const} />
                                <h1 className={`font-orbitron font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent ${isMobile ? 'text-base' : 'text-2xl'}`}>
                                    {isMobile ? 'AVA' : 'AVA ADMIN PANEL'}
                                </h1>
                                {!isMobile && (
                                    <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase ml-2">
                                        AI Marketing System
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                {!isMobile && (
                                    <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-card/50 border border-primary/20">
                                        <StatusIndicator status="online" label="Agency Node" />
                                        <div className="w-px h-4 bg-border" />
                                        <MissionClock />
                                    </div>
                                )}
                                {isMobile && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-card/30 border border-primary/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[9px] text-muted-foreground font-orbitron">ONLINE</span>
                                    </div>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={signOut}
                                    className={isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'}
                                >
                                    <LogOut className={`text-muted-foreground hover:text-destructive ${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={`flex-1 container mx-auto ${isMobile ? 'px-2.5 py-3' : 'px-4 py-8'}`}>
                    <div className={`max-w-7xl mx-auto ${isMobile ? 'space-y-3' : 'space-y-12'}`}>
                        
                        {/* Mobile: Ultra-compact sections */}
                        {isMobile ? (
                            <>
                                {sections.map((section) => {
                                    const SectionIcon = section.icon;
                                    return (
                                        <section key={section.id}>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <div className={`w-5 h-5 rounded bg-gradient-to-br ${colorClasses[section.color]} border flex items-center justify-center`}>
                                                    <SectionIcon className="w-3 h-3" />
                                                </div>
                                                <h2 className="font-orbitron text-xs font-bold text-foreground uppercase tracking-wide">{section.title}</h2>
                                            </div>
                                            <div className="space-y-1">
                                                {section.cards.map((card) => (
                                                    <MobileCard key={card.id} card={card} />
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })}

                                {/* Coming Soon sections - minimal on mobile */}
                                <div className="flex gap-2 pt-2">
                                    <div className="flex items-center gap-1 px-2 py-1 bg-card/10 rounded-md border border-white/5">
                                        <Search className="w-3 h-3 text-blue-400" />
                                        <span className="text-[10px] text-muted-foreground">SEO</span>
                                        <span className="text-[8px] bg-muted/50 px-1 rounded text-muted-foreground/70">Soon</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-card/10 rounded-md border border-white/5">
                                        <Phone className="w-3 h-3 text-orange-400" />
                                        <span className="text-[10px] text-muted-foreground">Call Center</span>
                                        <span className="text-[8px] bg-muted/50 px-1 rounded text-muted-foreground/70">Soon</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Desktop: Full sections */}
                                {sections.map((section) => {
                                    const SectionIcon = section.icon;
                                    return (
                                        <section key={section.id} className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[section.color]} border flex items-center justify-center`}>
                                                    <SectionIcon className="w-5 h-5" />
                                                </div>
                                                <h2 className="font-orbitron text-2xl font-bold text-foreground">{section.title}</h2>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {section.cards.map((card) => (
                                                    <DesktopCard key={card.id} card={card} />
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })}

                                {/* SEO Section - Coming Soon */}
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

                                {/* Call Center Section - Coming Soon */}
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
                            </>
                        )}
                    </div>
                </main>

            </div>
        </div>
    );
};

export default AgencyDashboard;
