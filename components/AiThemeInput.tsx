'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Loader2, Send } from 'lucide-react';
import { cn } from '@/utils/cn';
import axios from 'axios';

interface AiThemeInputProps {
    onGenerate: (css: string) => void;
}

export const AiThemeInput: React.FC<AiThemeInputProps> = ({ onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/generate-theme', { prompt });
            if (res.data.css) {
                onGenerate(res.data.css);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to generate theme');
        } finally {
            setLoading(false);
            setPrompt(''); // Clear input after success
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto mt-4">

            {/* Toggle AI Mode */}
            {!active ? (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActive(true)}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg shadow-purple-500/30"
                >
                    <Sparkles size={16} />
                    <span>Or create with AI</span>
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative p-6 rounded-2xl bg-black/40 border border-purple-500/30 backdrop-blur-xl shadow-2xl ring-1 ring-purple-500/20"
                >
                    <div className="absolute -top-3 left-6 flex items-center gap-1 bg-black px-2 text-xs text-purple-400 font-bold uppercase tracking-wider border border-purple-500/30 rounded">
                        <Wand2 size={12} /> AI Theme Generator
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your dream theme... (e.g. 'Cyberpunk Pink')"
                            className="flex-1 bg-transparent border-b border-white/20 py-2 px-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt}
                            className="p-3 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>

                    <p className="mt-3 text-xs text-center text-purple-300/50 flex items-center justify-center gap-1">
                        <Sparkles size={10} /> Powered by Groq (Llama 3.3 70B)
                    </p>
                </motion.div>
            )}
        </div>
    );
};
