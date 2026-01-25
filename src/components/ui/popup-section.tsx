import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SectionColor = 'cyan' | 'emerald' | 'purple' | 'blue' | 'orange' | 'amber';

interface PopupSectionProps {
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
  notificationCount?: number;
  children: React.ReactNode;
  className?: string;
}

const colorConfig: Record<SectionColor, {
  border: string;
  borderHover: string;
  bg: string;
  text: string;
  iconBg: string;
  iconBorder: string;
  dialogBorder: string;
  dialogBg: string;
}> = {
  cyan: {
    border: 'border-cyan-500/20',
    borderHover: 'hover:border-cyan-500/50 hover:bg-cyan-500/10',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    iconBorder: 'border-cyan-500/30',
    dialogBorder: 'border-cyan-500/30',
    dialogBg: 'bg-gradient-to-br from-cyan-950/50 to-slate-950',
  },
  emerald: {
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    iconBorder: 'border-emerald-500/30',
    dialogBorder: 'border-emerald-500/30',
    dialogBg: 'bg-gradient-to-br from-emerald-950/50 to-slate-950',
  },
  purple: {
    border: 'border-purple-500/20',
    borderHover: 'hover:border-purple-500/50 hover:bg-purple-500/10',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    iconBorder: 'border-purple-500/30',
    dialogBorder: 'border-purple-500/30',
    dialogBg: 'bg-gradient-to-br from-purple-950/50 to-slate-950',
  },
  blue: {
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/50 hover:bg-blue-500/10',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/30',
    dialogBorder: 'border-blue-500/30',
    dialogBg: 'bg-gradient-to-br from-blue-950/50 to-slate-950',
  },
  orange: {
    border: 'border-orange-500/20',
    borderHover: 'hover:border-orange-500/50 hover:bg-orange-500/10',
    bg: 'bg-orange-500/5',
    text: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    iconBorder: 'border-orange-500/30',
    dialogBorder: 'border-orange-500/30',
    dialogBg: 'bg-gradient-to-br from-orange-950/50 to-slate-950',
  },
  amber: {
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/50 hover:bg-amber-500/10',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/30',
    dialogBorder: 'border-amber-500/30',
    dialogBg: 'bg-gradient-to-br from-amber-950/50 to-slate-950',
  },
};

const PopupSection: React.FC<PopupSectionProps> = ({
  title,
  icon: Icon,
  color,
  metric,
  badge,
  notificationCount,
  children,
  className
}) => {
  const colors = colorConfig[color];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex flex-col w-full p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer relative",
            "bg-card/30 border",
            colors.border,
            colors.borderHover,
            className
          )}
        >
          {/* Notification Badge */}
          {notificationCount && notificationCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
              {notificationCount}
            </div>
          )}
          {/* Top row: Icon and Title */}
          <div className="flex items-center gap-2 w-full mb-1.5">
            <div className={cn(
              "w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border shrink-0",
              colors.iconBg,
              colors.iconBorder
            )}>
              <Icon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", colors.text)} />
            </div>
            <h2 className={cn(
              "font-orbitron text-[9px] sm:text-[10px] font-bold tracking-wider uppercase truncate text-left",
              colors.text
            )}>
              {title}
            </h2>
          </div>
          {/* Bottom row: Metric/Badge */}
          <div className="flex items-center gap-1.5 w-full">
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
        </button>
      </DialogTrigger>
      <DialogContent className={cn(
        "max-w-2xl max-h-[85vh] overflow-hidden border",
        colors.dialogBorder,
        colors.dialogBg
      )}>
        <DialogHeader className="pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              colors.iconBg,
              colors.iconBorder
            )}>
              <Icon className={cn("w-4 h-4", colors.text)} />
            </div>
            <span className={cn("font-orbitron text-sm font-bold tracking-wider uppercase", colors.text)}>
              {title}
            </span>
            {badge && (
              <Badge
                className={cn(
                  "font-orbitron text-[8px] px-2 py-0.5 ml-auto",
                  badge.variant === 'success' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  badge.variant === 'warning' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                  (!badge.variant || badge.variant === 'default') && `${colors.iconBg} ${colors.text} ${colors.iconBorder}`
                )}
              >
                {badge.label}
              </Badge>
            )}
            {metric && (
              <span className={cn("text-lg font-orbitron font-bold ml-auto", colors.text)}>
                {metric.value}{metric.suffix}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(85vh-100px)] py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { PopupSection };
export type { SectionColor, PopupSectionProps };
