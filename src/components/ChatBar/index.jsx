/**
 * ChatBar — glass input bar with live progress status
 * Fixed: suggestion clicks, progress bar, status text
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ArrowUp, Square, Paperclip, X } from 'lucide-react'
import clsx from 'clsx'

export default function ChatBar({ onSend, onFile, onStop, isStreaming, statusText = '', progress = 0 }) {
  const [text,       setText]       = useState('')
  const [dragging,   setDragging]   = useState(false)
  const [attachment, setAttachment] = useState(null)   // { file, preview }
  const textareaRef  = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [text])

  const submit = useCallback(() => {
    if (isStreaming) return
    const trimmed = text.trim()

    if (attachment) {
      onFile?.(attachment.file, trimmed)
      setAttachment(null)
      setText('')
      return
    }

    if (!trimmed) return
    onSend?.(trimmed)
    setText('')
    // reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [text, attachment, isStreaming, onSend, onFile])

  const onKey = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }, [submit])

  // Drag-and-drop
  const onDragOver  = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop      = e => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleFile = file => {
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setAttachment({ file, preview })
  }

  const canSend = !isStreaming && (text.trim().length > 0 || attachment)

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      {/* ── Progress bar + status ─────────────────────────────────────── */}
      {isStreaming && (
        <div className="mb-2 space-y-1 animate-fade-up">
          {/* Status text */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[12px] text-white/45 font-medium tracking-wide">
              {statusText || '⚙️ কাজ করছি…'}
            </span>
            <span className="text-[11px] text-white/20">
              {progress > 0 ? `${progress}%` : ''}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-[2px] w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
              style={{ width: progress > 0 ? `${progress}%` : '100%',
                       animation: progress === 0 ? 'rubra-indeterminate 1.4s ease infinite' : 'none' }}
            />
          </div>
        </div>
      )}

      {/* ── Main input card ───────────────────────────────────────────── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={clsx(
          'relative rounded-[22px] border backdrop-blur-glass transition-all duration-200',
          dragging
            ? 'border-brand/60 bg-brand/[0.07] shadow-brand'
            : 'border-white/[0.09] bg-white/[0.045] shadow-glass',
        )}
      >
        {/* Attachment preview */}
        {attachment && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            {attachment.preview
              ? <img src={attachment.preview} alt="" className="h-12 w-12 rounded-lg object-cover border border-white/10" />
              : <div className="h-10 flex items-center gap-2 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-[12px]">
                  📎 {attachment.file.name}
                </div>
            }
            <button
              onClick={() => setAttachment(null)}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15 transition-all"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Drag overlay */}
        {dragging && (
          <div className="absolute inset-0 rounded-[22px] flex items-center justify-center bg-brand/[0.08] border-2 border-dashed border-brand/40 z-10">
            <p className="text-brand/80 text-[13px] font-medium">ফাইল এখানে ছেড়ে দাও</p>
          </div>
        )}

        <div className="flex items-end gap-2 px-3 py-2.5">
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-white/25 hover:text-white/55 hover:bg-white/[0.06] transition-all shrink-0 mb-0.5 disabled:opacity-30"
            title="ফাইল যোগ করো"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
            accept="image/*,.pdf,.txt,.md,.csv,.json,.py,.js,.ts"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={isStreaming ? (statusText || 'উত্তর আসছে…') : 'Message RUBRA…'}
            disabled={isStreaming}
            className={clsx(
              'flex-1 resize-none bg-transparent outline-none text-[14.5px] leading-relaxed',
              'text-white/85 placeholder:text-white/22 py-1 min-h-[24px] max-h-[200px]',
              'disabled:cursor-not-allowed'
            )}
          />

          {/* Send / Stop button */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-brand/80 hover:bg-brand text-white transition-all shrink-0 mb-0.5"
              title="থামাও"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canSend}
              className={clsx(
                'w-9 h-9 flex items-center justify-center rounded-full transition-all shrink-0 mb-0.5',
                canSend
                  ? 'bg-brand hover:bg-brand/85 text-white shadow-brand active:scale-95'
                  : 'bg-white/[0.05] text-white/15 cursor-not-allowed'
              )}
              title="পাঠাও (Enter)"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[11px] text-white/18 mt-2">
        RUBRA can make mistakes · Verify critical information
      </p>
    </div>
  )
}
