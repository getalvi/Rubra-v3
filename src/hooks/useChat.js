/**
 * RUBRA v3 — src/hooks/useChat.js
 * Fixed + Progress status tracking added
 */

import { useState, useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { sendMessage, uploadFile } from '../api/index.js'

const LS_KEY = 'rubra_sessions_v2'
const load   = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] } }
const save   = s  => { try { localStorage.setItem(LS_KEY, JSON.stringify(s.slice(0, 100))) } catch {} }

// Human-readable status labels for progress steps
const STEP_LABELS = {
  analyzing:    '🤔 চিন্তা করছি…',
  planning:     '📋 পরিকল্পনা করছি…',
  executing:    '⚙️  কাজ করছি…',
  searching:    '🔍 খুঁজছি…',
  browsing:     '🌐 ব্রাউজ করছি…',
  coding:       '💻 কোড লিখছি…',
  synthesizing: '📝 গুছিয়ে নিচ্ছি…',
  complete:     '✅ হয়ে গেছে!',
  // english fallbacks
  ANALYZING:    '🤔 চিন্তা করছি…',
  PLANNING:     '📋 পরিকল্পনা করছি…',
  EXECUTING:    '⚙️  কাজ করছি…',
  SYNTHESIZING: '📝 গুছিয়ে নিচ্ছি…',
  COMPLETE:     '✅ হয়ে গেছে!',
}

export default function useChat() {
  const [sessions,    setSessions]    = useState(load)
  const [activeSid,   setActiveSid]   = useState(null)
  const [messages,    setMessages]    = useState([])
  const [isStreaming, setIsStreaming]  = useState(false)
  const [agentMeta,   setAgentMeta]   = useState(null)
  const [statusText,  setStatusText]  = useState('')   // ← NEW: live progress text
  const [progress,    setProgress]    = useState(0)    // ← NEW: 0–100
  const cancelRef = useRef(null)

  // ── Persistence ──────────────────────────────────────────────────────────────
  const persist = useCallback((sid, msgs) => {
    setSessions(prev => {
      const title = msgs.find(m => m.role === 'user')?.content?.slice(0, 60) || 'New chat'
      const next  = prev.some(s => s.id === sid)
        ? prev.map(s => s.id === sid ? { ...s, messages: msgs, title, ts: Date.now() } : s)
        : [{ id: sid, title, messages: msgs, ts: Date.now() }, ...prev]
      save(next)
      return next
    })
  }, [])

  const makeSession = useCallback((firstMsg = '') => {
    const sid = uuid()
    setSessions(prev => {
      const next = [{ id: sid, title: firstMsg.slice(0, 60) || 'New chat', messages: [], ts: Date.now() }, ...prev]
      save(next)
      return next
    })
    return sid
  }, [])

  // ── Session Controls ──────────────────────────────────────────────────────────
  const startNew = useCallback(() => {
    cancelRef.current?.()
    setActiveSid(null); setMessages([]); setAgentMeta(null)
    setIsStreaming(false); setStatusText(''); setProgress(0)
  }, [])

  const openSession = useCallback(sid => {
    const all = load()
    const s   = all.find(x => x.id === sid)
    if (!s) return
    cancelRef.current?.()
    setActiveSid(sid); setMessages(s.messages || [])
    setIsStreaming(false); setAgentMeta(null); setStatusText(''); setProgress(0)
  }, [])

  const removeSession = useCallback(sid => {
    setSessions(prev => { const next = prev.filter(s => s.id !== sid); save(next); return next })
    if (activeSid === sid) startNew()
  }, [activeSid, startNew])

  const stop = useCallback(() => {
    cancelRef.current?.()
    setIsStreaming(false); setStatusText(''); setProgress(0)
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m))
  }, [])

  // ── Send Message ──────────────────────────────────────────────────────────────
  const send = useCallback((text, opts = {}) => {
    if (!text.trim() || isStreaming) return

    let sid = activeSid
    if (!sid) { sid = makeSession(text); setActiveSid(sid) }

    const userMsg = { id: uuid(), role: 'user', content: text, ts: Date.now() }
    const botMsg  = { id: uuid(), role: 'assistant', content: '', streaming: true,
                      agentMeta: null, toolResults: [], ts: Date.now() }
    const botId   = botMsg.id

    setMessages(prev => [...prev, userMsg, botMsg])
    setIsStreaming(true)
    setAgentMeta(null)
    setStatusText('🤔 চিন্তা করছি…')
    setProgress(5)

    let full = ''

    cancelRef.current = sendMessage(
      { message: text, sessionId: sid, taskType: opts.taskType, mode: opts.mode },
      {
        onEvent: evt => {
          // ── Progress event ────────────────────────────────────────────────
          if (evt.type === 'meta') {
            setAgentMeta(evt)
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, agentMeta: evt } : m
            ))
          }

          // Progress from Hermes steps
          if (evt.progress) {
            const step    = evt.progress.step || ''
            const pct     = evt.progress.percent || 0
            const label   = STEP_LABELS[step] || evt.progress.detail || '⚙️ কাজ করছি…'
            setStatusText(label)
            setProgress(pct)
          }

          // ── Token event ───────────────────────────────────────────────────
          if (evt.type === 'token') {
            if (evt.content) {
              // Filter out progress lines (lines starting with emoji progress indicators)
              // that backend accidentally sends as token content
              const isProgressLine = /^[🤔📋⚙️📝✅🔍🌐💻]/.test(evt.content.trim())
              if (!isProgressLine) {
                full = evt.content
                setStatusText('📝 গুছিয়ে নিচ্ছি…')
                setProgress(90)
                setMessages(prev => prev.map(m =>
                  m.id === botId ? { ...m, content: full } : m
                ))
              }
            }

          } else if (evt.type === 'tool_result') {
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, toolResults: [...(m.toolResults || []), evt] }
                : m
            ))

          } else if (evt.type === 'error') {
            setStatusText('')
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, content: m.content || `⚠ ${evt.message || 'Error occurred'}`, error: true }
                : m
            ))

          } else if (evt.token !== undefined) {
            // backward-compat
            full = evt.token
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }
        },

        onDone: () => {
          setIsStreaming(false)
          setStatusText('')
          setProgress(100)
          setTimeout(() => setProgress(0), 600)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === botId ? { ...m, streaming: false } : m
            )
            persist(sid, next)
            return next
          })
        },

        onError: err => {
          setIsStreaming(false)
          setStatusText('')
          setProgress(0)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === botId
                ? { ...m, content: m.content || `Connection error: ${err.message}`, error: true, streaming: false }
                : m
            )
            persist(sid, next)
            return next
          })
        },
      }
    )
  }, [activeSid, isStreaming, makeSession, persist])

  // ── Send File ──────────────────────────────────────────────────────────────
  const sendFile = useCallback((file, question = '', opts = {}) => {
    if (isStreaming) return

    let sid = activeSid
    if (!sid) { sid = makeSession(question || file.name); setActiveSid(sid) }

    const userMsg = {
      id: uuid(), role: 'user',
      content: question || `📎 ${file.name}`,
      attachment: { name: file.name, type: file.type, size: file.size },
      ts: Date.now()
    }
    const botMsg = {
      id: uuid(), role: 'assistant',
      content: '', streaming: true, toolResults: [], ts: Date.now()
    }
    const botId = botMsg.id

    setMessages(prev => [...prev, userMsg, botMsg])
    setIsStreaming(true)
    setStatusText('📎 ফাইল পড়ছি…')
    setProgress(20)

    let full = ''

    cancelRef.current = uploadFile(
      { file, sessionId: sid, question, mode: opts.mode },
      {
        onEvent: evt => {
          if (evt.type === 'token' && evt.content) {
            full = evt.content
            setStatusText('📝 গুছিয়ে নিচ্ছি…')
            setProgress(90)
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }
        },
        onDone: () => {
          setIsStreaming(false); setStatusText(''); setProgress(0)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === botId ? { ...m, streaming: false } : m
            )
            persist(sid, next)
            return next
          })
        },
        onError: err => {
          setIsStreaming(false); setStatusText(''); setProgress(0)
          setMessages(prev => prev.map(m =>
            m.id === botId
              ? { ...m, content: `Upload error: ${err.message}`, error: true, streaming: false }
              : m
          ))
        },
      }
    )
  }, [activeSid, isStreaming, makeSession, persist])

  return {
    sessions, activeSid, messages, isStreaming, agentMeta,
    statusText, progress,   // ← export করা হলো
    send, sendFile, stop, startNew, openSession, removeSession
  }
}
