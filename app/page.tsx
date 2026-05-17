'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrlInput } from '@/components/UrlInput';
import { ThemeSelector } from '@/components/ThemeSelector';
import { PreviewFrame } from '@/components/PreviewFrame';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { AiThemeInput } from '@/components/AiThemeInput';
import axios from 'axios';
import { Sparkles, Zap, Code, Github, Wand2, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState('pixel');
  // proxyUrl drives the iframe src — used for BOTH preset AND ai themes
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Generated Theme CSS (stored client-side between generate & apply)
  const [aiCss, setAiCss] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const handleApply = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);
    setProxyUrl(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      if (aiCss) {
        // AI mode:
        // 1. POST the CSS to store-css → get a server-side token
        // 2. Build a GET proxy URL with that token
        //
        // Why GET + token (not srcdoc)?
        // srcdoc iframes have a null origin which breaks Next.js SPAs like nikstu.tech:
        //   - History.pushState/replaceState fail (null origin ≠ target origin)
        //   - /_next/data fetch chunks resolve relative to about:srcdoc, not the target
        // A real GET src= URL gives the iframe a proper origin (localhost:3000) which
        // our injected router-fix script can successfully intercept.
        const storeRes = await axios.post('/api/store-css', { css: aiCss });
        const token = storeRes.data.token;
        if (!token) throw new Error('Failed to store CSS — no token returned');
        setProxyUrl(`/api/proxy?url=${encodeURIComponent(normalizedUrl)}&theme=ai&cssToken=${token}`);
      } else {
        // Standard preset theme — simple GET URL, no POST needed
        setProxyUrl(`/api/proxy?url=${encodeURIComponent(normalizedUrl)}&theme=${theme}`);
      }
    } catch (err) {
      console.error(err);
      const axiosError = err as import('axios').AxiosError<{error: string}>;
      setError(axiosError.response?.data?.error || 'Failed to connect. Please verify the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = (css: string) => {
    setAiCss(css);
    if (url) {
      showToast("✨ AI Theme ready! Click 'Apply Theme' to see it.");
    } else {
      showToast("✨ AI Theme ready! Enter a URL and click 'Apply Theme'.");
    }
  };

  return (
    <main className="min-h-screen relative text-white font-sans overflow-x-hidden">
      <InteractiveBackground />

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-[12px] bg-surface-container-high/90 backdrop-blur-[12px] text-on-surface text-sm font-semibold shadow-2xl border border-primary-container/30"
          >
            <CheckCircle2 size={16} className="text-primary-container" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center gap-12">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-surface-container-high/50 backdrop-blur-[12px] border border-outline-variant/30 text-sm font-medium text-primary-container">
            <Sparkles size={16} /> <span className="tracking-widest uppercase text-xs">v3.1 Obsidian Update</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-on-surface drop-shadow-2xl">
            WebSkin
          </h1>

          <p className="text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed">
            Transform any website into a high-fidelity interface with <span className="text-primary-container font-medium">precision-engineered AI</span>.
          </p>
        </motion.div>

        {/* Input & Controls Section */}
        <div className="w-full max-w-4xl space-y-8">
          <div className="bg-surface-container/70 backdrop-blur-[12px] border border-outline-variant/40 rounded-[24px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary-container/30 to-transparent pointer-events-none" />

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

            <AiThemeInput onGenerate={handleAiGenerate} />
            {aiCss && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-center mt-3 text-primary-container flex items-center justify-center gap-1"
              >
                <CheckCircle2 size={12} /> AI Theme Active — click Apply Theme to apply
              </motion.p>
            )}
          </div>
        </div>

        {/* Preview Area — only proxyUrl now, no srcdoc needed */}
        <PreviewFrame
          proxyUrl={proxyUrl}
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
            <div key={idx} className="p-6 rounded-[16px] bg-surface-container/70 backdrop-blur-[12px] border border-outline-variant/30 hover:bg-surface-container-high/70 transition-colors">
              <div className="bg-primary-container/10 w-12 h-12 rounded-[12px] flex items-center justify-center mb-4 text-primary-container border border-primary-container/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-on-surface">{feature.title}</h3>
              <p className="text-on-surface-variant">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <footer className="mt-20 text-gray-500 text-sm flex items-center gap-6">
          <p>© 2026 WebSkin. Built with Next.js & Tailwind.</p>
          <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
        </footer>

      </div>
    </main>
  );
}
