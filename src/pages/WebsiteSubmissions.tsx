import { Helmet } from "react-helmet-async";
import AvaAdminHeader from "@/components/AvaAdminHeader";
import Footer from "@/components/Footer";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Building2, MapPin, Target, Settings, Shield, Users, Palette, Globe, DollarSign, Sparkles, ChevronDown, ChevronUp, Check, X, ArrowLeft, Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import LogoGenerator from "@/components/LogoGenerator";
import PhotoGenerator from "@/components/PhotoGenerator";
import { FormProgressBar } from "@/components/FormProgressBar";
import { FormStepNavigation } from "@/components/FormStepNavigation";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";
import { AITextarea } from "@/components/AITextarea";
import { GBPScanner } from "@/components/GBPScanner";
import { SocialMediaFields } from "@/components/SocialMediaFields";
import { calculateAllStepCompletions, getIncompleteSteps, FormState } from "@/utils/formCompletionCalculator";
import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = 'website-submission-draft';

const STEPS = [
  { id: 1, title: "1. Business Info", icon: <Building2 className="w-4 h-4" /> },
  { id: 2, title: "2. Location & Hours", icon: <MapPin className="w-4 h-4" /> },
  { id: 3, title: "3. Services", icon: <Target className="w-4 h-4" /> },
  { id: 4, title: "4. Operations", icon: <Settings className="w-4 h-4" /> },
  { id: 5, title: "5. Trust", icon: <Shield className="w-4 h-4" /> },
  { id: 6, title: "6. Team & Story", icon: <Users className="w-4 h-4" /> },
  { id: 7, title: "7. Branding", icon: <Palette className="w-4 h-4" /> },
  { id: 8, title: "8. Online Presence", icon: <Globe className="w-4 h-4" /> },
  { id: 9, title: "9. Offers", icon: <DollarSign className="w-4 h-4" /> },
  { id: 10, title: "10. Final", icon: <Sparkles className="w-4 h-4" /> },
];

const WebsiteSubmissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<number[]>([1]); // Track open accordion sections
  const [mobileDrawerStep, setMobileDrawerStep] = useState<number | null>(null); // Track which step is open in mobile drawer

  const toggleSection = (stepId: number) => {
    setOpenSections(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const openMobileDrawer = (stepId: number) => {
    setMobileDrawerStep(stepId);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerStep(null);
  };

  const [formData, setFormData] = useState({
    companyName: "",
    ownsDomain: "",
    domainName: "",
    businessPhone: "",
    businessEmail: "",
    jobRequestEmail: "",
    mainCity: "",
    serviceAreas: "",
    showAddress: "",
    streetAddress: "",
    streetAddress2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    showHours: "",
    serviceCategory: "",
    includeServicePage: "",
    showPricing: "",
    servicePageType: "",
    freeEstimates: "",
    customerAction: "",
    clientType: "",
    serviceJobDuration: "",
    serviceAreaPages: "",
    homeownerChallenges: "",
    serviceProcess: "",
    serviceOptions: "",
    guarantees: "",
    businessUnique: "",
    qualityTrust: "",
    accreditations: "",
    insuranceElaboration: "",
    founderMessage: "",
    teamMembers: "",
    communityGiving: "",
    coreValues: "",
    websiteColors: "",
    fontName: "",
    brandBookLink: "",
    googleBusinessProfileLink: "",
    googleReviews: "",
    otherReviewsLink: "",
    socialMediaLinks: "",
    yelpLink: "",
    instagramLink: "",
    facebookLink: "",
    tiktokLink: "",
    workPhotosLink: "",
    specialOffersExplanation: "",
    financingExplanation: "",
    competitorWebsites: "",
    additionalNotes: "",
  });

  const [hasGoogleProfile, setHasGoogleProfile] = useState("");
  const [hasSpecialOffers, setHasSpecialOffers] = useState("");
  const [hasFinancing, setHasFinancing] = useState("");

  const [emergencyServices, setEmergencyServices] = useState({
    "24/7 emergency response": false,
    "Same-day repairs": false,
    "Temporary fixes until full service": false,
    "No emergency services": false,
    "Other": false,
  });

  const [insuranceHelp, setInsuranceHelp] = useState({
    "Full handling (assessment, documentation, communication)": false,
    "Partial help (provide docs only)": false,
    "No insurance support offered": false,
    "No HOA paperwork support offered": false,
    "This does not apply for my business": false,
    "Other": false,
  });

  const [hasSpecificFont, setHasSpecificFont] = useState("");
  const [hasBrandBook, setHasBrandBook] = useState("");
  const [hasLogo, setHasLogo] = useState<"yes" | "no" | "">("");
  const [logoGenerationAttempts, setLogoGenerationAttempts] = useState(0);
  
  // Photo generation state
  const [generateFounderPhoto, setGenerateFounderPhoto] = useState(false);
  const [generateTeamPhoto, setGenerateTeamPhoto] = useState(false);
  const [generateWorkPhoto, setGenerateWorkPhoto] = useState(false);
  const [founderPhotoAttempts, setFounderPhotoAttempts] = useState(0);
  const [teamPhotoAttempts, setTeamPhotoAttempts] = useState(0);
  const [workPhotoAttempts, setWorkPhotoAttempts] = useState(0);

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: false, openTime: "", closeTime: "" },
    tuesday: { open: false, openTime: "", closeTime: "" },
    wednesday: { open: false, openTime: "", closeTime: "" },
    thursday: { open: false, openTime: "", closeTime: "" },
    friday: { open: false, openTime: "", closeTime: "" },
    saturday: { open: false, openTime: "", closeTime: "" },
    sunday: { open: false, openTime: "", closeTime: "" },
  });

  const [services, setServices] = useState(
    Array(10).fill({ name: "", price: "", description: "" })
  );

  const [pages, setPages] = useState({
    servicePages: false,
    blogPage: false,
    aboutPage: false,
    contactPage: false,
    serviceAreaPages: false,
  });

  const [logoFiles, setLogoFiles] = useState<string[]>([]);
  const [founderPhotos, setFounderPhotos] = useState<string[]>([]);
  const [teamPhotos, setTeamPhotos] = useState<string[]>([]);
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);

  const timeOptions = [
    "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM",
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
    "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM",
  ];

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // AI Auto-fill state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // AI Auto-fill function - generates complete dummy submission
  const handleAIAutoFill = async () => {
    setIsGeneratingAI(true);
    toast({
      title: "🤖 Generating with AI...",
      description: "Creating a complete dummy business submission. This may take a moment.",
    });

    try {
      // Call the edge function to generate dummy data
      const { data, error } = await supabase.functions.invoke("generate-dummy-submission");

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to generate data");

      const aiData = data.data;
      console.log("AI Generated Data:", aiData);

      // Fill all form fields with AI-generated data
      setFormData(prev => ({
        ...prev,
        companyName: aiData.companyName || "",
        ownsDomain: aiData.ownsDomain || "yes",
        domainName: aiData.domainName || "",
        businessPhone: aiData.businessPhone || "",
        businessEmail: aiData.businessEmail || "",
        jobRequestEmail: aiData.jobRequestEmail || "",
        mainCity: aiData.mainCity || "",
        serviceAreas: aiData.serviceAreas || "",
        showAddress: aiData.showAddress || "yes",
        streetAddress: aiData.streetAddress || "",
        city: aiData.city || aiData.mainCity || "",
        stateProvince: aiData.stateProvince || "",
        postalCode: aiData.postalCode || "",
        showHours: aiData.showHours || "yes",
        serviceCategory: aiData.serviceCategory || "",
        includeServicePage: aiData.includeServicePage || "include",
        showPricing: aiData.showPricing || "yes",
        servicePageType: aiData.servicePageType || "separate",
        freeEstimates: aiData.freeEstimates || "yes",
        customerAction: aiData.customerAction || "form",
        clientType: aiData.clientType || "both",
        serviceJobDuration: aiData.serviceJobDuration || "",
        serviceProcess: aiData.serviceProcess || "",
        serviceOptions: aiData.serviceOptions || "",
        guarantees: aiData.guarantees || "",
        businessUnique: aiData.businessUnique || "",
        qualityTrust: aiData.qualityTrust || "",
        accreditations: aiData.accreditations || "",
        founderMessage: aiData.founderMessage || "",
        teamMembers: aiData.teamMembers || "",
        communityGiving: aiData.communityGiving || "",
        coreValues: aiData.coreValues || "",
        websiteColors: aiData.websiteColors || "",
        fontName: aiData.fontName || "",
        googleBusinessProfileLink: aiData.googleBusinessProfileLink || "",
        googleReviews: aiData.googleReviews || "",
        yelpLink: aiData.yelpLink || "",
        instagramLink: aiData.instagramLink || "",
        facebookLink: aiData.facebookLink || "",
        specialOffersExplanation: aiData.specialOffersExplanation || "",
        financingExplanation: aiData.financingExplanation || "",
        competitorWebsites: aiData.competitorWebsites || "",
        additionalNotes: aiData.additionalNotes || "",
      }));

      // Set dropdown states
      setHasGoogleProfile("yes");
      setHasSpecialOffers(aiData.specialOffersExplanation ? "yes" : "no");
      setHasFinancing(aiData.financingExplanation ? "yes" : "no");
      setHasSpecificFont(aiData.fontName ? "yes" : "no");
      setHasBrandBook("no");
      setHasLogo("no"); // Will generate logo below

      // Set services from AI data
      if (aiData.services && Array.isArray(aiData.services)) {
        const filledServices = aiData.services.map((s: any) => ({
          name: s.name || "",
          price: s.price || "",
          description: s.description || "",
        }));
        // Pad with empty slots to make 10
        while (filledServices.length < 10) {
          filledServices.push({ name: "", price: "", description: "" });
        }
        setServices(filledServices);
      }

      // Set operating hours (Mon-Fri 8AM-6PM, Sat 9AM-4PM, Sun closed)
      setOperatingHours({
        monday: { open: true, openTime: "8:00 AM", closeTime: "6:00 PM" },
        tuesday: { open: true, openTime: "8:00 AM", closeTime: "6:00 PM" },
        wednesday: { open: true, openTime: "8:00 AM", closeTime: "6:00 PM" },
        thursday: { open: true, openTime: "8:00 AM", closeTime: "6:00 PM" },
        friday: { open: true, openTime: "8:00 AM", closeTime: "6:00 PM" },
        saturday: { open: true, openTime: "9:00 AM", closeTime: "4:00 PM" },
        sunday: { open: false, openTime: "", closeTime: "" },
      });

      // Set pages to include
      setPages({
        servicePages: true,
        blogPage: true,
        aboutPage: true,
        contactPage: true,
        serviceAreaPages: true,
      });

      // Set emergency services (pick one relevant option)
      setEmergencyServices({
        "24/7 emergency response": false,
        "Same-day repairs": true,
        "Temporary fixes until full service": false,
        "No emergency services": false,
        "Other": false,
      });

      // Open all sections to show filled data
      setOpenSections([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      toast({
        title: "✅ AI Auto-Fill Complete!",
        description: `Created dummy submission for: ${data.businessType}`,
      });

      // Now generate all images sequentially
      const generateImage = async (prompt: string, type: string): Promise<string | null> => {
        try {
          const response = await supabase.functions.invoke("generate-image", {
            body: { prompt }
          });
          const imageData = response.data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imageData) {
            console.log(`${type} generated successfully`);
            return imageData;
          }
        } catch (err) {
          console.warn(`${type} generation failed:`, err);
        }
        return null;
      };

      // Generate logo
      if (aiData.logoPrompt) {
        toast({
          title: "🎨 Generating logo...",
          description: "Creating AI-generated logo for the business.",
        });
        const logoImage = await generateImage(
          `Professional business logo: ${aiData.logoPrompt}. Clean, modern, minimal design on white background.`,
          "Logo"
        );
        if (logoImage) {
          setLogoFiles([logoImage]);
          setHasLogo("yes");
          toast({ title: "✅ Logo Generated!" });
        }
      }

      // Generate founder photo
      if (aiData.founderPhotoPrompt) {
        toast({
          title: "📸 Generating founder photo...",
          description: "Creating professional founder portrait.",
        });
        const founderImage = await generateImage(
          `Professional business portrait photo: ${aiData.founderPhotoPrompt}. High-quality, photorealistic, warm lighting.`,
          "Founder photo"
        );
        if (founderImage) {
          setFounderPhotos([founderImage]);
          toast({ title: "✅ Founder Photo Generated!" });
        }
      }

      // Generate team photo
      if (aiData.teamPhotoPrompt) {
        toast({
          title: "👥 Generating team photo...",
          description: "Creating professional team photo.",
        });
        const teamImage = await generateImage(
          `Professional team photo: ${aiData.teamPhotoPrompt}. High-quality, photorealistic, group portrait.`,
          "Team photo"
        );
        if (teamImage) {
          setTeamPhotos([teamImage]);
          toast({ title: "✅ Team Photo Generated!" });
        }
      }

      // Generate work photos
      if (aiData.workPhotosPrompt) {
        toast({
          title: "🔧 Generating work photos...",
          description: "Creating project gallery photos.",
        });
        const workImage = await generateImage(
          `Professional work photo: ${aiData.workPhotosPrompt}. High-quality, photorealistic, showing professional craftsmanship.`,
          "Work photo"
        );
        if (workImage) {
          setWorkPhotos([workImage]);
          toast({ title: "✅ Work Photos Generated!" });
        }
      }

      toast({
        title: "🎉 All Done!",
        description: "AI-generated submission is ready. Review and submit!",
      });

    } catch (error) {
      console.error("AI Auto-Fill Error:", error);
      toast({
        title: "❌ AI Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.hasGoogleProfile) setHasGoogleProfile(parsed.hasGoogleProfile);
        if (parsed.hasSpecialOffers) setHasSpecialOffers(parsed.hasSpecialOffers);
        if (parsed.hasFinancing) setHasFinancing(parsed.hasFinancing);
        if (parsed.emergencyServices) setEmergencyServices(parsed.emergencyServices);
        if (parsed.insuranceHelp) setInsuranceHelp(parsed.insuranceHelp);
        if (parsed.hasSpecificFont) setHasSpecificFont(parsed.hasSpecificFont);
        if (parsed.hasBrandBook) setHasBrandBook(parsed.hasBrandBook);
        if (parsed.hasLogo) setHasLogo(parsed.hasLogo);
        if (parsed.logoGenerationAttempts !== undefined) setLogoGenerationAttempts(parsed.logoGenerationAttempts);
        if (parsed.founderPhotoAttempts !== undefined) setFounderPhotoAttempts(parsed.founderPhotoAttempts);
        if (parsed.teamPhotoAttempts !== undefined) setTeamPhotoAttempts(parsed.teamPhotoAttempts);
        if (parsed.workPhotoAttempts !== undefined) setWorkPhotoAttempts(parsed.workPhotoAttempts);
        if (parsed.operatingHours) setOperatingHours(parsed.operatingHours);
        if (parsed.services) setServices(parsed.services);
        if (parsed.pages) setPages(parsed.pages);
        if (parsed.logoFiles) setLogoFiles(parsed.logoFiles);
        if (parsed.founderPhotos) setFounderPhotos(parsed.founderPhotos);
        if (parsed.teamPhotos) setTeamPhotos(parsed.teamPhotos);
        if (parsed.workPhotos) setWorkPhotos(parsed.workPhotos);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
        toast({
          title: "Draft restored",
          description: "Your previous progress has been restored.",
        });
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
  }, []);

  // Auto-save form data
  const saveForm = useCallback(() => {
    const now = new Date().toISOString();
    const dataToSave = {
      formData,
      hasGoogleProfile,
      hasSpecialOffers,
      hasFinancing,
      emergencyServices,
      insuranceHelp,
      hasSpecificFont,
      hasBrandBook,
      hasLogo,
      logoGenerationAttempts,
      founderPhotoAttempts,
      teamPhotoAttempts,
      workPhotoAttempts,
      operatingHours,
      services,
      pages,
      logoFiles,
      founderPhotos,
      teamPhotos,
      workPhotos,
      currentStep,
      lastSaved: now,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    setLastSaved(now);
  }, [formData, hasGoogleProfile, hasSpecialOffers, hasFinancing, emergencyServices, insuranceHelp, hasSpecificFont, hasBrandBook, hasLogo, logoGenerationAttempts, founderPhotoAttempts, teamPhotoAttempts, workPhotoAttempts, operatingHours, services, pages, logoFiles, founderPhotos, teamPhotos, workPhotos, currentStep]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      saveForm();
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, hasGoogleProfile, hasSpecialOffers, hasFinancing, emergencyServices, insuranceHelp, hasSpecificFont, hasBrandBook, hasLogo, logoGenerationAttempts, operatingHours, services, pages, currentStep, saveForm]);

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLastSaved(null);
    toast({
      title: "Draft cleared",
      description: "Your saved progress has been deleted.",
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate step completions for progress bar
  const formState: FormState = useMemo(() => ({
    formData: formData as FormState['formData'],
    hasGoogleProfile,
    hasSpecialOffers,
    hasFinancing,
    emergencyServices,
    insuranceHelp,
    hasSpecificFont,
    hasBrandBook,
    operatingHours,
    services,
    logoFiles,
    founderPhotos,
  }), [formData, hasGoogleProfile, hasSpecialOffers, hasFinancing, emergencyServices, insuranceHelp, hasSpecificFont, hasBrandBook, operatingHours, services, logoFiles, founderPhotos]);

  // Debounced step completions to prevent re-renders on every keystroke
  const [debouncedFormState, setDebouncedFormState] = useState(formState);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFormState(formState);
    }, 500); // Update completions after 500ms of no changes
    return () => clearTimeout(timer);
  }, [formState]);

  const stepCompletions = useMemo(() => calculateAllStepCompletions(debouncedFormState), [debouncedFormState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all steps are complete
    const incompleteSteps = getIncompleteSteps(formState, STEPS.map(s => s.title));
    
    if (incompleteSteps.length > 0) {
      toast({
        title: "Please complete all sections",
        description: `Incomplete sections: ${incompleteSteps.slice(0, 3).join(", ")}${incompleteSteps.length > 3 ? ` and ${incompleteSteps.length - 3} more` : ""}`,
        variant: "destructive",
      });
      
      // Find first incomplete step and navigate to it
      const firstIncompleteIndex = stepCompletions.findIndex(c => c < 100);
      if (firstIncompleteIndex !== -1) {
        setCurrentStep(firstIncompleteIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const fullFormData = {
        ...formData,
        hasGoogleProfile,
        hasSpecialOffers,
        hasFinancing,
        emergencyServices,
        insuranceHelp,
        hasSpecificFont,
        hasBrandBook,
        operatingHours,
        services,
        pages,
        logoFiles,
        founderPhotos,
        teamPhotos,
        workPhotos,
      };

      const { data: submission, error: dbError } = await supabase
        .from("website_submissions")
        .insert({
          company_name: formData.companyName,
          business_email: formData.businessEmail,
          form_data: fullFormData,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Format services list - extract just the names that have values
      const serviceNames = services
        .filter(s => s.name && s.name.trim() !== '')
        .map(s => s.name);

      // Format pages to include
      const pagesToInclude = Object.entries(pages)
        .filter(([_, included]) => included)
        .map(([key]) => {
          const pageLabels: Record<string, string> = {
            servicePages: 'Service Pages',
            blogPage: 'Blog Page',
            aboutPage: 'About Page',
            contactPage: 'Contact Page',
            serviceAreaPages: 'Service Area Pages'
          };
          return pageLabels[key] || key;
        });

      // Build the full form submission object for storage
      const formSubmissionData = {
        // Section 1: Business Information
        official_company_name: formData.companyName,
        owns_domain: formData.ownsDomain === 'yes',
        domain_name: formData.domainName,
        business_phone: formData.businessPhone,
        business_email: formData.businessEmail,
        job_requests_email: formData.jobRequestEmail,
        // Section 2: Location & Hours
        main_city: formData.mainCity,
        state_province: formData.stateProvince,
        service_areas: formData.serviceAreas ? formData.serviceAreas.split(/[,;\n]/).map(s => s.trim()).filter(s => s) : [],
        display_address_on_website: formData.showAddress === 'yes',
        business_address: formData.streetAddress,
        business_address_2: formData.streetAddress2,
        business_city: formData.city,
        business_state: formData.stateProvince,
        business_zip: formData.postalCode,
        display_hours_on_website: formData.showHours === 'yes',
        operating_hours: Object.fromEntries(
          Object.entries(operatingHours).map(([day, hours]) => [
            day,
            { open: hours.openTime, close: hours.closeTime, is_open: hours.open }
          ])
        ),
        // Section 3: Services
        service_category: formData.serviceCategory,
        services_list: services.filter(s => s.name && s.name.trim() !== ''),
        include_service_page: formData.includeServicePage === 'include',
        display_pricing_on_website: formData.showPricing === 'yes',
        service_page_type: formData.servicePageType === 'separate' ? 'Separate Pages' : 'Single Page',
        pages_to_include: pagesToInclude,
        free_estimates: formData.freeEstimates === 'yes',
        customer_action: formData.customerAction,
        client_type: formData.clientType,
        job_duration: formData.serviceJobDuration,
        // Section 4: Process & Operations
        service_process: formData.serviceProcess,
        emergency_services: Object.entries(emergencyServices).filter(([_, v]) => v).map(([k]) => k),
        service_options: formData.serviceOptions,
        guarantees: formData.guarantees,
        unique_value: formData.businessUnique,
        // Section 5: Trust
        quality_trust: formData.qualityTrust,
        accreditations: formData.accreditations,
        insurance_help: Object.entries(insuranceHelp).filter(([_, v]) => v).map(([k]) => k),
        // Section 6: Team & Photos
        founder_message: formData.founderMessage,
        team_members: formData.teamMembers,
        founder_photos: founderPhotos,
        team_photos: teamPhotos,
        community_giving: formData.communityGiving,
        core_values: formData.coreValues,
        // Section 7: Branding
        has_logo: hasLogo,
        logo_files: logoFiles,
        website_colors: formData.websiteColors,
        font_name: formData.fontName,
        brand_book_link: formData.brandBookLink,
        // Section 8: Online Presence
        google_business_profile: formData.googleBusinessProfileLink,
        google_reviews: formData.googleReviews,
        other_reviews_link: formData.otherReviewsLink,
        yelp_link: formData.yelpLink,
        instagram_link: formData.instagramLink,
        facebook_link: formData.facebookLink,
        tiktok_link: formData.tiktokLink,
        work_photos: workPhotos,
        work_photos_link: formData.workPhotosLink,
        // Section 9: Offers
        special_offers: hasSpecialOffers === 'yes',
        special_offers_details: formData.specialOffersExplanation,
        financing: hasFinancing === 'yes',
        financing_details: formData.financingExplanation,
        // Section 10: Final
        competitor_websites: formData.competitorWebsites,
        additional_notes: formData.additionalNotes,
      };

      // Create a client card automatically with ALL form data
      // This creates a new client with:
      // - Website Subscription: ON (they submitted the form = they're subscribing)
      // - All other toggles: OFF (pending setup)
      // - Form submission data stored in notes for display in client profile
      // Get logo URL from uploaded or generated logos
      const clientLogoUrl = logoFiles && logoFiles.length > 0 ? logoFiles[0] : null;
      
      // Website URL - use domain if provided, otherwise generate from company name
      // This is critical - without website_url, the client shows as a Funnel client
      const websiteUrl = formData.domainName 
        ? formData.domainName 
        : `www.${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      
      // Store logo in formSubmissionData which goes to notes
      const formSubmissionDataWithLogo = {
        ...formSubmissionData,
        logo_files: logoFiles, // Store logo URLs in the notes JSON
      };
      
      console.log("Creating client with data:", {
        name: formData.companyName,
        company_name: formData.companyName,
        email: formData.businessEmail,
        website_url: websiteUrl,
        logo_files: logoFiles,
        primary_services: serviceNames,
      });
      
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: formData.companyName,
          company_name: formData.companyName,
          email: formData.businessEmail,
          phone: formData.businessPhone,
          website_url: websiteUrl, // Always set for website submissions
          primary_services: serviceNames.length > 0 ? serviceNames : null,
          brand_voice: formData.serviceCategory || 'Professional',
          target_audience: formData.clientType === 'homeowners' ? 'Homeowners' : formData.clientType === 'businesses' ? 'Businesses' : 'Homeowners & Businesses',
          status: 'PENDING', // New submissions start as PENDING until website is live
          notes: JSON.stringify(formSubmissionDataWithLogo), // Logo stored in notes JSON
        })
        .select()
        .single();

      if (clientError) {
        console.error("Client creation error:", clientError);
        console.error("Full error details:", JSON.stringify(clientError, null, 2));
        // Don't throw - submission was successful, client creation is secondary
      } else if (newClient) {
        console.log("Client created successfully:", newClient.id, newClient);
      }

      const { error: fnError } = await supabase.functions.invoke("notify-website-submission", {
        body: {
          companyName: formData.companyName,
          businessEmail: formData.businessEmail,
          businessPhone: formData.businessPhone,
          mainCity: formData.mainCity,
          serviceCategory: formData.serviceCategory,
          serviceAreas: formData.serviceAreas,
          domainName: formData.domainName,
          formData: fullFormData,
          submissionId: submission.id,
        },
      });

      if (fnError) {
        console.error("Notification error:", fnError);
      }

      // Clear saved draft on successful submission
      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: "Submission successful!",
        description: "Your website onboarding form has been submitted.",
      });

      navigate("/website-submission-confirmation", {
        state: {
          companyName: formData.companyName,
          businessEmail: formData.businessEmail,
          businessPhone: formData.businessPhone,
          mainCity: formData.mainCity,
          serviceAreas: formData.serviceAreas,
          serviceCategory: formData.serviceCategory,
          domainName: formData.domainName,
          websiteColors: formData.websiteColors,
          additionalNotes: formData.additionalNotes,
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mobile-optimized section wrapper
  const MobileSection = ({ children, title, icon: Icon }: { children: React.ReactNode, title: string, icon: any }) => (
    <section>
      {!isMobile && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <Icon className="w-8 h-8 text-primary" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h2>
        </div>
      )}
      <div className={`${isMobile ? 'space-y-4' : 'border-t border-border pt-6 space-y-6'}`}>
        {children}
      </div>
    </section>
  );

  // Mobile-optimized form field
  const FormField = ({ label, required, hint, children }: { label: string, required?: boolean, hint?: string, children: React.ReactNode }) => (
    <div>
      <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className={`${isMobile ? 'mt-1.5' : 'mt-2'}`}>
        {children}
      </div>
      {hint && (
        <p className={`${isMobile ? 'text-xs mt-1' : 'text-sm mt-1'} text-muted-foreground`}>
          {hint}
        </p>
      )}
    </div>
  );

  // Handler for GBP location auto-fill
  const handleGBPLocationFound = (data: { city?: string; state?: string; serviceAreas?: string }) => {
    setFormData(prev => ({
      ...prev,
      ...(data.city && !prev.mainCity && { mainCity: data.city }),
      ...(data.state && !prev.stateProvince && { stateProvince: data.state }),
      ...(data.serviceAreas && !prev.serviceAreas && { serviceAreas: data.serviceAreas }),
    }));
  };

  // Memoized handler for form field changes - prevents focus loss on re-render
  const handleFieldChange = useCallback((field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  // Memoized handler for direct value changes (Select, custom components)
  const handleValueChange = useCallback((field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Step 1: Business Info
  const renderStep1 = () => (
    <MobileSection title="1. Business Info" icon={Building2}>
      <FormField label="1.1 Official company name" required hint="Provide your full registered company name.">
        <Input
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.companyName}
          onChange={handleFieldChange('companyName')}
          placeholder="Enter company name"
        />
      </FormField>

      {/* 1.2 Google Business Profile - early to auto-fill info */}
      <FormField label="1.2 Do you have a Google Business Profile?">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasGoogleProfile === "yes"}
              onCheckedChange={(checked) => setHasGoogleProfile(checked ? "yes" : "")}
            />
            <label className="text-sm">Yes</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasGoogleProfile === "no"}
              onCheckedChange={(checked) => setHasGoogleProfile(checked ? "no" : "")}
            />
            <label className="text-sm">No, I don't have one</label>
          </div>
        </div>
      </FormField>

      {hasGoogleProfile === "yes" && (
        <div className="space-y-2">
          <GBPScanner
            value={formData.googleBusinessProfileLink}
            onChange={handleValueChange('googleBusinessProfileLink')}
            onLocationFound={handleGBPLocationFound}
          />
          <p className="text-xs text-muted-foreground">
            We'll use this to auto-fill your location and service areas
          </p>
        </div>
      )}

      <FormField label="1.3 Do you own a domain name?" required>
        <Select
          value={formData.ownsDomain}
          onValueChange={handleValueChange('ownsDomain')}
        >
          <SelectTrigger className={`${isMobile ? 'h-11' : ''} max-w-md`}>
            <SelectValue placeholder="Please Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {formData.ownsDomain === "yes" && (
        <FormField label="1.4 Domain name" required hint="Format: www.domainname.com">
          <Input
            className={`${isMobile ? 'h-11' : ''} max-w-md`}
            value={formData.domainName}
            onChange={handleFieldChange('domainName')}
            placeholder="www.domainname.com"
          />
        </FormField>
      )}

      <FormField label="1.5 Business Phone" required hint="Enter a valid phone number">
        <Input
          type="tel"
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.businessPhone}
          onChange={handleFieldChange('businessPhone')}
          placeholder="(000) 000-0000"
        />
      </FormField>

      <FormField label="1.6 Business Email" required hint="Enter a valid business email">
        <Input
          type="email"
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.businessEmail}
          onChange={handleFieldChange('businessEmail')}
          placeholder="example@example.com"
        />
      </FormField>

      <FormField label="1.7 Email for job requests" required hint="Where website form messages go">
        <Input
          type="email"
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.jobRequestEmail}
          onChange={handleFieldChange('jobRequestEmail')}
          placeholder="example@example.com"
        />
      </FormField>
    </MobileSection>
  );

  // Step 2: Location & Hours
  const renderStep2 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <MapPin className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          2. Location & Hours
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            2.1 Main City / Primary Service Location <span className="text-destructive">*</span>
          </Label>
          <Input
            className="mt-2 max-w-md"
            value={formData.mainCity}
            onChange={handleFieldChange('mainCity')}
          />
          <p className="text-sm text-muted-foreground mt-1">
            What city, region or state do you primarily serve? (e.g., Chicago)
          </p>
        </div>

        <div>
          <Label className="text-base font-medium">
            2.2 Service areas <span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="mt-2"
            rows={5}
            value={formData.serviceAreas}
            onChange={handleFieldChange('serviceAreas')}
          />
          <p className="text-sm text-muted-foreground mt-1">
            List all suburbs you work in around your main city. Example: Lemont, IL; Buffalo Grove, IL; Naperville, IL.
          </p>
        </div>

        <div>
          <Label className="text-base font-medium">
            2.3 Display business address on website? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.showAddress}
            onValueChange={handleValueChange('showAddress')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.showAddress === "yes" && (
          <div>
            <Label className="text-base font-medium">2.4 Business address</Label>
            <div className="mt-2 space-y-4">
              <div>
                <Input
                  value={formData.streetAddress}
                  onChange={handleFieldChange('streetAddress')}
                />
                <p className="text-sm text-muted-foreground mt-1">Street Address</p>
              </div>
              <div>
                <Input
                  value={formData.streetAddress2}
                  onChange={handleFieldChange('streetAddress2')}
                />
                <p className="text-sm text-muted-foreground mt-1">Street Address Line 2</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    value={formData.city}
                    onChange={handleFieldChange('city')}
                  />
                  <p className="text-sm text-muted-foreground mt-1">City</p>
                </div>
                <div>
                  <Input
                    value={formData.stateProvince}
                    onChange={handleFieldChange('stateProvince')}
                  />
                  <p className="text-sm text-muted-foreground mt-1">State / Province</p>
                </div>
              </div>
              <div>
                <Input
                  value={formData.postalCode}
                  onChange={handleFieldChange('postalCode')}
                />
                <p className="text-sm text-muted-foreground mt-1">Postal / Zip Code</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            2.5 Display operating hours on website? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.showHours}
            onValueChange={handleValueChange('showHours')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.showHours === "yes" && (
          <div>
            <Label className="text-base font-medium">2.6 Operating hours</Label>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left font-medium"></th>
                    <th className="p-3 text-center font-medium">Open</th>
                    <th className="p-3 text-center font-medium">Open Time</th>
                    <th className="p-3 text-center font-medium">Close Time</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day} className="border-b border-border">
                      <td className="p-3 capitalize font-medium">{day}</td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={operatingHours[day as keyof typeof operatingHours].open}
                          onCheckedChange={(checked) =>
                            setOperatingHours({
                              ...operatingHours,
                              [day]: { ...operatingHours[day as keyof typeof operatingHours], open: checked as boolean },
                            })
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Select
                          value={operatingHours[day as keyof typeof operatingHours].openTime}
                          onValueChange={(value) =>
                            setOperatingHours({
                              ...operatingHours,
                              [day]: { ...operatingHours[day as keyof typeof operatingHours], openTime: value },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Select
                          value={operatingHours[day as keyof typeof operatingHours].closeTime}
                          onValueChange={(value) =>
                            setOperatingHours({
                              ...operatingHours,
                              [day]: { ...operatingHours[day as keyof typeof operatingHours], closeTime: value },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // Step 3: Focus & Services
  const renderStep3 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Target className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          3. Services
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            3.1 What category best describes your services?
          </Label>
          <Input
            className="mt-2 max-w-md"
            value={formData.serviceCategory}
            onChange={handleFieldChange('serviceCategory')}
          />
          <p className="text-sm text-muted-foreground mt-1">
            E.g., roofing, landscaping, window cleaning, TV installation, etc.
          </p>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.2 List all the services you provide (max 5-10) <span className="text-destructive">*</span>
          </Label>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-left font-medium"></th>
                  <th className="p-3 text-center font-medium">Name</th>
                  <th className="p-3 text-center font-medium">Price</th>
                  <th className="p-3 text-center font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="p-3 font-medium">Service {index + 1}</td>
                    <td className="p-3">
                      <Input
                        value={service.name}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[index] = { ...service, name: e.target.value };
                          setServices(newServices);
                        }}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        value={service.price}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[index] = { ...service, price: e.target.value };
                          setServices(newServices);
                        }}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        value={service.description}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[index] = { ...service, description: e.target.value };
                          setServices(newServices);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.3 Include service page on website? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.includeServicePage}
            onValueChange={handleValueChange('includeServicePage')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include</SelectItem>
              <SelectItem value="dont-include">Don't Include</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.4 Display service pricing on website? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.showPricing}
            onValueChange={handleValueChange('showPricing')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.5 One service page or separate pages? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.servicePageType}
            onValueChange={handleValueChange('servicePageType')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">One service page</SelectItem>
              <SelectItem value="separate">Separate page for each service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.6 Which pages to include on your site
          </Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={pages.servicePages}
                onCheckedChange={(checked) => setPages({ ...pages, servicePages: checked as boolean })}
              />
              <label className="text-sm">Service pages</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={pages.blogPage}
                onCheckedChange={(checked) => setPages({ ...pages, blogPage: checked as boolean })}
              />
              <label className="text-sm">Blog Page</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={pages.aboutPage}
                onCheckedChange={(checked) => setPages({ ...pages, aboutPage: checked as boolean })}
              />
              <label className="text-sm">About Us Page</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={pages.contactPage}
                onCheckedChange={(checked) => setPages({ ...pages, contactPage: checked as boolean })}
              />
              <label className="text-sm">Contact Page</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={pages.serviceAreaPages}
                onCheckedChange={(checked) => setPages({ ...pages, serviceAreaPages: checked as boolean })}
              />
              <label className="text-sm">Service Area Pages</label>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.7 Do you offer free estimates? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.freeEstimates}
            onValueChange={handleValueChange('freeEstimates')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.8 What do you want customers to do first? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.customerAction}
            onValueChange={handleValueChange('customerAction')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call us</SelectItem>
              <SelectItem value="form">Fill out a form</SelectItem>
              <SelectItem value="email">Send an email</SelectItem>
              <SelectItem value="book">Book an appointment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.9 Who are your main customers? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.clientType}
            onValueChange={handleValueChange('clientType')}
          >
            <SelectTrigger className="mt-2 max-w-md">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homeowners">Homeowners</SelectItem>
              <SelectItem value="businesses">Businesses</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">
            3.10 Typical job duration
          </Label>
          <Input
            className="mt-2 max-w-md"
            value={formData.serviceJobDuration}
            onChange={handleFieldChange('serviceJobDuration')}
            placeholder="e.g., 1-2 hours, half day, 2-3 days"
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            3.11 How many service area pages would you like?
          </Label>
          <Input
            className="mt-2 max-w-md"
            value={formData.serviceAreaPages}
            onChange={handleFieldChange('serviceAreaPages')}
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            3.12 What challenges do your customers face?
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.homeownerChallenges}
            onChange={handleFieldChange('homeownerChallenges')}
            placeholder="Describe common problems your customers experience..."
          />
        </div>
      </div>
    </section>
  );

  // Step 4: Process & Operations
  const renderStep4 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          4. Operations
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            4.1 Describe your service process <span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="mt-2"
            rows={5}
            value={formData.serviceProcess}
            onChange={handleFieldChange('serviceProcess')}
            placeholder="Step 1: Initial call/inquiry. Step 2: Free estimate. Step 3: Schedule work..."
          />
          <p className="text-sm text-muted-foreground mt-1">
            Describe step-by-step what happens from first contact to job completion.
          </p>
        </div>

        <div>
          <Label className="text-base font-medium">
            4.2 What emergency services do you offer?
          </Label>
          <div className="mt-3 space-y-3">
            {Object.keys(emergencyServices).map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  checked={emergencyServices[option as keyof typeof emergencyServices]}
                  onCheckedChange={(checked) =>
                    setEmergencyServices({ ...emergencyServices, [option]: checked as boolean })
                  }
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">
            4.3 Do you offer service options or packages?
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.serviceOptions}
            onChange={handleFieldChange('serviceOptions')}
            placeholder="e.g., Basic, Standard, Premium packages..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            4.4 What guarantees or warranties do you offer? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.guarantees}
            onChange={handleFieldChange('guarantees')}
            placeholder="e.g., 5-year workmanship warranty, satisfaction guarantee..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            4.5 What makes your business unique? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="mt-2"
            rows={5}
            value={formData.businessUnique}
            onChange={handleFieldChange('businessUnique')}
            placeholder="What sets you apart from competitors?"
          />
        </div>
      </div>
    </section>
  );

  // Step 5: Trust & Credibility
  const renderStep5 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          5. Trust
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            5.1 How can customers trust your work quality? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="mt-2"
            rows={5}
            value={formData.qualityTrust}
            onChange={handleFieldChange('qualityTrust')}
            placeholder="Years in business, licenses, insurance, certifications, awards..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            5.2 Accreditations, certifications, or partnerships
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.accreditations}
            onChange={handleFieldChange('accreditations')}
            placeholder="e.g., BBB Accredited, ISO 9001 Certified..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            5.3 Do you help with insurance claims or HOA paperwork?
          </Label>
          <div className="mt-3 space-y-3">
            {Object.keys(insuranceHelp).map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  checked={insuranceHelp[option as keyof typeof insuranceHelp]}
                  onCheckedChange={(checked) =>
                    setInsuranceHelp({ ...insuranceHelp, [option]: checked as boolean })
                  }
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">
            5.4 Elaborate on insurance/HOA assistance (if applicable)
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.insuranceElaboration}
            onChange={handleFieldChange('insuranceElaboration')}
          />
        </div>
      </div>
    </section>
  );

  // Step 6: Team & Story
  const renderStep6 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Users className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          6. Team & Story
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            6.1 Founder's message <span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="mt-2"
            rows={5}
            value={formData.founderMessage}
            onChange={handleFieldChange('founderMessage')}
            placeholder="Your name, title, and story about why you started the business..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            6.2 Team members to feature on website
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.teamMembers}
            onChange={handleFieldChange('teamMembers')}
            placeholder="John Smith – Project Manager, Jane Doe – Lead Technician..."
          />
        </div>

        {/* 6.3 Logo - BEFORE photos so it can be used in AI-generated photos */}
        <div>
          <Label className="text-base font-medium">
            6.3 Do you have a company logo? <span className="text-destructive">*</span>
          </Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasLogo === "yes"}
                onCheckedChange={(checked) => setHasLogo(checked ? "yes" : "")}
              />
              <label className="text-sm">Yes, I'll upload it</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasLogo === "no"}
                onCheckedChange={(checked) => setHasLogo(checked ? "no" : "")}
              />
              <label className="text-sm">No, generate one for me using AI</label>
            </div>
          </div>
        </div>

        {hasLogo === "yes" && (
          <FileUpload
            label="Upload your logo"
            required
            folder="logos"
            description="Ideally, upload a transparent/no background logo."
            onFilesChange={setLogoFiles}
            existingUrls={logoFiles}
          />
        )}

        {hasLogo === "no" && (
          <LogoGenerator
            companyName={formData.companyName}
            serviceCategory={formData.serviceCategory}
            websiteColors={formData.websiteColors}
            attemptsUsed={logoGenerationAttempts}
            maxAttempts={10}
            onLogoGenerated={(url) => {
              setLogoFiles([url]);
              setHasLogo("yes");
            }}
            onAttemptsChange={setLogoGenerationAttempts}
            onCancel={() => setHasLogo("")}
          />
        )}

        {logoFiles.length > 0 && hasLogo === "yes" && (
          <div className="flex items-center gap-3">
            <img
              src={logoFiles[0]}
              alt="Your logo"
              className="w-24 h-24 object-contain rounded-lg border border-border bg-zinc-900 p-2"
            />
            <div className="text-sm text-green-500 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Logo saved
            </div>
          </div>
        )}

        {/* 6.4 Founder/Owner Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              6.4 Founder / owner photos
            </Label>
            {!generateFounderPhoto && founderPhotos.length === 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGenerateFounderPhoto(true)}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate with AI
              </Button>
            )}
          </div>
          
          {generateFounderPhoto ? (
            <PhotoGenerator
              type="founder"
              companyName={formData.companyName}
              serviceCategory={formData.serviceCategory}
              mainCity={formData.mainCity}
              founderMessage={formData.founderMessage}
              logoUrl={logoFiles[0]}
              attemptsUsed={founderPhotoAttempts}
              maxAttempts={10}
              onPhotoGenerated={(url) => {
                setFounderPhotos(prev => [...prev, url]);
                setGenerateFounderPhoto(false);
              }}
              onAttemptsChange={setFounderPhotoAttempts}
              onCancel={() => setGenerateFounderPhoto(false)}
            />
          ) : (
            <FileUpload
              label=""
              folder="founder-photos"
              description="Upload high-quality, professional photos of yourself."
              onFilesChange={setFounderPhotos}
              existingUrls={founderPhotos}
            />
          )}
        </div>

        {/* 6.5 Team Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              6.5 Team photos
            </Label>
            {!generateTeamPhoto && teamPhotos.length === 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGenerateTeamPhoto(true)}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate with AI
              </Button>
            )}
          </div>
          
          {generateTeamPhoto ? (
            <PhotoGenerator
              type="team"
              companyName={formData.companyName}
              serviceCategory={formData.serviceCategory}
              mainCity={formData.mainCity}
              teamMembers={formData.teamMembers}
              logoUrl={logoFiles[0]}
              attemptsUsed={teamPhotoAttempts}
              maxAttempts={10}
              onPhotoGenerated={(url) => {
                setTeamPhotos(prev => [...prev, url]);
                setGenerateTeamPhoto(false);
              }}
              onAttemptsChange={setTeamPhotoAttempts}
              onCancel={() => setGenerateTeamPhoto(false)}
            />
          ) : (
            <FileUpload
              label=""
              folder="team-photos"
              description="Upload photos of your team — group shots or individual portraits."
              onFilesChange={setTeamPhotos}
              existingUrls={teamPhotos}
            />
          )}
        </div>

        {/* 6.6 Work Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              6.6 Work photos / Project gallery
            </Label>
            {!generateWorkPhoto && workPhotos.length === 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGenerateWorkPhoto(true)}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate with AI
              </Button>
            )}
          </div>
          
          {generateWorkPhoto ? (
            <PhotoGenerator
              type="work"
              companyName={formData.companyName}
              serviceCategory={formData.serviceCategory}
              mainCity={formData.mainCity}
              logoUrl={logoFiles[0]}
              attemptsUsed={workPhotoAttempts}
              maxAttempts={10}
              onPhotoGenerated={(url) => {
                setWorkPhotos(prev => [...prev, url]);
                setGenerateWorkPhoto(false);
              }}
              onAttemptsChange={setWorkPhotoAttempts}
              onCancel={() => setGenerateWorkPhoto(false)}
            />
          ) : (
            <FileUpload
              label=""
              folder="work-photos"
              description="Upload high-quality photos of your completed work."
              onFilesChange={setWorkPhotos}
              existingUrls={workPhotos}
            />
          )}
        </div>

        <div>
          <Label className="text-base font-medium">
            6.7 Do you give back to the community?
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.communityGiving}
            onChange={handleFieldChange('communityGiving')}
            placeholder="Sponsorships, donations, volunteer work..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            6.8 Company core values
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.coreValues}
            onChange={handleFieldChange('coreValues')}
            placeholder="List 3-4 values that define your company..."
          />
        </div>
      </div>
    </section>
  );

  // Step 7: Branding & Visuals (logo moved to section 6)
  const renderStep7 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          7. Branding Details
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            7.1 Website colors
          </Label>
          <Textarea
            className="mt-2"
            rows={3}
            value={formData.websiteColors}
            onChange={handleFieldChange('websiteColors')}
            placeholder="Skip if you'd like us to match your logo colors"
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            7.2 Do you have a specific font in mind?
          </Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasSpecificFont === "yes"}
                onCheckedChange={(checked) => setHasSpecificFont(checked ? "yes" : "")}
              />
              <label className="text-sm">Yes</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasSpecificFont === "no"}
                onCheckedChange={(checked) => setHasSpecificFont(checked ? "no" : "")}
              />
              <label className="text-sm">No (we'll choose one)</label>
            </div>
          </div>
        </div>

        {hasSpecificFont === "yes" && (
          <div>
            <Label className="text-base font-medium">7.3 Font name</Label>
            <Input
              className="mt-2 max-w-md"
              value={formData.fontName}
              onChange={handleFieldChange('fontName')}
            />
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            7.4 Do you have a brand book?
          </Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasBrandBook === "yes"}
                onCheckedChange={(checked) => setHasBrandBook(checked ? "yes" : "")}
              />
              <label className="text-sm">Yes</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasBrandBook === "no"}
                onCheckedChange={(checked) => setHasBrandBook(checked ? "no" : "")}
              />
              <label className="text-sm">No</label>
            </div>
          </div>
        </div>

        {hasBrandBook === "yes" && (
          <div>
            <Label className="text-base font-medium">
              7.5 Brand book link (Google Drive or other)
            </Label>
            <Textarea
              className="mt-2"
              rows={2}
              value={formData.brandBookLink}
              onChange={handleFieldChange('brandBookLink')}
            />
          </div>
        )}
      </div>
    </section>
  );

  // Step 8: Online Presence & Reviews
  const renderStep8 = () => {
    return (
      <section>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-primary" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            8. Reviews & Social
          </h2>
        </div>
        <div className="border-t border-border pt-6 space-y-6">
          <div>
            <Label className="text-base font-medium">
              8.1 How many Google reviews do you have?
            </Label>
            <Input
              className="mt-2 max-w-md"
              value={formData.googleReviews}
              onChange={handleFieldChange('googleReviews')}
              placeholder="e.g., 50+ reviews, 4.8 stars"
            />
          </div>

          <div>
            <Label className="text-base font-medium">
              8.2 Links to reviews on other platforms
            </Label>
            <Textarea
              className="mt-2"
              rows={3}
              value={formData.otherReviewsLink}
              onChange={handleFieldChange('otherReviewsLink')}
              placeholder="Yelp, HomeAdvisor, Angi, etc."
            />
          </div>

          {/* Social Media Links */}
          <SocialMediaFields
            yelpLink={formData.yelpLink}
            instagramLink={formData.instagramLink}
            facebookLink={formData.facebookLink}
            tiktokLink={formData.tiktokLink}
            onYelpChange={handleValueChange('yelpLink')}
            onInstagramChange={handleValueChange('instagramLink')}
            onFacebookChange={handleValueChange('facebookLink')}
            onTiktokChange={handleValueChange('tiktokLink')}
          />

          <div>
            <Label className="text-base font-medium">
              8.3 Link to additional work photos (optional)
            </Label>
            <Input
              className="mt-2 max-w-md"
              value={formData.workPhotosLink}
              onChange={handleFieldChange('workPhotosLink')}
              placeholder="Google Drive, Dropbox, etc."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Work photos can be uploaded or generated in Section 6
            </p>
          </div>
        </div>
      </section>
    );
  };

  // Step 9: Offers & Financing
  const renderStep9 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <DollarSign className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          9. Offers
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            9.1 Do you have any special offers or promotions?
          </Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasSpecialOffers === "yes"}
                onCheckedChange={(checked) => setHasSpecialOffers(checked ? "yes" : "")}
              />
              <label className="text-sm">Yes</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasSpecialOffers === "no"}
                onCheckedChange={(checked) => setHasSpecialOffers(checked ? "no" : "")}
              />
              <label className="text-sm">No</label>
            </div>
          </div>
        </div>

        {hasSpecialOffers === "yes" && (
          <div>
            <Label className="text-base font-medium">
              9.2 Describe your special offers
            </Label>
            <Textarea
              className="mt-2"
              rows={4}
              value={formData.specialOffersExplanation}
              onChange={handleFieldChange('specialOffersExplanation')}
              placeholder="e.g., 10% off first service, seasonal discounts..."
            />
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            9.3 Do you offer financing options?
          </Label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasFinancing === "yes"}
                onCheckedChange={(checked) => setHasFinancing(checked ? "yes" : "")}
              />
              <label className="text-sm">Yes</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasFinancing === "no"}
                onCheckedChange={(checked) => setHasFinancing(checked ? "no" : "")}
              />
              <label className="text-sm">No</label>
            </div>
          </div>
        </div>

        {hasFinancing === "yes" && (
          <div>
            <Label className="text-base font-medium">
              9.4 Describe your financing options
            </Label>
            <Textarea
              className="mt-2"
              rows={4}
              value={formData.financingExplanation}
              onChange={handleFieldChange('financingExplanation')}
              placeholder="e.g., 0% APR for 12 months, payment plans..."
            />
          </div>
        )}
      </div>
    </section>
  );

  // Step 10: Final
  const renderStep10 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          10. Final
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            10.1 Competitor websites you admire
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.competitorWebsites}
            onChange={handleFieldChange('competitorWebsites')}
            placeholder="List URLs of websites you like..."
          />
          <p className="text-sm text-muted-foreground mt-1">
            Share links to competitor or industry websites whose design or features you admire.
          </p>
        </div>

        <div>
          <Label className="text-base font-medium">
            10.2 Additional notes or requests
          </Label>
          <Textarea
            className="mt-2"
            rows={6}
            value={formData.additionalNotes}
            onChange={handleFieldChange('additionalNotes')}
            placeholder="Any other information you'd like us to know..."
          />
          <p className="text-sm text-muted-foreground mt-1">
            Include any special requests, preferences, or additional context.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mt-8">
          <h3 className="font-heading text-lg font-semibold mb-2">Ready to submit?</h3>
          <p className="text-muted-foreground text-sm">
            Please review your answers before submitting. You can use the progress bar above to navigate back to any section.
          </p>
        </div>
      </div>
    </section>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      case 9: return renderStep9();
      case 10: return renderStep10();
      default: return renderStep1();
    }
  };

  const stepRenderers = [
    renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
    renderStep6, renderStep7, renderStep8, renderStep9, renderStep10
  ];

  // Mobile compact card for each section
  const renderMobileCard = (step: typeof STEPS[0], index: number, completion: number) => (
    <button
      type="button"
      onClick={() => openMobileDrawer(step.id)}
      className="flex flex-col items-center justify-center w-full p-3 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all cursor-pointer rounded-xl border border-border/50 active:scale-[0.97] min-h-[100px]"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${completion === 100 ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
        {completion === 100 ? <Check className="w-5 h-5" /> : step.icon}
      </div>
      <h3 className="font-medium text-foreground text-xs text-center leading-tight mb-1">{step.title}</h3>
      <div className="w-full px-2">
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${completion === 100 ? 'bg-green-500' : 'bg-cyan-500'}`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <span className="text-[9px] text-muted-foreground mt-1 block text-center">{completion}%</span>
      </div>
    </button>
  );

  // Desktop accordion header
  const renderSectionHeader = (step: typeof STEPS[0], index: number, isOpen: boolean, completion: number) => (
    <div className="flex items-center justify-between w-full py-4 px-6 bg-card hover:bg-muted/50 transition-colors cursor-pointer rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completion === 100 ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
          {completion === 100 ? <Check className="w-5 h-5" /> : step.icon}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-foreground">{step.title}</h3>
          <p className="text-xs text-muted-foreground">{completion}% complete</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${completion === 100 ? 'bg-green-500' : 'bg-primary'}`}
            style={{ width: `${completion}%` }}
          />
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </div>
    </div>
  );

  // Desktop accordion view
  const renderDesktopAccordion = () => (
    <div className="space-y-4">
      {STEPS.map((step, index) => (
        <Collapsible
          key={step.id}
          open={openSections.includes(step.id)}
          onOpenChange={() => toggleSection(step.id)}
        >
          <CollapsibleTrigger className="w-full">
            {renderSectionHeader(step, index, openSections.includes(step.id), stepCompletions[index])}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-card border border-border border-t-0 rounded-b-xl p-6 -mt-2">
              {stepRenderers[index]()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );

  // Mobile compact grid with drawer popups
  const renderMobileCompact = () => (
    <>
      {/* Compact card grid - 2 columns for better mobile fit */}
      <div className="grid grid-cols-2 gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id}>
            {renderMobileCard(step, index, stepCompletions[index])}
          </div>
        ))}
      </div>

      {/* Mobile Drawer for each section - optimized for mobile */}
      <Drawer open={mobileDrawerStep !== null} onOpenChange={(open) => !open && closeMobileDrawer()}>
        <DrawerContent className="max-h-[80vh] rounded-t-3xl">
          {mobileDrawerStep !== null && (
            <>
              {/* Drawer Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              
              {/* Compact Header */}
              <DrawerHeader className="border-b border-border py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      {STEPS[mobileDrawerStep - 1]?.icon}
                    </div>
                    <div>
                      <DrawerTitle className="text-base font-semibold">{STEPS[mobileDrawerStep - 1]?.title}</DrawerTitle>
                      <p className="text-[10px] text-muted-foreground">
                        {stepCompletions[mobileDrawerStep - 1]}% complete
                      </p>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              
              {/* Scrollable Content - Mobile Optimized */}
              <div className="overflow-y-auto flex-1 px-4 py-4 mobile-form-content">
                <div className="space-y-4 text-sm">
                  {stepRenderers[mobileDrawerStep - 1]()}
                </div>
              </div>
              
              {/* Fixed Bottom Action */}
              <div className="p-3 border-t border-border bg-background/95 backdrop-blur-sm safe-area-bottom">
                <Button 
                  type="button"
                  onClick={closeMobileDrawer}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold h-12 rounded-xl text-sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save & Close
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
      
      {/* Mobile-specific styles */}
      <style>{`
        .mobile-form-content label {
          font-size: 13px !important;
        }
        .mobile-form-content input,
        .mobile-form-content textarea,
        .mobile-form-content select,
        .mobile-form-content button[role="combobox"] {
          font-size: 16px !important; /* Prevents zoom on iOS */
          min-height: 44px;
        }
        .mobile-form-content .space-y-6 {
          gap: 1rem;
        }
        .mobile-form-content h2 {
          font-size: 1.1rem !important;
        }
        .safe-area-bottom {
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
      `}</style>
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Website Onboarding Form | Rank Me Higher</title>
        <meta name="description" content="Complete this form to start your website development." />
      </Helmet>

      <AvaAdminHeader />

      <main className={`flex-1 ${isMobile ? 'pt-20 pb-24' : 'pt-24 pb-16'}`}>
        <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'} max-w-4xl`}>
          {/* Header - Compact on mobile */}
          <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
            {/* Navigation and AI Button Row */}
            <div className="flex items-center justify-between mb-4">
              {/* Return Button */}
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="-ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {/* AI Auto-Fill Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIAutoFill}
                disabled={isGeneratingAI}
                className="gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30 hover:border-cyan-500/50 text-purple-400 hover:text-cyan-400 transition-all"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    {isMobile ? 'AI Fill' : 'Create Dummy Submission with AI'}
                  </>
                )}
              </Button>
            </div>
            
            <h1 className={`font-heading font-bold text-foreground ${isMobile ? 'text-xl mb-2' : 'text-3xl md:text-4xl mb-4'}`}>
              {isMobile ? 'Client Onboarding' : 'Website Onboarding Form'}
            </h1>
            {!isMobile && (
              <p className="text-muted-foreground text-lg mb-4">
                Complete all sections below. Click on any section to expand it. Your progress is saved automatically.
              </p>
            )}
            <AutoSaveIndicator lastSaved={lastSaved} onClearDraft={clearDraft} />
          </div>

          {/* Mobile: Compact card grid with drawer popups */}
          {isMobile ? (
            <>
              {/* Compact Overall Progress */}
              <div className="mb-4 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">Progress</span>
                  <span className="text-xs font-bold text-cyan-400">
                    {stepCompletions.filter(c => c === 100).length}/{STEPS.length} done
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                    style={{ width: `${stepCompletions.reduce((a, b) => a + b, 0) / stepCompletions.length}%` }}
                  />
                </div>
              </div>

              {/* Compact Cards Grid */}
              {renderMobileCompact()}

              {/* Submit Button - Fixed at bottom with safe area */}
              <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-sm border-t border-border z-50" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 text-sm uppercase tracking-wide"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Desktop: All sections accordion view */}
              {renderDesktopAccordion()}

              {/* Submit Button */}
              <div className="mt-8 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Ready to submit?</h3>
                    <p className="text-sm text-muted-foreground">
                      {stepCompletions.every(c => c === 100) 
                        ? "All sections complete! You're ready to submit."
                        : `${stepCompletions.filter(c => c === 100).length} of ${STEPS.length} sections complete`
                      }
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </form>
  );
};

export default WebsiteSubmissions;
