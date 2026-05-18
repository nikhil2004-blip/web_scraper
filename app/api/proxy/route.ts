import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { isValidUrl } from '@/utils/sanitize';
import { getCssForToken } from '@/app/api/store-css/route';

// Shared logic for handling the proxy request
async function handleProxyRequest(targetUrl: string, theme: string | null, customCss: string | null, proxyOrigin: string = 'http://localhost:3000') {
    if (!isValidUrl(targetUrl)) {
        return NextResponse.json({ error: 'Invalid or restricted URL' }, { status: 400 });
    }

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 10000,
            responseType: 'text',
            maxContentLength: 5 * 1024 * 1024, // 5MB limit
        });

        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('text/html')) {
            return NextResponse.json({ error: 'Target is not an HTML page' }, { status: 400 });
        }

        const html = response.data;
        const $ = cheerio.load(html);

        // Helper to resolve URLs
        const resolveUrl = (link: string) => {
            try {
                return new URL(link, targetUrl).href;
            } catch {
                return link;
            }
        };

        // Rewrite resource attributes (src) to absolute URLs
        ['src', 'poster', 'data', 'srcset'].forEach((attr) => {
            $(`[${attr}]`).each((_, elem) => {
                const val = $(elem).attr(attr);
                if (val) {
                    if (attr === 'srcset') {
                        // Handle srcset: "url 1x, url 2x"
                        const newVal = val.split(',').map((part: string) => {
                            const [url, desc] = part.trim().split(/\s+/);
                            return `${resolveUrl(url)} ${desc || ''}`;
                        }).join(', ');
                        $(elem).attr(attr, newVal);
                    } else {
                        $(elem).attr(attr, resolveUrl(val));
                    }
                }
            });
        });

        // ── Rewrite <link> stylesheet/icon hrefs to absolute URLs (NOT proxied)
        // CRITICAL: <link rel="stylesheet"> must load from CDN directly.
        // If we proxied them they'd be rejected as non-HTML content.
        $('link[href]').each((_, elem) => {
            const val = $(elem).attr('href');
            if (val && !val.startsWith('data:')) {
                $(elem).attr('href', resolveUrl(val));
            }
        });

        // Rewrite navigation hrefs ONLY on anchor/area/form elements
        // (NOT on <link>, <meta>, <script> — those need to load from CDN)
        $('a[href], area[href]').each((_, elem) => {
            const val = $(elem).attr('href');
            if (!val) return;
            // Skip fragments, JS, mailto, tel
            if (val.startsWith('#') || val.startsWith('javascript:') || val.startsWith('mailto:') || val.startsWith('tel:')) return;

            const absoluteUrl = resolveUrl(val);

            if (customCss) {
                $(elem).attr('href', absoluteUrl);
                $(elem).attr('target', '_blank');
            } else {
                const proxyUrl = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}&theme=${theme || 'pixel'}`;
                $(elem).attr('href', proxyUrl);
            }
        });

        $('form[action]').each((_, elem) => {
            const val = $(elem).attr('action');
            if (!val || val.startsWith('#') || val.startsWith('javascript:')) return;
            $(elem).attr('action', resolveUrl(val));
        });

        // Remove existing CSP meta tags to prevent conflicts
        $('meta[http-equiv="Content-Security-Policy"]').remove();
        // Remove base tag if exists, as we are rewriting everything
        $('base').remove();
        // CRITICAL: We DO NOT remove scripts because SPAs (like Next.js App Router) 
        // require JavaScript to render ANY content. Stripping scripts leaves a black screen.
        // Instead, we inject a script to fake the window location so the SPA router 
        // doesn't crash because the proxy URL is /api/proxy?...
        const urlObj = new URL(targetUrl);
        
        const routerFixScript = `
<script id="webskin-router-fix">
(function() {
  console.log('webskin: router fix initializing');
  const targetOrigin = '${urlObj.origin}';
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  function rewriteUrl(url) {
    if (!url) return url;
    try {
      // Resolve the URL relative to the document's baseURI
      const resolved = new URL(url, document.baseURI);
      // If it belongs to the target site, swap its origin to the actual local proxy origin
      if (resolved.origin === targetOrigin || resolved.href.startsWith(targetOrigin)) {
        resolved.protocol = window.location.protocol;
        resolved.host = window.location.host;
      }
      return resolved.toString();
    } catch (e) {
      console.warn('webskin: rewriteUrl failed for', url, e);
      // Return a safe same-origin URL so we don't crash the browser
      return window.location.href;
    }
  }

  window.history.pushState = function(state, title, url) {
    try {
      const newUrl = rewriteUrl(url);
      console.log('webskin: pushState intercepted, rewriting', url, 'to', newUrl);
      return originalPushState.apply(this, [state, title, newUrl]);
    } catch (e) {
      console.warn('webskin: pushState error caught:', e);
      return originalPushState.apply(this, [state, title, window.location.href]);
    }
  };

  window.history.replaceState = function(state, title, url) {
    try {
      const newUrl = rewriteUrl(url);
      console.log('webskin: replaceState intercepted, rewriting', url, 'to', newUrl);
      return originalReplaceState.apply(this, [state, title, newUrl]);
    } catch (e) {
      console.warn('webskin: replaceState error caught:', e);
      return originalReplaceState.apply(this, [state, title, window.location.href]);
    }
  };

  // Also patch the prototypes just in case
  if (typeof History !== 'undefined') {
    History.prototype.pushState = window.history.pushState;
    History.prototype.replaceState = window.history.replaceState;
  }

  try {
    // Fake the URL to match the target site pathname/search so SPA router doesn't crash on load
    const initialUrl = rewriteUrl('${urlObj.pathname}${urlObj.search}');
    console.log('webskin: setting initial URL to', initialUrl);
    originalReplaceState.apply(window.history, [null, '', initialUrl]);
  } catch (e) {
    console.error('webskin: initial replaceState failed:', e);
  }
})();
</script>`;
        $('head').prepend(routerFixScript);
        
        // Add a base tag to ensure relative fetch() and XHR requests go to the target site,
        // preventing 404s when the SPA tries to load data chunks (like Next.js /_next/data).
        $('head').prepend(`<base href="${urlObj.origin}/">`);
        // Inject Fonts — use ABSOLUTE URL so the <base href> tag above doesn't redirect to the target site
        const fontsLink = `<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&family=Inter:wght@300;400;700&family=VT323&family=Silkscreen&family=Outfit:wght@300;400;700&display=swap" rel="stylesheet">`;
        $('head').append(fontsLink);

        // ── WebSkin Layout Normalizer ──────────────────────────────────────────
        // Injected FIRST (before theme CSS) so theme can override intentionally.
        // SAFE rules only — do NOT touch SVG dimensions, flexbox, or grid.
        const normalizerCss = `
<style id="webskin-normalizer">
/* 1. Box-model reset — prevents sizing surprises across elements */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 2. Body: strip browser default margin/padding */
html, body {
  margin: 0;
  padding: 0;
}

/* 3. Images only (not SVG!) — prevent overflow, keep aspect ratio */
img {
  max-width: 100%;
  height: auto;
}

/* 4. Prevent horizontal overflow at the page level */
body {
  overflow-x: hidden;
}

/* 5. Remove focus outlines only when using mouse (not keyboard) */
:focus:not(:focus-visible) {
  outline: none;
}
</style>`;
        $('head').prepend(normalizerCss);

        // Inject Theme
        if (customCss) {
            // Extract @import rules from the AI CSS and convert to <link> tags.
            // @import inside injected <style> tags can be blocked by CSP; <link> tags always work.
            let processedCss = customCss;
            const importRegex = /@import\s+url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)\s*;?/gi;
            let match;
            while ((match = importRegex.exec(customCss)) !== null) {
                const fontUrl = match[1];
                $('head').append(`<link rel="stylesheet" href="${fontUrl}">`);
                processedCss = processedCss.replace(match[0], '');
            }
            // Inject the remaining CSS (without @imports) as a style tag
            const styleTag = `<style id="webskin-ai-theme">${processedCss.trim()}</style>`;
            $('head').append(styleTag);
        } else {
            // Inject Standard Theme Link
            // CRITICAL: Use absolute URL (proxyOrigin) so the <base href> pointing to the
            // target site does NOT redirect /themes/*.css away from our localhost server.
            const themeToUse = theme || 'pixel';
            const themeLink = `<link rel="stylesheet" href="${proxyOrigin}/themes/${themeToUse}.css" id="webskin-theme">`;
            $('head').append(themeLink);
        }

        return new NextResponse($.html(), {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'X-Frame-Options': 'SAMEORIGIN',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Proxy error:', (error as Error).message);
        return NextResponse.json({ error: 'Failed to fetch target URL' }, { status: 502 });
    }
}

// Helper to get the proxy's own origin from the request
function getProxyOrigin(request: NextRequest): string {
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
}

import { rateLimit, getClientIP } from '../rate-limit';

// POST Handler (Used for AI Themes + Standard)
export async function POST(request: NextRequest) {
    // Apply rate limit
    const clientIP = getClientIP(request);
    const { success, retryAfter } = rateLimit(clientIP, 60, 60_000);
    
    if (!success) {
        return NextResponse.json(
            { error: `Rate limit exceeded. Try again in ${retryAfter}s.` },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    try {
        const body = await request.json();
        console.log('📥 POST /api/proxy received:', JSON.stringify(body, null, 2));

        const { url, theme, customCss } = body;

        if (!url) {
            console.error('❌ Missing URL in request body');
            return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
        }

        console.log('✅ Proxying:', url, 'Theme:', theme || 'none', 'CustomCSS:', customCss ? 'YES' : 'NO');
        return handleProxyRequest(url, theme, customCss, getProxyOrigin(request));
    } catch (e) {
        console.error('❌ POST /api/proxy error:', (e as Error).message);
        return NextResponse.json({ error: 'Invalid request body: ' + (e as Error).message }, { status: 400 });
    }
}

// GET Handler (Used for all iframe src= requests, including AI themes via cssToken)
export async function GET(request: NextRequest) {
    // Apply rate limit
    const clientIP = getClientIP(request);
    const { success, retryAfter } = rateLimit(clientIP, 60, 60_000);
    
    if (!success) {
        return NextResponse.json(
            { error: `Rate limit exceeded. Try again in ${retryAfter}s.` },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const theme = searchParams.get('theme');
    const cssToken = searchParams.get('cssToken');

    if (!url) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // Retrieve AI CSS from token store if provided
    let customCss: string | null = null;
    if (cssToken) {
        customCss = getCssForToken(cssToken);
        if (!customCss) {
            return NextResponse.json({ error: 'CSS token expired or invalid' }, { status: 400 });
        }
    }

    return handleProxyRequest(url, theme, customCss, getProxyOrigin(request));
}
