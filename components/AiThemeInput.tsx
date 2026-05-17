'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Send } from 'lucide-react';
import axios from 'axios';

interface AiThemeInputProps {
    onGenerate: (css: string) => void;
}

export const AiThemeInput: React.FC<AiThemeInputProps> = ({ onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

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
            setPrompt('');
        }
    };

    return (
        <div className="w-full relative">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your theme... (e.g. 'Cyberpunk with neon pinks')"
                rows={3}
                className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none shadow-inner"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                    }
                }}
            />
            <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-outline flex items-center gap-1">
                    <Sparkles size={10} /> Groq (Llama 3)
                </span>
                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-bold shadow-sm"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {loading ? 'Compiling...' : 'Generate'}
                </button>
            </div>
        </div>
    );
};
