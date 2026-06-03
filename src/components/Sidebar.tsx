import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MessageSquare } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import SessionItem from '@/components/ui/SessionItem';
import useChat from '@/hooks/useChat';

const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    setSidebarOpen,
    sessions,
    activeSessionId,
    createSession,
    loadSession,
    deleteSession,
    renameSession,
    isSidebarCollapsed,
  } = useChat();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setSidebarOpen]);

  const handleNewChat = () => {
    createSession();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLoadSession = (id: string) => {
    loadSession(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // If collapsed on desktop, don't render sidebar content
  if (!isMobile && isSidebarCollapsed) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen || !isMobile ? 0 : -320,
        }}
        transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`
          fixed lg:relative top-0 left-0 h-full
          w-[280px] sm:w-[300px] lg:w-[280px] xl:w-[300px]
          bg-[#151517] border-r border-[#282a2c]
          flex flex-col z-[60] lg:z-auto
          flex-shrink-0
        `}
      >
        {/* Top Bar */}
        <div className="flex items-center gap-2 p-3 pt-16 lg:pt-4">
          <button
            onClick={handleNewChat}
            className="
              flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl
              bg-[#1e1e20] hover:bg-[#2a2a2e]
              text-[#e8eaed] text-sm font-medium
              transition-all duration-150
              active:scale-[0.98]
            "
          >
            <Plus size={18} />
            <span>New chat</span>
          </button>
          <div className="lg:hidden">
            <IconButton icon={X} onClick={() => setSidebarOpen(false)} tooltip="Close" />
          </div>
        </div>

        {/* Logo Section */}
        <div className="px-4 pb-3 pt-1">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#282a2c]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <defs>
                <linearGradient id="sidebarLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4285f4" />
                  <stop offset="50%" stopColor="#9b72cb" />
                  <stop offset="100%" stopColor="#d96570" />
                </linearGradient>
              </defs>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#sidebarLogo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="text-lg font-semibold text-[#e8eaed]">Rubra v3</span>
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
          <div className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-wider px-3 py-2 flex items-center justify-between">
            <span>Recent</span>
            {sessions.length > 0 && (
              <span className="text-[#5f6368] normal-case">{sessions.length} chat{sessions.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare size={32} className="text-[#3c4043] mb-3" />
              <p className="text-sm text-[#5f6368] italic">No conversations yet</p>
              <p className="text-xs text-[#5f6368] mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <AnimatePresence initial={false}>
                {sessions.map(session => (
                  <SessionItem
                    key={session.id}
                    id={session.id}
                    title={session.title}
                    active={session.id === activeSessionId}
                    timestamp={session.timestamp}
                    onClick={() => handleLoadSession(session.id)}
                    onDelete={() => deleteSession(session.id)}
                    onRename={(title) => renameSession(session.id, title)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#282a2c]">
          <div className="flex items-center justify-between text-xs text-[#5f6368]">
            <span>Bangladeshi AI</span>
            <span className="text-[#3c4043]">v3.1</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
