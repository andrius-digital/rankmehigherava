import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Play,
    MessageSquare,
    ChevronDown,
    ChevronRight,
    FileText,
    Palette,
    Code,
    Bug,
    Sparkles,
    HelpCircle,
    Check,
    Circle,
    Timer,
    Calendar,
    MoreVertical,
    Trash2,
    Search,
    Eye,
    AlertTriangle,
    Truck,
    LayoutGrid,
    List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import TaskPipelineDashboard from './TaskPipelineDashboard';

interface ClientRequest {
    id: string;
    client_id: string;
    task_id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'ready_for_qa' | 'in_qa' | 'qa_failed' | 'qa_passed' | 'delivered' | 'completed' | 'cancelled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    request_type: string;
    estimated_hours: number;
    actual_hours: number;
    billable: boolean;
    hourly_rate: number;
    agency_notes: string;
    assigned_to: string;
    assigned_manager: string;
    qa_manager: string;
    revision_count: number;
    created_at: string;
    updated_at: string;
    started_at: string | null;
    completed_at: string | null;
    qa_started_at: string | null;
    qa_completed_at: string | null;
    delivered_at: string | null;
}

interface ClientRequestsTrackerProps {
    clientId: string;
    clientName: string;
    isAgencyView?: boolean;
    defaultView?: 'compact' | 'pipeline';
}

const requestTypeIcons: Record<string, React.ElementType> = {
    content_update: FileText,
    design_change: Palette,
    new_feature: Sparkles,
    bug_fix: Bug,
    adjustment: Code,
    other: HelpCircle,
};

// Enhanced status config for pipeline
const statusConfig: Record<string, {
    icon: React.ElementType;
    label: string;
    bg: string;
    text: string;
    border: string;
    dotColor: string;
}> = {
    pending: {
        icon: Circle,
        label: 'Pending',
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dotColor: 'bg-slate-400'
    },
    in_progress: {
        icon: Play,
        label: 'In Progress',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        dotColor: 'bg-blue-400'
    },
    ready_for_qa: {
        icon: Search,
        label: 'Ready for QA',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        dotColor: 'bg-purple-400'
    },
    in_qa: {
        icon: Eye,
        label: 'In QA',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dotColor: 'bg-amber-400'
    },
    qa_failed: {
        icon: AlertTriangle,
        label: 'QA Failed',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dotColor: 'bg-red-400'
    },
    qa_passed: {
        icon: CheckCircle2,
        label: 'QA Passed',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dotColor: 'bg-emerald-400'
    },
    delivered: {
        icon: Truck,
        label: 'Delivered',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        dotColor: 'bg-cyan-400'
    },
    completed: {
        icon: CheckCircle2,
        label: 'Completed',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dotColor: 'bg-emerald-400'
    },
    cancelled: {
        icon: AlertCircle,
        label: 'Cancelled',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dotColor: 'bg-red-400'
    },
};

const priorityConfig = {
    low: { label: 'Low', color: 'text-slate-400' },
    normal: { label: 'Normal', color: 'text-blue-400' },
    high: { label: 'High', color: 'text-orange-400' },
    urgent: { label: 'Urgent', color: 'text-red-400' },
};

const ClientRequestsTracker: React.FC<ClientRequestsTrackerProps> = ({
    clientId,
    clientName,
    isAgencyView = true,
    defaultView = 'pipeline'
}) => {
    const [requests, setRequests] = useState<ClientRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [viewMode, setViewMode] = useState<'compact' | 'pipeline'>(defaultView);
    const [agencyNote, setAgencyNote] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('client_requests')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests((data || []) as ClientRequest[]);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [clientId]);

    const invalidateAllQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['all-pending-requests'] });
        queryClient.invalidateQueries({ queryKey: ['all-pending-requests-client-portal'] });
        queryClient.invalidateQueries({ queryKey: ['pending-requests-count', clientId] });
        queryClient.invalidateQueries({ queryKey: ['client-requests-count', clientId] });
        queryClient.invalidateQueries({ queryKey: ['pipeline-tasks', clientId] });
    };

    const updateStatus = async (requestId: string, newStatus: string) => {
        try {
            const updates: any = { status: newStatus };

            if (newStatus === 'in_progress') {
                updates.started_at = new Date().toISOString();
            }
            if (newStatus === 'in_qa') {
                updates.qa_started_at = new Date().toISOString();
            }
            if (newStatus === 'qa_passed' || newStatus === 'qa_failed') {
                updates.qa_completed_at = new Date().toISOString();
            }
            if (newStatus === 'delivered') {
                updates.delivered_at = new Date().toISOString();
            }
            if (newStatus === 'completed') {
                updates.completed_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('client_requests')
                .update(updates)
                .eq('id', requestId);

            if (error) throw error;

            toast({
                title: 'Status Updated',
                description: `Task moved to ${newStatus.replace(/_/g, ' ')}`,
            });

            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive'
            });
        }
    };

    const addNote = async (requestId: string) => {
        if (!agencyNote.trim()) return;

        try {
            // Add to task_notes table
            const { error } = await supabase
                .from('task_notes')
                .insert({
                    task_id: requestId,
                    user_name: 'Manager',
                    user_role: 'manager',
                    message: agencyNote,
                    is_internal: false
                });

            if (error) throw error;

            toast({ title: 'Note Added' });
            setAgencyNote('');
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            // Fallback to old method if task_notes table doesn't exist yet
            try {
                const request = requests.find(r => r.id === requestId);
                const existingNotes = request?.agency_notes || '';
                const timestamp = new Date().toLocaleString();
                const newNote = existingNotes
                    ? `${existingNotes}\n\n[${timestamp}]\n${agencyNote}`
                    : `[${timestamp}]\n${agencyNote}`;

                const { error: updateError } = await supabase
                    .from('client_requests')
                    .update({ agency_notes: newNote })
                    .eq('id', requestId);

                if (updateError) throw updateError;

                toast({ title: 'Note Added' });
                setAgencyNote('');
                fetchRequests();
            } catch (fallbackError) {
                toast({
                    title: 'Error',
                    description: 'Failed to add note',
                    variant: 'destructive'
                });
            }
        }
    };

    const deleteRequest = async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('client_requests')
                .delete()
                .eq('id', requestId);

            if (error) throw error;

            toast({ title: 'Request Deleted' });
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete request',
                variant: 'destructive'
            });
        }
    };

    // Filter requests by tab - include pipeline statuses
    const activeStatuses = ['pending', 'in_progress', 'ready_for_qa', 'in_qa', 'qa_failed'];
    const completedStatuses = ['qa_passed', 'delivered', 'completed', 'cancelled'];

    const activeRequests = requests.filter(r => activeStatuses.includes(r.status));
    const completedRequests = requests.filter(r => completedStatuses.includes(r.status));
    const displayedRequests = activeTab === 'active' ? activeRequests : completedRequests;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Show pipeline view
    if (viewMode === 'pipeline') {
        return (
            <div className="space-y-3">
                {/* View Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('pipeline')}
                            className="h-7 text-xs"
                        >
                            <LayoutGrid className="w-3 h-3 mr-1" />
                            Pipeline
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'compact' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('compact')}
                            className="h-7 text-xs"
                        >
                            <List className="w-3 h-3 mr-1" />
                            Compact
                        </Button>
                    </div>
                </div>

                {/* Pipeline Dashboard */}
                <TaskPipelineDashboard
                    clientId={clientId}
                    userRole={isAgencyView ? 'admin' : 'client'}
                    showAllClients={false}
                />
            </div>
        );
    }

    // Compact view (original)
    return (
        <div className="space-y-3">
            {/* View Toggle + Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('pipeline')}
                        className="h-7 text-xs"
                    >
                        <LayoutGrid className="w-3 h-3 mr-1" />
                        Pipeline
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'compact' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('compact')}
                        className="h-7 text-xs"
                    >
                        <List className="w-3 h-3 mr-1" />
                        Compact
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-amber-400 font-medium">{requests.filter(r => r.status === 'pending').length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="text-blue-400 font-medium">{activeRequests.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400 font-medium">{completedRequests.length}</span>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-white/5">
                <button
                    onClick={() => setActiveTab('active')}
                    className={cn(
                        "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
                        activeTab === 'active'
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Active ({activeRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={cn(
                        "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
                        activeTab === 'completed'
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Completed ({completedRequests.length})
                </button>
            </div>

            {/* Request List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {displayedRequests.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        {activeTab === 'active' ? (
                            <>
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400/50" />
                                <p>No active requests</p>
                            </>
                        ) : (
                            <>
                                <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                                <p>No completed requests yet</p>
                            </>
                        )}
                    </div>
                ) : (
                    displayedRequests.map((request) => {
                        const TypeIcon = requestTypeIcons[request.request_type] || Code;
                        const status = statusConfig[request.status] || statusConfig.pending;
                        const priority = priorityConfig[request.priority] || priorityConfig.normal;
                        const isExpanded = expandedId === request.id;

                        return (
                            <Collapsible
                                key={request.id}
                                open={isExpanded}
                                onOpenChange={(open) => setExpandedId(open ? request.id : null)}
                            >
                                <div className={cn(
                                    "rounded-lg border transition-all",
                                    status.bg,
                                    status.border,
                                    isExpanded && "ring-1 ring-white/10"
                                )}>
                                    {/* Main Row */}
                                    <CollapsibleTrigger asChild>
                                        <button className="w-full p-3 flex items-center gap-3 text-left">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                                status.bg,
                                                "border",
                                                status.border
                                            )}>
                                                <TypeIcon className={cn("w-4 h-4", status.text)} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    {request.task_id && (
                                                        <span className="text-[9px] font-mono text-slate-500">
                                                            {request.task_id}
                                                        </span>
                                                    )}
                                                    <h4 className="font-medium text-sm text-foreground truncate">
                                                        {request.title}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    <span className={cn("font-medium", status.text)}>
                                                        {status.label}
                                                    </span>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className={priority.color}>{priority.label}</span>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className="text-muted-foreground">{formatDate(request.created_at)}</span>
                                                    {request.revision_count > 0 && (
                                                        <>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span className="text-amber-400">Rev {request.revision_count}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <ChevronRight className={cn(
                                                "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
                                                isExpanded && "rotate-90"
                                            )} />
                                        </button>
                                    </CollapsibleTrigger>

                                    {/* Expanded Content */}
                                    <CollapsibleContent>
                                        <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
                                            {request.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {request.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Created: {new Date(request.created_at).toLocaleDateString()}
                                                </span>
                                                {request.started_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Play className="w-3 h-3" />
                                                        Started: {new Date(request.started_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {request.qa_started_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        QA: {new Date(request.qa_started_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {request.delivered_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Truck className="w-3 h-3" />
                                                        Delivered: {new Date(request.delivered_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Agency Actions */}
                                            {isAgencyView && !completedStatuses.includes(request.status) && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <Textarea
                                                            placeholder="Add a note..."
                                                            value={agencyNote}
                                                            onChange={(e) => setAgencyNote(e.target.value)}
                                                            className="text-xs min-h-[60px] bg-white/5 border-white/10 resize-none"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {agencyNote.trim() && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => addNote(request.id)}
                                                                className="text-xs h-8"
                                                            >
                                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                                Add Note
                                                            </Button>
                                                        )}

                                                        {/* Pipeline progression buttons */}
                                                        {request.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateStatus(request.id, 'in_progress')}
                                                                className="text-xs h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                                                            >
                                                                <Play className="w-3 h-3 mr-1" />
                                                                Start
                                                            </Button>
                                                        )}

                                                        {request.status === 'in_progress' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateStatus(request.id, 'ready_for_qa')}
                                                                className="text-xs h-8 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
                                                            >
                                                                <Search className="w-3 h-3 mr-1" />
                                                                Ready for QA
                                                            </Button>
                                                        )}

                                                        {request.status === 'ready_for_qa' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateStatus(request.id, 'in_qa')}
                                                                className="text-xs h-8 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                                                            >
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                Start QA
                                                            </Button>
                                                        )}

                                                        {request.status === 'in_qa' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => updateStatus(request.id, 'qa_passed')}
                                                                    className="text-xs h-8 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    QA Passed
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => updateStatus(request.id, 'qa_failed')}
                                                                    className="text-xs h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                                                                >
                                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                                    QA Failed
                                                                </Button>
                                                            </>
                                                        )}

                                                        {request.status === 'qa_failed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateStatus(request.id, 'in_progress')}
                                                                className="text-xs h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                                                            >
                                                                <Play className="w-3 h-3 mr-1" />
                                                                Restart Work
                                                            </Button>
                                                        )}

                                                        {request.status === 'qa_passed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateStatus(request.id, 'delivered')}
                                                                className="text-xs h-8 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                                                            >
                                                                <Truck className="w-3 h-3 mr-1" />
                                                                Deliver
                                                            </Button>
                                                        )}

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => updateStatus(request.id, 'pending')}>
                                                                    <Circle className="w-4 h-4 mr-2" />
                                                                    Move to Pending
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => deleteRequest(request.id)}
                                                                    className="text-red-400"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete Request
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Completed Actions */}
                                            {isAgencyView && completedStatuses.includes(request.status) && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateStatus(request.id, 'pending')}
                                                        className="text-xs h-8"
                                                    >
                                                        <Circle className="w-3 h-3 mr-1" />
                                                        Reopen
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteRequest(request.id)}
                                                        className="text-xs h-8 text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ClientRequestsTracker;
