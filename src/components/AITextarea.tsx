import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { AvaSuggestion } from "./AvaSuggestion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AITextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  fieldContext?: string;
}

export const AITextarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  fieldContext = "general text field",
}: AITextareaProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImprove = async () => {
    if (!value.trim()) {
      toast({
        title: "Nothing to improve",
        description: "Please write something first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    try {
      const { data, error } = await supabase.functions.invoke("improve-text", {
        body: { text: value, context: fieldContext },
      });

      if (error) throw error;

      if (data?.improvedText) {
        setSuggestion(data.improvedText);
      }
    } catch (error) {
      console.error("Failed to improve text:", error);
      toast({
        title: "Couldn't improve text",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (suggestion) {
      onChange(suggestion);
      setSuggestion(null);
    }
  };

  const handleEdit = () => {
    if (suggestion) {
      onChange(suggestion);
      setSuggestion(null);
    }
  };

  const handleDismiss = () => {
    setSuggestion(null);
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
      
      {/* Improve Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImprove}
          disabled={isLoading || !value.trim()}
          className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? "Ava is improving..." : "Ask Ava to improve"}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && <AvaSuggestion suggestion="" onAccept={() => {}} onDismiss={() => {}} isLoading />}

      {/* Suggestion */}
      {suggestion && !isLoading && (
        <AvaSuggestion
          message="Ava polished this up for you:"
          suggestion={suggestion}
          onAccept={handleAccept}
          onEdit={handleEdit}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

export default AITextarea;
