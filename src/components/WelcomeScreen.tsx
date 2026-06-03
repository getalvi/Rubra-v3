import React from 'react';
import { motion } from 'framer-motion';
import { PenLine, Code2, Zap, Lightbulb, BookOpen, Calculator } from 'lucide-react';
import useChat from '@/hooks/useChat';

const suggestions = [
  { text: 'Draft a professional email matching Gemini style', icon: PenLine },
  { text: 'Write a complex recursive function in JavaScript', icon: Code2 },
  { text: 'Analyze this code snippet for runtime complexity', icon: Zap },
  { text: 'Explain quantum computing like I\'m five', icon: Lightbulb },
  { text: 'Generate a creative story about Bangladesh', icon: BookOpen },
  { text: 'Help me solve this math problem step by step', icon: Calculator },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const WelcomeScreen: React.FC = () => {
  const { sendMessage } = useChat();

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl"
      >
        {/* Greeting */}
        <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-2 sm:mb-3">
            <span className="gradient-text">Hello, Alvi</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#5f6368] font-light">
            How can I help you today?
          </p>
        </motion.div>

        {/* Suggestion Cards - responsive grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3"
        >
          {suggestions.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={i}
                variants={itemVariants}
                onClick={() => handleSuggestion(s.text)}
                className="
                  group relative flex flex-col items-start
                  p-3 sm:p-4 rounded-xl sm:rounded-2xl
                  bg-[#1a1a1a] hover:bg-[#212124]
                  border border-[#282a2c] hover:border-[#3c4043]
                  text-left transition-all duration-200
                  h-full min-h-[80px] sm:min-h-[100px]
                  active:scale-[0.98]
                "
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xs sm:text-sm text-[#e8eaed] leading-relaxed mb-3 pr-10 sm:pr-8">
                  {s.text}
                </span>
                <span className="
                  absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3
                  w-7 h-7 sm:w-8 sm:h-8 rounded-full
                  bg-[#2a2a2e] group-hover:bg-[#3c4043]
                  flex items-center justify-center
                  transition-colors duration-200
                ">
                  <Icon size={14} className="text-[#8ab4f8]" />
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Keyboard shortcuts hint */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[10px] sm:text-xs text-[#3c4043] mt-6 sm:mt-8"
        >
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#282a2c] text-[#5f6368] font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#282a2c] text-[#5f6368] font-mono text-[10px]">Shift + Enter</kbd> for new line
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
