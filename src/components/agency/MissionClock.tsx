import React from 'react';
import { cn } from '@/lib/utils';

interface MissionClockProps {
    className?: string;
}

const MissionClock: React.FC<MissionClockProps> = ({ className }) => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className={cn("flex flex-col items-end gap-1", className)}>
            <div className="font-orbitron text-2xl font-bold text-primary tracking-wider">
                {formatTime(time)}
            </div>
            <div className="font-orbitron text-xs text-muted-foreground uppercase tracking-widest">
                {formatDate(time)}
            </div>
        </div>
    );
};

export default MissionClock;
