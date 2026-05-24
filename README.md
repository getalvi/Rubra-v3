# RUBRA AI — Frontend v2

iOS 26 Liquid Glass · React + Tailwind · Claude-like layout

## Folder Structure

```
rubra-v2/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── index.js              ← All backend calls (SSE, upload, tools)
│   ├── components/
│   │   ├── Sidebar/
│   │   │   └── index.jsx         ← Glass sidebar: session list, new chat, search
│   │   ├── ChatWindow/
│   │   │   └── index.jsx         ← Header + welcome screen + layout container
│   │   ├── MessageThread/
│   │   │   └── index.jsx         ← Message list: markdown, code, streaming
│   │   └── ChatBar/
│   │       └── index.jsx         ← Glass input bar: text, file, drag-drop, stop
│   ├── hooks/
│   │   └── useChat.js            ← All chat state: sessions, messages, streaming
│   ├── pages/
│   │   └── App.jsx               ← Root layout (scene bg + sidebar + chat)
│   └── styles/
│       └── globals.css           ← Tailwind base + glass mixins + prose styles
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env → set VITE_API_URL to your HuggingFace Space

npm run dev        # http://localhost:3000
npm run build      # production build → dist/
```

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel → Framework: **Vite**
3. Add env var: `VITE_API_URL` = `https://your-username-rubra.hf.space`
4. Deploy

## Design System

| Token | Value |
|---|---|
| Background | `#060606` + deep red radial glow |
| Glass blur | `backdrop-filter: blur(28px)` |
| Glass bg | `rgba(255,255,255,0.035–0.075)` |
| Border | `0.5px solid rgba(255,255,255,0.07)` |
| Brand | `#c0392b` (deep crimson, no light red) |
| Font | Inter + JetBrains Mono |
| Sidebar width | 255px |
| Header height | 52px |
