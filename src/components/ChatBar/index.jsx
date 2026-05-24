/**
 * ChatBar — Clean Gemini-style input
 * No progress bar, no status text — those live in the message thread
 */
import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Square } from 'lucide-react'
import clsx from 'clsx'

export default function ChatBar({ onSend, onFile, onStop, isStreaming }) {
  const [input, setInput]       = useState('')
  const [isDragging, setIsDrag] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize
  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
  }, [input])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault(); setIsDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  const canSend = input.trim() && !isStreaming

  return (
    <div
      className="shrink-0 px-4 pb-4 pt-2"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true) }}
      onDragLeave={() => setIsDrag(false)}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className={clsx(
            'flex items-end gap-2 px-3 py-3 rounded-3xl border transition-colors',
            'bg-[#1e1f20]',
            isDragging
              ? 'border-blue-500/40 bg-blue-500/5'
              : 'border-white/10 focus-within:border-white/20'
          )}
        >
          {/* Attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-30"
            aria-label="Attach file"
          >
            <Paperclip size={17} />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />

          {/* Text */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isDragging ? 'Drop file here…' : 'Ask Rubra'}
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-transparent resize-none text-white/90 text-[13.5px] placeholder-white/30 outline-none max-h-[200px] py-1.5 leading-relaxed"
          />

          {/* Send / Stop */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
              aria-label="Stop"
            >
              <Square size={14} className="text-white" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={clsx(
                'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                canSend
                  ? 'bg-white text-[#131314] hover:bg-white/90 active:scale-95'
                  : 'bg-white/8 text-white/20 cursor-not-allowed'
              )}
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          )}
        </div>

        <p className="text-[11px] text-white/20 text-center mt-2">
          Rubra can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}
