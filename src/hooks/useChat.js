/**
 * RUBRA v3 — useChat.js
 *
 * Fixes:
 * 1. Background sessions — session switch করলে চলমান session cancel হয় না
 *    প্রতিটা session এর নিজস্ব cancelRef, streamingBotId track করে
 * 2. Task complete alert — background session শেষ হলে notification
 * 3. "Routing..." / "Synthesizing results..." — backend meta event empty থাকলে hide
 * 4. Status per-message liveStatus — global state নয়, freeze হয় না
 * 5. Second message wrong system prompt — mode:'auto' সবসময় পাঠানো হয়
 */

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
  // Background task alerts: [{ sid, title }]
  const [completedBg,   setCompletedBg]   = useState([])
  // Which session IDs are currently streaming (for sidebar indicator)
  const [streamingSids, setStreamingSids] = useState([])

  // Per-session stream tracking: { [sid]: { cancel, botId } }
  const sessionStreams = useRef({})
  const activeSidRef  = useRef(null)

  // Keep activeSidRef in sync
  const setActive = useCallback((sid) => {
    activeSidRef.current = sid
    setActiveSid(sid)
  }, [])

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
      save(next)
      return next
    })
    return sid
  }, [])

  // ── Timing helpers (per-message) ──────────────────────────────────────────────
  const makeTimers = (botId, setMsgs) => {
    let t1, t2
    t1 = setTimeout(() => {
      setMsgs(prev => prev.map(m =>
        m.id === botId && m.streaming && m.liveStatus?.mode === 'dots'
          ? { ...m, liveStatus: { ...m.liveStatus, mode: 'text' } } : m
      ))
      t2 = setTimeout(() => {
        setMsgs(prev => prev.map(m =>
          m.id === botId && m.streaming
            ? { ...m, liveStatus: { ...m.liveStatus, mode: 'deep' } } : m
        ))
      }, 4000)
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }

  // ── Load messages for a session ───────────────────────────────────────────────
  const getSessionMessages = (sid) => {
    const all = load()
    return all.find(s => s.id === sid)?.messages || []
  }

  // ── Session controls ──────────────────────────────────────────────────────────
  const startNew = useCallback(() => {
    setActive(null)
    setMessages([])
    setIsStreaming(false)
  }, [setActive])

  const openSession = useCallback(sid => {
    // Don't cancel background streams — just switch view
    setActive(sid)
    const msgs = getSessionMessages(sid)

    // If this session is currently streaming, reflect that
    const isCurrentlyStreaming = !!sessionStreams.current[sid]
    setMessages(msgs)
    setIsStreaming(isCurrentlyStreaming)
  }, [setActive])

  const removeSession = useCallback(sid => {
    // Cancel stream if running
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
    setMessages(prev => prev.map(m =>
      m.streaming ? { ...m, streaming: false, liveStatus: null } : m
    ))
  }, [])

  const dismissAlert = useCallback((sid) => {
    setCompletedBg(prev => prev.filter(a => a.sid !== sid))
  }, [])

  // ── Core send logic ───────────────────────────────────────────────────────────
  const _doSend = useCallback((sid, text, existingMsgs, opts = {}) => {
    const userMsg = { id: uuid(), role: 'user', content: text, ts: Date.now() }
    const botId   = uuid()
    const botMsg  = {
      id: botId, role: 'assistant', content: '',
      streaming: true, agentMeta: null, toolCalls: [],
      liveStatus: { mode: 'dots', text: '', percent: 0 },
      ts: Date.now()
    }

    const newMsgs = [...existingMsgs, userMsg, botMsg]

    // Only update UI messages if this is the active session
    if (activeSidRef.current === sid) {
      setMessages(newMsgs)
      setIsStreaming(true)
    }

    const startTime  = Date.now()
    const clearTimer = makeTimers(botId, setMessages)

    // Update messages for any session (active or background)
    const updateMsg = (updater) => {
      setMessages(prev => {
        // Only apply if active session matches
        if (activeSidRef.current !== sid) return prev
        return prev.map(m => m.id === botId ? updater(m) : m)
      })
      // Also update in sessions store for persistence
      setSessions(prev => prev.map(s => {
        if (s.id !== sid) return s
        return { ...s, messages: s.messages.map(m => m.id === botId ? updater(m) : m) }
      }))
    }

    const cancel = sendMessage(
      {
        message:  text,
        sessionId: sid,
        // Fix: always send mode:'auto' — never send 'coding' or other wrong mode
        mode:     'auto',
        stream:   true,
      },
      {
        onEvent: evt => {
          const ms = Date.now() - startTime

          // Agent meta — only show if real name exists
          if (evt.type === 'meta') {
            const agentName = evt.agent || evt.model_name || ''
            if (agentName) {
              updateMsg(m => ({ ...m, agentMeta: evt }))
            }
          }

          // Tool call
          if (evt.type === 'tool_call') {
            const callId = evt.call_id || evt.id || uuid()
            const call   = { call_id: callId, name: evt.name || evt.tool, input: evt.input || evt.args || {} }
            updateMsg(m => ({ ...m, toolCalls: [...m.toolCalls, { call, result: null }] }))
          }

          // Tool result
          if (evt.type === 'tool_result') {
            const callId = evt.call_id || evt.id
            updateMsg(m => ({
              ...m,
              toolCalls: m.toolCalls.map(tc =>
                tc.call.call_id === callId
                  ? { ...tc, result: { output: evt.output || evt.content || evt.result, error: evt.error } }
                  : tc
              )
            }))
          }

          // Status — respect timing, no hardcoded text
          if (evt.type === 'status' || evt.progress) {
            const raw = evt.progress
              ? { label: evt.progress.detail || evt.progress.step || '', pct: evt.progress.percent || 0 }
              : { label: evt.text || evt.message || evt.detail || '', pct: evt.percent || 0 }
            const label = ms >= 3000 ? raw.label : ''
            const mode  = ms >= 7000 ? 'deep' : ms >= 3000 ? 'text' : 'dots'
            if (label || raw.pct > 0) {
              updateMsg(m => ({
                ...m,
                liveStatus: { mode, text: label, percent: raw.pct || m.liveStatus?.percent || 0 }
              }))
            }
          }

          // Token — real content started
          if ((evt.type === 'token' && evt.content) || (evt.token !== undefined && !evt.type)) {
            const content = evt.content ?? evt.token
            clearTimer()
            updateMsg(m => ({ ...m, content, liveStatus: null }))
          }

          // Error
          if (evt.type === 'error') {
            clearTimer()
            updateMsg(m => ({
              ...m,
              content: m.content || `⚠ ${evt.message || 'Error'}`,
              error: true, liveStatus: null
            }))
          }
        },

        onDone: () => {
          clearTimer()
          delete sessionStreams.current[sid]
          setStreamingSids(prev => prev.filter(id => id !== sid))

          // Final messages
          setMessages(prev => {
            const finalMsgs = activeSidRef.current === sid
              ? prev.map(m => m.id === botId ? { ...m, streaming: false, liveStatus: null } : m)
              : prev

            // Persist final state by reading from sessions store
            setSessions(prevS => {
              const s = prevS.find(x => x.id === sid)
              const base = s?.messages || newMsgs
              const saved = base.map(m =>
                m.id === botId ? { ...m, streaming: false, liveStatus: null } : m
              )
              const title = saved.find(m => m.role === 'user')?.content?.slice(0, 60) || 'New chat'
              const next  = prevS.some(x => x.id === sid)
                ? prevS.map(x => x.id === sid ? { ...x, messages: saved, title, ts: Date.now() } : x)
                : [{ id: sid, title, messages: saved, ts: Date.now() }, ...prevS]
              save(next)

              // Background session alert
              if (activeSidRef.current !== sid) {
                setCompletedBg(prev2 => {
                  if (prev2.some(a => a.sid === sid)) return prev2
                  return [...prev2, { sid, title }]
                })
              }

              return next
            })

            return finalMsgs
          })

          if (activeSidRef.current === sid) setIsStreaming(false)
        },

        onError: err => {
          clearTimer()
          delete sessionStreams.current[sid]
          setStreamingSids(prev => prev.filter(id => id !== sid))
          if (activeSidRef.current === sid) {
            setIsStreaming(false)
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, content: m.content || `Connection error: ${err.message}`, error: true, streaming: false, liveStatus: null }
                : m
            ))
          }
        },
      }
    )

    sessionStreams.current[sid] = { cancel, botId }
    setStreamingSids(prev => prev.includes(sid) ? prev : [...prev, sid])
  }, [])

  // ── Public send ───────────────────────────────────────────────────────────────
  const send = useCallback((text, opts = {}) => {
    if (!text.trim()) return

    let sid = activeSidRef.current
    if (!sid) {
      sid = makeSession(text)
      setActive(sid)
    }

    const existingMsgs = messages
    _doSend(sid, text, existingMsgs, opts)
  }, [messages, makeSession, setActive, _doSend])

  // ── Send File ─────────────────────────────────────────────────────────────────
  const sendFile = useCallback((file, question = '') => {
    let sid = activeSidRef.current
    if (!sid) {
      sid = makeSession(question || file.name)
      setActive(sid)
    }

    const userMsg = {
      id: uuid(), role: 'user',
      content: question || `📎 ${file.name}`,
      attachment: { name: file.name, type: file.type, size: file.size },
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

    const cancel = uploadFile(
      { file, sessionId: sid, question },
      {
        onEvent: evt => {
          if (evt.type === 'token' && evt.content) {
            clearTimer()
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: evt.content, liveStatus: null } : m
            ))
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
          setMessages(prev => prev.map(m =>
            m.id === botId
              ? { ...m, content: `Upload error: ${err.message}`, error: true, streaming: false, liveStatus: null }
              : m
          ))
        },
      }
    )
    sessionStreams.current[sid] = { cancel, botId }
    setStreamingSids(prev => prev.includes(sid) ? prev : [...prev, sid])
  }, [makeSession, setActive, persist])

  return {
    sessions, activeSid, messages, isStreaming, completedBg, streamingSids,
    send, sendFile, stop, startNew, openSession, removeSession, dismissAlert,
  }
}
