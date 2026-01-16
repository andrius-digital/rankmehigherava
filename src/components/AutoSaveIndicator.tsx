import { Cloud, CloudOff, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface AutoSaveIndicatorProps {
  lastSaved: string | null;
  onClearDraft: () => void;
}

export function AutoSaveIndicator({ lastSaved, onClearDraft }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {lastSaved ? (
        <>
          <div className="flex items-center gap-1.5">
            {showSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600">Saved</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span>Auto-saved at {formatTime(lastSaved)}</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClearDraft}
            className="text-destructive hover:underline"
          >
            Clear draft
          </button>
        </>
      ) : (
        <div className="flex items-center gap-1.5">
          <CloudOff className="w-3.5 h-3.5" />
          <span>Not saved yet</span>
        </div>
      )}
    </div>
  );
}
