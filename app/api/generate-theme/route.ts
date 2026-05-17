import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
    let body: { prompt?: string };
    let userPrompt: string = '';

    try {
        body = await request.json();
        userPrompt = body.prompt || '';

        if (!userPrompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.warn('⚠️ No GROQ_API_KEY found. Using Mock AI logic.');
            return generateMockTheme(userPrompt);
        }

        const groq = new Groq({ apiKey });

        // THE ULTIMATE PROMPT - Engineered for perfection
        const fullPrompt = `
You are a world-class CSS artisan. Generate a BREATHTAKING CSS theme that visually transforms any webpage.

═══════════════════════════════════════════
OUTPUT RULES (NON-NEGOTIABLE)
═══════════════════════════════════════════
1. Return ONLY raw CSS. Zero markdown. Zero explanations. Zero backticks.
2. Every property that overrides site defaults MUST use !important.
3. Self-contained — pure CSS only, no JS.
4. Start with @import for a Google Font matching the vibe.

═══════════════════════════════════════════
🚫 ABSOLUTELY FORBIDDEN — DO NOT DO THESE
═══════════════════════════════════════════
NEVER apply border, padding, margin, background, or border-radius to:
  - div, section, article, main, aside, nav, header, footer, span
  - Any structural layout container or generic wrapper
  WHY: Real websites use flex/grid inside these. Adding border/padding/margin
  explodes the layout into a broken mess of nested boxes with visible boundaries.
  This is the #1 way to destroy a real website's layout. DO NOT DO IT.

NEVER override: display, position, flex, grid, width, height, float, overflow on containers.
NEVER use [role="button"] as a selector (matches too many divs).
NEVER add content: to ::before/::after on div, section, nav, header, footer.
NEVER set font-size larger than 20px on body/p (breaks layouts).
NEVER force colors on generic 'span' tags with !important. Leave inline/specific colors of spans intact so badges and icons don't get unformatted.

═══════════════════════════════════════════
SAFE SELECTORS — STYLE ONLY THESE
═══════════════════════════════════════════
✅ FOUNDATION
  :root { CSS custom properties for theme tokens }
  html, body { background (gradient/pattern), color, font-family, line-height }
  ::selection, ::-webkit-scrollbar, ::-webkit-scrollbar-thumb

✅ TYPOGRAPHY (safe — text-only changes, no layout impact)
  h1, h2, h3, h4, h5, h6 { color, font-family, text-shadow, letter-spacing, text-transform }
  p, li, td, th, strong, em, code, pre { color, font, text-shadow }
  blockquote { left-border accent, italic, background — OK here since it's a content element }

✅ INTERACTIVE (buttons, links — safe to fully style)
  a, a:hover, a:visited
  button, button:hover, button:active
  input[type="submit"], input[type="button"], input[type="reset"]

✅ FORM ELEMENTS (colors/backgrounds only, do NOT override layout properties like padding with !important)
  input[type="text"], input[type="email"], input[type="password"],
  input[type="search"], input[type="number"], textarea, select
  input:focus, textarea:focus, select:focus
  input::placeholder, label

✅ DATA & MEDIA
  table, thead, th, td, tr, tr:hover, tr:nth-child(even)
  img { border, border-radius, box-shadow, filter — OK, images are standalone }
  video { border, border-radius }
  code, pre { background, border, font-family, color, padding }

✅ SEMANTIC CARD CLASSES (safe — site explicitly uses these as cards)
  .card, .box, .widget, .badge, .tag, .pill, .chip
  .modal, [role="dialog"], .tooltip, .popover, .dropdown-menu
  .alert, .notification, .toast, .banner

✅ ANIMATIONS
  At least 2 keyframe animations for text/buttons/body effects
  Apply to: h1 (glow pulse), body background, links/buttons (shimmer/lift)

═══════════════════════════════════════════
STRUCTURAL CODE EXAMPLE (GOLD STANDARD)
═══════════════════════════════════════════
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700&display=swap');

:root {
  --neon-bg: #0d0e15;
  --neon-accent: #bc34fa;
  --neon-accent-rgb: 188, 52, 250;
  --neon-accent-cyan: #00f3ff;
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
}

html, body {
  background: 
    radial-gradient(circle at 10% 20%, rgba(var(--neon-accent-rgb), 0.15) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(0, 243, 255, 0.1) 0%, transparent 40%),
    #0d0e15 !important;
  background-attachment: fixed !important;
  color: var(--text-main) !important;
  font-family: 'Outfit', sans-serif !important;
}

h1, h2, h3, h4, h5, h6 {
  color: #fff !important;
  font-family: 'Outfit', sans-serif !important;
  text-shadow: 0 0 15px rgba(var(--neon-accent-rgb), 0.6) !important;
}

p, li, td, th {
  color: var(--text-muted) !important;
}

a {
  color: var(--neon-accent-cyan) !important;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.4) !important;
  transition: all 0.3s ease !important;
}

a:hover {
  color: #fff !important;
  text-shadow: 0 0 15px rgba(0, 243, 255, 0.8) !important;
}

button, input[type="submit"] {
  background: linear-gradient(135deg, var(--neon-accent), #7928ca) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(var(--neon-accent-rgb), 0.4) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

button:hover, input[type="submit"]:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(var(--neon-accent-rgb), 0.6) !important;
}

input:not([type="submit"]):not([type="button"]), textarea, select {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
  border: 1px solid rgba(var(--neon-accent-rgb), 0.3) !important;
  border-radius: 6px !important;
  outline: none !important;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--neon-accent-cyan) !important;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.3) !important;
}

.card, .box, .widget {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(var(--neon-accent-rgb), 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

═══════════════════════════════════════════
USER'S THEME REQUEST
═══════════════════════════════════════════
Vibe/Description: "${userPrompt}"

Generate the most SPECTACULAR, layout-safe CSS theme possible for this vibe.
Remember: Beautiful + Non-destructive to site layout. GO ALL OUT on colors, typography, effects.
But NEVER touch structural containers (div, section, nav, header, footer, aside, main, span).
`;

        console.log('🤖 Sending optimized prompt to Groq with model fallback cascade...');
        let completion;
        try {
            completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: fullPrompt }],
                max_tokens: 2500,
                temperature: 0.5,
            });
        } catch (groqError) {
            console.warn('⚠️ Primary model llama-3.3-70b-versatile failed:', (groqError as Error).message);
            console.log('🔄 Attempting fallback to llama-3.1-8b-instant...');
            try {
                completion = await groq.chat.completions.create({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: fullPrompt }],
                    max_tokens: 2500,
                    temperature: 0.5,
                });
            } catch (fallbackError) {
                console.error('❌ Fallback model llama-3.1-8b-instant also failed:', (fallbackError as Error).message);
                throw fallbackError; // Trigger fallback to generateMockTheme
            }
        }

        let css = completion.choices[0]?.message?.content || '';

        // Aggressive cleanup
        css = css.replace(/```css/gi, '').replace(/```/g, '').trim();

        // Remove any explanatory text before the first @import or CSS rule
        const firstCssIndex = css.search(/(@import|\/\*|\*\s*{|body\s*{|:root)/i);
        if (firstCssIndex > 0) {
            css = css.substring(firstCssIndex);
        }

        // Trim trailing explanation text after the final closing brace
        const lastBraceIndex = css.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            css = css.substring(0, lastBraceIndex + 1);
        }

        console.log('✅ Generated CSS length:', css.length);
        return NextResponse.json({ css });

    } catch (error) {
        console.error('AI theme generation failed:', (error as Error).message);
        console.warn('⚠️ Quota exceeded or API error — falling back to Mock theme');
        return generateMockTheme(userPrompt || 'default theme');
    }
}

// Highly Refined Layout-Safe Fallback Mock Theme
function generateMockTheme(prompt: string) {
    let baseColor = '#ffffff';
    let bgColor = '#0f172a';
    let accentColor = '#3b82f6';
    let vibe = 'modern';
    const p = prompt.toLowerCase();

    if (p.includes('red') || p.includes('fire') || p.includes('hot')) {
        accentColor = '#ef4444'; bgColor = '#1a0a0a'; baseColor = '#fef2f2'; vibe = 'intense';
    } else if (p.includes('blue') || p.includes('ocean') || p.includes('water')) {
        accentColor = '#3b82f6'; bgColor = '#0c1e3a'; baseColor = '#eff6ff'; vibe = 'calm';
    } else if (p.includes('pink') || p.includes('cute') || p.includes('pastel')) {
        accentColor = '#ec4899'; bgColor = '#2d1b2e'; baseColor = '#fdf2f8'; vibe = 'playful';
    } else if (p.includes('green') || p.includes('nature') || p.includes('forest')) {
        accentColor = '#22c55e'; bgColor = '#0a1f0a'; baseColor = '#f0fdf4'; vibe = 'natural';
    } else if (p.includes('purple') || p.includes('royal') || p.includes('luxury')) {
        accentColor = '#a855f7'; bgColor = '#1e1034'; baseColor = '#faf5ff'; vibe = 'elegant';
    } else if (p.includes('yellow') || p.includes('gold') || p.includes('sun')) {
        accentColor = '#eab308'; bgColor = '#1a1410'; baseColor = '#fefce8'; vibe = 'vibrant';
    } else if (p.includes('neon') || p.includes('cyber') || p.includes('dark')) {
        accentColor = '#a855f7'; bgColor = '#050508'; baseColor = '#e2e8f0'; vibe = 'cyberpunk';
    }

    const css = `
/* 🎨 AI Generated Theme - ${vibe.toUpperCase()} */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root {
  --theme-bg: ${bgColor};
  --theme-accent: ${accentColor};
  --theme-text: ${baseColor};
}

html, body {
  background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 50%, ${bgColor}bb 100%) !important;
  color: ${baseColor} !important;
  font-family: 'Inter', sans-serif !important;
  line-height: 1.6 !important;
}

body {
  background-image:
    radial-gradient(ellipse at top left, ${accentColor}22 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, ${accentColor}11 0%, transparent 50%) !important;
  background-attachment: fixed !important;
  margin: 0 !important;
}

h1, h2, h3 {
  color: ${accentColor} !important;
  font-weight: 700 !important;
  text-shadow: 0 0 20px ${accentColor}44 !important;
}

h4, h5, h6 {
  color: ${accentColor}cc !important;
  font-weight: 600 !important;
}

/* Safe typography color changes without !important or span styling */
p, li, td, th {
  color: ${baseColor}cc;
}

a, a:visited {
  color: ${accentColor} !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
}

a:hover {
  color: #fff !important;
  text-shadow: 0 0 12px ${accentColor}aa !important;
}

button,
input[type="submit"],
input[type="button"],
input[type="reset"] {
  background: linear-gradient(135deg, ${accentColor}, ${accentColor}bb) !important;
  color: #fff !important;
  border: 1px solid ${accentColor}88 !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px ${accentColor}50 !important;
  filter: brightness(1.15) !important;
}

input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),
textarea, select {
  background: rgba(255, 255, 255, 0.05) !important;
  color: ${baseColor} !important;
  border: 1px solid ${accentColor}44 !important;
  border-radius: 4px !important;
  outline: none !important;
}

input:focus, textarea:focus, select:focus {
  border-color: ${accentColor} !important;
  box-shadow: 0 0 0 3px ${accentColor}22 !important;
}

table { border-collapse: collapse !important; width: 100% !important; }
th, td { border: 1px solid rgba(255,255,255,0.08) !important; }
th { color: ${accentColor} !important; font-weight: 600 !important; }
tr:hover { background: rgba(255,255,255,0.04) !important; }

img {
  border-radius: 6px !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3) !important;
  filter: brightness(0.95) !important;
}

.card, .box, .widget, [role="dialog"] {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid ${accentColor}33 !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
}

::-webkit-scrollbar { width: 8px !important; background: ${bgColor} !important; }
::-webkit-scrollbar-thumb { background: ${accentColor}66 !important; border-radius: 4px !important; }
::-webkit-scrollbar-thumb:hover { background: ${accentColor} !important; }

::selection { background: ${accentColor}66 !important; color: #fff !important; }

@keyframes accentGlow {
  0%, 100% { text-shadow: 0 0 10px ${accentColor}44; }
  50% { text-shadow: 0 0 25px ${accentColor}88, 0 0 40px ${accentColor}33; }
}

h1 { animation: accentGlow 3s ease-in-out infinite !important; }
`;

    return NextResponse.json({ css });
}
