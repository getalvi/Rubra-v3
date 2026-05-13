/**
 * ChatBar — the fully glass-blurred chat input
 * Features: auto-resize, file attach, drag-drop, stop, model indicator
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square, Paperclip, X, ArrowUp } from 'lucide-react'
import clsx from 'clsx'

const ALLOWED = '.pdf,.txt,.csv,.xlsx,.xls,.docx,.doc,image/*,application/pdf,text/*'

export default function ChatBar({ onSend, onFile, onStop, isStreaming, disabled }) {
  const [text,       setText]      = useState('')
  const [attachment, setAttachment] = useState(null)
  const [dragOver,   setDragOver]  = useState(false)
  const taRef   = useRef(null)
  const fileRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [text])

  useEffect(() => {
    if (!disabled) taRef.current?.focus()
  }, [disabled])

  const submit = useCallback(() => {
    if (isStreaming) { onStop?.(); return }
    const t = text.trim()
    if (!t && !attachment) return
    if (attachment) { onFile?.(attachment.file, t) }
    else            { onSend?.(t) }
    setText(''); setAttachment(null)
    taRef.current?.focus()
  }, [text, attachment, isStreaming, onSend, onFile, onStop])

  const onKey = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }, [submit])

  const handleFile = useCallback(file => {
    if (!file) return
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setAttachment({ file, name: file.name, type: file.type, size: file.size, preview })
  }, [])

  const canSend = (text.trim() || attachment) && !disabled

  return (
    <div className="px-4 pb-4 pt-1 shrink-0">
      {/* ── Outer glow wrapper ── */}
      <div className="max-w-[780px] mx-auto">

        {/* Attachment preview */}
        {attachment && (
          <div className="mb-2 flex items-start">
            <div className="relative inline-flex">
              {attachment.preview
                ? <img src={attachment.preview} alt="preview" className="h-16 rounded-xl border border-white/[0.08] object-cover" />
                : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card border border-white/[0.08] text-[12.5px] text-white/55">
                    📎 <span className="max-w-[180px] truncate">{attachment.name}</span>
                    <span className="text-white/25">{(attachment.size / 1024).toFixed(0)}KB</span>
                  </div>
                )
              }
              <button
                onClick={() => setAttachment(null)}
                className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-bg-raised border border-white/[0.10] flex items-center justify-center text-white/50 hover:text-white hover:bg-brand/80 transition-all"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}

        {/* ── Main glass bar ── */}
        <div
          className={clsx(
            'glass-input rounded-2xl transition-all duration-200',
            dragOver && 'border-brand/50 shadow-[0_0_0_3px_rgba(192,57,43,0.12)]'
          )}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
        >
          <div className="flex items-end gap-1 px-3 py-2.5">
            {/* Attach */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-xl text-white/28 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-30"
              title="Attach file"
            >
              <Paperclip size={16} />
            </button>
            <input ref={fileRef} type="file" accept={ALLOWED} className="hidden"
              onChange={e => { handleFile(e.target.files?.[0]); e.target.value = '' }} />

            {/* Textarea */}
            <textarea
              ref={taRef}
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKey}
              disabled={disabled}
              placeholder={isStreaming ? 'Generating…' : 'Message RUBRA…'}
              className={clsx(
                'flex-1 bg-transparent resize-none outline-none',
                'text-[14.5px] text-white/88 placeholder-white/22 leading-relaxed',
                'font-sans py-1.5 max-h-[200px] overflow-y-auto',
                'disabled:opacity-40'
              )}
            />

            {/* Send / Stop */}
            <button
              onClick={submit}
              disabled={!canSend && !isStreaming}
              className={clsx(
                'w-[34px] h-[34px] flex items-center justify-center rounded-xl transition-all duration-150 shrink-0',
                isStreaming
                  ? 'bg-brand/18 border border-brand/35 text-brand hover:bg-brand/25'
                  : canSend
                    ? 'bg-brand text-white hover:bg-brand-dark shadow-send hover:scale-105 active:scale-95'
                    : 'bg-white/[0.06] text-white/18 cursor-not-allowed border border-white/[0.06]'
              )}
              title={isStreaming ? 'Stop' : 'Send'}
            >
              {isStreaming ? <Square size={13} fill="currentColor" /> : <ArrowUp size={16} strokeWidth={2.2} />}
            </button>
          </div>

          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 rounded-2xl bg-brand/[0.07] border border-brand/30 flex items-center justify-center pointer-events-none">
              <span className="text-[13px] text-brand/80 font-medium">Drop to attach</span>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-white/18 mt-2 tracking-wide">
          RUBRA can make mistakes · Verify critical information
        </p>
      </div>
    </div>
  )
}
