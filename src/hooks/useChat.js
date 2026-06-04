import { useState, useCallback, useRef } from "react";
import { streamChat } from "../services/api";

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function makeTitle(text) { return text.slice(0, 40).trim() + (text.length > 40 ? "..." : ""); }

export function useChat() {
  const [sessions, setSessions] = useState([]);          // [{id,title,ts,messages:[]}]
  const [activeId, setActiveId]   = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Derived: current session messages
  const activeSession = sessions.find(s => s.id === activeId) || null;
  const messages = activeSession?.messages || [];

  // Ensure a session exists, return its id
  const ensureSession = useCallback((firstMsg) => {
    if (activeId) return activeId;
    const id = uid();
    const session = { id, title: makeTitle(firstMsg), ts: Date.now(), messages: [] };
    setSessions(prev => [session, ...prev]);
    setActiveId(id);
    return id;
  }, [activeId]);

  const sendMessage = useCallback(async (text, mode = "auto") => {
    if (!text.trim() || isStreaming) return;

    const sid = ensureSession(text);
    const userMsgId = uid();
    const asstMsgId = uid();

    const userMsg   = { id: userMsgId, role: "user",      content: text, ts: Date.now() };
    const asstMsg   = { id: asstMsgId, role: "assistant", content: "", ts: Date.now(), streaming: true };

    setSessions(prev => prev.map(s =>
      s.id === sid ? { ...s, messages: [...s.messages, userMsg, asstMsg], ts: Date.now() } : s
    ));
    setIsStreaming(true);

    await streamChat({
      message: text,
      sessionId: sid,
      mode,
      onToken: (_chunk, fullText) => {
        setSessions(prev => prev.map(s =>
          s.id === sid ? { ...s, messages: s.messages.map(m => m.id === asstMsgId ? { ...m, content: fullText } : m) } : s
        ));
      },
      onDone: (fullText) => {
        setSessions(prev => prev.map(s =>
          s.id === sid ? { ...s, messages: s.messages.map(m => m.id === asstMsgId ? { ...m, content: fullText || m.content, streaming: false } : m) } : s
        ));
        setIsStreaming(false);
      },
      onError: (err) => {
        setSessions(prev => prev.map(s =>
          s.id === sid ? { ...s, messages: s.messages.map(m => m.id === asstMsgId ? { ...m, content: `⚠️ ${err.message}`, streaming: false, error: true } : m) } : s
        ));
        setIsStreaming(false);
      },
    });
  }, [isStreaming, ensureSession]);

  const newChat = useCallback(() => {
    setActiveId(null);
  }, []);

  const selectSession = useCallback((id) => {
    setActiveId(id);
  }, []);

  const deleteSession = useCallback((id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const editMessage = useCallback((msgId, newContent) => {
    if (!activeId) return;
    // Truncate messages after the edited one and resend
    setSessions(prev => prev.map(s => {
      if (s.id !== activeId) return s;
      const idx = s.messages.findIndex(m => m.id === msgId);
      if (idx === -1) return s;
      const trimmed = s.messages.slice(0, idx);
      return { ...s, messages: trimmed };
    }));
    sendMessage(newContent);
  }, [activeId, sendMessage]);

  const retryMessage = useCallback((msg) => {
    if (!activeId) return;
    // Find the user message before this assistant message, resend it
    const msgs = sessions.find(s => s.id === activeId)?.messages || [];
    const idx = msgs.findIndex(m => m.id === msg.id);
    const userMsg = idx > 0 ? msgs[idx - 1] : null;
    if (!userMsg || userMsg.role !== "user") return;
    setSessions(prev => prev.map(s =>
      s.id === activeId ? { ...s, messages: s.messages.slice(0, idx - 1) } : s
    ));
    sendMessage(userMsg.content);
  }, [activeId, sessions, sendMessage]);

  return {
    sessions,
    activeId,
    messages,
    isStreaming,
    sendMessage,
    newChat,
    selectSession,
    deleteSession,
    editMessage,
    retryMessage,
  };
}
