import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Code2,
  Search,
  Eye,
  GraduationCap,
  Globe,
  Zap,
  Plus,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  BookOpen,
  Wrench,
  BarChart3,
} from 'lucide-react';
import { getCurrentSessionId, resetSession } from '@/services/api';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chatHistory: { id: string; title: string; date: Date }[];
  onSelectChat: (id: string) => void;
  activeChat: string;
  currentMode: string;
  onModeChange: (mode: string) => void;
}

const modes = [
  { id: 'auto', label: 'Auto', icon: Sparkles, desc: 'Smart routing', color: 'from-amber-500 to-orange-500' },
  { id: 'coding', label: 'Code', icon: Code2, desc: 'Programming', color: 'from-blue-500 to-cyan-500' },
  { id: 'tutor', label: 'Tutor', icon: GraduationCap, desc: 'Education', color: 'from-emerald-500 to-teal-500' },
  { id: 'search', label: 'Search', icon: Search, desc: 'Web search', color: 'from-violet-500 to-purple-500' },
  { id: 'browse', label: 'Browse', icon: Globe, desc: 'Browse web', color: 'from-rose-500 to-pink-500' },
  { id: 'vision', label: 'Vision', icon: Eye, desc: 'Image AI', color: 'from-fuchsia-500 to-pink-500' },
  { id: 'hermes', label: 'Hermes', icon: Zap, desc: 'Advanced', color: 'from-yellow-500 to-amber-500' },
];

const navItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
];

export default function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  chatHistory,
  onSelectChat,
  activeChat,
  currentMode,
  onModeChange,
}: SidebarProps) {
  const [activeNav, setActiveNav] = useState('chat');
  const [sessionId, setSessionId] = useState('');
  const [showModes, setShowModes] = useState(true);

  useEffect(() => {
    setSessionId(getCurrentSessionId().slice(0, 12) + '...');
  }, []);

  const handleNewChat = () => {
    resetSession();
    setSessionId(getCurrentSessionId().slice(0, 12) + '...');
    onNewChat();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 300 : 72,
          x: isOpen ? 0 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full z-50 glass-strong border-r border-border/50 flex flex-col
          ${isOpen ? '' : 'items-center'}`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-border/30 ${isOpen ? '' : 'justify-center'}`}>
          {isOpen ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold text-white truncate">RUBRA AI</h1>
                <p className="text-[10px] text-muted-foreground truncate">v4.0 Multimodel</p>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors md:block hidden"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors md:hidden"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className={`p-3 ${isOpen ? '' : 'px-2'}`}>
          <button
            onClick={handleNewChat}
            className={`w-full glass-button text-white text-sm font-medium flex items-center gap-2
              ${isOpen ? 'px-4 py-2.5 rounded-xl' : 'p-2.5 rounded-xl justify-center'}`}
          >
            <Plus className="w-4 h-4" />
            {isOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* Mode Selector */}
        <div className={`px-3 mb-2 ${isOpen ? '' : 'px-2'}`}>
          {isOpen && (
            <button
              onClick={() => setShowModes(!showModes)}
              className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1"
            >
              <span>Mode</span>
              <motion.div
                animate={{ rotate: showModes ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronLeft className="w-3 h-3" />
              </motion.div>
            </button>
          )}
          <AnimatePresence>
            {showModes && (
              <motion.div
                initial={isOpen ? { height: 0, opacity: 0 } : false}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={`grid ${isOpen ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                  {modes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={`model-badge ${currentMode === mode.id ? 'active' : ''} 
                          ${isOpen ? 'px-3 py-2' : 'p-2 justify-center'} 
                          rounded-lg flex items-center gap-2 text-xs transition-all duration-200`}
                        title={mode.desc}
                      >
                        <Icon className={`w-3.5 h-3.5 ${currentMode === mode.id ? 'text-orange-400' : 'text-muted-foreground'}`} />
                        {isOpen && (
                          <span className={currentMode === mode.id ? 'text-orange-300 font-medium' : 'text-muted-foreground'}>
                            {mode.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat History */}
        {isOpen && (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Chats
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <AnimatePresence>
                {chatHistory.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No chats yet</p>
                    <p className="text-xs mt-1 opacity-50">Start a new conversation</p>
                  </motion.div>
                )}
                {chatHistory.map((chat, index) => (
                  <motion.button
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelectChat(chat.id)}
                    className={`sidebar-item w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-sm
                      ${activeChat === chat.id ? 'active' : 'text-muted-foreground hover:text-white'}`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{chat.title}</p>
                      <p className="text-[10px] opacity-50">
                        {chat.date.toLocaleDateString()}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Collapsed nav icons */}
        {!isOpen && (
          <div className="flex-1 flex flex-col items-center gap-1 px-2 py-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                    ${activeNav === item.id
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  title={item.label}
                >
                  <Icon className="w-4.5 h-4.5" />
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className={`p-3 border-t border-border/30 ${isOpen ? '' : 'px-2'}`}>
          {isOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-mono">{sessionId}</span>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          ) : (
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Toggle button for collapsed state */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onToggle}
          className="fixed left-[72px] top-4 z-40 p-1.5 rounded-lg glass-button md:flex hidden items-center justify-center"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      )}
    </>
  );
}
