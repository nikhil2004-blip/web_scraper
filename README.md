# WebSkin — Real-Time Website Theme Transformer

WebSkin lets you completely transform the look and feel of any website instantly. Just enter a URL, pick one of the premium preset design styles, or type in your own custom prompt, and watch the target site get completely re-imagined inside a smooth, interactive sandbox preview.

---

## Core Features

* **AI-Powered CSS Synthesis**: Describe any aesthetic you want (e.g., *"neon cyberpunk purple"* or *"warm autumn forest"*), and WebSkin will dynamically craft a custom, fully functional stylesheet on the fly.
* **Premium Built-In Presets**: Switch instantly between four gorgeous, highly detailed designs: **Obsidian Glassmorphism**, **Matrix Hacker**, **Retro Windows 95**, and **8-Bit Arcade Pixel**.
* **Isolated High-Fidelity Preview**: View target sites in a secure, custom-built sandbox. Links and media resources are dynamically rebased on the fly, letting you click around and interact with the styled pages.
* **Hardened Proxy Security**: Built with robust SSRF prevention, request rate-limiting, and strict source sanitization to keep browsing safe and light.

---

## Preset Design Systems

| Theme | Vibe & Aesthetic | Visual Signatures |
| :--- | :--- | :--- |
| **Glass** | Obsidian Glassmorphism | Frosted glass card designs, high-end backdrop blur, glowing accent borders, and premium modern typography. |
| **Hacker** | Cybernetic Terminal | Retro scanlines, matrix-green terminal text, dark background grids, and monospace typography. |
| **Pixel** | 8-Bit Arcade Nostalgia | Classic pixel-art borders, retro arcade typography, and bright neon-yellow highlights. |
| **Retro** | Vintage Operating System | Classic Windows 95 beveled window controls, gray block tabs, solid steel borders, and vintage desktop colors. |

---

## Technical Highlights

### Security & Sanitization
To securely display third-party websites without security risks, the application runs target pages through a custom-built proxy endpoint engineered with:
* **SSRF Blocklist**: Instantly filters out localhost, private IP subnets, loopbacks, and restricted server addresses.
* **Protocol Safety**: Restricts all traffic strictly to secure `http:` and `https:` headers.
* **Payload Protection**: Limits content downloads to a safe 5MB buffer, blocking large files or network overflow attacks.
* **Link Rebasing Engine**: Rewrites original relative paths, script URLs, and images so they flow cleanly through the sandbox while keeping navigation fully functional.

---

## File Structure

```text
web_skin/
├── app/
│   ├── api/
│   │   ├── generate-theme/   # AI-powered theme analysis and custom CSS generator
│   │   ├── proxy/            # Secure third-party HTML fetching & asset rebaser
│   │   └── rate-limit.ts     # Rate limiter for the secure proxy
│   ├── globals.css           # Base layouts, variables, and dark-theme tokens
│   ├── layout.tsx            # Next.js root layout with Plus Jakarta Sans typography
│   └── page.tsx              # Interactive workspace layout
├── components/
│   ├── AiThemeInput.tsx      # Fluid, animated input panel for AI prompts
│   ├── CursorFX.tsx          # Custom theme-reactive mouse aura glow
│   ├── InteractiveBackground.# Adaptive animated particle backdrop
│   ├── PreviewFrame.tsx      # Secure, dynamic rebased iframe container
│   ├── ThemeSelector.tsx     # Clean, modern design preset switcher
│   └── UrlInput.tsx          # Hardened address control with real-time feedback
└── utils/
    ├── cn.ts                 # Conditional class styling utility
    └── sanitize.ts           # SSRF defense validator
```

---

## Technology Stack

* **Core Framework**: Next.js 16 (App Router)
* **AI Orchestrator**: Groq Llama 3.3 70B
* **Styling & Theme Engine**: Tailwind CSS v4.0 with Custom HSL Design Tokens
* **Animations**: Framer Motion
* **HTML Parsing & Rebasing**: Cheerio
* **Visuals & Icons**: Lucide React
