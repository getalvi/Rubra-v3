import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import WelcomeScreen from '@/components/WelcomeScreen';
import MessageBubble from '@/components/MessageBubble';
import IconButton from '@/components/ui/IconButton';
import useChat from '@/hooks/useChat';

const ChatArea: React.FC = () => {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(distanceFromBottom > 200);
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show welcome screen if no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
        <WelcomeScreen />
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={chatContainerRef}
        className="h-full overflow-y-auto px-4 md:px-8 py-4 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto pt-4 pb-8">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 right-6 z-10"
          >
            <IconButton
              icon={ChevronDown}
              onClick={scrollToBottom}
              variant="filled"
              tooltip="Scroll to bottom"
              className="shadow-md bg-[#2a2a2e]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatArea;
