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
      // Hardcoded direct Hugging Face Space backend endpoint
      const backendUrl = 'https://getalvi-rubra-v3.hf.space/api/chat';

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
      <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden antialiased">
        
        {/* Toggle Burger Menu */}
        <button 
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-50 text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#282a2c] transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Sidebar />
        
        {/* Main Interface Layout */}
        <main className="flex-1 flex flex-col relative h-full items-center w-full bg-[#131314]">
          <div className="w-full max-w-3xl flex-1 overflow-y-auto pt-16 pb-36 px-4 scroll-smooth min-h-0 container-snap">
            <MessageThread />
          </div>
          
          {/* Gemini-Style Floating Bottom Gradient & Dock */}
          <div className="w-full absolute bottom-0 left-0 flex flex-col items-center pb-4 pt-12 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent z-10">
            <ChatBar />
          </div>
        </main>

      </div>
    </ChatContext.Provider>
  );
}
