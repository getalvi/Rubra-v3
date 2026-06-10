import { useState, useCallback } from "react";
import { streamChat } from "../services/api";
import { uid } from "../utils/parse";

function makeTitle(text) {
  return text.slice(0, 42).trim() + (text.length > 42 ? "…" : "");
}

export function useChat() {
  const [sessions,    setSessions]    = useState([]);
  const [activeId,    setActiveId]    = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const activeSession = sessions.find(s => s.id === activeId) || null;
  const messages      = activeSession?.messages || [];

  /* ── Ensure a session exists, return its id ── */
  const ensureSession = useCallback((firstMsg) => {
    if (activeId) return activeId;
    const id = uid();
    setSessions(prev => [{
      id, title: makeTitle(firstMsg),
      ts: Date.now(), messageCount: 0, messages: [],
    }, ...prev]);
    setActiveId(id);
    return id;
  }, [activeId]);

  /* ── Send (stream) ── */
  const sendMessage = useCallback(async (text, mode = "auto") => {
    if (!text.trim() || isStreaming) return;
    const sid      = ensureSession(text);
    const userMid  = uid();
    const asstMid  = uid();
    const userMsg  = { id:userMid, role:"user",      content:text, ts:Date.now() };
    const asstMsg  = { id:asstMid, role:"assistant", content:"",   ts:Date.now(), streaming:true };

    setSessions(prev => prev.map(s =>
      s.id === sid
        ? { ...s, messages:[...s.messages, userMsg, asstMsg],
            messageCount:(s.messageCount||0)+1, ts:Date.now() }
        : s
    ));
    setIsStreaming(true);

    await streamChat({
      message:text, sessionId:sid, mode,
      onToken: (_chunk, full) => {
        setSessions(prev => prev.map(s =>
          s.id === sid
            ? { ...s, messages: s.messages.map(m => m.id===asstMid ? {...m, content:full} : m) }
            : s
        ));
      },
      onDone: (full) => {
        setSessions(prev => prev.map(s =>
          s.id === sid
            ? { ...s, messages: s.messages.map(m =>
                m.id===asstMid ? {...m, content:full||m.content, streaming:false} : m
              )}
            : s
        ));
        setIsStreaming(false);
      },
      onError: (err) => {
        setSessions(prev => prev.map(s =>
          s.id === sid
            ? { ...s, messages: s.messages.map(m =>
                m.id===asstMid ? {...m, content:`⚠️ ${err.message}`, streaming:false, error:true} : m
              )}
            : s
        ));
        setIsStreaming(false);
      },
    });
  }, [isStreaming, ensureSession]);

  /* ── Edit user message → trim + resend ── */
  const editMessage = useCallback((msgId, newContent) => {
    if (!activeId || isStreaming) return;
    setSessions(prev => prev.map(s => {
      if (s.id !== activeId) return s;
      const idx = s.messages.findIndex(m => m.id === msgId);
      return idx === -1 ? s : { ...s, messages: s.messages.slice(0, idx) };
    }));
    sendMessage(newContent);
  }, [activeId, isStreaming, sendMessage]);

  /* ── Retry: find preceding user msg, resend ── */
  const retryMessage = useCallback((asstMsg) => {
    if (!activeId || isStreaming) return;
    const msgs = sessions.find(s => s.id === activeId)?.messages || [];
    const idx  = msgs.findIndex(m => m.id === asstMsg.id);
    const user = idx > 0 ? msgs[idx - 1] : null;
    if (!user || user.role !== "user") return;
    setSessions(prev => prev.map(s =>
      s.id === activeId ? { ...s, messages: s.messages.slice(0, idx-1) } : s
    ));
    sendMessage(user.content);
  }, [activeId, isStreaming, sessions, sendMessage]);

  const newChat        = useCallback(() => setActiveId(null), []);
  const selectSession  = useCallback(id => setActiveId(id), []);
  const deleteSession  = useCallback(id => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  return {
    sessions, activeId, messages, isStreaming,
    sendMessage, newChat, selectSession, deleteSession,
    editMessage, retryMessage,
  };
}
