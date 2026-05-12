/**
 * MessageBubble — renders a single chat message
 * Supports: markdown, code highlighting, tool results, streaming cursor
 */

import React, { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Bot, User, Zap, Globe, BookOpen, Code2, Brain } from 'lucide-react'
import styles from './MessageBubble.module.css'

// ── Agent icon map ────────────────────────────────────────
const AGENT_ICONS = {
  CodingAgent:    <Code2  size={12} />,
  SearchAgent:    <Globe  size={12} />,
  SmartTutorAgent:<BookOpen size={12} />,
  GeneralAgent:   <Brain  size={12} />,
  VisionAgent:    <Zap    size={12} />,
  BrowseAgent:    <Globe  size={12} />,
  default:        <Bot    size={12} />,
}

const AGENT_LABELS = {
  CodingAgent:    'Code',
  SearchAgent:    'Search',
  SmartTutorAgent:'Tutor',
  GeneralAgent:   'General',
  VisionAgent:    'Vision',
  BrowseAgent:    'Browse',
}

// ── Copy button ───────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [text])
  return (
    <button className={styles.copyBtn} onClick={copy} title="Copy code" aria-label="Copy code">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

// ── Code block ────────────────────────────────────────────
function CodeBlock({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '')
  const code = String(children).replace(/\n$/, '')

  if (inline) {
    return <code className={styles.inlineCode} {...props}>{children}</code>
  }

  return (
    <div className={styles.codeWrapper}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{match?.[1] || 'code'}</span>
        <CopyBtn text={code} />
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={match?.[1] || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 10px 10px',
          background: 'rgba(0,0,0,0.55)',
          fontSize: '0.825rem',
          lineHeight: 1.6,
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Tool result badges ────────────────────────────────────
function ToolResults({ results }) {
  if (!results?.length) return null
  return (
    <div className={styles.toolResults}>
      {results.map((r, i) => (
        <span key={i} className={styles.toolBadge}>
          {r.tool === 'weather' && '🌤'}
          {r.tool === 'crypto'  && '₿'}
          {r.tool === 'news'    && '📰'}
          {r.tool === 'wikipedia' && '📚'}
          {r.title || r.tool}
        </span>
      ))}
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────
function TypingDots() {
  return (
    <span className={styles.typingDots} aria-label="Thinking...">
      <span /><span /><span />
    </span>
  )
}

// ── Main component ────────────────────────────────────────
export default function MessageBubble({ message }) {
  const { role, content, isStreaming, agentInfo, toolResults, error, attachment } = message
  const [copied, setCopied] = useState(false)

  const isUser = role === 'user'
  const isEmpty = !content && isStreaming

  const copyMsg = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [content])

  return (
    <div className={`${styles.row} ${isUser ? styles.userRow : styles.assistantRow} animate-fade-in`}>
      {/* Avatar */}
      {!isUser && (
        <div className={styles.avatar} aria-hidden="true">
          <div className={styles.avatarInner}>R</div>
        </div>
      )}

      <div className={styles.bubble}>
        {/* Agent badge */}
        {!isUser && agentInfo?.agent && (
          <div className={styles.agentBadge}>
            {AGENT_ICONS[agentInfo.agent] || AGENT_ICONS.default}
            <span>{AGENT_LABELS[agentInfo.agent] || agentInfo.agent}</span>
          </div>
        )}

        {/* Tool results */}
        <ToolResults results={toolResults} />

        {/* File attachment label */}
        {attachment && (
          <div className={styles.attachment}>
            📎 <span>{attachment.name}</span>
            <span className={styles.attachSize}>
              {(attachment.size / 1024).toFixed(0)}KB
            </span>
          </div>
        )}

        {/* Content */}
        <div className={`${styles.content} ${error ? styles.error : ''}`}>
          {isEmpty ? (
            <TypingDots />
          ) : isUser ? (
            <span className={styles.userText}>{content}</span>
          ) : (
            <div className="prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && <span className={styles.cursor} aria-hidden="true" />}
            </div>
          )}
        </div>

        {/* Copy button (assistant only, after streaming) */}
        {!isUser && content && !isStreaming && (
          <button className={styles.msgCopyBtn} onClick={copyMsg} title="Copy response" aria-label="Copy response">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className={`${styles.avatar} ${styles.userAvatar}`} aria-hidden="true">
          <User size={14} />
        </div>
      )}
    </div>
  )
}
