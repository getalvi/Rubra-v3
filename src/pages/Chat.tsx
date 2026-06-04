import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Code2,
  GraduationCap,
  Globe,
  ArrowDown,
  Menu,
  Bot,
  Brain,
  Layers,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatInput from '@/components/ChatInput';
import { UserMessage, AIMessage, TypingIndicator } from '@/components/MessageComponents';
import { streamChat } from '@/services/api';
import Particles from '@/components/Particles';
import type { Message } from '@/types';

const suggestedPrompts = [
  { icon: Code2, text: 'Write a Python function to sort a list', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { icon: Brain, text: 'Explain quantum computing simply', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: Globe, text: 'What are the latest tech news?', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: GraduationCap, text: 'Help me understand calculus', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
];

const modelFeatures = [
  { icon: Layers, label: 'Multi-Model', desc: 'DeepSeek, Qwen, Gemini, GLM, Cerebras, Llama' },
  { icon: Brain, label: 'Self-Evolving', desc: 'Learns and improves from conversations' },
  { icon: Code2, label: 'Code Expert', desc: 'Specialized coding with syntax highlighting' },
  { icon: Sparkles, label: 'Smart Routing', desc: 'Auto-selects best model for your task' },
];

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('auto');
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string; date: Date }[]>([]);
  const [activeChat, setActiveChat] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show scroll button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sidebar toggle for responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveChat('');
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChat(id);
    // In a real app, you'd load the chat history here
  }, []);

  const handleSendMessage = useCallback(async (
    content: string,
    image?: string,
    imageMime?: string
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      image: image ? `data:${imageMime};base64,${image}` : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      const stream = streamChat(content, {
        mode: currentMode,
        image,
        imageMime,
      });

      let fullContent = '';
      let detectedIntent = '';
      let detectedAgent = '';

      for await (const event of stream) {
        if (event.type === 'meta') {
          if (event.intent) detectedIntent = event.intent;
          if (event.agent) detectedAgent = event.agent;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, intent: detectedIntent, agent: detectedAgent }
                : msg
            )
          );
        } else if (event.type === 'token') {
          if (event.content) {
            fullContent = event.content;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: fullContent }
                  : msg
              )
            );
          }

          if (event.done) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, isStreaming: false, content: fullContent || msg.content }
                  : msg
              )
            );
          }
        } else if (event.type === 'error') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: `Error: ${event.message || 'Something went wrong'}`, isStreaming: false }
                : msg
            )
          );
        }
      }

      // Add to chat history if it's the first message
      if (messages.length === 0) {
        const title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
        setChatHistory((prev) => [
          { id: Date.now().toString(), title, date: new Date() },
          ...prev,
        ]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to RUBRA';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: `Error: ${errorMessage}. Please try again.`, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentMode, messages.length]);

  const handleSuggestedPrompt = useCallback((text: string) => {
    handleSendMessage(text);
  }, [handleSendMessage]);

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[hsl(220,25%,4%)]">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none z-0" />

      {/* Floating particles */}
      <Particles />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        activeChat={activeChat}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: sidebarOpen ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 300) : 72,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col h-full relative"
      >
        {/* Top Bar */}
        <header className="glass-strong border-b border-border/30 px-4 py-3 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">RUBRA AI</h2>
                <p className="text-[10px] text-muted-foreground capitalize">{currentMode} Mode</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Online</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto relative"
        >
          {isEmpty ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-2xl mx-auto"
              >
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/30"
                >
                  <Bot className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl sm:text-4xl font-bold text-white mb-3 text-glow"
                >
                  RUBRA AI
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-muted-foreground text-sm sm:text-base mb-8"
                >
                  Multimodel AI Agent with Self-Evolving Intelligence
                </motion.p>

                {/* Model Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="grid grid-cols-2 gap-3 mb-8"
                >
                  {modelFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="glass-card rounded-xl p-3 text-left"
                      >
                        <Icon className="w-5 h-5 text-orange-400 mb-2" />
                        <p className="text-xs font-semibold text-white">{feature.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{feature.desc}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Suggested Prompts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <motion.button
                        key={prompt.text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        className={`${prompt.bg} ${prompt.border} border rounded-xl p-3 flex items-center gap-3 text-left transition-all hover:shadow-lg`}
                      >
                        <Icon className={`w-5 h-5 ${prompt.color} shrink-0`} />
                        <span className="text-sm text-white/80">{prompt.text}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>
          ) : (
            /* Messages */
            <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  message.role === 'user' ? (
                    <UserMessage key={message.id} message={message} />
                  ) : (
                    <AIMessage key={message.id} message={message} />
                  )
                ))}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <TypingIndicator />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="shrink-0 px-4 py-3 glass-strong border-t border-border/30 z-20">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-24 right-6 p-2.5 rounded-full glass-button shadow-lg z-30"
            >
              <ArrowDown className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}
