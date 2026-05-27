import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Square, Paperclip, Mic } from 'lucide-react';
import useChat from '@/hooks/useChat';

const InputBar: React.FC = () => {
  const { sendMessage, isStreaming, stopStreaming } = useChat();
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if ((!input.trim() && !file) || isStreaming) return;
    sendMessage(input.trim(), file);
    setInput('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, file, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  return (
    <>
      {/* Drag overlay */}
      {isDragging && (
        <div
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="fixed inset-0 z-50 bg-black/60 border-2 border-dashed border-[#8ab4f8] flex items-center justify-center animate-pulse"
        >
          <p className="text-xl font-medium text-[#e8eaed]">Drop file here</p>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        className="w-full max-w-3xl mx-auto px-4 pb-6"
      >
        {/* File attachment display */}
        {file && (
          <div className="flex items-center gap-2 mb-2 px-4">
            <div className="flex items-center gap-2 bg-[#212124] border border-[#3c4043] rounded-lg px-3 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8ab4f8" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span className="text-sm text-[#e8eaed] truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="ml-1 p-0.5 rounded hover:bg-[#3c4043] text-[#9aa0a6]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Input container */}
        <div className="w-full flex items-end gap-2 bg-[#1e1f20] rounded-full px-2 py-2 border border-transparent focus-within:border-[#3c4043] focus-within:bg-[#282a2c] shadow-input transition-all duration-200">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] transition-all duration-150 flex-shrink-0"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md,.json,.csv,.jpg,.jpeg,.png,.pdf"
          />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Rubra..."
            disabled={isStreaming}
            rows={1}
            className="
              flex-1 bg-transparent border-none outline-none
              text-[#e8eaed] placeholder-[#9aa0a6]
              text-base py-2.5 min-h-[40px] max-h-[200px]
              resize-none disabled:opacity-50
            "
          />

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mic button (placeholder) */}
            <button
              className="p-2.5 rounded-full text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] transition-all duration-150"
              title="Voice input"
            >
              <Mic size={20} />
            </button>

            {/* Send / Stop button */}
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="p-2.5 rounded-full bg-[rgba(242,139,130,0.15)] text-[#f28b82] hover:bg-[rgba(242,139,130,0.25)] transition-all duration-150"
                title="Stop"
              >
                <Square size={20} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && !file}
                className={`
                  p-2.5 rounded-full transition-all duration-200
                  ${input.trim() || file
                    ? 'bg-[rgba(138,180,248,0.15)] text-[#8ab4f8] hover:bg-[rgba(138,180,248,0.25)]'
                    : 'text-[#5f6368] cursor-not-allowed opacity-40'
                  }
                `}
                title="Send"
              >
                <Send size={20} className="rotate-45" />
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[11px] text-[#5f6368] mt-2 tracking-wide select-none">
          Rubra can make mistakes. Consider verifying important information.
        </p>
      </div>
    </>
  );
};

export default InputBar;
