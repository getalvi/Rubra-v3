/**
 * ChatArea — Main chat interface (Gemini-style)
 */
import React, { useState, useRef, useEffect } from 'react'
import { Menu, Send, Paperclip, Square, Sparkles } from 'lucide-react'
import Message from './Message'

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What's the weather in Dhaka today?",
  "Help me with my physics homework",
]

function WelcomeScreen({ onPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-slide-up">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
          <Sparkles size={32} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-normal text-white/90 mb-4">
        What should we focus on?
      </h1>

      {/* Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mt-8">
        {SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onPrompt(suggestion)}
            className="
              p-4 rounded-xl text-left
              bg-[#1e1f20] hover:bg-[#28292a]
              border border-white/10
              text-white/80 text-sm
              transition-all duration-200
              hover:-translate-y-0.5
            "
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-white/40">
        Rubra is AI and can make mistakes.
      </p>
    </div>
  )
}

export default function ChatArea({ 
  messages, 
  isStreaming, 
  onSend, 
  onFile,
  onStop,
  onMenuToggle,
  sidebarOpen 
}) {
  const [input, setInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const isEmpty = messages.length === 0

  return (
    <div 
      className="flex-1 flex flex-col h-screen relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500/50 rounded-lg z-50 flex items-center justify-center">
          <p className="text-blue-400 text-lg font-medium">Drop file here</p>
        </div>
      )}

      {/* Top bar - only show when not sidebar open on mobile */}
      {!sidebarOpen && (
        <div className="h-16 flex items-center px-4 border-b border-white/10 lg:hidden">
          <button
            onClick={onMenuToggle}
            className="btn-icon"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen onPrompt={onSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.map((msg, i) => (
              <Message key={i} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-white/10 bg-[#131314]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            {/* Input box */}
            <div className="
              bg-[#1e1f20] border border-white/10
              rounded-3xl overflow-hidden
              focus-within:border-white/20
              transition-colors
            ">
              <div className="flex items-end gap-2 p-3">
                {/* File attach button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  className="btn-icon shrink-0 w-10 h-10"
                  aria-label="Attach file"
                >
                  <Paperclip size={20} />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Text input */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Rubra"
                  disabled={isStreaming}
                  rows={1}
                  className="
                    flex-1 bg-transparent resize-none
                    text-white text-sm
                    placeholder-white/40
                    outline-none
                    max-h-[200px]
                    py-2
                  "
                />

                {/* Send/Stop button */}
                {isStreaming ? (
                  <button
                    onClick={onStop}
                    className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                    aria-label="Stop"
                  >
                    <Square size={18} className="text-white" fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`
                      shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      transition-all
                      ${input.trim() 
                        ? 'bg-white text-[#131314] hover:bg-white/90' 
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }
                    `}
                    aria-label="Send"
                  >
                    <Send size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Helper text */}
            <p className="text-xs text-white/30 text-center mt-2">
              Rubra can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
