import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Building2,
    Globe,
    Phone,
    Mail,
    MapPin,
    ArrowLeft,
    ExternalLink,
    Calendar,
    Clock,
    Activity,
    FileText,
    Settings,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HUDOverlay from '@/components/ui/HUDOverlay';

const IndividualClientProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Fetch client data
    const { data: client, isLoading, error } = useQuery({
        queryKey: ['client', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-orbitron text-muted-foreground">Loading client data...</p>
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="font-orbitron text-destructive mb-4">Client not found</p>
                    <Link to="/client-portal" className="text-primary hover:underline font-orbitron text-sm">
                        ← Back to Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>{client.company_name || client.name} | Client Profile</title>
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Button */}
                <Link 
                    to="/client-portal" 
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-orbitron text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portal
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-orbitron text-[10px] tracking-[0.2em] text-emerald-400 uppercase">Active Client</span>
                        </div>
                        <h1 className="font-orbitron text-4xl font-bold bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            {client.company_name || client.name}
                        </h1>
                        <p className="text-xs text-muted-foreground font-orbitron tracking-widest uppercase mt-2">
                            Client ID: #{client.id?.slice(0, 8).toUpperCase()}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {client.website_url && (
                            <a
                                href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all font-orbitron text-sm"
                            >
                                <Globe className="w-4 h-4 text-primary" />
                                Visit Website
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column - Quick Info */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Contact Info Card */}
                        <div className="bg-card/20 backdrop-blur-3xl border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <h2 className="font-orbitron text-sm font-bold tracking-widest text-foreground mb-6 uppercase">Contact Info</h2>
                                
                                <div className="space-y-4">
                                    {client.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Phone className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-orbitron uppercase">Phone</p>
                                                <a href={`tel:${client.phone}`} className="text-sm text-foreground hover:text-primary transition-colors">
                                                    {client.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {client.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-orbitron uppercase">Email</p>
                                                <a href={`mailto:${client.email}`} className="text-sm text-foreground hover:text-primary transition-colors truncate block max-w-[200px]">
                                                    {client.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {client.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-orbitron uppercase">Address</p>
                                                <p className="text-sm text-foreground">{client.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-3xl border border-emerald-500/20 rounded-3xl p-6">
                            <h2 className="font-orbitron text-sm font-bold tracking-widest text-foreground mb-4 uppercase">Status</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-orbitron">Website</span>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-orbitron text-[10px]">
                                        {client.website_url ? 'ACTIVE' : 'PENDING'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-orbitron">SEO</span>
                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[10px]">
                                        MONITORING
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-orbitron">AVA</span>
                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[10px]">
                                        INTEGRATED
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Business Details Card */}
                        <div className="bg-card/30 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <h2 className="font-orbitron text-sm font-bold tracking-wider text-primary uppercase">Business Details</h2>
                                </div>
                                <Button variant="outline" size="sm" className="font-orbitron text-[10px]">
                                    <Settings className="w-3 h-3 mr-2" />
                                    Edit
                                </Button>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Company Name</p>
                                        <p className="text-foreground font-medium">{client.company_name || 'Not set'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Primary Contact</p>
                                        <p className="text-foreground font-medium">{client.name || 'Not set'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Industry</p>
                                        <p className="text-foreground font-medium">{client.industry || 'Not specified'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest">Website URL</p>
                                        <p className="text-foreground font-medium">{client.website_url || 'Not set'}</p>
                                    </div>
                                </div>

                                {client.notes && (
                                    <div className="mt-6 pt-6 border-t border-primary/10">
                                        <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-2">Notes</p>
                                        <p className="text-muted-foreground text-sm">{client.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <button className="p-4 rounded-2xl bg-card/20 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                                <BarChart3 className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-orbitron text-muted-foreground uppercase">Analytics</p>
                            </button>
                            <button className="p-4 rounded-2xl bg-card/20 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                                <FileText className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-orbitron text-muted-foreground uppercase">Documents</p>
                            </button>
                            <button className="p-4 rounded-2xl bg-card/20 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                                <Calendar className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-orbitron text-muted-foreground uppercase">Schedule</p>
                            </button>
                            <button className="p-4 rounded-2xl bg-card/20 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                                <Activity className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-orbitron text-muted-foreground uppercase">Activity</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndividualClientProfile;

