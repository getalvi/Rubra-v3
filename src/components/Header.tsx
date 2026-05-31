import React from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import ModeSelector from '@/components/ui/ModeSelector';
import RubraAvatar from '@/components/ui/RubraAvatar';
import useChat from '@/hooks/useChat';

interface HeaderProps {
  visible: boolean;
}

const Header: React.FC<HeaderProps> = ({ visible }) => {
 const { toggleSidebar, mode, setMode, createSession } = useChat();

// Add inside header:
<button onClick={createSession} className="...">
  <Plus size={18} />
  <span className="hidden sm:inline">New chat</span>
</button>
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className={`
        fixed top-0 left-0 right-0 h-16
        glass-bg border-b border-[rgba(255,255,255,0.06)]
        flex items-center justify-between px-4
        ${visible ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
      style={{ zIndex: 45 }}
    >
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <IconButton icon={Menu} onClick={toggleSidebar} tooltip="Open menu" />
        </div>
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <defs>
              <linearGradient id="headerLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4285f4" />
                <stop offset="50%" stopColor="#9b72cb" />
                <stop offset="100%" stopColor="#d96570" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#headerLogo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-base font-medium text-[#e8eaed]">Rubra</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeSelector mode={mode} onChange={setMode} />
        <RubraAvatar variant="user" size="sm" />
      </div>
    </motion.header>
  );
};

export default Header;
