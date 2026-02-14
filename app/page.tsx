'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UrlInput } from '@/components/UrlInput';
import { ThemeSelector } from '@/components/ThemeSelector';
import { PreviewFrame } from '@/components/PreviewFrame';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { AiThemeInput } from '@/components/AiThemeInput';
import axios from 'axios';
import { Sparkles, Zap, Shield, Code, Github, Wand2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState('pixel');
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for AI Generated Theme
  const [aiCss, setAiCss] = useState<string | null>(null);

  const handleApply = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);
    setHtmlContent(null);

    try {
      // Small artificial delay for "processing" feel + network request
      await new Promise(resolve => setTimeout(resolve, 800));

      // Normalize URL: add https:// if no protocol is specified
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const params: any = { url: normalizedUrl, theme };

      // If AI theme was generated and we are selecting 'ai' or if we want to force it
      // Actually, let's say if aiCss exists, we pass it.
      // But the backend `proxy` needs to know to use it.
      // We can pass `theme=ai` and `customCss=...`

      if (aiCss) {
        params.theme = 'ai';
        params.customCss = aiCss;
      }

      const response = await axios.post('/api/proxy', params);
      // Changed to POST to handle large CSS payload

      setHtmlContent(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to connect. Please verify the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = (css: string) => {
    setAiCss(css);
    // Auto-select AI theme? Or just notify user?
    // Let's notify and maybe set theme to something special or just apply if URL is there.
    if (url) {
      // Trigger apply with new CSS immediately?
      // Or wait for user to click Apply.
      // Let's clear any previous normal theme selection visual if we could, 
      // but for now let's just act as if "AI" overrides.
      alert("✨ AI Theme Generated! Click 'Apply Theme' to see it in action.");
    }
  };

  return (
    <main className="min-h-screen relative text-white font-sans overflow-x-hidden">
      <InteractiveBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center gap-12">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-blue-300">
            <Sparkles size={16} /> <span>v3.1 AI Update</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 drop-shadow-2xl">
            WebSkin
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
            Transform any website into a retro masterpiece or futuristic interface with <span className="text-white font-semibold">AI Magic</span>.
          </p>
        </motion.div>

        {/* Input & Controls Section */}
        <div className="w-full max-w-4xl space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 items-end relative z-10">
              <ThemeSelector value={theme} onChange={(val) => { setTheme(val); setAiCss(null); }} />
              <div className="flex-1 w-full">
                <UrlInput
                  value={url}
                  onChange={setUrl}
                  onSubmit={handleApply}
                  loading={loading}
                />
              </div>
            </div>

            {/* AI Input */}
            <AiThemeInput onGenerate={handleAiGenerate} />
            {aiCss && <p className="text-xs text-center mt-2 text-green-400">✨ AI Theme Active</p>}

          </div>
        </div>

        {/* Preview Area */}
        <PreviewFrame
          htmlContent={htmlContent}
          loading={loading}
          error={error}
        />

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12"
        >
          {[
            { icon: <Zap size={24} />, title: 'Instantly Dynamic', desc: 'Real-time CSS injection & asset rewriting.' },
            { icon: <Wand2 size={24} />, title: 'AI Powered', desc: 'Generate unique themes with text prompts.' },
            { icon: <Code size={24} />, title: 'Pro Presets', desc: 'Four professionally crafted design systems.' },
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <footer className="mt-20 text-gray-500 text-sm flex items-center gap-6">
          <p>© 2026 WebSkin. Built with Next.js & Tailwind.</p>
          <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
        </footer>

      </div>
    </main>
  );
}
