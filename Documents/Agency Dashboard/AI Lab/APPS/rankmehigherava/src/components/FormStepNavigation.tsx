import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";

interface FormStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
}

export function FormStepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isSubmitting,
  isLastStep,
}: FormStepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-8 border-t border-border mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>

      {isLastStep ? (
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Form
            </>
          )}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} className="gap-2">
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
