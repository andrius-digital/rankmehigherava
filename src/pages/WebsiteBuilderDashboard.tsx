import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Rocket, Hammer, Globe, FileText, Sparkles, Code, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GridOverlay from "@/components/agency/GridOverlay";
import FuturisticWrapper from "@/components/ui/FuturisticWrapper";
import WebsitePrompting from "@/components/WebsitePrompting";

// Enhanced status badge component
const StatusBadge = ({ status }: { status: 'ready' | 'building' | 'live' }) => {
    const config = {
        ready: {
            icon: Rocket,
            label: 'Ready To Build',
            className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
            glow: 'shadow-cyan-500/20'
        },
        building: {
            icon: Hammer,
            label: 'Being Built',
            className: 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse',
            glow: 'shadow-orange-500/20'
        },
        live: {
            icon: Globe,
            label: 'Live & Managed',
            className: 'bg-green-500/10 text-green-400 border-green-500/30',
            glow: 'shadow-green-500/20'
        }
    };

    const { icon: Icon, label, className, glow } = config[status];

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shadow-lg ${className} ${glow}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </div>
    );
};

// Stats card component
const StatsCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => {
    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
        orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400'
    };

    return (
        <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-black font-orbitron">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </div>
        </div>
    );
};

// Mock data - replace with actual Supabase query
const mockSubmissions = [
    {
        id: 1,
        businessName: "Crystal Clear Window Washing",
        businessType: "Window Washing",
        location: "Chicago, IL",
        serviceAreas: ["Chicago", "Naperville", "Aurora", "Joliet"],
        mainBenefit: "Streak-Free Windows in 24 Hours",
        submittedAt: "2025-01-28T10:30:00",
        status: 'building' as const,
        hasServiceAreas: true,
        assignedTo: "John D.",
        dueDate: "2025-02-05"
    },
    {
        id: 2,
        businessName: "Elite Auto Detailing",
        businessType: "Auto Detailing",
        location: "1234 Main St, Chicago",
        serviceAreas: [],
        mainBenefit: "Premium Paint Protection & Ceramic Coating",
        submittedAt: "2025-01-27T14:20:00",
        status: 'ready' as const,
        hasServiceAreas: false,
        assignedTo: null,
        dueDate: "2025-02-10"
    },
    {
        id: 3,
        businessName: "Pro HVAC Solutions",
        businessType: "HVAC",
        location: "Chicagoland",
        serviceAreas: ["Chicago", "Evanston", "Skokie", "Oak Park"],
        mainBenefit: "Same-Day Emergency Service",
        submittedAt: "2025-01-26T09:15:00",
        status: 'live' as const,
        hasServiceAreas: true,
        assignedTo: "Sarah M.",
        dueDate: null,
        liveUrl: "https://prohvacsolutions.com"
    },
    {
        id: 4,
        businessName: "Precision Concrete Coatings",
        businessType: "Concrete Shield Coatings",
        location: "Chicago Metro",
        serviceAreas: ["Chicago", "Schaumburg", "Palatine"],
        mainBenefit: "Lifetime Warranty on All Coatings",
        submittedAt: "2025-01-25T11:00:00",
        status: 'ready' as const,
        hasServiceAreas: true,
        assignedTo: null,
        dueDate: "2025-02-08"
    }
];

const WebsiteBuilderDashboard = () => {
    const [selectedSubmission, setSelectedSubmission] = useState<typeof mockSubmissions[0] | null>(null);
    const [projectStatus, setProjectStatus] = useState<'ready' | 'building' | 'live'>('ready');
    const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'building' | 'live'>('all');

    // Calculate stats
    const stats = {
        ready: mockSubmissions.filter(s => s.status === 'ready').length,
        building: mockSubmissions.filter(s => s.status === 'building').length,
        live: mockSubmissions.filter(s => s.status === 'live').length
    };

    // Filter submissions based on active tab
    const filteredSubmissions = activeTab === 'all'
        ? mockSubmissions
        : mockSubmissions.filter(s => s.status === activeTab);

    const handleStartProject = (submission: typeof mockSubmissions[0]) => {
        setSelectedSubmission(submission);
        setProjectStatus(submission.status);
    };

    const handleStatusChange = (newStatus: 'ready' | 'building' | 'live') => {
        setProjectStatus(newStatus);
        // TODO: Update status in Supabase
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Website Builder Dashboard | Agency</title>
                <meta name="description" content="Build and manage client websites" />
            </Helmet>

            <GridOverlay />

            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <header className="border-b border-border/30 bg-card/20 backdrop-blur-xl sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/avaadminpanel">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <div className="h-6 w-px bg-border/50" />
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                                        <Code className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                                            Website Builder
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            Build & Deploy Client Websites
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8 sm:py-12">
                    <div className="max-w-7xl mx-auto">
                        {!selectedSubmission ? (
                            /* Dashboard View */
                            <div className="space-y-6">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FuturisticWrapper delay={0}>
                                        <StatsCard icon={Rocket} label="Ready To Build" value={stats.ready} color="cyan" />
                                    </FuturisticWrapper>
                                    <FuturisticWrapper delay={100}>
                                        <StatsCard icon={Hammer} label="Being Built" value={stats.building} color="orange" />
                                    </FuturisticWrapper>
                                    <FuturisticWrapper delay={200}>
                                        <StatsCard icon={Globe} label="Live & Managed" value={stats.live} color="green" />
                                    </FuturisticWrapper>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex items-center gap-2 p-1 rounded-xl bg-card/30 border border-border/50 w-fit">
                                    {(['all', 'ready', 'building', 'live'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {tab === 'all' ? 'All Projects' :
                                                tab === 'ready' ? 'Ready To Build' :
                                                    tab === 'building' ? 'Being Built' :
                                                        'Live & Managed'}
                                        </button>
                                    ))}
                                </div>

                                {/* Projects List */}
                                <div>
                                    <h2 className="text-lg font-bold text-foreground mb-4">
                                        {activeTab === 'all' ? 'All Projects' :
                                            activeTab === 'ready' ? 'Ready To Build' :
                                                activeTab === 'building' ? 'Being Built' :
                                                    'Live & Managed'} ({filteredSubmissions.length})
                                    </h2>

                                    <div className="grid gap-4">
                                        {filteredSubmissions.map((submission, idx) => (
                                            <FuturisticWrapper key={submission.id} delay={idx * 50}>
                                                <div className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
                                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                                <h3 className="text-lg font-bold text-foreground">{submission.businessName}</h3>
                                                                <StatusBadge status={submission.status} />
                                                            </div>

                                                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground mb-1">Business Type</p>
                                                                    <p className="text-sm font-medium text-foreground">{submission.businessType}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                                                                    <p className="text-sm font-medium text-foreground">{submission.location}</p>
                                                                </div>
                                                                {submission.assignedTo && (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                                                                        <p className="text-sm font-medium text-foreground">{submission.assignedTo}</p>
                                                                    </div>
                                                                )}
                                                                {submission.dueDate && (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            {new Date(submission.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {submission.liveUrl && (
                                                                    <div className="sm:col-span-2">
                                                                        <p className="text-xs text-muted-foreground mb-1">Live URL</p>
                                                                        <a
                                                                            href={submission.liveUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                                                        >
                                                                            {submission.liveUrl}
                                                                            <Eye className="w-3 h-3" />
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <p className="text-xs text-muted-foreground">
                                                                Submitted: {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>

                                                        <Button
                                                            onClick={() => handleStartProject(submission)}
                                                            variant="default"
                                                            className="gap-2 lg:flex-shrink-0"
                                                        >
                                                            {submission.status === 'live' ? (
                                                                <>
                                                                    <Eye className="w-4 h-4" />
                                                                    View Details
                                                                </>
                                                            ) : submission.status === 'building' ? (
                                                                <>
                                                                    <Hammer className="w-4 h-4" />
                                                                    Continue Building
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Rocket className="w-4 h-4" />
                                                                    Start Building
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </FuturisticWrapper>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Project Detail View */
                            <div className="space-y-6">
                                {/* Project Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedSubmission(null)}
                                            className="gap-2 mb-3"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Projects
                                        </Button>
                                        <h2 className="text-2xl font-bold text-foreground mb-2">{selectedSubmission.businessName}</h2>
                                        <p className="text-muted-foreground">{selectedSubmission.businessType} • {selectedSubmission.location}</p>
                                    </div>

                                    {/* Status Controls */}
                                    <div className="flex flex-col items-start lg:items-end gap-3">
                                        <StatusBadge status={projectStatus} />
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant={projectStatus === 'ready' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleStatusChange('ready')}
                                                className="gap-2"
                                            >
                                                <Rocket className="w-3.5 h-3.5" />
                                                Ready
                                            </Button>
                                            <Button
                                                variant={projectStatus === 'building' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleStatusChange('building')}
                                                className="gap-2"
                                            >
                                                <Hammer className="w-3.5 h-3.5" />
                                                Building
                                            </Button>
                                            <Button
                                                variant={projectStatus === 'live' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleStatusChange('live')}
                                                className="gap-2"
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                                Live
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Client Info Card */}
                                <FuturisticWrapper>
                                    <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <h3 className="text-lg font-bold text-foreground">Client Information</h3>
                                        </div>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Business Name</p>
                                                <p className="text-sm font-medium text-foreground">{selectedSubmission.businessName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Business Type</p>
                                                <p className="text-sm font-medium text-foreground">{selectedSubmission.businessType}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Location</p>
                                                <p className="text-sm font-medium text-foreground">{selectedSubmission.location}</p>
                                            </div>
                                            {selectedSubmission.serviceAreas.length > 0 && (
                                                <div className="sm:col-span-2 lg:col-span-3">
                                                    <p className="text-xs text-muted-foreground mb-2">Service Areas</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedSubmission.serviceAreas.map((area, idx) => (
                                                            <span key={idx} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                                                                {area}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="sm:col-span-2 lg:col-span-3">
                                                <p className="text-xs text-muted-foreground mb-1">Main Benefit / USP</p>
                                                <p className="text-sm font-medium text-foreground">{selectedSubmission.mainBenefit}</p>
                                            </div>
                                        </div>
                                    </div>
                                </FuturisticWrapper>

                                {/* AI Prompting Section */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        <h3 className="text-xl font-bold text-foreground">AI Website Prompts</h3>
                                    </div>
                                    <WebsitePrompting
                                        submissionData={{
                                            businessName: selectedSubmission.businessName,
                                            businessType: selectedSubmission.businessType,
                                            location: selectedSubmission.location,
                                            serviceAreas: selectedSubmission.serviceAreas,
                                            mainBenefit: selectedSubmission.mainBenefit
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WebsiteBuilderDashboard;
