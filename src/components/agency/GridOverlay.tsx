import React from 'react';

const GridOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] animate-grid-flow"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Scan line effect */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan-line" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-primary/60 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-primary/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="absolute bottom-4 left-4 w-16 h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute bottom-4 left-4 w-px h-16 bg-gradient-to-t from-primary/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="absolute bottom-4 right-4 w-16 h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute bottom-4 right-4 w-px h-16 bg-gradient-to-t from-primary/60 to-transparent" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-agency-ai/5 rounded-full blur-3xl" />
    </div>
  );
};

export default GridOverlay;
