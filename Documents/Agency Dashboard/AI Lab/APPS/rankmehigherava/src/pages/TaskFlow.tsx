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
    Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useIsMobile } from '@/hooks/use-mobile';

// Types
interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'in_qa' | 'done' | 'issues';
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
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
                    { id: '5', title: 'Email notifications', status: 'done' },
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

// Status columns configuration
const statusColumns = [
    { id: 'todo', label: 'TO DO', color: 'bg-gray-500', textColor: 'text-gray-400' },
    { id: 'in_progress', label: 'IN PROGRESS', color: 'bg-blue-500', textColor: 'text-blue-400' },
    { id: 'in_qa', label: 'IN QA', color: 'bg-amber-500', textColor: 'text-amber-400' },
    { id: 'done', label: 'DONE', color: 'bg-green-500', textColor: 'text-green-400' },
    { id: 'issues', label: 'ISSUES', color: 'bg-red-500', textColor: 'text-red-400' },
];

const TaskFlow: React.FC = () => {
    const isMobile = useIsMobile();
    const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
    const [selectedProject, setSelectedProject] = useState<Project | null>(initialSpaces[0].projects[0] || null);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(initialSpaces[0]);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    
    // Add popup state
    const [addMenuOpen, setAddMenuOpen] = useState<string | null>(null); // spaceId or null
    const [showAddModal, setShowAddModal] = useState<{ type: 'project' | 'folder'; spaceId: string } | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const addMenuRef = useRef<HTMLDivElement>(null);
    
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
                    f.id === folderId ? { ...f, isOpen: !f.isOpen } : f
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
            isOpen: true
        };

        setSpaces(spaces.map(s => 
            s.id === showAddModal.spaceId 
                ? { ...s, folders: [...s.folders, newFolder], isOpen: true }
                : s
        ));
        
        setNewItemName('');
        setShowAddModal(null);
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
        return selectedProject.tasks.filter(t => t.status === status);
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
                                                handleDragOver(e);
                                                if (draggedItem?.type === 'project') {
                                                    setDropTarget({ type: 'folder', id: folder.id });
                                                }
                                            }}
                                            onDragLeave={() => setDropTarget(null)}
                                            onDrop={(e) => handleDropOnFolder(e, space.id, folder.id)}
                                            className={`rounded-md transition-all ${
                                                dropTarget?.type === 'folder' && dropTarget.id === folder.id
                                                    ? 'bg-amber-500/20 ring-1 ring-amber-500/50'
                                                    : ''
                                            }`}
                                        >
                                            <button
                                                onClick={() => toggleFolder(space.id, folder.id)}
                                                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-card/50 transition-colors text-muted-foreground hover:text-foreground"
                                            >
                                                {folder.isOpen ? (
                                                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                                                ) : (
                                                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                                                )}
                                                <span className="text-xs flex-1 text-left truncate">{folder.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{folder.projects.length}</span>
                                            </button>
                                            
                                            {folder.isOpen && (
                                                <div className="ml-4 space-y-0.5 mt-0.5">
                                                    {folder.projects.map((project, index) => (
                                                        <div
                                                            key={project.id}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, 'project', project.id, space.id, folder.id)}
                                                            onDragEnd={handleDragEnd}
                                                            className={`cursor-grab active:cursor-grabbing ${
                                                                draggedItem?.id === project.id ? 'opacity-50' : ''
                                                            }`}
                                                        >
                                                            <button
                                                                onClick={() => handleSelectProject(space, project)}
                                                                className={`w-full flex items-center gap-2 px-2 py-1 rounded-md transition-colors text-xs ${
                                                                    selectedProject?.id === project.id 
                                                                        ? 'bg-cyan-500/20 text-cyan-400' 
                                                                        : 'hover:bg-card/50 text-muted-foreground hover:text-foreground'
                                                                }`}
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                                <span className="truncate flex-1 text-left">{project.name}</span>
                                                                <span className="text-[10px] text-muted-foreground">{project.tasks.length}</span>
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
                                            onDragStart={(e) => handleDragStart(e, 'project', project.id, space.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`cursor-grab active:cursor-grabbing ${
                                                draggedItem?.id === project.id ? 'opacity-50' : ''
                                            }`}
                                        >
                                            <button
                                                onClick={() => handleSelectProject(space, project)}
                                                className={`w-full flex items-center gap-2 px-2 py-1 rounded-md transition-colors text-xs ${
                                                    selectedProject?.id === project.id 
                                                        ? 'bg-cyan-500/20 text-cyan-400' 
                                                        : 'hover:bg-card/50 text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <List className="w-3.5 h-3.5" />
                                                <span className="flex-1 text-left truncate">{project.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{project.tasks.length}</span>
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
                    <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-card/50 transition-colors text-muted-foreground mt-2">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">New Space</span>
                    </button>
                </div>
            </ScrollArea>
        </div>
    );

    // Task Card component
    const TaskCard = ({ task }: { task: Task }) => (
        <div className="bg-card/50 border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors cursor-pointer group">
            <p className="text-sm text-foreground mb-2">{task.title}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {task.priority === 'high' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-red-500/50 text-red-400">
                            High
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
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <div className={`w-2 h-2 rounded-full ${column.color}`} />
                            <span className={`text-xs font-bold uppercase ${column.textColor}`}>{column.label}</span>
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{tasks.length}</Badge>
                        </div>
                        
                        {/* Tasks */}
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                            
                            {/* Add Task Button */}
                            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border/50 hover:border-primary/30 hover:bg-card/30 transition-colors text-muted-foreground text-sm">
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
                <main className="flex-1 p-4 overflow-auto">
                    {selectedProject ? (
                        viewMode === 'board' ? (
                            <BoardView />
                        ) : (
                            <div className="text-muted-foreground text-sm">List view coming soon...</div>
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
        </div>
    );
};

export default TaskFlow;
