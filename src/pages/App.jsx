import React, { useState, useRef } from 'react';
import { ChatContext } from '../hooks/useChat'; 
import Sidebar from '../components/Sidebar';
import MessageThread from '../components/MessageThread';
import ChatBar from '../components/ChatBar';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const abortControllerRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const assistantMessageId = Date.now();
    setMessages((prev) => [...prev, { role: 'assistant', text: '', id: assistantMessageId }]);

    abortControllerRef.current = new AbortController();

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'https://getalvi-rubra-v3.hf.space/api/chat';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Backend connection failed');

      const data = await response.json();
      const reply = data.response || data.reply || data.text || JSON.stringify(data);

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMessageId ? { ...m, text: reply } : m))
      );
    } catch (error) {
      if (error.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, text: 'Error connecting to Rubra backend.' } : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isStreaming, stopStreaming, isSidebarOpen, toggleSidebar }}>
      <div className="flex h-screen w-full bg-gemini-black text-gemini-text font-sans overflow-hidden relative">
        <button 
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-50 text-gray-400 hover:text-gemini-text p-2 rounded-lg hover:bg-gemini-surface transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Sidebar />
        
        <main className="flex-1 flex flex-col relative h-full items-center w-full pt-12 overflow-hidden">
          <div className="w-full max-w-4xl flex-1 overflow-y-auto pb-32 no-scrollbar">
            <MessageThread />
          </div>
          <div className="w-full absolute bottom-0 flex justify-center pb-6 pt-10 bg-gradient-to-t from-gemini-black via-gemini-black to-transparent z-10">
            <ChatBar />
          </div>
        </main>
      </div>
    </ChatContext.Provider>
  );
}
