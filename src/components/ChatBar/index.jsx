/**
 * ChatBar — Input bar with file upload, drag-drop, stop
 * Fixed: standalone component, no wrong imports
 */
import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Square } from 'lucide-react'
import clsx from 'clsx'

export default function ChatBar({
  onSend,
  onFile,
  onStop,
  isStreaming,
  statusText = '',
  progress = 0,
}) {
  const [input, setInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className="shrink-0 border-t border-white/[0.06] bg-[#131314]"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
    >
      <div className="max-w-3xl mx-auto px-4 py-4">

        {/* Progress bar */}
        {isStreaming && progress > 0 && (
          <div className="mb-2 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500/60 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Status text */}
        {isStreaming && statusText && (
          <p className="text-[11.5px] text-white/35 mb-2 pl-1 animate-pulse">
            {statusText}
          </p>
        )}

        {/* Input box */}
        <div
          className={clsx(
            'bg-[#1e1f20] border rounded-3xl overflow-hidden transition-colors',
            isDragging
              ? 'border-blue-500/50 bg-blue-500/5'
              : 'border-white/10 focus-within:border-white/20'
          )}
        >
          <div className="flex items-end gap-2 p-3">
            {/* File attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="btn-icon shrink-0 w-9 h-9"
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isDragging ? 'Drop file here…' : 'Ask Rubra'}
              disabled={isStreaming}
              rows={1}
              className="flex-1 bg-transparent resize-none text-white text-[13.5px] placeholder-white/35 outline-none max-h-[200px] py-2 leading-relaxed"
            />

            {/* Send / Stop */}
            {isStreaming ? (
              <button
                onClick={onStop}
                className="shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                aria-label="Stop"
              >
                <Square size={16} className="text-white" fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={clsx(
                  'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  input.trim()
                    ? 'bg-white text-[#131314] hover:bg-white/90 active:scale-95'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-white/25 text-center mt-2">
          Rubra can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}
