'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const themes = [
    { id: 'pixel', name: '👾 Pixel Art', color: 'from-orange-500 to-yellow-500' },
    { id: 'hacker', name: '💻 Hacker Mode', color: 'from-green-500 to-emerald-500' },
    { id: 'glass', name: '🔮 Glassmorphism', color: 'from-blue-500 to-purple-500' },
    { id: 'retro', name: '📼 Retro 90s', color: 'from-teal-500 to-cyan-500' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ value, onChange }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="md:w-64 w-full"
        >
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-outline">
                    <Palette size={20} />
                </div>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-surface-container border border-outline-variant rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface appearance-none cursor-pointer hover:bg-surface-container-high"
                >
                    {themes.map((theme) => (
                        <option key={theme.id} value={theme.id} className="bg-surface-container text-on-surface">
                            {theme.name}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-outline">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
            </div>
        </motion.div>
    );
};
