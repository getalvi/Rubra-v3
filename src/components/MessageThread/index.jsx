/**
 * MessageThread — renders the full message history
 * Handles: streaming, markdown, code blocks, tool badges, attachments
 */
import React, { useRef, useEffect, useState, useCallback, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Code2, Globe, BookOpen, Brain, Zap, User } from 'lucide-react'
import clsx from 'clsx'

// ── Agent config ─────────────────────────────────────────────────
const AGENTS = {
  CodingAgent:     { label: 'Code',    Icon: Code2,    color: 'text-rose-400',  dot: 'bg-rose-500' },
  SearchAgent:     { label: 'Search',  Icon: Globe,    color: 'text-blue-400',  dot: 'bg-blue-500' },
  SmartTutorAgent: { label: 'Tutor',   Icon: BookOpen, color: 'text-emerald-400', dot: 'bg-emerald-500' },
  GeneralAgent:    { label: 'General', Icon: Brain,    color: 'text-violet-400', dot: 'bg-violet-500' },
  VisionAgent:     { label: 'Vision',  Icon: Zap,      color: 'text-amber-400',  dot: 'bg-amber-500' },
  BrowseAgent:     { label: 'Browse',  Icon: Globe,    color: 'text-sky-400',    dot: 'bg-sky-500' },
}

// ── Copy button ──────────────────────────────────────────────────
function CopyButton({ text, size = 13 }) {
  const [done, setDone] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setDone(true); setTimeout(() => setDone(false), 1800)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.07] text-white/35 hover:text-white/70 transition-all"
    >
      {done ? <Check size={size} /> : <Copy size={size} />}
    </button>
  )
}

// ── Code block ───────────────────────────────────────────────────
function CodeBlock({ inline, className, children }) {
  const lang = /language-(\w+)/.exec(className || '')?.[1] || 'text'
  const code = String(children).replace(/\n$/, '')

  if (inline) return (
    <code className="bg-brand-subtle text-ink-code px-[0.38em] py-[0.12em] rounded-[4px] font-mono text-[0.83em]">
      {children}
    </code>
  )

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.07] my-3.5">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
        <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">{lang}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        PreTag="div"
        customStyle={{
          margin: 0, background: 'rgba(0,0,0,0.52)',
          fontSize: '0.83rem', lineHeight: 1.62, padding: '1rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Typing dots ──────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 150, 300].map(d => (
        <span
          key={d}
          className="w-[5px] h-[5px] rounded-full bg-white/30 animate-typing-dot"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  )
}

// ── Single message ────────────────────────────────────────────────
const Message = memo(function Message({ msg }) {
  const { role, content, streaming, agentMeta, toolResults, error, attachment } = msg
  const isUser = role === 'user'
  const agent  = agentMeta ? (AGENTS[agentMeta.agent] || null) : null
  const [copyDone, setCopyDone] = useState(false)

  const copyMsg = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopyDone(true); setTimeout(() => setCopyDone(false), 1800)
  }, [content])

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 animate-fade-up">
        <div className="max-w-[72%]">
          {attachment && (
            <div className="mb-1.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white/45 text-[12px]">
              📎 <span className="truncate max-w-[160px]">{attachment.name}</span>
              <span className="text-white/25">{(attachment.size / 1024).toFixed(0)}KB</span>
            </div>
          )}
          <div className="px-4 py-2.5 rounded-[18px] rounded-tr-[5px] bg-white/[0.075] border border-white/[0.10] backdrop-blur-glass">
            <p className="text-[14.5px] text-white/88 leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          </div>
        </div>
        <div className="w-[30px] h-[30px] rounded-[9px] glass-card flex items-center justify-center text-white/35 shrink-0 mt-0.5">
          <User size={14} />
        </div>
      </div>
    )
  }

  // ── Assistant message ──────────────────────────────
  return (
    <div className="flex gap-3 animate-fade-up">
      {/* Avatar */}
      <div className="w-[30px] h-[30px] rounded-[9px] bg-brand/90 flex items-center justify-center text-white font-semibold text-[13px] shrink-0 mt-0.5 shadow-brand">
        R
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Agent badge */}
        {agent && (
          <div className="flex items-center gap-1.5">
            <span className={clsx('w-[6px] h-[6px] rounded-full animate-pulse-dot', agent.dot)} />
            <span className={clsx('text-[11.5px] font-medium tracking-wide', agent.color)}>
              {agent.label}
            </span>
          </div>
        )}

        {/* Tool badges */}
        {toolResults?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {toolResults.map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-subtle border border-brand/20 text-[11px] text-brand/80">
                {r.tool === 'weather' ? '🌤' : r.tool === 'crypto' ? '₿' : r.tool === 'news' ? '📰' : '🔍'}
                {r.title || r.tool}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={clsx('relative group', error && 'text-red-400/80')}>
          {!content && streaming ? (
            <TypingDots />
          ) : (
            <div className="prose-rubra">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                {content}
              </ReactMarkdown>
              {streaming && (
                <span className="inline-block w-[2px] h-[1em] bg-brand ml-0.5 align-text-bottom animate-cursor-blink" />
              )}
            </div>
          )}

          {/* Copy button — appears on hover */}
          {!streaming && content && (
            <button
              onClick={copyMsg}
              className="absolute -bottom-6 left-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-white/30 hover:text-white/60"
            >
              {copyDone ? <Check size={11} /> : <Copy size={11} />}
              {copyDone ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

// ── Thread ───────────────────────────────────────────────────────
export default function MessageThread({ messages }) {
  const endRef      = useRef(null)
  const scrollRef   = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, autoScroll])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 90)
  }, [])

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto overflow-x-hidden"
    >
      <div className="max-w-[780px] mx-auto px-5 py-6 space-y-6">
        {messages.map(m => <Message key={m.id} msg={m} />)}
        <div ref={endRef} className="h-1" />
      </div>

      {/* Scroll-to-bottom nudge */}
      {!autoScroll && (
        <button
          onClick={() => { setAutoScroll(true); endRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
          className="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-card border border-white/[0.10] text-[12px] text-white/55 hover:text-white/80 transition-all animate-fade-up"
        >
          ↓ Scroll to bottom
        </button>
      )}
    </div>
  )
}
