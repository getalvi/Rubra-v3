import React from 'react';
import { ChatProvider } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatBar from '../components/ChatBar';
import useChat from '../hooks/useChat';

function AppContent() {
  const { toggleSidebar } = useChat();

  return (
    <div className="flex h-screen w-full bg-gemini-bg text-gemini-text font-sans overflow-hidden relative">
      {/* Menu Hamburger Button for Mobile/Layout Toggle */}
      <button 
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-50 text-gray-400 hover:text-gemini-text p-2 rounded-lg hover:bg-gemini-surface transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar />
      
      <main className="flex-1 flex flex-col relative h-full items-center w-full pt-12">
        <div className="w-full max-w-4xl flex-1 overflow-y-auto pb-32">
          <ChatWindow />
        </div>
        <div className="w-full absolute bottom-0 flex justify-center pb-6 pt-10 bg-gradient-to-t from-gemini-bg via-gemini-bg to-transparent">
          <ChatBar />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
