import React, { useState } from 'react'
import Sidebar from '../components/Sidebar/index.jsx'
import ChatWindow from '../components/ChatWindow/index.jsx'
import useChat from '../hooks/useChat'

// ── Task Complete Alert ───────────────────────────────────────────────────────
function TaskAlert({ alerts, onDismiss, onOpen }) {
  if (!alerts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" style={{maxWidth: 280}}>
      {alerts.map(a => (
        <div key={a.sid}
          className="pointer-events-auto flex items-center gap-3 pl-4 pr-2 py-3 rounded-2xl bg-[#242526] border border-white/[0.09] shadow-2xl animate-slide-up w-full">
          <div className="w-[7px] h-[7px] rounded-full bg-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-white/75 font-medium leading-none mb-1">Task complete</p>
            <p className="text-[11px] text-white/35 truncate">{a.title || 'New chat'}</p>
          </div>
          <button onClick={() => { onOpen(a.sid); onDismiss(a.sid) }}
            className="shrink-0 text-[11.5px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all">
            View
          </button>
          <button onClick={() => onDismiss(a.sid)}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] rounded-lg transition-all text-base leading-none">
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
