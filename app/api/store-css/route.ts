import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCE: Use globalThis so the store survives Next.js hot-module reloads.
// A plain module-level `const cssStore = new Map(...)` gets wiped every time
// Next.js fast-refreshes the module during development, causing instant token
// expiry. globalThis is shared across all module instances in the same process.
// ─────────────────────────────────────────────────────────────────────────────
type CssEntry = { css: string; expires: number };

declare global {
    var __webskin_css_store: Map<string, CssEntry> | undefined;
}

if (!globalThis.__webskin_css_store) {
    globalThis.__webskin_css_store = new Map<string, CssEntry>();
}

const cssStore = globalThis.__webskin_css_store;

// TTL: 30 minutes — generous enough for any demo session without leaking memory
const TTL_MS = 30 * 60 * 1000;

function pruneExpired() {
    const now = Date.now();
    for (const [key, val] of cssStore.entries()) {
        if (val.expires < now) cssStore.delete(key);
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const css = body?.css;
    if (!css || typeof css !== 'string') {
        return NextResponse.json({ error: 'Missing or invalid css field' }, { status: 400 });
    }
    pruneExpired();
    const token = randomUUID();
    cssStore.set(token, { css, expires: Date.now() + TTL_MS });
    console.log(`[store-css] Stored token ${token.slice(0, 8)}… (store size: ${cssStore.size})`);
    return NextResponse.json({ token });
}

/** Called by the proxy GET handler to retrieve CSS by token */
export function getCssForToken(token: string): string | null {
    const entry = cssStore.get(token);
    if (!entry) {
        console.warn(`[store-css] Token not found: ${token.slice(0, 8)}…`);
        return null;
    }
    if (entry.expires < Date.now()) {
        cssStore.delete(token);
        console.warn(`[store-css] Token expired: ${token.slice(0, 8)}…`);
        return null;
    }
    return entry.css;
}
