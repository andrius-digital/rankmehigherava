import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type SectionColor = 'cyan' | 'emerald' | 'purple' | 'blue' | 'orange' | 'amber';

interface ExpandableSectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  color: SectionColor;
  metric?: {
    value: string | number;
    suffix?: string;
  };
  badge?: {
    label: string;
    variant?: 'success' | 'warning' | 'default';
  };
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

const colorConfig: Record<SectionColor, {
  border: string;
  borderHover: string;
  borderActive: string;
  bg: string;
  text: string;
  iconBg: string;
  iconBorder: string;
  contentBorder: string;
  contentBg: string;
}> = {
  cyan: {
    border: 'border-cyan-500/20',
    borderHover: 'hover:border-cyan-500/40',
    borderActive: 'data-[state=open]:border-cyan-500/50',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    iconBorder: 'border-cyan-500/30',
    contentBorder: 'border-cyan-500/20',
    contentBg: 'bg-cyan-500/5',
  },
  emerald: {
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/40',
    borderActive: 'data-[state=open]:border-emerald-500/50',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    iconBorder: 'border-emerald-500/30',
    contentBorder: 'border-emerald-500/20',
    contentBg: 'bg-emerald-500/5',
  },
  purple: {
    border: 'border-purple-500/20',
    borderHover: 'hover:border-purple-500/40',
    borderActive: 'data-[state=open]:border-purple-500/50',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    iconBorder: 'border-purple-500/30',
    contentBorder: 'border-purple-500/20',
    contentBg: 'bg-purple-500/5',
  },
  blue: {
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/40',
    borderActive: 'data-[state=open]:border-blue-500/50',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/30',
    contentBorder: 'border-blue-500/20',
    contentBg: 'bg-blue-500/5',
  },
  orange: {
    border: 'border-orange-500/20',
    borderHover: 'hover:border-orange-500/40',
    borderActive: 'data-[state=open]:border-orange-500/50',
    bg: 'bg-orange-500/5',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    iconBorder: 'border-orange-500/30',
    contentBorder: 'border-orange-500/20',
    contentBg: 'bg-orange-500/5',
  },
  amber: {
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/40',
    borderActive: 'data-[state=open]:border-amber-500/50',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/30',
    contentBorder: 'border-amber-500/20',
    contentBg: 'bg-amber-500/5',
  },
};

const ExpandableSection = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  ExpandableSectionProps
>(({ id, title, icon: Icon, color, metric, badge, children, className, headerAction }, ref) => {
  const colors = colorConfig[color];

  return (
    <AccordionPrimitive.Item
      ref={ref}
      value={id}
      className={cn("border-0 rounded-xl overflow-hidden", className)}
    >
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            "flex flex-1 flex-col w-full p-2.5 sm:p-3 rounded-xl transition-all",
            "bg-card/30 border",
            colors.border,
            colors.borderHover,
            colors.borderActive,
            "data-[state=open]:rounded-b-none",
            "group"
          )}
        >
          {/* Top row: Icon, Title, Chevron */}
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={cn(
                "w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border shrink-0",
                colors.iconBg,
                colors.iconBorder
              )}>
                <Icon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", colors.text)} />
              </div>
              <h2 className={cn(
                "font-orbitron text-[9px] sm:text-[10px] font-bold tracking-wider uppercase truncate",
                colors.text
              )}>
                {title}
              </h2>
            </div>
            <ChevronDown className={cn(
              "w-3.5 h-3.5 shrink-0 transition-transform duration-200 text-muted-foreground",
              "group-data-[state=open]:rotate-180"
            )} />
          </div>
          {/* Bottom row: Metric/Badge */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              {badge && (
                <Badge
                  className={cn(
                    "font-orbitron text-[7px] px-1.5 py-0",
                    badge.variant === 'success' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    badge.variant === 'warning' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                    (!badge.variant || badge.variant === 'default') && `${colors.iconBg} ${colors.text} ${colors.iconBorder}`
                  )}
                >
                  {badge.label}
                </Badge>
              )}
              {metric && (
                <span className={cn("text-xs sm:text-sm font-orbitron font-bold", colors.text)}>
                  {metric.value}{metric.suffix}
                </span>
              )}
            </div>
            {headerAction && (
              <div onClick={(e) => e.stopPropagation()} className="hidden sm:block">
                {headerAction}
              </div>
            )}
          </div>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      >
        <div className={cn(
          "p-2.5 sm:p-3 border-x border-b rounded-b-xl max-h-[300px] sm:max-h-[400px] overflow-y-auto",
          colors.contentBorder,
          colors.contentBg
        )}>
          {children}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
});

ExpandableSection.displayName = "ExpandableSection";

// Also export the Accordion root for wrapping multiple sections
const ExpandableSectionGroup = AccordionPrimitive.Root;

export { ExpandableSection, ExpandableSectionGroup };
export type { SectionColor, ExpandableSectionProps };
