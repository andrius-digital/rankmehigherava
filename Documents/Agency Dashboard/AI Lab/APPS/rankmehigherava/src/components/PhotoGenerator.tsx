import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Check, RefreshCw, X, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PhotoType = "founder" | "team" | "work";

interface PhotoGeneratorProps {
  type: PhotoType;
  companyName: string;
  serviceCategory: string;
  mainCity: string;
  founderMessage?: string;
  teamMembers?: string;
  logoUrl?: string;
  attemptsUsed: number;
  maxAttempts: number;
  onPhotoGenerated: (url: string) => void;
  onAttemptsChange: (attempts: number) => void;
  onCancel: () => void;
}

const PHOTO_CONFIG: Record<PhotoType, { title: string; defaultPrompt: (props: Partial<PhotoGeneratorProps>) => string }> = {
  founder: {
    title: "Founder/Owner Photo",
    defaultPrompt: (props) => `Professional business portrait photo of a confident business owner/founder.
Setting: Modern office or professional ${props.serviceCategory || "business"} workspace in ${props.mainCity || "a professional setting"}.
Style: Corporate headshot, warm natural lighting, professional attire.
Company: ${props.companyName || "Business"} - ${props.serviceCategory || "professional services"} business.
${props.logoUrl ? "The person should be wearing a branded polo shirt or have company branding visible in the background." : ""}
Requirements: High-quality, photorealistic, professional business portrait. The person should look approachable and trustworthy.`,
  },
  team: {
    title: "Team Photo",
    defaultPrompt: (props) => `Professional team photo of ${props.serviceCategory || "business"} technicians/workers.
Setting: ${props.serviceCategory || "Business"} work environment in ${props.mainCity || "a professional setting"}.
Style: Group photo, friendly and professional, wearing work uniforms.
Company: ${props.companyName || "Business"} - ${props.serviceCategory || "professional services"} business.
${props.logoUrl ? "Team members wearing branded uniforms with company logo on shirts." : "Team wearing professional work attire."}
${props.teamMembers ? `Team includes: ${props.teamMembers}` : "Show 3-4 diverse team members."}
Requirements: High-quality, photorealistic, professional team portrait showing expertise and friendliness.`,
  },
  work: {
    title: "Work/Project Photo",
    defaultPrompt: (props) => `Professional photo of ${props.serviceCategory || "professional"} work in progress.
Setting: Active job site in ${props.mainCity || "residential/commercial setting"}.
Style: Action shot showing skilled work, professional quality.
Company: ${props.companyName || "Business"} performing ${props.serviceCategory || "professional"} services.
${props.logoUrl ? "Work vehicle or equipment with company branding visible." : ""}
Requirements: High-quality, photorealistic photo showing professional craftsmanship and attention to detail.`,
  },
};

export const PhotoGenerator = ({
  type,
  companyName,
  serviceCategory,
  mainCity,
  founderMessage,
  teamMembers,
  logoUrl,
  attemptsUsed,
  maxAttempts,
  onPhotoGenerated,
  onAttemptsChange,
  onCancel,
}: PhotoGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Popup state
  const [showPromptPopup, setShowPromptPopup] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [isPopupGenerating, setIsPopupGenerating] = useState(false);

  const remainingAttempts = maxAttempts - attemptsUsed;
  const config = PHOTO_CONFIG[type];

  const getDefaultPrompt = () => {
    return config.defaultPrompt({
      companyName,
      serviceCategory,
      mainCity,
      founderMessage,
      teamMembers,
      logoUrl,
    });
  };

  const generatePhoto = async (prompt: string, isPopup = false) => {
    if (remainingAttempts <= 0) {
      toast({
        title: "No attempts remaining",
        description: "Please upload photos manually instead.",
        variant: "destructive",
      });
      return null;
    }

    if (!companyName) {
      toast({
        title: "Company name required",
        description: "Please enter your company name first.",
        variant: "destructive",
      });
      return null;
    }

    if (isPopup) {
      setIsPopupGenerating(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (error) throw error;

      const imageData = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageData) throw new Error("No image generated");

      onAttemptsChange(attemptsUsed + 1);

      toast({
        title: "Photo generated!",
        description: `${remainingAttempts - 1} attempts remaining.`,
      });

      return imageData;
    } catch (error: any) {
      console.error("Photo generation error:", error);
      toast({
        title: "Generation failed",
        description: "Please try again or upload photos manually.",
        variant: "destructive",
      });
      return null;
    } finally {
      if (isPopup) {
        setIsPopupGenerating(false);
      } else {
        setIsGenerating(false);
      }
    }
  };

  const handleGenerate = async () => {
    const image = await generatePhoto(getDefaultPrompt());
    if (image) {
      setGeneratedImage(image);
    }
  };

  const handleAccept = (imageToSave?: string) => {
    const image = imageToSave || generatedImage;
    if (!image) return;
    setIsSaving(true);
    onPhotoGenerated(image);
    toast({
      title: "Photo saved!",
      description: `Your ${config.title.toLowerCase()} has been saved.`,
    });
    setIsSaving(false);
    setShowPromptPopup(false);
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
  };

  // Popup functions
  const openPromptPopup = () => {
    setCustomPrompt(getDefaultPrompt());
    setPopupImage(null);
    setShowPromptPopup(true);
  };

  const handlePopupGenerate = async () => {
    const image = await generatePhoto(customPrompt, true);
    if (image) {
      setPopupImage(image);
    }
  };

  const handlePopupSave = () => {
    if (popupImage) {
      handleAccept(popupImage);
    }
  };

  return (
    <>
      <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm sm:text-base">AI {config.title} Generator</span>
          </div>
          <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
            remainingAttempts > 3 
              ? "bg-primary/10 text-primary" 
              : remainingAttempts > 0 
                ? "bg-yellow-500/10 text-yellow-600" 
                : "bg-destructive/10 text-destructive"
          }`}>
            {remainingAttempts}/{maxAttempts} left
          </span>
        </div>

        {logoUrl && (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
            <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain bg-zinc-900 rounded" />
            <span className="text-xs text-primary">Logo will be incorporated into generated photos</span>
          </div>
        )}

        {remainingAttempts <= 0 && !generatedImage ? (
          <div className="text-sm text-destructive">
            No attempts remaining. Please upload photos manually.
          </div>
        ) : !generatedImage ? (
          <>
            <p className="text-xs text-muted-foreground">
              {companyName} • {serviceCategory} {mainCity && `• ${mainCity}`}
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !companyName}
                className="flex-1 min-w-[140px]"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <img
                src={generatedImage}
                alt={`Generated ${config.title}`}
                className="max-w-full max-h-[250px] sm:max-h-[300px] rounded-lg border border-border"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => handleAccept()}
                disabled={isSaving}
                className="flex-1 min-w-[100px]"
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Use This
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRegenerate}
                disabled={remainingAttempts <= 0}
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={openPromptPopup}
                disabled={remainingAttempts <= 0}
                size="sm"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                size="sm"
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Prompt Popup - Optimized for mobile and desktop */}
      {showPromptPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPromptPopup(false)}
          />
          
          {/* Popup */}
          <div className="relative bg-background border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0">
              <span className="font-medium">Edit Prompt</span>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  remainingAttempts > 3 
                    ? "bg-primary/10 text-primary" 
                    : "bg-yellow-500/10 text-yellow-600"
                }`}>
                  {remainingAttempts} left
                </span>
                <button 
                  onClick={() => setShowPromptPopup(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Prompt textarea */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Describe the photo you want:</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the photo you want..."
                  rows={5}
                  className="text-sm resize-none"
                />
              </div>

              {/* Image preview area */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Preview:</label>
                <div className="relative min-h-[180px] sm:min-h-[240px] rounded-xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center overflow-hidden">
                  {isPopupGenerating ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Generating...</span>
                    </div>
                  ) : popupImage ? (
                    <img
                      src={popupImage}
                      alt="Generated preview"
                      className="w-full h-full object-contain max-h-[240px] sm:max-h-[300px]"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                      <Sparkles className="w-8 h-8 opacity-50" />
                      <span className="text-sm">Image will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer actions - sticky */}
            <div className="p-4 border-t border-border bg-background shrink-0">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePopupGenerate}
                  disabled={isPopupGenerating || remainingAttempts <= 0}
                  className="flex-1 h-11"
                >
                  {isPopupGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Generate
                </Button>
                {popupImage && (
                  <Button
                    type="button"
                    onClick={handlePopupSave}
                    className="flex-1 h-11"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Photo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGenerator;
