'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader, Maximize2, X, Monitor, ExternalLink } from 'lucide-react';

interface PreviewFrameProps {
    proxyUrl: string | null;
    loading: boolean;
    error: string | null;
    isFullscreen?: boolean;
    onEnterFullscreen?: () => void;
}

// The "desktop" width the iframe always renders at internally.
// We scale it DOWN visually — the iframe itself never changes size.
const VIRTUAL_WIDTH = 1280;

// ─── Debounce helper ─────────────────────────────────────────────────────────
function debounce<Args extends unknown[]>(fn: (...args: Args) => void, ms: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
    proxyUrl,
    loading,
    error,
    isFullscreen = false,
    onEnterFullscreen,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track WIDTH for scale, HEIGHT for iframe fill ratio.
    // They are independent: scale only depends on width, iframeHeight only on height.
    const prevWidthRef = useRef<number>(0);
    const [scale, setScale] = useState(1);
    const [containerH, setContainerH] = useState(600); // px, updated by ResizeObserver
    const [iframeLoading, setIframeLoading] = useState(false);
    const [renderKey, setRenderKey] = useState(0);

    // ── Scale + height tracking ────────────────────────────────────────────────
    // We use offsetWidth (integer px) to prevent sub-pixel float jitter.
    // containerH is tracked via state so the iframe height re-renders to fill
    // the container exactly. The iframe is inside overflow:hidden so its
    // height can never affect the container's measured offsetHeight — no loop.
    const handleResize = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        // Update height always (no loop risk — iframe is clipped by overflow:hidden)
        if (h > 0) setContainerH(h);
        // Update scale only when width actually changes (integer guard)
        if (w === prevWidthRef.current || w === 0) return;
        prevWidthRef.current = w;
        setScale(Math.round((w / VIRTUAL_WIDTH) * 10000) / 10000);
    }, []);

    const debouncedResize = useMemo(() => debounce(handleResize, 80), [handleResize]);

    useEffect(() => {
        handleResize(); // immediate on mount
        const observer = new ResizeObserver(debouncedResize);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [debouncedResize, handleResize]);

    // ── Force iframe remount on new URL only ──────────────────────────────────
    useEffect(() => {
        if (proxyUrl) {
            setIframeLoading(true);
            setRenderKey(k => k + 1);
        }
    }, [proxyUrl]);

    // Iframe always renders at VIRTUAL_WIDTH wide.
    // Height is computed so visual height == container height:
    //   iframeH * scale = containerH  →  iframeH = containerH / scale
    const iframeH = Math.round(containerH / scale);

    return (
        <div className="w-full h-full flex flex-col">
            {/* MacBook-style Chrome Frame */}
            <div className="rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl ring-1 ring-white/10 flex flex-col h-full">

                {/* Browser Header Bar */}
                <div className="bg-gray-800/80 px-4 py-3 flex items-center gap-4 border-b border-white/5 flex-shrink-0">
                    <div className="flex gap-2 flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>

                    <div className="flex-1 bg-black/20 rounded-lg px-3 py-1.5 text-center text-xs text-gray-400 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                        {proxyUrl ? '🔒 webskin-proxy · Themed Preview Active' : 'Waiting for input...'}
                    </div>

                    {proxyUrl && onEnterFullscreen && (
                        <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                            onClick={onEnterFullscreen}
                            title="Fullscreen Preview (F)"
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

                {/* ── Content Area ─────────────────────────────────────────────
                    Use flex:1 so the container fills available space naturally.
                    Do NOT compute height from scale — that feeds back into
                    ResizeObserver (height change → observer → scale recalc →
                    height change → loop = jitter).
                    overflow:hidden clips the scaled iframe cleanly. */}
                <div
                    ref={containerRef}
                    className="relative bg-gray-950"
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        minHeight: 0, // Required: tells flexbox it CAN shrink
                    }}
                >
                    {/* Loading spinner overlay */}
                    {iframeLoading && !loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10 pointer-events-none">
                            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    )}

                    {/* State overlays — only animate on state CHANGE, not scale change */}
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-20 bg-gray-950">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader className="w-6 h-6 text-blue-500 animate-pulse" />
                                </div>
                            </div>
                            <p className="font-medium text-lg text-blue-200">Processing Theme Extraction...</p>
                            <p className="text-xs text-gray-500 mt-1">Injecting CSS... Rewriting Assets...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center z-20">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Proxification Failed</h3>
                            <p className="text-gray-400 max-w-md">{error}</p>
                        </div>
                    )}

                    {!loading && !error && !proxyUrl && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Monitor className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-lg font-light">Select a theme and enter a URL to begin</p>
                        </div>
                    )}

                    {/* ── Iframe ────────────────────────────────────────────────
                        The iframe is ALWAYS VIRTUAL_WIDTH × VIRTUAL_HEIGHT px.
                        We CSS-transform it to fit the container.
                        It NEVER changes size — only the scale changes.
                        This is the only pattern that prevents ResizeObserver loops. */}
                    {!loading && !error && proxyUrl && (
                        <iframe
                            key={renderKey}
                            src={proxyUrl}
                            onLoad={() => setIframeLoading(false)}
                            onError={() => setIframeLoading(false)}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: VIRTUAL_WIDTH,
                                // iframeH = containerH / scale ensures:
                                //   visual height = iframeH × scale = containerH
                                // → iframe fills container exactly, no gray gap,
                                //   no ratio mismatch, no bounce.
                                height: iframeH,
                                border: 'none',
                                transformOrigin: 'top left',
                                transform: `scale(${scale})`,
                                willChange: 'transform',
                            }}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                            title="WebSkin Preview"
                        />
                    )}
                </div>

                {/* Scale indicator footer — always visible when a URL is loaded.
                    Conditional rendering would change the content area height
                    when proxyUrl appears, shifting the iframe = visible bounce. */}
                <div className="bg-gray-800/60 border-t border-white/5 px-4 py-2 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
                    <span className="font-mono">
                        {proxyUrl ? `Scale: ${Math.round(scale * 100)}% · ${VIRTUAL_WIDTH}×${iframeH}` : 'No preview loaded'}
                    </span>
                    {proxyUrl && onEnterFullscreen && (
                        <button
                            onClick={onEnterFullscreen}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                            <ExternalLink size={10} />
                            Open fullscreen
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
