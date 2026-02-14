import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { isValidUrl } from '@/utils/sanitize';

// Shared logic for handling the proxy request
async function handleProxyRequest(targetUrl: string, theme: string | null, customCss: string | null) {
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

        // Rewrite navigation attributes
        ['href', 'action'].forEach((attr) => {
            $(`[${attr}]`).each((_, elem) => {
                const val = $(elem).attr(attr);
                if (val) {
                    // Skip anchors, javascript:, mailto:, tel:
                    if (val.startsWith('#') || val.startsWith('javascript:') || val.startsWith('mailto:') || val.startsWith('tel:')) {
                        return;
                    }

                    const absoluteUrl = resolveUrl(val);

                    if (customCss) {
                        // If AI theme (custom CSS) is active, we can't easily proxy purely via GET url params
                        // without encoding the massive CSS string in the URL (which hits limits).
                        // So we disable proxy navigation for AI themes to prevent "breaking" the illusion.
                        // We rewrite to absolute URL and open in new tab.
                        $(elem).attr(attr, absoluteUrl);
                        $(elem).attr('target', '_blank');
                    } else {
                        // Standard Themes: Rewrite to go through proxy
                        const proxyUrl = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}&theme=${theme || 'pixel'}`;
                        $(elem).attr(attr, proxyUrl);
                    }
                }
            });
        });

        // Remove existing CSP meta tags to prevent conflicts
        $('meta[http-equiv="Content-Security-Policy"]').remove();
        // Remove base tag if exists, as we are rewriting everything
        $('base').remove();

        // Inject Fonts
        const fontsLink = `<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&family=Inter:wght@300;400;700&family=VT323&family=Silkscreen&family=Outfit:wght@300;400;700&display=swap" rel="stylesheet">`;
        $('head').append(fontsLink);

        // Inject Theme
        if (customCss) {
            // Inject AI Generated CSS directly
            const styleTag = `<style id="webskin-ai-theme">${customCss}</style>`;
            $('head').append(styleTag);
        } else {
            // Inject Standard Theme Link
            const themeToUse = theme || 'pixel';
            const themeLink = `<link rel="stylesheet" href="/themes/${themeToUse}.css" id="webskin-theme">`;
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

    } catch (error: any) {
        console.error('Proxy error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch target URL' }, { status: 502 });
    }
}

// POST Handler (Used for AI Themes + Standard)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('📥 POST /api/proxy received:', JSON.stringify(body, null, 2));

        const { url, theme, customCss } = body;

        if (!url) {
            console.error('❌ Missing URL in request body');
            return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
        }

        console.log('✅ Proxying:', url, 'Theme:', theme || 'none', 'CustomCSS:', customCss ? 'YES' : 'NO');
        return handleProxyRequest(url, theme, customCss);
    } catch (e: any) {
        console.error('❌ POST /api/proxy error:', e.message);
        return NextResponse.json({ error: 'Invalid request body: ' + e.message }, { status: 400 });
    }
}

// GET Handler (Used for Navigation links in Standard Themes)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const theme = searchParams.get('theme');

    if (!url) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    return handleProxyRequest(url, theme, null);
}
