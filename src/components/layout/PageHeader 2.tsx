import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, children }) => {
  return (
    <div className="border-b border-border/50 bg-gradient-to-r from-card/80 via-card/50 to-transparent backdrop-blur-sm">
      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="relative w-12 h-12 rounded-xl bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center overflow-hidden hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
                <Icon className="w-6 h-6 text-cyan-400 relative z-10" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
