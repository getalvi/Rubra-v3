/**
 * ChatWindow — Clean Gemini-style layout
 * - No status bar on top or bottom
 * - Status shown inline in message via statusText prop → MessageThread
 * - Top bar: just menu toggle + brand + new chat
 */
import React, { useCallback, useRef } from 'react'
import { Menu, Plus, Code2, BookOpen, Search, Globe, Brain, Zap } from 'lucide-react'
import clsx from 'clsx'
import MessageThread from '../MessageThread/index.jsx'
import ChatBar from '../ChatBar/index.jsx'

const SUGGESTIONS = [
  { Icon: Code2,    label: 'Build UI',      prompt: 'Build a glassmorphism dashboard with charts using React and Tailwind CSS', color: 'text-rose-400/80',    bg: 'bg-rose-500/[0.09]',    border: 'border-rose-500/[0.12]' },
  { Icon: Brain,    label: 'Explain',       prompt: 'Explain transformer attention mechanism step by step with diagrams',        color: 'text-violet-400/80',  bg: 'bg-violet-500/[0.09]',  border: 'border-violet-500/[0.12]' },
  { Icon: BookOpen, label: 'Study help',    prompt: "HSC Physics — Newton's laws with Bangladesh board exam examples",           color: 'text-emerald-400/80', bg: 'bg-emerald-500/[0.09]', border: 'border-emerald-500/[0.12]' },
  { Icon: Search,   label: 'Live search',   prompt: 'What are the latest AI developments today?',                                color: 'text-sky-400/80',     bg: 'bg-sky-500/[0.09]',     border: 'border-sky-500/[0.12]' },
  { Icon: Globe,    label: 'Browse web',    prompt: 'Browse https://openai.com and summarize the latest blog posts',             color: 'text-blue-400/80',    bg: 'bg-blue-500/[0.09]',    border: 'border-blue-500/[0.12]' },
  { Icon: Zap,      label: 'Crypto prices', prompt: 'What are Bitcoin and Ethereum prices right now?',                           color: 'text-amber-400/80',   bg: 'bg-amber-500/[0.09]',   border: 'border-amber-500/[0.12]' },
]

// ── Welcome screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ onPrompt, isStreaming }) {
  const lastClickRef = useRef(0)
  const handleClick = useCallback((prompt) => {
    const now = Date.now()
    if (now - lastClickRef.current < 500 || isStreaming) return
    lastClickRef.current = now
    onPrompt(prompt)
  }, [onPrompt, isStreaming])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8 overflow-y-auto">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-5 shadow-lg">
        R
      </div>
      <h1 className="text-[22px] font-semibold text-white/88 mb-2 tracking-tight">
        How can I help you?
      </h1>
      <p className="text-[13px] text-white/40 mb-9 max-w-sm text-center leading-relaxed">
        Ask anything — code, study, search, analyze files, or browse the live web.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-[620px]">
        {SUGGESTIONS.map(({ Icon, label, prompt, color, bg, border }) => (
          <button
            key={label}
            onClick={() => handleClick(prompt)}
            disabled={isStreaming}
            className={clsx(
              'flex items-start gap-3 p-4 rounded-2xl text-left border transition-all duration-200',
              bg, border,
              'hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.97]',
              isStreaming && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Icon size={16} className={clsx('shrink-0 mt-0.5', color)} />
            <div>
              <p className="text-[12.5px] font-medium text-white/75">{label}</p>
              <p className="text-[11px] text-white/32 leading-snug mt-0.5 line-clamp-2">
                {prompt.slice(0, 48)}…
              </p>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-8 text-[11px] text-white/22 tracking-wide">
        Bengali · Banglish · English &nbsp;·&nbsp; Drag &amp; drop files supported
      </p>
    </div>
  )
}

// ── Top bar — minimal, no status text here ────────────────────────────────────
function TopBar({ onMenuToggle, onNewChat }) {
  return (
    <div className="flex items-center justify-between px-4 h-[52px] border-b border-white/[0.06] shrink-0">
      <button
        onClick={onMenuToggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-all"
        aria-label="Toggle sidebar"
      >
        <Menu size={17} />
      </button>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[13px] font-semibold text-white/80 tracking-[0.05em]">RUBRA</span>
        <span className="text-[10px] text-white/25 bg-white/[0.05] border border-white/[0.07] px-1.5 py-0.5 rounded">v3</span>
      </div>

      <button
        onClick={onNewChat}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-all"
        aria-label="New chat"
        title="New chat"
      >
        <Plus size={17} />
      </button>
    </div>
  )
}

// ── ChatWindow ────────────────────────────────────────────────────────────────
export default function ChatWindow({
  messages,
  isStreaming,
  agentMeta,
  statusText = '', statusMode = 'dots', progress = 0,
  onSend,
  onFile,
  onStop,
  onNewChat,
  onMenuToggle,
}) {
  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full min-w-0 flex-1 relative">
      <TopBar onMenuToggle={onMenuToggle} onNewChat={onNewChat} />

      {isEmpty
        ? <WelcomeScreen onPrompt={onSend} isStreaming={isStreaming} />
        : <MessageThread messages={messages} statusText={statusText} statusMode={statusMode} progress={progress} />
      }

      {/* ChatBar — no status/progress shown here anymore */}
      <ChatBar
        onSend={onSend}
        onFile={onFile}
        onStop={onStop}
        isStreaming={isStreaming}
      />
    </div>
  )
}
