import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Clock,
    CheckCircle2,
    Loader2,
    Play,
    MessageSquare,
    Circle,
    MoreVertical,
    Trash2,
    Search,
    Eye,
    AlertTriangle,
    Truck,
    RotateCcw,
    ChevronRight,
    Sparkles,
    Timer,
    ArrowRight,
    Plus,
    GripVertical,
    Pencil,
    X,
    Save,
    Shield,
    Package,
    Zap,
    Upload,
    Image as ImageIcon,
    Send,
} from 'lucide-react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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

interface TaskNote {
    id: string;
    task_id: string;
    user_name: string;
    user_role: string;
    user_avatar?: string;
    message: string;
    is_internal: boolean;
    created_at: string;
}

interface ClientRequestsTrackerProps {
    clientId: string;
    clientName: string;
    isAgencyView?: boolean;
    defaultView?: 'compact' | 'pipeline';
}

// Simple 3-column mapping for the board
// Note: ready_for_qa is legacy — any tasks with that status get treated as in_qa
const getSimpleStatus = (status: string): 'waiting' | 'working' | 'done' => {
    if (['pending'].includes(status)) return 'waiting';
    if (['in_progress', 'ready_for_qa', 'in_qa', 'qa_failed', 'qa_passed', 'delivered'].includes(status)) return 'working';
    return 'done';
};

// Map legacy ready_for_qa → in_qa for pipeline display
const normalizePipelineStatus = (status: string): string => {
    if (status === 'ready_for_qa') return 'in_qa';
    return status;
};

// Client-facing labels (simple)
const getClientStatusLabel = (status: string): string => {
    const simple = getSimpleStatus(status);
    if (simple === 'waiting') return 'In Queue';
    if (simple === 'working') return 'In Progress';
    return 'Completed';
};

const getTypeIcon = (type: string) => {
    const map: Record<string, { icon: typeof Sparkles; color: string }> = {
        bug_fix: { icon: AlertTriangle, color: 'text-red-400' },
        new_feature: { icon: Sparkles, color: 'text-purple-400' },
        design_change: { icon: Eye, color: 'text-pink-400' },
        content_update: { icon: MessageSquare, color: 'text-cyan-400' },
        adjustment: { icon: Timer, color: 'text-orange-400' },
        other: { icon: Circle, color: 'text-slate-400' },
    };
    return map[type] ?? map.other;
};

const priorityConfig: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
    low: { label: 'LOW', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: '' },
    normal: { label: 'NORMAL', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: '' },
    high: { label: 'HIGH', color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-orange-500/5 shadow-sm' },
    urgent: { label: 'URGENT', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/25', glow: 'shadow-red-500/10 shadow-md' },
};

const columnStatusMap: Record<string, string> = {
    waiting: 'pending',
    working: 'in_progress',
    done: 'completed',
};

const kanbanColumns = [
    {
        key: 'waiting' as const,
        title: 'Waiting',
        subtitle: 'Queued up',
        icon: Clock,
        accentColor: 'amber',
        headerColor: 'text-amber-400',
        borderColor: 'border-amber-500/20',
        bgGradient: 'from-amber-500/10 to-transparent',
        countBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        cardHover: 'hover:border-amber-500/40',
        emptyIcon: Clock,
    },
    {
        key: 'working' as const,
        title: 'In Progress',
        subtitle: 'Being worked on',
        icon: Play,
        accentColor: 'blue',
        headerColor: 'text-blue-400',
        borderColor: 'border-blue-500/20',
        bgGradient: 'from-blue-500/10 to-transparent',
        countBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        cardHover: 'hover:border-blue-500/40',
        emptyIcon: Play,
    },
    {
        key: 'done' as const,
        title: 'Completed',
        subtitle: 'All wrapped up',
        icon: CheckCircle2,
        accentColor: 'emerald',
        headerColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/20',
        bgGradient: 'from-emerald-500/10 to-transparent',
        countBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        cardHover: 'hover:border-emerald-500/40',
        emptyIcon: CheckCircle2,
    },
];

// ═══════════════════════════════════════════════════════
// INTERNAL PIPELINE STAGES (Agency View Only)
// The granular workflow that lives INSIDE the "In Progress" column
// ═══════════════════════════════════════════════════════
const pipelineStages = [
    { key: 'in_progress', label: 'Working', shortLabel: 'DEV', icon: Zap, color: 'blue', activeColor: 'text-blue-400', activeBg: 'bg-blue-500/15 border-blue-500/30', dotColor: 'bg-blue-400' },
    { key: 'in_qa', label: 'QA', shortLabel: 'QA', icon: Shield, color: 'amber', activeColor: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/30', dotColor: 'bg-amber-400' },
    { key: 'qa_passed', label: 'Approved', shortLabel: 'OK', icon: CheckCircle2, color: 'emerald', activeColor: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-500/30', dotColor: 'bg-emerald-400' },
    { key: 'delivered', label: 'Delivered', shortLabel: 'SHIP', icon: Package, color: 'cyan', activeColor: 'text-cyan-400', activeBg: 'bg-cyan-500/15 border-cyan-500/30', dotColor: 'bg-cyan-400' },
];

const getStageIndex = (status: string): number => {
    const normalized = normalizePipelineStatus(status);
    const idx = pipelineStages.findIndex(s => s.key === normalized);
    return idx >= 0 ? idx : 0;
};

const getNextStage = (status: string): string | null => {
    const idx = getStageIndex(normalizePipelineStatus(status));
    if (idx < pipelineStages.length - 1) return pipelineStages[idx + 1].key;
    return 'completed'; // After delivered → completed
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
    const [agencyNote, setAgencyNote] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState('normal');
    const [editType, setEditType] = useState('other');
    const [showAddForm, setShowAddForm] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState('normal');
    const [newType, setNewType] = useState('other');
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);
    // QA Feedback Modal state
    const [qaFailModalOpen, setQaFailModalOpen] = useState(false);
    const [qaFailRequestId, setQaFailRequestId] = useState<string | null>(null);
    const [qaFailRequestTitle, setQaFailRequestTitle] = useState('');
    const [qaFeedbackText, setQaFeedbackText] = useState('');
    const [qaScreenshots, setQaScreenshots] = useState<string[]>([]);
    const [qaUploading, setQaUploading] = useState(false);
    const [qaAiLoading, setQaAiLoading] = useState(false);
    const [qaAiSuggestion, setQaAiSuggestion] = useState<string | null>(null);
    const [qaDragActive, setQaDragActive] = useState(false);
    const qaFileInputRef = useRef<HTMLInputElement>(null);
    // Activity feed / notes state
    const [taskNotes, setTaskNotes] = useState<Record<string, TaskNote[]>>({});
    const [notesLoading, setNotesLoading] = useState<string | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { profile, user } = useAuth();

    // Get display name and avatar from the logged-in user's profile
    const currentUserName = profile?.full_name || user?.email?.split('@')[0] || 'Team Member';
    const currentUserAvatar = profile?.avatar_url || '';

    const fetchRequests = async () => {
        try {
            const { data, error } = await (supabase as any)
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

    const fetchTaskNotes = async (taskId: string) => {
        setNotesLoading(taskId);
        try {
            const { data, error } = await (supabase as any)
                .from('task_notes')
                .select('*')
                .eq('task_id', taskId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTaskNotes(prev => ({ ...prev, [taskId]: (data || []) as TaskNote[] }));
        } catch (error) {
            console.error('Error fetching task notes:', error);
        } finally {
            setNotesLoading(null);
        }
    };

    const handleExpandCard = (requestId: string) => {
        if (expandedId === requestId) {
            setExpandedId(null);
        } else {
            setExpandedId(requestId);
            // Fetch notes when expanding (if agency view)
            if (isAgencyView) {
                fetchTaskNotes(requestId);
            }
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
            if (newStatus === 'in_progress') updates.started_at = new Date().toISOString();
            if (newStatus === 'in_qa') updates.qa_started_at = new Date().toISOString();
            if (newStatus === 'qa_passed' || newStatus === 'qa_failed') updates.qa_completed_at = new Date().toISOString();
            if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();
            if (newStatus === 'completed') updates.completed_at = new Date().toISOString();

            const { error } = await (supabase as any)
                .from('client_requests')
                .update(updates)
                .eq('id', requestId);

            if (error) throw error;

            const stageLabel = pipelineStages.find(s => s.key === newStatus)?.label || newStatus;
            toast({ title: 'Updated', description: `Task → ${stageLabel}` });
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
        }
    };

    const addNote = async (requestId: string) => {
        if (!agencyNote.trim()) return;
        try {
            const { error } = await (supabase as any)
                .from('task_notes')
                .insert({
                    task_id: requestId,
                    user_name: currentUserName,
                    user_role: 'manager',
                    user_avatar: currentUserAvatar,
                    message: agencyNote,
                    is_internal: false
                });

            if (error) throw error;
            toast({ title: 'Note Added' });
            setAgencyNote('');
            invalidateAllQueries();
            fetchRequests();
            fetchTaskNotes(requestId);
        } catch (error) {
            try {
                const request = requests.find(r => r.id === requestId);
                const existingNotes = request?.agency_notes || '';
                const timestamp = new Date().toLocaleString();
                const newNote = existingNotes
                    ? `${existingNotes}\n\n[${timestamp}]\n${agencyNote}`
                    : `[${timestamp}]\n${agencyNote}`;

                const { error: updateError } = await (supabase as any)
                    .from('client_requests')
                    .update({ agency_notes: newNote })
                    .eq('id', requestId);

                if (updateError) throw updateError;
                toast({ title: 'Note Added' });
                setAgencyNote('');
                fetchRequests();
                fetchTaskNotes(requestId);
            } catch (fallbackError) {
                toast({ title: 'Error', description: 'Failed to add note', variant: 'destructive' });
            }
        }
    };

    const deleteRequest = async (requestId: string) => {
        try {
            const { error } = await (supabase as any)
                .from('client_requests')
                .delete()
                .eq('id', requestId);

            if (error) throw error;
            toast({ title: 'Request Deleted' });
            setExpandedId(null);
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    // ═══════════════════════════════════════════════════════
    // QA FAILURE MODAL FUNCTIONS
    // ═══════════════════════════════════════════════════════
    const openQaFailModal = (requestId: string, title: string) => {
        setQaFailRequestId(requestId);
        setQaFailRequestTitle(title);
        setQaFeedbackText('');
        setQaScreenshots([]);
        setQaAiSuggestion(null);
        setQaFailModalOpen(true);
    };

    const closeQaFailModal = () => {
        setQaFailModalOpen(false);
        setQaFailRequestId(null);
        setQaFailRequestTitle('');
        setQaFeedbackText('');
        setQaScreenshots([]);
        setQaAiSuggestion(null);
        setQaUploading(false);
        setQaAiLoading(false);
    };

    const uploadQaScreenshot = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `qa-feedback/${qaFailRequestId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error } = await supabase.storage
                .from('website-submissions-files')
                .upload(fileName, file, { contentType: file.type });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('website-submissions-files')
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    };

    const handleQaFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setQaUploading(true);

        const newUrls: string[] = [];
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) {
                toast({ title: 'Error', description: `${file.name} is not an image`, variant: 'destructive' });
                continue;
            }
            const url = await uploadQaScreenshot(file);
            if (url) newUrls.push(url);
        }

        setQaScreenshots(prev => [...prev, ...newUrls]);
        setQaUploading(false);
        if (newUrls.length > 0) {
            toast({ title: `${newUrls.length} screenshot${newUrls.length > 1 ? 's' : ''} uploaded` });
        }
    };

    const handleQaDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQaDragActive(true);
    }, []);

    const handleQaDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQaDragActive(false);
    }, []);

    const handleQaDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQaDragActive(false);
        handleQaFileUpload(e.dataTransfer.files);
    }, [qaFailRequestId]);

    const removeQaScreenshot = (idx: number) => {
        setQaScreenshots(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAiImprove = async () => {
        if (!qaFeedbackText.trim()) return;
        setQaAiLoading(true);
        setQaAiSuggestion(null);

        try {
            const { data, error } = await supabase.functions.invoke('improve-text', {
                body: {
                    text: qaFeedbackText,
                    context: 'QA feedback for a task that failed quality assurance. Make the feedback clear, professional, and actionable for the developer. Keep it concise.',
                },
            });

            if (error) throw error;
            if (data?.improvedText) {
                setQaAiSuggestion(data.improvedText);
            }
        } catch (error) {
            console.error('AI improve failed:', error);
            toast({ title: 'Ava unavailable', description: 'Could not improve text right now', variant: 'destructive' });
        } finally {
            setQaAiLoading(false);
        }
    };

    const acceptAiSuggestion = () => {
        if (qaAiSuggestion) {
            setQaFeedbackText(qaAiSuggestion);
            setQaAiSuggestion(null);
        }
    };

    const submitQaFail = async () => {
        if (!qaFailRequestId || !qaFeedbackText.trim()) return;

        try {
            // 1. Update status to qa_failed with revision count increment
            const request = requests.find(r => r.id === qaFailRequestId);
            const currentRevCount = request?.revision_count || 0;

            const { error: statusError } = await (supabase as any)
                .from('client_requests')
                .update({
                    status: 'qa_failed',
                    qa_completed_at: new Date().toISOString(),
                    revision_count: currentRevCount + 1,
                })
                .eq('id', qaFailRequestId);

            if (statusError) throw statusError;

            // 2. Save feedback as a note with screenshot links
            let fullNote = `🔴 QA FAILED (Rev ${currentRevCount + 1})\n\n${qaFeedbackText}`;
            if (qaScreenshots.length > 0) {
                fullNote += `\n\n📸 Screenshots:\n${qaScreenshots.map((url, i) => `  ${i + 1}. ${url}`).join('\n')}`;
            }

            // Try task_notes first, fallback to agency_notes
            try {
                const { error: noteError } = await (supabase as any)
                    .from('task_notes')
                    .insert({
                        task_id: qaFailRequestId,
                        user_name: currentUserName,
                        user_role: 'manager',
                        user_avatar: currentUserAvatar,
                        message: fullNote,
                        is_internal: false,
                    });

                if (noteError) throw noteError;
            } catch {
                // Fallback: append to agency_notes
                const existingNotes = request?.agency_notes || '';
                const timestamp = new Date().toLocaleString();
                const appendedNote = existingNotes
                    ? `${existingNotes}\n\n[${timestamp}]\n${fullNote}`
                    : `[${timestamp}]\n${fullNote}`;

                await (supabase as any)
                    .from('client_requests')
                    .update({ agency_notes: appendedNote })
                    .eq('id', qaFailRequestId);
            }

            toast({ title: 'QA Failed', description: 'Feedback saved — sending back to dev' });

            // 3. Move back to in_progress
            await (supabase as any)
                .from('client_requests')
                .update({
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                })
                .eq('id', qaFailRequestId);

            invalidateAllQueries();
            fetchRequests();
            // Refresh notes for this task so the activity feed shows the new QA feedback
            if (qaFailRequestId) fetchTaskNotes(qaFailRequestId);
            closeQaFailModal();
        } catch (error) {
            console.error('QA fail error:', error);
            toast({ title: 'Error', description: 'Failed to process QA feedback', variant: 'destructive' });
        }
    };

    const createTask = async (columnKey: string) => {
        if (!newTitle.trim()) return;
        try {
            const taskId = `TSK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const status = columnStatusMap[columnKey] || 'pending';

            const { error } = await (supabase as any)
                .from('client_requests')
                .insert({
                    client_id: clientId,
                    task_id: taskId,
                    title: newTitle.trim(),
                    description: newDescription.trim(),
                    priority: newPriority,
                    request_type: newType,
                    status,
                });

            if (error) throw error;
            toast({ title: 'Task Created', description: `${newTitle} added` });
            setNewTitle('');
            setNewDescription('');
            setNewPriority('normal');
            setNewType('other');
            setShowAddForm(null);
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            console.error('Error creating task:', error);
            toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
        }
    };

    const updateTask = async (requestId: string) => {
        try {
            const { error } = await (supabase as any)
                .from('client_requests')
                .update({
                    title: editTitle.trim(),
                    description: editDescription.trim(),
                    priority: editPriority,
                    request_type: editType,
                })
                .eq('id', requestId);

            if (error) throw error;
            toast({ title: 'Task Updated' });
            setEditingId(null);
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
        }
    };

    const startEditing = (request: ClientRequest) => {
        setEditingId(request.id);
        setEditTitle(request.title);
        setEditDescription(request.description || '');
        setEditPriority(request.priority);
        setEditType(request.request_type);
        setExpandedId(null);
    };

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

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, requestId: string) => {
        setDraggedId(requestId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', requestId);
        if (e.currentTarget instanceof HTMLElement) {
            setTimeout(() => {
                e.currentTarget.style.opacity = '0.4';
            }, 0);
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedId(null);
        setDragOverCol(null);
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    const handleDragOver = (e: React.DragEvent, colKey: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverCol(colKey);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const { clientX, clientY } = e;
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            setDragOverCol(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, colKey: string) => {
        e.preventDefault();
        setDragOverCol(null);
        const requestId = e.dataTransfer.getData('text/plain');
        if (!requestId) return;

        const newStatus = columnStatusMap[colKey];
        if (!newStatus) return;

        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const currentCol = getSimpleStatus(request.status);
        if (currentCol === colKey) return;

        await updateStatus(requestId, newStatus);
        setDraggedId(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-cyan-400 animate-spin" />
                </div>
                <span className="text-xs text-slate-500 font-orbitron">Loading requests...</span>
            </div>
        );
    }

    const tasksByColumn = {
        waiting: requests.filter(r => getSimpleStatus(r.status) === 'waiting'),
        working: requests.filter(r => getSimpleStatus(r.status) === 'working'),
        done: requests.filter(r => getSimpleStatus(r.status) === 'done'),
    };

    // ═══════════════════════════════════════════════════════
    // INTERNAL PIPELINE TRACKER (rendered inside expanded agency cards)
    // Shows the granular sub-stages: Working → Review → QA → Approved → Delivered
    // ═══════════════════════════════════════════════════════
    const renderPipelineTracker = (request: ClientRequest) => {
        const currentIdx = getStageIndex(request.status);
        const isQaFailed = request.status === 'qa_failed';

        return (
            <div className="space-y-3">
                {/* Pipeline progress bar */}
                <div className="relative">
                    {/* Label */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-orbitron text-slate-500 tracking-widest uppercase">Internal Pipeline</span>
                        {isQaFailed && (
                            <span className="text-[9px] font-orbitron text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" /> QA Failed — Needs Revision
                            </span>
                        )}
                        {request.revision_count > 0 && !isQaFailed && (
                            <span className="text-[9px] font-orbitron text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                Rev {request.revision_count}
                            </span>
                        )}
                    </div>

                    {/* Stage dots + connecting line */}
                    <div className="relative flex items-center justify-between px-1">
                        {/* Background line */}
                        <div className="absolute top-1/2 left-1 right-1 h-[2px] -translate-y-1/2 bg-white/[0.06] rounded-full" />
                        {/* Progress line */}
                        <div
                            className="absolute top-1/2 left-1 h-[2px] -translate-y-1/2 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                            style={{ width: `${(currentIdx / (pipelineStages.length - 1)) * 100}%` }}
                        />

                        {pipelineStages.map((stage, idx) => {
                            const StageIcon = stage.icon;
                            const isActive = stage.key === normalizePipelineStatus(request.status) || (isQaFailed && stage.key === 'in_qa');
                            const isCompleted = idx < currentIdx || (isQaFailed && idx < getStageIndex('in_qa'));
                            const isFuture = idx > currentIdx && !(isQaFailed && idx <= getStageIndex('in_qa'));

                            return (
                                <div key={stage.key} className="relative flex flex-col items-center z-10">
                                    {/* Stage dot/icon */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isAgencyView && !isFuture) {
                                                updateStatus(request.id, stage.key);
                                            }
                                        }}
                                        disabled={isFuture || !isAgencyView}
                                        className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300",
                                            isActive && cn(stage.activeBg, "shadow-lg"),
                                            isActive && isQaFailed && "bg-red-500/15 border-red-500/30",
                                            isCompleted && "bg-white/[0.08] border-white/[0.15]",
                                            isFuture && "bg-black/20 border-white/[0.06]",
                                            !isFuture && isAgencyView && "cursor-pointer hover:scale-110",
                                            isFuture && "cursor-default",
                                        )}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400/80" />
                                        ) : (
                                            <StageIcon className={cn(
                                                "w-3 h-3",
                                                isActive && stage.activeColor,
                                                isActive && isQaFailed && "text-red-400",
                                                isFuture && "text-white/15",
                                            )} />
                                        )}
                                    </button>
                                    {/* Label */}
                                    <span className={cn(
                                        "text-[7px] font-orbitron tracking-wider mt-1.5 transition-colors",
                                        isActive && stage.activeColor,
                                        isActive && isQaFailed && "text-red-400",
                                        isCompleted && "text-white/40",
                                        isFuture && "text-white/15",
                                    )}>
                                        {stage.shortLabel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Advance button — shows the next logical action */}
                {isAgencyView && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* QA Failed → send back to working */}
                        {isQaFailed && (
                            <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')}
                                className="text-[10px] h-7 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 font-orbitron">
                                <RotateCcw className="w-3 h-3 mr-1" /> Send Back to Dev
                            </Button>
                        )}

                        {/* Normal next-step advancement */}
                        {!isQaFailed && getSimpleStatus(request.status) === 'working' && (
                            <>
                                {getNextStage(request.status) && getNextStage(request.status) !== 'completed' && (
                                    <Button size="sm" onClick={() => updateStatus(request.id, getNextStage(request.status)!)}
                                        className={cn(
                                            "text-[10px] h-7 px-2.5 rounded-lg font-orbitron",
                                            (() => {
                                                const next = pipelineStages.find(s => s.key === getNextStage(request.status));
                                                return next ? `bg-${next.color}-500/10 hover:bg-${next.color}-500/20 text-${next.color}-300 border border-${next.color}-500/20` : '';
                                            })()
                                        )}>
                                        <ArrowRight className="w-3 h-3 mr-1" />
                                        {pipelineStages.find(s => s.key === getNextStage(request.status))?.label || 'Next'}
                                    </Button>
                                )}
                                {getNextStage(request.status) === 'completed' && (
                                    <Button size="sm" onClick={() => updateStatus(request.id, 'completed')}
                                        className="text-[10px] h-7 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 font-orbitron">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                                    </Button>
                                )}

                                {/* QA stage has special fail option */}
                                {request.status === 'in_qa' && (
                                    <Button size="sm" onClick={() => openQaFailModal(request.id, request.title)}
                                        className="text-[10px] h-7 px-2.5 rounded-lg bg-white/[0.03] hover:bg-red-500/10 text-slate-400 hover:text-red-300 border border-white/[0.08] hover:border-red-500/20 font-orbitron">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Fail QA
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderEditForm = (request: ClientRequest) => (
        <div className="p-3 space-y-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
            <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
                className="bg-black/30 border-white/10 text-sm font-medium focus:border-cyan-500/50 h-9"
            />
            <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description..."
                className="bg-black/30 border-white/10 text-sm min-h-[60px] resize-none focus:border-cyan-500/50"
            />
            <div className="flex gap-2">
                <Select value={editPriority} onValueChange={setEditPriority}>
                    <SelectTrigger className="bg-black/30 border-white/10 text-xs h-8 w-[110px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={editType} onValueChange={setEditType}>
                    <SelectTrigger className="bg-black/30 border-white/10 text-xs h-8 flex-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="bug_fix">Bug Fix</SelectItem>
                        <SelectItem value="new_feature">New Feature</SelectItem>
                        <SelectItem value="design_change">Design Change</SelectItem>
                        <SelectItem value="content_update">Content Update</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button size="sm" onClick={() => updateTask(request.id)}
                    className="flex-1 h-8 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">
                    <Save className="w-3 h-3 mr-1.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                    className="h-8 text-xs text-slate-400 hover:text-white hover:bg-white/5">
                    <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
            </div>
        </div>
    );

    const renderCard = (request: ClientRequest, col: typeof kanbanColumns[0]) => {
        const priority = priorityConfig[request.priority] || priorityConfig.normal;
        const simpleStatus = getSimpleStatus(request.status);
        const isExpanded = expandedId === request.id;
        const isEditing = editingId === request.id;
        const typeInfo = getTypeIcon(request.request_type);
        const TypeIcon = typeInfo.icon;
        const isQaFailed = request.status === 'qa_failed';

        if (isEditing) {
            return <div key={request.id}>{renderEditForm(request)}</div>;
        }

        return (
            <div
                key={request.id}
                draggable={isAgencyView}
                onDragStart={(e) => isAgencyView && handleDragStart(e, request.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                    "group rounded-xl backdrop-blur-sm transition-all duration-200",
                    isAgencyView && "cursor-grab active:cursor-grabbing",
                    !isAgencyView && "cursor-pointer",
                    "bg-black/20 border border-white/[0.08]",
                    col.cardHover,
                    isExpanded && "ring-1 ring-cyan-500/20 border-cyan-500/30",
                    !isExpanded && "hover:translate-y-[-1px] hover:shadow-lg",
                    draggedId === request.id && "opacity-40 scale-95",
                    isQaFailed && isAgencyView && "border-red-500/20 ring-1 ring-red-500/10",
                    priority.glow
                )}
            >
                <div
                    onClick={() => handleExpandCard(request.id)}
                    className="w-full text-left p-3 cursor-pointer"
                >
                    {/* Top: drag handle + type icon + task ID + priority */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {isAgencyView && (
                                <GripVertical className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            )}
                            <div className={cn("w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center", typeInfo.color)}>
                                <TypeIcon className="w-3 h-3" />
                            </div>
                            {request.task_id && (
                                <span className="text-[9px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded font-orbitron">
                                    {request.task_id}
                                </span>
                            )}
                        </div>
                        <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider font-orbitron",
                            priority.bg, priority.color, priority.border
                        )}>
                            {priority.label}
                        </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-semibold text-xs text-white/90 leading-snug mb-1 line-clamp-2 group-hover:text-white transition-colors">
                        {request.title}
                    </h4>

                    {/* Description */}
                    {request.description && !isExpanded && (
                        <p className="text-[10px] text-slate-400/80 line-clamp-2 mb-2 leading-relaxed">
                            {request.description}
                        </p>
                    )}

                    {/* Bottom: date + status indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(request.created_at)}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {/* Agency: show granular stage label for in-progress tasks */}
                            {isAgencyView && simpleStatus === 'working' && (
                                <span className={cn(
                                    "text-[8px] font-orbitron px-1.5 py-0.5 rounded-full border",
                                    isQaFailed
                                        ? "bg-red-500/10 text-red-300 border-red-500/20"
                                        : (() => {
                                            const stage = pipelineStages.find(s => s.key === normalizePipelineStatus(request.status));
                                            return stage ? `bg-${stage.color}-500/10 text-${stage.color}-300 border-${stage.color}-500/20` : 'bg-blue-500/10 text-blue-300 border-blue-500/20';
                                        })()
                                )}>
                                    {isQaFailed ? 'QA FAILED' : (pipelineStages.find(s => s.key === normalizePipelineStatus(request.status))?.shortLabel || 'DEV')}
                                </span>
                            )}
                            {/* Client: show simple label */}
                            {!isAgencyView && simpleStatus === 'working' && (
                                <span className="text-[8px] font-orbitron bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded-full">
                                    In Progress
                                </span>
                            )}
                            {request.revision_count > 0 && (
                                <span className="text-[8px] text-amber-400/80 font-orbitron bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                                    Rev {request.revision_count}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* EXPANDED PANEL — Different for Agency vs Client */}
                {/* ═══════════════════════════════════════════════════════ */}
                {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-white/[0.06]">
                        <div className="pt-2" />

                        {/* Full description */}
                        {request.description && (
                            <p className="text-[10px] text-slate-400/80 leading-relaxed">{request.description}</p>
                        )}

                        {/* ──── AGENCY VIEW: Full pipeline + controls ──── */}
                        {isAgencyView && (
                            <>
                                {/* Internal pipeline tracker (only for in-progress tasks) */}
                                {simpleStatus === 'working' && renderPipelineTracker(request)}

                                {/* ──── ACTIVITY FEED / ADJUSTMENTS TIMELINE ──── */}
                                {(() => {
                                    const notes = taskNotes[request.id] || [];
                                    const isLoadingNotes = notesLoading === request.id;

                                    if (isLoadingNotes) {
                                        return (
                                            <div className="flex items-center gap-2 py-3">
                                                <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                                                <span className="text-[9px] text-slate-500 font-orbitron">Loading activity...</span>
                                            </div>
                                        );
                                    }

                                    if (notes.length === 0) return null;

                                    return (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-orbitron text-slate-500 tracking-widest uppercase">Activity</span>
                                                <div className="flex-1 h-px bg-white/[0.04]" />
                                                <span className="text-[8px] text-slate-600 font-orbitron">{notes.length}</span>
                                            </div>

                                            <div className="max-h-[200px] overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
                                                {notes.map((note) => {
                                                    const isQaFeedback = note.message.startsWith('🔴 QA FAILED');
                                                    // Parse screenshots from the note message
                                                    const screenshotUrls: string[] = [];
                                                    const msgLines = note.message.split('\n');
                                                    let cleanMsg = '';
                                                    let inScreenshots = false;
                                                    for (const line of msgLines) {
                                                        if (line.includes('📸 Screenshots:')) {
                                                            inScreenshots = true;
                                                            continue;
                                                        }
                                                        if (inScreenshots) {
                                                            const urlMatch = line.match(/https?:\/\/\S+/);
                                                            if (urlMatch) screenshotUrls.push(urlMatch[0]);
                                                        } else {
                                                            cleanMsg += (cleanMsg ? '\n' : '') + line;
                                                        }
                                                    }

                                                    return (
                                                        <div key={note.id} className={cn(
                                                            "rounded-lg p-2.5 border transition-colors",
                                                            isQaFeedback
                                                                ? "bg-red-500/5 border-red-500/10"
                                                                : "bg-white/[0.02] border-white/[0.04]"
                                                        )}>
                                                            {/* Header: who + when */}
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    {/* User avatar */}
                                                                    {note.user_avatar ? (
                                                                        <img
                                                                            src={note.user_avatar}
                                                                            alt={note.user_name}
                                                                            className="w-4 h-4 rounded-full object-cover border border-white/10"
                                                                        />
                                                                    ) : (
                                                                        <div className={cn(
                                                                            "w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold border",
                                                                            isQaFeedback
                                                                                ? "bg-red-500/20 border-red-500/30 text-red-300"
                                                                                : "bg-cyan-500/15 border-cyan-500/20 text-cyan-300"
                                                                        )}>
                                                                            {note.user_name?.charAt(0)?.toUpperCase() || '?'}
                                                                        </div>
                                                                    )}
                                                                    {isQaFeedback && (
                                                                        <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                                                                    )}
                                                                    <span className={cn(
                                                                        "text-[9px] font-orbitron tracking-wider",
                                                                        isQaFeedback ? "text-red-400" : "text-slate-400"
                                                                    )}>
                                                                        {note.user_name}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[8px] text-slate-600">
                                                                    {formatDate(note.created_at)}
                                                                </span>
                                                            </div>

                                                            {/* Message body */}
                                                            <p className={cn(
                                                                "text-[10px] leading-relaxed whitespace-pre-wrap",
                                                                isQaFeedback ? "text-white/60" : "text-white/50"
                                                            )}>
                                                                {cleanMsg.replace('🔴 QA FAILED', '').replace(/^\(Rev \d+\)\s*\n*/, '').trim() || cleanMsg}
                                                            </p>

                                                            {/* Screenshots */}
                                                            {screenshotUrls.length > 0 && (
                                                                <div className="grid grid-cols-3 gap-1.5 mt-2">
                                                                    {screenshotUrls.map((url, idx) => (
                                                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                                                                            className="block rounded-md overflow-hidden border border-white/[0.06] hover:border-white/[0.15] transition-colors">
                                                                            <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-14 object-cover" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Notes input */}
                                {simpleStatus !== 'done' && (
                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="Add a note..."
                                            value={agencyNote}
                                            onChange={(e) => setAgencyNote(e.target.value)}
                                            className="text-xs min-h-[50px] bg-black/30 border-white/[0.08] resize-none rounded-lg placeholder:text-slate-600 focus:border-cyan-500/30"
                                        />
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {agencyNote.trim() && (
                                        <Button size="sm" variant="outline" onClick={() => addNote(request.id)}
                                            className="text-[10px] h-7 px-2.5 rounded-lg bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] font-orbitron">
                                            <MessageSquare className="w-3 h-3 mr-1" /> Note
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline" onClick={() => startEditing(request)}
                                        className="text-[10px] h-7 px-2.5 rounded-lg bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] font-orbitron">
                                        <Pencil className="w-3 h-3 mr-1" /> Edit
                                    </Button>

                                    {/* Start (waiting → working) */}
                                    {request.status === 'pending' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')}
                                            className="text-[10px] h-7 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 font-orbitron">
                                            <Play className="w-3 h-3 mr-1" /> Start
                                        </Button>
                                    )}

                                    {/* Reopen (done → waiting) */}
                                    {simpleStatus === 'done' && (
                                        <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, 'pending')}
                                            className="text-[10px] h-7 px-2.5 rounded-lg bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] font-orbitron">
                                            <RotateCcw className="w-3 h-3 mr-1" /> Reopen
                                        </Button>
                                    )}

                                    {/* More menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg hover:bg-white/[0.06]">
                                                <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900/95 backdrop-blur-sm border-white/10">
                                            <DropdownMenuItem onClick={() => updateStatus(request.id, 'pending')}
                                                className="text-xs text-slate-300 focus:text-white focus:bg-white/[0.06]">
                                                <Circle className="w-3.5 h-3.5 mr-2 text-slate-400" /> Move to Waiting
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(request.id, 'in_progress')}
                                                className="text-xs text-slate-300 focus:text-white focus:bg-white/[0.06]">
                                                <Play className="w-3.5 h-3.5 mr-2 text-blue-400" /> Move to In Progress
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(request.id, 'completed')}
                                                className="text-xs text-slate-300 focus:text-white focus:bg-white/[0.06]">
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Mark Complete
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/5" />
                                            <DropdownMenuItem onClick={() => deleteRequest(request.id)}
                                                className="text-xs text-slate-400 focus:text-red-300 focus:bg-white/[0.04]">
                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </>
                        )}

                        {/* ──── CLIENT VIEW: Simple read-only ──── */}
                        {!isAgencyView && (
                            <div className="space-y-2">
                                {/* Simple status display */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        simpleStatus === 'waiting' && "bg-amber-400",
                                        simpleStatus === 'working' && "bg-blue-400 animate-pulse",
                                        simpleStatus === 'done' && "bg-emerald-400",
                                    )} />
                                    <span className="text-[10px] font-orbitron text-white/60 tracking-wider">
                                        {getClientStatusLabel(request.status)}
                                    </span>
                                    {request.started_at && simpleStatus === 'working' && (
                                        <span className="text-[9px] text-slate-500 ml-auto">
                                            Started {formatDate(request.started_at)}
                                        </span>
                                    )}
                                    {request.completed_at && simpleStatus === 'done' && (
                                        <span className="text-[9px] text-slate-500 ml-auto">
                                            Completed {formatDate(request.completed_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderAddForm = (colKey: string) => (
        <div className="p-3 space-y-2 bg-cyan-500/5 rounded-xl border border-cyan-500/20 border-dashed">
            <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title..."
                className="bg-black/30 border-white/10 text-sm font-medium focus:border-cyan-500/50 h-8"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter' && newTitle.trim()) createTask(colKey); }}
            />
            <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="bg-black/30 border-white/10 text-xs min-h-[50px] resize-none focus:border-cyan-500/50"
            />
            <div className="flex gap-2">
                <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger className="bg-black/30 border-white/10 text-[10px] h-7 w-[100px] font-orbitron">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="bg-black/30 border-white/10 text-[10px] h-7 flex-1 font-orbitron">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="bug_fix">Bug Fix</SelectItem>
                        <SelectItem value="new_feature">Feature</SelectItem>
                        <SelectItem value="design_change">Design</SelectItem>
                        <SelectItem value="content_update">Content</SelectItem>
                        <SelectItem value="adjustment">Adjust</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button size="sm" onClick={() => createTask(colKey)} disabled={!newTitle.trim()}
                    className="flex-1 h-7 text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-orbitron">
                    <Plus className="w-3 h-3 mr-1" /> Add Task
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(null); setNewTitle(''); setNewDescription(''); }}
                    className="h-7 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 font-orbitron">
                    Cancel
                </Button>
            </div>
        </div>
    );

    return (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-h-[350px]">
            {kanbanColumns.map((col) => {
                const ColIcon = col.icon;
                const colTasks = tasksByColumn[col.key];
                const EmptyIcon = col.emptyIcon;
                const isDragOver = dragOverCol === col.key;

                return (
                    <div
                        key={col.key}
                        onDragOver={(e) => handleDragOver(e, col.key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col.key)}
                        className={cn(
                            "rounded-xl border overflow-hidden flex flex-col transition-all duration-200",
                            "bg-black/20 backdrop-blur-sm",
                            col.borderColor,
                            isDragOver && "ring-2 ring-cyan-500/30 border-cyan-500/40 bg-cyan-500/5 scale-[1.01]"
                        )}
                    >
                        {/* Column header */}
                        <div className={cn("relative px-4 py-3 border-b border-white/[0.06]")}>
                            <div className={cn("absolute inset-0 bg-gradient-to-b opacity-50", col.bgGradient)} />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center",
                                        `bg-${col.accentColor}-500/15 border border-${col.accentColor}-500/20`
                                    )}>
                                        <ColIcon className={cn("w-3.5 h-3.5", col.headerColor)} />
                                    </div>
                                    <div>
                                        <h3 className={cn("text-xs font-bold tracking-tight font-orbitron", col.headerColor)}>
                                            {col.title}
                                        </h3>
                                        <p className="text-[9px] text-slate-500 font-orbitron">{col.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-bold min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-orbitron",
                                        col.countBg
                                    )}>
                                        {colTasks.length}
                                    </span>
                                    {isAgencyView && (
                                        <button
                                            onClick={() => {
                                                setShowAddForm(showAddForm === col.key ? null : col.key);
                                                setNewTitle('');
                                                setNewDescription('');
                                            }}
                                            className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                                "bg-white/[0.04] border border-white/[0.08] hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400",
                                                showAddForm === col.key && "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                            )}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cards area */}
                        <div className={cn(
                            "flex-1 p-2.5 space-y-2.5 overflow-y-auto scrollbar-thin",
                            "max-h-[500px] sm:max-h-[550px]",
                            isDragOver && "bg-cyan-500/5"
                        )}>
                            {showAddForm === col.key && renderAddForm(col.key)}

                            {colTasks.length === 0 && showAddForm !== col.key ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                        <EmptyIcon className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-orbitron">No tasks here</p>
                                    <p className="text-[9px] text-slate-600">
                                        {isAgencyView ? 'Drag tasks here or add new' : 'No tasks in this column'}
                                    </p>
                                </div>
                            ) : (
                                colTasks.map((request) => renderCard(request, col))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* QA FAILURE FEEDBACK MODAL */}
        {/* ═══════════════════════════════════════════════════════ */}
        <Dialog open={qaFailModalOpen} onOpenChange={(open) => { if (!open) closeQaFailModal(); }}>
            <DialogContent className="max-w-lg bg-slate-950/95 backdrop-blur-xl border-red-500/20 shadow-2xl shadow-red-500/5">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-sm font-orbitron">
                        <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div>
                            <span className="text-red-400">QA Failed</span>
                            <p className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">{qaFailRequestTitle}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Feedback text */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-orbitron text-slate-400 tracking-wider uppercase">What went wrong?</label>
                        <Textarea
                            value={qaFeedbackText}
                            onChange={(e) => setQaFeedbackText(e.target.value)}
                            placeholder="Describe the issues found during QA... be specific about what needs to be fixed."
                            className="min-h-[100px] bg-black/40 border-white/[0.08] text-sm resize-none rounded-xl placeholder:text-slate-600 focus:border-red-500/30"
                        />

                        {/* AI Improve button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleAiImprove}
                                disabled={qaAiLoading || !qaFeedbackText.trim()}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-orbitron tracking-wide transition-all",
                                    "bg-purple-500/8 border border-purple-500/15 text-purple-400/70",
                                    "hover:bg-purple-500/15 hover:text-purple-300 hover:border-purple-500/30",
                                    "disabled:opacity-30 disabled:cursor-not-allowed"
                                )}
                            >
                                <Sparkles className={cn("w-3 h-3", qaAiLoading && "animate-spin")} />
                                {qaAiLoading ? 'Ava is improving...' : 'Ask Ava to improve'}
                            </button>
                        </div>

                        {/* AI Suggestion */}
                        {qaAiSuggestion && !qaAiLoading && (
                            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                    <span className="text-[10px] font-orbitron text-purple-300 tracking-wider">Ava's Suggestion</span>
                                </div>
                                <p className="text-xs text-white/70 whitespace-pre-wrap bg-black/20 rounded-lg p-2.5 border border-white/[0.05]">
                                    {qaAiSuggestion}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button onClick={acceptAiSuggestion}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-orbitron bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all">
                                        <CheckCircle2 className="w-3 h-3" /> Use This
                                    </button>
                                    <button onClick={() => setQaAiSuggestion(null)}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-orbitron text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all">
                                        <X className="w-3 h-3" /> Dismiss
                                    </button>
                                </div>
                            </div>
                        )}

                        {qaAiLoading && (
                            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                                    <span className="text-[10px] font-orbitron text-purple-300 tracking-wider">Ava is thinking...</span>
                                </div>
                                <div className="space-y-1.5 mt-2">
                                    <div className="h-3 bg-purple-500/10 rounded w-3/4" />
                                    <div className="h-3 bg-purple-500/10 rounded w-1/2" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Screenshot upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-orbitron text-slate-400 tracking-wider uppercase">Screenshots</label>

                        {/* Drop zone */}
                        <div
                            onDragOver={handleQaDragOver}
                            onDragLeave={handleQaDragLeave}
                            onDrop={handleQaDrop}
                            onClick={() => qaFileInputRef.current?.click()}
                            className={cn(
                                "relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all",
                                qaDragActive
                                    ? "border-cyan-500/40 bg-cyan-500/5"
                                    : "border-white/[0.08] bg-black/20 hover:border-white/[0.15] hover:bg-white/[0.02]"
                            )}
                        >
                            <input
                                ref={qaFileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleQaFileUpload(e.target.files)}
                            />
                            {qaUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                    <span className="text-[10px] text-slate-400 font-orbitron">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                        <Upload className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-orbitron">
                                        {qaDragActive ? 'Drop screenshots here' : 'Drag & drop or click to upload'}
                                    </p>
                                    <p className="text-[9px] text-slate-600">PNG, JPG, WebP</p>
                                </div>
                            )}
                        </div>

                        {/* Screenshot previews */}
                        {qaScreenshots.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {qaScreenshots.map((url, idx) => (
                                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/[0.08] bg-black/30">
                                        <img src={url} alt={`QA screenshot ${idx + 1}`} className="w-full h-20 object-cover" />
                                        <button
                                            onClick={() => removeQaScreenshot(idx)}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-2.5 h-2.5 text-white" />
                                        </button>
                                        <div className="absolute bottom-1 left-1">
                                            <span className="text-[7px] font-orbitron bg-black/60 text-white/60 px-1 py-0.5 rounded">
                                                {idx + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit button */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            onClick={submitQaFail}
                            disabled={!qaFeedbackText.trim()}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-orbitron tracking-wide transition-all",
                                "bg-red-500/10 border border-red-500/20 text-red-300",
                                "hover:bg-red-500/20 hover:border-red-500/30",
                                "disabled:opacity-30 disabled:cursor-not-allowed"
                            )}
                        >
                            <Send className="w-3.5 h-3.5" />
                            Fail QA & Send Back to Dev
                        </button>
                        <button
                            onClick={closeQaFailModal}
                            className="h-10 px-4 rounded-xl text-xs font-orbitron text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default ClientRequestsTracker;
