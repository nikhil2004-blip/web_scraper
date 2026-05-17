'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader, Maximize2, X, Monitor, ExternalLink } from 'lucide-react';

interface PreviewFrameProps {
    proxyUrl: string | null;
    loading: boolean;
    error: string | null;
}

const VIRTUAL_WIDTH = 1280; // The "desktop" width the iframe renders at
const PREVIEW_HEIGHT = 700; // Fixed container height in px

// ─── Debounce helper ─────────────────────────────────────────────────────────
// ResizeObserver can fire dozens of times per second during a window resize.
// Without debouncing every call causes a React setState + re-render cycle,
// which is both expensive and makes the scaled preview jitter.
function debounce<Args extends unknown[]>(fn: (...args: Args) => void, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ proxyUrl, loading, error }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerWidth, setContainerWidth] = useState(800);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [renderKey, setRenderKey] = useState(0);

    // ── Scale: debounced so rapid resizes don't hammer React ─────────────────
    const handleScale = useCallback(() => {
        if (containerRef.current) {
            const w = containerRef.current.clientWidth;
            setContainerWidth(w);
            setScale(w / VIRTUAL_WIDTH);
        }
    }, []);

    const updateScale = useMemo(
        () => debounce(handleScale, 60), // ~16fps throttle — smooth enough, not expensive
        [handleScale]
    );

    useEffect(() => {
        updateScale();
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [updateScale]);

    // ── Body scroll lock when fullscreen ─────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isFullscreen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

    // ── Force iframe remount on new URL ──────────────────────────────────────
    useEffect(() => {
        if (proxyUrl) {
            setIframeLoading(true);
            setRenderKey(k => k + 1);
        }
    }, [proxyUrl]);

    const iframeHeight = PREVIEW_HEIGHT / scale;

    // ── Iframe element ────────────────────────────────────────────────────────
    const renderIframe = (fullscreen = false) => (
        <iframe
            key={renderKey}
            src={proxyUrl || undefined}
            onLoad={() => setIframeLoading(false)}
            onError={() => setIframeLoading(false)}
            style={fullscreen ? {
                width: '100%',
                height: '100%',
                border: 'none',
            } : {
                width: VIRTUAL_WIDTH,
                height: iframeHeight,
                border: 'none',
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
                display: 'block',
                background: 'white',
                // GPU compositing layer — avoids CPU repaint on every scale update.
                // Critical for heavy animated sites (e.g. McLaren with video backgrounds).
                willChange: 'transform',
            }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            title={fullscreen ? 'Preview Fullscreen' : 'Preview'}
        />
    );

    // ── Inner content (inside the chrome frame) ───────────────────────────────
    const renderContent = (fullscreen = false) => (
        <>
            {/* iframe loading spinner — sits above the iframe, not in AnimatePresence
                so it mounts/unmounts without triggering a full iframe re-render */}
            {iframeLoading && !loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10 pointer-events-none">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
            )}

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-20"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader className="w-6 h-6 text-blue-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="font-medium text-lg text-blue-200">Processing Theme Extraction...</p>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                            className="text-xs text-gray-500"
                        >
                            Injecting CSS... Rewriting Assets...
                        </motion.p>
                    </motion.div>

                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center z-20"
                    >
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Proxification Failed</h3>
                        <p className="text-gray-400 max-w-md">{error}</p>
                    </motion.div>

                ) : proxyUrl ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0"
                    >
                        {/* Single wrapper — contain:strict prevents iframe's internal
                            layout reflows from propagating up to the host page */}
                        <div style={{
                            width: fullscreen ? '100%' : containerWidth,
                            height: fullscreen ? '100%' : PREVIEW_HEIGHT,
                            overflow: 'hidden',
                            contain: 'strict',
                            position: 'relative',
                        }}>
                            {renderIframe(fullscreen)}
                        </div>
                    </motion.div>

                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4"
                    >
                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Monitor className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-lg font-light">Select a theme and enter a URL to begin</p>
                        <p className="text-sm text-gray-600">WebSkin will render a themed preview here</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    return (
        <>
            {/* ── Preview Card (no layout prop — avoids FLIP measurement cost) ── */}
            <motion.div
                className="w-full relative group"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {/* MacBook-style Chrome Frame */}
                <div className="rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl backdrop-blur-sm ring-1 ring-white/10">

                    {/* Browser Header Bar */}
                    <div className="bg-gray-800/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-white/5">
                        {/* Traffic lights */}
                        <div className="flex gap-2 flex-shrink-0">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>

                        {/* URL bar */}
                        <div className="flex-1 bg-black/20 rounded-lg px-3 py-1.5 text-center text-xs text-gray-400 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                            {proxyUrl ? '🔒 webskin-proxy · Themed Preview Active' : 'Waiting for input...'}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {proxyUrl && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsFullscreen(true)}
                                    title="Fullscreen Preview"
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all text-xs font-medium border border-white/10"
                                >
                                    <Maximize2 size={12} />
                                    <span>Fullscreen</span>
                                </motion.button>
                            )}
                            <div className="text-xs text-gray-600 font-mono bg-black/20 px-2 py-1 rounded border border-white/5">
                                {VIRTUAL_WIDTH}px
                            </div>
                        </div>
                    </div>

                    {/* Content Area — GPU composited via will-change so resize is cheap */}
                    <div
                        ref={containerRef}
                        className="relative w-full bg-gray-950"
                        style={{ height: PREVIEW_HEIGHT, willChange: 'contents' }}
                    >
                        {renderContent(false)}
                    </div>

                    {/* Scale indicator footer */}
                    {proxyUrl && (
                        <div className="bg-gray-800/60 border-t border-white/5 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                            <span className="font-mono">
                                Scale: {Math.round(scale * 100)}% · {VIRTUAL_WIDTH}px → {containerWidth}px
                            </span>
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                                <ExternalLink size={10} />
                                Open fullscreen
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Fullscreen Modal ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setIsFullscreen(false)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all text-xs font-medium border border-white/10"
                            >
                                <X size={14} />
                                <span>Exit Fullscreen</span>
                            </motion.button>
                        </div>

                        {/* Fullscreen iframe */}
                        <div className="flex-1 relative bg-white overflow-hidden">
                            {renderContent(true)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
