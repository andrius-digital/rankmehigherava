import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
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
import { Building2, MapPin, Target, Settings, Shield, Users, Palette, Globe, DollarSign, Sparkles, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import LogoGenerator from "@/components/LogoGenerator";
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
  { id: 1, title: "Business Info", icon: <Building2 className="w-4 h-4" /> },
  { id: 2, title: "Location & Hours", icon: <MapPin className="w-4 h-4" /> },
  { id: 3, title: "Services", icon: <Target className="w-4 h-4" /> },
  { id: 4, title: "Operations", icon: <Settings className="w-4 h-4" /> },
  { id: 5, title: "Trust", icon: <Shield className="w-4 h-4" /> },
  { id: 6, title: "Team & Story", icon: <Users className="w-4 h-4" /> },
  { id: 7, title: "Branding", icon: <Palette className="w-4 h-4" /> },
  { id: 8, title: "Online Presence", icon: <Globe className="w-4 h-4" /> },
  { id: 9, title: "Offers", icon: <DollarSign className="w-4 h-4" /> },
  { id: 10, title: "Final", icon: <Sparkles className="w-4 h-4" /> },
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
  }, [formData, hasGoogleProfile, hasSpecialOffers, hasFinancing, emergencyServices, insuranceHelp, hasSpecificFont, hasBrandBook, hasLogo, logoGenerationAttempts, operatingHours, services, pages, logoFiles, founderPhotos, teamPhotos, workPhotos, currentStep]);

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

  const stepCompletions = useMemo(() => calculateAllStepCompletions(formState), [formState]);

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

      // Create a client card automatically with the company name
      const { error: clientError } = await supabase
        .from("clients")
        .insert({
          name: formData.companyName,
          company_name: formData.companyName,
          email: formData.businessEmail,
          phone: formData.businessPhone,
          city: formData.mainCity,
          state: formData.stateProvince,
          address: formData.streetAddress,
          service_type: formData.serviceCategory,
          notes: `Onboarded via website submission form. Service areas: ${formData.serviceAreas}`,
        });

      if (clientError) {
        console.error("Client creation error:", clientError);
        // Don't throw - submission was successful, client creation is secondary
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

  // Step 1: Basic Business Info
  const renderStep1 = () => (
    <MobileSection title="Basic Business Info" icon={Building2}>
      <FormField label="1.1 Official company name" required hint="Provide your full registered company name.">
        <Input
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          placeholder="Enter company name"
        />
      </FormField>

      <FormField label="1.2 Do you own a domain name?" required>
        <Select
          value={formData.ownsDomain}
          onValueChange={(value) => setFormData({ ...formData, ownsDomain: value })}
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
        <FormField label="1.3 Domain name" required hint="Format: www.domainname.com">
          <Input
            className={`${isMobile ? 'h-11' : ''} max-w-md`}
            value={formData.domainName}
            onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
            placeholder="www.domainname.com"
          />
        </FormField>
      )}

      <FormField label="1.4 Business Phone" required hint="Enter a valid phone number">
        <Input
          type="tel"
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.businessPhone}
          onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
          placeholder="(000) 000-0000"
        />
      </FormField>

      <FormField label="1.5 Business Email" required hint="Enter a valid business email">
        <Input
          type="email"
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.businessEmail}
          onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
          placeholder="example@example.com"
        />
      </FormField>

      <FormField label="1.6 Email for job requests" required hint="Where website form messages go">
        <Input
          type="email"
          className={`${isMobile ? 'h-11' : ''} max-w-md`}
          value={formData.jobRequestEmail}
          onChange={(e) => setFormData({ ...formData, jobRequestEmail: e.target.value })}
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
          Location & Hours
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
            onChange={(e) => setFormData({ ...formData, mainCity: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
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
            onValueChange={(value) => setFormData({ ...formData, showAddress: value })}
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
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                />
                <p className="text-sm text-muted-foreground mt-1">Street Address</p>
              </div>
              <div>
                <Input
                  value={formData.streetAddress2}
                  onChange={(e) => setFormData({ ...formData, streetAddress2: e.target.value })}
                />
                <p className="text-sm text-muted-foreground mt-1">Street Address Line 2</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">City</p>
                </div>
                <div>
                  <Input
                    value={formData.stateProvince}
                    onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">State / Province</p>
                </div>
              </div>
              <div>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
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
            onValueChange={(value) => setFormData({ ...formData, showHours: value })}
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
          Focus & Services
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
            onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
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
            onValueChange={(value) => setFormData({ ...formData, includeServicePage: value })}
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
            onValueChange={(value) => setFormData({ ...formData, showPricing: value })}
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
            onValueChange={(value) => setFormData({ ...formData, servicePageType: value })}
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
            onValueChange={(value) => setFormData({ ...formData, freeEstimates: value })}
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
            onValueChange={(value) => setFormData({ ...formData, customerAction: value })}
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
            onValueChange={(value) => setFormData({ ...formData, clientType: value })}
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
            onChange={(e) => setFormData({ ...formData, serviceJobDuration: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, serviceAreaPages: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, homeownerChallenges: e.target.value })}
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
          Process & Operations
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
            onChange={(e) => setFormData({ ...formData, serviceProcess: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, serviceOptions: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, guarantees: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, businessUnique: e.target.value })}
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
          Trust & Credibility
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
            onChange={(e) => setFormData({ ...formData, qualityTrust: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, accreditations: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, insuranceElaboration: e.target.value })}
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
          Team & Story
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
            onChange={(e) => setFormData({ ...formData, founderMessage: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
            placeholder="John Smith – Project Manager, Jane Doe – Lead Technician..."
          />
        </div>

        <FileUpload
          label="6.3 Founder / owner photos"
          required
          folder="founder-photos"
          description="Upload high-quality, professional photos of yourself."
          onFilesChange={setFounderPhotos}
          existingUrls={founderPhotos}
        />

        <FileUpload
          label="6.4 Team photos"
          folder="team-photos"
          description="Upload photos of your team — group shots or individual portraits."
          onFilesChange={setTeamPhotos}
          existingUrls={teamPhotos}
        />

        <div>
          <Label className="text-base font-medium">
            6.5 Do you give back to the community?
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.communityGiving}
            onChange={(e) => setFormData({ ...formData, communityGiving: e.target.value })}
            placeholder="Sponsorships, donations, volunteer work..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            6.6 Company core values
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.coreValues}
            onChange={(e) => setFormData({ ...formData, coreValues: e.target.value })}
            placeholder="List 3-4 values that define your company..."
          />
        </div>
      </div>
    </section>
  );

  // Step 7: Branding & Visuals
  const renderStep7 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Branding & Visuals
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            7.1 Do you have a company logo? <span className="text-destructive">*</span>
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
          <div className="text-sm text-muted-foreground">
            ✓ Logo uploaded successfully
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            7.2 Website colors
          </Label>
          <Textarea
            className="mt-2"
            rows={3}
            value={formData.websiteColors}
            onChange={(e) => setFormData({ ...formData, websiteColors: e.target.value })}
            placeholder="Skip if you'd like us to match your logo colors"
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            7.3 Do you have a specific font in mind?
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
            <Label className="text-base font-medium">7.4 Font name</Label>
            <Input
              className="mt-2 max-w-md"
              value={formData.fontName}
              onChange={(e) => setFormData({ ...formData, fontName: e.target.value })}
            />
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            7.5 Do you have a brand book?
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
              7.6 Brand book link (Google Drive or other)
            </Label>
            <Textarea
              className="mt-2"
              rows={2}
              value={formData.brandBookLink}
              onChange={(e) => setFormData({ ...formData, brandBookLink: e.target.value })}
            />
          </div>
        )}
      </div>
    </section>
  );

  // Step 8: Online Presence
  const renderStep8 = () => {
    const handleGBPLocationFound = (data: { city?: string; state?: string; serviceAreas?: string }) => {
      setFormData(prev => ({
        ...prev,
        ...(data.city && !prev.mainCity && { mainCity: data.city }),
        ...(data.state && !prev.stateProvince && { stateProvince: data.state }),
        ...(data.serviceAreas && !prev.serviceAreas && { serviceAreas: data.serviceAreas }),
      }));
    };

    return (
      <section>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-primary" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Online Presence
          </h2>
        </div>
        <div className="border-t border-border pt-6 space-y-6">
          <div>
            <Label className="text-base font-medium">
              8.1 Do you have a Google Business Profile?
            </Label>
            <div className="mt-3 space-y-3">
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
                <label className="text-sm">No</label>
              </div>
            </div>
          </div>

          {hasGoogleProfile === "yes" && (
            <GBPScanner
              value={formData.googleBusinessProfileLink}
              onChange={(value) => setFormData({ ...formData, googleBusinessProfileLink: value })}
              onLocationFound={handleGBPLocationFound}
            />
          )}

          <div>
            <Label className="text-base font-medium">
              8.2 How many Google reviews do you have?
            </Label>
            <Input
              className="mt-2 max-w-md"
              value={formData.googleReviews}
              onChange={(e) => setFormData({ ...formData, googleReviews: e.target.value })}
              placeholder="e.g., 50+ reviews, 4.8 stars"
            />
          </div>

          <div>
            <Label className="text-base font-medium">
              8.3 Links to reviews on other platforms
            </Label>
            <Textarea
              className="mt-2"
              rows={3}
              value={formData.otherReviewsLink}
              onChange={(e) => setFormData({ ...formData, otherReviewsLink: e.target.value })}
              placeholder="Yelp, HomeAdvisor, Angi, etc."
            />
          </div>

          {/* Social Media Links */}
          <SocialMediaFields
            yelpLink={formData.yelpLink}
            instagramLink={formData.instagramLink}
            facebookLink={formData.facebookLink}
            tiktokLink={formData.tiktokLink}
            onYelpChange={(value) => setFormData({ ...formData, yelpLink: value })}
            onInstagramChange={(value) => setFormData({ ...formData, instagramLink: value })}
            onFacebookChange={(value) => setFormData({ ...formData, facebookLink: value })}
            onTiktokChange={(value) => setFormData({ ...formData, tiktokLink: value })}
          />

          <FileUpload
            label="8.4 Work photos / Project gallery"
            folder="work-photos"
            description="Upload high-quality photos of your completed work."
            onFilesChange={setWorkPhotos}
            existingUrls={workPhotos}
          />

          <div>
            <Label className="text-base font-medium">
              8.5 Or provide a link to work photos
            </Label>
            <Input
              className="mt-2 max-w-md"
              value={formData.workPhotosLink}
              onChange={(e) => setFormData({ ...formData, workPhotosLink: e.target.value })}
              placeholder="Google Drive, Dropbox, etc."
            />
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
          Offers, Payments & Financing
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
              onChange={(e) => setFormData({ ...formData, specialOffersExplanation: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, financingExplanation: e.target.value })}
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
          Content & Final Notes
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
            onChange={(e) => setFormData({ ...formData, competitorWebsites: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
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

      <Navbar />

      <main className={`flex-1 ${isMobile ? 'pt-20 pb-24' : 'pt-24 pb-16'}`}>
        <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'} max-w-4xl`}>
          {/* Header - Compact on mobile */}
          <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
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
