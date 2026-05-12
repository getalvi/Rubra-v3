/**
 * ChatInput — the main message input bar
 * Features: auto-resize, file attach, stop, send on Enter
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Send, Square, Paperclip, X, Mic, Image as ImageIcon
} from 'lucide-react'
import styles from './ChatInput.module.css'

const ALLOWED_TYPES = [
  'image/*', '.pdf', '.txt', '.csv', '.xlsx', '.xls', '.docx', '.doc',
  'application/pdf', 'text/plain', 'text/csv',
]

export default function ChatInput({ onSend, onFile, onStop, isStreaming, disabled }) {
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [text])

  // Focus on mount
  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
  }, [disabled])

  const handleSubmit = useCallback(() => {
    if (isStreaming) { onStop?.(); return }
    const trimmed = text.trim()
    if (!trimmed && !attachment) return

    if (attachment) {
      onFile?.(attachment.file, trimmed)
    } else {
      onSend?.(trimmed)
    }

    setText('')
    setAttachment(null)
    textareaRef.current?.focus()
  }, [text, attachment, isStreaming, onSend, onFile, onStop])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleFile = useCallback((file) => {
    if (!file) return
    const preview = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null
    setAttachment({ file, name: file.name, type: file.type, preview })
  }, [])

  const onFileInput = useCallback((e) => {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }, [handleFile])

  // Drag & drop
  const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = () => setIsDragOver(false)
  const onDrop = (e) => {
    e.preventDefault(); setIsDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const canSend = (text.trim() || attachment) && !disabled

  return (
    <div
      className={`${styles.wrapper} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Attachment preview */}
      {attachment && (
        <div className={styles.attachPreview}>
          {attachment.preview ? (
            <img src={attachment.preview} alt="preview" className={styles.attachImg} />
          ) : (
            <div className={styles.attachFile}>
              <span>{attachment.name}</span>
            </div>
          )}
          <button
            className={styles.removeAttach}
            onClick={() => setAttachment(null)}
            aria-label="Remove attachment"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className={styles.inputRow}>
        {/* Left actions */}
        <div className={styles.leftActions}>
          <button
            className={styles.actionBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Attach file or image"
            aria-label="Attach file"
            disabled={disabled}
          >
            <Paperclip size={17} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={onFileInput}
            className={styles.hiddenInput}
            aria-hidden="true"
          />
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Generating...' : 'Message RUBRA...'}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
        />

        {/* Send / Stop */}
        <button
          className={`${styles.sendBtn} ${isStreaming ? styles.stopBtn : ''}`}
          onClick={handleSubmit}
          disabled={!canSend && !isStreaming}
          title={isStreaming ? 'Stop generation' : 'Send message'}
          aria-label={isStreaming ? 'Stop generation' : 'Send message'}
        >
          {isStreaming ? <Square size={15} fill="currentColor" /> : <Send size={15} />}
        </button>
      </div>

      {/* Drag overlay */}
      {isDragOver && (
        <div className={styles.dragOverlay} aria-hidden="true">
          <ImageIcon size={28} />
          <span>Drop to attach</span>
        </div>
      )}
    </div>
  )
}
