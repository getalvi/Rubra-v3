import React, { useState } from 'react'
import Sidebar from '../components/Sidebar/index.jsx'
import ChatWindow from '../components/ChatWindow/index.jsx'
import useChat from '../hooks/useChat'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const {
    messages, isStreaming, agentMeta,
    statusText, statusMode, progress,
    send, sendFile, stop,
    sessions, activeSid, startNew, openSession, removeSession,
  } = useChat()

  return (
    <div className="flex w-full h-screen bg-[#131314]">
      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        activeSid={activeSid}
        onNew={startNew}
        onOpen={openSession}
        onDelete={removeSession}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <ChatWindow
        messages={messages}
        isStreaming={isStreaming}
        agentMeta={agentMeta}
        statusText={statusText}
        statusMode={statusMode}
        progress={progress}
        onSend={send}
        onFile={sendFile}
        onStop={stop}
        onNewChat={startNew}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  )
}
