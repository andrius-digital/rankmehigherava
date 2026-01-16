import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, Rocket, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GridOverlay from "@/components/agency/GridOverlay";
import FuturisticWrapper from "@/components/ui/FuturisticWrapper";
import WebsitePrompting from "@/components/WebsitePrompting";

// Status badge component
const StatusBadge = ({ status }: { status: 'pending' | 'in-progress' | 'completed' }) => {
    const config = {
        pending: {
            icon: AlertCircle,
            label: 'Pending',
            className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
        },
        'in-progress': {
            icon: Clock,
            label: 'In Progress',
            className: 'bg-blue-500/10 text-blue-500 border-blue-500/30 animate-pulse'
        },
        completed: {
            icon: CheckCircle2,
            label: 'Completed',
            className: 'bg-green-500/10 text-green-500 border-green-500/30'
        }
    };

    const { icon: Icon, label, className } = config[status];

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
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
        status: 'in-progress' as const,
        hasServiceAreas: true
    },
    {
        id: 2,
        businessName: "Elite Auto Detailing",
        businessType: "Auto Detailing",
        location: "1234 Main St, Chicago",
        serviceAreas: [],
        mainBenefit: "Premium Paint Protection & Ceramic Coating",
        submittedAt: "2025-01-27T14:20:00",
        status: 'pending' as const,
        hasServiceAreas: false
    },
    {
        id: 3,
        businessName: "Pro HVAC Solutions",
        businessType: "HVAC",
        location: "Chicagoland",
        serviceAreas: ["Chicago", "Evanston", "Skokie", "Oak Park"],
        mainBenefit: "Same-Day Emergency Service",
        submittedAt: "2025-01-26T09:15:00",
        status: 'completed' as const,
        hasServiceAreas: true
    }
];

const WebsiteCreationDashboard = () => {
    const [selectedSubmission, setSelectedSubmission] = useState<typeof mockSubmissions[0] | null>(null);
    const [projectStatus, setProjectStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

    const handleStartProject = (submission: typeof mockSubmissions[0]) => {
        setSelectedSubmission(submission);
        setProjectStatus(submission.status);
    };

    const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed') => {
        setProjectStatus(newStatus);
        // TODO: Update status in Supabase
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Website Creation | AVA Admin Panel</title>
                <meta name="description" content="Manage website creation projects from client submissions" />
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
                                        Back to AVA Admin Panel
                                    </Button>
                                </Link>
                                <div className="h-6 w-px bg-border/50" />
                                <div>
                                    <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                                        Website Creation Dashboard
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Manage client submissions & deploy websites
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8 sm:py-12">
                    <div className="max-w-7xl mx-auto">
                        {!selectedSubmission ? (
                            /* Submissions List View */
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-foreground mb-2">Client Submissions</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Select a submission to start creating the website
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    {mockSubmissions.map((submission) => (
                                        <FuturisticWrapper key={submission.id}>
                                            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <h3 className="text-lg font-bold text-foreground">{submission.businessName}</h3>
                                                            <StatusBadge status={submission.status} />
                                                        </div>

                                                        <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Business Type</p>
                                                                <p className="text-sm font-medium text-foreground">{submission.businessType}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Location</p>
                                                                <p className="text-sm font-medium text-foreground">{submission.location}</p>
                                                            </div>
                                                            {submission.serviceAreas.length > 0 && (
                                                                <div className="sm:col-span-2">
                                                                    <p className="text-xs text-muted-foreground mb-1">Service Areas</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {submission.serviceAreas.map((area, idx) => (
                                                                            <span key={idx} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                                                {area}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="sm:col-span-2">
                                                                <p className="text-xs text-muted-foreground mb-1">Main Benefit</p>
                                                                <p className="text-sm font-medium text-foreground">{submission.mainBenefit}</p>
                                                            </div>
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
                                                        className="gap-2"
                                                    >
                                                        <Rocket className="w-4 h-4" />
                                                        {submission.status === 'completed' ? 'View Project' : 'Start Project'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </FuturisticWrapper>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Project Detail View */
                            <div className="space-y-6">
                                {/* Project Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedSubmission(null)}
                                            className="gap-2 mb-3"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Submissions
                                        </Button>
                                        <h2 className="text-2xl font-bold text-foreground mb-2">{selectedSubmission.businessName}</h2>
                                        <p className="text-muted-foreground">{selectedSubmission.businessType} • {selectedSubmission.location}</p>
                                    </div>

                                    {/* Status Controls */}
                                    <div className="flex flex-col items-end gap-3">
                                        <StatusBadge status={projectStatus} />
                                        <div className="flex gap-2">
                                            <Button
                                                variant={projectStatus === 'pending' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleStatusChange('pending')}
                                            >
                                                Pending
                                            </Button>
                                            <Button
                                                variant={projectStatus === 'in-progress' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleStatusChange('in-progress')}
                                            >
                                                In Progress
                                            </Button>
                                            <Button
                                                variant={projectStatus === 'completed' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleStatusChange('completed')}
                                            >
                                                Completed
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

                                {/* Website Prompting Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-4">AI Website Prompts</h3>
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

export default WebsiteCreationDashboard;
