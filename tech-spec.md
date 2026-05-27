# Rubra v3 — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.0 | UI framework |
| react-dom | ^18.3.0 | React DOM renderer |
| vite | ^6.0.0 | Build tool |
| @vitejs/plugin-react | ^4.3.0 | Vite React plugin |
| tailwindcss | ^4.0.0 | Utility CSS |
| @tailwindcss/vite | ^4.0.0 | Tailwind Vite integration |
| framer-motion | ^11.18.0 | Animations (sidebar, message entrance, transitions) |
| lucide-react | ^0.460.0 | Icon system |
| react-markdown | ^9.0.0 | Markdown rendering for AI messages |
| remark-gfm | ^4.0.0 | GitHub-flavored markdown |
| rehype-highlight | ^7.0.0 | Syntax highlighting |
| highlight.js | ^11.10.0 | Core highlighting engine |
| uuid | ^11.0.0 | Session ID generation |

---

## Component Inventory

### Layout (used once)

| Component | Source | Notes |
|-----------|--------|-------|
| Header | Custom | Fixed top bar, glassmorphic, appears on scroll |
| Sidebar | Custom | 300px session panel, slide animation on mobile |
| ChatLayout | Custom | Main wrapper: sidebar + chat area |

### Sections (used once)

| Component | Source | Notes |
|-----------|--------|-------|
| WelcomeScreen | Custom | Empty state with gradient text + suggestion grid |
| ChatArea | Custom | Scrollable message container with auto-scroll |
| InputBar | Custom | Pill-shaped input with file upload, send/stop toggle |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| GradientText | Custom | WelcomeScreen, branding |
| IconButton | Custom | Header, InputBar, MessageBubble, Sidebar |
| Avatar | Custom | MessageBubble (AI + user variants) |
| CodeBlock | Custom | MessageBubble (via react-markdown renderer) |
| SuggestionCard | Custom | WelcomeScreen (6 instances) |
| ModeSelector | Custom | Header |
| SessionItem | Custom | Sidebar (list) |
| MessageBubble | Custom | ChatArea (per message) |
| ScrollToBottom | Custom | ChatArea |
| Toast | Custom | Global (via context) |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Sidebar slide (mobile) | Framer Motion | `animate={{ x: isOpen ? 0 : -280 }}` with AnimatePresence | Low |
| Sidebar backdrop fade | Framer Motion | Opacity 0→1 with AnimatePresence | Low |
| Message entrance (user) | Framer Motion | `initial={{ opacity: 0, x: 16 }}` `animate={{ opacity: 1, x: 0 }}` | Low |
| Message entrance (AI) | Framer Motion | `initial={{ opacity: 0, x: -16 }}` `animate={{ opacity: 1, x: 0 }}` | Low |
| Typing indicator bounce | CSS keyframes | Tailwind `animate-bounce` with staggered animation-delay | Low |
| AI avatar pulse | CSS keyframes | `scale(1) → scale(1.05) → scale(1)` 2s infinite ease-in-out | Low |
| Toast entrance/exit | Framer Motion | AnimatePresence + slideUp/slideDown variants | Low |
| Scroll-to-bottom fade | Framer Motion | `animate={{ opacity: isVisible ? 1 : 0 }}` | Low |
| Suggestion card hover | CSS transition | translateY(-2px) + shadow change, `transition-base` | Low |
| Input bar focus | CSS transition | Border + background change, `transition-base` | Low |
| Header appear on scroll | Framer Motion | Opacity tied to scroll position (>200px) | Low |
| File drop overlay pulse | CSS animation | Border opacity pulse when drag active | Low |

**Total animation complexity: Low** — All animations are simple transitions/keyframes. No complex timeline or scroll-driven animations. Framer Motion handles enter/exit via AnimatePresence, CSS handles the rest.

---

## State & Logic Plan

### useChat Hook (React Context)

**Why Context over Zustand/Redux:** The state shape is simple (flat object) and tightly coupled to the component tree. Context avoids an extra dependency and keeps the code readable for a single-feature app.

**State shape:**
```js
{
  messages: [{ id, role, text, timestamp, streaming }],
  isStreaming: boolean,
  isSidebarOpen: boolean,
  activeSessionId: string | null,
  sessions: [{ id, title, timestamp }],
  mode: "auto" | "fast" | "hermes",
  isLoading: boolean,
  error: string | null,
  toasts: [{ id, message, type }]
}
```

**Key logic decisions:**

1. **SSE Streaming** — The `sendMessage` function:
   - Creates user message object, appends to messages
   - Creates assistant message with `streaming: true`
   - Calls `streamSSE()` from api/index.js with callbacks
   - On each token event: updates assistant message text (immutable update)
   - On done/error: sets `streaming: false`, saves to session
   - Returns abort function for stop button

2. **Session Management** — Sessions are server-side (SQLite via backend):
   - `loadSessions()`: Fetches from `GET /api/sessions`, caches in localStorage
   - `createSession()`: Generates UUID client-side, sets as active
   - `loadSession(id)`: Fetches from `GET /api/sessions/:id`, populates messages
   - `deleteSession(id)`: Calls `DELETE /api/sessions/:id`, refreshes list
   - `renameSession(id, title)`: Optimistic update + API call
   - Backend auto-saves history when chat messages are sent

3. **Message Editing** — `editMessage(id, newText)`:
   - Finds message by ID, updates text
   - Removes all subsequent messages (branch from edit point)
   - Re-sends the edited message to backend for fresh response
   - This matches Gemini's edit behavior

4. **File Upload** — `uploadFile(file, question)`:
   - Creates FormData, appends file + session_id + question
   - Calls `POST /api/upload`
   - On success: adds file response as system message

5. **Mode Selection** — Stored in localStorage, sent with every request as `mode` field

---

## Other Key Decisions

### Markdown Rendering Pipeline

```
react-markdown → remark-gfm → rehype-highlight → custom components
```

Custom renderers needed:
- `code` → CodeBlock component with copy button
- `pre` → Styled wrapper with dark background
- `table` → Styled table with borders
- `a` → Styled link with accent-blue color
- `ul/ol` → Styled lists with custom bullets

### API Architecture

All API calls go through `src/api/index.js`:
- `streamSSE()` — Core streaming function using ReadableStream + AbortController
- `sendMessage()` — Wrapper that calls streamSSE with chat-specific params
- `uploadFile()` — FormData POST
- Session CRUD — Standard fetch wrappers

Base URL: `https://getalvi-rubra-v3.hf.space` (hardcoded, matches current frontend)

### Mobile Sidebar Strategy

- Desktop: Sidebar is always visible, pushes content
- Mobile: Sidebar overlays content with backdrop, slides in from left
- Toggle: Hamburger menu on mobile, panel toggle on desktop
- Close: Backdrop click or X button

### Error Handling

- Network errors → Toast notification
- SSE stream errors → Toast + stop streaming
- 500 errors → Toast with "Something went wrong"
- Session not found → Create new session automatically
