/**
 * Sidebar — glass panel, session list, new chat
 * Props: sessions, activeSid, onNew, onOpen, onDelete, collapsed, onToggle
 */
import React, { useState, useCallback } from 'react'
import {
  SquarePen, MessageSquare, Trash2, ChevronLeft, ChevronRight,
  Search, Plus, Bot
} from 'lucide-react'
import clsx from 'clsx'

function ago(ts) {
  const d = Date.now() - ts, m = Math.floor(d / 6e4)
  if (m < 1)  return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ── Session row ──────────────────────────────────────────────────
function SessionRow({ session, active, onOpen, onDelete }) {
  const [hovered,  setHovered]  = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  const handleDelete = useCallback(e => {
    e.stopPropagation()
    if (confirm) { onDelete(session.id); return }
    setConfirm(true)
    setTimeout(() => setConfirm(false), 2800)
  }, [confirm, session.id, onDelete])

  return (
    <button
      onClick={() => onOpen(session.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirm(false) }}
      className={clsx(
        'group relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl',
        'text-left transition-all duration-150',
        active
          ? 'bg-white/[0.065] border border-white/[0.10]'
          : 'hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]'
      )}
    >
      {/* Active indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-brand rounded-r-full" />
      )}

      <MessageSquare
        size={13}
        className={clsx('shrink-0 transition-colors', active ? 'text-brand' : 'text-white/25 group-hover:text-white/40')}
      />

      <div className="flex-1 min-w-0">
        <p className={clsx('text-[13px] leading-snug truncate', active ? 'text-white/90' : 'text-white/55 group-hover:text-white/75')}>
          {session.title || 'New chat'}
        </p>
        <p className="text-[11px] text-white/22 mt-0.5">{ago(session.ts || 0)}</p>
      </div>

      {(hovered || confirm) && (
        <button
          onClick={handleDelete}
          className={clsx(
            'shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-md',
            'transition-all duration-100',
            confirm
              ? 'bg-brand/25 border border-brand/50 text-brand'
              : 'bg-white/[0.06] border border-white/[0.07] text-white/35 hover:text-red-400 hover:bg-red-500/[0.12] hover:border-red-500/30'
          )}
          title={confirm ? 'Confirm delete' : 'Delete'}
        >
          <Trash2 size={11} />
        </button>
      )}
    </button>
  )
}

// ── Main Sidebar ─────────────────────────────────────────────────
export default function Sidebar({ sessions = [], activeSid, onNew, onOpen, onDelete, collapsed, onToggle }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? sessions.filter(s => s.title?.toLowerCase().includes(query.toLowerCase()))
    : sessions

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 z-50 flex flex-col',
          'glass-panel transition-all duration-300 ease-out',
          'border-r border-white/[0.06]',
          collapsed ? 'w-0 overflow-hidden opacity-0 pointer-events-none' : 'w-[255px]',
          'md:relative md:opacity-100 md:pointer-events-auto',
          collapsed ? 'md:w-0' : 'md:w-[255px]'
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-brand flex items-center justify-center text-white font-semibold text-[13px] shadow-brand">
              R
            </div>
            <span className="text-[14px] font-semibold text-white/85 tracking-[0.04em]">RUBRA</span>
          </div>
          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/28 hover:text-white/65 hover:bg-white/[0.06] transition-all"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* ── New Chat ── */}
        <div className="px-3 pt-3 pb-1.5 shrink-0">
          <button
            onClick={onNew}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl',
              'border border-white/[0.07] text-white/52 text-[13px] font-medium',
              'hover:bg-white/[0.055] hover:text-white/80 hover:border-white/[0.10]',
              'transition-all duration-150'
            )}
          >
            <Plus size={15} className="text-white/35" />
            New chat
          </button>
        </div>

        {/* ── Search ── */}
        {sessions.length > 3 && (
          <div className="px-3 py-1.5 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Search size={12} className="text-white/28 shrink-0" />
              <input
                type="text"
                placeholder="Search chats…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-[12.5px] text-white/70 placeholder-white/22 outline-none"
              />
            </div>
          </div>
        )}

        {/* ── Session list ── */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-white/22">
              <Bot size={26} strokeWidth={1.2} />
              <p className="text-[12px]">No conversations yet</p>
            </div>
          )}
          {filtered.map(s => (
            <SessionRow
              key={s.id}
              session={s}
              active={activeSid === s.id}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-3 border-t border-white/[0.04] shrink-0">
          <p className="text-[11px] text-white/18 tracking-wide">v2.0 · iOS Glass</p>
        </div>
      </aside>
    </>
  )
}
