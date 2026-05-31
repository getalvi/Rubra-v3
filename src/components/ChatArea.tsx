import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '@/components/MessageBubble';
import WelcomeScreen from '@/components/WelcomeScreen';
import useChat from '@/hooks/useChat';

const ChatArea: React.FC = () => {
  const { messages, isLoading } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show welcome screen when no messages
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto min-h-0 px-4 py-4 scroll-smooth"
    >
      <div className="max-w-3xl mx-auto pt-20 pb-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 py-4"
          >
            <div className="w-2 h-2 bg-[#8ab4f8] rounded-full animate-typing-1" />
            <div className="w-2 h-2 bg-[#9b72cb] rounded-full animate-typing-2" />
            <div className="w-2 h-2 bg-[#d96570] rounded-full animate-typing-3" />
          </motion.div>
        )}

        {/* Bottom spacer for auto-scroll */}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

export default ChatArea;
