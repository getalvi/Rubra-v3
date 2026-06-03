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
  isSidebarCollapsed: boolean;
  connectionStatus: 'online' | 'offline' | 'checking';
}

interface ChatActions {
  sendMessage: (text: string, file?: File | null) => void;
  stopStreaming: () => void;
  editMessage: (id: string, newText: string) => void;
  regenerateMessage: (id: string) => void;
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
  setSidebarCollapsed: (collapsed: boolean) => void;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // On desktop, sidebar is open by default
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      const val = localStorage.getItem('rubra_active_session');
      return val || null;
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
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const abortRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('rubra_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save messages:', e);
    }
  }, [messages]);

  // Persist active session
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem('rubra_active_session', activeSessionId);
      } else {
        localStorage.removeItem('rubra_active_session');
      }
    } catch (e) {
      console.warn('Failed to save active session:', e);
    }
  }, [activeSessionId]);

  // Check connection status periodically
  useEffect(() => {
    const checkStatus = async () => {
      const status = await api.getStatus();
      setConnectionStatus(status.status === 'ok' ? 'online' : 'offline');
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (isStreaming) return;

    const trimmedText = text.trim();

    // Create session if none exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      setActiveSessionId(sessionId);
      const newSession: Session = {
        id: sessionId,
        title: generateTitle(trimmedText || 'New chat'),
        timestamp: Date.now(),
      };
      setSessions(prev => {
        const updated = [newSession, ...prev];
        try {
          localStorage.setItem('rubra_sessions', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save sessions:', e);
        }
        return updated;
      });
    } else {
      // Update session title if first message, or add session if missing
      setSessions(prev => {
        const session = prev.find(s => s.id === sessionId);
        if (session && messagesRef.current.length === 0) {
          const updated = prev.map(s =>
            s.id === sessionId ? { ...s, title: generateTitle(trimmedText), timestamp: Date.now() } : s
          );
          try {
            localStorage.setItem('rubra_sessions', JSON.stringify(updated));
          } catch (e) {
            console.warn('Failed to save sessions:', e);
          }
          return updated;
        }
        if (!session) {
          const newSession: Session = {
            id: sessionId as string,
            title: generateTitle(trimmedText || 'New chat'),
            timestamp: Date.now(),
          };
          const updated = [newSession, ...prev];
          try {
            localStorage.setItem('rubra_sessions', JSON.stringify(updated));
          } catch (e) {
            console.warn('Failed to save sessions:', e);
          }
          return updated;
        }
        return prev;
      });
    }

    // Add user message
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text: trimmedText,
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
      api.uploadFile(file, sessionId, trimmedText).then(result => {
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
        addToast('Failed to upload file: ' + (err instanceof Error ? err.message : String(err)), 'error');
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setIsStreaming(false);
      });
      return;
    }

    // Start SSE stream
    abortRef.current = api.sendMessage(
      { message: trimmedText, sessionId: sessionId || undefined, mode },
      {
        onEvent: (event) => {
          switch (event.type) {
            case 'token': {
              if (event.content !== undefined) {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, text: event.content || '', streaming: !event.done }
                      : m
                  )
                );
              }
              break;
            }
            case 'error': {
              const errorMsg = event.message || 'An unknown error occurred';
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, text: `**Error:** ${errorMsg}`, streaming: false }
                    : m
                )
              );
              addToast(errorMsg, 'error');
              setIsStreaming(false);
              break;
            }
            case 'done': {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, streaming: false } : m
                )
              );
              setIsStreaming(false);
              break;
            }
            case 'meta': {
              // Meta info received - could be used for UI indicators
              break;
            }
            default:
              break;
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
          const errorMsg = err instanceof Error ? err.message : String(err);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, text: `**Connection error:** ${errorMsg}\n\nPlease check your internet connection and try again.`, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
          addToast(errorMsg, 'error');
        },
      }
    );
  }, [activeSessionId, mode, addToast, isStreaming]);

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

    const msgIndex = messagesRef.current.findIndex(m => m.id === id);
    if (msgIndex === -1) return;

    const keepMessages = messagesRef.current.slice(0, msgIndex + 1).map(m =>
      m.id === id ? { ...m, text: newText, edited: true, timestamp: Date.now() } : m
    );

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
          switch (event.type) {
            case 'token': {
              if (event.content !== undefined) {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, text: event.content || '', streaming: !event.done }
                      : m
                  )
                );
              }
              break;
            }
            case 'error': {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, text: `**Error:** ${event.message || 'Unknown error'}`, streaming: false }
                    : m
                )
              );
              setIsStreaming(false);
              break;
            }
            case 'done': {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, streaming: false } : m
                )
              );
              setIsStreaming(false);
              break;
            }
            default:
              break;
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
          const errorMsg = err instanceof Error ? err.message : String(err);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, text: `**Error:** ${errorMsg}`, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
          addToast(errorMsg, 'error');
        },
      }
    );
  }, [activeSessionId, mode, addToast]);

  // -- Regenerate Message (for AI messages) ---------------------------------
  const regenerateMessage = useCallback((id: string) => {
    const aiIndex = messagesRef.current.findIndex(m => m.id === id);
    if (aiIndex === -1) return;

    // Find the last user message before this AI message
    let userIndex = -1;
    for (let i = aiIndex - 1; i >= 0; i--) {
      if (messagesRef.current[i].role === 'user') {
        userIndex = i;
        break;
      }
    }
    if (userIndex === -1) return;

    const userMsg = messagesRef.current[userIndex];

    // Keep messages up to and including the user message
    const keepMessages = messagesRef.current.slice(0, userIndex + 1);

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
      { message: userMsg.text, sessionId: activeSessionId || undefined, mode },
      {
        onEvent: (event) => {
          switch (event.type) {
            case 'token': {
              if (event.content !== undefined) {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, text: event.content || '', streaming: !event.done }
                      : m
                  )
                );
              }
              break;
            }
            case 'error': {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, text: `**Error:** ${event.message || 'Unknown error'}`, streaming: false }
                    : m
                )
              );
              setIsStreaming(false);
              break;
            }
            case 'done': {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, streaming: false } : m
                )
              );
              setIsStreaming(false);
              break;
            }
            default:
              break;
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
          const errorMsg = err instanceof Error ? err.message : String(err);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, text: `**Error:** ${errorMsg}`, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
          addToast(errorMsg, 'error');
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

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
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
    setIsSidebarOpen(window.innerWidth >= 1024);
  }, []);

  // -- Delete Session -------------------------------------------------------
  const deleteSession = useCallback(async (id: string) => {
    try {
      await api.deleteSession(id);
      setSessions(prev => {
        const updated = prev.filter(s => s.id !== id);
        try {
          localStorage.setItem('rubra_sessions', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save sessions:', e);
        }
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
      try {
        localStorage.setItem('rubra_sessions', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save sessions:', e);
      }
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
            try {
              localStorage.setItem('rubra_sessions', JSON.stringify(updated));
            } catch (e) {
              console.warn('Failed to save sessions:', e);
            }
            return updated;
          }
          return prev;
        });
      }
    }).catch(() => {
      // Backend might be offline, use cached sessions
      setConnectionStatus('offline');
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
    isSidebarCollapsed,
    connectionStatus,
    sendMessage,
    stopStreaming,
    editMessage,
    regenerateMessage,
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
    setSidebarCollapsed,
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
