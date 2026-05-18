'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrlInput } from '@/components/UrlInput';
import { ThemeSelector } from '@/components/ThemeSelector';
import { PreviewFrame } from '@/components/PreviewFrame';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { AiThemeInput } from '@/components/AiThemeInput';
import CursorFX from '@/components/CursorFX';
import axios from 'axios';
import {
  Sparkles, Wand2, CheckCircle2,
  Settings2, Sliders,
  Globe, Palette,
  Monitor, Terminal,
  Moon, Sun, X
} from 'lucide-react';



export default function Home() {
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState('pixel');
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiCss, setAiCss] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Workbench States
  const [uiTheme, setUiTheme] = useState<'dark' | 'light'>('dark');
  const [borderRadius, setBorderRadius] = useState(12);
  const [contrast, setContrast] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Quick-access Test Portals
  const portals = [
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Design', icon: <Globe size={14} /> },
    { name: 'Hacker News', url: 'https://news.ycombinator.com/', icon: <Terminal size={14} /> },
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme);
  }, [uiTheme]);

  // ESC key exits fullscreen; F key enters fullscreen when a preview is active
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
      if (e.key === 'f' && !isFullscreen && proxyUrl && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsFullscreen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, proxyUrl]);

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
        const storeRes = await axios.post('/api/store-css', { css: aiCss });
        const token = storeRes.data.token;
        if (!token) throw new Error('Failed to store CSS — no token returned');
        setProxyUrl(`/api/proxy?url=${encodeURIComponent(normalizedUrl)}&theme=ai&cssToken=${token}`);
      } else {
        setProxyUrl(`/api/proxy?url=${encodeURIComponent(normalizedUrl)}&theme=${theme}`);
      }
    } catch (err) {
      console.error(err);
      const axiosError = err as import('axios').AxiosError<{error: string}>;
      setError(axiosError.response?.data?.error || 'Failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = (css: string) => {
    setAiCss(css);
    if (url) {
      showToast("✨ AI Theme generated successfully! Click 'Apply Theme' to preview.");
    } else {
      showToast("✨ AI Theme generated! Enter a URL and apply.");
    }
  };

  return (
    <main className="h-screen w-full flex overflow-hidden bg-background text-foreground transition-colors duration-300 relative selection:bg-primary/30">
      <CursorFX />
      <div className="absolute inset-0 z-0">
        <InteractiveBackground />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-lg bg-surface-container-highest/90 backdrop-blur-xl shadow-2xl border border-outline-variant/50"
          >
            <CheckCircle2 size={16} className="text-primary" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR (Workbench Controls) */}
      <div className="w-80 h-full bg-surface-container-lowest/80 backdrop-blur-2xl border-r border-outline-variant/30 flex flex-col z-20 flex-shrink-0 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between sticky top-0 bg-surface-container-lowest/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
            <Settings2 size={20} />
            <span>WEBSKIN.IO</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-surface-container transition-colors text-outline hover:text-on-surface"
              title="Toggle Light/Dark Mode"
            >
              {uiTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* AI Theme Generator */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-outline uppercase tracking-widest flex items-center gap-2">
              <Wand2 size={14} /> AI Compiler
            </h3>
            <div>
              <AiThemeInput onGenerate={handleAiGenerate} />
            </div>
            <AnimatePresence>
                {aiCss && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-primary-container/10 border border-primary-container/20 text-[11px] font-medium text-primary">
                      <Sparkles size={12} /> 
                      <span>AI Theme Active in memory</span>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </section>

          {/* Theme Presets */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-outline uppercase tracking-widest flex items-center gap-2">
              <Palette size={14} /> Built-in Presets
            </h3>
            <div className="w-full">
              <ThemeSelector value={theme} onChange={(val) => { setTheme(val); setAiCss(null); }} />
            </div>
          </section>

          {/* Fine-Tuning HUD */}
          <section className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h3 className="text-xs font-semibold text-outline uppercase tracking-widest flex items-center gap-2">
              <Sliders size={14} /> Fine-Tuning
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Global Radius</span>
                  <span>{borderRadius}px</span>
                </div>
                <input 
                  type="range" min="0" max="32" value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-primary bg-surface-container h-1 rounded-full appearance-none outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Contrast Overrides</span>
                  <span>{contrast}%</span>
                </div>
                <input 
                  type="range" min="50" max="150" value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-primary bg-surface-container h-1 rounded-full appearance-none outline-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-outline mt-2 italic">* Fine-tuning applies to supported generative CSS elements.</p>
          </section>
        </div>
      </div>

      {/* MAIN CONTENT (Sandbox Area) */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        
        {/* Topbar URL & Portals */}
        <div className="p-4 md:p-6 bg-surface-container-lowest/40 backdrop-blur-md border-b border-outline-variant/20 flex flex-col gap-4 shadow-sm z-20">
          <div>
            <UrlInput
              value={url}
              onChange={setUrl}
              onSubmit={handleApply}
              loading={loading}
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-semibold text-outline uppercase tracking-widest whitespace-nowrap">
              Test Portals:
            </span>
            {portals.map((portal) => (
              <button
                key={portal.name}
                onClick={() => setUrl(portal.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container/50 border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/10 transition-all text-xs text-on-surface-variant hover:text-primary whitespace-nowrap"
              >
                {portal.icon}
                {portal.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sandbox Frame Workspace */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col items-center justify-center bg-transparent z-10 relative">
          <AnimatePresence mode="wait">
            {!proxyUrl && !loading ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center text-outline/60 space-y-6 max-w-md text-center bg-surface-container-lowest/50 backdrop-blur-md p-10 rounded-[32px] border border-outline-variant/20 shadow-2xl"
              >
                <div className="w-24 h-24 rounded-3xl bg-surface-container flex items-center justify-center border border-outline-variant/20 shadow-inner">
                  <Monitor size={40} className="opacity-50" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-on-surface-variant">Sandbox Idle</h2>
                  <p className="text-sm">Enter a URL or select a test portal above to initialize the WebSkin proxy and preview transformations.</p>
                </div>
              </motion.div>
            ) : (
              // ⚠️ Plain div — NOT a motion.div — so the fixed fullscreen overlay
              // inside PreviewFrame is NOT trapped in a transform stacking context.
              // framer-motion transforms on parent elements break fixed positioning.
              <div
                key="preview-frame"
                className="w-full h-full rounded-2xl overflow-hidden border border-outline-variant/40 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] bg-gray-950"
              >
                <PreviewFrame
                  proxyUrl={proxyUrl}
                  loading={loading}
                  error={error}
                  isFullscreen={isFullscreen}
                  onEnterFullscreen={() => setIsFullscreen(true)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── FULLSCREEN OVERLAY ── Rendered at root level in <main>, outside all
           motion.div transform contexts. This is the ONLY way fixed positioning
           reliably covers the entire viewport including the sidebar. */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] flex flex-col bg-gray-950"
          >
            {/* Fullscreen Header */}
            <div className="flex-shrink-0 bg-gray-900 border-b border-white/10 px-6 py-3 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 bg-black/20 rounded-lg px-3 py-1.5 text-center text-xs text-gray-400 font-mono">
                🔒 webskin-proxy · Fullscreen Mode
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all text-xs font-medium border border-white/10"
              >
                <X size={14} />
                <span>Exit Fullscreen</span>
                <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-500">ESC</kbd>
              </motion.button>
            </div>

            {/* Fullscreen iframe */}
            <div className="flex-1 relative overflow-hidden">
              <iframe
                key={proxyUrl}
                src={proxyUrl || undefined}
                style={{ width: '100%', height: '100%', border: 'none' }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                title="Preview Fullscreen"
              />
              {/* Floating exit pill always visible in preview area */}
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-900/80 backdrop-blur-md text-white text-xs font-medium border border-white/20 hover:bg-red-900/70 hover:border-red-500/40 transition-all shadow-xl"
              >
                <X size={12} />
                Exit
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-400">ESC</kbd>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
