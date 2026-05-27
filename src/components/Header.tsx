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
  const { toggleSidebar, mode, setMode } = useChat();

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
          <img src="/rubra_sparkle.png" alt="Rubra" className="w-7 h-7" />
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
