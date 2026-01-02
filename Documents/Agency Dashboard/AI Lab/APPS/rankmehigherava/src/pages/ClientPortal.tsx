import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Building2,
    Globe,
    Phone,
    Mail,
    MapPin,
    Clock,
    Camera,
    Palette,
    Send,
    ArrowLeft,
    Layout,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ClientPortal: React.FC = () => {
    // Fetch clients with active websites
    const { data: activeWebsites = [], isLoading: isLoadingWebsites } = useQuery({
        queryKey: ['active-websites'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('id, name, company_name, website_url')
                .not('website_url', 'is', null)
                .order('name');
            if (error) throw error;
            return data.filter(client => client.website_url && client.website_url.trim() !== '');
        },
    });

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Agency Client Portal | Business Setup</title>
                <meta name="description" content="Configure your business profile for your AI-powered website." />
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-orbitron text-[10px] tracking-[0.2em] text-emerald-400 uppercase">System Active</span>
                        </div>
                        <h1 className="font-orbitron text-4xl font-bold bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            WELCOME, OFF TINT
                        </h1>
                        <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase mt-2">Spacecraft ID: #OT-2025-001</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-card/30 backdrop-blur-xl border border-primary/10 rounded-xl px-4 py-2 text-right">
                            <p className="text-[9px] font-orbitron text-muted-foreground uppercase">Service Level</p>
                            <p className="font-orbitron text-sm text-primary font-bold">ENTERPRISE AI</p>
                        </div>
                        <Link to="/avaadminpanel" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-orbitron text-[10px] uppercase tracking-widest text-muted-foreground">
                            AVA Admin Panel <Layout className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column - Progress & Status */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-card/20 backdrop-blur-3xl border border-primary/20 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                            <h2 className="font-orbitron text-sm font-bold tracking-widest text-foreground mb-6 uppercase">MISSION PROGRESS</h2>

                            <div className="space-y-6">
                                {[
                                    { label: 'Profile Setup', status: 'Completed', color: 'text-emerald-400', progress: 100 },
                                    { label: 'AI Strategy', status: 'In Progress', color: 'text-cyan-400', progress: 65 },
                                    { label: 'Website Build', status: 'Pending', color: 'text-muted-foreground', progress: 0 },
                                    { label: 'SEO Launch', status: 'Pending', color: 'text-muted-foreground', progress: 0 }
                                ].map((step, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-orbitron uppercase">
                                            <span className="text-muted-foreground">{step.label}</span>
                                            <span className={step.color}>{step.status}</span>
                                        </div>
                                        <div className="h-1 bg-secondary/30 rounded-full overflow-hidden">
                                            <div className={`h-full bg-primary transition-all duration-1000`} style={{ width: `${step.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/20 to-blue-600/10 backdrop-blur-3xl border border-primary/20 rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-orbitron text-muted-foreground uppercase">Support</p>
                                    <p className="text-xs font-bold text-foreground">Dedicated Commander</p>
                                </div>
                            </div>
                            <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-orbitron uppercase tracking-[0.2em] h-10">
                                CONTACT AVA
                            </Button>
                        </div>

                        {/* Active Websites Section */}
                        <div className="bg-card/20 backdrop-blur-3xl border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-green-400" />
                                    </div>
                                    <h2 className="font-orbitron text-sm font-bold tracking-widest text-foreground uppercase">Active Websites</h2>
                                </div>
                                
                                {isLoadingWebsites ? (
                                    <div className="text-xs text-muted-foreground font-orbitron">Loading websites...</div>
                                ) : activeWebsites.length === 0 ? (
                                    <div className="text-xs text-muted-foreground font-orbitron">No active websites found</div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {activeWebsites.map((client) => (
                                            <Link
                                                key={client.id}
                                                to={`/agency/client/${client.id}`}
                                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground font-orbitron truncate">
                                                        {client.company_name || client.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground truncate mt-1">
                                                        {client.website_url}
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Setup Form */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="bg-card/30 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <h2 className="font-orbitron text-sm font-bold tracking-wider text-primary uppercase">Business Configuration</h2>
                                </div>
                                <Badge variant="outline" className="border-primary/20 text-primary font-orbitron text-[9px] uppercase">Client Edit Mode</Badge>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Company Name</Label>
                                        <Input defaultValue="Off Tint" className="bg-secondary/20 border-primary/10 h-12 text-foreground font-orbitron" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Primary Contact</Label>
                                        <Input defaultValue="(555) 000-0000" className="bg-secondary/20 border-primary/10 h-12 text-foreground font-orbitron" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Mission Narrative (Description)</Label>
                                    <Textarea defaultValue="Automotive tinting and styling experts based in Chicago." className="bg-secondary/20 border-primary/10 min-h-[100px] text-foreground font-orbitron text-sm resize-none" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Brand Mark</Label>
                                        <div className="aspect-video rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center bg-secondary/10 hover:border-primary/40 transition-all cursor-pointer group">
                                            <Camera className="w-8 h-8 text-primary/20 group-hover:text-primary/60 mb-2 transition-colors" />
                                            <span className="text-[10px] font-orbitron text-muted-foreground uppercase">Upload Logo File</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Brand Palette</Label>
                                        <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/10 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary shadow-lg shadow-primary/20" />
                                                <Input defaultValue="#E31837" className="bg-transparent border-primary/10 h-10 font-mono text-xs" />
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['#000', '#222', '#444', '#fff'].map(c => (
                                                    <div key={c} className="h-6 rounded-md border border-white/10" style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-primary/10 flex justify-end">
                                    <Button className="bg-gradient-to-r from-primary to-blue-600 font-orbitron font-bold tracking-[0.2em] px-10 h-12 rounded-xl hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                                        SAVE CHANGES
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientPortal;
