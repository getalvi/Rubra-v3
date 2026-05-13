/**
 * ChatWindow — main chat area
 * Composes: top header, welcome screen, MessageThread, ChatBar
 */
import React, { useCallback } from 'react'
import { Menu, Plus, Code2, BookOpen, Search, Globe, Brain, Zap } from 'lucide-react'
import clsx from 'clsx'
import MessageThread from '../MessageThread/index.jsx'
import ChatBar from '../ChatBar/index.jsx'

// ── Welcome suggestions ──────────────────────────────────────────
const SUGGESTIONS = [
  { Icon: Code2,    label: 'Build UI',      prompt: 'Build a glassmorphism dashboard with charts using React and Tailwind CSS', color: 'text-rose-400/80', bg: 'bg-rose-500/[0.09]', border: 'border-rose-500/[0.12]' },
  { Icon: Brain,    label: 'Explain',       prompt: 'Explain transformer attention mechanism step by step with diagrams', color: 'text-violet-400/80', bg: 'bg-violet-500/[0.09]', border: 'border-violet-500/[0.12]' },
  { Icon: BookOpen, label: 'Study help',    prompt: 'HSC Physics — Newton\'s laws with Bangladesh board exam examples', color: 'text-emerald-400/80', bg: 'bg-emerald-500/[0.09]', border: 'border-emerald-500/[0.12]' },
  { Icon: Search,   label: 'Live search',   prompt: 'What are the latest AI developments today?', color: 'text-sky-400/80', bg: 'bg-sky-500/[0.09]', border: 'border-sky-500/[0.12]' },
  { Icon: Globe,    label: 'Browse web',    prompt: 'Browse https://openai.com and summarize the latest blog posts', color: 'text-blue-400/80', bg: 'bg-blue-500/[0.09]', border: 'border-blue-500/[0.12]' },
  { Icon: Zap,      label: 'Crypto prices', prompt: 'What are Bitcoin and Ethereum prices right now?', color: 'text-amber-400/80', bg: 'bg-amber-500/[0.09]', border: 'border-amber-500/[0.12]' },
]

// ── Agent color map (for header indicator) ───────────────────────
const AGENT_COLORS = {
  CodingAgent:     { dot: 'bg-rose-500',    label: 'Code',    ring: 'border-rose-500/20' },
  SearchAgent:     { dot: 'bg-sky-500',     label: 'Search',  ring: 'border-sky-500/20' },
  SmartTutorAgent: { dot: 'bg-emerald-500', label: 'Tutor',   ring: 'border-emerald-500/20' },
  GeneralAgent:    { dot: 'bg-violet-500',  label: 'General', ring: 'border-violet-500/20' },
  VisionAgent:     { dot: 'bg-amber-500',   label: 'Vision',  ring: 'border-amber-500/20' },
  BrowseAgent:     { dot: 'bg-blue-500',    label: 'Browse',  ring: 'border-blue-500/20' },
}

// ── Welcome screen ────────────────────────────────────────────────
function WelcomeScreen({ onPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8 animate-fade-up">
      {/* Logo mark */}
      <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-white font-bold text-2xl mb-5 shadow-brand">
        R
      </div>

      <h1 className="text-[22px] font-semibold text-white/88 mb-2 tracking-tight">
        How can I help you?
      </h1>
      <p className="text-[14px] text-white/40 mb-9 max-w-sm text-center leading-relaxed">
        Ask anything — code, study, search, analyze files, or browse the live web.
      </p>

      {/* Suggestion grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-[620px]">
        {SUGGESTIONS.map(({ Icon, label, prompt, color, bg, border }) => (
          <button
            key={label}
            onClick={() => onPrompt(prompt)}
            className={clsx(
              'flex items-start gap-3 p-4 rounded-2xl text-left',
              'border transition-all duration-200',
              bg, border,
              'hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.97]',
              'backdrop-blur-sm'
            )}
          >
            <Icon size={17} className={clsx('shrink-0 mt-0.5', color)} />
            <div>
              <p className="text-[13px] font-medium text-white/75">{label}</p>
              <p className="text-[11.5px] text-white/32 leading-snug mt-0.5 line-clamp-2">{prompt.slice(0, 48)}…</p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-[11.5px] text-white/22 tracking-wide">
        Bengali · Banglish · English &nbsp;·&nbsp; Drag &amp; drop files supported
      </p>
    </div>
  )
}

// ── Top header ────────────────────────────────────────────────────
function TopBar({ onMenuToggle, onNewChat, agentMeta }) {
  const agent = agentMeta ? (AGENT_COLORS[agentMeta.agent] || null) : null

  return (
    <div className="flex items-center justify-between px-4 h-[52px] border-b border-white/[0.05] shrink-0 backdrop-blur-glass bg-white/[0.012]">
      {/* Left: menu toggle */}
      <button
        onClick={onMenuToggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-all"
        aria-label="Toggle sidebar"
      >
        <Menu size={17} />
      </button>

      {/* Center: model / agent indicator */}
      <div className="flex items-center">
        {agent ? (
          <div className={clsx(
            'flex items-center gap-2 px-3 py-1 rounded-full',
            'glass-card border animate-fade-up',
            agent.ring
          )}>
            <span className={clsx('w-[6px] h-[6px] rounded-full animate-pulse-dot', agent.dot)} />
            <span className="text-[12.5px] text-white/60 font-medium">{agent.label}</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[13.5px] font-semibold text-white/80 tracking-[0.05em]">RUBRA</span>
            <span className="text-[11px] text-white/25 bg-white/[0.05] border border-white/[0.07] px-1.5 py-0.5 rounded">v2</span>
          </div>
        )}
      </div>

      {/* Right: new chat */}
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

// ── ChatWindow ────────────────────────────────────────────────────
export default function ChatWindow({
  messages, isStreaming, agentMeta,
  onSend, onFile, onStop, onNewChat, onMenuToggle,
}) {
  const handlePrompt = useCallback(p => onSend(p), [onSend])
  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full min-w-0 relative">
      <TopBar onMenuToggle={onMenuToggle} onNewChat={onNewChat} agentMeta={agentMeta} />

      {isEmpty
        ? <WelcomeScreen onPrompt={handlePrompt} />
        : <MessageThread messages={messages} />
      }

      <ChatBar
        onSend={onSend}
        onFile={onFile}
        onStop={onStop}
        isStreaming={isStreaming}
      />
    </div>
  )
}
