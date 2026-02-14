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
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Search size={20} />
                </div>
                <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter website URL (e.g., https://example.com)"
                    className="w-full pl-10 pr-4 py-4 bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-xl text-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner text-white placeholder-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                />
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSubmit}
                disabled={loading}
                className={cn(
                    "px-8 py-4 rounded-xl font-bold text-white shadow-lg backdrop-blur-md transition-all",
                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
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
