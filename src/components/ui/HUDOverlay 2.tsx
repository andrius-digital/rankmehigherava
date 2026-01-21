import React from 'react';
import { cn } from '@/lib/utils';

interface HUDOverlayProps {
    className?: string;
}

const HUDOverlay: React.FC<HUDOverlayProps> = ({ className }) => {
    return (
        <div className={cn("fixed inset-0 pointer-events-none z-0 overflow-hidden", className)}>
            {/* Animated grid background */}
            <div className="absolute inset-0 hud-grid-background opacity-30" />

            {/* Scan line that sweeps periodically */}
            <div className="absolute inset-0">
                <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan-line" />
            </div>

            {/* Corner brackets - top left */}
            <div className="absolute top-4 left-4 w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/60 to-transparent animate-hud-pulse" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-primary/60 to-transparent animate-hud-pulse" />
            </div>

            {/* Corner brackets - top right */}
            <div className="absolute top-4 right-4 w-16 h-16">
                <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary/60 to-transparent animate-hud-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-primary/60 to-transparent animate-hud-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Corner brackets - bottom left */}
            <div className="absolute bottom-4 left-4 w-16 h-16">
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/60 to-transparent animate-hud-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-0 left-0 w-[2px] h-full bg-gradient-to-t from-primary/60 to-transparent animate-hud-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Corner brackets - bottom right */}
            <div className="absolute bottom-4 right-4 w-16 h-16">
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary/60 to-transparent animate-hud-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t from-primary/60 to-transparent animate-hud-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Ambient light effects */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40" />

            {/* Scan line texture overlay */}
            <div className="absolute inset-0 scan-line-effect opacity-20" />
        </div>
    );
};

export default HUDOverlay;
