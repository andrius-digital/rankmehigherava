import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    MoreHorizontal,
    Folder,
    FolderOpen,
    List,
    Grid3X3,
    Search,
    Settings,
    ArrowLeft,
    Layers,
    FileText,
    Check,
    Clock,
    AlertCircle,
    Loader2,
    X,
    Home,
    Edit2,
    Sparkles,
    User,
    Calendar,
    Flag,
    Tag,
    Link as LinkIcon,
    CheckCircle2,
    Circle,
    Trash2,
    Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useIsMobile } from '@/hooks/use-mobile';
import { AITextarea } from '@/components/AITextarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClientSitesTracker from './ClientSitesTracker';

// Types
interface Subtask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    order_index: number;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'complete' | 'in_qa' | 'issues';
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    subtasks?: Subtask[];
    created_at?: string;
    updated_at?: string;
}

interface Project {
    id: string;
    name: string;
    tasks: Task[];
}

interface SpaceFolder {
    id: string;
    name: string;
    projects: Project[];
    isOpen?: boolean;
}

interface Space {
    id: string;
    name: string;
    color: string;
    icon: string;
    folders: SpaceFolder[];
    projects: Project[]; // Projects directly in space (not in folder)
    isOpen?: boolean;
}

// Initial demo data
const initialSpaces: Space[] = [
    {
        id: 'ai-lab',
        name: 'AI Lab',
        color: 'bg-purple-500',
        icon: 'A',
        isOpen: true,
        folders: [],
        projects: [
            {
                id: 'seo-spider',
                name: 'SEO Spider',
                tasks: [
                    { id: '1', title: 'Admin metrics APIs', status: 'in_progress' },
                    { id: '2', title: 'Analytics dashboard', status: 'in_qa' },
                    { id: '3', title: 'Blog automation', status: 'todo' },
                ]
            },
            {
                id: 'agency-automations',
                name: 'Agency Automations',
                tasks: [
                    { id: '4', title: 'Slackbot integration', status: 'todo' },
                    { id: '5', title: 'Email notifications', status: 'complete' },
                ]
            },
            {
                id: 'drum-kit',
                name: 'Drum Kit Bazaar',
                tasks: []
            }
        ]
    },
    {
        id: 'sops',
        name: "SOP's",
        color: 'bg-blue-500',
        icon: 'S',
        isOpen: false,
        folders: [
            {
                id: 'completed',
                name: 'Completed',
                isOpen: false,
                projects: [
                    {
                        id: 'xmas-sop',
                        name: 'Xmas Light Installation SOPs',
                        tasks: []
                    },
                    {
                        id: 'lmb-trial',
                        name: 'Local Map Booster SOP: Free Trial',
                        tasks: []
                    }
                ]
            }
        ],
        projects: []
    },
    {
        id: 'websites',
        name: 'Rank Me Higher Websites',
        color: 'bg-red-500',
        icon: 'R',
        isOpen: false,
        folders: [],
        projects: [
            {
                id: 'client-sites',
                name: 'Client Sites',
                tasks: [
                    { id: '6', title: 'Off Tint website updates', status: 'in_progress' },
                    { id: '7', title: 'New client onboarding', status: 'todo' },
                ]
            }
        ]
    },
    {
        id: 'content',
        name: 'Content',
        color: 'bg-cyan-500',
        icon: 'C',
        isOpen: false,
        folders: [],
        projects: []
    },
    {
        id: 'accounting',
        name: 'Accounting',
        color: 'bg-amber-500',
        icon: 'A',
        isOpen: false,
        folders: [],
        projects: []
    }
];

// Default status columns configuration
interface StatusColumn {
    id: string;
    label: string;
    color: string;
    textColor: string;
}

const defaultStatusColumns: StatusColumn[] = [
    { id: 'todo', label: 'TO DO', color: 'bg-gray-500', textColor: 'text-gray-400' },
    { id: 'in_progress', label: 'IN PROGRESS', color: 'bg-blue-500', textColor: 'text-blue-400' },
    { id: 'complete', label: 'COMPLETE', color: 'bg-green-500', textColor: 'text-green-400' },
];

const TaskFlow: React.FC = () => {
    const isMobile = useIsMobile();
    const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
    const [selectedProject, setSelectedProject] = useState<Project | null>(initialSpaces[0].projects[0] || null);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(initialSpaces[0]);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [statusColumns, setStatusColumns] = useState<StatusColumn[]>(defaultStatusColumns);
    
    // Add popup state
    const [addMenuOpen, setAddMenuOpen] = useState<string | null>(null); // spaceId or null
    const [showAddModal, setShowAddModal] = useState<{ type: 'project' | 'folder'; spaceId: string } | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');
    const [editingColumn, setEditingColumn] = useState<StatusColumn | null>(null);
    const [showEditColumnModal, setShowEditColumnModal] = useState(false);
    const [columnLabelInput, setColumnLabelInput] = useState('');
    const addMenuRef = useRef<HTMLDivElement>(null);
    
    // Task detail modal state
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskModalStatus, setTaskModalStatus] = useState<string>('todo'); // For new tasks
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskSubtasks, setTaskSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
    const [editingSubtaskDescription, setEditingSubtaskDescription] = useState<string>('');
    const [taskComments, setTaskComments] = useState<Array<{ id: string; text: string; author: string; created_at: string }>>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const { toast } = useToast();
    
    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState<{
        type: 'project' | 'folder';
        id: string;
        spaceId: string;
        folderId?: string; // if project is inside a folder
    } | null>(null);
    const [dropTarget, setDropTarget] = useState<{
        type: 'folder' | 'space' | 'position';
        id: string;
        position?: 'before' | 'after';
    } | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
                setAddMenuOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle space open/close
    const toggleSpace = (spaceId: string) => {
        setSpaces(spaces.map(s => 
            s.id === spaceId ? { ...s, isOpen: !s.isOpen } : s
        ));
    };

    // Toggle folder open/close
    const toggleFolder = (spaceId: string, folderId: string) => {
        setSpaces(spaces.map(s => 
            s.id === spaceId ? {
                ...s,
                folders: s.folders.map(f => 
                    f.id === folderId ? { ...f, isOpen: !(f.isOpen ?? true) } : f
                )
            } : s
        ));
    };

    // Select a project
    const handleSelectProject = (space: Space, project: Project) => {
        setSelectedSpace(space);
        setSelectedProject(project);
        if (isMobile) setSidebarOpen(false);
    };

    // Add new project to space
    const handleAddProject = () => {
        if (!showAddModal || !newItemName.trim()) return;
        
        const newProject: Project = {
            id: `project-${Date.now()}`,
            name: newItemName.trim(),
            tasks: []
        };

        setSpaces(spaces.map(s => 
            s.id === showAddModal.spaceId 
                ? { ...s, projects: [...s.projects, newProject], isOpen: true }
                : s
        ));
        
        setNewItemName('');
        setShowAddModal(null);
    };

    // Add new folder to space
    const handleAddFolder = () => {
        if (!showAddModal || !newItemName.trim()) return;
        
        const newFolder: SpaceFolder = {
            id: `folder-${Date.now()}`,
            name: newItemName.trim(),
            projects: [],
            isOpen: true // Default to open when created
        };

        setSpaces(spaces.map(s => 
            s.id === showAddModal.spaceId 
                ? { ...s, folders: [...s.folders, newFolder], isOpen: true }
                : s
        ));
        
        setNewItemName('');
        setShowAddModal(null);
    };

    // Add new space
    const handleAddSpace = () => {
        if (!newSpaceName.trim()) return;
        
        const spaceColors = ['bg-purple-500', 'bg-blue-500', 'bg-red-500', 'bg-cyan-500', 'bg-amber-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500'];
        const randomColor = spaceColors[Math.floor(Math.random() * spaceColors.length)];
        const spaceIcon = newSpaceName.trim().charAt(0).toUpperCase();
        
        const newSpace: Space = {
            id: `space-${Date.now()}`,
            name: newSpaceName.trim(),
            color: randomColor,
            icon: spaceIcon,
            folders: [],
            projects: [],
            isOpen: true
        };

        setSpaces([...spaces, newSpace]);
        setNewSpaceName('');
        setShowAddSpaceModal(false);
    };

    // Open add menu for a space
    const openAddMenu = (e: React.MouseEvent, spaceId: string) => {
        e.stopPropagation();
        setAddMenuOpen(addMenuOpen === spaceId ? null : spaceId);
    };

    // Drag and drop handlers
    const handleDragStart = (
        e: React.DragEvent,
        type: 'project' | 'folder',
        id: string,
        spaceId: string,
        folderId?: string
    ) => {
        setDraggedItem({ type, id, spaceId, folderId });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';
        // Required for some browsers
        e.dataTransfer.setData('text/plain', '');
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDropTarget(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnFolder = (e: React.DragEvent, targetSpaceId: string, targetFolderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggedItem || draggedItem.type !== 'project') return;
        if (draggedItem.folderId === targetFolderId) return; // Already in this folder
        
        setSpaces(spaces.map(space => {
            if (space.id === draggedItem.spaceId) {
                // Remove project from original location
                let projectToMove: Project | undefined;
                
                if (draggedItem.folderId) {
                    // Remove from folder
                    space = {
                        ...space,
                        folders: space.folders.map(f => {
                            if (f.id === draggedItem.folderId) {
                                projectToMove = f.projects.find(p => p.id === draggedItem.id);
                                return { ...f, projects: f.projects.filter(p => p.id !== draggedItem.id) };
                            }
                            return f;
                        })
                    };
                } else {
                    // Remove from space root
                    projectToMove = space.projects.find(p => p.id === draggedItem.id);
                    space = { ...space, projects: space.projects.filter(p => p.id !== draggedItem.id) };
                }
                
                // Add to target folder (if same space)
                if (projectToMove && space.id === targetSpaceId) {
                    space = {
                        ...space,
                        folders: space.folders.map(f => {
                            if (f.id === targetFolderId) {
                                return { ...f, projects: [...f.projects, projectToMove!], isOpen: true };
                            }
                            return f;
                        })
                    };
                }
                
                return space;
            }
            
            // Add to target folder in different space
            if (space.id === targetSpaceId && draggedItem.spaceId !== targetSpaceId) {
                const sourceSpace = spaces.find(s => s.id === draggedItem.spaceId);
                let projectToMove: Project | undefined;
                
                if (draggedItem.folderId) {
                    const folder = sourceSpace?.folders.find(f => f.id === draggedItem.folderId);
                    projectToMove = folder?.projects.find(p => p.id === draggedItem.id);
                } else {
                    projectToMove = sourceSpace?.projects.find(p => p.id === draggedItem.id);
                }
                
                if (projectToMove) {
                    return {
                        ...space,
                        folders: space.folders.map(f => {
                            if (f.id === targetFolderId) {
                                return { ...f, projects: [...f.projects, projectToMove!], isOpen: true };
                            }
                            return f;
                        })
                    };
                }
            }
            
            return space;
        }));
        
        setDraggedItem(null);
        setDropTarget(null);
    };

    const handleDropOnSpace = (e: React.DragEvent, targetSpaceId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggedItem || draggedItem.type !== 'project') return;
        if (draggedItem.spaceId === targetSpaceId && !draggedItem.folderId) return; // Already in space root
        
        setSpaces(spaces.map(space => {
            if (space.id === draggedItem.spaceId) {
                // Remove project from original location
                let projectToMove: Project | undefined;
                
                if (draggedItem.folderId) {
                    // Remove from folder
                    space = {
                        ...space,
                        folders: space.folders.map(f => {
                            if (f.id === draggedItem.folderId) {
                                projectToMove = f.projects.find(p => p.id === draggedItem.id);
                                return { ...f, projects: f.projects.filter(p => p.id !== draggedItem.id) };
                            }
                            return f;
                        })
                    };
                } else {
                    projectToMove = space.projects.find(p => p.id === draggedItem.id);
                    space = { ...space, projects: space.projects.filter(p => p.id !== draggedItem.id) };
                }
                
                // Add to target space root (if same space)
                if (projectToMove && space.id === targetSpaceId) {
                    space = { ...space, projects: [...space.projects, projectToMove] };
                }
                
                return space;
            }
            
            // Add to different space
            if (space.id === targetSpaceId && draggedItem.spaceId !== targetSpaceId) {
                const sourceSpace = spaces.find(s => s.id === draggedItem.spaceId);
                let projectToMove: Project | undefined;
                
                if (draggedItem.folderId) {
                    const folder = sourceSpace?.folders.find(f => f.id === draggedItem.folderId);
                    projectToMove = folder?.projects.find(p => p.id === draggedItem.id);
                } else {
                    projectToMove = sourceSpace?.projects.find(p => p.id === draggedItem.id);
                }
                
                if (projectToMove) {
                    return { ...space, projects: [...space.projects, projectToMove], isOpen: true };
                }
            }
            
            return space;
        }));
        
        setDraggedItem(null);
        setDropTarget(null);
    };

    const handleReorderProject = (targetSpaceId: string, targetIndex: number, inFolder?: string) => {
        if (!draggedItem || draggedItem.type !== 'project') return;
        
        setSpaces(spaces.map(space => {
            if (space.id !== targetSpaceId) return space;
            
            // Find and remove the project
            let projectToMove: Project | undefined;
            let newSpace = { ...space };
            
            if (draggedItem.folderId) {
                newSpace.folders = newSpace.folders.map(f => {
                    if (f.id === draggedItem.folderId) {
                        projectToMove = f.projects.find(p => p.id === draggedItem.id);
                        return { ...f, projects: f.projects.filter(p => p.id !== draggedItem.id) };
                    }
                    return f;
                });
            } else {
                projectToMove = newSpace.projects.find(p => p.id === draggedItem.id);
                newSpace.projects = newSpace.projects.filter(p => p.id !== draggedItem.id);
            }
            
            if (!projectToMove) return space;
            
            // Insert at new position
            if (inFolder) {
                newSpace.folders = newSpace.folders.map(f => {
                    if (f.id === inFolder) {
                        const newProjects = [...f.projects];
                        newProjects.splice(targetIndex, 0, projectToMove!);
                        return { ...f, projects: newProjects };
                    }
                    return f;
                });
            } else {
                const newProjects = [...newSpace.projects];
                newProjects.splice(targetIndex, 0, projectToMove);
                newSpace.projects = newProjects;
            }
            
            return newSpace;
        }));
    };

    // Get tasks by status
    const getTasksByStatus = (status: string) => {
        if (!selectedProject) return [];
        return selectedProject.tasks.filter(t => {
            // Map 'complete' status correctly
            const taskStatus = t.status === 'done' ? 'complete' : t.status;
            return taskStatus === status;
        });
    };

    const handleEditColumn = (column: StatusColumn) => {
        setEditingColumn(column);
        setColumnLabelInput(column.label);
        setShowEditColumnModal(true);
    };

    const handleSaveColumnEdit = () => {
        if (!editingColumn || !columnLabelInput.trim()) return;
        
        const newColumns = statusColumns.map(c =>
            c.id === editingColumn.id
                ? { ...c, label: columnLabelInput.trim() }
                : c
        );
        setStatusColumns(newColumns);
        
        // Save to localStorage
        localStorage.setItem('taskFlowStatusColumns', JSON.stringify(newColumns));
        
        setShowEditColumnModal(false);
        setEditingColumn(null);
        setColumnLabelInput('');
    };

    // Load columns from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('taskFlowStatusColumns');
        if (saved) {
            try {
                setStatusColumns(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading status columns:', e);
            }
        }
    }, []);

    // Task modal handlers
    const openTaskModal = (task: Task | null, status?: string) => {
        if (task) {
            setSelectedTask(task);
            setTaskTitle(task.title || '');
            setTaskDescription(task.description || '');
            setTaskSubtasks(task.subtasks || []);
            setTaskModalStatus(task.status);
            // Load comments for this task (in a real app, fetch from database)
            // For now, initialize empty or from task metadata
            setTaskComments([]);
        } else {
            setSelectedTask(null);
            setTaskTitle('');
            setTaskDescription('');
            setTaskSubtasks([]);
            setTaskModalStatus(status || 'todo');
            setTaskComments([]);
        }
        setNewComment('');
        setTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setTaskModalOpen(false);
        setSelectedTask(null);
        setTaskTitle('');
        setTaskDescription('');
        setTaskSubtasks([]);
        setNewSubtaskTitle('');
        setEditingSubtaskId(null);
        setEditingSubtaskDescription('');
        setTaskComments([]);
        setNewComment('');
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast({
                title: "Comment cannot be empty",
                description: "Please write something before commenting.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingComment(true);
        
        try {
            // In a real app, save to database. For now, add to local state
            const comment = {
                id: `comment-${Date.now()}`,
                text: newComment.trim(),
                author: 'You', // In real app, get from auth context
                created_at: new Date().toISOString(),
            };

            setTaskComments([...taskComments, comment]);
            setNewComment('');
            
            toast({
                title: "Comment added",
                description: "Your comment has been added.",
            });
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast({
                title: "Failed to add comment",
                description: "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const saveTask = () => {
        if (!selectedProject || !taskTitle.trim()) {
            toast({
                title: "Task title required",
                description: "Please enter a task title.",
                variant: "destructive",
            });
            return;
        }

        const taskData: Task = {
            id: selectedTask?.id || `task-${Date.now()}`,
            title: taskTitle.trim(),
            description: taskDescription.trim() || undefined,
            status: taskModalStatus as Task['status'],
            subtasks: taskSubtasks.length > 0 ? taskSubtasks : undefined,
            ...(selectedTask || {}), // Preserve existing fields like priority, assignee
        };

        // Update the task in the selected project
        setSpaces(spaces.map(space => {
            if (space.id !== selectedSpace?.id) return space;
            
            return {
                ...space,
                projects: space.projects.map(project => {
                    if (project.id !== selectedProject.id) return project;
                    
                    if (selectedTask) {
                        // Update existing task
                        return {
                            ...project,
                            tasks: project.tasks.map(t => 
                                t.id === selectedTask.id ? taskData : t
                            )
                        };
                    } else {
                        // Add new task
                        return {
                            ...project,
                            tasks: [...project.tasks, taskData]
                        };
                    }
                }),
                folders: space.folders.map(folder => ({
                    ...folder,
                    projects: folder.projects.map(project => {
                        if (project.id !== selectedProject.id) return project;
                        
                        if (selectedTask) {
                            return {
                                ...project,
                                tasks: project.tasks.map(t => 
                                    t.id === selectedTask.id ? taskData : t
                                )
                            };
                        } else {
                            return {
                                ...project,
                                tasks: [...project.tasks, taskData]
                            };
                        }
                    })
                }))
            };
        }));

        toast({
            title: selectedTask ? "Task updated" : "Task created",
            description: `"${taskTitle}" has been ${selectedTask ? 'updated' : 'created'}.`,
        });

        closeTaskModal();
    };

    const deleteTask = () => {
        if (!selectedTask || !selectedProject) return;
        
        setSpaces(spaces.map(space => {
            if (space.id !== selectedSpace?.id) return space;
            
            return {
                ...space,
                projects: space.projects.map(project => {
                    if (project.id !== selectedProject.id) return project;
                    return {
                        ...project,
                        tasks: project.tasks.filter(t => t.id !== selectedTask.id)
                    };
                }),
                folders: space.folders.map(folder => ({
                    ...folder,
                    projects: folder.projects.map(project => {
                        if (project.id !== selectedProject.id) return project;
                        return {
                            ...project,
                            tasks: project.tasks.filter(t => t.id !== selectedTask.id)
                        };
                    })
                }))
            };
        }));

        toast({
            title: "Task deleted",
            description: `"${selectedTask.title}" has been deleted.`,
        });

        closeTaskModal();
    };

    // Subtask handlers
    const addSubtask = () => {
        if (!newSubtaskTitle.trim()) return;
        
        const newSubtask: Subtask = {
            id: `subtask-${Date.now()}`,
            title: newSubtaskTitle.trim(),
            completed: false,
            order_index: taskSubtasks.length,
        };
        
        setTaskSubtasks([...taskSubtasks, newSubtask]);
        setNewSubtaskTitle('');
    };

    const toggleSubtask = (subtaskId: string) => {
        setTaskSubtasks(taskSubtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        ));
    };

    const deleteSubtask = (subtaskId: string) => {
        setTaskSubtasks(taskSubtasks.filter(st => st.id !== subtaskId));
    };

    const startEditSubtask = (subtask: Subtask) => {
        setEditingSubtaskId(subtask.id);
        setEditingSubtaskDescription(subtask.description || '');
    };

    const saveSubtaskDescription = async (subtaskId: string, description: string) => {
        setTaskSubtasks(taskSubtasks.map(st =>
            st.id === subtaskId ? { ...st, description: description.trim() || undefined } : st
        ));
        setEditingSubtaskId(null);
        setEditingSubtaskDescription('');
    };

    const improveSubtaskDescription = async (subtaskId: string, currentDescription: string) => {
        if (!currentDescription.trim()) {
            toast({
                title: "Nothing to improve",
                description: "Please write a description first.",
                variant: "destructive",
            });
            return;
        }
        
        try {
            // Try improve-task-text first, fallback to improve-text
            let improvedText = null;
            let error = null;

            try {
                const result = await supabase.functions.invoke('improve-task-text', {
                    body: { text: currentDescription, type: 'description' },
                });
                error = result.error;
                improvedText = result.data?.improvedText;
            } catch (e) {
                // If improve-task-text fails, try improve-text as fallback
                console.log('improve-task-text failed, trying improve-text:', e);
                const result = await supabase.functions.invoke('improve-text', {
                    body: { text: currentDescription, context: 'subtask description' },
                });
                error = result.error;
                improvedText = result.data?.improvedText;
            }

            if (error) {
                console.error('AI improvement error:', error);
                throw error;
            }

            if (improvedText) {
                setTaskSubtasks(taskSubtasks.map(st =>
                    st.id === subtaskId ? { ...st, description: improvedText } : st
                ));
                toast({
                    title: "Description improved",
                    description: "AI has polished your subtask description.",
                });
            } else {
                throw new Error('No improved text returned');
            }
        } catch (error: any) {
            console.error('Failed to improve subtask description:', error);
            const errorMessage = error?.message || error?.error || 'Unknown error';
            toast({
                title: "Couldn't improve description",
                description: errorMessage.includes('LOVABLE_API_KEY') 
                    ? "AI service not configured. Please check Supabase secrets."
                    : errorMessage.includes('429')
                    ? "Rate limit exceeded. Please wait a moment."
                    : errorMessage.includes('402')
                    ? "AI credits exhausted. Please add funds."
                    : "Please try again later.",
                variant: "destructive",
            });
        }
    };

    const improveTaskDescription = async () => {
        if (!taskDescription.trim()) {
            toast({
                title: "Nothing to improve",
                description: "Please write a description first.",
                variant: "destructive",
            });
            return;
        }
        
        try {
            // Try improve-task-text first, fallback to improve-text
            let improvedText = null;
            let error = null;

            try {
                const result = await supabase.functions.invoke('improve-task-text', {
                    body: { text: taskDescription, type: 'description' },
                });
                error = result.error;
                improvedText = result.data?.improvedText;
            } catch (e) {
                // If improve-task-text fails, try improve-text as fallback
                console.log('improve-task-text failed, trying improve-text:', e);
                const result = await supabase.functions.invoke('improve-text', {
                    body: { text: taskDescription, context: 'task description' },
                });
                error = result.error;
                improvedText = result.data?.improvedText;
            }

            if (error) {
                console.error('AI improvement error:', error);
                throw error;
            }

            if (improvedText) {
                setTaskDescription(improvedText);
                toast({
                    title: "Description improved",
                    description: "AI has polished your task description.",
                });
            } else {
                throw new Error('No improved text returned');
            }
        } catch (error: any) {
            console.error('Failed to improve task description:', error);
            const errorMessage = error?.message || error?.error || 'Unknown error';
            toast({
                title: "Couldn't improve description",
                description: errorMessage.includes('LOVABLE_API_KEY') 
                    ? "AI service not configured. Please check Supabase secrets."
                    : errorMessage.includes('429')
                    ? "Rate limit exceeded. Please wait a moment."
                    : errorMessage.includes('402')
                    ? "AI credits exhausted. Please add funds."
                    : "Please try again later.",
                variant: "destructive",
            });
        }
    };

    // Sidebar component
    const Sidebar = () => (
        <div className={`${isMobile ? 'fixed inset-0 z-50 bg-background' : 'w-72 border-r border-border'} flex flex-col h-full`}>
            {/* Sidebar Header */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-cyan-400" />
                        <span className="font-orbitron font-bold text-sm">Spaces</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Plus className="w-4 h-4" />
                        </Button>
                        {isMobile && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSidebarOpen(false)}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
                {/* Back to AVA Admin Button */}
                <Link 
                    to="/avaadminpanel" 
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 hover:border-cyan-400 hover:from-cyan-500/30 hover:to-blue-600/30 transition-all text-cyan-400 text-xs font-medium"
                >
                    <Home className="w-3.5 h-3.5" />
                    <span>Back to AVA Admin</span>
                </Link>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input 
                        placeholder="Search..." 
                        className="h-8 pl-8 text-xs bg-card/50"
                    />
                </div>
            </div>

            {/* Spaces List */}
            <ScrollArea className="flex-1">
                <div className="p-2 pr-3 space-y-1">
                    {spaces.map((space) => (
                        <div key={space.id} className="relative">
                            {/* Space Header */}
                            <div className="flex items-center gap-1 pr-2 group">
                                <button
                                    onClick={() => toggleSpace(space.id)}
                                    className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-card/50 transition-colors min-w-0"
                                >
                                    {space.isOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    )}
                                    <div className={`w-5 h-5 rounded ${space.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                                        {space.icon}
                                    </div>
                                    <span className="text-sm font-medium text-left truncate">{space.name}</span>
                                </button>
                                
                                {/* Add Button - Always visible with cyan border */}
                                <div className="relative flex-shrink-0" ref={addMenuOpen === space.id ? addMenuRef : null}>
                                    <button
                                        onClick={(e) => openAddMenu(e, space.id)}
                                        className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                                            addMenuOpen === space.id 
                                                ? 'bg-cyan-500 border-cyan-500 text-white' 
                                                : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500'
                                        }`}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {addMenuOpen === space.id && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                                            <div className="p-1.5">
                                                <button
                                                    onClick={() => {
                                                        setShowAddModal({ type: 'project', spaceId: space.id });
                                                        setAddMenuOpen(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-cyan-500/20 transition-colors text-left"
                                                >
                                                    <List className="w-4 h-4 text-cyan-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">Add Project</p>
                                                        <p className="text-[10px] text-muted-foreground">Create a new list</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowAddModal({ type: 'folder', spaceId: space.id });
                                                        setAddMenuOpen(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-amber-500/20 transition-colors text-left"
                                                >
                                                    <Folder className="w-4 h-4 text-amber-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">Add Folder</p>
                                                        <p className="text-[10px] text-muted-foreground">Group lists together</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Space Content (when open) */}
                            {space.isOpen && (
                                <div 
                                    className={`ml-4 pl-2 border-l border-border/50 space-y-0.5 mt-1 min-h-[20px] transition-all ${
                                        dropTarget?.type === 'space' && dropTarget.id === space.id
                                            ? 'bg-cyan-500/10 border-l-cyan-500'
                                            : ''
                                    }`}
                                    onDragOver={(e) => {
                                        handleDragOver(e);
                                        if (draggedItem?.type === 'project' && draggedItem.folderId) {
                                            setDropTarget({ type: 'space', id: space.id });
                                        }
                                    }}
                                    onDragLeave={(e) => {
                                        // Only clear if leaving the container
                                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                            setDropTarget(null);
                                        }
                                    }}
                                    onDrop={(e) => handleDropOnSpace(e, space.id)}
                                >
                                    {/* Folders */}
                                    {space.folders.map((folder) => (
                                        <div 
                                            key={folder.id}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDragOver(e);
                                                if (draggedItem?.type === 'project') {
                                                    setDropTarget({ type: 'folder', id: folder.id });
                                                }
                                            }}
                                            onDragEnter={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (draggedItem?.type === 'project') {
                                                    setDropTarget({ type: 'folder', id: folder.id });
                                                }
                                            }}
                                            onDragLeave={(e) => {
                                                // Only clear if we're actually leaving the folder area
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const x = e.clientX;
                                                const y = e.clientY;
                                                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                                                    setDropTarget(null);
                                                }
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDropOnFolder(e, space.id, folder.id);
                                            }}
                                            className={`rounded-md transition-all min-h-[32px] ${
                                                dropTarget?.type === 'folder' && dropTarget.id === folder.id
                                                    ? 'bg-amber-500/20 ring-2 ring-amber-500/70 shadow-lg shadow-amber-500/20'
                                                    : ''
                                            }`}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFolder(space.id, folder.id);
                                                }}
                                                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-card/50 transition-colors text-muted-foreground hover:text-foreground group"
                                            >
                                                {folder.isOpen ? (
                                                    <ChevronDown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                                )}
                                                {folder.isOpen ? (
                                                    <FolderOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                                ) : (
                                                    <Folder className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                                )}
                                                <span className="text-xs flex-1 text-left truncate">{folder.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{folder.projects.length}</span>
                                            </button>
                                            
                                            {(folder.isOpen ?? true) && (
                                                <div className="ml-4 space-y-0.5 mt-0.5">
                                                    {folder.projects.map((project, index) => (
                                                        <div
                                                            key={project.id}
                                                            draggable
                                                            onDragStart={(e) => {
                                                                e.stopPropagation();
                                                                handleDragStart(e, 'project', project.id, space.id, folder.id);
                                                                // Set drag image
                                                                e.dataTransfer.effectAllowed = 'move';
                                                                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
                                                            }}
                                                            onDragEnd={handleDragEnd}
                                                            className={`cursor-grab active:cursor-grabbing transition-all ${
                                                                draggedItem?.id === project.id ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
                                                            } ${
                                                                dropTarget?.type === 'folder' && dropTarget.id === folder.id
                                                                    ? 'ring-1 ring-amber-500/50'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectProject(space, project);
                                                                }}
                                                                onMouseDown={(e) => {
                                                                    // Allow dragging even when clicking on button
                                                                    // Only prevent if it's a double-click or right-click
                                                                    if (e.detail > 1 || e.button !== 0) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                className={`w-full flex items-center gap-2 px-2 py-1 rounded-md transition-colors text-xs select-none ${
                                                                    selectedProject?.id === project.id 
                                                                        ? 'bg-cyan-500/20 text-cyan-400' 
                                                                        : 'hover:bg-card/50 text-muted-foreground hover:text-foreground'
                                                                }`}
                                                            >
                                                                <FileText className="w-3 h-3 flex-shrink-0 pointer-events-none" />
                                                                <span className="truncate flex-1 text-left pointer-events-none">{project.name}</span>
                                                                <span className="text-[10px] text-muted-foreground pointer-events-none">{project.tasks.length}</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Direct Projects */}
                                    {space.projects.map((project, index) => (
                                        <div
                                            key={project.id}
                                            draggable
                                            onDragStart={(e) => {
                                                e.stopPropagation();
                                                handleDragStart(e, 'project', project.id, space.id);
                                                // Set drag image
                                                e.dataTransfer.effectAllowed = 'move';
                                                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
                                            }}
                                            onDragEnd={handleDragEnd}
                                            className={`cursor-grab active:cursor-grabbing transition-all ${
                                                draggedItem?.id === project.id ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
                                            }`}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectProject(space, project);
                                                }}
                                                onMouseDown={(e) => {
                                                    // Allow dragging even when clicking on button
                                                    // Only prevent if it's a double-click or right-click
                                                    if (e.detail > 1 || e.button !== 0) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className={`w-full flex items-center gap-2 px-2 py-1 rounded-md transition-colors text-xs select-none ${
                                                    selectedProject?.id === project.id 
                                                        ? 'bg-cyan-500/20 text-cyan-400' 
                                                        : 'hover:bg-card/50 text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <List className="w-3.5 h-3.5 flex-shrink-0 pointer-events-none" />
                                                <span className="flex-1 text-left truncate pointer-events-none">{project.name}</span>
                                                <span className="text-[10px] text-muted-foreground pointer-events-none">{project.tasks.length}</span>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Project Button */}
                                    <button 
                                        onClick={() => setShowAddModal({ type: 'project', spaceId: space.id })}
                                        className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-card/50 transition-colors text-muted-foreground text-xs"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Project</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Space Button */}
                    <button 
                        onClick={() => setShowAddSpaceModal(true)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-card/50 transition-colors text-muted-foreground mt-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">New Space</span>
                    </button>
                </div>
            </ScrollArea>
        </div>
    );

    // Task Card component
    const TaskCard = ({ task }: { task: Task }) => (
        <div 
            onClick={() => openTaskModal(task)}
            className="bg-card/50 border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors cursor-pointer group"
        >
            <p className="text-sm text-foreground mb-2">{task.title}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {task.priority === 'high' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-red-500/50 text-red-400">
                            High
                        </Badge>
                    )}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-cyan-500/50 text-cyan-400">
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                        </Badge>
                    )}
                </div>
                {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {task.assignee.charAt(0)}
                    </div>
                )}
            </div>
        </div>
    );

    // Board View
    const BoardView = () => (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {statusColumns.map((column) => {
                const tasks = getTasksByStatus(column.id);
                return (
                    <div key={column.id} className="flex-shrink-0 w-72">
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3 px-1 group">
                            <div className="flex items-center gap-2 flex-1">
                                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                <span className={`text-xs font-bold uppercase ${column.textColor}`}>{column.label}</span>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{tasks.length}</Badge>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditColumn(column);
                                }}
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card/50"
                                title="Edit column name"
                            >
                                <Edit2 className="w-3 h-3" />
                            </Button>
                        </div>
                        
                        {/* Tasks */}
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                            
                            {/* Add Task Button */}
                            <button 
                                onClick={() => openTaskModal(null, column.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border/50 hover:border-primary/30 hover:bg-card/30 transition-colors text-muted-foreground text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Task</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            <Helmet>
                <title>Task Flow | Rank Me Higher</title>
            </Helmet>

            <HUDOverlay />

            {/* Sidebar */}
            {(sidebarOpen || !isMobile) && <Sidebar />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="border-b border-border bg-card/30 backdrop-blur-xl sticky top-0 z-10">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isMobile && !sidebarOpen && (
                                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="h-8 w-8 p-0">
                                    <Layers className="w-4 h-4" />
                                </Button>
                            )}
                            {/* Back to AVA Admin Button */}
                            <Link 
                                to="/avaadminpanel" 
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/50 border border-border/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors text-muted-foreground hover:text-cyan-400"
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium hidden sm:inline">AVA Admin</span>
                            </Link>
                            <div>
                                <h1 className="font-orbitron font-bold text-lg text-foreground">
                                    {selectedProject?.name || 'Task Flow'}
                                </h1>
                                {selectedSpace && (
                                    <p className="text-xs text-muted-foreground">{selectedSpace.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* View Toggle */}
                            <div className="flex items-center bg-card/50 rounded-lg p-0.5 border border-border/50">
                                <button
                                    onClick={() => setViewMode('board')}
                                    className={`px-2 py-1 rounded text-xs ${viewMode === 'board' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-2 py-1 rounded text-xs ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto">
                    {selectedProject ? (
                        selectedProject.id === 'client-sites' ? (
                            <ClientSitesTracker embedded={true} />
                        ) : viewMode === 'board' ? (
                            <div className="p-4">
                                <BoardView />
                            </div>
                        ) : (
                            <div className="p-4 text-muted-foreground text-sm">List view coming soon...</div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                                <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Select a project to view tasks</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Project/Folder Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${
                            showAddModal.type === 'project' ? 'bg-cyan-500/10' : 'bg-amber-500/10'
                        }`}>
                            <div className="flex items-center gap-3">
                                {showAddModal.type === 'project' ? (
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                        <List className="w-5 h-5 text-cyan-400" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <Folder className="w-5 h-5 text-amber-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-orbitron font-bold text-lg">
                                        {showAddModal.type === 'project' ? 'New Project' : 'New Folder'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {showAddModal.type === 'project' 
                                            ? 'Create a new project list' 
                                            : 'Create a folder to group projects'
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(null);
                                    setNewItemName('');
                                }}
                                className="p-2 rounded-lg hover:bg-card transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {showAddModal.type === 'project' ? 'Project Name' : 'Folder Name'}
                                </label>
                                <Input
                                    autoFocus
                                    placeholder={showAddModal.type === 'project' ? 'e.g., Marketing Campaign' : 'e.g., Q1 Projects'}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newItemName.trim()) {
                                            showAddModal.type === 'project' ? handleAddProject() : handleAddFolder();
                                        }
                                    }}
                                    className="h-11 bg-background/50"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowAddModal(null);
                                        setNewItemName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`flex-1 ${
                                        showAddModal.type === 'project' 
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' 
                                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                                    }`}
                                    onClick={() => showAddModal.type === 'project' ? handleAddProject() : handleAddFolder()}
                                    disabled={!newItemName.trim()}
                                >
                                    {showAddModal.type === 'project' ? (
                                        <>
                                            <List className="w-4 h-4 mr-2" />
                                            Create Project
                                        </>
                                    ) : (
                                        <>
                                            <Folder className="w-4 h-4 mr-2" />
                                            Create Folder
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Space Modal */}
            {showAddSpaceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-indigo-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-orbitron font-bold text-lg">
                                        New Space
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Create a new workspace with an empty pipeline
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddSpaceModal(false);
                                    setNewSpaceName('');
                                }}
                                className="p-2 rounded-lg hover:bg-card transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Space Name
                                </label>
                                <Input
                                    autoFocus
                                    placeholder="e.g., Marketing, Development, Design"
                                    value={newSpaceName}
                                    onChange={(e) => setNewSpaceName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newSpaceName.trim()) {
                                            handleAddSpace();
                                        }
                                    }}
                                    className="h-11 bg-background/50"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowAddSpaceModal(false);
                                        setNewSpaceName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                    onClick={handleAddSpace}
                                    disabled={!newSpaceName.trim()}
                                >
                                    <Layers className="w-4 h-4 mr-2" />
                                    Create Space
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Column Modal */}
            {showEditColumnModal && editingColumn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-cyan-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                    <Edit2 className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-orbitron font-bold text-lg">
                                        Edit Column
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Rename the column label
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditColumnModal(false);
                                    setEditingColumn(null);
                                    setColumnLabelInput('');
                                }}
                                className="p-2 rounded-lg hover:bg-card transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Column Label
                                </label>
                                <Input
                                    autoFocus
                                    placeholder="e.g., TO DO, IN PROGRESS, COMPLETE"
                                    value={columnLabelInput}
                                    onChange={(e) => setColumnLabelInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && columnLabelInput.trim()) {
                                            handleSaveColumnEdit();
                                        }
                                        if (e.key === 'Escape') {
                                            setShowEditColumnModal(false);
                                            setEditingColumn(null);
                                            setColumnLabelInput('');
                                        }
                                    }}
                                    className="h-11 bg-background/50"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowEditColumnModal(false);
                                        setEditingColumn(null);
                                        setColumnLabelInput('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                                    onClick={handleSaveColumnEdit}
                                    disabled={!columnLabelInput.trim()}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Detail Modal - ClickUp Style */}
            <Dialog open={taskModalOpen} onOpenChange={(open) => {
                if (!open) closeTaskModal();
            }}>
                <DialogContent className="max-w-5xl w-full h-[90vh] max-h-[900px] p-0 bg-card border-border overflow-hidden flex flex-col">
                    <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium">Task</span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {selectedTask?.id || 'New'}
                                    </span>
                                </div>
                                {!selectedTask && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                        onClick={() => {
                                            // Ask AI button - could open AI assistant
                                            toast({
                                                title: "AI Assistant",
                                                description: "AI assistance coming soon!",
                                            });
                                        }}
                                    >
                                        <Brain className="w-3 h-3 mr-1" />
                                        Ask AI
                                    </Button>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closeTaskModal}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex">
                        {/* Left Panel - Main Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {/* Task Title - Editable */}
                            <div>
                                <Input
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    placeholder="Task title"
                                    className="text-2xl font-bold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                                />
                            </div>

                            {/* Task Attributes */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <Label className="text-xs text-muted-foreground w-24 flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5" />
                                        Status
                                    </Label>
                                    <Select value={taskModalStatus} onValueChange={setTaskModalStatus}>
                                        <SelectTrigger className="w-48 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusColumns.map((col) => (
                                                <SelectItem key={col.id} value={col.id}>
                                                    {col.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label className="text-xs text-muted-foreground w-24 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Assignee
                                    </Label>
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                        <User className="w-4 h-4 text-cyan-400" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label className="text-xs text-muted-foreground w-24 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Dates
                                    </Label>
                                    <span className="text-sm text-muted-foreground">Start → Due</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label className="text-xs text-muted-foreground w-24 flex items-center gap-2">
                                        <Flag className="w-3.5 h-3.5" />
                                        Priority
                                    </Label>
                                    <Select value={selectedTask?.priority || 'medium'} onValueChange={(value) => {
                                        if (selectedTask) {
                                            // Update priority logic here
                                        }
                                    }}>
                                        <SelectTrigger className="w-48 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={improveTaskDescription}
                                        disabled={!taskDescription.trim()}
                                        className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                    >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Write with AI
                                    </Button>
                                </div>
                                <AITextarea
                                    value={taskDescription}
                                    onChange={setTaskDescription}
                                    placeholder="Add a description..."
                                    rows={6}
                                    fieldContext="task description"
                                    className="min-h-[120px]"
                                />
                            </div>

                            {/* Subtasks Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Subtasks</Label>
                                    <Badge variant="secondary" className="text-xs">
                                        {taskSubtasks.filter(st => st.completed).length} / {taskSubtasks.length}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-2">
                                    {taskSubtasks.map((subtask) => (
                                        <div
                                            key={subtask.id}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors group"
                                        >
                                            <button
                                                onClick={() => toggleSubtask(subtask.id)}
                                                className="mt-0.5 flex-shrink-0"
                                            >
                                                {subtask.completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </button>
                                            
                                            <div className="flex-1 min-w-0">
                                                <Input
                                                    value={subtask.title}
                                                    onChange={(e) => {
                                                        setTaskSubtasks(taskSubtasks.map(st =>
                                                            st.id === subtask.id ? { ...st, title: e.target.value } : st
                                                        ));
                                                    }}
                                                    className={`border-0 bg-transparent focus-visible:ring-1 p-0 h-auto ${
                                                        subtask.completed ? 'line-through text-muted-foreground' : ''
                                                    }`}
                                                    placeholder="Subtask title"
                                                />
                                                
                                                {editingSubtaskId === subtask.id ? (
                                                    <div className="mt-2 space-y-2">
                                                        <AITextarea
                                                            value={editingSubtaskDescription}
                                                            onChange={setEditingSubtaskDescription}
                                                            placeholder="Add subtask description..."
                                                            rows={3}
                                                            fieldContext="subtask description"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => saveSubtaskDescription(subtask.id, editingSubtaskDescription)}
                                                                className="h-7 text-xs"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setEditingSubtaskId(null);
                                                                    setEditingSubtaskDescription('');
                                                                }}
                                                                className="h-7 text-xs"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-1">
                                                        {subtask.description ? (
                                                            <p className="text-xs text-muted-foreground">{subtask.description}</p>
                                                        ) : (
                                                            <button
                                                                onClick={() => startEditSubtask(subtask)}
                                                                className="text-xs text-muted-foreground hover:text-foreground"
                                                            >
                                                                Add description
                                                            </button>
                                                        )}
                                                        {subtask.description && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => startEditSubtask(subtask)}
                                                                    className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Edit2 className="w-3 h-3 mr-1" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => improveSubtaskDescription(subtask.id, subtask.description || '')}
                                                                    className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    disabled={!subtask.description?.trim()}
                                                                >
                                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                                    Polish with AI
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteSubtask(subtask.id)}
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                    
                                    {/* Add Subtask Input */}
                                    <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border/50 hover:border-primary/30 transition-colors">
                                        <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <Input
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addSubtask();
                                                }
                                            }}
                                            placeholder="Add subtask"
                                            className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
                                        />
                                        {newSubtaskTitle.trim() && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={addSubtask}
                                                className="h-6 text-xs"
                                            >
                                                Add
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Activity & Comments */}
                        <div className="w-80 border-l border-border p-4 space-y-4 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium">Activity</h3>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <Search className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 relative">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white">1</span>
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="space-y-4 text-xs">
                                    {/* Task Activity */}
                                    {selectedTask && (
                                        <div className="text-muted-foreground">
                                            <p className="font-medium text-foreground">Task created</p>
                                            <p className="text-[10px]">{new Date().toLocaleString()}</p>
                                        </div>
                                    )}
                                    
                                    {/* Comments */}
                                    {taskComments.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-xs font-medium text-foreground mb-2">Comments</p>
                                            {taskComments.map((comment) => (
                                                <div key={comment.id} className="p-3 rounded-lg bg-card/50 border border-border/50">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                                                <User className="w-3 h-3 text-cyan-400" />
                                                            </div>
                                                            <span className="text-xs font-medium text-foreground">{comment.author}</span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {taskComments.length === 0 && !selectedTask && (
                                        <p className="text-center py-8 text-muted-foreground text-xs">No activity yet</p>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Comment Section */}
                            <div className="border-t border-border pt-4">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            handleAddComment();
                                        }
                                    }}
                                    placeholder="Write a comment... (Cmd/Ctrl + Enter to submit)"
                                    className="min-h-[80px] resize-none text-sm"
                                    disabled={isSubmittingComment}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0"
                                            title="Add attachment"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 text-xs"
                                            onClick={async () => {
                                                if (!newComment.trim()) {
                                                    toast({
                                                        title: "Nothing to improve",
                                                        description: "Please write a comment first.",
                                                        variant: "destructive",
                                                    });
                                                    return;
                                                }
                                                try {
                                                    const { data, error } = await supabase.functions.invoke('improve-text', {
                                                        body: { text: newComment, context: 'task comment' },
                                                    });
                                                    if (error) throw error;
                                                    if (data?.improvedText) {
                                                        setNewComment(data.improvedText);
                                                        toast({
                                                            title: "Comment improved",
                                                            description: "AI has polished your comment.",
                                                        });
                                                    }
                                                } catch (error) {
                                                    console.error('Failed to improve comment:', error);
                                                    toast({
                                                        title: "Couldn't improve comment",
                                                        description: "Please try again later.",
                                                        variant: "destructive",
                                                    });
                                                }
                                            }}
                                            disabled={!newComment.trim()}
                                            title="Improve with AI"
                                        >
                                            <Brain className="w-3 h-3 mr-1" />
                                            AI
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0"
                                            title="Mention someone"
                                        >
                                            <User className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0"
                                            title="Add link"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        className="h-7 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || isSubmittingComment}
                                    >
                                        {isSubmittingComment ? (
                                            <>
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            'Comment'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
                        {selectedTask && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={deleteTask}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                            </Button>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                variant="outline"
                                onClick={closeTaskModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveTask}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                            >
                                {selectedTask ? 'Save Changes' : 'Create Task'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskFlow;
