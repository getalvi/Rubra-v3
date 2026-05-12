/**
 * useChat — core chat state management
 * Handles: sessions, messages, streaming, files
 */

import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendMessage, uploadFile } from '../api/index.js'

const STORAGE_KEY = 'rubra_sessions'

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 80)))
  } catch { /* quota exceeded */ }
}

export function useChat() {
  const [sessions, setSessions] = useState(loadSessions)
  const [activeSid, setActiveSid] = useState(null)
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [agentInfo, setAgentInfo] = useState(null)
  const cancelRef = useRef(null)

  // ── Session helpers ───────────────────────────────────

  const createSession = useCallback((firstMsg = '') => {
    const sid = uuidv4()
    const title = firstMsg.slice(0, 55) || 'New Chat'
    const session = { id: sid, title, updatedAt: Date.now(), messages: [] }
    setSessions(prev => {
      const next = [session, ...prev]
      saveSessions(next)
      return next
    })
    return sid
  }, [])

  const loadSession = useCallback((sid) => {
    const session = loadSessions().find(s => s.id === sid)
    if (session) {
      setActiveSid(sid)
      setMessages(session.messages || [])
    }
  }, [])

  const deleteSession = useCallback((sid) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== sid)
      saveSessions(next)
      return next
    })
    if (activeSid === sid) {
      setActiveSid(null)
      setMessages([])
    }
  }, [activeSid])

  const startNewChat = useCallback(() => {
    cancelRef.current?.()
    setActiveSid(null)
    setMessages([])
    setAgentInfo(null)
    setIsStreaming(false)
  }, [])

  // ── Persist messages to localStorage ─────────────────

  const persistMessages = useCallback((sid, msgs) => {
    setSessions(prev => {
      const next = prev.map(s =>
        s.id === sid
          ? { ...s, messages: msgs, title: msgs[0]?.content?.slice(0, 55) || s.title, updatedAt: Date.now() }
          : s
      )
      saveSessions(next)
      return next
    })
  }, [])

  // ── Send text message ─────────────────────────────────

  const sendMsg = useCallback(async (text, opts = {}) => {
    if (!text.trim() || isStreaming) return

    // Create or reuse session
    let sid = activeSid
    if (!sid) {
      sid = createSession(text)
      setActiveSid(sid)
    }

    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: text,
      ts: Date.now(),
    }

    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      ts: Date.now(),
      agentInfo: null,
      isStreaming: true,
    }

    setMessages(prev => {
      const next = [...prev, userMsg, assistantMsg]
      persistMessages(sid, next.filter(m => !m.isStreaming))
      return next
    })
    setIsStreaming(true)
    setAgentInfo(null)

    let fullContent = ''
    const msgId = assistantMsg.id

    const cancel = await sendMessage(
      {
        message: text,
        sessionId: sid,
        taskType: opts.taskType,
        mode: opts.mode,
      },
      {
        onEvent: (evt) => {
          if (evt.type === 'meta') {
            setAgentInfo({ agent: evt.agent, intent: evt.intent, lang: evt.lang })
            setMessages(prev =>
              prev.map(m => m.id === msgId ? { ...m, agentInfo: evt } : m)
            )
          } else if (evt.type === 'token') {
            fullContent += evt.content
            setMessages(prev =>
              prev.map(m => m.id === msgId ? { ...m, content: fullContent } : m)
            )
          } else if (evt.type === 'tool_result') {
            setMessages(prev =>
              prev.map(m => m.id === msgId
                ? { ...m, toolResults: [...(m.toolResults || []), evt] }
                : m
              )
            )
          } else if (evt.type === 'error') {
            setMessages(prev =>
              prev.map(m => m.id === msgId
                ? { ...m, content: m.content || `Error: ${evt.message}`, error: true }
                : m
              )
            )
          }
        },
        onDone: () => {
          setIsStreaming(false)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === msgId ? { ...m, isStreaming: false } : m
            )
            persistMessages(sid, next)
            return next
          })
        },
        onError: (err) => {
          setIsStreaming(false)
          setMessages(prev =>
            prev.map(m =>
              m.id === msgId
                ? { ...m, content: `Connection error: ${err.message}`, error: true, isStreaming: false }
                : m
            )
          )
        },
      }
    )

    cancelRef.current = cancel
  }, [activeSid, isStreaming, createSession, persistMessages])

  // ── Send file ─────────────────────────────────────────

  const sendFile = useCallback(async (file, question = '', opts = {}) => {
    if (isStreaming) return

    let sid = activeSid
    if (!sid) {
      sid = createSession(question || file.name)
      setActiveSid(sid)
    }

    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: question || `📎 ${file.name}`,
      attachment: { name: file.name, type: file.type, size: file.size },
      ts: Date.now(),
    }
    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      ts: Date.now(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    let fullContent = ''
    const msgId = assistantMsg.id

    const cancel = await uploadFile(
      { file, sessionId: sid, question, mode: opts.mode },
      {
        onEvent: (evt) => {
          if (evt.type === 'token') {
            fullContent += evt.content
            setMessages(prev =>
              prev.map(m => m.id === msgId ? { ...m, content: fullContent } : m)
            )
          } else if (evt.type === 'error') {
            setMessages(prev =>
              prev.map(m =>
                m.id === msgId
                  ? { ...m, content: `Error: ${evt.message}`, error: true }
                  : m
              )
            )
          }
        },
        onDone: () => {
          setIsStreaming(false)
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === msgId ? { ...m, isStreaming: false } : m
            )
            persistMessages(sid, next)
            return next
          })
        },
        onError: (err) => {
          setIsStreaming(false)
          setMessages(prev =>
            prev.map(m =>
              m.id === msgId
                ? { ...m, content: `Upload error: ${err.message}`, error: true, isStreaming: false }
                : m
            )
          )
        },
      }
    )

    cancelRef.current = cancel
  }, [activeSid, isStreaming, createSession, persistMessages])

  // ── Stop generation ───────────────────────────────────

  const stopGeneration = useCallback(() => {
    cancelRef.current?.()
    setIsStreaming(false)
    setMessages(prev =>
      prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m)
    )
  }, [])

  return {
    sessions,
    activeSid,
    messages,
    isStreaming,
    agentInfo,
    sendMsg,
    sendFile,
    stopGeneration,
    startNewChat,
    loadSession,
    deleteSession,
  }
}
