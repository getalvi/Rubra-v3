/**
 * App — root layout
 * Fixed: statusText + progress passed down to ChatWindow → ChatBar
 */
import React, { useState } from 'react'
import Sidebar    from '../components/Sidebar/index.jsx'
import ChatWindow from '../components/ChatWindow/index.jsx'
import useChat    from '../hooks/useChat.js'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const {
    sessions, activeSid, messages, isStreaming, agentMeta,
    statusText, progress,
    send, sendFile, stop, startNew, openSession, removeSession,
  } = useChat()

  return (
    <>
      <div className="scene-bg" aria-hidden="true" />
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        <Sidebar
          sessions={sessions}
          activeSid={activeSid}
          onNew={startNew}
          onOpen={openSession}
          onDelete={removeSession}
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(v => !v)}
        />
        <main className="flex-1 min-w-0 overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            agentMeta={agentMeta}
            statusText={statusText}
            progress={progress}
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
