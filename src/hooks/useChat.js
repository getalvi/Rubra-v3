/**
 * RUBRA v3 — useChat.js
 *
 * Status rules:
 *  < 3s  → শুধু dots (statusText = '', statusMode = 'dots')
 *  3–6s  → backend থেকে আসা real status text দেখাবে
 *  > 7s  → deep thinking mode: status + % progress (backend থেকে real value)
 *
 * কোনো hardcoded বাংলা text নেই — সব backend SSE থেকে আসে।
 */

import { useState, useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { sendMessage, uploadFile } from '../api/index.js'

const LS_KEY = 'rubra_sessions_v2'
const load   = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] } }
const save   = s  => { try { localStorage.setItem(LS_KEY, JSON.stringify(s.slice(0, 100))) } catch {} }

export default function useChat() {
  const [sessions,    setSessions]    = useState(load)
  const [activeSid,   setActiveSid]   = useState(null)
  const [messages,    setMessages]    = useState([])
  const [isStreaming, setIsStreaming]  = useState(false)
  const [agentMeta,   setAgentMeta]   = useState(null)

  // Status state — driven by timing + backend
  const [statusText,  setStatusText]  = useState('')    // real text from backend
  const [statusMode,  setStatusMode]  = useState('dots') // 'dots' | 'text' | 'deep'
  const [progress,    setProgress]    = useState(0)     // 0–100 from backend only

  const cancelRef   = useRef(null)
  const startTimeRef = useRef(null)   // when current request started
  const timerRef    = useRef(null)    // timing upgrade timer

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

  // ── Reset status ─────────────────────────────────────────────────────────────
  const resetStatus = useCallback(() => {
    clearTimeout(timerRef.current)
    setStatusText('')
    setStatusMode('dots')
    setProgress(0)
    startTimeRef.current = null
  }, [])

  // ── Start timing-based mode upgrade ─────────────────────────────────────────
  const startTimers = useCallback(() => {
    startTimeRef.current = Date.now()

    // After 3s: if backend hasn't sent status yet, stay dots
    // After 7s: deep mode
    timerRef.current = setTimeout(() => {
      setStatusMode(prev => prev === 'dots' ? 'dots' : prev) // still dots if no backend text
      // inner timer for deep at 7s
      timerRef.current = setTimeout(() => {
        setStatusMode('deep')
      }, 4000) // 3s + 4s = 7s total
    }, 3000)
  }, [])

  // ── Session Controls ──────────────────────────────────────────────────────────
  const startNew = useCallback(() => {
    cancelRef.current?.()
    resetStatus()
    setActiveSid(null); setMessages([]); setAgentMeta(null); setIsStreaming(false)
  }, [resetStatus])

  const openSession = useCallback(sid => {
    const all = load()
    const s   = all.find(x => x.id === sid)
    if (!s) return
    cancelRef.current?.()
    resetStatus()
    setActiveSid(sid); setMessages(s.messages || [])
    setIsStreaming(false); setAgentMeta(null)
  }, [resetStatus])

  const removeSession = useCallback(sid => {
    setSessions(prev => { const next = prev.filter(s => s.id !== sid); save(next); return next })
    if (activeSid === sid) startNew()
  }, [activeSid, startNew])

  const stop = useCallback(() => {
    cancelRef.current?.()
    resetStatus()
    setIsStreaming(false)
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m))
  }, [resetStatus])

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
    // Start in dots mode — no hardcoded text
    setStatusMode('dots')
    setStatusText('')
    setProgress(0)
    startTimers()

    let full = ''

    cancelRef.current = sendMessage(
      { message: text, sessionId: sid, taskType: opts.taskType, mode: opts.mode },
      {
        onEvent: evt => {

          // ── Agent meta ────────────────────────────────────────────────────
          if (evt.type === 'meta') {
            setAgentMeta(evt)
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, agentMeta: evt } : m
            ))
          }

          // ── Real progress from backend ────────────────────────────────────
          // Only show if elapsed time ≥ 3s
          if (evt.progress) {
            const elapsed = Date.now() - (startTimeRef.current || Date.now())
            const pct   = typeof evt.progress.percent === 'number' ? evt.progress.percent : 0
            const label = evt.progress.detail || evt.progress.step || ''

            if (elapsed >= 3000 && label) {
              setStatusText(label)          // real label from backend
              setStatusMode(elapsed >= 7000 ? 'deep' : 'text')
            }
            if (pct > 0) setProgress(pct)  // real % from backend
          }

          // ── Status event (some backends send type:'status') ───────────────
          if (evt.type === 'status') {
            const elapsed = Date.now() - (startTimeRef.current || Date.now())
            const label = evt.text || evt.message || evt.detail || ''
            if (elapsed >= 3000 && label) {
              setStatusText(label)
              setStatusMode(elapsed >= 7000 ? 'deep' : 'text')
            }
            if (typeof evt.percent === 'number' && evt.percent > 0) {
              setProgress(evt.percent)
            }
          }

          // ── Token (actual response content) ──────────────────────────────
          if (evt.type === 'token' && evt.content) {
            full = evt.content
            // Response started → clear status
            clearTimeout(timerRef.current)
            setStatusText('')
            setStatusMode('dots')
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }

          // Backward compat: plain token field
          if (evt.token !== undefined && !evt.type) {
            full = evt.token
            clearTimeout(timerRef.current)
            setStatusText('')
            setStatusMode('dots')
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }

          // ── Tool result ───────────────────────────────────────────────────
          if (evt.type === 'tool_result') {
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, toolResults: [...(m.toolResults || []), evt] }
                : m
            ))
          }

          // ── Error ─────────────────────────────────────────────────────────
          if (evt.type === 'error') {
            resetStatus()
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, content: m.content || `⚠ ${evt.message || 'Error occurred'}`, error: true }
                : m
            ))
          }
        },

        onDone: () => {
          resetStatus()
          setIsStreaming(false)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === botId ? { ...m, streaming: false } : m
            )
            persist(sid, next)
            return next
          })
        },

        onError: err => {
          resetStatus()
          setIsStreaming(false)
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
  }, [activeSid, isStreaming, makeSession, persist, startTimers, resetStatus])

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
    setStatusMode('dots')
    setStatusText('')
    setProgress(0)
    startTimers()

    let full = ''

    cancelRef.current = uploadFile(
      { file, sessionId: sid, question, mode: opts.mode },
      {
        onEvent: evt => {
          if (evt.type === 'token' && evt.content) {
            full = evt.content
            clearTimeout(timerRef.current)
            setStatusText('')
            setStatusMode('dots')
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }
        },
        onDone: () => {
          resetStatus()
          setIsStreaming(false)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === botId ? { ...m, streaming: false } : m
            )
            persist(sid, next)
            return next
          })
        },
        onError: err => {
          resetStatus()
          setIsStreaming(false)
          setMessages(prev => prev.map(m =>
            m.id === botId
              ? { ...m, content: `Upload error: ${err.message}`, error: true, streaming: false }
              : m
          ))
        },
      }
    )
  }, [activeSid, isStreaming, makeSession, persist, startTimers, resetStatus])

  return {
    sessions, activeSid, messages, isStreaming, agentMeta,
    statusText, statusMode, progress,
    send, sendFile, stop, startNew, openSession, removeSession
  }
}
