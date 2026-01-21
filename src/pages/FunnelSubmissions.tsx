import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Target, 
  Palette,
  Send,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import LogoGenerator from "@/components/LogoGenerator";

const STORAGE_KEY = "funnel_submission_draft";

interface FunnelFormData {
  // Business Info
  companyName: string;
  businessEmail: string;
  businessPhone: string;
  // Funnel Details
  funnelGoal: string;
  targetAudience: string;
  mainOffer: string;
  // Domain Info
  dummyDomain: string;
  liveDomain: string;
  // Branding
  websiteColors: string;
  additionalNotes: string;
}

const initialFormData: FunnelFormData = {
  companyName: "",
  businessEmail: "",
  businessPhone: "",
  funnelGoal: "",
  targetAudience: "",
  mainOffer: "",
  dummyDomain: "",
  liveDomain: "",
  websiteColors: "",
  additionalNotes: "",
};

const FunnelSubmissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FunnelFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Logo state
  const [hasLogo, setHasLogo] = useState<string>("");
  const [logoFiles, setLogoFiles] = useState<string[]>([]);
  const [logoGenerationAttempts, setLogoGenerationAttempts] = useState(0);

  const totalSteps = 3;

  // Load saved draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.hasLogo) setHasLogo(parsed.hasLogo);
        if (parsed.logoFiles) setLogoFiles(parsed.logoFiles);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      } catch (e) {
        console.error("Error loading saved draft:", e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const saveData = {
      formData,
      hasLogo,
      logoFiles,
      currentStep,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, [formData, hasLogo, logoFiles, currentStep]);

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.businessEmail) {
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
        // Business Info
        company_name: formData.companyName,
        business_email: formData.businessEmail,
        business_phone: formData.businessPhone,
        // Funnel Details
        funnel_goal: formData.funnelGoal,
        target_audience: formData.targetAudience,
        main_offer: formData.mainOffer,
        // Domain Info
        dummy_domain: formData.dummyDomain,
        live_domain: formData.liveDomain,
        // Branding
        has_logo: hasLogo === "yes" || logoFiles.length > 0,
        logo_files: logoFiles,
        website_colors: formData.websiteColors,
        additional_notes: formData.additionalNotes,
        // Meta
        submission_type: "funnel",
        submitted_at: new Date().toISOString(),
      };

      // Insert into website_submissions table (only use columns that exist)
      const { data: submission, error: submissionError } = await supabase
        .from("website_submissions")
        .insert({
          company_name: formData.companyName,
          business_email: formData.businessEmail,
          form_data: formSubmissionData,
        })
        .select()
        .single();

      if (submissionError) {
        throw new Error(`Database error: ${submissionError.message}`);
      }

      // Explicitly include logo in notes (matching WebsiteSubmissions pattern)
      const notesWithLogo = {
        ...formSubmissionData,
        logo_files: logoFiles, // Ensure logo URLs are stored in notes JSON
      };

      // Create client record (no website_url for funnel clients)
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: formData.companyName,
          company_name: formData.companyName,
          email: formData.businessEmail,
          phone: formData.businessPhone,
          brand_voice: "Funnel Client",
          target_audience: formData.targetAudience || "Not specified",
          status: "PENDING",
          notes: JSON.stringify(notesWithLogo), // Logo stored in notes JSON
        })
        .select()
        .single();

      if (clientError) {
        console.error("Client creation error:", clientError);
      } else if (newClient) {
        console.log("Funnel client created successfully:", newClient.id);
      }

      // Clear saved draft
      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: "Submission successful!",
        description: "Your funnel onboarding form has been submitted.",
      });

      navigate("/funnel-submission-confirmation", {
        state: {
          companyName: formData.companyName,
          businessEmail: formData.businessEmail,
          businessPhone: formData.businessPhone,
          funnelGoal: formData.funnelGoal,
          mainOffer: formData.mainOffer,
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step 1: Business Info
  const renderStep1 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          1. Business Info
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            className="mt-2"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Your company name"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">
              Business Email <span className="text-destructive">*</span>
            </Label>
            <Input
              className="mt-2"
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              placeholder="email@company.com"
            />
          </div>
          <div>
            <Label className="text-base font-medium">Business Phone</Label>
            <Input
              className="mt-2"
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>
    </section>
  );

  // Step 2: Funnel Details
  const renderStep2 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Target className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          2. Funnel Details
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            What is the goal of this funnel? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="mt-2"
            rows={3}
            value={formData.funnelGoal}
            onChange={(e) => setFormData({ ...formData, funnelGoal: e.target.value })}
            placeholder="e.g., Generate leads, sell a product, book appointments..."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            Who is your target audience?
          </Label>
          <Textarea
            className="mt-2"
            rows={3}
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Homeowners aged 35-55, small business owners, etc."
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            What is your main offer?
          </Label>
          <Textarea
            className="mt-2"
            rows={3}
            value={formData.mainOffer}
            onChange={(e) => setFormData({ ...formData, mainOffer: e.target.value })}
            placeholder="e.g., Free consultation, discount code, ebook download..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">
              Dummy/Staging Domain
            </Label>
            <Input
              className="mt-2"
              value={formData.dummyDomain}
              onChange={(e) => setFormData({ ...formData, dummyDomain: e.target.value })}
              placeholder="e.g., clientfunnel.rankmehigher.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The temporary domain for testing/development
            </p>
          </div>
          <div>
            <Label className="text-base font-medium">
              Live Domain
            </Label>
            <Input
              className="mt-2"
              value={formData.liveDomain}
              onChange={(e) => setFormData({ ...formData, liveDomain: e.target.value })}
              placeholder="e.g., funnel.clientdomain.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The final production domain (if different)
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  // Step 3: Branding & Submit
  const renderStep3 = () => (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-primary" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          3. Branding & Submit
        </h2>
      </div>
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <Label className="text-base font-medium">
            Do you have a company logo?
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
              <label className="text-sm">No, generate one for me</label>
            </div>
          </div>
        </div>

        {hasLogo === "yes" && (
          <FileUpload
            label="Upload your logo"
            folder="funnel-logos"
            description="Upload a transparent/no background logo if possible."
            onFilesChange={setLogoFiles}
            existingUrls={logoFiles}
          />
        )}

        {hasLogo === "no" && (
          <LogoGenerator
            companyName={formData.companyName}
            serviceCategory="Funnel"
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

        <div>
          <Label className="text-base font-medium">
            Brand Colors (if any)
          </Label>
          <Input
            className="mt-2"
            value={formData.websiteColors}
            onChange={(e) => setFormData({ ...formData, websiteColors: e.target.value })}
            placeholder="e.g., Blue #3B82F6, White #FFFFFF"
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            Additional Notes
          </Label>
          <Textarea
            className="mt-2"
            rows={4}
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            placeholder="Any other information we should know..."
          />
        </div>
      </div>
    </section>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Funnel Onboarding | Rank Me Higher</title>
        <meta name="description" content="Submit your funnel project details" />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Funnel Onboarding
            </h1>
            <p className="text-muted-foreground">
              Tell us about your funnel project
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-16 rounded-full transition-colors ${
                  i + 1 <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FunnelSubmissions;
