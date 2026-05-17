'use client';

import React from 'react';
import { Palette, ChevronDown } from 'lucide-react';

interface ThemeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const themes = [
    { id: 'pixel', name: '👾 Pixel Art' },
    { id: 'hacker', name: '💻 Hacker Mode' },
    { id: 'glass', name: '🔮 Glassmorphism' },
    { id: 'retro', name: '📼 Retro 90s' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ value, onChange }) => {
    return (
        <div className="w-full relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-outline">
                <Palette size={16} />
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface appearance-none cursor-pointer hover:bg-surface-container-high shadow-inner"
            >
                {themes.map((theme) => (
                    <option key={theme.id} value={theme.id} className="bg-surface-container text-on-surface">
                        {theme.name}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-outline">
                <ChevronDown size={16} />
            </div>
        </div>
    );
};
