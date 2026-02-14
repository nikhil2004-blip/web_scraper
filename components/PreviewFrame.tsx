'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader } from 'lucide-react';

interface PreviewFrameProps {
    htmlContent: string | null;
    loading: boolean;
    error: string | null;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ htmlContent, loading, error }) => {
    return (
        <motion.div
            layout
            className="w-full relative group"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            {/* MacBook-ish Frame */}
            <div className="rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl backdrop-blur-sm ring-1 ring-white/10">

                {/* Browser Header */}
                <div className="bg-gray-800/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-white/5">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 bg-black/20 rounded-lg p-2 text-center text-xs text-gray-400 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                        {htmlContent ? 'Local Proxy Active' : 'Waiting for input...'}
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative w-full h-[700px] bg-gray-900/50">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
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
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Proxification Failed</h3>
                                <p className="text-gray-400 max-w-md">{error}</p>
                            </motion.div>
                        ) : htmlContent ? (
                            <motion.iframe
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                srcDoc={htmlContent}
                                className="w-full h-full border-0 bg-white"
                                sandbox="allow-same-origin allow-scripts allow-forms"
                                title="Preview"
                            />
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4"
                            >
                                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <span className="text-4xl">✨</span>
                                </div>
                                <p className="text-lg font-light">Select a theme and enter a URL to begin</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
