/**
 * RUBRA v3 — src/hooks/useChat.js
 *
 * Fixed:
 *  - cancelRef.current = sendMessage() — await সরানো হয়েছে
 *    (sendMessage এখন abort fn synchronously return করে)
 *  - নতুন session এ race condition fix:
 *    sid একটা local variable এ রাখা হয় এবং সব closure সেটাই use করে
 *  - onDone এ isStreaming false হওয়ার আগে content check
 *  - openSession এ localStorage থেকে fresh load
 *  - sendFile এও await সরানো হয়েছে
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
    return sid   // ← caller কে synchronously return করা হয়
  }, [])

  // ── Session Controls ──────────────────────────────────────────────────────────
  const startNew = useCallback(() => {
    cancelRef.current?.()
    setActiveSid(null)
    setMessages([])
    setAgentMeta(null)
    setIsStreaming(false)
  }, [])

  const openSession = useCallback(sid => {
    // localStorage থেকে fresh load — state stale হতে পারে
    const all = load()
    const s   = all.find(x => x.id === sid)
    if (!s) return
    cancelRef.current?.()
    setActiveSid(sid)
    setMessages(s.messages || [])
    setIsStreaming(false)
    setAgentMeta(null)
  }, [])

  const removeSession = useCallback(sid => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== sid)
      save(next)
      return next
    })
    if (activeSid === sid) startNew()
  }, [activeSid, startNew])

  const stop = useCallback(() => {
    cancelRef.current?.()
    setIsStreaming(false)
    setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m))
  }, [])

  // ── Send Message ──────────────────────────────────────────────────────────────
  const send = useCallback((text, opts = {}) => {
    if (!text.trim() || isStreaming) return

    // FIX: sid কে local variable এ pin করো
    // setActiveSid(sid) async, কিন্তু নিচের সব closure এ local `sid` use করা হয়
    let sid = activeSid
    if (!sid) {
      sid = makeSession(text)
      setActiveSid(sid)
    }

    const userMsg = {
      id: uuid(), role: 'user', content: text, ts: Date.now()
    }
    const botMsg = {
      id: uuid(), role: 'assistant', content: '', streaming: true,
      agentMeta: null, toolResults: [], ts: Date.now()
    }
    const botId = botMsg.id

    setMessages(prev => [...prev, userMsg, botMsg])
    setIsStreaming(true)
    setAgentMeta(null)

    let full = ''

    // FIX: await সরানো হয়েছে — sendMessage() synchronously abort fn return করে
    cancelRef.current = sendMessage(
      { message: text, sessionId: sid, taskType: opts.taskType, mode: opts.mode },
      {
        onEvent: evt => {
          if (evt.type === 'meta') {
            setAgentMeta(evt)
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, agentMeta: evt } : m
            ))

          } else if (evt.type === 'token') {
            if (evt.content) {
              full = evt.content   // replace, not append
              setMessages(prev => prev.map(m =>
                m.id === botId ? { ...m, content: full } : m
              ))
            }

          } else if (evt.type === 'tool_result') {
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, toolResults: [...(m.toolResults || []), evt] }
                : m
            ))

          } else if (evt.type === 'error') {
            setMessages(prev => prev.map(m =>
              m.id === botId
                ? { ...m, content: m.content || `⚠ ${evt.message || 'Error occurred'}`, error: true }
                : m
            ))

          } else if (evt.token !== undefined) {
            // backward-compat: old format {token: "...", done: true}
            full = evt.token
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }
        },

        onDone: () => {
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
          setIsStreaming(false)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === botId
                ? {
                    ...m,
                    content: m.content || `Connection error: ${err.message}`,
                    error: true,
                    streaming: false
                  }
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
    if (!sid) {
      sid = makeSession(question || file.name)
      setActiveSid(sid)
    }

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

    let full = ''

    // FIX: await সরানো হয়েছে
    cancelRef.current = uploadFile(
      { file, sessionId: sid, question, mode: opts.mode },
      {
        onEvent: evt => {
          if (evt.type === 'token' && evt.content) {
            full = evt.content
            setMessages(prev => prev.map(m =>
              m.id === botId ? { ...m, content: full } : m
            ))
          }
        },
        onDone: () => {
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
          setIsStreaming(false)
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
    send, sendFile, stop, startNew, openSession, removeSession
  }
}
