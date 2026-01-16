import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface FormProgressBarProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  stepCompletions?: number[];
}

export function FormProgressBar({ steps, currentStep, onStepClick, stepCompletions = [] }: FormProgressBarProps) {
  // Calculate overall completion
  const overallCompletion = stepCompletions.length > 0 
    ? Math.round(stepCompletions.reduce((a, b) => a + b, 0) / stepCompletions.length)
    : Math.round((currentStep / steps.length) * 100);

  return (
    <div className="w-full mb-8">
      {/* Progress percentage */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium text-foreground">
            {overallCompletion}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${overallCompletion}%` }}
          />
        </div>
      </div>

      {/* Step indicators - horizontal scrollable on mobile */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
        <div className="flex gap-2 min-w-max">
          {steps.map((step, index) => {
            const stepCompletion = stepCompletions[index] ?? 0;
            const isComplete = stepCompletion === 100;
            const isCurrent = index + 1 === currentStep;
            const hasProgress = stepCompletion > 0 && stepCompletion < 100;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick(index + 1)}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isComplete && "bg-primary/15 text-primary border border-primary/30",
                  isCurrent && !isComplete && "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                  !isComplete && !isCurrent && "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {/* Step number or check icon */}
                <span className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && !isComplete && "bg-primary-foreground/20 text-primary-foreground",
                  !isComplete && !isCurrent && "bg-muted-foreground/20 text-muted-foreground"
                )}>
                  {isComplete ? <Check className="w-3 h-3" /> : step.id}
                </span>
                
                {/* Step title - hidden on small screens */}
                <span className="hidden sm:inline whitespace-nowrap">{step.title}</span>
                
                {/* Completion percentage badge (only show if has progress but not complete) */}
                {hasProgress && !isCurrent && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    {stepCompletion}%
                  </span>
                )}
                
                {/* Current step completion badge */}
                {isCurrent && stepCompletion < 100 && stepCompletions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold rounded bg-primary-foreground/20 text-primary-foreground">
                    {stepCompletion}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
