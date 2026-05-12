# RUBRA Frontend

Apple iOS-inspired glassmorphism UI for RUBRA AI agent.
Built with React + Vite. No CSS framework dependency.

## Project Structure

```
rubra-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── index.js          # All backend API calls
│   ├── components/
│   │   ├── ChatInput.jsx      # Message input bar (file, text, stop)
│   │   ├── ChatInput.module.css
│   │   ├── Header.jsx         # Top nav bar
│   │   ├── Header.module.css
│   │   ├── MessageBubble.jsx  # Renders messages (markdown, code, tools)
│   │   ├── MessageBubble.module.css
│   │   ├── Sidebar.jsx        # Session list
│   │   ├── Sidebar.module.css
│   │   ├── WelcomeScreen.jsx  # Empty state with suggestions
│   │   └── WelcomeScreen.module.css
│   ├── hooks/
│   │   └── useChat.js         # Chat state (streaming, sessions, files)
│   ├── pages/
│   │   ├── ChatPage.jsx       # Main layout
│   │   └── ChatPage.module.css
│   ├── styles/
│   │   └── globals.css        # Design tokens + global styles
│   ├── App.jsx                # Router
│   └── main.jsx               # Entry point
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Setup

```bash
# Install dependencies
npm install

# Copy env file and set your backend URL
cp .env.example .env
# Edit .env: VITE_API_URL=https://your-username-rubra.hf.space

# Run development server
npm run dev

# Build for production
npm run build
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Set environment variable:
   - `VITE_API_URL` = your HuggingFace Space URL (e.g. `https://yourname-rubra.hf.space`)
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`

## Backend (HuggingFace Spaces)

Your Python `app.py` runs on HuggingFace Spaces.
The frontend calls these endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | POST | Main streaming chat |
| `/api/upload` | POST | File upload + analysis |
| `/api/sessions` | GET | List sessions |
| `/api/sessions/:id` | GET/DELETE | Session CRUD |
| `/api/live-feed` | GET | Live news feed |
| `/api/tools/weather` | GET | Weather data |
| `/api/tools/crypto` | GET | Crypto prices |
| `/api/tools/currency` | GET | Exchange rates |
| `/api/tts` | POST | Text to speech |
| `/api/status` | GET | Backend health |

## CORS

Make sure your `app.py` has CORS enabled for your Vercel domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Design System

- **Theme**: Dark glassmorphism (Apple iOS style)
- **Brand color**: `#ff3b30` (iOS Red)
- **Font**: Sora (display) + JetBrains Mono (code)
- **Glass**: `backdrop-filter: blur(22px)` with rgba backgrounds
- **Grid**: 8px base unit

## Adding Features

- **New component** → `src/components/MyComponent.jsx` + `MyComponent.module.css`
- **New page** → `src/pages/MyPage.jsx` + add route in `App.jsx`
- **New API call** → add to `src/api/index.js`
- **New hook** → `src/hooks/useMyHook.js`
