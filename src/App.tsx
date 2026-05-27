import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { ChatProvider } from '@/hooks/useChat';
import useChat from '@/hooks/useChat';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import InputBar from '@/components/InputBar';
import ToastContainer from '@/components/ui/Toast';
import IconButton from '@/components/ui/IconButton';

// ── Inner App Component ─────────────────────────────────────────────────────
const ChatApp: React.FC = () => {
  const { messages, isSidebarOpen, toasts, removeToast, toggleSidebar } = useChat();
  const [headerVisible, setHeaderVisible] = useState(false);

  // Show header when scrolled past welcome screen
  useEffect(() => {
    if (messages.length > 0) {
      setHeaderVisible(true);
      return;
    }
    setHeaderVisible(false);
  }, [messages.length]);

  return (
    <div className="flex h-screen w-full bg-[#0d0d0d] text-[#e8eaed] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Header */}
        <Header visible={headerVisible} />

        {/* Toggle button (desktop, when sidebar is open) */}
        {!isSidebarOpen && messages.length === 0 && (
          <div className="hidden lg:block absolute top-4 left-4 z-30">
            <IconButton icon={Menu} onClick={toggleSidebar} tooltip="Open sidebar" />
          </div>
        )}

        {/* Chat Area */}
        <ChatArea />

        {/* Input Bar */}
        <div className="flex-shrink-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent pt-4">
          <InputBar />
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

// ── Root App with Provider ──────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
};

export default App;
