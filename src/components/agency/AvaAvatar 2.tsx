import React from 'react';
import { Brain } from 'lucide-react';

interface AvaAvatarProps {
    className?: string;
}

const AvaAvatar: React.FC<AvaAvatarProps> = ({ className }) => {
    return (
        <div className={`relative group ${className}`}>
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-purple-500/30 blur-xl animate-pulse" />

            {/* Main avatar container */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center overflow-hidden">
                {/* Animated scan lines */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scan" />
                </div>

                {/* Neural network pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>
                    {/* Neural connections */}
                    <circle cx="50" cy="50" r="2" fill="url(#neuralGradient)" className="animate-pulse" />
                    <circle cx="30" cy="30" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <circle cx="70" cy="30" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <circle cx="30" cy="70" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                    <circle cx="70" cy="70" r="1.5" fill="url(#neuralGradient)" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
                    <line x1="30" y1="30" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
                    <line x1="70" y1="30" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
                    <line x1="30" y1="70" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
                    <line x1="70" y1="70" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="0.5" opacity="0.3" />
                </svg>

                {/* Brain icon with glow */}
                <div className="relative z-10">
                    <Brain className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-float" />
                </div>

                {/* Rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400/50 border-r-blue-400/50 animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            {/* Pulse effect on hover */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-all duration-300" />
        </div>
    );
};

export default AvaAvatar;
