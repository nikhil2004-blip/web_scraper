import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
    let body: any;
    let userPrompt: string = '';

    try {
        body = await request.json();
        userPrompt = body.prompt;

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
        // ============================================================
        // 🎨 ULTIMATE CSS THEME GENERATION PROMPT
        // Drop this into your route.ts to replace the fullPrompt const
        // ============================================================

        const fullPrompt = `
You are a world-class creative director and CSS artisan. Your job is to generate a BREATHTAKING, 
publication-quality CSS theme that completely transforms any webpage into a visually unforgettable experience.

MINDSET: You are NOT writing utility CSS. You are painting a canvas. Every selector is a brushstroke.
Think: "What would a AAA game UI artist, a luxury brand designer, and a cyberpunk art director 
create together if they only had CSS?"

═══════════════════════════════════════════
OUTPUT RULES (NON-NEGOTIABLE)
═══════════════════════════════════════════
1. Return ONLY raw CSS. Zero markdown. Zero explanations. Zero backticks. Just CSS.
2. EVERY single property MUST end with !important — no exceptions.
3. The theme must be SELF-CONTAINED — all effects via pure CSS only.
4. Start with @import for a Google Font that perfectly embodies the vibe.
5. Minimum 80 CSS rules. A thin theme is a failed theme.

═══════════════════════════════════════════
DESIGN PHILOSOPHY
═══════════════════════════════════════════
Before generating, internalize the user's vibe and ask:
- What EMOTION should someone feel when they see this page? (awe? nostalgia? danger? luxury?)
- What WORLD does this theme belong to? (deep ocean? neon city? enchanted forest? ancient temple?)
- What makes this theme UNFORGETTABLE vs forgettable?

Then execute with FULL COMMITMENT. No timid half-measures.

═══════════════════════════════════════════
MANDATORY SELECTORS CHECKLIST
═══════════════════════════════════════════
Every theme MUST include ALL of these:

[ FOUNDATION ]
  * { box-sizing, transition }
  body { background (use gradients/mesh/pattern NOT flat color), color, font-family, line-height, min-height, cursor }
  ::selection { background, color }
  ::-webkit-scrollbar { width, background }
  ::-webkit-scrollbar-thumb { background, border-radius, border }
  ::-webkit-scrollbar-track { background }

[ LAYOUT CONTAINERS ]
  html, body wrapper
  div, section, article, main { semi-transparent backgrounds, themed borders, border-radius, padding, box-shadow }
  header { distinct styling, border-bottom, backdrop-filter blur effect }
  footer { distinct styling, border-top }
  nav { styling, gap, flex or inline display }
  aside { side-panel styling }

[ TYPOGRAPHY ]
  h1 { massive impact — large text-shadow glow, gradient text via background-clip, letter-spacing, text-transform }
  h2, h3 { strong accent color, border-bottom with glow }
  h4, h5, h6 { subtle accent, italic or small-caps }
  p { readable line-height, slight text-shadow for depth }
  span, li, td, th { themed color }
  strong, b { accent color, text-shadow }
  em, i { different accent tone, font-style }
  code, pre { monospace font, themed background, border, padding }
  blockquote { left border glow, italic, background, padding }

[ INTERACTIVE ELEMENTS ]
  a { color, background pill, padding, border, no underline, transition }
  a:hover { full accent background, contrasting text, glow box-shadow, transform translateY(-2px) }
  a:visited { slightly muted version }
  
  button, input[type="submit"], input[type="button"] {
    gradient background, themed color, styled border, padding, 
    border-radius, font-weight bold, text-transform uppercase,
    letter-spacing, cursor pointer, transition all
  }
  button:hover { translateY(-4px), dramatic box-shadow glow, brightness(1.3) }
  button:active { translateY(0), scale(0.98) }

[ FORM ELEMENTS ]
  input[type="text"], input[type="email"], input[type="password"], 
  input[type="search"], input[type="number"], textarea, select {
    themed background (darker), themed color, styled border, 
    padding, border-radius, font-family inherit
  }
  input:focus, textarea:focus, select:focus {
    border-color accent, box-shadow glow, outline none, 
    background slightly lighter
  }
  input::placeholder { themed muted color }
  label { accent color, font-weight, letter-spacing }
  
  input[type="checkbox"], input[type="radio"] { accent-color: themed }

[ DATA DISPLAY ]
  table { border-collapse collapse, width 100%, box-shadow }
  thead { themed gradient background }
  th { accent color, text-transform uppercase, letter-spacing, padding, border }
  td { themed color, padding, border, background rgba }
  tr:hover { background highlight }
  tr:nth-child(even) { slightly different background }

[ MEDIA & VISUAL ]
  img { themed border, border-radius, box-shadow, filter (subtle hue-rotate or brightness) }
  img:hover { filter brightness(1.1), box-shadow glow, transform scale(1.02) }
  video, iframe, canvas { themed border, border-radius, box-shadow }
  figure, figcaption { themed styling }

[ LISTS ]
  ul, ol { padding-left, color }
  li { padding, border-bottom subtle, color }
  li::marker { color accent }
  ul li::before { themed custom bullet via content }

[ UTILITY & MISC ]
  hr { border: themed gradient line, height, margin }
  .card, .container, .wrapper, .box { themed card styling with glow }
  .badge, .tag, .pill { accent background, styled, border-radius full }
  .modal, .dialog, .popup, .overlay { dark themed, backdrop-blur }
  .tooltip { themed background, border, shadow }
  .alert, .notification, .toast { themed with left border accent }
  .navbar, .sidebar, .panel { distinct themed styling }
  
[ ANIMATIONS — include at least 3 keyframe animations ]
  @keyframes themeGlow { pulsing box-shadow/text-shadow }
  @keyframes themeFadeIn { opacity 0 to 1 with translateY }
  @keyframes themeShimmer { background-position shift for shimmer effect }
  Apply animations to: h1 (glow pulse), body links/buttons (shimmer), 
  containers on load (fadeIn)

[ PSEUDO-ELEMENTS for extra flair ]
  h1::after or h1::before { decorative line, glow bar, or icon }
  section::before { subtle background pattern or gradient overlay }
  button::after { ripple or shine sweep effect }

═══════════════════════════════════════════
COLOR STRATEGY
═══════════════════════════════════════════
- Pick ONE dominant background tone (dark, light, or midtone)
- Pick ONE primary accent (the "hero" color — vivid, saturated)  
- Pick ONE secondary accent (complementary or analogous)
- Pick ONE highlight/glow color (often lighter/brighter version of accent)
- Use rgba() extensively for layered transparency depth
- Body background: NEVER a flat color. Use:
  → multi-stop linear-gradient
  → radial-gradient focal points  
  → repeating-linear-gradient for patterns
  → layered background with multiple background-image values

═══════════════════════════════════════════
TYPOGRAPHY RULES
═══════════════════════════════════════════
- Choose a Google Font that feels NATIVE to the theme world
- NEVER use: Inter, Roboto, Arial, system-ui, sans-serif alone
- Good choices by vibe:
  → Sci-fi/Tech: "Orbitron", "Exo 2", "Rajdhani", "Share Tech Mono"
  → Horror/Dark: "Creepster", "Nosifer", "Syne Mono"  
  → Luxury/Elegant: "Cormorant Garamond", "Playfair Display", "Libre Baskerville"
  → Retro/80s: "Press Start 2P", "VT323", "Boogaloo", "Permanent Marker"
  → Nature/Organic: "Lora", "Merriweather", "Libre Caslon Text"
  → Cyberpunk/Neon: "Audiowide", "Syncopate", "Michroma"
  → Fantasy/Magic: "Cinzel", "MedievalSharp", "Almendra"
  → Brutal/Raw: "Anton", "Bebas Neue", "Black Han Sans"

═══════════════════════════════════════════
EFFECTS MASTERY
═══════════════════════════════════════════
Use these CSS techniques liberally:
- text-shadow: layered multiple shadows for depth + glow
- box-shadow: inset + outset + colored glow combinations
- backdrop-filter: blur() for frosted glass on overlays
- filter: on images, use hue-rotate() to theme them
- background-clip: text for gradient text on headings
- -webkit-background-clip: text + color: transparent for gradient text
- mix-blend-mode: for interesting overlay effects
- transform + transition: on ALL interactive elements
- CSS custom properties (--vars): define theme tokens at :root

═══════════════════════════════════════════
USER'S THEME REQUEST
═══════════════════════════════════════════
Vibe/Description: "${userPrompt}"

Now generate the most SPECTACULAR, COMPLETE CSS theme possible for this vibe. 
Make it so good that someone would pay for it.
Every line should serve the aesthetic vision. GO ALL OUT.
`;

        console.log('🤖 Sending optimized prompt to Groq...');
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: fullPrompt }],
            max_tokens: 2500,
            temperature: 0.5, // Lower for more consistent, professional output
        });

        let css = completion.choices[0]?.message?.content || '';

        // Aggressive cleanup
        css = css.replace(/```css/gi, '').replace(/```/g, '').trim();

        // Remove any explanatory text before the first @import or CSS rule
        const firstCssIndex = css.search(/(@import|\/\*|\*\s*{|body\s*{|:root)/i);
        if (firstCssIndex > 0) {
            css = css.substring(firstCssIndex);
        }

        console.log('✅ Generated CSS length:', css.length);
        return NextResponse.json({ css });

    } catch (error: any) {
        console.error('AI theme generation failed:', error.message);

        // Gracefully fall back to mock on quota/auth errors
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            console.warn('⚠️ Quota exceeded — falling back to Mock theme');
            return generateMockTheme(userPrompt || 'default theme');
        }

        return NextResponse.json(
            { error: 'Failed to generate theme: ' + error.message },
            { status: 500 }
        );
    }
}

// Enhanced Mock Theme
function generateMockTheme(prompt: string) {
    let baseColor = '#ffffff';
    let bgColor = '#0f172a';
    let accentColor = '#3b82f6';
    let vibe = 'modern';
    const p = prompt.toLowerCase();

    if (p.includes('red') || p.includes('fire') || p.includes('hot')) {
        accentColor = '#ef4444'; bgColor = '#1a0a0a'; baseColor = '#fef2f2'; vibe = 'intense';
    }
    if (p.includes('blue') || p.includes('ocean') || p.includes('water')) {
        accentColor = '#3b82f6'; bgColor = '#0c1e3a'; baseColor = '#eff6ff'; vibe = 'calm';
    }
    if (p.includes('pink') || p.includes('cute') || p.includes('pastel')) {
        accentColor = '#ec4899'; bgColor = '#2d1b2e'; baseColor = '#fdf2f8'; vibe = 'playful';
    }
    if (p.includes('green') || p.includes('nature') || p.includes('forest')) {
        accentColor = '#22c55e'; bgColor = '#0a1f0a'; baseColor = '#f0fdf4'; vibe = 'natural';
    }
    if (p.includes('purple') || p.includes('royal') || p.includes('luxury')) {
        accentColor = '#a855f7'; bgColor = '#1e1034'; baseColor = '#faf5ff'; vibe = 'elegant';
    }
    if (p.includes('yellow') || p.includes('gold') || p.includes('sun')) {
        accentColor = '#eab308'; bgColor = '#1a1410'; baseColor = '#fefce8'; vibe = 'vibrant';
    }

    const css = `
/* 🎨 AI Generated Theme - ${vibe.toUpperCase()} */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

* { box-sizing: border-box !important; }

body {
    background: ${bgColor} !important;
    color: ${baseColor} !important;
    font-family: 'Inter', sans-serif !important;
    line-height: 1.6 !important;
    margin: 0 !important;
}

div, section, article, nav, header, footer, aside, main {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    padding: 15px !important;
    margin-bottom: 15px !important;
}

h1, h2, h3, h4, h5, h6 {
    color: ${accentColor} !important;
    font-weight: 700 !important;
    margin: 20px 0 15px !important;
}

a {
    color: ${accentColor} !important;
    text-decoration: underline !important;
    transition: all 0.2s !important;
}

a:hover {
    text-shadow: 0 0 8px ${accentColor}80 !important;
}

button, input[type="submit"] {
    background: ${accentColor} !important;
    color: ${bgColor} !important;
    border: none !important;
    padding: 10px 20px !important;
    border-radius: 6px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
}

button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px ${accentColor}50 !important;
}

input, textarea, select {
    background: rgba(255, 255, 255, 0.05) !important;
    color: ${baseColor} !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    padding: 8px 12px !important;
    border-radius: 4px !important;
}

input:focus, textarea:focus {
    border-color: ${accentColor} !important;
    outline: none !important;
    box-shadow: 0 0 0 3px ${accentColor}20 !important;
}

table { width: 100% !important; border-collapse: collapse !important; }
th, td { padding: 12px !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
th { background: rgba(255, 255, 255, 0.05) !important; font-weight: 600 !important; }

img { border-radius: 4px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
`;

    return NextResponse.json({ css });
}
