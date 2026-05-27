import { createContext, useContext } from 'react';

export const ChatContext = createContext(null);

export default function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    return {
      messages: [],
      sendMessage: () => {},
      isStreaming: false,
      stopStreaming: () => {},
      isSidebarOpen: false,
      toggleSidebar: () => {}
    };
  }
  return context;
}
