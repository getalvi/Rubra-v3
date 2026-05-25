/**
 * RUBRA v3 — useChat.js
 *
 * Real SSE events handled:
 *   type: 'meta'        → agent/model routing (stored in message.agentMeta)
 *   type: 'tool_call'   → live tool invocation (appended to message.toolCalls)
 *   type: 'tool_result' → tool output matched to pending call
 *   type: 'token'       → chunked text output
 *   type: 'status'      → backend status label + optional percent
 *   evt.progress        → { step, detail, percent }
 *
 * Status timing rules (no hardcoded text — all from backend):
 *   0–3s  → statusMode='dots'  (no text)
 *   3–6s  → statusMode='text'  (real label from backend)
 *   ≥7s   → statusMode='deep'  (label + real % bar)
 */

import { useState, useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { sendMessage, uploadFile } from '../api/index.js'

const LS_KEY = 'rubra_sessions_v3'
const load   = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] } }
const save   = s  => { try { localStorage.setItem(LS_KEY, JSON.stringify(s.slice(0, 100))) } catch {} }

export default function useChat() {
  const [sessions,    setSessions]   = useState(load)
  const [activeSid,   setActiveSid]  = useState(null)
  const [messages,    setMessages]   = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [agentMeta,   setAgentMeta]  = useState(null)
  const [statusText,  setStatusText] = useState('')
  const [statusMode,  setStatusMode] = useState('dots')
  const [progress,    setProgress]   = useState(0)

  const cancelRef    = useRef(null)
  const startTimeRef = useRef(null)
  const timerRef     = useRef(null)
  // Track pending tool_call waiting for its tool_result
  // key: call_id → botMsg id
  const pendingToolsRef = useRef({})

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

  // ── Status reset ──────────────────────────────────────────────────────────────
  const resetStatus = useCallback(() => {
    clearTimeout(timerRef.current)
    setStatusText('')
    setStatusMode('dots')
    setProgress(0)
    startTimeRef.current = null
    pendingToolsRef.current = {}
  }, [])

  // ── Timing-based mode upgrade ─────────────────────────────────────────────────
  const startTimers = useCallback(() => {
    startTimeRef.current = Date.now()
    // 3s → allow text mode (if backend sends label)
    timerRef.current = setTimeout(() => {
      // only upgrade if still streaming
      setStatusMode(prev => prev === 'dots' ? 'text' : prev)
      // 7s → deep mode
      timerRef.current = setTimeout(() => {
        setStatusMode('deep')
      }, 4000)
    }, 3000)
  }, [])

  // ── Session controls ──────────────────────────────────────────────────────────
  const startNew = useCallback(() => {
    cancelRef.current?.()
    resetStatus()
    setActiveSid(null); setMessages([]); setAgentMeta(null); setIsStreaming(false)
  }, [resetStatus])

  const openSession = useCallback(sid => {
    const s = load().find(x => x.id === sid)
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

  // ── Elapsed helper ────────────────────────────────────────────────────────────
  const elapsed = () => Date.now() - (startTimeRef.current || Date.now())

  // ── Send ──────────────────────────────────────────────────────────────────────
  const send = useCallback((text, opts = {}) => {
    if (!text.trim() || isStreaming) return

    let sid = activeSid
    if (!sid) { sid = makeSession(text); setActiveSid(sid) }

    const userMsg = { id: uuid(), role: 'user', content: text, ts: Date.now() }
    const botId   = uuid()
    const botMsg  = {
      id: botId, role: 'assistant', content: '',
      streaming: true, agentMeta: null,
      toolCalls: [],   // [{ call: {...}, result: null|{...} }]
      ts: Date.now()
    }

    setMessages(prev => [...prev, userMsg, botMsg])
    setIsStreaming(true)
    setAgentMeta(null)
    setStatusMode('dots')
    setStatusText('')
    setProgress(0)
    pendingToolsRef.current = {}
    startTimers()

    let full = ''

    cancelRef.current = sendMessage(
      { message: text, sessionId: sid, taskType: opts.taskType, mode: opts.mode },
      {
        onEvent: evt => {

          // ── Agent / model routing ─────────────────────────────────────────
          if (evt.type === 'meta') {
            setAgentMeta(evt)
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, agentMeta: evt } : m
            ))
          }

          // ── Real tool_call from execution loop ────────────────────────────
          if (evt.type === 'tool_call') {
            const callId = evt.call_id || evt.id || uuid()
            const call   = { call_id: callId, name: evt.name || evt.tool, input: evt.input || evt.args || {} }
            // Register pending
            pendingToolsRef.current[callId] = true
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, toolCalls: [...m.toolCalls, { call, result: null }] }
                : m
            ))
          }

          // ── Tool result — match to pending call ───────────────────────────
          if (evt.type === 'tool_result') {
            const callId = evt.call_id || evt.id
            const result = { output: evt.output || evt.content || evt.result, error: evt.error }
            delete pendingToolsRef.current[callId]
            setMessages(prev => prev.map(m => {
              if (m.id !== botId) return m
              const toolCalls = m.toolCalls.map(tc =>
                tc.call.call_id === callId ? { ...tc, result } : tc
              )
              return { ...m, toolCalls }
            }))
          }

          // ── Backend status label (real, not hardcoded) ────────────────────
          if (evt.type === 'status') {
            const label = evt.text || evt.message || evt.detail || ''
            if (elapsed() >= 3000 && label) {
              setStatusText(label)
              setStatusMode(elapsed() >= 7000 ? 'deep' : 'text')
            }
            if (typeof evt.percent === 'number' && evt.percent > 0) setProgress(evt.percent)
          }

          // ── Progress from Rubra execution loop ────────────────────────────
          if (evt.progress) {
            const label = evt.progress.detail || evt.progress.step || ''
            const pct   = typeof evt.progress.percent === 'number' ? evt.progress.percent : 0
            if (elapsed() >= 3000 && label) {
              setStatusText(label)
              setStatusMode(elapsed() >= 7000 ? 'deep' : 'text')
            }
            if (pct > 0) setProgress(pct)
          }

          // ── Chunked token output ──────────────────────────────────────────
          if (evt.type === 'token' && evt.content) {
            full = evt.content
            // clear thinking state once text arrives
            clearTimeout(timerRef.current)
            setStatusText('')
            setStatusMode('dots')
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }

          // backward compat: plain token field
          if (evt.token !== undefined && !evt.type) {
            full = evt.token
            clearTimeout(timerRef.current)
            setStatusText('')
            setStatusMode('dots')
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }

          // ── Error ─────────────────────────────────────────────────────────
          if (evt.type === 'error') {
            resetStatus()
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, content: m.content || `⚠ ${evt.message || 'Error'}`, error: true }
                : m
            ))
          }
        },

        onDone: () => {
          resetStatus()
          setIsStreaming(false)
          setMessages(prev => {
            const next = prev.map(m => m.id === botId ? { ...m, streaming: false } : m)
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

  // ── Send File ─────────────────────────────────────────────────────────────────
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
    const botId  = uuid()
    const botMsg = { id: botId, role: 'assistant', content: '', streaming: true, toolCalls: [], ts: Date.now() }

    setMessages(prev => [...prev, userMsg, botMsg])
    setIsStreaming(true)
    setStatusMode('dots')
    setStatusText('')
    setProgress(0)
    startTimers()

    cancelRef.current = uploadFile(
      { file, sessionId: sid, question, mode: opts.mode },
      {
        onEvent: evt => {
          if (evt.type === 'token' && evt.content) {
            clearTimeout(timerRef.current)
            setStatusText('')
            setStatusMode('dots')
            setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: evt.content } : m))
          }
        },
        onDone: () => {
          resetStatus(); setIsStreaming(false)
          setMessages(prev => {
            const next = prev.map(m => m.id === botId ? { ...m, streaming: false } : m)
            persist(sid, next); return next
          })
        },
        onError: err => {
          resetStatus(); setIsStreaming(false)
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
