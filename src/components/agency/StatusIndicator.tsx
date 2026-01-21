import React from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status?: 'online' | 'offline' | 'pending';
  label?: string;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status = 'online', 
  label,
  className 
}) => {
  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-muted-foreground',
    pending: 'bg-amber-500',
  };

  const glowColors = {
    online: 'shadow-emerald-500/50',
    offline: 'shadow-muted-foreground/50',
    pending: 'shadow-amber-500/50',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div 
          className={cn(
            'w-2 h-2 rounded-full',
            statusColors[status],
            'shadow-lg',
            glowColors[status]
          )} 
        />
        {status === 'online' && (
          <div 
            className={cn(
              'absolute inset-0 w-2 h-2 rounded-full animate-ping',
              statusColors[status],
              'opacity-75'
            )} 
          />
        )}
      </div>
      {label && (
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
