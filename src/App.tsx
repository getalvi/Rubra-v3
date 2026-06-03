import React from 'react';
import { ChatProvider } from '@/hooks/useChat';
import useChat from '@/hooks/useChat';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import InputBar from '@/components/InputBar';
import ToastContainer from '@/components/ui/Toast';
import ConnectionStatus from '@/components/ui/ConnectionStatus';

// -- Inner App Component ----------------------------------------------------
const ChatApp: React.FC = () => {
  const { toasts, removeToast, connectionStatus } = useChat();

  return (
    <div className="flex h-screen w-full bg-[#0d0d0d] text-[#e8eaed] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Header - always visible */}
        <Header />

        {/* Connection Status Banner */}
        <ConnectionStatus status={connectionStatus} />

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

// -- Root App with Provider -------------------------------------------------
const App: React.FC = () => {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
};

export default App;
