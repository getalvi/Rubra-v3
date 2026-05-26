import { useState, useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { sendMessage, uploadFile } from '../api/index.js'

const LS_KEY = 'rubra_sessions_v3'
const load   = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] } }
const save   = s  => { try { localStorage.setItem(LS_KEY, JSON.stringify(s.slice(0, 100))) } catch {} }

export default function useChat() {
  const [sessions,      setSessions]      = useState(load)
  const [activeSid,     setActiveSid]     = useState(null)
  const [messages,      setMessages]      = useState([])
  const [isStreaming,   setIsStreaming]    = useState(false)
  const [completedBg,   setCompletedBg]   = useState([])
  const [streamingSids, setStreamingSids] = useState([])

  const sessionStreams = useRef({})  // { [sid]: { cancel, botId, msgs } }
  const activeSidRef  = useRef(null)

  const setActive = (sid) => { activeSidRef.current = sid; setActiveSid(sid) }

  // ── Persist ───────────────────────────────────────────────────────────────────
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
      save(next); return next
    })
    return sid
  }, [])

  // ── Per-message timers ────────────────────────────────────────────────────────
  const makeTimers = (botId) => {
    let t1, t2
    t1 = setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === botId && m.streaming && m.liveStatus?.mode === 'dots'
          ? { ...m, liveStatus: { ...m.liveStatus, mode: 'text' } } : m
      ))
      t2 = setTimeout(() => {
        setMessages(prev => prev.map(m =>
          m.id === botId && m.streaming
            ? { ...m, liveStatus: { ...m.liveStatus, mode: 'deep' } } : m
        ))
      }, 4000)
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }

  // ── Session controls ──────────────────────────────────────────────────────────
  const startNew = useCallback(() => {
    setActive(null); setMessages([]); setIsStreaming(false)
  }, [])

  const openSession = useCallback(sid => {
    setActive(sid)
    // If this session is streaming, show its live messages
    const stream = sessionStreams.current[sid]
    if (stream) {
      setMessages(stream.msgs)
      setIsStreaming(true)
    } else {
      const stored = load().find(s => s.id === sid)
      setMessages(stored?.messages || [])
      setIsStreaming(false)
    }
  }, [])

  const removeSession = useCallback(sid => {
    sessionStreams.current[sid]?.cancel?.()
    delete sessionStreams.current[sid]
    setStreamingSids(prev => prev.filter(id => id !== sid))
    setSessions(prev => { const next = prev.filter(s => s.id !== sid); save(next); return next })
    if (activeSidRef.current === sid) startNew()
  }, [startNew])

  const stop = useCallback(() => {
    const sid = activeSidRef.current
    sessionStreams.current[sid]?.cancel?.()
    delete sessionStreams.current[sid]
    setStreamingSids(prev => prev.filter(id => id !== sid))
    setIsStreaming(false)
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false, liveStatus: null } : m))
  }, [])

  const dismissAlert = useCallback(sid => {
    setCompletedBg(prev => prev.filter(a => a.sid !== sid))
  }, [])

  // ── Send ──────────────────────────────────────────────────────────────────────
  const send = useCallback((text, opts = {}) => {
    if (!text.trim()) return
    let sid = activeSidRef.current
    if (!sid) { sid = makeSession(text); setActive(sid) }

    const userMsg = { id: uuid(), role: 'user', content: text, ts: Date.now() }
    const botId   = uuid()
    const botMsg  = {
      id: botId, role: 'assistant', content: '', streaming: true,
      agentMeta: null, toolCalls: [],
      liveStatus: { mode: 'dots', text: '', percent: 0 },
      ts: Date.now()
    }

    // Build initial msgs from current UI (active) or stored (background)
    const base = activeSidRef.current === sid
      ? messages  // current UI state
      : (load().find(s => s.id === sid)?.messages || [])
    const initMsgs = [...base, userMsg, botMsg]

    // Show in UI only if active
    if (activeSidRef.current === sid) {
      setMessages(initMsgs)
      setIsStreaming(true)
    }

    const startTime  = Date.now()
    const clearTimer = makeTimers(botId)

    // Live msgs ref for background tracking
    let liveMsgs = [...initMsgs]
    const updateLive = (updater) => {
      liveMsgs = liveMsgs.map(m => m.id === botId ? updater(m) : m)
      // Update stream tracker so openSession shows latest
      if (sessionStreams.current[sid]) sessionStreams.current[sid].msgs = liveMsgs
      // Update UI only if this session is currently viewed
      if (activeSidRef.current === sid) setMessages([...liveMsgs])
    }

    const cancel = sendMessage(
      { message: text, sessionId: sid, mode: 'auto', stream: true },
      {
        onEvent: evt => {
          const ms = Date.now() - startTime

          // Agent badge — only real names
          if (evt.type === 'meta') {
            const name = evt.agent || evt.model_name || ''
            if (name) updateLive(m => ({ ...m, agentMeta: evt }))
          }

          // Tool call
          if (evt.type === 'tool_call') {
            const callId = evt.call_id || evt.id || uuid()
            updateLive(m => ({ ...m, toolCalls: [...m.toolCalls, { call: { call_id: callId, name: evt.name || evt.tool, input: evt.input || {} }, result: null }] }))
          }

          // Tool result
          if (evt.type === 'tool_result') {
            const callId = evt.call_id || evt.id
            updateLive(m => ({
              ...m,
              toolCalls: m.toolCalls.map(tc =>
                tc.call.call_id === callId
                  ? { ...tc, result: { output: evt.output || evt.content || evt.result, error: evt.error } }
                  : tc
              )
            }))
          }

          // Status — timing-gated, backend text only
          if (evt.type === 'status' || evt.progress) {
            const raw = evt.progress
              ? { label: evt.progress.detail || evt.progress.step || '', pct: evt.progress.percent || 0 }
              : { label: evt.text || evt.message || evt.detail || '', pct: evt.percent || 0 }
            if (ms >= 3000 && (raw.label || raw.pct > 0)) {
              const mode = ms >= 7000 ? 'deep' : 'text'
              updateLive(m => ({ ...m, liveStatus: { mode, text: raw.label, percent: raw.pct || m.liveStatus?.percent || 0 } }))
            }
          }

          // Token — ALWAYS clear liveStatus immediately when content arrives
          if ((evt.type === 'token' && evt.content) || (evt.token !== undefined && !evt.type)) {
            clearTimer()
            const content = evt.content ?? evt.token
            updateLive(m => ({ ...m, content, liveStatus: null }))
          }

          // Error
          if (evt.type === 'error') {
            clearTimer()
            updateLive(m => ({ ...m, content: m.content || `⚠ ${evt.message || 'Error'}`, error: true, liveStatus: null }))
          }
        },

        onDone: () => {
          clearTimer()
          // Final cleanup on liveMsgs
          const finalMsgs = liveMsgs.map(m =>
            m.id === botId ? { ...m, streaming: false, liveStatus: null } : m
          )
          liveMsgs = finalMsgs

          delete sessionStreams.current[sid]
          setStreamingSids(prev => prev.filter(id => id !== sid))

          // Persist
          const title = finalMsgs.find(m => m.role === 'user')?.content?.slice(0, 60) || 'New chat'
          setSessions(prev => {
            const next = prev.some(s => s.id === sid)
              ? prev.map(s => s.id === sid ? { ...s, messages: finalMsgs, title, ts: Date.now() } : s)
              : [{ id: sid, title, messages: finalMsgs, ts: Date.now() }, ...prev]
            save(next)
            return next
          })

          // Update UI if active
          if (activeSidRef.current === sid) {
            setMessages([...finalMsgs])
            setIsStreaming(false)
          } else {
            // Background complete alert with real title
            setCompletedBg(prev => prev.some(a => a.sid === sid) ? prev : [...prev, { sid, title }])
          }
        },

        onError: err => {
          clearTimer()
          updateLive(m => ({ ...m, content: m.content || `Error: ${err.message}`, error: true, streaming: false, liveStatus: null }))
          delete sessionStreams.current[sid]
          setStreamingSids(prev => prev.filter(id => id !== sid))
          if (activeSidRef.current === sid) setIsStreaming(false)
        },
      }
    )

    sessionStreams.current[sid] = { cancel, botId, msgs: liveMsgs }
    setStreamingSids(prev => prev.includes(sid) ? prev : [...prev, sid])
  }, [messages, makeSession])

  // ── Send File ─────────────────────────────────────────────────────────────────
  const sendFile = useCallback((file, question = '') => {
    let sid = activeSidRef.current
    if (!sid) { sid = makeSession(question || file.name); setActive(sid) }

    const userMsg = { id: uuid(), role: 'user', content: question || `📎 ${file.name}`, attachment: { name: file.name, type: file.type }, ts: Date.now() }
    const botId   = uuid()
    const botMsg  = { id: uuid(), role: 'assistant', content: '', streaming: true, toolCalls: [], liveStatus: { mode: 'dots', text: '', percent: 0 }, ts: Date.now() }

    setMessages(prev => [...prev, userMsg, botMsg])
    setIsStreaming(true)
    const clearTimer = makeTimers(botId)

    const cancel = uploadFile({ file, sessionId: sid, question }, {
      onEvent: evt => {
        if (evt.type === 'token' && evt.content) {
          clearTimer()
          setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: evt.content, liveStatus: null } : m))
        }
      },
      onDone: () => {
        clearTimer()
        delete sessionStreams.current[sid]
        setStreamingSids(prev => prev.filter(id => id !== sid))
        setIsStreaming(false)
        setMessages(prev => {
          const next = prev.map(m => m.id === botId ? { ...m, streaming: false, liveStatus: null } : m)
          persist(sid, next); return next
        })
      },
      onError: err => {
        clearTimer()
        delete sessionStreams.current[sid]
        setStreamingSids(prev => prev.filter(id => id !== sid))
        setIsStreaming(false)
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: `Upload error: ${err.message}`, error: true, streaming: false, liveStatus: null } : m))
      },
    })
    sessionStreams.current[sid] = { cancel, botId, msgs: [] }
    setStreamingSids(prev => prev.includes(sid) ? prev : [...prev, sid])
  }, [makeSession, persist])

  return {
    sessions, activeSid, messages, isStreaming, completedBg, streamingSids,
    send, sendFile, stop, startNew, openSession, removeSession, dismissAlert,
  }
}
