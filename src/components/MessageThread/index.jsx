/**
 * MessageThread — status rules:
 * statusMode = 'dots'  → শুধু 3 dots (< 3s)
 * statusMode = 'text'  → dots + backend থেকে আসা real label (3–6s)
 * statusMode = 'deep'  → dots + label + % bar (7s+)
 */
import React, { useEffect, useRef, useState } from 'react'
import { Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// ── Copy ──────────────────────────────────────────────────────────────────────
function CopyBtn({ text, size = 15 }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) }}
      className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
      title={done ? 'Copied!' : 'Copy'}
    >
      <Copy size={size} className={done ? 'text-green-400' : ''} />
    </button>
  )
}

// ── Code block ────────────────────────────────────────────────────────────────
function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, '')
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04]">
        <span className="text-[11px] text-white/35 font-mono">{language || 'code'}</span>
        <CopyBtn text={code} size={13} />
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ background: '#1a1b1c', padding: '14px 16px', fontSize: '12.5px', margin: 0 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Thinking indicator — 3 rules ──────────────────────────────────────────────
function ThinkingIndicator({ statusMode, statusText, progress }) {
  return (
    <div className="py-1">
      {/* Always: 3 bounce dots */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-[5px]">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-[7px] h-[7px] rounded-full bg-white/40"
              style={{ animation: `thinkBounce 1.2s ${i * 0.18}s ease-in-out infinite` }}
            />
          ))}
        </div>

        {/* 3–6s: real text from backend */}
        {(statusMode === 'text' || statusMode === 'deep') && statusText && (
          <span className="text-[12.5px] text-white/50 font-medium leading-none">
            {statusText}
          </span>
        )}

        {/* 7s+: % badge */}
        {statusMode === 'deep' && progress > 0 && (
          <span className="text-[11px] text-white/35 font-mono tabular-nums">
            {progress}%
          </span>
        )}
      </div>

      {/* 7s+: thin progress bar */}
      {statusMode === 'deep' && progress > 0 && (
        <div className="mt-2.5 h-[2px] w-48 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500/60 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ── AI actions ────────────────────────────────────────────────────────────────
function AIActions({ content }) {
  return (
    <div className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <CopyBtn text={content} />
      <button className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all" title="Good">
        <ThumbsUp size={14} />
      </button>
      <button className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all" title="Bad">
        <ThumbsDown size={14} />
      </button>
      <button className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all" title="Retry">
        <RotateCcw size={14} />
      </button>
    </div>
  )
}

// ── User message — RIGHT ──────────────────────────────────────────────────────
function UserMessage({ message }) {
  return (
    <div className="flex justify-end mb-2 px-4">
      <div className="max-w-[75%]">
        {message.attachment && (
          <div className="mb-2 text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.07] border border-white/10 text-white/50 text-xs">
              📎 {message.attachment.name}
            </span>
          </div>
        )}
        <div className="inline-block px-4 py-2.5 rounded-[20px] bg-[#2a2b2d] text-white/90 text-[13.5px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}

// ── AI message — LEFT ─────────────────────────────────────────────────────────
function AIMessage({ message, statusMode, statusText, progress }) {
  const isThinking = message.streaming && !message.content

  return (
    <div className="group flex items-start gap-3 mb-4 px-4">
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mt-0.5">
        <Sparkles size={13} className="text-white" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {/* Thinking state */}
        {isThinking && (
          <ThinkingIndicator
            statusMode={statusMode}
            statusText={statusText}
            progress={progress}
          />
        )}

        {/* Content */}
        {message.content && (
          <div className="text-white/88 text-[13.5px] leading-relaxed">
            <ReactMarkdown
              className="markdown"
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match
                    ? <CodeBlock language={match[1]}>{children}</CodeBlock>
                    : <code className="bg-white/[0.08] px-1.5 py-0.5 rounded text-[12px] text-blue-300 font-mono" {...props}>{children}</code>
                },
                p({ children }) { return <p className="mb-3 last:mb-0">{children}</p> }
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.streaming && (
              <span className="inline-block w-[2px] h-[14px] bg-white/50 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        )}

        {message.error && (
          <div className="mt-1 text-xs text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
            ⚠ Something went wrong
          </div>
        )}

        {!message.streaming && message.content && (
          <AIActions content={message.content} />
        )}
      </div>
    </div>
  )
}

// ── MessageThread ─────────────────────────────────────────────────────────────
export default function MessageThread({ messages, statusText, statusMode, progress }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, statusText])

  return (
    <div className="flex-1 overflow-y-auto">
      <style>{`
        @keyframes thinkBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto py-6">
        {messages.map(msg =>
          msg.role === 'user'
            ? <UserMessage key={msg.id} message={msg} />
            : <AIMessage
                key={msg.id}
                message={msg}
                statusMode={statusMode}
                statusText={statusText}
                progress={progress}
              />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
