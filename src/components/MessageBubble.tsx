import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Pencil, Check as CheckIcon, X } from 'lucide-react';
import RubraAvatar from '@/components/ui/RubraAvatar';
import CodeBlock from '@/components/ui/CodeBlock';
import type { Message } from '@/hooks/useChat';
import useChat from '@/hooks/useChat';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { editMessage } = useChat();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.text);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.text]);

  const handleEditSave = () => {
    if (editValue.trim() && editValue !== message.text) {
      editMessage(message.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleEditSave();
    }
    if (e.key === 'Escape') {
      setEditValue(message.text);
      setIsEditing(false);
    }
  };

  // User message
  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
        className="w-full flex justify-end mb-6 group"
      >
        <div className="relative max-w-[85%] sm:max-w-[80%]">
          {isEditing ? (
            <div className="bg-[#1e1f20] rounded-2xl p-4 border border-[#8ab4f8]">
              <textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                autoFocus
                className="w-full bg-transparent text-[#f0f4f9] text-[15px] leading-relaxed outline-none resize-none min-h-[60px]"
              />
              <div className="flex items-center gap-2 mt-2 justify-end">
                <button
                  onClick={() => { setEditValue(message.text); setIsEditing(false); }}
                  className="p-1.5 rounded-lg hover:bg-[#3c4043] text-[#9aa0a6]"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleEditSave}
                  className="p-1.5 rounded-lg hover:bg-[#3c4043] text-[#81c995]"
                >
                  <CheckIcon size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#1e1f20] text-[#f0f4f9] px-5 py-3 rounded-2xl text-[15px] leading-relaxed break-words">
                {message.text}
                {message.edited && (
                  <span className="text-[#5f6368] text-xs ml-2">(edited)</span>
                )}
              </div>
              {/* Edit button on hover */}
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-[#2a2a2e] text-[#9aa0a6] transition-all duration-150"
              >
                <Pencil size={14} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // AI message
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
      className="w-full flex justify-start mb-6 group"
    >
      <div className="flex items-start gap-3 w-full max-w-full">
        <RubraAvatar variant="ai" size="md" isStreaming={message.streaming} />

        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Message content */}
          <div className="text-[#e8eaed] text-[15px] leading-7 break-words prose-custom">
            {message.streaming && !message.text ? (
              <div className="flex items-center gap-1.5 pt-2">
                <div className="w-2 h-2 bg-[#8ab4f8] rounded-full animate-typing-1" />
                <div className="w-2 h-2 bg-[#9b72cb] rounded-full animate-typing-2" />
                <div className="w-2 h-2 bg-[#d96570] rounded-full animate-typing-3" />
              </div>
            ) : message.text ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1] : 'plaintext';
                    const code = String(children).replace(/\n$/, '');
                    if (inline) {
                      return (
                        <code className="bg-[rgba(138,180,248,0.1)] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#8ab4f8]" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return <CodeBlock code={code} language={lang} />;
                  },
                  pre({ children }: any) {
                    return <>{children}</>;
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            ) : null}
            {/* Streaming cursor */}
            {message.streaming && message.text && (
              <span className="inline-block w-[2px] h-[18px] bg-[#8ab4f8] ml-0.5 align-middle animate-cursor-blink" />
            )}
          </div>

          {/* Actions bar - visible on hover or when not streaming */}
          {!message.streaming && message.text && (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-[#2a2a2e] text-[#9aa0a6] hover:text-[#e8eaed] transition-colors"
                title="Copy"
              >
                {copied ? <Check size={14} className="text-[#81c995]" /> : <Copy size={14} />}
              </button>
              <button
                onClick={() => editMessage(message.id, message.text)}
                className="p-1.5 rounded-lg hover:bg-[#2a2a2e] text-[#9aa0a6] hover:text-[#e8eaed] transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={14} />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-[#2a2a2e] text-[#9aa0a6] hover:text-[#e8eaed] transition-colors"
                title="Helpful"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-[#2a2a2e] text-[#9aa0a6] hover:text-[#e8eaed] transition-colors"
                title="Not helpful"
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
