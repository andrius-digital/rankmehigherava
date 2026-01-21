import { useState } from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { AvaSuggestion } from "./AvaSuggestion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GBPScannerProps {
  value: string;
  onChange: (value: string) => void;
  onLocationFound?: (data: { city?: string; state?: string; serviceAreas?: string }) => void;
}

interface GBPData {
  businessName?: string;
  city?: string;
  state?: string;
  suggestedServiceAreas?: string[];
}

export const GBPScanner = ({ value, onChange, onLocationFound }: GBPScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<GBPData | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!value.trim()) {
      toast({
        title: "No URL provided",
        description: "Please enter your Google Business Profile URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("extract-gbp-info", {
        body: { gbpUrl: value },
      });

      if (error) throw error;

      if (data) {
        setScanResult(data);
      }
    } catch (error) {
      console.error("Failed to scan GBP:", error);
      toast({
        title: "Couldn't scan profile",
        description: "Please try again or enter the information manually.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAcceptLocation = () => {
    if (scanResult && onLocationFound) {
      onLocationFound({
        city: scanResult.city,
        state: scanResult.state,
        serviceAreas: scanResult.suggestedServiceAreas?.join(", "),
      });
      toast({
        title: "Location info applied!",
        description: "Ava has filled in your location details.",
      });
    }
    setScanResult(null);
  };

  const handleDismiss = () => {
    setScanResult(null);
  };

  const formatSuggestion = () => {
    if (!scanResult) return "";
    
    let text = "";
    if (scanResult.businessName) {
      text += `📍 Business: ${scanResult.businessName}\n`;
    }
    if (scanResult.city && scanResult.state) {
      text += `🏙️ Location: ${scanResult.city}, ${scanResult.state}\n`;
    }
    if (scanResult.suggestedServiceAreas?.length) {
      text += `🗺️ Suggested Service Areas:\n${scanResult.suggestedServiceAreas.join(", ")}`;
    }
    return text;
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        Google Business Profile Link
      </Label>
      
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://maps.google.com/..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleScan}
          disabled={isScanning || !value.trim()}
          className="gap-2 shrink-0"
        >
          {isScanning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan Profile
            </>
          )}
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Enter your Google Business Profile URL and let Ava help fill in your location info.
      </p>

      {/* Loading State */}
      {isScanning && (
        <AvaSuggestion 
          suggestion="" 
          onAccept={() => {}} 
          onDismiss={() => {}} 
          isLoading 
        />
      )}

      {/* Scan Result */}
      {scanResult && !isScanning && (
        <AvaSuggestion
          message="Based on your profile, Ava suggests:"
          suggestion={formatSuggestion()}
          onAccept={handleAcceptLocation}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

export default GBPScanner;
