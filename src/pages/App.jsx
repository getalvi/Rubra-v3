/**
 * App — root layout
 * Composes: scene background, Sidebar, ChatWindow
 */
import React, { useState } from 'react'
import Sidebar    from '../components/Sidebar/index.jsx'
import ChatWindow from '../components/ChatWindow/index.jsx'
import useChat    from '../hooks/useChat.js'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const {
    sessions, activeSid, messages, isStreaming, agentMeta,
    send, sendFile, stop, startNew, openSession, removeSession,
  } = useChat()

  return (
    <>
      {/* ── Deep reddish scene background ── */}
      <div className="scene-bg" aria-hidden="true" />

      {/* ── App shell ── */}
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          sessions={sessions}
          activeSid={activeSid}
          onNew={startNew}
          onOpen={openSession}
          onDelete={removeSession}
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(v => !v)}
        />

        {/* Chat area — fills remaining width */}
        <main className="flex-1 min-w-0 overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            agentMeta={agentMeta}
            onSend={send}
            onFile={sendFile}
            onStop={stop}
            onNewChat={startNew}
            onMenuToggle={() => setSidebarOpen(v => !v)}
          />
        </main>
      </div>
    </>
  )
}
