import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
    className?: string;
}

export default function NeonButton({
    children,
    variant = "primary",
    className,
    ...props
}: NeonButtonProps & { [key: string]: any }) {
    const baseStyles = "relative px-8 py-3 rounded-md font-orbitron font-bold tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95";

    const variants = {
        primary: "bg-electric-blue text-white shadow-[0_0_15px_rgba(0,128,255,0.5)] hover:shadow-[0_0_30px_rgba(0,128,255,0.8)] border border-blue-400/30",
        secondary: "bg-transparent text-electric-blue border border-electric-blue shadow-[0_0_10px_rgba(0,128,255,0.2)] hover:bg-electric-blue/10 hover:shadow-[0_0_20px_rgba(0,128,255,0.5)]",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2 justify-center">
                {children}
            </span>
            {variant === "primary" && (
                <div className="absolute inset-0 rounded-md bg-electric-blue opacity-50 blur-lg animate-pulse -z-10" />
            )}
        </motion.button>
    );
}
