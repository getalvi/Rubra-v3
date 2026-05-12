/**
 * Sidebar — session list + new chat button
 * Apple iOS glass sidebar design
 */

import React, { useState } from 'react'
import { MessageSquare, Plus, Trash2, X, ChevronLeft } from 'lucide-react'
import styles from './Sidebar.module.css'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Sidebar({ sessions, activeSid, onNew, onLoad, onDelete, isOpen, onClose }) {
  const [hovered, setHovered] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleDelete = (e, sid) => {
    e.stopPropagation()
    if (confirmDelete === sid) {
      onDelete(sid)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(sid)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`} aria-label="Chat history">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>R</div>
            <span className={styles.brandName}>RUBRA</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* New Chat */}
        <button className={styles.newChatBtn} onClick={onNew}>
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        {/* Sessions */}
        <div className={styles.sessionList} role="list">
          {sessions.length === 0 && (
            <div className={styles.empty}>
              <MessageSquare size={28} opacity={0.3} />
              <p>No conversations yet</p>
            </div>
          )}

          {sessions.map(session => (
            <div
              key={session.id}
              role="listitem"
              className={`${styles.sessionItem} ${activeSid === session.id ? styles.active : ''}`}
              onClick={() => onLoad(session.id)}
              onMouseEnter={() => setHovered(session.id)}
              onMouseLeave={() => { setHovered(null); setConfirmDelete(null) }}
            >
              <MessageSquare size={14} className={styles.sessionIcon} />
              <div className={styles.sessionInfo}>
                <span className={styles.sessionTitle}>{session.title || 'Untitled'}</span>
                <span className={styles.sessionTime}>{timeAgo(session.updatedAt || 0)}</span>
              </div>

              {(hovered === session.id || confirmDelete === session.id) && (
                <button
                  className={`${styles.deleteBtn} ${confirmDelete === session.id ? styles.confirm : ''}`}
                  onClick={(e) => handleDelete(e, session.id)}
                  title={confirmDelete === session.id ? 'Confirm delete' : 'Delete'}
                  aria-label="Delete conversation"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.version}>v8.0 · Glassmorphism UI</span>
        </div>
      </aside>
    </>
  )
}
