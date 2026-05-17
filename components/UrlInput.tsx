'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface UrlInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    loading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ value, onChange, onSubmit, loading }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex w-full gap-3"
        >
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <Search size={20} />
                </div>
                <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter website URL (e.g., https://example.com)"
                    className="w-full pl-10 pr-4 py-4 bg-surface-container border border-outline-variant rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder-outline"
                    onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                />
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSubmit}
                disabled={loading}
                className={cn(
                    "px-8 py-4 rounded-xl font-bold transition-all",
                    "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing</span>
                    </>
                ) : (
                    <span>Apply Theme</span>
                )}
            </motion.button>
        </motion.div>
    );
};
