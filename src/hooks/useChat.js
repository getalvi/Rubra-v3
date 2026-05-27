import React, { createContext, useContext, useState, useRef } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
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
      {children}
    </ChatContext.Provider>
  );
}

export default function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    return { messages: [], sendMessage: () => {}, isStreaming: false, stopStreaming: () => {}, isSidebarOpen: false, toggleSidebar: () => {} };
  }
  return context;
}
