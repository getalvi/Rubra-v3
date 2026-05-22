/**
 * Message — Individual chat message (Gemini-style)
 */
import React from 'react'
import { User, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

function MessageActions() {
  return (
    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="btn-icon w-8 h-8" aria-label="Copy">
        <Copy size={16} />
      </button>
      <button className="btn-icon w-8 h-8" aria-label="Good response">
        <ThumbsUp size={16} />
      </button>
      <button className="btn-icon w-8 h-8" aria-label="Bad response">
        <ThumbsDown size={16} />
      </button>
    </div>
  )
}

export default function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`group py-6 ${isUser ? '' : 'bg-[#1e1f20]/30'}`}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className={`
          shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }
        `}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Sparkles size={18} className="text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Role label */}
          <div className="text-xs font-medium text-white/50 mb-2">
            {isUser ? 'You' : 'Rubra'}
          </div>

          {/* Message content */}
          <div className="text-white/90">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="markdown"
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          background: '#1e1f20',
                          borderRadius: '8px',
                          padding: '16px',
                          fontSize: '13px',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Actions (only for assistant messages) */}
          {!isUser && <MessageActions />}
        </div>
      </div>
    </div>
  )
}
