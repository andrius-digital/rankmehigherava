import { Sparkles, Check, X, Pencil } from "lucide-react";
import { Button } from "./ui/button";

interface AvaSuggestionProps {
  message?: string;
  suggestion: string;
  onAccept: () => void;
  onEdit?: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export const AvaSuggestion = ({
  message = "Ava thinks this could work well here:",
  suggestion,
  onAccept,
  onEdit,
  onDismiss,
  isLoading = false,
}: AvaSuggestionProps) => {
  if (isLoading) {
    return (
      <div className="mt-3 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse" />
            <Sparkles className="w-5 h-5 text-primary relative" />
          </div>
          <span className="font-semibold text-primary text-sm">Ava is thinking...</span>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-primary/10 rounded w-3/4" />
          <div className="h-4 bg-primary/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 shadow-lg shadow-primary/5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/40 rounded-full blur-md" />
          <Sparkles className="w-5 h-5 text-primary relative animate-pulse" />
        </div>
        <span className="font-semibold text-primary text-sm">Ava's Suggestion</span>
      </div>

      {/* Message */}
      <p className="text-muted-foreground text-sm mb-3 italic">{message}</p>

      {/* Suggestion Preview */}
      <div className="bg-background/50 border border-border rounded-md p-3 mb-4">
        <p className="text-foreground text-sm whitespace-pre-wrap">{suggestion}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          onClick={onAccept}
          className="gap-1.5"
        >
          <Check className="w-4 h-4" />
          Use This
        </Button>
        {onEdit && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="gap-1.5"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
          Dismiss
        </Button>
      </div>
    </div>
  );
};

export default AvaSuggestion;
