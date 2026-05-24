/**
 * MessageThread — Full message list with Message component
 * Fixed: self-contained, no broken imports
 */
import React, { useEffect, useRef } from 'react'
import { User, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// ── Copy button with feedback ─────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="btn-icon w-8 h-8"
      aria-label="Copy"
      title={copied ? 'Copied!' : 'Copy'}
    >
      <Copy size={15} className={copied ? 'text-green-400' : ''} />
    </button>
  )
}

// ── Message action buttons ────────────────────────────────────────────────────
function MessageActions({ content }) {
  return (
    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <CopyButton text={content} />
      <button className="btn-icon w-8 h-8" aria-label="Good response">
        <ThumbsUp size={15} />
      </button>
      <button className="btn-icon w-8 h-8" aria-label="Bad response">
        <ThumbsDown size={15} />
      </button>
    </div>
  )
}

// ── Code block renderer ───────────────────────────────────────────────────────
function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, '')
  return (
    <div className="relative group/code my-3">
      <div className="flex items-center justify-between px-4 py-1.5 bg-white/[0.04] border border-white/10 rounded-t-lg">
        <span className="text-[11px] text-white/40 font-mono">{language || 'code'}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          background: '#1a1b1c',
          borderRadius: '0 0 8px 8px',
          padding: '14px 16px',
          fontSize: '12.5px',
          margin: 0,
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: 'none',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Streaming cursor ──────────────────────────────────────────────────────────
function StreamingCursor() {
  return (
    <span className="inline-block w-[2px] h-[14px] bg-white/60 ml-0.5 align-middle animate-pulse" />
  )
}

// ── Single message ────────────────────────────────────────────────────────────
function Message({ message }) {
  const isUser = message.role === 'user'
  const isStreaming = message.streaming

  return (
    <div className={`group py-5 ${isUser ? '' : 'bg-white/[0.015] rounded-2xl px-4 -mx-4'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`
            shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5
            ${isUser
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }
          `}
        >
          {isUser
            ? <User size={15} className="text-white" />
            : <Sparkles size={15} className="text-white" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] font-medium text-white/45 mb-1.5">
            {isUser ? 'You' : 'Rubra'}
          </div>

          {/* Attachment badge */}
          {message.attachment && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 text-xs mb-2">
              📎 {message.attachment.name}
            </div>
          )}

          {/* Text content */}
          <div className="text-white/88 text-[13.5px] leading-relaxed">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <>
                <ReactMarkdown
                  className="markdown"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <CodeBlock language={match[1]}>{children}</CodeBlock>
                      ) : (
                        <code
                          className="bg-white/[0.08] px-1.5 py-0.5 rounded text-[12px] text-blue-300 font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    // Error highlight
                    p({ children }) {
                      return <p className="mb-3 last:mb-0">{children}</p>
                    }
                  }}
                >
                  {message.content || (isStreaming ? '' : '…')}
                </ReactMarkdown>
                {isStreaming && <StreamingCursor />}
              </>
            )}
          </div>

          {/* Error badge */}
          {message.error && (
            <div className="mt-2 text-xs text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
              ⚠ Something went wrong
            </div>
          )}

          {/* Actions */}
          {!isUser && !isStreaming && (
            <MessageActions content={message.content} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Message thread (exported) ─────────────────────────────────────────────────
export default function MessageThread({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
