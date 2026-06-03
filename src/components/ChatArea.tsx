import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '@/components/MessageBubble';
import WelcomeScreen from '@/components/WelcomeScreen';
import useChat from '@/hooks/useChat';

const ChatArea: React.FC = () => {
  const { messages, isLoading } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  // Smart auto-scroll: only scroll if user is near bottom
  useEffect(() => {
    if (bottomRef.current && containerRef.current && shouldScrollRef.current) {
      const container = containerRef.current;
      const threshold = 200;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      const isNearBottom = distanceFromBottom < threshold;

      if (isNearBottom) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Detect if user scrolls up to disable auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 200;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldScrollRef.current = distanceFromBottom < threshold;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
      className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 lg:px-6 py-4 scroll-smooth"
    >
      <div className="max-w-3xl mx-auto pt-16 lg:pt-20 pb-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: index === messages.length - 1 ? 0 : 0 }}
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
            className="flex items-center gap-2 py-4 pl-12"
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
