import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    Truck,
    UserCheck,
    ArrowLeft,
    LogOut,
    Building2,
    Zap,
    Shield,
    Users,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import HUDOverlay from '@/components/ui/HUDOverlay';
import StatusIndicator from '@/components/agency/StatusIndicator';
import MissionClock from '@/components/agency/MissionClock';

const CDLAgencyPortal: React.FC = () => {
    const { signOut } = useAuth();

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <Helmet>
                <title>CDL Agency Portal | Brokerage Management</title>
            </Helmet>

            <HUDOverlay />

            {/* Animated background elements - Red theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="border-b border-red-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link to="/avaadminpanel">
                                    <Button variant="ghost" size="icon" className="mr-2 border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                                        <ArrowLeft className="w-5 h-5 text-white" />
                                    </Button>
                                </Link>
                                <Building2 className="w-8 h-8 text-red-500" />
                                <div>
                                    <h1 className="font-orbitron text-2xl font-bold text-white">
                                        CDL AGENCY PORTAL
                                    </h1>
                                    <p className="text-xs text-red-400/60 font-orbitron tracking-widest uppercase">
                                        AI-Powered Brokerage Platform
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/20">
                                    <StatusIndicator status="online" label="Portal Active" />
                                    <div className="w-px h-4 bg-white/30" />
                                    <MissionClock />
                                </div>
                                <Button variant="ghost" size="icon" onClick={signOut} className="border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                                    <LogOut className="w-5 h-5 text-white hover:text-red-400" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
                    <div className="w-full max-w-5xl space-y-8">
                        {/* Title Section */}
                        <div className="text-center space-y-4 mb-12">
                            <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-white">
                                Select Your Portal
                            </h2>
                            <p className="text-red-400/60 text-lg max-w-2xl mx-auto">
                                Choose your pathway to access the AI-powered CDL management system
                            </p>
                        </div>

                        {/* Two Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Recruiters Card */}
                            <Link
                                to="/cdl-recruiters"
                                className="group relative block"
                            >
                                {/* Animated border glow */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500 group-hover:duration-200" />
                                
                                {/* Card */}
                                <div className="relative h-full bg-black/60 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 overflow-hidden transition-all duration-300 group-hover:border-red-500/50 group-hover:translate-y-[-8px]">
                                    {/* Background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    {/* Decorative lines */}
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    {/* Floating icon background */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <UserCheck className="w-full h-full text-red-500" />
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        {/* Icon */}
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <UserCheck className="w-10 h-10 text-red-500" />
                                        </div>

                                        {/* Title & Description */}
                                        <div className="space-y-3">
                                            <h3 className="font-orbitron font-bold text-2xl text-white">
                                                Recruiters
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                Find and place qualified CDL drivers. AI-powered candidate matching, lead tracking, and placement management.
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-orbitron">
                                                <Users className="w-3 h-3 inline mr-1" />
                                                Lead Tracking
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-orbitron">
                                                <Zap className="w-3 h-3 inline mr-1" />
                                                AI Matching
                                            </span>
                                        </div>

                                        {/* CTA Button - See through */}
                                        <button className="w-full mt-4 py-4 px-6 rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-500/30 text-white font-orbitron font-bold text-sm uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                            Enter Recruiter Portal
                                        </button>
                                    </div>
                                </div>
                            </Link>

                            {/* Carriers Card */}
                            <Link
                                to="/cdl-carriers"
                                className="group relative block"
                            >
                                {/* Animated border glow */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500 group-hover:duration-200" />
                                
                                {/* Card */}
                                <div className="relative h-full bg-black/60 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 overflow-hidden transition-all duration-300 group-hover:border-red-500/50 group-hover:translate-y-[-8px]">
                                    {/* Background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    {/* Decorative lines */}
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    {/* Floating icon background */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Truck className="w-full h-full text-red-500" />
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        {/* Icon */}
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Truck className="w-10 h-10 text-red-500" />
                                        </div>

                                        {/* Title & Description */}
                                        <div className="space-y-3">
                                            <h3 className="font-orbitron font-bold text-2xl text-white">
                                                Carriers
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                Manage your fleet operations with ease. Driver management, compliance tracking, and load optimization.
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-orbitron">
                                                <Shield className="w-3 h-3 inline mr-1" />
                                                Compliance
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-orbitron">
                                                <MapPin className="w-3 h-3 inline mr-1" />
                                                Fleet Tracking
                                            </span>
                                        </div>

                                        {/* CTA Button - See through */}
                                        <button className="w-full mt-4 py-4 px-6 rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-500/30 text-white font-orbitron font-bold text-sm uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                            Enter Carrier Portal
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Bottom Info */}
                        <div className="text-center pt-8">
                            <p className="text-gray-500 text-sm font-orbitron">
                                Powered by <span className="text-red-500">Rank Me Higher</span> • CDL Brokerage Intelligence
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CDLAgencyPortal;
