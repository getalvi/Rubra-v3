/**
 * RUBRA v3 — useChat.js (final clean version)
 *
 * Key fixes:
 * 1. liveMsgs ref → background session liveStatus always clears on done/error
 * 2. status events ignored after content starts (api layer handles this too)
 * 3. streamingSids reactive state → sidebar pulse dot accurate
 * 4. Background complete alert with real title
 * 5. mode: 'auto' always — backend decides agent
 */

import { useState, useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { sendMessage, uploadFile } from '../api/index.js'

const LS_KEY = 'rubra_sessions_v3'
const load   = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] } }
const save   = s  => { try { localStorage.setItem(LS_KEY, JSON.stringify(s.slice(0, 100))) } catch {} }

// Timing-based mode upgrade for a single botId
function makeTimers(botId, setMessages) {
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

export default function useChat() {
  const [sessions,      setSessions]      = useState(load)
  const [activeSid,     setActiveSid]     = useState(null)
  const [messages,      setMessages]      = useState([])
  const [isStreaming,   setIsStreaming]    = useState(false)
  const [completedBg,   setCompletedBg]   = useState([])
  const [streamingSids, setStreamingSids] = useState([])

  // { [sid]: { cancel, botId, liveMsgs[] } }
  const streams    = useRef({})
  const activeSidRef = useRef(null)

  const setActive = useCallback((sid) => {
    activeSidRef.current = sid
    setActiveSid(sid)
  }, [])

  // ── Persist to localStorage ───────────────────────────────────────────────────
  const persistMsgs = useCallback((sid, msgs) => {
    const title = msgs.find(m => m.role === 'user')?.content?.slice(0, 60) || 'New chat'
    setSessions(prev => {
      const next = prev.some(s => s.id === sid)
        ? prev.map(s => s.id === sid ? { ...s, messages: msgs, title, ts: Date.now() } : s)
        : [{ id: sid, title, messages: msgs, ts: Date.now() }, ...prev]
      save(next)
      return next
    })
    return title
  }, [])

  const makeSession = useCallback((firstMsg = '') => {
    const sid = uuid()
    const title = firstMsg.slice(0, 60) || 'New chat'
    setSessions(prev => {
      const next = [{ id: sid, title, messages: [], ts: Date.now() }, ...prev]
      save(next); return next
    })
    return sid
  }, [])

  // ── Session controls ──────────────────────────────────────────────────────────
  const startNew = useCallback(() => {
    setActive(null); setMessages([]); setIsStreaming(false)
  }, [setActive])

  const openSession = useCallback(sid => {
    setActive(sid)
    const stream = streams.current[sid]
    if (stream) {
      // Show live messages for this streaming session
      setMessages([...stream.liveMsgs])
      setIsStreaming(true)
    } else {
      const stored = load().find(s => s.id === sid)
      setMessages(stored?.messages || [])
      setIsStreaming(false)
    }
  }, [setActive])

  const removeSession = useCallback(sid => {
    streams.current[sid]?.cancel?.()
    delete streams.current[sid]
    setStreamingSids(prev => prev.filter(id => id !== sid))
    setSessions(prev => { const next = prev.filter(s => s.id !== sid); save(next); return next })
    if (activeSidRef.current === sid) startNew()
  }, [startNew])

  const stop = useCallback(() => {
    const sid = activeSidRef.current
    streams.current[sid]?.cancel?.()
    delete streams.current[sid]
    setStreamingSids(prev => prev.filter(id => id !== sid))
    setIsStreaming(false)
    setMessages(prev => prev.map(m =>
      m.streaming ? { ...m, streaming: false, liveStatus: null } : m
    ))
  }, [])

  const dismissAlert = useCallback(sid => {
    setCompletedBg(prev => prev.filter(a => a.sid !== sid))
  }, [])

  // ── Core send ─────────────────────────────────────────────────────────────────
  const send = useCallback((text, _opts = {}) => {
    if (!text.trim()) return

    let sid = activeSidRef.current
    if (!sid) { sid = makeSession(text); setActive(sid) }

    const userMsg = { id: uuid(), role: 'user', content: text, ts: Date.now() }
    const botId   = uuid()
    const botMsg  = {
      id: botId, role: 'assistant', content: '',
      streaming: true, agentMeta: null, toolCalls: [],
      liveStatus: { mode: 'dots', text: '', percent: 0 },
      ts: Date.now(),
    }

    // Base messages: use active UI or stored
    const base = activeSidRef.current === sid
      ? messages
      : (load().find(s => s.id === sid)?.messages || [])
    let liveMsgs = [...base, userMsg, botMsg]

    if (activeSidRef.current === sid) {
      setMessages([...liveMsgs])
      setIsStreaming(true)
    }

    const startTime  = Date.now()
    const clearTimer = makeTimers(botId, setMessages)

    // Update both liveMsgs ref and UI if active
    const updateBot = (updater) => {
      liveMsgs = liveMsgs.map(m => m.id === botId ? updater(m) : m)
      if (streams.current[sid]) streams.current[sid].liveMsgs = liveMsgs
      if (activeSidRef.current === sid) setMessages([...liveMsgs])
    }

    const cancel = sendMessage(
      { message: text, sessionId: sid, mode: 'auto' },
      {
        onEvent: evt => {
          const ms = Date.now() - startTime

          if (evt.type === 'meta') {
            const name = evt.agent || evt.model_name || ''
            if (name) updateBot(m => ({ ...m, agentMeta: evt }))
          }

          if (evt.type === 'tool_call') {
            const callId = evt.call_id || evt.id || uuid()
            updateBot(m => ({
              ...m,
              toolCalls: [...m.toolCalls, {
                call: { call_id: callId, name: evt.name || evt.tool, input: evt.input || {} },
                result: null
              }]
            }))
          }

          if (evt.type === 'tool_result') {
            const callId = evt.call_id || evt.id
            updateBot(m => ({
              ...m,
              toolCalls: m.toolCalls.map(tc =>
                tc.call.call_id === callId
                  ? { ...tc, result: { output: evt.output || evt.content || evt.result, error: evt.error } }
                  : tc
              )
            }))
          }

          // Status: only show if ≥3s and no content yet
          if (evt.type === 'status') {
            const hasContent = liveMsgs.find(m => m.id === botId)?.content
            if (!hasContent && ms >= 3000 && evt.text) {
              const mode = ms >= 7000 ? 'deep' : 'text'
              updateBot(m => ({ ...m, liveStatus: { mode, text: evt.text, percent: evt.percent || m.liveStatus?.percent || 0 } }))
            }
          }

          // Token: clear liveStatus immediately
          if (evt.type === 'token') {
            clearTimer()
            updateBot(m => ({ ...m, content: evt.content, liveStatus: null }))
          }

          if (evt.type === 'error') {
            clearTimer()
            updateBot(m => ({ ...m, content: `⚠ ${evt.message || 'Error'}`, error: true, liveStatus: null }))
          }
        },

        onDone: () => {
          clearTimer()
          // Final: clear streaming + liveStatus
          liveMsgs = liveMsgs.map(m =>
            m.id === botId ? { ...m, streaming: false, liveStatus: null } : m
          )
          if (streams.current[sid]) streams.current[sid].liveMsgs = liveMsgs

          delete streams.current[sid]
          setStreamingSids(prev => prev.filter(id => id !== sid))

          const title = persistMsgs(sid, liveMsgs)

          if (activeSidRef.current === sid) {
            setMessages([...liveMsgs])
            setIsStreaming(false)
          } else {
            // Background done → show alert
            setCompletedBg(prev =>
              prev.some(a => a.sid === sid) ? prev : [...prev, { sid, title }]
            )
          }
        },

        onError: err => {
          clearTimer()
          updateBot(m => ({
            ...m,
            content: m.content || `Connection error: ${err.message}`,
            error: true, streaming: false, liveStatus: null
          }))
          delete streams.current[sid]
          setStreamingSids(prev => prev.filter(id => id !== sid))
          if (activeSidRef.current === sid) setIsStreaming(false)
        },
      }
    )

    streams.current[sid] = { cancel, botId, liveMsgs }
    setStreamingSids(prev => prev.includes(sid) ? prev : [...prev, sid])
  }, [messages, makeSession, setActive, persistMsgs])

  // ── Send file ─────────────────────────────────────────────────────────────────
  const sendFile = useCallback((file, question = '') => {
    let sid = activeSidRef.current
    if (!sid) { sid = makeSession(question || file.name); setActive(sid) }

    const userMsg = {
      id: uuid(), role: 'user',
      content: question || `📎 ${file.name}`,
      attachment: { name: file.name, type: file.type },
      ts: Date.now()
    }
    const botId  = uuid()
    const botMsg = {
      id: botId, role: 'assistant', content: '', streaming: true,
      toolCalls: [], liveStatus: { mode: 'dots', text: '', percent: 0 }, ts: Date.now()
    }

    setMessages(prev => [...prev, userMsg, botMsg])
    setIsStreaming(true)
    const clearTimer = makeTimers(botId, setMessages)

    const cancel = uploadFile({ file, sessionId: sid, question }, {
      onEvent: evt => {
        if (evt.type === 'token') {
          clearTimer()
          setMessages(prev => prev.map(m =>
            m.id === botId ? { ...m, content: evt.content, liveStatus: null } : m
          ))
        }
      },
      onDone: () => {
        clearTimer()
        delete streams.current[sid]
        setStreamingSids(prev => prev.filter(id => id !== sid))
        setIsStreaming(false)
        setMessages(prev => {
          const next = prev.map(m =>
            m.id === botId ? { ...m, streaming: false, liveStatus: null } : m
          )
          persistMsgs(sid, next)
          return next
        })
      },
      onError: err => {
        clearTimer()
        delete streams.current[sid]
        setStreamingSids(prev => prev.filter(id => id !== sid))
        setIsStreaming(false)
        setMessages(prev => prev.map(m =>
          m.id === botId
            ? { ...m, content: `Upload error: ${err.message}`, error: true, streaming: false, liveStatus: null }
            : m
        ))
      },
    })

    streams.current[sid] = { cancel, botId, liveMsgs: [] }
    setStreamingSids(prev => prev.includes(sid) ? prev : [...prev, sid])
  }, [makeSession, setActive, persistMsgs])

  return {
    sessions, activeSid, messages, isStreaming, completedBg, streamingSids,
    send, sendFile, stop, startNew, openSession, removeSession, dismissAlert,
  }
}
