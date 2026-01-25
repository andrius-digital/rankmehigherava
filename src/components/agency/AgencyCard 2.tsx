import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusIndicator from './StatusIndicator';

type AccentColor = 'ai' | 'websites' | 'calls' | 'operations' | 'primary';
type CardSize = 'large' | 'medium' | 'compact';

interface AgencyCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accentColor?: AccentColor;
  actionLabel?: string;
  delay?: number;
  size?: CardSize;
}

const accentStyles: Record<AccentColor, {
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  hoverShadow: string;
  gradient: string;
}> = {
  ai: {
    iconBg: 'bg-agency-ai/15',
    iconColor: 'text-agency-ai',
    hoverBorder: 'hover:border-agency-ai/50',
    hoverShadow: 'hover:shadow-agency-ai/10',
    gradient: 'from-agency-ai/20 via-transparent to-transparent',
  },
  websites: {
    iconBg: 'bg-agency-websites/15',
    iconColor: 'text-agency-websites',
    hoverBorder: 'hover:border-agency-websites/50',
    hoverShadow: 'hover:shadow-agency-websites/10',
    gradient: 'from-agency-websites/20 via-transparent to-transparent',
  },
  calls: {
    iconBg: 'bg-agency-calls/15',
    iconColor: 'text-agency-calls',
    hoverBorder: 'hover:border-agency-calls/50',
    hoverShadow: 'hover:shadow-agency-calls/10',
    gradient: 'from-agency-calls/20 via-transparent to-transparent',
  },
  operations: {
    iconBg: 'bg-agency-operations/15',
    iconColor: 'text-agency-operations',
    hoverBorder: 'hover:border-agency-operations/50',
    hoverShadow: 'hover:shadow-agency-operations/10',
    gradient: 'from-agency-operations/20 via-transparent to-transparent',
  },
  primary: {
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    hoverBorder: 'hover:border-primary/50',
    hoverShadow: 'hover:shadow-primary/10',
    gradient: 'from-primary/20 via-transparent to-transparent',
  },
};

const sizeStyles: Record<CardSize, string> = {
  large: 'col-span-2 row-span-2',
  medium: 'col-span-1 row-span-2',
  compact: 'col-span-1 row-span-1',
};

const AgencyCard: React.FC<AgencyCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  accentColor = 'primary',
  actionLabel = 'Open',
  delay = 0,
  size = 'medium',
}) => {
  const styles = accentStyles[accentColor];
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      to={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative block rounded-xl overflow-hidden',
        'bg-card/50 backdrop-blur-sm border-2 border-border/50',
        styles.hoverBorder,
        'transition-all duration-500',
        'hover:-translate-y-2',
        'animate-fade-in',
        sizeStyles[size],
        isHovered ? 'shadow-2xl command-card-hover' : 'command-card-idle'
      )}
      style={{
        animationDelay: `${delay}ms`,
        ['--glow-color' as any]: `hsl(${styles.iconColor.includes('ai') ? '270 70% 55% / 0.3' : styles.iconColor.includes('websites') ? '174 70% 45% / 0.3' : styles.iconColor.includes('calls') ? '35 92% 55% / 0.3' : styles.iconColor.includes('operations') ? '234 85% 55% / 0.3' : '4 84% 55% / 0.3'})`
      }}
    >
      {/* Holographic shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        <div
          className={cn(
            'absolute inset-0 holographic-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500'
          )}
        />
      </div>

      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          'bg-gradient-to-br',
          styles.gradient
        )}
      />

      {/* Animated border scan effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500">
        <div
          className={cn(
            'absolute inset-0 rounded-xl border-2',
            styles.iconColor,
            'animate-border-scan'
          )}
        />
      </div>

      {/* Corner accent lights */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--glow-color)' }}>
        <div className={cn('absolute inset-0 rounded-full animate-corner-light', styles.iconColor)} />
      </div>
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--glow-color)', animationDelay: '0.1s' }}>
        <div className={cn('absolute inset-0 rounded-full animate-corner-light', styles.iconColor)} style={{ animationDelay: '0.1s' }} />
      </div>
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--glow-color)', animationDelay: '0.2s' }}>
        <div className={cn('absolute inset-0 rounded-full animate-corner-light', styles.iconColor)} style={{ animationDelay: '0.2s' }} />
      </div>
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--glow-color)', animationDelay: '0.3s' }}>
        <div className={cn('absolute inset-0 rounded-full animate-corner-light', styles.iconColor)} style={{ animationDelay: '0.3s' }} />
      </div>

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              styles.iconBg,
              'group-hover:scale-110 transition-transform duration-300'
            )}
          >
            <Icon className={cn('w-6 h-6', styles.iconColor)} />
          </div>
          <StatusIndicator status="online" />
        </div>

        {/* Content */}
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-foreground/90 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Action */}
        <div className={cn(
          'flex items-center text-sm font-medium',
          styles.iconColor
        )}>
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>

      {/* Corner accent */}
      <div className={cn(
        'absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        'bg-gradient-to-tl',
        styles.gradient
      )} />
    </Link>
  );
};

export default AgencyCard;
