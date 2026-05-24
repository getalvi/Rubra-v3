/**
 * Sidebar — Gemini-style clean sidebar
 */
import React from 'react'
import { Menu, Plus, MessageSquare, Settings, Trash2 } from 'lucide-react'

export default function Sidebar({ 
  open, 
  sessions, 
  activeSid, 
  onNew, 
  onOpen, 
  onDelete,
  onToggle 
}) {
  if (!open) {
    return (
      <div className="w-16 h-full bg-[#1e1f20] border-r border-white/10 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="btn-icon mb-4"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        
        <button
          onClick={onNew}
          className="btn-icon"
          aria-label="New chat"
        >
          <Plus size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="w-64 h-full bg-[#1e1f20] border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">R</span>
          </div>
          <span className="text-white font-medium">Rubra</span>
        </div>
        
        <button
          onClick={onToggle}
          className="btn-icon w-8 h-8"
          aria-label="Close sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-white/8 hover:bg-white/12 text-white transition-colors"
        >
          <Plus size={18} />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm">
            No chat history yet
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`
                group flex items-center gap-2 px-3 py-2.5 mb-1 rounded-lg cursor-pointer
                transition-colors relative
                ${activeSid === session.id 
                  ? 'bg-white/12 text-white' 
                  : 'text-white/70 hover:bg-white/8 hover:text-white'
                }
              `}
              onClick={() => onOpen(session.id)}
            >
              <MessageSquare size={16} className="shrink-0 opacity-70" />
              <span className="flex-1 truncate text-sm">
                {session.title || `Chat ${session.id.slice(0, 6)}`}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(session.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                aria-label="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/8 hover:text-white transition-colors">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  )
}
