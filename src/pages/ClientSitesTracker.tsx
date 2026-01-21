import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Plus,
    X,
    FileText,
    Trash2,
    ExternalLink,
    BookOpen,
    Globe,
    Github,
    Wand2,
    Check,
    Edit2,
    Archive,
    ArchiveRestore
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { AITextarea } from '@/components/AITextarea';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
    number: number;
    title: string;
    shortTitle: string;
    sop: string;
}

// Default workflow steps with SOPs
const defaultWorkflowSteps: WorkflowStep[] = [
    {
        number: 1,
        title: "Client Submits Form",
        shortTitle: "Form Submitted",
        sop: `<strong>What happens:</strong>
            <ul>
                <li>Client fills out website request form</li>
                <li>Form captures: business info, services, brand assets</li>
                <li>Notification sent to Manager</li>
            </ul>
            <strong>Action:</strong> None - Automatic`
    },
    {
        number: 2,
        title: "Manager Reviews & Talks to Client",
        shortTitle: "Manager Review",
        sop: `<strong>Manager Actions:</strong>
            <ul>
                <li>Review form submission</li>
                <li>Call/message client on Telegram if needed</li>
                <li>Gather missing assets</li>
                <li>Confirm business type (mobile vs physical)</li>
            </ul>`
    },
    {
        number: 3,
        title: "Manager Creates Repository",
        shortTitle: "Repo Created",
        sop: `<strong>Manager Actions:</strong>
            <ul>
                <li>Choose base template</li>
                <li>Copy project to Desktop</li>
                <li>Create GitHub repository</li>
                <li>Push to GitHub</li>
            </ul>`
    },
    {
        number: 4,
        title: "Request Auto-Deployment",
        shortTitle: "Deploy Requested",
        sop: `<strong>Manager → Senior Dev:</strong>
            <ul>
                <li>Send repo URL</li>
                <li>Staging: clientnamewebsite.rankmehigher.com</li>
                <li>Password: mundelein</li>
            </ul>`
    },
    {
        number: 5,
        title: "Senior Dev Sets Up Deployment",
        shortTitle: "Deploy Ready",
        sop: `<strong>Senior Dev:</strong>
            <ul>
                <li>Configure VPS</li>
                <li>Set up staging domain</li>
                <li>Add password protection</li>
                <li>Test auto-deployment</li>
            </ul>`
    },
    {
        number: 6,
        title: "Manager Designs Initial Pages",
        shortTitle: "Design",
        sop: `<strong>Manager:</strong>
            <ul>
                <li>Clone repo, open in Cursor</li>
                <li>Update branding</li>
                <li>Design homepage, services, contact</li>
                <li>Push → check staging</li>
            </ul>`
    },
    {
        number: 7,
        title: "Schedule Design Review",
        shortTitle: "Client Review",
        sop: `<strong>Manager:</strong>
            <ul>
                <li>Send staging link to client</li>
                <li>Schedule 15-30 min call</li>
                <li>Get feedback</li>
            </ul>`
    },
    {
        number: 8,
        title: "Client Approves Design",
        shortTitle: "Design Approved",
        sop: `<strong>Client sign-off on:</strong>
            <ul>
                <li>Design direction</li>
                <li>Colors & branding</li>
                <li>Ready for full build</li>
            </ul>`
    },
    {
        number: 9,
        title: "Build Full Website Structure",
        shortTitle: "Full Build",
        sop: `<strong>Pages to build:</strong>
            <ul>
                <li>Home, Services, About, Contact, Blog</li>
                <li>5 Service Area Pages</li>
                <li>Privacy Policy, Terms</li>
            </ul>`
    },
    {
        number: 10,
        title: "Senior Manager Reviews Structure",
        shortTitle: "Structure Review",
        sop: `<strong>Senior Manager checks:</strong>
            <ul>
                <li>All pages created?</li>
                <li>Navigation complete?</li>
                <li>Forms placed correctly?</li>
                <li>Mobile responsive?</li>
            </ul>`
    },
    {
        number: 11,
        title: "Content Writing",
        shortTitle: "Content",
        sop: `<strong>Write copy for all pages:</strong>
            <ul>
                <li>Use Claude with Alex Hormozi prompts</li>
                <li>Benefit-driven, no fluff</li>
                <li>Strong CTAs</li>
                <li>Local SEO</li>
            </ul>`
    },
    {
        number: 12,
        title: "Senior Manager Approves Content",
        shortTitle: "Content Approved",
        sop: `<strong>Senior Manager reviews:</strong>
            <ul>
                <li>Copy quality</li>
                <li>No AI fluff</li>
                <li>Alex Hormozi tone</li>
                <li>Grammar perfect</li>
            </ul>`
    },
    {
        number: 13,
        title: "Technical SEO",
        shortTitle: "SEO",
        sop: `<strong>Complete for ALL pages:</strong>
            <ul>
                <li>Meta titles & descriptions</li>
                <li>H1/H2/H3 structure</li>
                <li>Image alt text</li>
                <li>Schema markup</li>
                <li>Page speed < 3 sec</li>
            </ul>`
    },
    {
        number: 14,
        title: "Full Quality Check",
        shortTitle: "QA",
        sop: `<strong>Test everything:</strong>
            <ul>
                <li>All forms work</li>
                <li>All links work</li>
                <li>Mobile responsive</li>
                <li>Page speed</li>
                <li>Cross-browser</li>
            </ul>`
    },
    {
        number: 15,
        title: "Senior Manager Final Review",
        shortTitle: "Final Review",
        sop: `<strong>Senior Manager final check:</strong>
            <ul>
                <li>Content quality</li>
                <li>SEO complete</li>
                <li>All functionality works</li>
                <li>Ready for production</li>
            </ul>`
    },
    {
        number: 16,
        title: "Go Live on Production Domain",
        shortTitle: "Go Live",
        sop: `<strong>Senior Dev:</strong>
            <ul>
                <li>Migrate to clientname.com</li>
                <li>Remove password</li>
                <li>Install SSL</li>
                <li>Test live site</li>
            </ul>
            <strong>Manager:</strong>
            <ul>
                <li>Set up analytics</li>
                <li>Client delivery</li>
            </ul>`
    }
];

interface SubTask {
    id: number;
    name: string;
    completed: boolean;
}

interface ClientSite {
    id: number;
    clientName: string;
    taskName?: string;
    description?: string;
    domain?: string;
    repoUrl?: string;
    notes?: string;
    isMobileBusiness: boolean;
    currentStep: number;
    createdAt: string;
    subtasks?: SubTask[];
    archived?: boolean;
}

interface ClientSitesTrackerProps {
    embedded?: boolean;
}

const ClientSitesTracker: React.FC<ClientSitesTrackerProps> = ({ embedded = false }) => {
    const { toast } = useToast();
    const [sites, setSites] = useState<ClientSite[]>([]);
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(defaultWorkflowSteps);
    const [selectedSite, setSelectedSite] = useState<ClientSite | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showSOPsModal, setShowSOPsModal] = useState(false);
    const [draggedSite, setDraggedSite] = useState<ClientSite | null>(null);
    const [dragOverStep, setDragOverStep] = useState<number | null>(null);
    const [editingTaskName, setEditingTaskName] = useState(false);
    const [taskNameInput, setTaskNameInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');
    const [newSubTaskName, setNewSubTaskName] = useState('');
    const [creatingInStep, setCreatingInStep] = useState<number | null>(null);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [siteToArchive, setSiteToArchive] = useState<ClientSite | null>(null);
    const [archivePassword, setArchivePassword] = useState('');
    const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
    const [showEditStepModal, setShowEditStepModal] = useState(false);
    const [stepTitleInput, setStepTitleInput] = useState('');
    const [stepShortTitleInput, setStepShortTitleInput] = useState('');
    const [addingStepAfter, setAddingStepAfter] = useState<number | null>(null);
    const [showAddStepModal, setShowAddStepModal] = useState(false);
    const [newStepTitle, setNewStepTitle] = useState('');
    const [newStepShortTitle, setNewStepShortTitle] = useState('');
    const [editingSiteName, setEditingSiteName] = useState<number | null>(null);
    const [editingSiteNameInput, setEditingSiteNameInput] = useState('');
    const [showDeleteStepModal, setShowDeleteStepModal] = useState(false);
    const [stepToDelete, setStepToDelete] = useState<WorkflowStep | null>(null);
    const [deleteStepPassword, setDeleteStepPassword] = useState('');
    const [addingTaskInStep, setAddingTaskInStep] = useState<number | null>(null);
    const [newTaskNameInput, setNewTaskNameInput] = useState('');
    const [showArchivedModal, setShowArchivedModal] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('clientSites');
        if (saved) {
            try {
                setSites(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading sites:', e);
            }
        }
        
        const savedSteps = localStorage.getItem('workflowSteps');
        if (savedSteps) {
            try {
                setWorkflowSteps(JSON.parse(savedSteps));
            } catch (e) {
                console.error('Error loading workflow steps:', e);
            }
        }
    }, []);

    // Save to localStorage
    const saveSites = (newSites: ClientSite[]) => {
        setSites(newSites);
        localStorage.setItem('clientSites', JSON.stringify(newSites));
    };

    const saveWorkflowSteps = (newSteps: WorkflowStep[]) => {
        setWorkflowSteps(newSteps);
        localStorage.setItem('workflowSteps', JSON.stringify(newSteps));
    };

    const generateStagingDomain = (clientName: string) => {
        return clientName.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '')
            .replace(/-+/g, '') + 'website.rankmehigher.com';
    };

    const handleCreateSite = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const stepNumber = creatingInStep || 1;
        
        const newSite: ClientSite = {
            id: Date.now(),
            clientName: formData.get('clientName') as string,
            taskName: formData.get('taskName') as string || undefined,
            domain: formData.get('domain') as string || undefined,
            repoUrl: formData.get('repoUrl') as string || undefined,
            notes: formData.get('notes') as string || undefined,
            isMobileBusiness: formData.get('isMobileBusiness') === 'on',
            currentStep: stepNumber,
            createdAt: new Date().toISOString(),
            subtasks: []
        };

        const newSites = [...sites, newSite];
        saveSites(newSites);
        setShowNewModal(false);
        setCreatingInStep(null);
        e.currentTarget.reset();
    };

    const handleOpenNewTaskInput = (stepNumber: number) => {
        setAddingTaskInStep(stepNumber);
        setNewTaskNameInput('');
    };

    const handleCreateTaskFromInput = () => {
        if (!newTaskNameInput.trim() || !addingTaskInStep) return;

        const newSite: ClientSite = {
            id: Date.now(),
            clientName: newTaskNameInput.trim(),
            taskName: newTaskNameInput.trim(),
            currentStep: addingTaskInStep,
            createdAt: new Date().toISOString(),
            isMobileBusiness: false,
            subtasks: []
        };

        const newSites = [...sites, newSite];
        saveSites(newSites);
        
        setAddingTaskInStep(null);
        setNewTaskNameInput('');
    };

    const handleCancelAddTask = () => {
        setAddingTaskInStep(null);
        setNewTaskNameInput('');
    };

    const handleDeleteSite = () => {
        if (!selectedSite) return;
        setSiteToArchive(selectedSite);
        setShowArchiveModal(true);
    };

    const handleArchiveSite = (site: ClientSite) => {
        setSiteToArchive(site);
        setShowArchiveModal(true);
    };

    const confirmArchive = () => {
        if (archivePassword !== 'mundelein') {
            toast({
                title: "Incorrect password",
                description: "Please enter the correct password to archive.",
                variant: "destructive",
            });
            return;
        }

        if (!siteToArchive) return;

        const newSites = sites.map(s =>
            s.id === siteToArchive.id ? { ...s, archived: true } : s
        );
        saveSites(newSites);

        // Close modals if the archived site was selected
        if (selectedSite?.id === siteToArchive.id) {
            setShowDetailModal(false);
            setSelectedSite(null);
        }

        setShowArchiveModal(false);
        setSiteToArchive(null);
        setArchivePassword('');
        
        toast({
            title: "Site archived",
            description: "The site has been archived successfully.",
        });
    };

    const handleUnarchive = (site: ClientSite) => {
        const newSites = sites.map(s =>
            s.id === site.id ? { ...s, archived: false } : s
        );
        saveSites(newSites);
        
        toast({
            title: "Site unarchived",
            description: "The site has been restored successfully.",
        });
    };

    const getArchivedSites = () => {
        return sites.filter(site => site.archived);
    };

    const handleUpdateSite = (updates: Partial<ClientSite>) => {
        if (!selectedSite) return;
        const newSites = sites.map(s => 
            s.id === selectedSite.id ? { ...s, ...updates } : s
        );
        saveSites(newSites);
        setSelectedSite(newSites.find(s => s.id === selectedSite.id) || null);
    };

    const handleSaveTaskName = () => {
        if (!selectedSite) return;
        handleUpdateSite({ taskName: taskNameInput || selectedSite.clientName });
        setEditingTaskName(false);
    };

    const handleAddSubTask = () => {
        if (!newSubTaskName.trim() || !selectedSite) return;
        
        const newSubTask: SubTask = {
            id: Date.now(),
            name: newSubTaskName.trim(),
            completed: false
        };
        
        const updatedSubtasks = [...(selectedSite.subtasks || []), newSubTask];
        handleUpdateSite({ subtasks: updatedSubtasks });
        setNewSubTaskName('');
    };

    const handleToggleSubTask = (subTaskId: number) => {
        if (!selectedSite) return;
        const updatedSubtasks = (selectedSite.subtasks || []).map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
        );
        handleUpdateSite({ subtasks: updatedSubtasks });
    };

    const handleDeleteSubTask = (subTaskId: number) => {
        if (!selectedSite) return;
        const updatedSubtasks = (selectedSite.subtasks || []).filter(st => st.id !== subTaskId);
        handleUpdateSite({ subtasks: updatedSubtasks });
    };

    // Initialize state when modal opens
    useEffect(() => {
        if (selectedSite && showDetailModal) {
            setTaskNameInput(selectedSite.taskName || selectedSite.clientName);
            setDescriptionInput(selectedSite.description || '');
        }
    }, [selectedSite, showDetailModal]);

    const handleDragStart = (site: ClientSite) => {
        setDraggedSite(site);
    };

    const handleDragEnd = () => {
        setDraggedSite(null);
        setDragOverStep(null);
    };

    const handleDragOver = (e: React.DragEvent, stepNumber: number) => {
        e.preventDefault();
        setDragOverStep(stepNumber);
    };

    const handleDrop = (e: React.DragEvent, stepNumber: number) => {
        e.preventDefault();
        if (!draggedSite) return;

        const newSites = sites.map(site =>
            site.id === draggedSite.id ? { ...site, currentStep: stepNumber } : site
        );
        saveSites(newSites);
        setDraggedSite(null);
        setDragOverStep(null);
    };

    const getSitesByStep = (stepNumber: number) => {
        return sites.filter(site => site.currentStep === stepNumber && !site.archived);
    };

    const handleEditStep = (step: WorkflowStep) => {
        setEditingStep(step);
        setStepTitleInput(step.title);
        setStepShortTitleInput(step.shortTitle);
        setShowEditStepModal(true);
    };

    const handleSaveStepEdit = () => {
        if (!editingStep || !stepTitleInput.trim() || !stepShortTitleInput.trim()) return;
        
        const newSteps = workflowSteps.map(s =>
            s.number === editingStep.number
                ? { ...s, title: stepTitleInput.trim(), shortTitle: stepShortTitleInput.trim() }
                : s
        );
        saveWorkflowSteps(newSteps);
        setShowEditStepModal(false);
        setEditingStep(null);
        setStepTitleInput('');
        setStepShortTitleInput('');
        
        toast({
            title: "Step updated",
            description: "The step has been renamed successfully.",
        });
    };

    const handleAddStepAfter = (stepNumber: number) => {
        setAddingStepAfter(stepNumber);
        setNewStepTitle('');
        setNewStepShortTitle('');
        setShowAddStepModal(true);
    };

    const handleSaveNewStep = () => {
        if (!addingStepAfter || !newStepTitle.trim() || !newStepShortTitle.trim()) return;
        
        const insertIndex = workflowSteps.findIndex(s => s.number === addingStepAfter);
        if (insertIndex === -1) return;
        
        // Create new step with number after the specified step
        const newStepNumber = addingStepAfter + 1;
        
        // Renumber all steps after the insertion point
        const newSteps = [...workflowSteps];
        const newStep: WorkflowStep = {
            number: newStepNumber,
            title: newStepTitle.trim(),
            shortTitle: newStepShortTitle.trim(),
            sop: `<strong>Instructions:</strong>
            <ul>
                <li>Add your SOP instructions here</li>
            </ul>`
        };
        
        // Insert new step and renumber subsequent steps
        newSteps.splice(insertIndex + 1, 0, newStep);
        const renumberedSteps = newSteps.map((s, idx) => ({
            ...s,
            number: idx + 1
        }));
        
        // Update sites that are in steps after the insertion point
        const updatedSites = sites.map(site => {
            if (site.currentStep > addingStepAfter) {
                return { ...site, currentStep: site.currentStep + 1 };
            }
            return site;
        });
        
        saveWorkflowSteps(renumberedSteps);
        if (updatedSites.length !== sites.length || JSON.stringify(updatedSites) !== JSON.stringify(sites)) {
            saveSites(updatedSites);
        }
        
        setShowAddStepModal(false);
        setAddingStepAfter(null);
        setNewStepTitle('');
        setNewStepShortTitle('');
        
        toast({
            title: "Step added",
            description: "The new step has been added successfully.",
        });
    };

    const handleDeleteStep = (step: WorkflowStep) => {
        setStepToDelete(step);
        setShowDeleteStepModal(true);
    };

    const confirmDeleteStep = () => {
        if (deleteStepPassword !== 'mundelein') {
            toast({
                title: "Incorrect password",
                description: "Please enter the correct password to delete the step.",
                variant: "destructive",
            });
            return;
        }

        if (!stepToDelete) return;

        // Don't allow deleting if it's the only step
        if (workflowSteps.length <= 1) {
            toast({
                title: "Cannot delete",
                description: "You must have at least one step in the workflow.",
                variant: "destructive",
            });
            return;
        }

        // Remove the step and renumber remaining steps
        const newSteps = workflowSteps
            .filter(s => s.number !== stepToDelete.number)
            .map((s, idx) => ({
                ...s,
                number: idx + 1
            }));

        // Move sites from deleted step to previous step (or first step if deleting step 1)
        const deletedStepNumber = stepToDelete.number;
        const targetStepNumber = deletedStepNumber > 1 ? deletedStepNumber - 1 : 1;
        
        const updatedSites = sites.map(site => {
            if (site.currentStep === deletedStepNumber) {
                return { ...site, currentStep: targetStepNumber };
            } else if (site.currentStep > deletedStepNumber) {
                return { ...site, currentStep: site.currentStep - 1 };
            }
            return site;
        });

        saveWorkflowSteps(newSteps);
        saveSites(updatedSites);

        setShowDeleteStepModal(false);
        setStepToDelete(null);
        setDeleteStepPassword('');

        toast({
            title: "Step deleted",
            description: `Step "${stepToDelete.title}" has been deleted. Tasks have been moved to the previous step.`,
        });
    };

    const handleStartEditingSiteName = (site: ClientSite, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSiteName(site.id);
        setEditingSiteNameInput(site.taskName || site.clientName);
    };

    const handleSaveSiteName = (siteId: number) => {
        const newSites = sites.map(s =>
            s.id === siteId ? { ...s, taskName: editingSiteNameInput.trim() || s.clientName } : s
        );
        saveSites(newSites);
        setEditingSiteName(null);
        setEditingSiteNameInput('');
        
        // Update selectedSite if it's the one being edited
        if (selectedSite?.id === siteId) {
            setSelectedSite(newSites.find(s => s.id === siteId) || null);
        }
    };

    const handleCancelEditingSiteName = () => {
        setEditingSiteName(null);
        setEditingSiteNameInput('');
    };

    return (
        <div className={embedded ? "h-full" : "min-h-screen bg-background relative overflow-hidden"}>
            {!embedded && (
                <>
                    <Helmet>
                        <title>Client Sites Tracker | Rank Me Higher</title>
                    </Helmet>
                    <HUDOverlay />
                </>
            )}

            <div className={embedded ? "h-full flex flex-col p-4" : "relative z-10 container mx-auto px-4 py-6 max-w-[calc(100vw-2rem)]"}>
                {/* Header */}
                {!embedded && (
                    <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-border">
                        <div>
                            <h1 className="font-orbitron text-2xl font-bold text-foreground">Client Sites Tracker</h1>
                            <p className="text-sm text-muted-foreground mt-1">Rank Me Higher Websites - 16 Step Workflow</p>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <Button
                                variant="outline"
                                onClick={() => setShowArchivedModal(true)}
                                className="gap-2"
                            >
                                <Archive className="w-4 h-4" />
                                Archived Sites ({getArchivedSites().length})
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowSOPsModal(true)}
                                className="gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                View SOPs
                            </Button>
                            <Button
                                onClick={() => setShowNewModal(true)}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Client Site
                            </Button>
                        </div>
                    </header>
                )}
                
                {embedded && (
                    <div className="flex justify-end gap-2 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSOPsModal(true)}
                            className="gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            View SOPs
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowNewModal(true)}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Client Site
                        </Button>
                    </div>
                )}

                {/* Board */}
                <div className={`w-full overflow-x-auto pb-4 flex-1 ${embedded ? 'overflow-y-hidden' : ''}`} style={{ scrollbarWidth: 'thin', scrollbarColor: '#3a3a3a #1a1a1a' }}>
                    <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                        {workflowSteps.map((step) => {
                            const stepSites = getSitesByStep(step.number);
                            return (
                                <div
                                    key={step.number}
                                    className={`flex-shrink-0 w-72 bg-card/30 rounded-xl border border-border/50 p-4 min-h-[500px] transition-colors group ${
                                        dragOverStep === step.number ? 'bg-card/50 border-primary/50' : ''
                                    }`}
                                    onDragOver={(e) => handleDragOver(e, step.number)}
                                    onDrop={(e) => handleDrop(e, step.number)}
                                    onDragLeave={() => setDragOverStep(null)}
                                >
                                    {/* Column Header */}
                                    <div className="mb-4 pb-3 border-b border-border/50 group/header relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-lg font-bold text-primary">
                                                Step {step.number}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditStep(step);
                                                    }}
                                                    className="h-6 w-6 p-0 opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-card/50"
                                                    title="Edit step name"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteStep(step);
                                                    }}
                                                    className="h-6 w-6 p-0 opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-destructive/20 text-destructive hover:text-destructive/80"
                                                    title="Delete step"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-foreground">{step.shortTitle}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {stepSites.length}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Sites */}
                                    <div className="space-y-2">
                                        {stepSites.map((site) => (
                                            <div
                                                key={site.id}
                                                draggable={editingSiteName !== site.id}
                                                onDragStart={() => handleDragStart(site)}
                                                onDragEnd={handleDragEnd}
                                                className="bg-card/50 border border-border/50 rounded-lg p-3 hover:border-primary/50 hover:bg-card/70 transition-all group relative"
                                            >
                                                {editingSiteName === site.id ? (
                                                    <div className="space-y-2">
                                                        <Input
                                                            value={editingSiteNameInput}
                                                            onChange={(e) => setEditingSiteNameInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleSaveSiteName(site.id);
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    e.preventDefault();
                                                                    handleCancelEditingSiteName();
                                                                }
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="font-semibold text-sm h-8"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-1 justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCancelEditingSiteName();
                                                                }}
                                                                className="h-6 px-2"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveSiteName(site.id);
                                                                }}
                                                                className="h-6 px-2"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div
                                                            onClick={() => {
                                                                setSelectedSite(site);
                                                                setShowDetailModal(true);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <div
                                                                className="font-semibold text-sm mb-2 hover:text-primary transition-colors cursor-text"
                                                                onClick={(e) => handleStartEditingSiteName(site, e)}
                                                                title="Click to rename"
                                                            >
                                                                {site.taskName || site.clientName}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                                                {site.domain ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <Globe className="w-3 h-3" />
                                                                        {site.domain}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1">
                                                                        <Globe className="w-3 h-3" />
                                                                        {generateStagingDomain(site.clientName)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleArchiveSite(site);
                                                            }}
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/20 rounded text-destructive hover:text-destructive/80"
                                                            title="Archive site"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {addingTaskInStep === step.number ? (
                                            <div className="bg-card/50 border border-border/50 rounded-lg p-3 space-y-2">
                                                <Input
                                                    value={newTaskNameInput}
                                                    onChange={(e) => setNewTaskNameInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newTaskNameInput.trim()) {
                                                            e.preventDefault();
                                                            handleCreateTaskFromInput();
                                                        }
                                                        if (e.key === 'Escape') {
                                                            e.preventDefault();
                                                            handleCancelAddTask();
                                                        }
                                                    }}
                                                    placeholder="Task Name..."
                                                    className="text-sm"
                                                    autoFocus
                                                />
                                                <div className="flex gap-1 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleCancelAddTask}
                                                        className="h-6 px-2"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleCreateTaskFromInput}
                                                        disabled={!newTaskNameInput.trim()}
                                                        className="h-6 px-2"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenNewTaskInput(step.number)}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-card/30 transition-colors text-muted-foreground text-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Task
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* New Site Modal */}
            <Dialog open={showNewModal} onOpenChange={(open) => {
                setShowNewModal(open);
                if (!open) setCreatingInStep(null);
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {creatingInStep ? `New Task - Step ${creatingInStep}: ${workflowSteps[creatingInStep - 1].title}` : 'New Client Site'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSite} className="space-y-4">
                        <div>
                            <Label>Task Name *</Label>
                            <Input name="taskName" required placeholder="e.g., Quick Fix Plumbing Website" />
                        </div>
                        <div>
                            <Label>Client/Business Name *</Label>
                            <Input name="clientName" required placeholder="e.g., Quick Fix Plumbing" />
                        </div>
                        <div>
                            <Label>Domain (if available)</Label>
                            <Input name="domain" placeholder="e.g., quickfixplumbing.com" />
                        </div>
                        <div>
                            <Label>GitHub Repository URL</Label>
                            <Input name="repoUrl" placeholder="https://github.com/Rank-Me-Higher-Websites/..." />
                        </div>
                        <div className="flex items-start gap-2">
                            <Checkbox name="isMobileBusiness" id="isMobileBusiness" />
                            <div className="flex-1">
                                <Label htmlFor="isMobileBusiness" className="cursor-pointer">
                                    Mobile/Service-Based Business? (Goes to client locations)
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Check this if the business travels to clients (e.g., plumbing, HVAC, junk removal).
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label>Project Notes</Label>
                            <Textarea name="notes" placeholder="Any special requirements or notes..." rows={4} />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Project</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Modal */}
            {selectedSite && (
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                {editingTaskName ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input
                                            value={taskNameInput}
                                            onChange={(e) => setTaskNameInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSaveTaskName();
                                                }
                                                if (e.key === 'Escape') {
                                                    setEditingTaskName(false);
                                                    setTaskNameInput(selectedSite.taskName || selectedSite.clientName);
                                                }
                                            }}
                                            className="flex-1"
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={handleSaveTaskName} className="gap-1">
                                            <Check className="w-4 h-4" />
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => {
                                            setEditingTaskName(false);
                                            setTaskNameInput(selectedSite.taskName || selectedSite.clientName);
                                        }}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <span>{selectedSite.taskName || selectedSite.clientName}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingTaskName(true)}
                                            className="gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            {/* Task Name & Description */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-2">Description</Label>
                                    <AITextarea
                                        value={descriptionInput}
                                        onChange={(value) => {
                                            setDescriptionInput(value);
                                            handleUpdateSite({ description: value });
                                        }}
                                        placeholder="Add a description for this task..."
                                        rows={4}
                                        fieldContext="task description for website project"
                                    />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-card/50 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground mb-1">Current Step</div>
                                    <div className="font-semibold">
                                        Step {selectedSite.currentStep}/16: {workflowSteps[selectedSite.currentStep - 1].title}
                                    </div>
                                </div>
                                <div className="bg-card/50 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground mb-1">Production Domain</div>
                                    <div className="font-semibold">{selectedSite.domain || 'Not set'}</div>
                                </div>
                                <div className="bg-card/50 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground mb-1">Staging Domain</div>
                                    <div className="font-semibold">
                                        <a
                                            href={`https://${generateStagingDomain(selectedSite.clientName)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            {generateStagingDomain(selectedSite.clientName)}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <div className="text-xs text-muted-foreground mt-1">Password: mundelein</div>
                                    </div>
                                </div>
                                <div className="bg-card/50 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground mb-1">Repository</div>
                                    <div className="font-semibold">
                                        {selectedSite.repoUrl ? (
                                            <a
                                                href={selectedSite.repoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                View Repo
                                                <Github className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            'Not set'
                                        )}
                                    </div>
                                </div>
                                <div className="bg-card/50 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground mb-1">Business Type</div>
                                    <div className="font-semibold">
                                        {selectedSite.isMobileBusiness ? '🚗 Mobile/Service' : '🏪 Physical Location'}
                                    </div>
                                </div>
                                <div className="bg-card/50 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground mb-1">Created</div>
                                    <div className="font-semibold">
                                        {new Date(selectedSite.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Subtasks */}
                            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-lg">Subtasks</h3>
                                    <Badge variant="secondary" className="text-xs">
                                        {(selectedSite.subtasks || []).filter(st => st.completed).length} / {(selectedSite.subtasks || []).length}
                                    </Badge>
                                </div>
                                
                                {/* Subtasks List */}
                                <div className="space-y-2 mb-4">
                                    {(selectedSite.subtasks || []).map((subtask) => (
                                        <div key={subtask.id} className="flex items-center gap-3 p-2 bg-card/30 rounded-lg border border-border/30">
                                            <Checkbox
                                                checked={subtask.completed}
                                                onCheckedChange={() => handleToggleSubTask(subtask.id)}
                                            />
                                            <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                {subtask.name}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteSubTask(subtask.id)}
                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Subtask */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newSubTaskName}
                                        onChange={(e) => setNewSubTaskName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSubTask();
                                            }
                                        }}
                                        placeholder="Add a subtask..."
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleAddSubTask}
                                        disabled={!newSubTaskName.trim()}
                                        size="sm"
                                        className="gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Current Step SOP */}
                            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Current Step Instructions</h3>
                                </div>
                                <div
                                    className="text-sm space-y-2 [&_strong]:text-foreground [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1 [&_li]:text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                        __html: workflowSteps[selectedSite.currentStep - 1].sop
                                            .replace(/clientnamewebsite\.rankmehigher\.com/g, generateStagingDomain(selectedSite.clientName))
                                            .replace(/clientname\.com/g, selectedSite.domain || 'clientname.com')
                                    }}
                                />
                            </div>

                            {selectedSite.notes && (
                                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-2">Project Notes</div>
                                    <div className="text-sm whitespace-pre-wrap">{selectedSite.notes}</div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button variant="destructive" onClick={handleDeleteSite} className="gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Archive Project
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Archive Modal */}
            <Dialog open={showArchiveModal} onOpenChange={(open) => {
                setShowArchiveModal(open);
                if (!open) {
                    setArchivePassword('');
                    setSiteToArchive(null);
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" />
                            Archive Site
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to archive <strong>{siteToArchive?.taskName || siteToArchive?.clientName}</strong>? 
                            Archived sites will be hidden from the main view but can be restored later.
                        </p>
                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={archivePassword}
                                onChange={(e) => setArchivePassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        confirmArchive();
                                    }
                                }}
                                placeholder="Enter password to confirm"
                                className="mt-1"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Password: <code className="bg-muted px-1 rounded">mundelein</code>
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowArchiveModal(false);
                                    setArchivePassword('');
                                    setSiteToArchive(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmArchive}
                                disabled={!archivePassword.trim()}
                            >
                                Archive Site
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Step Modal */}
            <Dialog open={showEditStepModal} onOpenChange={(open) => {
                setShowEditStepModal(open);
                if (!open) {
                    setEditingStep(null);
                    setStepTitleInput('');
                    setStepShortTitleInput('');
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5" />
                            Edit Step
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Step Title</Label>
                            <Input
                                value={stepTitleInput}
                                onChange={(e) => setStepTitleInput(e.target.value)}
                                placeholder="e.g., Client Submits Form"
                                className="mt-1"
                                autoFocus
                            />
                        </div>
                        <div>
                            <Label>Short Title</Label>
                            <Input
                                value={stepShortTitleInput}
                                onChange={(e) => setStepShortTitleInput(e.target.value)}
                                placeholder="e.g., Form Submitted"
                                className="mt-1"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowEditStepModal(false);
                                    setEditingStep(null);
                                    setStepTitleInput('');
                                    setStepShortTitleInput('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveStepEdit}
                                disabled={!stepTitleInput.trim() || !stepShortTitleInput.trim()}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Step Modal */}
            <Dialog open={showAddStepModal} onOpenChange={(open) => {
                setShowAddStepModal(open);
                if (!open) {
                    setAddingStepAfter(null);
                    setNewStepTitle('');
                    setNewStepShortTitle('');
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add New Step
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {addingStepAfter !== null && (
                            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                                <p className="text-sm text-primary">
                                    Adding step after: <strong>Step {addingStepAfter} - {workflowSteps.find(s => s.number === addingStepAfter)?.title}</strong>
                                </p>
                            </div>
                        )}
                        <div>
                            <Label>Step Title *</Label>
                            <Input
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.target.value)}
                                placeholder="e.g., Issue Done in QA"
                                className="mt-1"
                                autoFocus
                            />
                        </div>
                        <div>
                            <Label>Short Title *</Label>
                            <Input
                                value={newStepShortTitle}
                                onChange={(e) => setNewStepShortTitle(e.target.value)}
                                placeholder="e.g., QA Complete"
                                className="mt-1"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddStepModal(false);
                                    setAddingStepAfter(null);
                                    setNewStepTitle('');
                                    setNewStepShortTitle('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveNewStep}
                                disabled={!newStepTitle.trim() || !newStepShortTitle.trim()}
                            >
                                Add Step
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Step Modal */}
            <Dialog open={showDeleteStepModal} onOpenChange={(open) => {
                setShowDeleteStepModal(open);
                if (!open) {
                    setDeleteStepPassword('');
                    setStepToDelete(null);
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" />
                            Delete Step
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete <strong>Step {stepToDelete?.number}: {stepToDelete?.title}</strong>? 
                            Tasks in this step will be moved to the previous step. This action cannot be undone.
                        </p>
                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={deleteStepPassword}
                                onChange={(e) => setDeleteStepPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        confirmDeleteStep();
                                    }
                                }}
                                placeholder="Enter password to confirm"
                                className="mt-1"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Password: <code className="bg-muted px-1 rounded">mundelein</code>
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteStepModal(false);
                                    setDeleteStepPassword('');
                                    setStepToDelete(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmDeleteStep}
                                disabled={!deleteStepPassword.trim()}
                            >
                                Delete Step
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Archived Sites Modal */}
            <Dialog open={showArchivedModal} onOpenChange={setShowArchivedModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Archive className="w-5 h-5" />
                            Archived Sites
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {getArchivedSites().length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No archived sites</p>
                                <p className="text-sm mt-2">Archived sites will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {getArchivedSites().map((site) => (
                                    <div
                                        key={site.id}
                                        className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="font-semibold text-lg">
                                                        {site.taskName || site.clientName}
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        Step {site.currentStep}: {workflowSteps[site.currentStep - 1]?.shortTitle || 'Unknown'}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-sm text-muted-foreground">
                                                    {site.domain && (
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="w-4 h-4" />
                                                            {site.domain}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <span>Archived: {new Date(site.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                {site.description && (
                                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                        {site.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUnarchive(site)}
                                                    className="gap-2"
                                                >
                                                    <ArchiveRestore className="w-4 h-4" />
                                                    Unarchive
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedSite(site);
                                                        setShowDetailModal(true);
                                                        setShowArchivedModal(false);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* SOPs Modal */}
            <Dialog open={showSOPsModal} onOpenChange={setShowSOPsModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Standard Operating Procedures
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[calc(90vh-100px)]">
                        <div className="space-y-6 pr-4">
                            {workflowSteps.map((step) => (
                                <div key={step.number} className="bg-card/50 rounded-lg p-4 border border-border/50">
                                    <div className="font-semibold text-lg text-primary mb-3">
                                        Step {step.number}: {step.title}
                                    </div>
                                    <div
                                        className="text-sm space-y-2 [&_strong]:text-foreground [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1 [&_li]:text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: step.sop }}
                                    />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClientSitesTracker;
