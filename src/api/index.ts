/**
 * RUBRA v3 — API Layer
 * All backend calls to Hugging Face Space
 */

const BASE = 'https://getalvi-rubra-v3.hf.space';

// ── Types ───────────────────────────────────────────────────────────────────
export interface SSEEvent {
  type: 'token' | 'meta' | 'status' | 'error' | 'tool_call' | 'tool_result';
  content?: string;
  text?: string;
  intent?: string;
  mode?: string;
  agents_used?: string[];
  done?: boolean;
  message?: string;
  percent?: number;
}

export interface ChatCallbacks {
  onEvent?: (event: SSEEvent) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export interface Session {
  id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  history?: Array<{ role: string; content: string }>;
}

// ── SSE Normalizer ──────────────────────────────────────────────────────────
function normalize(raw: Record<string, unknown>): SSEEvent {
  const type = raw.type as string;
  if (type === 'token' && raw.content) return raw as unknown as SSEEvent;
  if (type === 'tool_call') return raw as unknown as SSEEvent;
  if (type === 'tool_result') return raw as unknown as SSEEvent;
  if (type === 'meta') return raw as unknown as SSEEvent;
  if (type === 'error') return raw as unknown as SSEEvent;

  if (type === 'status')
    return { type: 'status', text: (raw.text || raw.message || raw.detail || '') as string, percent: (raw.percent || 0) as number };

  if (raw.progress)
    return { type: 'status', text: (raw.progress as Record<string, string>).detail || (raw.progress as Record<string, string>).step || '', percent: (raw.progress as Record<string, number>).percent || 0 };

  if (typeof raw.token === 'string')
    return { type: 'token', content: raw.token };

  const delta = (raw.choices as Array<{ delta?: { content?: string } }>)?.[0]?.delta?.content;
  if (typeof delta === 'string' && delta)
    return { type: 'token', content: delta };

  if (typeof raw.content === 'string' && raw.content)
    return { type: 'token', content: raw.content };

  if (typeof raw.text === 'string' && raw.text && !type)
    return { type: 'token', content: raw.text };

  return raw as unknown as SSEEvent;
}

// ── Core SSE Streamer ──────────────────────────────────────────────────────
export function streamSSE(
  url: string,
  body: Record<string, unknown>,
  { onEvent, onDone, onError }: ChatCallbacks = {}
): () => void {
  const ctrl = new AbortController();
  let doneOnce = false;

  const done = () => {
    if (doneOnce) return;
    doneOnce = true;
    onDone?.();
  };

  const run = async () => {
    try {
      const res = await fetch(`${BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      let buf = '';
      let accumContent = '';
      let hasContent = false;

      for (;;) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) { done(); break; }

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';

        for (const line of lines) {
          const t = line.trim();
          if (!t) continue;

          if (t === 'data: [DONE]') { done(); return; }

          if (t.startsWith('data: ')) {
            const raw = t.slice(6);

            if (raw === '[DONE]') { done(); return; }

            let parsed: Record<string, unknown>;
            try {
              parsed = JSON.parse(raw);
            } catch {
              if (raw) {
                accumContent += raw;
                hasContent = true;
                onEvent?.({ type: 'token', content: accumContent });
              }
              continue;
            }

            const evt = normalize(parsed);

            if (evt.type === 'token') {
              accumContent += evt.content || '';
              hasContent = true;
              onEvent?.({ type: 'token', content: accumContent });
            } else if (evt.type === 'status' && !hasContent) {
              onEvent?.(evt);
            } else if (evt.type !== 'status') {
              onEvent?.(evt);
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      onError?.(e instanceof Error ? e : new Error(String(e)));
    }
  };

  run();
  return () => ctrl.abort();
}

// ── Chat Message ────────────────────────────────────────────────────────────
export function sendMessage(
  { message, sessionId, mode }: { message: string; sessionId?: string; mode?: string },
  callbacks: ChatCallbacks
): () => void {
  return streamSSE(
    '/api/chat/stream',
    { message, session_id: sessionId || undefined, mode: mode || 'auto', stream: true },
    callbacks
  );
}

// ── File Upload ─────────────────────────────────────────────────────────────
export async function uploadFile(
  file: File,
  sessionId?: string,
  question?: string
): Promise<{ type: string; filename: string; text: string }> {
  const form = new FormData();
  form.append('file', file);
  if (sessionId) form.append('session_id', sessionId);
  if (question) form.append('question', question);

  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
  return res.json();
}

// ── Session Management ──────────────────────────────────────────────────────
export async function getSessions(): Promise<Session[]> {
  const res = await fetch(`${BASE}/api/sessions`);
  if (!res.ok) return [];
  return res.json();
}

export async function getSession(id: string): Promise<Session | null> {
  const res = await fetch(`${BASE}/api/sessions/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function deleteSession(id: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/sessions/${id}`, { method: 'DELETE' });
  return res.ok;
}

// ── Health Check ────────────────────────────────────────────────────────────
export async function getStatus(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.json();
  } catch {
    return { status: 'offline' };
  }
}
