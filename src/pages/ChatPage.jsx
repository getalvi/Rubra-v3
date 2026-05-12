/**
 * ChatPage — main application page
 * Layout: Sidebar + Header + MessageList + Input
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import MessageBubble from '../components/MessageBubble.jsx'
import ChatInput from '../components/ChatInput.jsx'
import WelcomeScreen from '../components/WelcomeScreen.jsx'
import { useChat } from '../hooks/useChat.js'
import styles from './ChatPage.module.css'

export default function ChatPage() {
  const {
    sessions, activeSid, messages, isStreaming, agentInfo,
    sendMsg, sendFile, stopGeneration, startNewChat, loadSession, deleteSession,
  } = useChat()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const scrollRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, autoScroll])

  // Detect manual scroll up → pause auto-scroll
  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setAutoScroll(fromBottom < 80)
  }, [])

  const handleNewChat = useCallback(() => {
    startNewChat()
    setSidebarOpen(false)
  }, [startNewChat])

  const handleLoadSession = useCallback((sid) => {
    loadSession(sid)
    setSidebarOpen(false)
  }, [loadSession])

  const handlePrompt = useCallback((prompt) => {
    sendMsg(prompt)
  }, [sendMsg])

  const showWelcome = messages.length === 0

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSid={activeSid}
        onNew={handleNewChat}
        onLoad={handleLoadSession}
        onDelete={deleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className={styles.main}>
        <Header
          onMenuToggle={() => setSidebarOpen(v => !v)}
          onNewChat={handleNewChat}
          agentInfo={agentInfo}
        />

        {/* Message area */}
        <div
          ref={scrollRef}
          className={styles.messages}
          onScroll={onScroll}
        >
          {showWelcome ? (
            <WelcomeScreen onPrompt={handlePrompt} />
          ) : (
            <div className={styles.messageList}>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} className={styles.scrollAnchor} />
            </div>
          )}

          {/* Scroll to bottom hint */}
          {!autoScroll && isStreaming && (
            <button
              className={styles.scrollBtn}
              onClick={() => {
                setAutoScroll(true)
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
              }}
              aria-label="Scroll to bottom"
            >
              ↓ New content
            </button>
          )}
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <ChatInput
              onSend={sendMsg}
              onFile={sendFile}
              onStop={stopGeneration}
              isStreaming={isStreaming}
            />
            <p className={styles.disclaimer}>
              RUBRA can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
