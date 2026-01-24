import React, { useState } from 'react';
import {
    Clock,
    Play,
    CheckCircle2,
    Search,
    AlertTriangle,
    Truck,
    Eye,
    X,
    MessageSquare,
    Paperclip,
    User,
    Calendar,
    RotateCcw,
    Send,
    ChevronRight,
    Loader2,
    UserCircle,
    FileText,
    Download,
    Trash2,
    Rocket
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Pipeline stages for timeline
const PIPELINE_STAGES = [
    { id: 'pending', label: 'Request', icon: Clock, color: 'slate' },
    { id: 'in_progress', label: 'In Progress', icon: Play, color: 'blue' },
    { id: 'ready_for_qa', label: 'Ready for QA', icon: Search, color: 'purple' },
    { id: 'in_qa', label: 'In QA', icon: Eye, color: 'amber' },
    { id: 'qa_passed', label: 'QA Passed', icon: CheckCircle2, color: 'emerald' },
    { id: 'delivered', label: 'Delivered', icon: Truck, color: 'cyan' },
] as const;

type UserRole = 'client' | 'manager' | 'qa_manager' | 'admin';

interface Task {
    id: string;
    task_id: string;
    title: string;
    description: string;
    request_type: string;
    priority: string;
    status: string;
    client_id: string;
    client_company: string;
    client_email: string;
    assigned_manager: string;
    assigned_manager_avatar: string;
    qa_manager: string;
    qa_manager_avatar: string;
    created_at: string;
    updated_at: string;
    qa_started_at: string | null;
    qa_completed_at: string | null;
    delivered_at: string | null;
    revision_count: number;
    qa_feedback: string;
}

interface TaskNote {
    id: string;
    task_id: string;
    user_name: string;
    user_role: string;
    user_avatar: string;
    message: string;
    is_internal: boolean;
    created_at: string;
}

interface TaskFile {
    id: string;
    task_id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    uploaded_by: string;
    uploaded_by_role: string;
    created_at: string;
}

interface StatusHistory {
    id: string;
    task_id: string;
    from_status: string | null;
    to_status: string;
    changed_by: string;
    changed_by_role: string;
    notes: string;
    created_at: string;
}

interface TaskDetailModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    userRole: UserRole;
    onUpdate: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    task,
    isOpen,
    onClose,
    userRole,
    onUpdate
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [newNote, setNewNote] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [qaFeedback, setQaFeedback] = useState(task.qa_feedback || '');

    // Fetch notes
    const { data: notes = [], refetch: refetchNotes } = useQuery({
        queryKey: ['task-notes', task.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('task_notes')
                .select('*')
                .eq('task_id', task.id)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data as TaskNote[];
        },
        enabled: isOpen
    });

    // Fetch files
    const { data: files = [], refetch: refetchFiles } = useQuery({
        queryKey: ['task-files', task.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('task_files')
                .select('*')
                .eq('task_id', task.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as TaskFile[];
        },
        enabled: isOpen
    });

    // Fetch status history
    const { data: statusHistory = [] } = useQuery({
        queryKey: ['task-status-history', task.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('task_status_history')
                .select('*')
                .eq('task_id', task.id)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data as StatusHistory[];
        },
        enabled: isOpen
    });

    // Send Telegram notification for delivery
    const sendDeliveryNotification = async (taskTitle: string, taskId: string) => {
        try {
            const TELEGRAM_BOT_TOKEN = "8579583220:AAHcl0ElgV6VuDno-OZNQwKTKV2vDs3aYxE";
            const TELEGRAM_CHAT_ID = "-5166184217";

            const message = `🚀 <b>TASK DELIVERED!</b>\n\n` +
                `📋 <b>${taskTitle}</b>\n` +
                `🔢 Task ID: ${taskId || 'N/A'}\n` +
                `📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short' })}\n\n` +
                `✅ The task has been completed and delivered to the client.`;

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        } catch (error) {
            console.error('Failed to send Telegram notification:', error);
        }
    };

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            const updates: Record<string, any> = { status: newStatus };

            // Set timestamps based on status
            if (newStatus === 'in_progress') {
                updates.started_at = new Date().toISOString();
            } else if (newStatus === 'in_qa') {
                updates.qa_started_at = new Date().toISOString();
            } else if (newStatus === 'qa_passed' || newStatus === 'qa_failed') {
                updates.qa_completed_at = new Date().toISOString();
                if (newStatus === 'qa_failed') {
                    updates.revision_count = (task.revision_count || 0) + 1;
                }
            } else if (newStatus === 'delivered') {
                updates.delivered_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('client_requests')
                .update(updates)
                .eq('id', task.id);

            if (error) throw error;

            // Send Telegram notification when delivered
            if (newStatus === 'delivered') {
                await sendDeliveryNotification(task.title, task.task_id);
            }
        },
        onSuccess: () => {
            toast({ title: 'Status updated successfully' });
            onUpdate();
        },
        onError: (error) => {
            toast({ title: 'Failed to update status', variant: 'destructive' });
            console.error(error);
        }
    });

    // Quick deliver mutation (skip to delivered)
    const quickDeliverMutation = useMutation({
        mutationFn: async () => {
            const updates: Record<string, any> = {
                status: 'delivered',
                delivered_at: new Date().toISOString()
            };

            // Also set intermediate timestamps if not set
            if (!task.qa_started_at) {
                updates.qa_started_at = new Date().toISOString();
            }
            if (!task.qa_completed_at) {
                updates.qa_completed_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('client_requests')
                .update(updates)
                .eq('id', task.id);

            if (error) throw error;

            // Send Telegram notification
            await sendDeliveryNotification(task.title, task.task_id);
        },
        onSuccess: () => {
            toast({ title: 'Task delivered successfully!' });
            onUpdate();
        },
        onError: (error) => {
            toast({ title: 'Failed to deliver task', variant: 'destructive' });
            console.error(error);
        }
    });

    // Delete task mutation (admin only, for delivered tasks)
    const deleteTaskMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('client_requests')
                .delete()
                .eq('id', task.id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'Task deleted successfully' });
            onClose();
            onUpdate();
        },
        onError: (error) => {
            toast({ title: 'Failed to delete task', variant: 'destructive' });
            console.error(error);
        }
    });

    // Add note mutation
    const addNoteMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('task_notes')
                .insert({
                    task_id: task.id,
                    user_name: userRole === 'client' ? 'Client' : userRole === 'qa_manager' ? 'QA Manager' : 'Manager',
                    user_role: userRole,
                    message: newNote,
                    is_internal: isInternalNote
                });
            if (error) throw error;
        },
        onSuccess: () => {
            setNewNote('');
            refetchNotes();
            toast({ title: 'Note added' });
        },
        onError: (error) => {
            toast({ title: 'Failed to add note', variant: 'destructive' });
            console.error(error);
        }
    });

    // Save QA feedback mutation
    const saveQaFeedbackMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('client_requests')
                .update({ qa_feedback: qaFeedback })
                .eq('id', task.id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'QA feedback saved' });
            onUpdate();
        }
    });

    // Get current stage index
    const getCurrentStageIndex = () => {
        const index = PIPELINE_STAGES.findIndex(s => s.id === task.status);
        if (task.status === 'qa_failed') return 3; // Show at In QA position
        return index >= 0 ? index : 0;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'ready_for_qa': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'in_qa': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'qa_failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'qa_passed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'delivered': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getNextStatuses = (): string[] => {
        // Define valid transitions based on current status and role
        if (userRole === 'client') {
            return []; // Clients can't change status
        }

        switch (task.status) {
            case 'pending':
                return ['in_progress'];
            case 'in_progress':
                return ['ready_for_qa'];
            case 'ready_for_qa':
                return userRole === 'qa_manager' || userRole === 'admin' ? ['in_qa'] : [];
            case 'in_qa':
                return userRole === 'qa_manager' || userRole === 'admin' ? ['qa_passed', 'qa_failed'] : [];
            case 'qa_failed':
                return ['in_progress'];
            case 'qa_passed':
                return ['delivered'];
            default:
                return [];
        }
    };

    const currentStageIndex = getCurrentStageIndex();
    const visibleNotes = notes.filter(note => !note.is_internal || userRole !== 'client');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border-orange-500/30">
                <DialogHeader className="pb-4 border-b border-white/10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-slate-500">{task.task_id || 'TSK-????'}</span>
                                <Badge className={cn("text-[9px]", getPriorityColor(task.priority))}>
                                    {task.priority}
                                </Badge>
                                <Badge className={cn("text-[9px]", getStatusColor(task.status))}>
                                    {task.status.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                            <DialogTitle className="text-lg font-medium text-white">
                                {task.title}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-180px)] space-y-4 py-4">
                    {/* Visual Timeline */}
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-white/5">
                        <h3 className="text-xs font-orbitron uppercase tracking-wider text-slate-400 mb-4">
                            Pipeline Progress
                        </h3>
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-700">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                    style={{ width: `${(currentStageIndex / (PIPELINE_STAGES.length - 1)) * 100}%` }}
                                />
                            </div>

                            {PIPELINE_STAGES.map((stage, index) => {
                                const StageIcon = stage.icon;
                                const isCompleted = index < currentStageIndex;
                                const isCurrent = index === currentStageIndex;
                                const isFailed = task.status === 'qa_failed' && stage.id === 'in_qa';

                                return (
                                    <div key={stage.id} className="relative z-10 flex flex-col items-center">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                            isCompleted && "bg-emerald-500 border-emerald-400",
                                            isCurrent && !isFailed && "bg-orange-500 border-orange-400 ring-4 ring-orange-500/30",
                                            isFailed && "bg-red-500 border-red-400 ring-4 ring-red-500/30",
                                            !isCompleted && !isCurrent && "bg-slate-800 border-slate-600"
                                        )}>
                                            {isFailed ? (
                                                <AlertTriangle className="w-4 h-4 text-white" />
                                            ) : (
                                                <StageIcon className={cn(
                                                    "w-4 h-4",
                                                    isCompleted || isCurrent ? "text-white" : "text-slate-500"
                                                )} />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] mt-2 text-center font-medium max-w-[60px]",
                                            isCurrent ? "text-orange-400" : isCompleted ? "text-emerald-400" : "text-slate-500"
                                        )}>
                                            {stage.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Actions */}
                    {(getNextStatuses().length > 0 || (userRole === 'admin' && task.status !== 'delivered')) && (
                        <div className="flex flex-wrap gap-2">
                            {getNextStatuses().map(status => (
                                <Button
                                    key={status}
                                    size="sm"
                                    onClick={() => updateStatusMutation.mutate(status)}
                                    disabled={updateStatusMutation.isPending || quickDeliverMutation.isPending}
                                    className={cn(
                                        "font-orbitron text-xs",
                                        status === 'qa_failed' && "bg-red-500 hover:bg-red-600",
                                        status === 'qa_passed' && "bg-emerald-500 hover:bg-emerald-600",
                                        status !== 'qa_failed' && status !== 'qa_passed' && "bg-orange-500 hover:bg-orange-600"
                                    )}
                                >
                                    {updateStatusMutation.isPending ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                        <ChevronRight className="w-3 h-3 mr-1" />
                                    )}
                                    Move to {status.replace(/_/g, ' ')}
                                </Button>
                            ))}

                            {/* Quick Deliver Button - Admin only, not already delivered */}
                            {userRole === 'admin' && task.status !== 'delivered' && task.status !== 'qa_passed' && (
                                <Button
                                    size="sm"
                                    onClick={() => quickDeliverMutation.mutate()}
                                    disabled={quickDeliverMutation.isPending || updateStatusMutation.isPending}
                                    className="font-orbitron text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                                >
                                    {quickDeliverMutation.isPending ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                        <Rocket className="w-3 h-3 mr-1" />
                                    )}
                                    Deliver Now
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Delete Button - Admin only, for delivered/completed tasks */}
                    {userRole === 'admin' && (task.status === 'delivered' || task.status === 'completed' || task.status === 'cancelled') && (
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                                        deleteTaskMutation.mutate();
                                    }
                                }}
                                disabled={deleteTaskMutation.isPending}
                                className="font-orbitron text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30"
                            >
                                {deleteTaskMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                    <Trash2 className="w-3 h-3 mr-1" />
                                )}
                                Delete Task
                            </Button>
                            <span className="text-[10px] text-slate-500">This will permanently remove the task</span>
                        </div>
                    )}

                    {/* Tabs */}
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="notes">
                                Notes {visibleNotes.length > 0 && `(${visibleNotes.length})`}
                            </TabsTrigger>
                            <TabsTrigger value="files">
                                Files {files.length > 0 && `(${files.length})`}
                            </TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        {/* Details Tab */}
                        <TabsContent value="details" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Created</span>
                                    <p className="text-sm text-white flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(task.created_at)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Request Type</span>
                                    <p className="text-sm text-white capitalize">{task.request_type.replace(/_/g, ' ')}</p>
                                </div>
                                {task.assigned_manager && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500">Assigned Manager</span>
                                        <p className="text-sm text-white flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {task.assigned_manager}
                                        </p>
                                    </div>
                                )}
                                {task.qa_manager && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500">QA Manager</span>
                                        <p className="text-sm text-white flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {task.qa_manager}
                                        </p>
                                    </div>
                                )}
                                {task.revision_count > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500">Revisions</span>
                                        <p className="text-sm text-amber-400 flex items-center gap-1">
                                            <RotateCcw className="w-3 h-3" />
                                            {task.revision_count} revision{task.revision_count > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {task.description && (
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Description</span>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/30 rounded-lg p-3">
                                        {task.description}
                                    </p>
                                </div>
                            )}

                            {/* QA Feedback Section (for QA managers) */}
                            {(userRole === 'qa_manager' || userRole === 'admin') && (
                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">QA Feedback</span>
                                    <Textarea
                                        value={qaFeedback}
                                        onChange={(e) => setQaFeedback(e.target.value)}
                                        placeholder="Add QA feedback..."
                                        className="bg-slate-800/50 border-white/10 min-h-[80px]"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => saveQaFeedbackMutation.mutate()}
                                        disabled={saveQaFeedbackMutation.isPending}
                                        className="bg-purple-500 hover:bg-purple-600"
                                    >
                                        {saveQaFeedbackMutation.isPending ? (
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        ) : null}
                                        Save Feedback
                                    </Button>
                                </div>
                            )}

                            {/* Show QA feedback to others */}
                            {task.qa_feedback && userRole !== 'qa_manager' && userRole !== 'admin' && (
                                <div className="space-y-1 pt-4 border-t border-white/10">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">QA Feedback</span>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                                        {task.qa_feedback}
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Notes Tab */}
                        <TabsContent value="notes" className="space-y-4 mt-4">
                            <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                {visibleNotes.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">No notes yet</p>
                                ) : (
                                    visibleNotes.map(note => (
                                        <div
                                            key={note.id}
                                            className={cn(
                                                "p-3 rounded-lg border",
                                                note.is_internal
                                                    ? "bg-amber-500/5 border-amber-500/20"
                                                    : "bg-slate-800/30 border-white/5"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="w-4 h-4 text-slate-400" />
                                                    <span className="text-xs font-medium text-white">{note.user_name}</span>
                                                    <Badge className="text-[8px] bg-slate-700 text-slate-300">
                                                        {note.user_role}
                                                    </Badge>
                                                    {note.is_internal && (
                                                        <Badge className="text-[8px] bg-amber-500/20 text-amber-400">
                                                            Internal
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500">
                                                    {formatRelativeTime(note.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-300">{note.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Note Form */}
                            <div className="pt-4 border-t border-white/10 space-y-2">
                                <Textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note..."
                                    className="bg-slate-800/50 border-white/10 min-h-[60px]"
                                />
                                <div className="flex items-center justify-between">
                                    {userRole !== 'client' && (
                                        <label className="flex items-center gap-2 text-xs text-slate-400">
                                            <input
                                                type="checkbox"
                                                checked={isInternalNote}
                                                onChange={(e) => setIsInternalNote(e.target.checked)}
                                                className="rounded border-slate-600"
                                            />
                                            Internal note (hidden from client)
                                        </label>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => addNoteMutation.mutate()}
                                        disabled={!newNote.trim() || addNoteMutation.isPending}
                                        className="bg-orange-500 hover:bg-orange-600"
                                    >
                                        {addNoteMutation.isPending ? (
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        ) : (
                                            <Send className="w-3 h-3 mr-1" />
                                        )}
                                        Add Note
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Files Tab */}
                        <TabsContent value="files" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                {files.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">No files attached</p>
                                ) : (
                                    files.map(file => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <p className="text-sm text-white">{file.file_name}</p>
                                                    <p className="text-[10px] text-slate-500">
                                                        {file.uploaded_by} • {formatRelativeTime(file.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => window.open(file.file_url, '_blank')}
                                                >
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* File Upload Placeholder */}
                            <div className="pt-4 border-t border-white/10">
                                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center">
                                    <Paperclip className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">File upload coming soon</p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-4 mt-4">
                            <div className="space-y-3">
                                {statusHistory.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">No history yet</p>
                                ) : (
                                    statusHistory.map(entry => (
                                        <div
                                            key={entry.id}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-white/5"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    {entry.from_status ? (
                                                        <>
                                                            <Badge className={cn("text-[8px]", getStatusColor(entry.from_status))}>
                                                                {entry.from_status.replace(/_/g, ' ')}
                                                            </Badge>
                                                            <ChevronRight className="w-3 h-3 text-slate-500" />
                                                        </>
                                                    ) : null}
                                                    <Badge className={cn("text-[8px]", getStatusColor(entry.to_status))}>
                                                        {entry.to_status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    {entry.changed_by} • {formatDate(entry.created_at)}
                                                </p>
                                                {entry.notes && (
                                                    <p className="text-xs text-slate-400 mt-1">{entry.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailModal;
