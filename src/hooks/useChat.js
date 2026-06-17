import { useState, useCallback, useRef, useEffect } from "react";
import { streamChat } from "../services/api";
import { uid } from "../utils/parse";

const LS_SESSIONS_KEY = "rubra_sessions";
const LS_ACTIVE_KEY   = "rubra_active_session";

function makeTitle(text) {
  return text.slice(0, 42).trim() + (text.length > 42 ? "…" : "");
}

/* ── Load persisted sessions from localStorage (survives browser refresh) ── */
function loadPersistedSessions() {
  try {
    const raw = localStorage.getItem(LS_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: strip any mid-stream flags left over from a previous tab close
    return parsed.map(s => ({
      ...s,
      messages: (s.messages || []).map(m => ({ ...m, streaming: false })),
    }));
  } catch {
    return [];
  }
}

function loadPersistedActiveId() {
  try { return localStorage.getItem(LS_ACTIVE_KEY) || null; } catch { return null; }
}

export function useChat() {
  const [sessions,    setSessions]    = useState(loadPersistedSessions);
  const [activeId,    setActiveId]    = useState(loadPersistedActiveId);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  /* ── Persist sessions to localStorage whenever they change ── */
  useEffect(() => {
    try {
      localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      // Quota exceeded — drop the oldest sessions and retry once
      try {
        const trimmed = [...sessions].sort((a, b) => b.ts - a.ts).slice(0, 20);
        localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(trimmed));
      } catch {}
    }
  }, [sessions]);

  /* ── Persist the active session id whenever it changes ── */
  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(LS_ACTIVE_KEY, activeId);
      else localStorage.removeItem(LS_ACTIVE_KEY);
    } catch {}
  }, [activeId]);

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
    const asstMsg  = { id:asstMid, role:"assistant", content:"",   ts:Date.now(), streaming:true, steps:[] };

    setSessions(prev => prev.map(s =>
      s.id === sid
        ? { ...s, messages:[...s.messages, userMsg, asstMsg],
            messageCount:(s.messageCount||0)+1, ts:Date.now() }
        : s
    ));
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    await streamChat({
      message:text, sessionId:sid, mode,
      signal: controller.signal,
      onToken: (_chunk, full) => {
        setSessions(prev => prev.map(s =>
          s.id === sid
            ? { ...s, messages: s.messages.map(m => m.id===asstMid ? {...m, content:full} : m) }
            : s
        ));
      },
      onStep: (evt) => {
        setSessions(prev => prev.map(s =>
          s.id === sid
            ? { ...s, messages: s.messages.map(m => {
                if (m.id !== asstMid) return m;
                const steps = [...(m.steps || [])];

                // Orchestrator plan: a structured sub-task breakdown, rendered as a group
                if (evt.type === "plan") {
                  steps.push({
                    type: "plan",
                    label: `Plan: ${evt.sub_tasks?.length || 0} sub-tasks`,
                    subTasks: evt.sub_tasks || [],
                    done: true,
                  });
                  return { ...m, steps };
                }

                const last = steps[steps.length - 1];
                const label = evt.text || evt.name || evt.agent || evt.intent || "Working…";
                // collapse consecutive duplicates of the same step type+label
                if (!last || last.type !== evt.type || last.label !== label) {
                  steps.push({ type: evt.type, label, done: evt.type === "tool_result" });
                } else if (evt.type === "tool_result") {
                  last.done = true;
                }
                return { ...m, steps };
              })}
            : s
        ));
      },
      onDone: (full, meta) => {
        setSessions(prev => prev.map(s =>
          s.id === sid
            ? { ...s, messages: s.messages.map(m =>
                m.id===asstMid ? {...m, content:full||m.content, streaming:false, stopped: !!meta?.stopped} : m
              )}
            : s
        ));
        setIsStreaming(false);
        abortRef.current = null;
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
        abortRef.current = null;
      },
    });
  }, [isStreaming, ensureSession]);

  /* ── Stop the current generation ── */
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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

  /* ── Rename a session's title manually ── */
  const renameSession = useCallback((id, newTitle) => {
    const title = newTitle.trim();
    if (!title) return;
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  }, []);

  return {
    sessions, activeId, messages, isStreaming,
    sendMessage, newChat, selectSession, deleteSession,
    editMessage, retryMessage, renameSession, stopGeneration,
  };
}
