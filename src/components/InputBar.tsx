import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, Send, Square, X, FileText } from 'lucide-react';
import useChat from '@/hooks/useChat';

const InputBar: React.FC = () => {
  const { sendMessage, isStreaming, stopStreaming } = useChat();
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && !file) return;
    if (isStreaming) return;
    sendMessage(input, file);
    setInput('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, file, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      // Limit file size to 10MB
      if (selected.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setFile(selected);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(dropped);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const isActive = input.trim().length > 0 || file !== null;

  return (
    <div
      className="w-full px-4 pb-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* File preview */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-[#2a2a2e] border border-[#3c4043] w-fit"
          >
            <FileText size={16} className="text-[#8ab4f8]" />
            <span className="text-sm text-[#e8eaed] truncate max-w-[200px]">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="p-0.5 rounded hover:bg-[#3c4043] text-[#9aa0a6] ml-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(138,180,248,0.05)] border-2 border-dashed border-[#8ab4f8] z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <Paperclip size={48} className="text-[#8ab4f8] mx-auto mb-2" />
              <p className="text-lg text-[#e8eaed] font-medium">Drop file here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div
        className={`
          relative flex items-end gap-2
          bg-[#1e1f20] border rounded-3xl
          shadow-input
          transition-all duration-200
          ${dragOver ? 'border-[#8ab4f8]' : 'border-[#3c4043] focus-within:border-[#5f6368]'}
        `}
      >
        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className="flex-shrink-0 p-3 rounded-full text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] transition-colors disabled:opacity-40"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Rubra..."
          disabled={isStreaming}
          rows={1}
          className="
            flex-1 bg-transparent py-3.5 px-1
            text-[#e8eaed] text-[15px] placeholder-[#5f6368]
            outline-none resize-none
            disabled:opacity-60
            min-h-[48px] max-h-[200px]
          "
        />

        {/* Mic button (hidden when has input) */}
        {!isActive && !isStreaming && (
          <button
            className="flex-shrink-0 p-3 rounded-full text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] transition-colors"
            title="Voice input"
          >
            <Mic size={20} />
          </button>
        )}

        {/* Send / Stop button */}
        {isStreaming ? (
          <button
            onClick={stopStreaming}
            className="
              flex-shrink-0 m-1.5 p-2.5 rounded-full
              bg-[#2a2a2e] text-[#f28b82]
              hover:bg-[#3c4043]
              transition-colors
            "
            title="Stop"
          >
            <Square size={18} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isActive}
            className={`
              flex-shrink-0 m-1.5 p-2.5 rounded-full
              transition-all duration-200
              ${isActive
                ? 'bg-[#8ab4f8] text-[#0d0d0d] hover:bg-[#aecbfa] shadow-glow-blue'
                : 'bg-transparent text-[#5f6368]'
              }
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
            title="Send"
          >
            <Send size={18} />
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[11px] text-[#5f6368] mt-2 px-4">
        Rubra can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
};

export default InputBar;
