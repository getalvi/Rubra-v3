/**
 * MessageThread — Real SSE Chain of Thought UI
 *
 * SSE event types handled:
 *   type: 'meta'        → agent routing decision (which model/agent selected)
 *   type: 'tool_call'   → tool being invoked (name + input args)
 *   type: 'tool_result' → tool response (output)
 *   type: 'token'       → chunked text output from model
 *   type: 'status'      → backend status label + optional percent
 *   evt.progress        → { step, detail, percent } from execution loop
 *
 * Status timing rules (no mock text):
 *   < 3s  → dots only
 *   3–6s  → dots + real label from backend
 *   ≥ 7s  → dots + label + % progress bar (all from backend)
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw,
  ChevronDown, ChevronRight, Zap, Search, Code2,
  Globe, Terminal, CheckCircle2, Loader2, AlertCircle
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// ── Helpers ───────────────────────────────────────────────────────────────────
function CopyBtn({ text, size = 14 }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) }}
      className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
      title={done ? 'Copied!' : 'Copy'}
    >
      <Copy size={size} className={done ? 'text-green-400' : ''} />
    </button>
  )
}

function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, '')
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

// ── Tool icon map — real tool names from Rubra backend ────────────────────────
const TOOL_ICONS = {
  web_search:      { Icon: Search,   color: 'text-sky-400',     bg: 'bg-sky-500/10',     label: 'Web Search'   },
  browser:         { Icon: Globe,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Browser'      },
  browse_url:      { Icon: Globe,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Browse URL'   },
  code_execute:    { Icon: Terminal, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Code Execute' },
  python:          { Icon: Code2,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Python'       },
  calculator:      { Icon: Zap,      color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Calculator'   },
  file_read:       { Icon: Code2,    color: 'text-violet-400',  bg: 'bg-violet-500/10',  label: 'File Read'    },
  default:         { Icon: Zap,      color: 'text-white/50',    bg: 'bg-white/[0.06]',   label: 'Tool'         },
}

function getToolMeta(name = '') {
  const key = Object.keys(TOOL_ICONS).find(k => name.toLowerCase().includes(k)) || 'default'
  return { ...TOOL_ICONS[key], label: TOOL_ICONS[key].label }
}

// ── Single tool call step ─────────────────────────────────────────────────────
function ToolStep({ call, result }) {
  const [open, setOpen] = useState(false)
  const { Icon, color, bg, label } = getToolMeta(call.name || call.tool || '')
  const toolName = call.name || call.tool || 'tool'
  const isDone   = !!result
  const isError  = result?.error

  // Stringify input args for display
  const inputStr = (() => {
    const args = call.input || call.args || call.arguments || {}
    if (typeof args === 'string') return args
    try { return JSON.stringify(args, null, 2) } catch { return String(args) }
  })()

  const outputStr = (() => {
    if (!result) return ''
    const out = result.output || result.content || result.result || result.text || result
    if (typeof out === 'string') return out
    try { return JSON.stringify(out, null, 2) } catch { return String(out) }
  })()

  return (
    <div className={`rounded-xl border overflow-hidden mb-2 transition-all ${bg} ${isError ? 'border-red-500/20' : 'border-white/[0.07]'}`}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon size={13} className={color} />
        </div>

        <div className="flex-1 min-w-0">
          <span className={`text-[12px] font-medium ${color}`}>{label}</span>
          <span className="text-[11.5px] text-white/30 ml-2 font-mono">{toolName}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isDone && <Loader2 size={13} className="text-white/30 animate-spin" />}
          {isDone && !isError && <CheckCircle2 size={13} className="text-emerald-400/70" />}
          {isError && <AlertCircle size={13} className="text-red-400/70" />}
          {open ? <ChevronDown size={13} className="text-white/25" /> : <ChevronRight size={13} className="text-white/25" />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-white/[0.06] px-3 pb-3 pt-2 space-y-2">
          {inputStr && (
            <div>
              <p className="text-[10.5px] text-white/25 mb-1 uppercase tracking-wider">Input</p>
              <pre className="text-[11.5px] text-white/60 font-mono bg-black/20 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap">
                {inputStr}
              </pre>
            </div>
          )}
          {outputStr && (
            <div>
              <p className="text-[10.5px] text-white/25 mb-1 uppercase tracking-wider">Output</p>
              <pre className={`text-[11.5px] font-mono rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap ${isError ? 'text-red-400/80 bg-red-500/5' : 'text-white/55 bg-black/20'}`}>
                {outputStr.slice(0, 1200)}{outputStr.length > 1200 ? '\n…(truncated)' : ''}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Agent routing badge — from real meta event ────────────────────────────────
const AGENT_STYLES = {
  CodingAgent:     { color: 'text-rose-400',    bg: 'bg-rose-500/10',     border: 'border-rose-500/15',    dot: 'bg-rose-400'    },
  SearchAgent:     { color: 'text-sky-400',     bg: 'bg-sky-500/10',      border: 'border-sky-500/15',     dot: 'bg-sky-400'     },
  SmartTutorAgent: { color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/15', dot: 'bg-emerald-400' },
  GeneralAgent:    { color: 'text-violet-400',  bg: 'bg-violet-500/10',   border: 'border-violet-500/15',  dot: 'bg-violet-400'  },
  VisionAgent:     { color: 'text-amber-400',   bg: 'bg-amber-500/10',    border: 'border-amber-500/15',   dot: 'bg-amber-400'   },
  BrowseAgent:     { color: 'text-blue-400',    bg: 'bg-blue-500/10',     border: 'border-blue-500/15',    dot: 'bg-blue-400'    },
}

function AgentBadge({ meta }) {
  if (!meta) return null
  const agent = meta.agent || meta.model || ''
  const style = AGENT_STYLES[agent] || { color: 'text-white/40', bg: 'bg-white/[0.05]', border: 'border-white/10', dot: 'bg-white/30' }
  const model = meta.model_name || meta.model || ''

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] mb-3 ${style.bg} ${style.border}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${style.dot}`} />
      <span className={`font-medium ${style.color}`}>{agent || 'Routing…'}</span>
      {model && <span className="text-white/25 font-mono">{model}</span>}
    </div>
  )
}

// ── Thinking indicator (timing-based, no mock text) ───────────────────────────
function ThinkingIndicator({ statusMode, statusText, progress }) {
  return (
    <div className="py-0.5">
      <div className="flex items-center gap-2.5">
        {/* Always: 3 bounce dots */}
        <div className="flex items-center gap-[5px]">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-[7px] h-[7px] rounded-full bg-white/35"
              style={{ animation: `thinkBounce 1.2s ${i * 0.18}s ease-in-out infinite` }}
            />
          ))}
        </div>
        {/* 3–6s: real backend label */}
        {(statusMode === 'text' || statusMode === 'deep') && statusText && (
          <span className="text-[12px] text-white/45 leading-none">{statusText}</span>
        )}
        {/* 7s+: real % */}
        {statusMode === 'deep' && progress > 0 && (
          <span className="text-[11px] text-white/30 font-mono tabular-nums">{progress}%</span>
        )}
      </div>
      {/* 7s+: thin progress bar */}
      {statusMode === 'deep' && progress > 0 && (
        <div className="mt-2 h-[2px] w-40 bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500/50 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
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
              📎 {message.attachment.name}
            </span>
          </div>
        )}
        <div className="inline-block px-4 py-2.5 rounded-[20px] bg-[#2a2b2d] text-white/88 text-[13.5px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}

// ── AI message — LEFT with Chain of Thought ───────────────────────────────────
function AIMessage({ message, statusMode, statusText, progress }) {
  const isThinking = message.streaming && !message.content
  const toolCalls  = message.toolCalls  || []   // [{ call, result }]

  return (
    <div className="group flex items-start gap-3 mb-5 px-4">
      {/* Avatar */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mt-0.5">
        <Sparkles size={13} className="text-white" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">

        {/* Agent routing badge — real from backend meta event */}
        {message.agentMeta && <AgentBadge meta={message.agentMeta} />}

        {/* Chain of Thought: real tool calls from SSE */}
        {toolCalls.length > 0 && (
          <div className="mb-3">
            {toolCalls.map((tc, i) => (
              <ToolStep key={i} call={tc.call} result={tc.result} />
            ))}
          </div>
        )}

        {/* Thinking indicator (timing-based) */}
        {isThinking && (
          <ThinkingIndicator
            statusMode={statusMode}
            statusText={statusText}
            progress={progress}
          />
        )}

        {/* Actual response content */}
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
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
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
