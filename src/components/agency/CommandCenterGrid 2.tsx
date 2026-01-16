import React from 'react';
import { cn } from '@/lib/utils';

interface CommandCenterGridProps {
    children: React.ReactNode;
    className?: string;
}

const CommandCenterGrid: React.FC<CommandCenterGridProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                'grid gap-4',
                // Desktop: 4-column grid with different row heights
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
                'auto-rows-fr',
                // Ensure grid fits viewport on desktop
                'max-h-[calc(100vh-12rem)]',
                'animate-fade-in',
                className
            )}
        >
            {children}
        </div>
    );
};

export default CommandCenterGrid;
