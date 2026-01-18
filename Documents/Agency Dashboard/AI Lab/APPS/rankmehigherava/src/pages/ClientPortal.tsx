import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Building2,
    Globe,
    Phone,
    Mail,
    MapPin,
    UserPlus,
    Layout,
    ArrowRight,
    Sparkles,
    Layers,
    MonitorSmartphone,
    X,
    Target,
    Palette,
    Send,
    Loader2,
    Check,
    Trash2,
    Archive,
    ArchiveRestore,
    Lock,
    AlertTriangle,
    Search,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    List,
    RefreshCw,
    MoreHorizontal,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    PlusCircle,
    Code,
    ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import FileUpload from '@/components/FileUpload';
import LogoGenerator from '@/components/LogoGenerator';

// Helper function to check if client is new (created within last 7 days)
const isNewClient = (client: any): boolean => {
    if (!client.created_at) return false;
    // Check if client is marked as existing in notes
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            if (parsed?.is_existing_client === true) return false;
        } catch {}
    }
    const createdAt = new Date(client.created_at);
    const now = new Date();
    const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
};

// Helper function to check if client is existing (taken over, not new)
const isExistingClient = (client: any): boolean => {
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            return parsed?.is_existing_client === true;
        } catch {}
    }
    return false;
};

// Helper function to get logo from client data
const getClientLogo = (client: any): string | null => {
    // Try to get logo from logo_url field first
    if (client.logo_url) return client.logo_url;
    
    // Try to parse notes as JSON and get logo_files
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            if (parsed?.logo_files) {
                const logos = Array.isArray(parsed.logo_files) ? parsed.logo_files : [parsed.logo_files];
                if (logos.length > 0 && logos[0]) return logos[0];
            }
        } catch {
            // Notes is not JSON
        }
    }
    
    return null;
};

// Helper function to get funnel domains from client data
const getFunnelDomains = (client: any): { dummyDomain: string | null; liveDomain: string | null } => {
    if (client.notes) {
        try {
            const parsed = JSON.parse(client.notes);
            return {
                dummyDomain: parsed?.dummy_domain || null,
                liveDomain: parsed?.live_domain || null,
            };
        } catch {
            // Notes is not JSON
        }
    }
    return { dummyDomain: null, liveDomain: null };
};

const ClientPortal: React.FC = () => {
    // DEBUG: Force rebuild - timestamp 2026-01-17 with search bar
    console.log('ClientPortal rendering with SEARCH BAR...', new Date().toISOString());
    
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    // Funnel form modal state
    const [showFunnelForm, setShowFunnelForm] = useState(false);
    const [funnelStep, setFunnelStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [funnelFormData, setFunnelFormData] = useState({
        companyName: '',
        businessEmail: '',
        businessPhone: '',
        funnelGoal: '',
        targetAudience: '',
        mainOffer: '',
        dummyDomain: '',
        liveDomain: '',
        websiteColors: '',
        additionalNotes: '',
    });
    const [hasLogo, setHasLogo] = useState('');
    const [logoFiles, setLogoFiles] = useState<string[]>([]);
    const [logoAttempts, setLogoAttempts] = useState(0);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    
    // Website form modal state (quick add)
    const [showWebsiteForm, setShowWebsiteForm] = useState(false);
    const [websiteFormData, setWebsiteFormData] = useState({
        companyName: '',
        businessEmail: '',
        businessPhone: '',
        websiteUrl: '',
        primaryServices: [] as string[],
        targetAudience: '',
        additionalNotes: '',
    });
    const [websiteHasLogo, setWebsiteHasLogo] = useState('');
    const [websiteLogoFiles, setWebsiteLogoFiles] = useState<string[]>([]);
    const [isSubmittingWebsite, setIsSubmittingWebsite] = useState(false);
    
    // Global search state for all clients
    const [globalSearch, setGlobalSearch] = useState('');
    
    // Expand/collapse state for sections (show all vs limited)
    const [showAllWebsites, setShowAllWebsites] = useState(false);
    const [showAllFunnels, setShowAllFunnels] = useState(false);
    const MAX_VISIBLE_CARDS = 6; // Show max 6 cards per section
    
    // Track which domain (dummy vs live) to show for each funnel client
    const [funnelDomainView, setFunnelDomainView] = useState<Record<string, 'dummy' | 'live'>>({});
    
    // Scroll refs for horizontal navigation
    const websiteScrollRef = useRef<HTMLDivElement>(null);
    const funnelScrollRef = useRef<HTMLDivElement>(null);
    
    const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };
    
    const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };
    
    // Delete/Archive modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [passwordVerified, setPasswordVerified] = useState(false);
    const [selectedClientForDelete, setSelectedClientForDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    
    // Existing client modal state
    const [showExistingClientTypeModal, setShowExistingClientTypeModal] = useState(false);
    const [showExistingWebsiteForm, setShowExistingWebsiteForm] = useState(false);
    const [showExistingFunnelForm, setShowExistingFunnelForm] = useState(false);
    const [existingWebsiteFormData, setExistingWebsiteFormData] = useState({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        liveDomain: '',
        currentPlatform: '',
        githubRepoUrl: '',
        services: [] as string[],
        isMobileBusiness: false,
        hasHostingAccess: false,
        hasDomainAccess: false,
        notes: '',
    });
    const [existingFunnelFormData, setExistingFunnelFormData] = useState({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        funnelName: '',
        funnelUrl: '',
        funnelType: '',
        currentPlatform: '',
        hasPaymentIntegration: false,
        hasEmailAutomation: false,
        hasTrackingPixels: false,
        notes: '',
    });
    const [isSubmittingExistingWebsite, setIsSubmittingExistingWebsite] = useState(false);
    const [isSubmittingExistingFunnel, setIsSubmittingExistingFunnel] = useState(false);
    
    const DELETE_PASSWORD = 'mundelein';

    const handleDeleteClick = (e: React.MouseEvent, client: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedClientForDelete(client);
        setShowDeleteModal(true);
        setPasswordVerified(false);
        setDeletePassword('');
    };

    const verifyPassword = () => {
        if (deletePassword === DELETE_PASSWORD) {
            setPasswordVerified(true);
        } else {
            toast({
                title: "Incorrect password",
                description: "Please enter the correct password.",
                variant: "destructive",
            });
        }
    };

    const handleArchive = async () => {
        if (!selectedClientForDelete) return;
        setIsDeleting(true);
        
        try {
            const { error } = await supabase
                .from('clients')
                .update({ status: 'ARCHIVED' })
                .eq('id', selectedClientForDelete.id);
            
            if (error) throw error;
            
            queryClient.invalidateQueries({ queryKey: ['all-clients'] });
            toast({
                title: "Client archived",
                description: `${selectedClientForDelete.company_name || selectedClientForDelete.name} has been archived.`,
            });
            setShowDeleteModal(false);
            setSelectedClientForDelete(null);
        } catch (error) {
            console.error('Archive error:', error);
            toast({
                title: "Archive failed",
                description: "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!selectedClientForDelete) return;
        setIsDeleting(true);
        
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', selectedClientForDelete.id);
            
            if (error) throw error;
            
            queryClient.invalidateQueries({ queryKey: ['all-clients'] });
            toast({
                title: "Client permanently deleted",
                description: `${selectedClientForDelete.company_name || selectedClientForDelete.name} has been removed.`,
            });
            setShowDeleteModal(false);
            setSelectedClientForDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: "Delete failed",
                description: "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRestoreFromArchive = async (client: any) => {
        try {
            const { error } = await supabase
                .from('clients')
                .update({ status: 'PENDING' })
                .eq('id', client.id);
            
            if (error) throw error;
            
            queryClient.invalidateQueries({ queryKey: ['all-clients'] });
            toast({
                title: "Client restored",
                description: `${client.company_name || client.name} has been restored.`,
            });
        } catch (error) {
            console.error('Restore error:', error);
            toast({
                title: "Restore failed",
                variant: "destructive",
            });
        }
    };

    // AI Auto-Fill for funnel form
    const handleAIAutoFill = async () => {
        setIsGeneratingAI(true);
        console.log('Starting AI auto-fill for funnel...');
        
        try {
            const { data, error } = await supabase.functions.invoke('generate-dummy-submission', {
                body: { type: 'funnel' }
            });

            console.log('AI response:', { data, error });

            if (error) {
                console.error('Supabase function error:', error);
                throw error;
            }

            if (!data?.success) {
                console.error('Function returned unsuccessful:', data);
                throw new Error(data?.error || 'AI generation failed');
            }

            const dummyData = data?.data;
            console.log('Dummy data received:', JSON.stringify(dummyData, null, 2));
            
            if (dummyData && dummyData.companyName) {
                // Set all form data with explicit logging
                const newFormData = {
                    companyName: dummyData.companyName || 'Generated Business',
                    businessEmail: dummyData.businessEmail || 'info@example.com',
                    businessPhone: dummyData.businessPhone || '(555) 123-4567',
                    funnelGoal: dummyData.funnelGoal || 'Generate qualified leads and increase conversions',
                    targetAudience: dummyData.targetAudience || 'Business owners and decision makers looking for professional services',
                    mainOffer: dummyData.mainOffer || 'Free consultation and custom quote',
                    dummyDomain: dummyData.dummyDomain || '',
                    liveDomain: dummyData.liveDomain || '',
                    websiteColors: dummyData.websiteColors || 'Primary: #3B82F6 (Blue), Secondary: #F3F4F6 (Light Gray)',
                    additionalNotes: dummyData.additionalNotes || 'Mobile-responsive design with clear call-to-actions',
                };
                
                console.log('Setting form data:', JSON.stringify(newFormData, null, 2));
                setFunnelFormData(newFormData);
                
                // Auto-trigger logo generation and go to step 3
                setHasLogo('no');
                setFunnelStep(3);
                
                toast({
                    title: "✨ AI generated all funnel data!",
                    description: `Created: ${newFormData.companyName}. Now generate the logo!`,
                });
            } else {
                console.error('Invalid data structure:', dummyData);
                throw new Error('No valid data returned from AI');
            }
        } catch (error: any) {
            console.error('AI generation error:', error);
            toast({
                title: "AI generation failed",
                description: error?.message || "Please fill in the form manually.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const resetFunnelForm = () => {
        setFunnelFormData({
            companyName: '',
            businessEmail: '',
            businessPhone: '',
            funnelGoal: '',
            targetAudience: '',
            mainOffer: '',
            dummyDomain: '',
            liveDomain: '',
            websiteColors: '',
            additionalNotes: '',
        });
        setHasLogo('');
        setLogoFiles([]);
        setLogoAttempts(0);
        setFunnelStep(1);
    };

    const resetWebsiteForm = () => {
        setWebsiteFormData({
            companyName: '',
            businessEmail: '',
            businessPhone: '',
            websiteUrl: '',
            primaryServices: [],
            targetAudience: '',
            additionalNotes: '',
        });
        setWebsiteHasLogo('');
        setWebsiteLogoFiles([]);
    };

    const resetExistingWebsiteForm = () => {
        setExistingWebsiteFormData({
            companyName: '',
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            liveDomain: '',
            currentPlatform: '',
            githubRepoUrl: '',
            services: [],
            isMobileBusiness: false,
            hasHostingAccess: false,
            hasDomainAccess: false,
            notes: '',
        });
    };

    const resetExistingFunnelForm = () => {
        setExistingFunnelFormData({
            companyName: '',
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            funnelName: '',
            funnelUrl: '',
            funnelType: '',
            currentPlatform: '',
            hasPaymentIntegration: false,
            hasEmailAutomation: false,
            hasTrackingPixels: false,
            notes: '',
        });
    };

    const handleWebsiteSubmit = async () => {
        if (!websiteFormData.companyName) {
            toast({
                title: "Missing required fields",
                description: "Please fill in at least the company name.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingWebsite(true);

        try {
            const notesData = {
                additional_notes: websiteFormData.additionalNotes,
                logo_files: websiteLogoFiles,
                submission_type: 'website',
                submitted_at: new Date().toISOString(),
            };

            const { error: clientError } = await supabase
                .from('clients')
                .insert({
                    name: websiteFormData.companyName,
                    company_name: websiteFormData.companyName,
                    email: websiteFormData.businessEmail || null,
                    phone: websiteFormData.businessPhone || null,
                    website_url: websiteFormData.websiteUrl || null,
                    primary_services: websiteFormData.primaryServices.length > 0 ? websiteFormData.primaryServices : null,
                    target_audience: websiteFormData.targetAudience || 'Not specified',
                    brand_voice: 'Website Client',
                    status: 'PENDING',
                    notes: JSON.stringify(notesData),
                });

            if (clientError) throw new Error(clientError.message);

            queryClient.invalidateQueries({ queryKey: ['all-clients'] });

            toast({
                title: "Website client added!",
                description: `${websiteFormData.companyName} has been added to your website clients.`,
            });

            resetWebsiteForm();
            setShowWebsiteForm(false);
        } catch (error) {
            console.error('Submission error:', error);
            toast({
                title: "Submission failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingWebsite(false);
        }
    };

    const handleFunnelSubmit = async () => {
        if (!funnelFormData.companyName || !funnelFormData.businessEmail) {
            toast({
                title: "Missing required fields",
                description: "Please fill in company name and business email.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const formSubmissionData = {
                company_name: funnelFormData.companyName,
                business_email: funnelFormData.businessEmail,
                business_phone: funnelFormData.businessPhone,
                funnel_goal: funnelFormData.funnelGoal,
                target_audience: funnelFormData.targetAudience,
                main_offer: funnelFormData.mainOffer,
                dummy_domain: funnelFormData.dummyDomain,
                live_domain: funnelFormData.liveDomain,
                has_logo: hasLogo === 'yes',
                logo_files: logoFiles,
                website_colors: funnelFormData.websiteColors,
                additional_notes: funnelFormData.additionalNotes,
                submission_type: 'funnel',
                submitted_at: new Date().toISOString(),
            };

            // Insert into website_submissions (only use columns that exist)
            const { error: submissionError } = await supabase
                .from('website_submissions')
                .insert({
                    company_name: funnelFormData.companyName,
                    business_email: funnelFormData.businessEmail,
                    form_data: formSubmissionData,
                });

            if (submissionError) throw new Error(submissionError.message);

            // Create client record (funnel clients have no website_url)
            // Create services array from funnel data
            const funnelServices = [
                funnelFormData.mainOffer ? `Offer: ${funnelFormData.mainOffer.substring(0, 50)}` : null,
                funnelFormData.funnelGoal ? 'Lead Generation' : null,
                'Funnel Campaign'
            ].filter(Boolean);
            
            // Include logo in the notes JSON (logo_url column doesn't exist in DB)
            const notesWithLogo = {
                ...formSubmissionData,
                logo_files: logoFiles, // Store logo URLs in notes
            };
            
            const { error: clientError } = await supabase
                .from('clients')
                .insert({
                    name: funnelFormData.companyName,
                    company_name: funnelFormData.companyName,
                    email: funnelFormData.businessEmail,
                    phone: funnelFormData.businessPhone,
                    brand_voice: 'Funnel Client',
                    target_audience: funnelFormData.targetAudience || 'Not specified',
                    status: 'PENDING',
                    primary_services: funnelServices,
                    notes: JSON.stringify(notesWithLogo), // Logo stored in notes JSON
                });

            if (clientError) {
                console.error('Client creation error:', clientError);
            }

            // Refresh clients list
            queryClient.invalidateQueries({ queryKey: ['all-clients'] });

            toast({
                title: "Funnel client added!",
                description: `${funnelFormData.companyName} has been added to your funnel clients.`,
            });

            resetFunnelForm();
            setShowFunnelForm(false);
        } catch (error) {
            console.error('Submission error:', error);
            toast({
                title: "Submission failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExistingWebsiteSubmit = async () => {
        if (!existingWebsiteFormData.companyName || !existingWebsiteFormData.liveDomain) {
            toast({
                title: "Missing required fields",
                description: "Please fill in company name and live domain.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingExistingWebsite(true);

        try {
            const notesData = {
                submission_type: 'existing-website',
                is_existing_client: true,
                contact_name: existingWebsiteFormData.contactName,
                live_domain: existingWebsiteFormData.liveDomain,
                current_platform: existingWebsiteFormData.currentPlatform,
                github_repo_url: existingWebsiteFormData.githubRepoUrl,
                is_mobile_business: existingWebsiteFormData.isMobileBusiness,
                has_hosting_access: existingWebsiteFormData.hasHostingAccess,
                has_domain_access: existingWebsiteFormData.hasDomainAccess,
                additional_notes: existingWebsiteFormData.notes,
                submitted_at: new Date().toISOString(),
            };

            const { error: clientError } = await supabase
                .from('clients')
                .insert({
                    name: existingWebsiteFormData.companyName,
                    company_name: existingWebsiteFormData.companyName,
                    email: existingWebsiteFormData.contactEmail || null,
                    phone: existingWebsiteFormData.contactPhone || null,
                    website_url: existingWebsiteFormData.liveDomain || null,
                    primary_services: existingWebsiteFormData.services.length > 0 ? existingWebsiteFormData.services : null,
                    brand_voice: 'Website Client',
                    status: 'PENDING',
                    notes: JSON.stringify(notesData),
                });

            if (clientError) throw new Error(clientError.message);

            queryClient.invalidateQueries({ queryKey: ['all-clients'] });

            toast({
                title: "Existing website client added!",
                description: `${existingWebsiteFormData.companyName} has been added.`,
            });

            resetExistingWebsiteForm();
            setShowExistingWebsiteForm(false);
            setShowExistingClientTypeModal(false);
        } catch (error) {
            console.error('Submission error:', error);
            toast({
                title: "Submission failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingExistingWebsite(false);
        }
    };

    const handleExistingFunnelSubmit = async () => {
        if (!existingFunnelFormData.companyName || !existingFunnelFormData.funnelName) {
            toast({
                title: "Missing required fields",
                description: "Please fill in company name and funnel name.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingExistingFunnel(true);

        try {
            const notesData = {
                submission_type: 'existing-funnel',
                is_existing_client: true,
                contact_name: existingFunnelFormData.contactName,
                funnel_name: existingFunnelFormData.funnelName,
                funnel_url: existingFunnelFormData.funnelUrl,
                funnel_type: existingFunnelFormData.funnelType,
                current_platform: existingFunnelFormData.currentPlatform,
                has_payment_integration: existingFunnelFormData.hasPaymentIntegration,
                has_email_automation: existingFunnelFormData.hasEmailAutomation,
                has_tracking_pixels: existingFunnelFormData.hasTrackingPixels,
                additional_notes: existingFunnelFormData.notes,
                submitted_at: new Date().toISOString(),
            };

            const funnelServices = [
                existingFunnelFormData.funnelType ? `Type: ${existingFunnelFormData.funnelType}` : null,
                existingFunnelFormData.currentPlatform ? `Platform: ${existingFunnelFormData.currentPlatform}` : null,
                'Funnel Campaign'
            ].filter(Boolean);

            const { error: clientError } = await supabase
                .from('clients')
                .insert({
                    name: existingFunnelFormData.companyName,
                    company_name: existingFunnelFormData.companyName,
                    email: existingFunnelFormData.contactEmail || null,
                    phone: existingFunnelFormData.contactPhone || null,
                    brand_voice: 'Funnel Client',
                    status: 'PENDING',
                    primary_services: funnelServices,
                    notes: JSON.stringify(notesData),
                });

            if (clientError) throw new Error(clientError.message);

            queryClient.invalidateQueries({ queryKey: ['all-clients'] });

            toast({
                title: "Existing funnel client added!",
                description: `${existingFunnelFormData.companyName} has been added.`,
            });

            resetExistingFunnelForm();
            setShowExistingFunnelForm(false);
            setShowExistingClientTypeModal(false);
        } catch (error) {
            console.error('Submission error:', error);
            toast({
                title: "Submission failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingExistingFunnel(false);
        }
    };

    // Fetch ALL clients from database - no limit
    const { data: dbClients = [], isLoading, error: queryError, refetch } = useQuery({
        queryKey: ['all-clients'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*') // Select all columns to include any that exist
                .order('created_at', { ascending: false });
            if (error) throw error;
            console.log('Fetched clients:', data?.length, data);
            return data as any[];
        },
        staleTime: 1000 * 60 * 1, // Refresh more often (1 minute)
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true, // Refetch when window is focused
    });
    
    // Log any query errors
    if (queryError) {
        console.error('Query error:', queryError);
    }

    // Filter active vs archived clients
    const activeClients = dbClients.filter(c => c.status !== 'ARCHIVED');
    const archivedClients = dbClients.filter(c => c.status === 'ARCHIVED');
    
    // Helper function to check if client matches search
    const clientMatchesSearch = (client: any, searchTerm: string): boolean => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase().trim();
        const name = (client.company_name || client.name || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        const website = (client.website_url || '').toLowerCase();
        return name.includes(search) || email.includes(search) || website.includes(search);
    };
    
    // Helper function to sort and filter clients
    const sortAndFilterClients = (clients: any[], searchTerm: string) => {
        const search = searchTerm.toLowerCase().trim();
        
        // Sort alphabetically by company name
        const sorted = [...clients].sort((a, b) => {
            const nameA = (a.company_name || a.name || '').toLowerCase();
            const nameB = (b.company_name || b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        if (!search) return sorted;
        
        // Filter: only show matching clients when searching
        return sorted.filter(c => clientMatchesSearch(c, search));
    };
    
    // Helper to check if client is a funnel client
    const isFunnelClient = (client: any): boolean => {
        // Check brand_voice field first (set during creation)
        if (client.brand_voice === 'Funnel Client') return true;
        // Check notes for submission_type
        if (client.notes) {
            try {
                const parsed = JSON.parse(client.notes);
                if (parsed?.submission_type === 'funnel') return true;
            } catch {}
        }
        return false;
    };
    
    // ALL website clients (NOT funnel clients)
    const websiteClientsRaw = activeClients.filter(c => !isFunnelClient(c));
    const websiteClients = sortAndFilterClients(websiteClientsRaw, globalSearch);
    
    // ALL funnel clients
    const funnelClientsRaw = activeClients.filter(c => isFunnelClient(c));
    const funnelClients = sortAndFilterClients(funnelClientsRaw, globalSearch);
    
    // Archived separated by type
    const archivedWebsitesRaw = archivedClients.filter(c => !isFunnelClient(c));
    const archivedFunnelsRaw = archivedClients.filter(c => isFunnelClient(c));
    const archivedWebsites = sortAndFilterClients(archivedWebsitesRaw, globalSearch);
    const archivedFunnels = sortAndFilterClients(archivedFunnelsRaw, globalSearch);

    // DEBUG: Log state
    console.log('isLoading:', isLoading, 'queryError:', queryError, 'dbClients:', dbClients?.length);
    
    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-white text-sm">Loading clients...</p>
                </div>
            </div>
        );
    }
    
    // Show error state
    if (queryError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 text-sm mb-2">Error loading clients</p>
                    <p className="text-xs text-gray-400">{String(queryError)}</p>
                    <Button onClick={() => refetch()} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Agency Client Portal | Rank Me Higher</title>
                <meta name="description" content="Manage your agency clients and their websites." />
            </Helmet>

            <HUDOverlay />

            <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="font-orbitron text-[10px] tracking-[0.2em] text-cyan-400 uppercase">System Active</span>
                            </div>
                            <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                CLIENT PORTAL
                            </h1>
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                        <button 
                            onClick={() => setShowExistingClientTypeModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-transparent hover:bg-cyan-500/10 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400 font-bold"
                        >
                            <PlusCircle className="w-2.5 h-2.5" />
                            Add Existing Client
                        </button>
                        <Link 
                            to="/website-submissions" 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all font-orbitron text-[8px] uppercase tracking-widest text-white font-bold"
                        >
                            <MonitorSmartphone className="w-2.5 h-2.5" />
                            Onboard New Website
                        </Link>
                        <button 
                            onClick={() => setShowFunnelForm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all font-orbitron text-[8px] uppercase tracking-widest text-white font-bold"
                        >
                            <Layers className="w-2.5 h-2.5" />
                            Onboard New Funnel
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-orbitron text-[8px] uppercase tracking-widest text-muted-foreground"
                            title="Refresh client list"
                        >
                            <RefreshCw className={`w-2.5 h-2.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <Link 
                            to="/avaadminpanel" 
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-orbitron text-[8px] uppercase tracking-widest text-muted-foreground"
                        >
                            AVA Admin <Layout className="w-2.5 h-2.5" />
                        </Link>
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all font-orbitron text-[8px] uppercase tracking-widest ${
                                showArchived 
                                    ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground'
                            }`}
                        >
                            <Archive className="w-2.5 h-2.5" />
                            Archived {archivedClients.length > 0 && `(${archivedClients.length})`}
                        </button>
                        </div>
                    </div>
                    
                    {/* Global Search Bar - UPDATED 2026-01-17 */}
                    <div className="flex items-center gap-3 w-full py-2 border-t border-cyan-500/20">
                        <div className="relative flex-1 max-w-2xl">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 z-10" />
                            <Input
                                type="text"
                                placeholder="🔍 Search clients by name, email, or domain..."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                                className="pl-12 pr-12 h-12 bg-card/90 border-2 border-cyan-500/60 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/40 font-orbitron text-base placeholder:text-muted-foreground/70 shadow-lg"
                            />
                            {globalSearch && (
                                <button
                                    onClick={() => setGlobalSearch('')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* WEBSITES SECTION */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <MonitorSmartphone className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h2 className="font-orbitron text-lg font-bold text-foreground">Websites</h2>
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px]">
                                {websiteClients.length}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Scroll Navigation */}
                            <button
                                onClick={() => scrollLeft(websiteScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button
                                onClick={() => scrollRight(websiteScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-cyan-400" />
                            </button>
                            {/* See All Dialog */}
                            {websiteClients.length > MAX_VISIBLE_CARDS && (
                                <Dialog open={showAllWebsites} onOpenChange={setShowAllWebsites}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all font-orbitron text-[10px]">
                                            <MoreHorizontal className="w-3 h-3" />
                                            See All
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] bg-background/95 backdrop-blur-xl border-cyan-500/30">
                                        <DialogHeader>
                                            <DialogTitle className="font-orbitron text-cyan-400 flex items-center gap-2">
                                                <MonitorSmartphone className="w-5 h-5" />
                                                All Website Clients ({websiteClients.length})
                                            </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-[60vh] pr-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {websiteClients.map((client) => {
                                                    const clientIsExisting = isExistingClient(client);
                                                    const clientIsNew = isNewClient(client);
                                                    return (
                                                    <Link
                                                        key={client.id}
                                                        to={`/agency/client/${client.id}`}
                                                        className="block bg-gradient-to-br from-card/60 via-card/40 to-transparent border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/60 transition-all"
                                                        onClick={() => setShowAllWebsites(false)}
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {getClientLogo(client) ? (
                                                                <img src={getClientLogo(client)!} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-zinc-900 p-0.5 border border-cyan-500/30" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                                    <Building2 className="w-5 h-5 text-cyan-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <Badge className="bg-primary/20 text-primary border-primary/30 font-orbitron text-[7px] px-1 py-0">
                                                                        WEBSITE
                                                                    </Badge>
                                                                    {clientIsExisting && (
                                                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1 py-0">
                                                                            EXISTING
                                                                        </Badge>
                                                                    )}
                                                                    {clientIsNew && !clientIsExisting && (
                                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-orbitron text-[7px] px-1 py-0">
                                                                            NEW
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <h3 className="font-orbitron font-bold text-sm">{client.company_name || client.name}</h3>
                                                                <p className="text-[10px] text-muted-foreground">{client.website_url}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Scrollable Cards */}
                    <div 
                        ref={websiteScrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* All Website Clients */}
                        {websiteClients.slice(0, MAX_VISIBLE_CARDS).map((client) => {
                            const clientLogo = getClientLogo(client);
                            const clientServices = client.primary_services || [];
                            const clientIsNew = isNewClient(client);
                            const clientIsExisting = isExistingClient(client);
                            const isHighlighted = globalSearch && clientMatchesSearch(client, globalSearch);
                            return (
                            <div key={client.id} className={`relative group flex-shrink-0 w-[300px] snap-start ${isHighlighted ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background rounded-xl' : ''}`}>
                                <Link
                                    to={`/agency/client/${client.id}`}
                                    className={`block h-full bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-xl border rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 ${isHighlighted ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/20' : 'border-cyan-500/30'}`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="relative">
                                            {clientLogo ? (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-500/30 bg-zinc-900 p-0.5">
                                                    <img src={clientLogo} alt="Logo" className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-cyan-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Badge className="bg-primary/20 text-primary border-primary/30 font-orbitron text-[7px] px-1 py-0">
                                                    WEBSITE
                                                </Badge>
                                                {clientIsExisting && (
                                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1 py-0">
                                                        EXISTING
                                                    </Badge>
                                                )}
                                                {clientIsNew && !clientIsExisting && (
                                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-orbitron text-[7px] px-1 py-0">
                                                        NEW
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-orbitron font-bold text-sm text-foreground truncate">
                                                {client.company_name || client.name}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    {clientServices.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {clientServices.slice(0, 3).map((service: string, i: number) => (
                                                <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-orbitron text-muted-foreground">
                                                    {service.length > 20 ? service.substring(0, 20) + '...' : service}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1 truncate">
                                            <Globe className="w-2.5 h-2.5 text-cyan-400" />
                                            {client.website_url?.replace('https://', '').replace('http://', '')}
                                        </span>
                                        <span className="flex items-center gap-1 text-cyan-400 font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Open <ArrowRight className="w-2.5 h-2.5" />
                                        </span>
                                    </div>
                                </Link>
                                <button
                                    onClick={(e) => handleDeleteClick(e, client)}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                            </div>
                            );
                        })}

                    </div>
                </div>

                {/* FUNNELS SECTION */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <Layers className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h2 className="font-orbitron text-lg font-bold text-foreground">Funnels</h2>
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[8px]">
                                {funnelClients.length}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Scroll Navigation */}
                            <button
                                onClick={() => scrollLeft(funnelScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button
                                onClick={() => scrollRight(funnelScrollRef)}
                                className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-cyan-400" />
                            </button>
                            {/* See All Dialog */}
                            {funnelClients.length > MAX_VISIBLE_CARDS && (
                                <Dialog open={showAllFunnels} onOpenChange={setShowAllFunnels}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all font-orbitron text-[10px]">
                                            <MoreHorizontal className="w-3 h-3" />
                                            See All
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] bg-background/95 backdrop-blur-xl border-cyan-500/30">
                                        <DialogHeader>
                                            <DialogTitle className="font-orbitron text-cyan-400 flex items-center gap-2">
                                                <Layers className="w-5 h-5" />
                                                All Funnel Clients ({funnelClients.length})
                                            </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-[60vh] pr-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {funnelClients.map((client) => {
                                                    const clientIsExisting = isExistingClient(client);
                                                    const clientIsNew = isNewClient(client);
                                                    return (
                                                    <Link
                                                        key={client.id}
                                                        to={`/agency/client/${client.id}`}
                                                        className="block bg-gradient-to-br from-card/60 via-card/40 to-transparent border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/60 transition-all"
                                                        onClick={() => setShowAllFunnels(false)}
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {getClientLogo(client) ? (
                                                                <img src={getClientLogo(client)!} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-zinc-900 p-0.5 border border-cyan-500/30" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                                    <Layers className="w-5 h-5 text-cyan-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[7px] px-1 py-0">
                                                                        FUNNEL
                                                                    </Badge>
                                                                    {clientIsExisting && (
                                                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1 py-0">
                                                                            EXISTING
                                                                        </Badge>
                                                                    )}
                                                                    {clientIsNew && !clientIsExisting && (
                                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-orbitron text-[7px] px-1 py-0">
                                                                            NEW
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <h3 className="font-orbitron font-bold text-sm">{client.company_name || client.name}</h3>
                                                                <p className="text-[10px] text-muted-foreground">{client.email}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Scrollable Cards */}
                    <div 
                        ref={funnelScrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Funnel Clients - Show max 6 */}
                        {funnelClients.slice(0, MAX_VISIBLE_CARDS).map((client) => {
                            const clientLogo = getClientLogo(client);
                            const clientServices = client.primary_services || [];
                            const { dummyDomain, liveDomain } = getFunnelDomains(client);
                            const hasDomains = dummyDomain || liveDomain;
                            const currentView = funnelDomainView[client.id] || 'dummy';
                            const currentDomain = currentView === 'live' ? liveDomain : dummyDomain;
                            const clientIsExisting = isExistingClient(client);
                            const clientIsNew = isNewClient(client);
                            const isHighlighted = globalSearch && clientMatchesSearch(client, globalSearch);
                            
                            return (
                            <div key={client.id} className={`relative group flex-shrink-0 w-[300px] snap-start ${isHighlighted ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background rounded-xl' : ''}`}>
                                <div className={`h-full bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-xl border rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 ${isHighlighted ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/20' : 'border-cyan-500/30'}`}>
                                    <Link to={`/agency/client/${client.id}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                {clientLogo ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-500/30 bg-zinc-900 p-0.5">
                                                        <img src={clientLogo} alt="Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                        <Layers className="w-5 h-5 text-cyan-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron text-[7px] px-1 py-0">
                                                        FUNNEL
                                                    </Badge>
                                                    {clientIsExisting && (
                                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron text-[7px] px-1 py-0">
                                                            EXISTING
                                                        </Badge>
                                                    )}
                                                    {clientIsNew && !clientIsExisting && (
                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-orbitron text-[7px] px-1 py-0">
                                                            NEW
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-orbitron font-bold text-sm text-foreground truncate">
                                                    {client.company_name || client.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    {clientServices.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {clientServices.slice(0, 3).map((service: string, i: number) => (
                                                <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-orbitron text-muted-foreground">
                                                    {service.length > 20 ? service.substring(0, 20) + '...' : service}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Domain Toggle Section */}
                                    {hasDomains ? (
                                        <div className="mt-2 pt-2 border-t border-cyan-500/10">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[8px] font-orbitron text-muted-foreground uppercase">Domain</span>
                                                {dummyDomain && liveDomain && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setFunnelDomainView(prev => ({
                                                                ...prev,
                                                                [client.id]: currentView === 'dummy' ? 'live' : 'dummy'
                                                            }));
                                                        }}
                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                                                    >
                                                        {currentView === 'dummy' ? (
                                                            <ToggleLeft className="w-3 h-3 text-yellow-400" />
                                                        ) : (
                                                            <ToggleRight className="w-3 h-3 text-green-400" />
                                                        )}
                                                        <span className={`text-[7px] font-orbitron ${currentView === 'dummy' ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            {currentView === 'dummy' ? 'STAGING' : 'LIVE'}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                            {currentDomain && (
                                                <a
                                                    href={currentDomain.startsWith('http') ? currentDomain : `https://${currentDomain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-[9px] text-cyan-400 hover:text-cyan-300 transition-colors truncate"
                                                >
                                                    <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                                                    <span className="truncate">{currentDomain.replace('https://', '').replace('http://', '')}</span>
                                                    <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                                            {client.email && (
                                                <span className="flex items-center gap-1 truncate">
                                                    <Mail className="w-2.5 h-2.5 text-cyan-400" />
                                                    {client.email}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => handleDeleteClick(e, client)}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                            </div>
                            );
                        })}

                    </div>
                    
                    {funnelClients.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground font-orbitron text-xs">
                            No funnel clients yet. Add your first one!
                        </div>
                    )}
                </div>

                {/* ARCHIVED SECTION */}
                {showArchived && archivedClients.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-orange-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center">
                                    <Archive className="w-4 h-4 text-orange-400" />
                                </div>
                                <h2 className="font-orbitron text-lg font-bold text-foreground">Archived</h2>
                                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-orbitron text-[8px]">
                                    {archivedClients.length}
                                </Badge>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="pl-8 h-8 w-40 text-xs font-orbitron bg-card/20 border-orange-500/20 focus:border-orange-500/50"
                                />
                            </div>
                        </div>

                        {/* Archived Websites */}
                        {archivedWebsites.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-muted-foreground font-orbitron mb-3">Websites</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {archivedWebsites.map((client) => (
                                        <div key={client.id} className="relative group bg-card/10 backdrop-blur-md border border-orange-500/20 rounded-xl p-4 opacity-60">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <h3 className="font-orbitron font-bold text-sm text-foreground truncate flex-1">
                                                    {client.company_name || client.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Globe className="w-2.5 h-2.5" />
                                                    {client.website_url?.replace('https://', '').replace('http://', '')}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleRestoreFromArchive(client)}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all font-orbitron text-[9px] uppercase tracking-widest text-white font-bold"
                                                    >
                                                        <ArchiveRestore className="w-3 h-3" />
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(e, client)}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all font-orbitron text-[9px] uppercase tracking-widest text-white font-bold"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Archived Funnels */}
                        {archivedFunnels.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground font-orbitron mb-3">Funnels</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {archivedFunnels.map((client) => (
                                        <div key={client.id} className="relative group bg-card/10 backdrop-blur-md border border-orange-500/20 rounded-xl p-4 opacity-60">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                                    <Layers className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <h3 className="font-orbitron font-bold text-sm text-foreground truncate flex-1">
                                                    {client.company_name || client.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Mail className="w-2.5 h-2.5" />
                                                    {client.email}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleRestoreFromArchive(client)}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all font-orbitron text-[9px] uppercase tracking-widest text-white font-bold"
                                                    >
                                                        <ArchiveRestore className="w-3 h-3" />
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(e, client)}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all font-orbitron text-[9px] uppercase tracking-widest text-white font-bold"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete/Archive Modal */}
            {showDeleteModal && selectedClientForDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => { setShowDeleteModal(false); setSelectedClientForDelete(null); setPasswordVerified(false); }}
                    />
                    <div className="relative bg-background border border-red-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6">
                            {!passwordVerified ? (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-orbitron text-lg font-bold text-foreground">Password Required</h2>
                                            <p className="text-xs text-muted-foreground">Enter password to access delete options</p>
                                        </div>
                                    </div>
                                    <Input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Enter password"
                                        className="mb-4"
                                        onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => { setShowDeleteModal(false); setSelectedClientForDelete(null); }}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={verifyPassword}
                                            className="flex-1 bg-red-500 hover:bg-red-600"
                                        >
                                            Verify
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-orbitron text-lg font-bold text-foreground">Delete Client</h2>
                                            <p className="text-sm text-foreground font-medium">{selectedClientForDelete.company_name || selectedClientForDelete.name}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {selectedClientForDelete.status === 'ARCHIVED' 
                                            ? 'This client is archived. Delete permanently?'
                                            : 'Choose an action for this client:'}
                                    </p>
                                    <div className="space-y-3">
                                        {selectedClientForDelete.status !== 'ARCHIVED' && (
                                            <Button
                                                onClick={handleArchive}
                                                disabled={isDeleting}
                                                className="w-full bg-orange-500 hover:bg-orange-600 gap-2"
                                            >
                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                                                Archive
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handlePermanentDelete}
                                            disabled={isDeleting}
                                            variant="destructive"
                                            className="w-full gap-2"
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Permanently Delete
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => { setShowDeleteModal(false); setSelectedClientForDelete(null); setPasswordVerified(false); }}
                                            className="w-full"
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Funnel Form Modal */}
            {showFunnelForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => { setShowFunnelForm(false); resetFunnelForm(); }}
                    />
                    <div className="relative bg-background border border-cyan-500/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-orbitron text-lg font-bold text-foreground">New Funnel Client</h2>
                                    <p className="text-xs text-muted-foreground">Step {funnelStep} of 3</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowFunnelForm(false); resetFunnelForm(); }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Clickable Progress Bar + AI Button */}
                        <div className="px-4 pt-4 space-y-3">
                            <div className="flex gap-1">
                                {[1, 2, 3].map((step) => (
                                    <button
                                        key={step}
                                        onClick={() => setFunnelStep(step)}
                                        className={`h-2 flex-1 rounded-full transition-all cursor-pointer hover:opacity-80 ${
                                            step <= funnelStep ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-muted hover:bg-muted/80'
                                        }`}
                                        title={`Go to Step ${step}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleAIAutoFill}
                                disabled={isGeneratingAI}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-cyan-400 font-orbitron text-xs disabled:opacity-50"
                            >
                                {isGeneratingAI ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Create Dummy Submission with AI
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Form Content - Scrollable */}
                        <div className="p-4 overflow-y-auto flex-1 min-h-0">
                            {/* Step 1: Business Info */}
                            {funnelStep === 1 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Building2 className="w-5 h-5 text-cyan-400" />
                                        <span className="font-orbitron text-sm font-bold">Business Info</span>
                                    </div>
                                    <div>
                                        <Label className="text-sm">Company Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            className="mt-1"
                                            value={funnelFormData.companyName}
                                            onChange={(e) => setFunnelFormData({ ...funnelFormData, companyName: e.target.value })}
                                            placeholder="Your company name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-sm">Email <span className="text-destructive">*</span></Label>
                                            <Input
                                                className="mt-1"
                                                type="email"
                                                value={funnelFormData.businessEmail}
                                                onChange={(e) => setFunnelFormData({ ...funnelFormData, businessEmail: e.target.value })}
                                                placeholder="email@company.com"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm">Phone</Label>
                                            <Input
                                                className="mt-1"
                                                type="tel"
                                                value={funnelFormData.businessPhone}
                                                onChange={(e) => setFunnelFormData({ ...funnelFormData, businessPhone: e.target.value })}
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Funnel Details */}
                            {funnelStep === 2 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Target className="w-5 h-5 text-cyan-400" />
                                        <span className="font-orbitron text-sm font-bold">Funnel Details</span>
                                    </div>
                                    <div>
                                        <Label className="text-sm">Funnel Goal <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            className="mt-1"
                                            rows={2}
                                            value={funnelFormData.funnelGoal}
                                            onChange={(e) => setFunnelFormData({ ...funnelFormData, funnelGoal: e.target.value })}
                                            placeholder="e.g., Generate leads, sell a product..."
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm">Target Audience</Label>
                                        <Textarea
                                            className="mt-1"
                                            rows={2}
                                            value={funnelFormData.targetAudience}
                                            onChange={(e) => setFunnelFormData({ ...funnelFormData, targetAudience: e.target.value })}
                                            placeholder="e.g., Homeowners aged 35-55..."
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm">Main Offer</Label>
                                        <Textarea
                                            className="mt-1"
                                            rows={2}
                                            value={funnelFormData.mainOffer}
                                            onChange={(e) => setFunnelFormData({ ...funnelFormData, mainOffer: e.target.value })}
                                            placeholder="e.g., Free consultation, discount code, ebook..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-sm">Staging Domain</Label>
                                            <Input
                                                className="mt-1"
                                                value={funnelFormData.dummyDomain}
                                                onChange={(e) => setFunnelFormData({ ...funnelFormData, dummyDomain: e.target.value })}
                                                placeholder="client.rankmehigher.com"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm">Live Domain</Label>
                                            <Input
                                                className="mt-1"
                                                value={funnelFormData.liveDomain}
                                                onChange={(e) => setFunnelFormData({ ...funnelFormData, liveDomain: e.target.value })}
                                                placeholder="funnel.client.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Branding */}
                            {funnelStep === 3 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Palette className="w-5 h-5 text-cyan-400" />
                                        <span className="font-orbitron text-sm font-bold">Branding</span>
                                    </div>
                                    <div>
                                        <Label className="text-sm">Do you have a logo?</Label>
                                        <div className="mt-2 flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={hasLogo === 'yes'}
                                                    onCheckedChange={(checked) => setHasLogo(checked ? 'yes' : '')}
                                                />
                                                <label className="text-sm">Yes, upload</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={hasLogo === 'no'}
                                                    onCheckedChange={(checked) => setHasLogo(checked ? 'no' : '')}
                                                />
                                                <label className="text-sm">Generate with AI</label>
                                            </div>
                                        </div>
                                    </div>

                                    {hasLogo === 'yes' && (
                                        <FileUpload
                                            label=""
                                            folder="funnel-logos"
                                            description="Upload your logo"
                                            onFilesChange={setLogoFiles}
                                            existingUrls={logoFiles}
                                        />
                                    )}

                                    {hasLogo === 'no' && (
                                        <LogoGenerator
                                            companyName={funnelFormData.companyName}
                                            serviceCategory="Funnel"
                                            websiteColors={funnelFormData.websiteColors}
                                            attemptsUsed={logoAttempts}
                                            maxAttempts={10}
                                            onLogoGenerated={(url) => {
                                                setLogoFiles([url]);
                                                setHasLogo('yes');
                                            }}
                                            onAttemptsChange={setLogoAttempts}
                                            onCancel={() => setHasLogo('')}
                                        />
                                    )}

                                    {logoFiles.length > 0 && hasLogo === 'yes' && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={logoFiles[0]}
                                                alt="Logo"
                                                className="w-16 h-16 object-contain rounded-lg border border-border bg-zinc-900 p-1"
                                            />
                                            <span className="text-sm text-green-500 flex items-center gap-1">
                                                <Check className="w-4 h-4" /> Logo saved
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        <Label className="text-sm">Brand Colors</Label>
                                        <Input
                                            className="mt-1"
                                            value={funnelFormData.websiteColors}
                                            onChange={(e) => setFunnelFormData({ ...funnelFormData, websiteColors: e.target.value })}
                                            placeholder="e.g., Blue #3B82F6"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm">Additional Notes</Label>
                                        <Textarea
                                            className="mt-1"
                                            rows={2}
                                            value={funnelFormData.additionalNotes}
                                            onChange={(e) => setFunnelFormData({ ...funnelFormData, additionalNotes: e.target.value })}
                                            placeholder="Any other details..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Always Visible */}
                        <div className="flex justify-between p-4 border-t border-cyan-500/20 bg-card/50 shrink-0">
                            <Button
                                variant="outline"
                                onClick={() => funnelStep > 1 ? setFunnelStep(funnelStep - 1) : (setShowFunnelForm(false), resetFunnelForm())}
                                className="gap-2"
                            >
                                {funnelStep === 1 ? 'Cancel' : 'Back'}
                            </Button>

                            {funnelStep < 3 ? (
                                <Button
                                    onClick={() => setFunnelStep(funnelStep + 1)}
                                    className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleFunnelSubmit}
                                    disabled={isSubmitting}
                                    className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Add Client
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Website Form Modal (Quick Add) */}
            {showWebsiteForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => { setShowWebsiteForm(false); resetWebsiteForm(); }}
                    />
                    <div className="relative bg-background border border-primary/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-cyan-600/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-orbitron text-lg font-bold text-foreground">New Website Client</h2>
                                    <p className="text-xs text-muted-foreground">Quick add to portal</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowWebsiteForm(false); resetWebsiteForm(); }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <Label className="text-sm">Company Name <span className="text-destructive">*</span></Label>
                                <Input
                                    className="mt-1"
                                    value={websiteFormData.companyName}
                                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, companyName: e.target.value })}
                                    placeholder="Company name"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Website URL</Label>
                                <Input
                                    className="mt-1"
                                    value={websiteFormData.websiteUrl}
                                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, websiteUrl: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-sm">Email</Label>
                                    <Input
                                        className="mt-1"
                                        type="email"
                                        value={websiteFormData.businessEmail}
                                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, businessEmail: e.target.value })}
                                        placeholder="email@company.com"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Phone</Label>
                                    <Input
                                        className="mt-1"
                                        type="tel"
                                        value={websiteFormData.businessPhone}
                                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, businessPhone: e.target.value })}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm">Services (comma-separated)</Label>
                                <Input
                                    className="mt-1"
                                    value={websiteFormData.primaryServices.join(', ')}
                                    onChange={(e) => setWebsiteFormData({ 
                                        ...websiteFormData, 
                                        primaryServices: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                                    })}
                                    placeholder="e.g., Marketing, Content Creation, SEO"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Target Audience</Label>
                                <Input
                                    className="mt-1"
                                    value={websiteFormData.targetAudience}
                                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, targetAudience: e.target.value })}
                                    placeholder="e.g., Trucking companies, Owner-operators"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Additional Notes</Label>
                                <Textarea
                                    className="mt-1"
                                    rows={2}
                                    value={websiteFormData.additionalNotes}
                                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, additionalNotes: e.target.value })}
                                    placeholder="Any other details..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-between p-4 border-t border-primary/20 bg-card/50 shrink-0">
                            <Button
                                variant="outline"
                                onClick={() => { setShowWebsiteForm(false); resetWebsiteForm(); }}
                                className="gap-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleWebsiteSubmit}
                                disabled={isSubmittingWebsite}
                                className="gap-2 bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-700"
                            >
                                {isSubmittingWebsite ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Add Website Client
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Client Type Selection Modal */}
            {showExistingClientTypeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowExistingClientTypeModal(false)}
                    />
                    <div className="relative bg-background border border-cyan-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                        <PlusCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-orbitron text-lg font-bold text-foreground">Add Existing Client</h2>
                                        <p className="text-xs text-muted-foreground">Select client type</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowExistingClientTypeModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        setShowExistingClientTypeModal(false);
                                        setShowExistingWebsiteForm(true);
                                    }}
                                    className="group p-6 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400/60 bg-gradient-to-br from-card/40 to-transparent transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                        <MonitorSmartphone className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">Website</h3>
                                    <p className="text-xs text-muted-foreground">Existing website client</p>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowExistingClientTypeModal(false);
                                        setShowExistingFunnelForm(true);
                                    }}
                                    className="group p-6 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400/60 bg-gradient-to-br from-card/40 to-transparent transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                        <Layers className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">Funnel</h3>
                                    <p className="text-xs text-muted-foreground">Existing funnel client</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Website Form Modal */}
            {showExistingWebsiteForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => { setShowExistingWebsiteForm(false); resetExistingWebsiteForm(); }}
                    />
                    <div className="relative bg-background border border-cyan-500/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <MonitorSmartphone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-orbitron text-lg font-bold text-foreground">Add Existing Website</h2>
                                    <p className="text-xs text-muted-foreground">Taking over an existing website</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowExistingWebsiteForm(false); resetExistingWebsiteForm(); }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <Label className="text-sm">Business Name <span className="text-destructive">*</span></Label>
                                <Input
                                    className="mt-1"
                                    value={existingWebsiteFormData.companyName}
                                    onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, companyName: e.target.value })}
                                    placeholder="Company name"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-sm">Contact Name</Label>
                                    <Input
                                        className="mt-1"
                                        value={existingWebsiteFormData.contactName}
                                        onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, contactName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Email</Label>
                                    <Input
                                        className="mt-1"
                                        type="email"
                                        value={existingWebsiteFormData.contactEmail}
                                        onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, contactEmail: e.target.value })}
                                        placeholder="email@company.com"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Phone</Label>
                                    <Input
                                        className="mt-1"
                                        type="tel"
                                        value={existingWebsiteFormData.contactPhone}
                                        onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, contactPhone: e.target.value })}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm">Live Domain <span className="text-destructive">*</span></Label>
                                <Input
                                    className="mt-1"
                                    value={existingWebsiteFormData.liveDomain}
                                    onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, liveDomain: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Current Platform</Label>
                                <Input
                                    className="mt-1"
                                    value={existingWebsiteFormData.currentPlatform}
                                    onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, currentPlatform: e.target.value })}
                                    placeholder="WordPress, Wix, Squarespace, Shopify, etc."
                                />
                            </div>
                            <div>
                                <Label className="text-sm">GitHub Repo URL</Label>
                                <Input
                                    className="mt-1"
                                    value={existingWebsiteFormData.githubRepoUrl}
                                    onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, githubRepoUrl: e.target.value })}
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Services (comma-separated)</Label>
                                <Input
                                    className="mt-1"
                                    value={existingWebsiteFormData.services.join(', ')}
                                    onChange={(e) => setExistingWebsiteFormData({ 
                                        ...existingWebsiteFormData, 
                                        services: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                                    })}
                                    placeholder="Service 1, Service 2, Service 3"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Access & Business Type</Label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={existingWebsiteFormData.isMobileBusiness}
                                            onCheckedChange={(checked) => setExistingWebsiteFormData({ ...existingWebsiteFormData, isMobileBusiness: checked === true })}
                                        />
                                        <label className="text-sm">Mobile/Service-based business</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={existingWebsiteFormData.hasHostingAccess}
                                            onCheckedChange={(checked) => setExistingWebsiteFormData({ ...existingWebsiteFormData, hasHostingAccess: checked === true })}
                                        />
                                        <label className="text-sm">Have hosting access</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={existingWebsiteFormData.hasDomainAccess}
                                            onCheckedChange={(checked) => setExistingWebsiteFormData({ ...existingWebsiteFormData, hasDomainAccess: checked === true })}
                                        />
                                        <label className="text-sm">Have domain access</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm">Notes</Label>
                                <Textarea
                                    className="mt-1"
                                    rows={3}
                                    value={existingWebsiteFormData.notes}
                                    onChange={(e) => setExistingWebsiteFormData({ ...existingWebsiteFormData, notes: e.target.value })}
                                    placeholder="Additional details about the existing website..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-between p-4 border-t border-cyan-500/20 bg-card/50 shrink-0">
                            <Button
                                variant="outline"
                                onClick={() => { setShowExistingWebsiteForm(false); resetExistingWebsiteForm(); }}
                                className="gap-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExistingWebsiteSubmit}
                                disabled={isSubmittingExistingWebsite}
                                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                            >
                                {isSubmittingExistingWebsite ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Add Existing Website
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Funnel Form Modal */}
            {showExistingFunnelForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => { setShowExistingFunnelForm(false); resetExistingFunnelForm(); }}
                    />
                    <div className="relative bg-background border border-cyan-500/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-orbitron text-lg font-bold text-foreground">Add Existing Funnel</h2>
                                    <p className="text-xs text-muted-foreground">Taking over an existing funnel</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowExistingFunnelForm(false); resetExistingFunnelForm(); }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <Label className="text-sm">Business Name <span className="text-destructive">*</span></Label>
                                <Input
                                    className="mt-1"
                                    value={existingFunnelFormData.companyName}
                                    onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, companyName: e.target.value })}
                                    placeholder="Company name"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-sm">Contact Name</Label>
                                    <Input
                                        className="mt-1"
                                        value={existingFunnelFormData.contactName}
                                        onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, contactName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Email</Label>
                                    <Input
                                        className="mt-1"
                                        type="email"
                                        value={existingFunnelFormData.contactEmail}
                                        onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, contactEmail: e.target.value })}
                                        placeholder="email@company.com"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Phone</Label>
                                    <Input
                                        className="mt-1"
                                        type="tel"
                                        value={existingFunnelFormData.contactPhone}
                                        onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, contactPhone: e.target.value })}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm">Funnel Name <span className="text-destructive">*</span></Label>
                                <Input
                                    className="mt-1"
                                    value={existingFunnelFormData.funnelName}
                                    onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, funnelName: e.target.value })}
                                    placeholder="Lead Gen Campaign, Sales Page, etc."
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Funnel URL</Label>
                                <Input
                                    className="mt-1"
                                    value={existingFunnelFormData.funnelUrl}
                                    onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, funnelUrl: e.target.value })}
                                    placeholder="https://funnel.example.com"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Funnel Type</Label>
                                <Input
                                    className="mt-1"
                                    value={existingFunnelFormData.funnelType}
                                    onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, funnelType: e.target.value })}
                                    placeholder="Lead Gen, VSL, Sales Page, Webinar, Quiz, Booking, etc."
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Current Platform</Label>
                                <Input
                                    className="mt-1"
                                    value={existingFunnelFormData.currentPlatform}
                                    onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, currentPlatform: e.target.value })}
                                    placeholder="GoHighLevel, ClickFunnels, Leadpages, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Integration Status</Label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={existingFunnelFormData.hasPaymentIntegration}
                                            onCheckedChange={(checked) => setExistingFunnelFormData({ ...existingFunnelFormData, hasPaymentIntegration: checked === true })}
                                        />
                                        <label className="text-sm">Has payment integration</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={existingFunnelFormData.hasEmailAutomation}
                                            onCheckedChange={(checked) => setExistingFunnelFormData({ ...existingFunnelFormData, hasEmailAutomation: checked === true })}
                                        />
                                        <label className="text-sm">Has email/SMS automation</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={existingFunnelFormData.hasTrackingPixels}
                                            onCheckedChange={(checked) => setExistingFunnelFormData({ ...existingFunnelFormData, hasTrackingPixels: checked === true })}
                                        />
                                        <label className="text-sm">Has tracking pixels</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm">Notes</Label>
                                <Textarea
                                    className="mt-1"
                                    rows={3}
                                    value={existingFunnelFormData.notes}
                                    onChange={(e) => setExistingFunnelFormData({ ...existingFunnelFormData, notes: e.target.value })}
                                    placeholder="Additional details about the existing funnel..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-between p-4 border-t border-cyan-500/20 bg-card/50 shrink-0">
                            <Button
                                variant="outline"
                                onClick={() => { setShowExistingFunnelForm(false); resetExistingFunnelForm(); }}
                                className="gap-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExistingFunnelSubmit}
                                disabled={isSubmittingExistingFunnel}
                                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                            >
                                {isSubmittingExistingFunnel ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Add Existing Funnel
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPortal;
