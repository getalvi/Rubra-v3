import React, { useState } from 'react'
import Sidebar from '../components/Sidebar/index.jsx'
import ChatWindow from '../components/ChatWindow/index.jsx'
import useChat from '../hooks/useChat'

// ── Task Complete Alert ───────────────────────────────────────────────────────
function TaskAlert({ alerts, onDismiss, onOpen }) {
  if (!alerts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {alerts.map(a => (
        <div key={a.sid}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e1f20] border border-white/[0.1] shadow-xl animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-white/80 font-medium">Task complete</p>
            <p className="text-[11px] text-white/40 truncate max-w-[180px]">{a.title}</p>
          </div>
          <button onClick={() => { onOpen(a.sid); onDismiss(a.sid) }}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium shrink-0 transition-colors">
            View
          </button>
          <button onClick={() => onDismiss(a.sid)}
            className="text-white/25 hover:text-white/60 transition-colors text-lg leading-none shrink-0 ml-1">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const {
    sessions, activeSid, messages, isStreaming, completedBg,
    send, sendFile, stop, startNew, openSession, removeSession, dismissAlert, streamingSids,
  } = useChat()

  return (
    <div className="flex w-full h-screen bg-[#131314]">
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>

      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        activeSid={activeSid}
        streamingSids={streamingSids}
        onNew={startNew}
        onOpen={openSession}
        onDelete={removeSession}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      <ChatWindow
        messages={messages}
        isStreaming={isStreaming}
        onSend={send}
        onFile={sendFile}
        onStop={stop}
        onNewChat={startNew}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />

      <TaskAlert
        alerts={completedBg}
        onDismiss={dismissAlert}
        onOpen={openSession}
      />
    </div>
  )
}
