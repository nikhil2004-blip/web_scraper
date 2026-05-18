'use client';

import { useEffect, useRef } from 'react';

/**
 * CursorFX — Replaced with a subtle, theme-aware glow that follows the native cursor.
 * The standard cursor is kept intact.
 */
export default function CursorFX() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mx = -500, my = -500; // Initialize off-screen
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      // Glow instantly follows the cursor
      glow.style.left = `${mx}px`;
      glow.style.top  = `${my}px`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    document.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'var(--primary)',
        filter: 'blur(80px)',
        opacity: 0.12,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'left, top',
      }}
    />
  );
}
