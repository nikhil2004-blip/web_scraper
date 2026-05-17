'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const InteractiveBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-surface-container-lowest">
            {/* Subtle Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: `linear-gradient(to right, var(--outline-variant) 1px, transparent 1px), linear-gradient(to bottom, var(--outline-variant) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            
            {/* Radial gradient mask to fade the grid towards the edges */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--surface-container-lowest)_80%)]" />

            {/* Subtle ambient light 1 */}
            <motion.div
                animate={{
                    opacity: [0.05, 0.1, 0.05],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary blur-[120px] pointer-events-none"
            />
            
            {/* Subtle ambient light 2 */}
            <motion.div
                animate={{
                    opacity: [0.03, 0.08, 0.03],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-primary-container blur-[100px] pointer-events-none"
            />

            {/* Noise overlay for texture */}
            <div 
                className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};
