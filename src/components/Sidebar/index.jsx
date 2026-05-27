/**
 * Sidebar — with background streaming indicator
 * চলমান session এ একটা pulse dot দেখাবে
 */
import React from 'react'
import { Menu, Plus, MessageSquare, Settings, Trash2 } from 'lucide-react'

export default function Sidebar({
  open, sessions, activeSid,
  onNew, onOpen, onDelete, onToggle,
  streamingSids = [],  // session ids that are currently streaming
}) {
  if (!open) {
    return (
      <div className="w-16 h-full bg-[#1e1f20] border-r border-white/[0.07] flex flex-col items-center py-4 shrink-0">
        <button onClick={onToggle} className="w-9 h-9 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all mb-3">
          <Menu size={18} />
        </button>
        <button onClick={onNew} className="w-9 h-9 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all">
          <Plus size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="w-[255px] h-full bg-[#1e1f20] border-r border-white/[0.07] flex flex-col shrink-0">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-white/80 font-semibold text-[13.5px]">Rubra</span>
        </div>
        <button onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-all">
          <Menu size={17} />
        </button>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] text-white/75 hover:text-white transition-all text-[13px] font-medium">
          <Plus size={16} />
          New chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {sessions.length === 0 ? (
          <p className="text-center py-8 text-white/25 text-[12px]">No chats yet</p>
        ) : (
          sessions.map(s => {
            const isActive    = activeSid === s.id
            const isStreaming = streamingSids.includes(s.id)
            return (
              <div key={s.id}
                className={`group flex items-center gap-2 px-3 py-2.5 mb-0.5 rounded-xl cursor-pointer transition-all relative
                  ${isActive ? 'bg-white/[0.09] text-white' : 'text-white/55 hover:bg-white/[0.05] hover:text-white/80'}`}
                onClick={() => onOpen(s.id)}
              >
                <MessageSquare size={15} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate text-[12.5px]">
                  {s.title || `Chat ${s.id.slice(0, 6)}`}
                </span>

                {/* Background streaming pulse */}
                {isStreaming && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                )}

                <button
                  onClick={e => { e.stopPropagation(); onDelete(s.id) }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all shrink-0"
                  title="Delete"
                >
                  <Trash2 size={13} className="text-white/40" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.07] p-3">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-all text-[12.5px]">
          <Settings size={15} />
          Settings
        </button>
      </div>
    </div>
  )
}
