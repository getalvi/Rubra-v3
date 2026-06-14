# RUBRA v3 — Full Project Documentation

> **Purpose of this file:** Any AI assistant reading this document can fully understand the entire RUBRA v3 codebase — architecture, every file, every component, and how they connect.

---

## 1. Project Overview

**RUBRA** is a Bangladeshi AI assistant web app. It is a full-stack product:

- **Frontend:** React + Vite + Tailwind CSS — deployed on **Vercel**
- **Backend:** FastAPI (Python) — deployed on **HuggingFace Spaces** at `https://getalvi-rubra-v3.hf.space`
- **Auth:** Supabase (email/password only, no OAuth)
- **Repo:** `https://github.com/getalvi/Rubra-v3`

The frontend is a chat interface. Users must log in before they can use the AI. The AI streams responses token-by-token via SSE (Server-Sent Events).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (Vite) |
| Styling | Tailwind CSS v3 + inline styles |
| Auth | Supabase JS v2 (`@supabase/supabase-js`) |
| Backend API | HuggingFace Space — FastAPI + SSE |
| Deployment | Vercel (frontend), HuggingFace (backend) |
| Fonts | Inter (body), Syne (headings), JetBrains Mono (code) |

---

## 3. Project Directory Structure

```
rubra-v3/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                        # React root entry point
    ├── styles/
    │   └── globals.css                 # Tailwind directives + base styles
    ├── services/
    │   ├── supabase.js                 # Supabase client + health check
    │   └── api.js                      # HuggingFace backend SSE streaming
    ├── hooks/
    │   ├── useAuth.js                  # Auth state: login, signup, session
    │   └── useChat.js                  # Chat state: sessions, messages, streaming
    ├── utils/
    │   └── parse.js                    # Markdown parser, file extractor, helpers
    ├── pages/
    │   └── App.jsx                     # Root layout — auth gate + full UI
    └── components/
        ├── AuthModal.jsx               # Login/signup modal (email/password)
        ├── WaveBackground.jsx          # Canvas animated wave background
        ├── Sidebar/
        │   └── index.jsx               # Session list, search, user footer
        ├── Welcome/
        │   └── index.jsx               # Welcome screen (shown before first message)
        ├── ChatInput/
        │   └── index.jsx               # Text input bar + quick-action pills
        ├── Messages/
        │   └── index.jsx               # Message list, code blocks, edit/retry
        └── FilePanel/
            └── index.jsx               # Right-side split panel for code file preview
```

---

## 4. File-by-File Explanation

---

### `src/main.jsx`
React entry point. Mounts `<App/>` into `#root`. Imports `globals.css`.

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App.jsx";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

---

### `src/styles/globals.css`
- Imports Google Fonts: Inter, Syne, JetBrains Mono
- Tailwind `@base`, `@components`, `@utilities` directives
- Base resets: `box-sizing`, `overflow:hidden` on html/body/root
- Custom scrollbar styling (thin, dark)

---

### `src/services/supabase.js`

**Purpose:** Creates and exports the Supabase client. Also exports a `checkSupabaseHealth()` function.

**Supabase config:**
- URL: `https://kkeacytrbrnundprstv.supabase.co`
- Anon Key: (long JWT — hardcoded)
- `flowType: "implicit"` — more compatible than PKCE across environments
- `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: true`

**`checkSupabaseHealth()`:**
- Fetches `/auth/v1/health` endpoint with 8-second timeout
- Returns `true` if server is reachable, `false` if not
- Used to detect when the Supabase free-tier project is **paused**
- Called before every signIn/signUp to give a clear error instead of "Failed to fetch"

**Why "Failed to fetch" happens:**
Supabase Free tier pauses projects after 7 days of inactivity. The health check detects this and shows a yellow warning banner with a link to resume the project.

---

### `src/services/api.js`

**Purpose:** Handles all communication with the HuggingFace FastAPI backend.

**Backend base URL:** `https://getalvi-rubra-v3.hf.space`

**`streamChat({ message, sessionId, mode, onToken, onDone, onError })`:**
- POSTs to `/api/chat/stream`
- Request body: `{ message, session_id, mode, stream: true, force_hermes: false }`
- Reads response as SSE (Server-Sent Events) using `ReadableStream`
- Parses `data: {...}` lines
- On `evt.type === "token"`: calls `onToken(chunk, fullText)` for each token
- On `evt.done === true` or `data: [DONE]`: calls `onDone(fullText)`
- On error: calls `onError(err)`

**`healthCheck()`:** Simple GET to `/health`, returns boolean.

**SSE parsing logic:**
```
buffer += decoded chunk
split by "\n"
for each line starting with "data:":
  parse JSON
  if type="token" → stream to UI
  if done=true → finish
```

---

### `src/hooks/useAuth.js`

**Purpose:** Manages authentication state. Wraps Supabase auth methods.

**State:**
- `user` — `undefined` (loading) | `null` (not logged in) | user object (logged in)
- `loading` — boolean, true until first session check completes
- `healthy` — boolean, tracks if Supabase server is reachable

**Brute-force protection (client-side):**
- Tracks failed attempts in `localStorage` keys `r_att` and `r_lck`
- After 5 failed attempts → locks for 15 minutes
- Lockout countdown shown to user

**Methods:**

`signUp(email, password)`
- Checks lockout
- Calls `checkSupabaseHealth()` first
- Calls `supabase.auth.signUp()`
- Maps errors to friendly messages

`signIn(email, password)`
- Same guards as signUp
- Calls `supabase.auth.signInWithPassword()`
- Shows remaining attempts on failure

`signOut()`
- Calls `supabase.auth.signOut()`

`resetPassword(email)`
- Calls `supabase.auth.resetPasswordForEmail()`
- Redirects to `window.location.origin`

**`friendly(msg)`** — internal function that maps raw Supabase error strings to human-readable messages:
- "Failed to fetch" → "Cannot reach server. Check your internet..."
- "Invalid login credentials" → "Wrong email or password."
- "Email not confirmed" → "Please confirm your email first..."
- "User already registered" → "An account with this email already exists..."

**Computed values exported:**
- `displayName` — from `user_metadata.full_name` → `name` → email prefix → "User"
- `initials` — first letters of name words, max 2 chars, uppercase

---

### `src/hooks/useChat.js`

**Purpose:** Manages all chat state — sessions, messages, streaming.

**State:**
- `sessions` — array of `{ id, title, ts, messageCount, messages[] }`
- `activeId` — currently selected session id (null = no active session / welcome screen)
- `isStreaming` — boolean, true while AI is generating

**Session structure:**
```js
{
  id: "abc123",
  title: "How to become a developer…",  // first 42 chars of first message
  ts: 1234567890,                        // last activity timestamp
  messageCount: 4,
  messages: [
    { id: "m1", role: "user",      content: "...", ts: ... },
    { id: "m2", role: "assistant", content: "...", ts: ..., streaming: false },
  ]
}
```

**Methods:**

`sendMessage(text, mode="auto")`
- Creates session if none active
- Appends user message + empty assistant placeholder
- Calls `streamChat()` from `api.js`
- Updates assistant message content on each token
- Sets `streaming: false` when done

`editMessage(msgId, newContent)`
- Trims conversation to before the edited message
- Calls `sendMessage(newContent)` — effectively re-runs from that point

`retryMessage(asstMsg)`
- Finds the user message immediately before the given assistant message
- Trims conversation to before that user message
- Calls `sendMessage()` again

`newChat()` — sets `activeId` to null (welcome screen)
`selectSession(id)` — switches active session
`deleteSession(id)` — removes session from array

---

### `src/utils/parse.js`

**Purpose:** Utility functions shared across components.

**`parseSegments(text)`**
- Parses markdown text into `[{ type: "text"|"code", content, lang? }]`
- Finds ` ```lang\n...\n``` ` blocks using regex
- Everything between code blocks is a "text" segment
- Used by `Messages/index.jsx` to render mixed content

**`extractFiles(segments, msgId)`**
- Takes parsed segments, returns code segments as file objects
- `{ id, lang, content, name, size }`
- `name` inferred from lang (e.g. `python` → `main.py`)

**`groupByTime(sessions)`**
- Groups sessions array into `{ Today, Yesterday, "This Week", Older }`
- Used by Sidebar to render time-grouped session list

**`uid()`** — generates short unique IDs (random base36 + timestamp)

**`fmtSize(bytes)`** — formats bytes → "1.2KB", "3.4MB"

**`langColor(lang)`** — maps language name to brand color hex (e.g. `javascript` → `#f7df1e`)

---

### `src/pages/App.jsx`

**Purpose:** Root component. Owns layout, auth gate, sidebar toggle, file panel.

**State:**
- `isMobile` — `window.innerWidth < 768`, updates on resize
- `mobOpen` — mobile sidebar open/close
- `panelOpen` — desktop sidebar panel open/close (default: true)
- `fpFiles` — array of files to show in right file panel
- `fpOpen` — boolean, whether file panel is visible

**Auth gate logic:**
```jsx
if (loading) return <Splash/>;

// Modal shown on top of everything when not logged in
{!user && <AuthModal .../>}
```
- When not logged in: full app renders (wave, sidebar, chat) but `AuthModal` sits on top at `z-50`
- ESC key is blocked when not logged in: `e.preventDefault()`
- `ChatInput` disabled when `!user`

**Desktop layout:**
```
[54px strip] [0-240px sidebar panel] [flex-1 chat] [420px file panel (optional)]
```
- Icon strip: always visible, contains hamburger, new chat, settings, user avatar
- Sidebar panel: slides in/out with `width` transition (`.25s ease`)
- File panel: appears on right when a code block "Open in panel" is clicked

**Mobile layout:**
- Top bar: hamburger | RUBRA logo | new chat
- Sidebar: fixed overlay with backdrop

**`openFP({ lang, content })`**
- Creates a file object from a code segment
- Sets `fpFiles` and `fpOpen = true`
- Triggers the right-side file panel

---

### `src/components/AuthModal.jsx`

**Purpose:** Full-screen auth wall. Shown when user is not logged in. Cannot be dismissed.

**Modes:** `"login"` | `"signup"` | `"forgot"` — toggled with `useState`, no page reload.

**Features:**
- Tab switcher (Sign In / Sign Up)
- Email + Password fields always shown
- Confirm Password field only in signup mode
- Password strength meter (signup only): 5-level bar, checks length/uppercase/number/symbol
- Show/hide password toggle
- Forgot password → email reset link mode
- `ConnBanner`: yellow warning when `healthy === false`, shows link to Supabase dashboard
- Error banner (red): shown on failed auth
- Success banner (green): shown after signup or reset link sent
- Submit button disabled + spinner while loading
- Submit button disabled when server is unreachable (`healthy === false`)

**Validation (client-side):**
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: minimum 8 characters
- Confirm: must match password

**Security:**
- Relies on `useAuth.js` brute-force guard (5 attempts → 15 min lockout)
- Cannot be closed: clicking outside = no action, ESC blocked in `App.jsx`

---

### `src/components/WaveBackground.jsx`

**Purpose:** Animated canvas background — colored flowing waves.

**Performance design:**
- Only **3 wave layers** (kept minimal for low CPU)
- Step size: 4px per x iteration
- No radial glow effects
- `requestAnimationFrame` loop
- Canvas resizes on window resize

**Wave config:**
```js
{ y: 0.50, amp: 0.08, speed: 0.0015, colors: [180,28,28], opacity: 0.40 }  // red
{ y: 0.60, amp: 0.07, speed: 0.0011, colors: [55,20,155], opacity: 0.36 }  // purple
{ y: 0.68, amp: 0.06, speed: 0.0013, colors: [15,70,200], opacity: 0.30 }  // blue
```

Each wave is a filled path with a vertical linear gradient (opaque at peak → transparent).

---

### `src/components/Sidebar/index.jsx`

**Purpose:** Left sidebar showing session history, search, user info, sign out.

**Props:**
- `open`, `onClose` — mobile open/close
- `isMobile` — layout mode
- `sessions`, `activeSessionId` — from `useChat`
- `onNewChat`, `onSelectSession`, `onDeleteSession` — chat actions
- `user`, `displayName`, `initials`, `onSignOut` — from `useAuth`

**Features:**
- Mobile: fixed overlay with dark backdrop, slide-in transform transition
- Desktop: inline sidebar (no overlay)
- Search: filters sessions by title as user types
- Sessions grouped by time (`groupByTime` from utils)
- Hover on session → shows trash delete button
- Footer: user avatar (initials), display name, email, settings icon, sign-out button

**Session item appearance:**
- Active session: slightly lighter background (`#1a1a2a`)
- Hover: subtle highlight (`#141420`)
- Text truncated with ellipsis

---

### `src/components/Welcome/index.jsx`

**Purpose:** Shown in the main content area when no messages exist (before first chat).

**Content:**
- Personalized greeting: "Hey Alvi," (from `displayName`)
- Large headline: "**How** can I assist you today?" (How = red accent color)
- Subtitle: "Code · Write · Research · Learn · News"

**Responsive:**
- Mobile: `clamp(28px, 8vw, 42px)` font size
- Desktop: `clamp(36px, 4vw, 56px)` font size

---

### `src/components/ChatInput/index.jsx`

**Purpose:** The message input bar at the bottom of the chat.

**Features:**
- Auto-growing textarea (max height 140px)
- Enter to send, Shift+Enter for newline
- Send button: red when has text, muted when empty
- Attach icon (decorative, no handler yet)
- Streaming indicator: 5 animated bars when `disabled=true` (AI generating)
- Quick-action pills: "Code </>", "Write", "Research", "Learn", "News" → call `onSend(pill)`
- Disabled when `!user` (not logged in) or `isStreaming`

---

### `src/components/Messages/index.jsx`

**Purpose:** Renders the full conversation. Most complex component.

**Message rendering:**
- **User messages:** dark bubble, right-aligned, rounded corners (`rounded-tr-sm`)
- **Assistant messages:** plain text, left-aligned, full width

**Text rendering (TextBlock + Inline):**
- Headings: `#`, `##`, `###`
- Bold: `**text**`
- Italic: `*text*`
- Inline code: `` `code` ``
- Bullet lists: `- item`
- Numbered lists: `1. item`
- Blockquotes: `> text`
- Horizontal rule: `---`

**Code blocks (CodeBlock):**
- Language label with colored dot (`langColor`)
- Line number gutter
- **Download button** — downloads file with correct extension (`.py`, `.js`, etc.)
- **Copy button** — copies to clipboard, shows "Copied" for 2s
- **Panel button** — appears when >25 lines → opens right file panel
- **Hide/Show toggle** — collapses code block
- Horizontal scroll when no word-wrap

**Presentation View:**
- Toggle button appears on assistant messages that contain code
- Switches to slide-by-slide view of text segments
- Previous/Next navigation, dot indicators

**Hover actions (ActionRow):**
- User message hover → **Edit** button → opens EditModal
- Assistant message hover → **Retry** button → re-runs previous user message
- Both → **Copy** button

**EditModal:**
- Full-screen overlay
- Textarea pre-filled with current content
- "Save & Resend" → calls `editMessage()` → trims conversation and re-sends

**Streaming cursor:**
- Blinking `|` character appended while `streaming: true`

---

### `src/components/FilePanel/index.jsx`

**Purpose:** Right-side split panel for viewing code files.

**Triggered by:** Clicking "Panel" button on long code blocks (>25 lines).

**Features:**
- Displays code with line numbers
- Language label + colored dot
- File name, line count, file size (`fmtSize`)
- **Word wrap toggle** — switches between wrapped and horizontal-scroll
- **Download button** — downloads the file
- **Copy button** — copies all content
- **Close button** — closes the panel (sets `fpOpen = false` in App)
- If multiple files: shows tab strip at top (tabs per file, with close × per tab)
- Single file: shows simple header with close button

---

## 5. Data Flow Diagram

```
User types message
       ↓
ChatInput.onSend(text)
       ↓
App.sendMessage(text)   [from useChat]
       ↓
useChat.sendMessage()
  → creates/finds session
  → appends user msg + empty assistant msg (streaming:true)
  → calls streamChat() from api.js
       ↓
api.js → POST /api/chat/stream → HuggingFace backend
       ↓
SSE stream: data: {"type":"token","content":"Hello"}
       ↓
useChat.onToken() → updates assistant msg content in state
       ↓
React re-renders → Messages component shows growing text + cursor
       ↓
SSE ends → useChat.onDone() → streaming:false
       ↓
Messages shows final content, hover actions appear
```

---

## 6. Auth Flow

```
App loads
  → useAuth.getSession() checks Supabase
  → user = undefined (loading) → show Splash screen
  → user = null (not logged in) → show full app + AuthModal overlay
  → user = object (logged in) → hide AuthModal, show full app

User fills AuthModal
  → useAuth.checkSupabaseHealth() → if false → show yellow banner
  → validate() client-side
  → supabase.auth.signUp() or signInWithPassword()
  → on success: supabase.onAuthStateChange fires → user set → modal disappears
  → on error: friendly(error.message) shown in red banner
```

---

## 7. Key Design Decisions

| Decision | Reason |
|---|---|
| No OAuth (Google/Facebook/GitHub) | Simpler, less setup, no external dependencies |
| `flowType: "implicit"` not `"pkce"` | PKCE caused "Failed to fetch" in some Vercel deployments |
| Health check before every auth call | Free Supabase projects pause after 7 days inactivity — health check gives clear error instead of cryptic "Failed to fetch" |
| Session state in React (not DB) | Simple, fast, no extra Supabase tables needed. Sessions reset on page refresh. |
| SSE streaming not WebSocket | Backend uses SSE — simpler, works over HTTP/2, no connection management |
| Tailwind CSS | Consistent styling, no CSS file bloat, purges unused styles |
| 3 wave layers not 5 | Performance — reduces CPU usage on low-end PCs and mobile |
| No glassmorphism | `backdropFilter: blur()` causes GPU strain, removed for performance |

---

## 8. Environment & Deployment

### Frontend (Vercel)
- Build command: `npm run build`
- Output: `dist/`
- Auto-deploys on `git push` to `main` branch

### Backend (HuggingFace)
- Space: `getalvi/rubra-v3`
- Framework: FastAPI
- Endpoints used:
  - `POST /api/chat/stream` — SSE chat streaming
  - `GET /health` — health check

### Supabase Setup Required
1. **Authentication → URL Configuration:**
   - Site URL: your Vercel deployment URL
   - Redirect URLs: same URL
2. **Authentication → Email templates:** can customize confirmation email
3. **Free tier note:** Project pauses after 7 days of inactivity → go to dashboard and click "Restore project"

---

## 9. Known Issues & TODOs

| Issue | Status |
|---|---|
| Sessions not persisted to database — lost on page refresh | Known, sessions are in-memory only |
| Attach button (paperclip) has no handler | Decorative only, not implemented |
| No real-time session sync across tabs/devices | Not implemented |
| Facebook OAuth removed | Intentional — email/password only |
| `AuthPage.jsx` file exists but is unused | Legacy file, can be deleted |

---

## 10. File Size Reference

| File | Lines |
|---|---|
| `Messages/index.jsx` | ~285 |
| `AuthModal.jsx` | ~274 |
| `FilePanel/index.jsx` | ~255 |
| `App.jsx` | ~170 |
| `Sidebar/index.jsx` | ~137 |
| `ChatInput/index.jsx` | ~87 |
| `useChat.js` | ~85 |
| `parse.js` | ~70 |
| `useAuth.js` | ~95 |
| `api.js` | ~55 |
| `supabase.js` | ~28 |
| `WaveBackground.jsx` | ~51 |
| `Welcome/index.jsx` | ~17 |

---

*Last updated: June 2026 — RUBRA v3*
