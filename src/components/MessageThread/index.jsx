/**
 * MessageThread — Gemini-style thinking UI + [object Object] fix
 *
 * Thinking steps আসে backend SSE থেকে:
 *   type:'meta'        → agent routing
 *   type:'tool_call'   → live tool step (spinner)
 *   type:'tool_result' → tool done (checkmark)
 *   type:'status'      → thinking label (timing-gated)
 *   liveStatus.mode    → 'dots'|'text'|'deep'
 *
 * [object Object] fix: সব values toStr() দিয়ে safe string করা
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw,
  ChevronDown, ChevronRight, Search, Globe, Terminal,
  Code2, Zap, CheckCircle2, Loader2, AlertCircle,
  Brain, FileText
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// ── Safe string (prevents [object Object]) ───────────────────────────────────
function toStr(val) {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  try { return JSON.stringify(val, null, 2) } catch { return String(val) }
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, size = 14 }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(toStr(text)); setDone(true); setTimeout(() => setDone(false), 1500) }}
      className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
      title={done ? 'Copied!' : 'Copy'}
    >
      <Copy size={size} className={done ? 'text-green-400' : ''} />
    </button>
  )
}

// ── Code block ────────────────────────────────────────────────────────────────
function CodeBlock({ language, children }) {
  const code = toStr(children).replace(/\n$/, '')
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04]">
        <span className="text-[11px] text-white/35 font-mono">{language || 'code'}</span>
        <CopyBtn text={code} size={12} />
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ background: '#1a1b1c', padding: '14px 16px', fontSize: '12px', margin: 0 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Tool icon map ─────────────────────────────────────────────────────────────
const TOOL_META = {
  web_search:   { Icon: Search,   color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/15',     label: 'Web Search'   },
  browser:      { Icon: Globe,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/15',    label: 'Browser'      },
  browse_url:   { Icon: Globe,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/15',    label: 'Browse URL'   },
  code_execute: { Icon: Terminal, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', label: 'Run Code'     },
  python:       { Icon: Code2,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', label: 'Python'       },
  calculator:   { Icon: Zap,      color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/15',   label: 'Calculator'   },
  file_read:    { Icon: FileText, color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/15',  label: 'Read File'    },
  wikipedia:    { Icon: Brain,    color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/15',  label: 'Wikipedia'    },
  default:      { Icon: Zap,      color: 'text-white/40',    bg: 'bg-white/[0.05]',   border: 'border-white/[0.08]',   label: 'Tool'         },
}

function getToolMeta(name = '') {
  const n = toStr(name).toLowerCase()
  const key = Object.keys(TOOL_META).find(k => k !== 'default' && n.includes(k)) || 'default'
  return TOOL_META[key]
}

// ── Tool step (collapsible) ───────────────────────────────────────────────────
function ToolStep({ call, result }) {
  const [open, setOpen] = useState(false)
  const { Icon, color, bg, border, label } = getToolMeta(call?.name || call?.tool || '')
  const isDone  = result !== null && result !== undefined
  const isError = result?.error

  const inputStr = toStr(
    (() => { try { return JSON.stringify(call?.input || {}, null, 2) } catch { return '' } })()
  )
  const outputStr = toStr(
    (() => {
      if (!result) return ''
      const o = result.output ?? result.content ?? result.result ?? result
      return typeof o === 'string' ? o : JSON.stringify(o, null, 2)
    })()
  )

  return (
    <div className={`rounded-xl border mb-1.5 overflow-hidden ${bg} ${isError ? 'border-red-500/20' : border}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className={`shrink-0 w-[22px] h-[22px] rounded-lg flex items-center justify-center ${bg}`}>
          <Icon size={12} className={color} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-[11.5px] font-medium ${color}`}>{label}</span>
          <span className="text-[10.5px] text-white/25 ml-1.5 font-mono truncate">
            {toStr(call?.name || call?.tool || '')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isDone && <Loader2 size={12} className="text-white/30 animate-spin" />}
          {isDone && !isError && <CheckCircle2 size={12} className="text-emerald-400/70" />}
          {isError && <AlertCircle size={12} className="text-red-400/70" />}
          {open
            ? <ChevronDown size={12} className="text-white/20" />
            : <ChevronRight size={12} className="text-white/20" />
          }
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-3 pb-3 pt-2 space-y-2">
          {inputStr && inputStr !== '{}' && (
            <div>
              <p className="text-[10px] text-white/25 mb-1 uppercase tracking-wider font-medium">Input</p>
              <pre className="text-[11px] text-white/50 font-mono bg-black/20 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-40">
                {inputStr}
              </pre>
            </div>
          )}
          {outputStr && (
            <div>
              <p className="text-[10px] text-white/25 mb-1 uppercase tracking-wider font-medium">Output</p>
              <pre className={`text-[11px] font-mono rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-52 ${isError ? 'text-red-400/80 bg-red-500/5' : 'text-white/50 bg-black/20'}`}>
                {outputStr.slice(0, 1500)}{outputStr.length > 1500 ? '\n…(truncated)' : ''}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Agent routing badge ───────────────────────────────────────────────────────
const AGENT_STYLES = {
  CodingAgent:     { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/15',    dot: 'bg-rose-400'    },
  SearchAgent:     { color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/15',     dot: 'bg-sky-400'     },
  SmartTutorAgent: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', dot: 'bg-emerald-400' },
  GeneralAgent:    { color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/15',  dot: 'bg-violet-400'  },
  VisionAgent:     { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/15',   dot: 'bg-amber-400'   },
  BrowseAgent:     { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/15',    dot: 'bg-blue-400'    },
  FastChatAgent:   { color: 'text-white/40',    bg: 'bg-white/[0.04]',   border: 'border-white/[0.07]',   dot: 'bg-white/30'    },
}

function AgentBadge({ meta }) {
  const name  = toStr(meta?.agent || meta?.model_name || '')
  if (!name || name === 'FastChatAgent') return null
  const style = AGENT_STYLES[name] || AGENT_STYLES.GeneralAgent
  const model = toStr(meta?.model || '')
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] mb-2.5 ${style.bg} ${style.border}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${style.dot}`} />
      <span className={`font-medium ${style.color}`}>{name}</span>
      {model && name !== model && (
        <span className="text-white/20 font-mono text-[10px]">{model}</span>
      )}
    </div>
  )
}

// ── Gemini-style thinking indicator ──────────────────────────────────────────
function ThinkingIndicator({ liveStatus }) {
  if (!liveStatus) return null
  const { mode, text, percent } = liveStatus
  const label = toStr(text)

  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2.5">
        {/* 3 bounce dots — always shown */}
        <div className="flex items-center gap-[5px]">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-[7px] h-[7px] rounded-full bg-white/30"
              style={{ animation: `thinkBounce 1.2s ${i * 0.18}s ease-in-out infinite` }}
            />
          ))}
        </div>

        {/* 3-6s: real backend label */}
        {(mode === 'text' || mode === 'deep') && label && (
          <span className="text-[12px] text-white/40 leading-none">{label}</span>
        )}

        {/* 7s+: percent */}
        {mode === 'deep' && percent > 0 && (
          <span className="text-[11px] text-white/25 font-mono tabular-nums">{percent}%</span>
        )}
      </div>

      {/* 7s+: progress bar */}
      {mode === 'deep' && percent > 0 && (
        <div className="mt-2 h-[2px] w-36 bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500/40 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ── AI action bar ─────────────────────────────────────────────────────────────
function AIActions({ content }) {
  return (
    <div className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <CopyBtn text={content} />
      <button className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all" title="Good">
        <ThumbsUp size={13} />
      </button>
      <button className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all" title="Bad">
        <ThumbsDown size={13} />
      </button>
      <button className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all" title="Retry">
        <RotateCcw size={13} />
      </button>
    </div>
  )
}

// ── User message — RIGHT ──────────────────────────────────────────────────────
function UserMessage({ message }) {
  return (
    <div className="flex justify-end mb-3 px-4">
      <div className="max-w-[75%]">
        {message.attachment && (
          <div className="mb-2 text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.07] border border-white/10 text-white/45 text-xs">
              📎 {toStr(message.attachment.name)}
            </span>
          </div>
        )}
        <div className="inline-block px-4 py-2.5 rounded-[20px] bg-[#2a2b2d] text-white/88 text-[13.5px] leading-relaxed whitespace-pre-wrap">
          {toStr(message.content)}
        </div>
      </div>
    </div>
  )
}

// ── AI message — LEFT with full CoT ──────────────────────────────────────────
function AIMessage({ message }) {
  const { liveStatus, agentMeta, toolCalls = [], content, streaming, error } = message
  const isThinking = streaming && !content && liveStatus
  const safeContent = toStr(content)

  return (
    <div className="group flex items-start gap-3 mb-5 px-4">
      {/* Avatar */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mt-0.5">
        <Sparkles size={13} className="text-white" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">

        {/* Agent badge — only real names */}
        {agentMeta && <AgentBadge meta={agentMeta} />}

        {/* Live tool steps from real SSE */}
        {toolCalls.length > 0 && (
          <div className="mb-3">
            {toolCalls.map((tc, i) => (
              <ToolStep key={i} call={tc.call} result={tc.result} />
            ))}
          </div>
        )}

        {/* Thinking dots */}
        {isThinking && <ThinkingIndicator liveStatus={liveStatus} />}

        {/* Response content */}
        {safeContent && (
          <div className="text-white/88 text-[13.5px] leading-relaxed">
            <ReactMarkdown
              className="markdown"
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeStr = toStr(children)
                  return !inline && match
                    ? <CodeBlock language={match[1]}>{codeStr}</CodeBlock>
                    : (
                      <code
                        className="bg-white/[0.08] px-1.5 py-0.5 rounded text-[12px] text-blue-300 font-mono"
                        {...props}
                      >
                        {codeStr}
                      </code>
                    )
                },
                p({ children }) { return <p className="mb-3 last:mb-0">{children}</p> },
                a({ href, children }) {
                  return (
                    <a href={toStr(href)} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                      {children}
                    </a>
                  )
                },
              }}
            >
              {safeContent}
            </ReactMarkdown>

            {/* Streaming cursor */}
            {streaming && (
              <span className="inline-block w-[2px] h-[14px] bg-white/50 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-1 text-xs text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
            ⚠ {safeContent || 'Something went wrong'}
          </div>
        )}

        {/* Actions after done */}
        {!streaming && safeContent && !error && (
          <AIActions content={safeContent} />
        )}
      </div>
    </div>
  )
}

// ── MessageThread ─────────────────────────────────────────────────────────────
export default function MessageThread({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <style>{`
        @keyframes thinkBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto py-6">
        {messages.map(msg =>
          msg.role === 'user'
            ? <UserMessage key={msg.id} message={msg} />
            : <AIMessage   key={msg.id} message={msg} />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
