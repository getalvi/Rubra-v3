import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as api from '@/api';

// -- Types ------------------------------------------------------------------
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  streaming?: boolean;
  edited?: boolean;
}

export interface Session {
  id: string;
  title: string;
  timestamp: number;
}

export type AIMode = 'auto' | 'fast' | 'hermes';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  isSidebarOpen: boolean;
  activeSessionId: string | null;
  sessions: Session[];
  mode: AIMode;
  isLoading: boolean;
  toasts: Toast[];
}

interface ChatActions {
  sendMessage: (text: string, file?: File | null) => void;
  stopStreaming: () => void;
  editMessage: (id: string, newText: string) => void;
  deleteMessage: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  loadSession: (id: string) => Promise<void>;
  createSession: () => void;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => void;
  setMode: (mode: AIMode) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ChatContext = createContext<(ChatState & ChatActions) | null>(null);

// -- Helper: Generate session title from first message ----------------------
function generateTitle(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 30) return trimmed;
  return trimmed.substring(0, 30) + '...';
}

// -- Provider ---------------------------------------------------------------
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = localStorage.getItem('rubra_messages');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('rubra_active_session');
    } catch {
      return null;
    }
  });
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const cached = localStorage.getItem('rubra_sessions');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [mode, setModeState] = useState<AIMode>(() => {
    return (localStorage.getItem('rubra_mode') as AIMode) || 'auto';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const abortRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Persist messages and active session
  useEffect(() => {
    localStorage.setItem('rubra_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('rubra_active_session', activeSessionId || '');
  }, [activeSessionId]);

  // -- Toast helpers --------------------------------------------------------
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // -- Send Message ---------------------------------------------------------
  const sendMessage = useCallback((text: string, file?: File | null) => {
    if (!text.trim() && !file) return;

    // Create session if none exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      setActiveSessionId(sessionId);
      const newSession: Session = {
        id: sessionId,
        title: generateTitle(text || 'New chat'),
        timestamp: Date.now(),
      };
      setSessions(prev => {
        const updated = [newSession, ...prev];
        localStorage.setItem('rubra_sessions', JSON.stringify(updated));
        return updated;
      });
    } else {
      // Update session title if first message
      setSessions(prev => {
        const session = prev.find(s => s.id === sessionId);
        if (session && messagesRef.current.length === 0) {
          const updated = prev.map(s =>
            s.id === sessionId ? { ...s, title: generateTitle(text), timestamp: Date.now() } : s
          );
          localStorage.setItem('rubra_sessions', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }

    // Add user message
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    // Add assistant placeholder
    const assistantId = uuidv4();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Handle file upload if present
    if (file) {
      api.uploadFile(file, sessionId, text).then(result => {
        const fileMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          text: `**File uploaded:** ${result.filename}\n\n${result.text}`,
          timestamp: Date.now(),
        };
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== assistantId);
          return [...filtered, fileMsg];
        });
        setIsStreaming(false);
      }).catch(err => {
        addToast('Failed to upload file: ' + err.message, 'error');
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setIsStreaming(false);
      });
      return;
    }

    // Start SSE stream
    abortRef.current = api.sendMessage(
      { message: text, sessionId: sessionId || undefined, mode },
      {
        onEvent: (event) => {
          if (event.type === 'token' && event.content !== undefined) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, text: event.content || '', streaming: !event.done }
                  : m
              )
            );
          } else if (event.type === 'error') {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, text: `Error: ${event.message}`, streaming: false }
                  : m
              )
            );
            addToast(event.message || 'An error occurred', 'error');
          }
        },
        onDone: () => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, streaming: false } : m
            )
          );
          setIsStreaming(false);
        },
        onError: (err) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, text: `Connection error: ${err.message}`, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
          addToast(err.message, 'error');
        },
      }
    );
  }, [activeSessionId, mode, addToast]);

  // -- Stop Streaming -------------------------------------------------------
  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setMessages(prev =>
      prev.map(m =>
        m.streaming ? { ...m, streaming: false } : m
      )
    );
  }, []);

  // -- Edit Message ---------------------------------------------------------
  const editMessage = useCallback((id: string, newText: string) => {
    if (!newText.trim()) return;

    // Find the message index
    const msgIndex = messagesRef.current.findIndex(m => m.id === id);
    if (msgIndex === -1) return;

    // Keep messages up to and including the edited message
    const keepMessages = messagesRef.current.slice(0, msgIndex + 1).map(m =>
      m.id === id ? { ...m, text: newText, edited: true, timestamp: Date.now() } : m
    );

    // Add new assistant placeholder
    const assistantId = uuidv4();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages([...keepMessages, assistantMsg]);
    setIsStreaming(true);

    abortRef.current = api.sendMessage(
      { message: newText, sessionId: activeSessionId || undefined, mode },
      {
        onEvent: (event) => {
          if (event.type === 'token' && event.content !== undefined) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, text: event.content || '', streaming: !event.done }
                  : m
              )
            );
          } else if (event.type === 'error') {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, text: `Error: ${event.message}`, streaming: false }
                  : m
              )
            );
          }
        },
        onDone: () => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, streaming: false } : m
            )
          );
          setIsStreaming(false);
        },
        onError: (err) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, text: `Error: ${err.message}`, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
          addToast(err.message, 'error');
        },
      }
    );
  }, [activeSessionId, mode, addToast]);

  // -- Delete Message -------------------------------------------------------
  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  // -- Sidebar Toggle -------------------------------------------------------
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  // -- Load Session ---------------------------------------------------------
  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const session = await api.getSession(id);
      if (session && session.history) {
        const loadedMessages: Message[] = session.history.map((h, i) => ({
          id: `session-${i}`,
          role: h.role as 'user' | 'assistant',
          text: h.content,
          timestamp: Date.now() - (session.history!.length - i) * 1000,
        }));
        setMessages(loadedMessages);
        setActiveSessionId(id);
      } else {
        setMessages([]);
        setActiveSessionId(id);
      }
    } catch {
      addToast('Failed to load session', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // -- Create Session -------------------------------------------------------
  const createSession = useCallback(() => {
    const newId = uuidv4();
    setActiveSessionId(newId);
    setMessages([]);
    setIsSidebarOpen(false);
  }, []);

  // -- Delete Session -------------------------------------------------------
  const deleteSession = useCallback(async (id: string) => {
    try {
      await api.deleteSession(id);
      setSessions(prev => {
        const updated = prev.filter(s => s.id !== id);
        localStorage.setItem('rubra_sessions', JSON.stringify(updated));
        return updated;
      });
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
      }
      addToast('Session deleted', 'success');
    } catch {
      addToast('Failed to delete session', 'error');
    }
  }, [activeSessionId, addToast]);

  // -- Rename Session -------------------------------------------------------
  const renameSession = useCallback((id: string, title: string) => {
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, title } : s
      );
      localStorage.setItem('rubra_sessions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // -- Set Mode -------------------------------------------------------------
  const setMode = useCallback((newMode: AIMode) => {
    setModeState(newMode);
    localStorage.setItem('rubra_mode', newMode);
  }, []);

  // -- Fetch sessions on mount ----------------------------------------------
  React.useEffect(() => {
    api.getSessions().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const formatted: Session[] = data.map(s => ({
          id: s.id || uuidv4(),
          title: s.title || 'Untitled chat',
          timestamp: s.created_at ? new Date(s.created_at).getTime() : Date.now(),
        }));
        setSessions(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newSessions = formatted.filter(s => !existingIds.has(s.id));
          if (newSessions.length > 0) {
            const updated = [...prev, ...newSessions].sort((a, b) => b.timestamp - a.timestamp);
            localStorage.setItem('rubra_sessions', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
    }).catch(() => {
      // Backend might be offline, use cached sessions
    });
  }, []);

  const value: ChatState & ChatActions = {
    messages,
    isStreaming,
    isSidebarOpen,
    activeSessionId,
    sessions,
    mode,
    isLoading,
    toasts,
    sendMessage,
    stopStreaming,
    editMessage,
    deleteMessage,
    toggleSidebar,
    setSidebarOpen,
    loadSession,
    createSession,
    deleteSession,
    renameSession,
    setMode,
    addToast,
    removeToast,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// -- Hook -------------------------------------------------------------------
export default function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
