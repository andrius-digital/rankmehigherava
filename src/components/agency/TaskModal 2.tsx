import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    X,
    Trash2,
    Sparkles,
    Calendar as CalendarIcon,
    User,
    Flag,
    Tag,
    ChevronDown,
    Send,
    CheckCircle2,
    Circle,
} from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";
import { useProfiles } from "@/hooks/useProfiles";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task | null;
    initialStatus?: TaskStatus;
    onSave: (taskData: any) => Promise<void>;
    onDelete?: (taskId: string) => Promise<void>;
}

const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    task,
    initialStatus = "todo",
    onSave,
    onDelete,
}) => {
    const { data: profiles = [] } = useProfiles();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>(initialStatus);
    const [priority, setPriority] = useState<TaskPriority>("normal");
    const [assigneeId, setAssigneeId] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    const [labels, setLabels] = useState<string>("");
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
    const [newSubtask, setNewSubtask] = useState("");
    const [comment, setComment] = useState("");

    // Initialize state when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setStatus(task.status as TaskStatus);
            setPriority((task.priority as TaskPriority) || "normal");
            setAssigneeId(task.assignee_id || "");
            setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
            // Handle labels if they exist as Json
            if (task.labels && Array.isArray(task.labels)) {
                setLabels(task.labels.join(", "));
            } else {
                setLabels("");
            }
        } else {
            setTitle("");
            setDescription("");
            setStatus(initialStatus);
            setPriority("normal");
            setAssigneeId("");
            setDueDate("");
            setLabels("");
            setSubtasks([]);
        }
    }, [task, initialStatus, isOpen]);

    const handleSave = async () => {
        const taskData = {
            id: task?.id,
            title,
            description,
            status,
            priority,
            assignee_id: assigneeId || null,
            due_date: dueDate || null,
            labels: labels ? labels.split(",").map(s => s.trim()) : [],
        };
        await onSave(taskData);
        onClose();
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { id: Math.random().toString(), title: newSubtask, completed: false }]);
        setNewSubtask("");
    };

    const toggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    };

    const statusIcons: Record<TaskStatus, React.ElementType> = {
        todo: Circle,
        in_progress: Sparkles,
        in_qa: CheckCircle2,
        issues_found: Flag,
        blocker: X,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogPortal>
                <DialogOverlay />
                <DialogPrimitive.Content
                    className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] p-0 overflow-hidden bg-[#0a0a0b] border border-border/50 shadow-2xl shadow-primary/10 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg text-foreground"
                >
                    <div className="flex h-full max-h-[90vh]">
                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto p-8 border-r border-border/50">
                            {/* Header Section */}
                            <div className="flex items-center gap-4 mb-8">
                                <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30 px-3 py-1 flex items-center gap-2 rounded-full">
                                    {React.createElement(statusIcons[status] || Circle, { className: "w-3 h-3" })}
                                    <span className="font-orbitron text-[10px] tracking-wider uppercase">
                                        {status.replace("_", " ")}
                                    </span>
                                </Badge>
                                <span className="text-muted-foreground font-orbitron text-[10px] tracking-widest uppercase">
                                    {task ? "Edit Task" : "New Task"}
                                </span>
                            </div>

                            {/* Title Section */}
                            <div className="space-y-2 mb-8 group relative">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase">Title</label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-[10px] gap-1.5 border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary hover:shadow-[0_0_15px_rgba(234,56,76,0.3)] transition-all duration-300 rounded-full font-orbitron tracking-widest"
                                    >
                                        <Sparkles className="w-3 h-3 animate-pulse" />
                                        FIX WITH AI
                                    </Button>
                                </div>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-2xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/20 font-orbitron tracking-tight text-foreground"
                                    placeholder="TASK TITLE..."
                                />
                            </div>

                            {/* Description Section */}
                            <div className="space-y-2 mb-8 group relative">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase">Description</label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-[10px] gap-1.5 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 rounded-full font-orbitron tracking-widest"
                                    >
                                        <Sparkles className="w-3 h-3 animate-pulse" />
                                        FIX WITH AI
                                    </Button>
                                </div>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[120px] bg-card/20 border-border/30 focus:border-primary/50 resize-none font-body text-sm leading-relaxed text-foreground"
                                    placeholder="Add a detailed description..."
                                />
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-8 p-6 rounded-xl bg-card/20 border border-border/50">
                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                        <Circle className="w-3 h-3" /> Status
                                    </label>
                                    <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                        <SelectTrigger className="bg-card/50 border-border/50 font-orbitron text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="in_qa">In QA</SelectItem>
                                            <SelectItem value="issues_found">Issues Found</SelectItem>
                                            <SelectItem value="blocker" className="text-red-500">Blocker</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                        <Flag className="w-3 h-3" /> Priority
                                    </label>
                                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                        <SelectTrigger className="bg-card/50 border-border/50 font-orbitron text-xs uppercase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high" className="text-orange-500">High</SelectItem>
                                            <SelectItem value="urgent" className="text-red-500 font-bold">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assignee */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                        <User className="w-3 h-3" /> Assignee
                                    </label>
                                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                                        <SelectTrigger className="bg-card/50 border-border/50 text-xs">
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Unassigned</SelectItem>
                                            {profiles.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Due Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                        <CalendarIcon className="w-3 h-3" /> Due Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="bg-card/50 border-border/50 text-xs text-foreground [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            {/* Labels Section */}
                            <div className="space-y-2 mb-8">
                                <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> Labels
                                </label>
                                <Input
                                    value={labels}
                                    onChange={(e) => setLabels(e.target.value)}
                                    placeholder="design, urgent, frontend..."
                                    className="bg-card/30 border-border/50 text-foreground"
                                />
                            </div>

                            {/* Subtasks Section */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[10px] font-orbitron tracking-widest text-muted-foreground uppercase">Subtasks</label>
                                        <Badge variant="secondary" className="bg-muted/50 text-[10px] px-2 py-0">
                                            {subtasks.filter(s => s.completed).length}/{subtasks.length}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] text-primary hover:text-primary hover:bg-primary/10 gap-1"
                                        onClick={() => handleAddSubtask()}
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                    </Button>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                        style={{ width: `${subtasks.length > 0 ? (subtasks.filter(s => s.completed).length / subtasks.length) * 100 : 0}%` }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    {subtasks.map((subtask) => (
                                        <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/20 border border-border/30 group">
                                            <button
                                                onClick={() => toggleSubtask(subtask.id)}
                                                className={cn(
                                                    "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                                                    subtask.completed ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
                                                )}
                                            >
                                                {subtask.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </button>
                                            <span className={cn("text-xs flex-1", subtask.completed && "text-muted-foreground line-through")}>
                                                {subtask.title}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="relative flex-1">
                                            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                            <Input
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                                                placeholder="Add your first subtask"
                                                className="pl-9 h-10 bg-card/30 border-dashed border-border/50 hover:border-primary/50 focus:border-primary transition-all text-foreground"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                {task && onDelete ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 gap-2"
                                        onClick={() => onDelete(task.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Task
                                    </Button>
                                ) : <div></div>}
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-primary/20 text-white font-orbitron tracking-widest text-[10px] h-10 px-6"
                                    >
                                        {task ? "Save Changes" : "Create Task"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Activity Sidebar */}
                        <div className="w-[320px] bg-[#0d0d0f]/50 backdrop-blur-sm flex flex-col">
                            <div className="p-6 border-b border-border/50 flex items-center justify-between">
                                <h3 className="font-orbitron tracking-widest text-[10px] text-muted-foreground uppercase">Activity</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-muted-foreground/30" />
                                </div>
                                <p className="text-sm text-muted-foreground max-w-[200px]">
                                    No activity yet. Add a comment to start the conversation.
                                </p>
                            </div>

                            <div className="p-6 border-t border-border/50">
                                <div className="relative">
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Write a comment... Use @ to mention"
                                        className="min-h-[100px] pr-12 bg-card/30 border-border/50 focus:border-primary/50 resize-none text-xs text-foreground"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute bottom-3 right-3 h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
};

export default TaskModal;
