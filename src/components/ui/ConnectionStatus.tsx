import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'online' | 'offline' | 'checking';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  return (
    <AnimatePresence>
      {status === 'offline' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2d1f1f] border-b border-[#f28b82]/20 text-[#f28b82] text-xs"
        >
          <WifiOff size={14} />
          <span>Backend is offline. Some features may not work.</span>
        </motion.div>
      )}
      {status === 'checking' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1f1f2d] border-b border-[#8ab4f8]/20 text-[#8ab4f8] text-xs"
        >
          <Loader2 size={14} className="animate-spin" />
          <span>Connecting to backend...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
