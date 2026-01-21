import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FuturisticWrapperProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function FuturisticWrapper({
    children,
    className,
    delay = 0
}: FuturisticWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay: delay * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={cn("relative z-10", className)}
        >
            {/* Subtle border glow effect */}
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 transition-opacity duration-500 hover:opacity-100 pointer-events-none" />
            {children}
        </motion.div>
    );
}
