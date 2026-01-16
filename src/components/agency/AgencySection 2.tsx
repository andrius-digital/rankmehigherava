import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccentColor = 'ai' | 'websites' | 'calls' | 'operations';

interface AgencySectionProps {
  title: string;
  icon: LucideIcon;
  accentColor: AccentColor;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const accentStyles: Record<AccentColor, {
  iconBg: string;
  iconColor: string;
  borderColor: string;
  glowColor: string;
  titleColor: string;
}> = {
  ai: {
    iconBg: 'bg-agency-ai/10',
    iconColor: 'text-agency-ai',
    borderColor: 'border-agency-ai/20',
    glowColor: 'shadow-agency-ai/5',
    titleColor: 'text-agency-ai',
  },
  websites: {
    iconBg: 'bg-agency-websites/10',
    iconColor: 'text-agency-websites',
    borderColor: 'border-agency-websites/20',
    glowColor: 'shadow-agency-websites/5',
    titleColor: 'text-agency-websites',
  },
  calls: {
    iconBg: 'bg-agency-calls/10',
    iconColor: 'text-agency-calls',
    borderColor: 'border-agency-calls/20',
    glowColor: 'shadow-agency-calls/5',
    titleColor: 'text-agency-calls',
  },
  operations: {
    iconBg: 'bg-agency-operations/10',
    iconColor: 'text-agency-operations',
    borderColor: 'border-agency-operations/20',
    glowColor: 'shadow-agency-operations/5',
    titleColor: 'text-agency-operations',
  },
};

const AgencySection: React.FC<AgencySectionProps> = ({
  title,
  icon: Icon,
  accentColor,
  children,
  className,
  delay = 0,
}) => {
  const styles = accentStyles[accentColor];

  return (
    <section 
      className={cn(
        'relative animate-fade-in',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div 
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            styles.iconBg,
            'animate-float'
          )}
          style={{ animationDelay: `${delay + 200}ms` }}
        >
          <Icon className={cn('w-5 h-5', styles.iconColor)} />
        </div>
        <div className="flex items-center gap-3">
          <h2 className={cn(
            'font-heading text-xl font-bold uppercase tracking-wider',
            styles.titleColor
          )}>
            {title}
          </h2>
          <div className={cn('h-px flex-1 min-w-[60px]', 'bg-gradient-to-r from-current to-transparent', styles.titleColor, 'opacity-30')} />
        </div>
      </div>

      {/* Section content */}
      <div className={cn(
        'relative rounded-2xl p-1',
        'bg-gradient-to-br from-card/80 to-card/40',
        'border',
        styles.borderColor,
        'shadow-xl',
        styles.glowColor
      )}>
        {/* Inner glass container */}
        <div className="rounded-xl bg-card/30 backdrop-blur-sm p-4 sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
};

export default AgencySection;
