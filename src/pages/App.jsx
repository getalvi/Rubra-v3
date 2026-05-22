/**
 * RUBRA — Gemini-Style UI
 * Clean, simple, user-friendly interface
 */
import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import useChat from './hooks/useChat'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const {
    messages,
    isStreaming,
    send,
    sendFile,
    stop,
    sessions,
    activeSid,
    startNew,
    openSession,
    removeSession
  } = useChat()

  return (
    <div className="flex w-full h-screen bg-[#131314]">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        activeSid={activeSid}
        onNew={startNew}
        onOpen={openSession}
        onDelete={removeSession}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <ChatArea
        messages={messages}
        isStreaming={isStreaming}
        onSend={send}
        onFile={sendFile}
        onStop={stop}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
    </div>
  )
}
