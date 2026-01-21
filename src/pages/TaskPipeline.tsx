import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Search,
    Zap,
    CircleDot,
    AlertTriangle,
    Ban,
    CheckSquare,
    GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    Task,
    TaskStatus,
    TaskPriority,
} from "@/hooks/useTasks";
import { useProfiles } from "@/hooks/useProfiles";
import TaskModal from "@/components/agency/TaskModal";

// Column configuration
const columns: {
    id: TaskStatus;
    label: string;
    icon: React.ElementType;
    iconColor: string;
}[] = [
        { id: "todo", label: "To Do", icon: CheckSquare, iconColor: "text-muted-foreground" },
        { id: "in_progress", label: "In Progress", icon: Zap, iconColor: "text-yellow-500" },
        { id: "in_qa", label: "In QA", icon: CircleDot, iconColor: "text-blue-500" },
        { id: "issues_found", label: "Issues Found", icon: AlertTriangle, iconColor: "text-amber-500" },
        { id: "blocker", label: "Blocker", icon: Ban, iconColor: "text-red-500" },
    ];

const priorityColors: Record<string, string> = {
    low: "text-muted-foreground",
    normal: "text-foreground",
    high: "text-orange-500",
    urgent: "text-red-500",
};

const TaskPipeline: React.FC = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [addToColumn, setAddToColumn] = useState<TaskStatus>("todo");

    // Data hooks
    const { data: tasks = [], isLoading } = useTasks();
    const { data: profiles = [] } = useProfiles();
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
        const matchesAssignee =
            assigneeFilter === "all" ||
            (assigneeFilter === "unassigned" && !task.assignee_id) ||
            task.assignee_id === assigneeFilter;
        return matchesSearch && matchesPriority && matchesAssignee;
    });

    // Group tasks by status
    const tasksByColumn = columns.reduce((acc, col) => {
        acc[col.id] = filteredTasks.filter((t) => t.status === col.id);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    const totalTasks = tasks.length;

    const openAddModal = (columnId: TaskStatus) => {
        setAddToColumn(columnId);
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData: any) => {
        try {
            if (taskData.id) {
                await updateTask.mutateAsync(taskData);
                toast({ title: "Success", description: "Task updated successfully" });
            } else {
                await createTask.mutateAsync({
                    ...taskData,
                    status: addToColumn,
                });
                toast({ title: "Success", description: "Task created successfully" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask.mutateAsync(taskId);
            toast({ title: "Success", description: "Task deleted successfully" });
            setIsModalOpen(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await updateTask.mutateAsync({ id: taskId, status: newStatus });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Task Pipeline | AVA Admin Panel</title>
            </Helmet>

            {/* Header */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link to="/avaadminpanel">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <CheckSquare className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-heading font-bold">Task Pipeline</h1>
                                    <p className="text-sm text-muted-foreground">{totalTasks} total tasks</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="bg-gradient-to-r from-primary to-red-600"
                            onClick={() => openAddModal("todo")}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Task
                        </Button>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-card/50 border-border/50"
                        />
                    </div>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[160px] bg-card/50 border-border/50">
                            <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high" className="text-orange-500">High</SelectItem>
                            <SelectItem value="urgent" className="text-red-500">Urgent</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                        <SelectTrigger className="w-[160px] bg-card/50 border-border/50">
                            <SelectValue placeholder="All Assignees" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Assignees</SelectItem>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {profiles.map((profile) => (
                                <SelectItem key={profile.id} value={profile.id}>
                                    {profile.full_name || profile.email || "Unknown"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="container mx-auto px-4 pb-8">
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((column) => {
                        const columnTasks = tasksByColumn[column.id] || [];
                        const Icon = column.icon;

                        return (
                            <div
                                key={column.id}
                                className="flex-shrink-0 w-[280px] bg-card/30 rounded-xl border border-border/50 p-4"
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${column.iconColor}`} />
                                        <span className="font-medium text-sm">{column.label}</span>
                                        <Badge variant="secondary" className="text-xs px-2 py-0">
                                            {columnTasks.length}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Add Task Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground mb-3"
                                    onClick={() => openAddModal(column.id)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>

                                {/* Task Cards */}
                                <div className="space-y-3 min-h-[200px]">
                                    {columnTasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                            <Icon className={`w-8 h-8 mb-2 opacity-30 ${column.iconColor}`} />
                                            <span className="text-sm">No tasks</span>
                                        </div>
                                    ) : (
                                        columnTasks.map((task) => (
                                            <Card
                                                key={task.id}
                                                className="bg-card/80 border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                                                onClick={() => openEditModal(task)}
                                            >
                                                <CardContent className="p-3" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-start gap-2" onClick={() => openEditModal(task)}>
                                                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 cursor-grab" />
                                                        <div className="flex-1 min-w-0">
                                                            {task.priority && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-[10px] px-1.5 py-0 mb-1 ${priorityColors[task.priority]}`}
                                                                >
                                                                    {task.priority}
                                                                </Badge>
                                                            )}
                                                            <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <CheckSquare className="w-3 h-3" />
                                                                    {task.subtasks_count || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Quick move buttons */}
                                                    <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {columns
                                                            .filter((c) => c.id !== task.status)
                                                            .slice(0, 3)
                                                            .map((c) => (
                                                                <Button
                                                                    key={c.id}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-[10px]"
                                                                    onClick={() => handleMoveTask(task.id, c.id)}
                                                                >
                                                                    → {c.label.split(" ")[0]}
                                                                </Button>
                                                            ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Task Modal (Add/Edit) */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                initialStatus={addToColumn}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
};

export default TaskPipeline;
