import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Code, Zap, Lightbulb, BookOpen, Calculator } from 'lucide-react';
import GradientText from '@/components/ui/GradientText';
import SuggestionCard from '@/components/ui/SuggestionCard';
import useChat from '@/hooks/useChat';

const suggestions = [
  {
    text: 'Draft a professional email matching Gemini style',
    icon: Edit3,
    prompt: 'Draft a professional email matching Gemini style',
  },
  {
    text: 'Write a complex recursive function in JavaScript',
    icon: Code,
    prompt: 'Write a complex recursive function in JavaScript',
  },
  {
    text: 'Analyze this code snippet for runtime complexity',
    icon: Zap,
    prompt: 'Analyze this code snippet for runtime complexity: function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }',
  },
  {
    text: 'Explain quantum computing like I\'m five',
    icon: Lightbulb,
    prompt: 'Explain quantum computing like I\'m five',
  },
  {
    text: 'Generate a creative story about Bangladesh',
    icon: BookOpen,
    prompt: 'Generate a creative story about Bangladesh',
  },
  {
    text: 'Help me solve this math problem step by step',
    icon: Calculator,
    prompt: 'Help me solve: Find the derivative of f(x) = x³ + 2x² - 5x + 1',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const WelcomeScreen: React.FC = () => {
  const { sendMessage } = useChat();

  const handleSuggestion = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-start justify-center min-h-[70vh] max-w-3xl mx-auto px-4 select-none"
    >
      {/* Gradient Greeting */}
      <motion.div variants={itemVariants} className="mb-12 w-full">
        <GradientText as="h1" className="text-5xl md:text-[56px] font-normal tracking-tight leading-tight">
          Hello, Alvi
        </GradientText>
        <h2 className="text-5xl md:text-[56px] font-normal text-[#5f6368] mt-1 leading-tight">
          How can I help you today?
        </h2>
      </motion.div>

      {/* Decorative gradient orb */}
      <div className="absolute top-20 right-20 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#4285f4] via-[#9b72cb] to-[#d96570] blur-3xl" />
      </div>

      {/* Suggestion Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full"
      >
        {suggestions.map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <SuggestionCard
              text={s.text}
              icon={s.icon}
              onClick={() => handleSuggestion(s.prompt)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
