import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Check, RefreshCw, X, AlertCircle, Wand2, Edit3, ChevronDown, ChevronUp, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedLogo {
  image: string;
  prompt: string;
  timestamp: number;
}

interface LogoGeneratorProps {
  companyName: string;
  serviceCategory: string;
  websiteColors: string;
  attemptsUsed: number;
  maxAttempts: number;
  onLogoGenerated: (url: string) => void;
  onAttemptsChange: (attempts: number) => void;
  onCancel: () => void;
}

const STYLE_PRESETS = [
  { label: "Modern & Minimal", description: "clean lines, simple shapes, contemporary feel" },
  { label: "Classic & Professional", description: "timeless design, traditional elements, trustworthy" },
  { label: "Bold & Dynamic", description: "strong shapes, impactful, energetic" },
  { label: "Friendly & Approachable", description: "rounded shapes, warm colors, welcoming" },
  { label: "Tech & Innovative", description: "geometric, futuristic, cutting-edge" },
];

const getIndustrySuggestions = (category: string): string[] => {
  const suggestions: Record<string, string[]> = {
    "Window Cleaning": ["squeegee icon", "sparkling window", "water droplets", "glass reflection"],
    "Pressure Washing": ["water spray", "pressure nozzle", "clean surface", "power wash beam"],
    "Roofing": ["house roof silhouette", "shingles pattern", "home protection shield"],
    "HVAC": ["air flow lines", "temperature gauge", "heating/cooling elements"],
    "Plumbing": ["pipe wrench", "water drop", "flowing water"],
    "Electrical": ["lightning bolt", "power symbol", "electrical circuit"],
    "Landscaping": ["leaf", "tree silhouette", "garden elements"],
    "Painting": ["paint brush", "color swatches", "paint roller"],
    "Cleaning": ["sparkle stars", "broom", "shine effect"],
    "Construction": ["building blocks", "hard hat", "construction crane"],
  };
  
  for (const [key, values] of Object.entries(suggestions)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return values;
    }
  }
  return ["abstract symbol", "professional icon", "industry-relevant imagery"];
};

export const LogoGenerator = ({
  companyName,
  serviceCategory,
  websiteColors,
  attemptsUsed,
  maxAttempts,
  onLogoGenerated,
  onAttemptsChange,
  onCancel,
}: LogoGeneratorProps) => {
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUsedPrompt, setLastUsedPrompt] = useState("");
  const [logoHistory, setLogoHistory] = useState<GeneratedLogo[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const remainingAttempts = maxAttempts - attemptsUsed;
  const industrySuggestions = getIndustrySuggestions(serviceCategory);

  // Build the full prompt based on selections
  const buildPrompt = () => {
    const colors = websiteColors || "professional blue and white";
    const category = serviceCategory || "professional services";
    
    let styleDesc = "";
    if (selectedStyle) {
      const preset = STYLE_PRESETS.find(p => p.label === selectedStyle);
      styleDesc = preset ? preset.description : selectedStyle;
    }
    
    // If user has customized the prompt, use it
    if (customPrompt.trim()) {
      return customPrompt;
    }
    
    return `Create a professional business logo for "${companyName}", a ${category} company. 
Style: ${styleDesc || "clean and modern"}. 
Requirements: Clean, modern, minimal, suitable for web and print. 
Colors: ${colors}. 
The logo should be on a transparent or white background.
No text in the logo unless the company name is short.
Ultra high resolution, professional quality.`;
  };

  // Generate AI suggestion for the prompt
  const generateAISuggestion = () => {
    const colors = websiteColors || "professional blue and white";
    const category = serviceCategory || "professional services";
    const style = selectedStyle ? STYLE_PRESETS.find(p => p.label === selectedStyle)?.description : "clean and modern";
    
    const suggestion = `Create a professional business logo for "${companyName}", a ${category} company.

Style: ${style}.
Icon ideas: ${industrySuggestions.slice(0, 2).join(" or ")}.
Colors: ${colors}.

Requirements:
- Clean, modern, minimal design
- Suitable for web and print
- Transparent or white background
- No text unless company name is very short
- Ultra high resolution, professional quality`;

    setCustomPrompt(suggestion);
    setShowAdvanced(true);
    
    toast({
      title: "AI suggestion generated!",
      description: "You can edit this prompt before generating.",
    });
  };

  const handleGenerate = async () => {
    if (remainingAttempts <= 0) {
      toast({
        title: "No attempts remaining",
        description: "Please upload a logo manually instead.",
        variant: "destructive",
      });
      return;
    }

    if (!companyName) {
      toast({
        title: "Company name required",
        description: "Please enter your company name in Step 1 first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = buildPrompt();
      setLastUsedPrompt(prompt);
      console.log("Generating logo with prompt:", prompt);

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (error) {
        throw error;
      }

      // Extract image from response
      const imageData = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageData) {
        throw new Error("No image generated");
      }

      setGeneratedImage(imageData);
      
      // Add to history
      setLogoHistory(prev => [...prev, {
        image: imageData,
        prompt: prompt,
        timestamp: Date.now(),
      }]);
      
      onAttemptsChange(attemptsUsed + 1);
      
      toast({
        title: "Logo generated!",
        description: `${remainingAttempts - 1} attempts remaining.`,
      });
    } catch (error: any) {
      console.error("Logo generation error:", error);
      
      if (error.message?.includes("429") || error.status === 429) {
        toast({
          title: "Rate limit reached",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        });
      } else if (error.message?.includes("402") || error.status === 402) {
        toast({
          title: "Generation limit reached",
          description: "Please upload a logo manually instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation failed",
          description: "Please try again or upload a logo manually.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = async () => {
    if (!generatedImage) return;

    setIsUploading(true);
    
    try {
      // Convert base64 to blob
      const base64Data = generatedImage.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Upload to storage
      const fileName = `generated-logo-${Date.now()}.png`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("website-assets")
        .upload(filePath, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("website-assets")
        .getPublicUrl(filePath);

      onLogoGenerated(urlData.publicUrl);
      
      toast({
        title: "Logo saved!",
        description: "Your generated logo has been saved.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Failed to save logo",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRegenerate = () => {
    if (remainingAttempts <= 1) {
      const confirm = window.confirm(
        `You only have ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} left. Are you sure you want to regenerate?`
      );
      if (!confirm) return;
    }
    setGeneratedImage(null);
  };

  const handleEditPrompt = () => {
    setCustomPrompt(lastUsedPrompt);
    setShowAdvanced(true);
    setGeneratedImage(null);
  };

  const handleSelectFromHistory = (logo: GeneratedLogo) => {
    setGeneratedImage(logo.image);
    setLastUsedPrompt(logo.prompt);
    setShowHistory(false);
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium">AI Logo Generator</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-2 py-1 rounded-full ${
            remainingAttempts > 3 
              ? "bg-primary/10 text-primary" 
              : remainingAttempts > 0 
                ? "bg-yellow-500/10 text-yellow-600" 
                : "bg-destructive/10 text-destructive"
          }`}>
            {remainingAttempts}/{maxAttempts} attempts left
          </span>
        </div>
      </div>

      {/* Logo History */}
      {logoHistory.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Previously Generated ({logoHistory.length})</span>
            </div>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showHistory && (
            <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {logoHistory.map((logo, index) => (
                <button
                  key={logo.timestamp}
                  type="button"
                  onClick={() => handleSelectFromHistory(logo)}
                  className="relative group rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
                >
                  <img
                    src={logo.image}
                    alt={`Generated logo ${index + 1}`}
                    className="w-full aspect-square object-contain bg-background"
                  />
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">Select</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {remainingAttempts <= 0 && !generatedImage ? (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">No attempts remaining. Please upload a logo manually.</span>
        </div>
      ) : !generatedImage ? (
        <>
          {/* Style Presets */}
          <div>
            <Label className="text-sm font-medium">Choose a style</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSelectedStyle(preset.label)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedStyle === preset.label
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Suggestions */}
          {serviceCategory && (
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                <Wand2 className="w-4 h-4" />
                Suggested icons for {serviceCategory}:
              </div>
              <div className="flex flex-wrap gap-2">
                {industrySuggestions.map((suggestion) => (
                  <span
                    key={suggestion}
                    className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Prompt Editing */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvanced ? "Hide" : "Show"} advanced prompt editing
            </button>
            
            {showAdvanced && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Custom Prompt</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateAISuggestion}
                    className="h-7 text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Generate AI Suggestion
                  </Button>
                </div>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Leave empty to use default prompt based on your selections, or write your own..."
                  rows={6}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will be sent directly to the AI. Be descriptive about colors, style, and any specific elements you want.
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground">
            Company: <span className="font-medium">{companyName || "not set"}</span>
            {websiteColors && <> · Colors: <span className="font-medium">{websiteColors}</span></>}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !companyName}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Logo
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={generatedImage}
                alt="Generated logo"
                className="max-w-[200px] max-h-[200px] rounded-lg border border-border"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleAccept}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Use This Logo
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating || remainingAttempts <= 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleEditPrompt}
              disabled={remainingAttempts <= 0}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Prompt
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default LogoGenerator;
