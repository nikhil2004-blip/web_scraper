# 🎨 WebSkin - AI-Powered Website Theme Transformer

Transform any website with stunning visual themes using AI or pre-made designs.

## ✨ Features

- **AI Theme Generation**: Create custom themes using Groq's Llama 3.3 70B
- **4 Premium Themes**: Pixel, Hacker, Glass, Retro
- **Live Preview**: See themes applied instantly
- **Secure Proxy**: SSRF protection and URL validation
- **Zero Config**: Works out of the box

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Add your Groq API key (optional - app works without it)
echo "GROQ_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🎯 Usage

### Method 1: Pre-Made Themes
1. Enter a website URL (e.g., `example.com`)
2. Select a theme (Pixel/Hacker/Glass/Retro)
3. Click "Apply Theme"

### Method 2: AI-Generated Themes
1. Click "Or create with AI"
2. Describe your theme (e.g., "Cyberpunk pink neon")
3. Click Send
4. Enter a website URL
5. Click "Apply Theme"

## 🔑 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here  # Optional - falls back to mock themes
```

Get your free Groq API key at: https://console.groq.com

## 📁 Project Structure

```
web_skin/
├── app/
│   ├── api/
│   │   ├── generate-theme/   # AI theme generation
│   │   └── proxy/            # Secure website proxy
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── AiThemeInput.tsx      # AI input component
│   ├── InteractiveBackground.tsx
│   ├── PreviewFrame.tsx
│   ├── ThemeSelector.tsx
│   └── UrlInput.tsx
├── public/themes/            # Pre-made CSS themes
│   ├── pixel.css
│   ├── hacker.css
│   ├── glass.css
│   └── retro.css
└── utils/
    ├── cn.ts                 # Utility functions
    └── sanitize.ts           # URL validation
```

## 🛡️ Security Features

- **SSRF Protection**: Blocks localhost and private IPs
- **URL Validation**: Only allows http/https protocols
- **Content Type Check**: Ensures target is HTML
- **Size Limits**: 5MB max content size
- **Timeout Protection**: 10s request timeout

## 🎨 Available Themes

| Theme | Description |
|-------|-------------|
| **Pixel** | 8-bit retro with gold accents |
| **Hacker** | Matrix-style neon green terminal |
| **Glass** | Frosted glassmorphism |
| **Retro** | Windows 95 nostalgia |

## 🤖 AI Theme Examples

Try these prompts:
- "Dark cyberpunk with hot pink neon"
- "Ocean blue with coral accents"
- "Luxury purple with gold highlights"
- "Forest green with warm earth tones"

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables for Production
Add `GROQ_API_KEY` in your deployment platform's settings.

## 📦 Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **AI**: Groq (Llama 3.3 70B)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP**: Axios
- **HTML Parsing**: Cheerio

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ using Next.js and Groq AI
