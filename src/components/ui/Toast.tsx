import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: 'text-[#81c995]',
  error: 'text-[#f28b82]',
  info: 'text-[#8ab4f8]',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#2a2a2e] border border-[#3c4043] shadow-lg"
            >
              <Icon size={16} className={colorMap[toast.type]} />
              <span className="text-sm text-[#e8eaed]">{toast.message}</span>
              <button
                onClick={() => onRemove(toast.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-[#3c4043] text-[#9aa0a6]"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
