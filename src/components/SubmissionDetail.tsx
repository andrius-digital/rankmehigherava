import { useState } from "react";
import { FileText, Copy, Check, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSubmissionPDF } from "@/utils/generateSubmissionPDF";

interface SubmissionDetailProps {
  submission: {
    id: string;
    company_name: string;
    business_email: string;
    created_at: string;
    form_data: any;
  } | null;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const SubmissionDetail = ({ submission, onBack, showBackButton }: SubmissionDetailProps) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  if (!submission) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a submission to view details</p>
        </div>
      </div>
    );
  }

  const formData = submission.form_data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Not provided</span>;
    }
    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;
    }
    if (value === "yes" || value === "no") {
      return <Badge variant={value === "yes" ? "default" : "secondary"}>{value === "yes" ? "Yes" : "No"}</Badge>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">Not provided</span>;
      // Check if it's services array
      if (value[0] && typeof value[0] === "object" && "name" in value[0]) {
        const filledServices = value.filter((s: any) => s.name);
        if (filledServices.length === 0) return <span className="text-muted-foreground italic">Not provided</span>;
        return (
          <div className="space-y-1">
            {filledServices.map((s: any, i: number) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{s.name}</span>
                {s.price && <span className="text-muted-foreground ml-2">({s.price})</span>}
                {s.description && <p className="text-muted-foreground text-xs">{s.description}</p>}
              </div>
            ))}
          </div>
        );
      }
      // Regular array (like file URLs)
      return value.map((v, i) => (
        <div key={i} className="text-sm break-all">{typeof v === "object" ? JSON.stringify(v) : v}</div>
      ));
    }
    if (typeof value === "object") {
      // Handle checkbox objects (like emergencyServices, insuranceHelp)
      const entries = Object.entries(value);
      const selected = entries.filter(([_, v]) => v === true).map(([k]) => k);
      if (selected.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {selected.map((s, i) => (
              <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
        );
      }
      
      // Handle operating hours
      if (value.monday !== undefined) {
        const openDays = Object.entries(value)
          .filter(([_, v]: [string, any]) => v.open)
          .map(([day, v]: [string, any]) => ({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            hours: `${v.openTime} - ${v.closeTime}`
          }));
        if (openDays.length === 0) return <span className="text-muted-foreground italic">Not provided</span>;
        return (
          <div className="space-y-1">
            {openDays.map((d, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{d.day}:</span> {d.hours}
              </div>
            ))}
          </div>
        );
      }
      
      return <span className="text-muted-foreground italic">Not provided</span>;
    }
    return <span className="break-words">{String(value)}</span>;
  };

  const handleDownloadPDF = () => {
    generateSubmissionPDF(submission);
    toast({
      title: "PDF Generated",
      description: "Print dialog opened. Select 'Save as PDF' to download.",
    });
  };

  const handleCopyPrompt = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-website-prompt", {
        body: { formData },
      });

      if (error) throw error;

      if (data?.prompt) {
        await navigator.clipboard.writeText(data.prompt);
        setCopied(true);
        toast({
          title: "Prompt copied!",
          description: "Paste it into your website builder to create the website.",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      toast({
        title: "Failed to generate prompt",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sections = [
    {
      title: "1. Business Info",
      fields: [
        { label: "1.1 Official company name", value: formData.companyName },
        { label: "1.2 Do you own a domain name?", value: formData.ownsDomain },
        { label: "1.3 Domain name", value: formData.domainName },
        { label: "1.4 Business Phone Number", value: formData.businessPhone },
        { label: "1.5 Business email", value: formData.businessEmail },
        { label: "1.6 Email for job requests", value: formData.jobRequestEmail },
      ]
    },
    {
      title: "2. Location & Hours",
      fields: [
        { label: "2.1 Main City", value: formData.mainCity },
        { label: "2.2 Service Areas", value: formData.serviceAreas },
        { label: "2.3 Show address?", value: formData.showAddress },
        { label: "2.4 Street Address", value: formData.streetAddress },
        { label: "2.5 City", value: formData.city },
        { label: "2.6 State/Province", value: formData.stateProvince },
        { label: "2.7 Postal Code", value: formData.postalCode },
        { label: "2.8 Show hours?", value: formData.showHours },
        { label: "2.9 Operating Hours", value: formData.operatingHours },
      ]
    },
    {
      title: "3. Services",
      fields: [
        { label: "3.1 Service Category", value: formData.serviceCategory },
        { label: "3.2 Services", value: formData.services },
        { label: "3.3 Include service page?", value: formData.includeServicePage },
        { label: "3.4 Show pricing?", value: formData.showPricing },
        { label: "3.5 Service page type", value: formData.servicePageType },
        { label: "3.6 Free estimates?", value: formData.freeEstimates },
        { label: "3.7 Customer action", value: formData.customerAction },
        { label: "3.8 Client type", value: formData.clientType },
      ]
    },
    {
      title: "4. Operations",
      fields: [
        { label: "4.1 Emergency services", value: formData.emergencyServices },
        { label: "4.2 Homeowner challenges", value: formData.homeownerChallenges },
        { label: "4.3 Service process", value: formData.serviceProcess },
        { label: "4.4 Service options", value: formData.serviceOptions },
        { label: "4.5 Guarantees", value: formData.guarantees },
        { label: "4.6 What makes your business unique?", value: formData.businessUnique },
      ]
    },
    {
      title: "5. Trust",
      fields: [
        { label: "5.1 Quality & trust factors", value: formData.qualityTrust },
        { label: "5.2 Insurance help", value: formData.insuranceHelp },
        { label: "5.3 Accreditations", value: formData.accreditations },
        { label: "5.4 Insurance elaboration", value: formData.insuranceElaboration },
      ]
    },
    {
      title: "6. Team & Story",
      fields: [
        { label: "6.1 Founder message", value: formData.founderMessage },
        { label: "6.2 Founder photos", value: formData.founderPhotos },
        { label: "6.3 Team members", value: formData.teamMembers },
        { label: "6.4 Team photos", value: formData.teamPhotos },
        { label: "6.5 Community giving", value: formData.communityGiving },
        { label: "6.6 Core values", value: formData.coreValues },
      ]
    },
    {
      title: "7. Branding",
      fields: [
        { label: "7.1 Logo files", value: formData.logoFiles },
        { label: "7.2 Website colors", value: formData.websiteColors },
        { label: "7.3 Has specific font?", value: formData.hasSpecificFont },
        { label: "7.4 Font name", value: formData.fontName },
        { label: "7.5 Has brand book?", value: formData.hasBrandBook },
        { label: "7.6 Brand book link", value: formData.brandBookLink },
      ]
    },
    {
      title: "8. Online Presence",
      fields: [
        { label: "8.1 Has Google Profile?", value: formData.hasGoogleProfile },
        { label: "8.2 Google Profile link", value: formData.googleBusinessProfileLink },
        { label: "8.3 Google reviews", value: formData.googleReviews },
        { label: "8.4 Other reviews link", value: formData.otherReviewsLink },
        { label: "8.5 Yelp link", value: formData.yelpLink },
        { label: "8.6 Instagram link", value: formData.instagramLink },
        { label: "8.7 Facebook link", value: formData.facebookLink },
        { label: "8.8 TikTok link", value: formData.tiktokLink },
        { label: "8.9 Work photos link", value: formData.workPhotosLink },
      ]
    },
    {
      title: "9. Offers",
      fields: [
        { label: "9.1 Has special offers?", value: formData.hasSpecialOffers },
        { label: "9.2 Special offers", value: formData.specialOffersExplanation },
        { label: "9.3 Has financing?", value: formData.hasFinancing },
        { label: "9.4 Financing details", value: formData.financingExplanation },
      ]
    },
    {
      title: "10. Final",
      fields: [
        { label: "10.1 Competitor websites", value: formData.competitorWebsites },
        { label: "10.2 Additional notes", value: formData.additionalNotes },
        { label: "10.3 Work photos", value: formData.workPhotos },
      ]
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 md:p-6">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </Button>
        )}
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground break-all">
              {submission.business_email}
            </h2>
            <p className="text-muted-foreground mt-1">
              <span className="font-medium">Submission Date:</span> {formatDate(submission.created_at)}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleCopyPrompt}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : copied ? "Copied!" : "Copy Prompt"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-8">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                    <span className="text-sm text-muted-foreground">{field.label}</span>
                    <div className="text-sm text-foreground">{formatValue(field.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
