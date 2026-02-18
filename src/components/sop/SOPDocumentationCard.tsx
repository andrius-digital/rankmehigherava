import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusIndicator from '@/components/agency/StatusIndicator';

interface SOPDocumentationCardProps {
  onClick: () => void;
  phasesCount?: number;
  delay?: number;
}

const SOPDocumentationCard: React.FC<SOPDocumentationCardProps> = ({
  onClick,
  phasesCount = 7,
  delay = 0,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative block rounded-xl overflow-hidden text-left w-full',
        'bg-card/50 backdrop-blur-sm border-2 border-border/50',
        'hover:border-cyan-500/50',
        'transition-all duration-500',
        'hover:-translate-y-2',
        'animate-fade-in',
        'col-span-1 row-span-1',
        isHovered ? 'shadow-2xl shadow-cyan-500/10' : ''
      )}
      style={{
        animationDelay: `${delay}ms`,
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
          'bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent'
        )}
      />

      {/* Animated border scan effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500">
        <div
          className={cn(
            'absolute inset-0 rounded-xl border-2 text-cyan-400',
            'animate-border-scan'
          )}
        />
      </div>

      {/* Corner accent lights */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-full animate-corner-light bg-cyan-400" />
      </div>
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: '0.1s' }}>
        <div className="absolute inset-0 rounded-full animate-corner-light bg-cyan-400" style={{ animationDelay: '0.1s' }} />
      </div>
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-0 rounded-full animate-corner-light bg-cyan-400" style={{ animationDelay: '0.2s' }} />
      </div>
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: '0.3s' }}>
        <div className="absolute inset-0 rounded-full animate-corner-light bg-cyan-400" style={{ animationDelay: '0.3s' }} />
      </div>

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-cyan-500/15',
              'group-hover:scale-110 transition-transform duration-300'
            )}
          >
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">
              {phasesCount} Phases
            </span>
            <StatusIndicator status="online" />
          </div>
        </div>

        {/* Content */}
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-foreground/90 transition-colors">
          Documentation & SOPs
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          Access technical guides, workflows & checklists
        </p>

        {/* Action */}
        <div className="flex items-center text-sm font-medium text-cyan-400">
          <span>Open Documentation</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>

      {/* Corner accent */}
      <div className={cn(
        'absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        'bg-gradient-to-tl from-cyan-500/20 via-transparent to-transparent'
      )} />
    </button>
  );
};

export default SOPDocumentationCard;
