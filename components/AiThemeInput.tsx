'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Loader2, Send } from 'lucide-react';
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
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary text-sm font-bold shadow-lg"
                >
                    <Sparkles size={16} />
                    <span>Or create with AI</span>
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative p-6 rounded-2xl bg-surface-container border border-outline-variant shadow-2xl"
                >
                    <div className="absolute -top-3 left-6 flex items-center gap-1 bg-surface-container-highest px-2 text-xs text-primary font-bold uppercase tracking-wider border border-outline-variant rounded">
                        <Wand2 size={12} /> AI Theme Generator
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your dream theme... (e.g. 'Cyberpunk Pink')"
                            className="flex-1 bg-transparent border-b border-outline-variant py-2 px-2 text-on-surface placeholder-outline focus:outline-none focus:border-primary transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt}
                            className="p-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>

                    <p className="mt-3 text-xs text-center text-outline flex items-center justify-center gap-1">
                        <Sparkles size={10} /> Powered by Groq (Llama 3.3 70B)
                    </p>
                </motion.div>
            )}
        </div>
    );
};
