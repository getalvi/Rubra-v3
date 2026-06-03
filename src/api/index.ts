/**
 * RUBRA v3 - API Layer
 * All backend calls to Hugging Face Space
 */

const BASE = 'https://getalvi-rubra-v3.hf.space';

// -- Types ------------------------------------------------------------------
export interface SSEEvent {
  type: 'token' | 'meta' | 'status' | 'error' | 'tool_call' | 'tool_result' | 'done';
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

// -- Helpers ----------------------------------------------------------------

/** Safely extract string content from any value */
function safeString(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

// -- SSE Normalizer ---------------------------------------------------------
function normalize(raw: Record<string, unknown>): SSEEvent {
  const type = (raw.type as string) || '';

  // Token events - most common
  if (type === 'token') {
    return {
      type: 'token',
      content: safeString(raw.content ?? raw.text ?? raw.token),
      done: !!raw.done,
    };
  }

  // Tool events
  if (type === 'tool_call') {
    return {
      type: 'tool_call',
      content: safeString(raw.content ?? raw.text),
      ...raw,
    } as SSEEvent;
  }

  if (type === 'tool_result') {
    return {
      type: 'tool_result',
      content: safeString(raw.content ?? raw.text),
      ...raw,
    } as SSEEvent;
  }

  // Meta event
  if (type === 'meta') {
    return {
      type: 'meta',
      intent: safeString(raw.intent),
      mode: safeString(raw.mode),
      agents_used: Array.isArray(raw.agents_used) ? raw.agents_used.map(String) : [],
    };
  }

  // Error event
  if (type === 'error') {
    return {
      type: 'error',
      message: safeString(raw.message ?? raw.error ?? raw.detail ?? 'Unknown error'),
      done: true,
    };
  }

  // Status event
  if (type === 'status') {
    return {
      type: 'status',
      text: safeString(raw.text ?? raw.message ?? raw.detail ?? ''),
      percent: Number(raw.percent ?? 0),
    };
  }

  // Handle progress wrapper
  if (raw.progress && typeof raw.progress === 'object') {
    const progress = raw.progress as Record<string, unknown>;
    return {
      type: 'status',
      text: safeString(progress.detail ?? progress.step ?? ''),
      percent: Number(progress.percent ?? 0),
    };
  }

  // OpenAI-style streaming format: { choices: [{ delta: { content: '...' } }] }
  if (raw.choices && Array.isArray(raw.choices)) {
    const choices = raw.choices as Array<{ delta?: { content?: string }; message?: { content?: string } }>;
    const content = choices[0]?.delta?.content ?? choices[0]?.message?.content ?? '';
    if (content) {
      return { type: 'token', content: safeString(content), done: false };
    }
  }

  // Raw token field (string)
  if (typeof raw.token === 'string' && raw.token) {
    return { type: 'token', content: raw.token, done: false };
  }

  // Raw content field (string)
  if (typeof raw.content === 'string' && raw.content) {
    return { type: 'token', content: raw.content, done: false };
  }

  // Raw text field (string, no type)
  if (typeof raw.text === 'string' && raw.text && !type) {
    return { type: 'token', content: raw.text, done: false };
  }

  // Handle "done" signal
  if (raw.done === true) {
    return {
      type: 'done',
      intent: safeString(raw.intent),
      mode: safeString(raw.mode),
      agents_used: Array.isArray(raw.agents_used) ? raw.agents_used.map(String) : [],
      done: true,
    };
  }

  // Fallback: try to extract any useful content
  const fallbackContent = safeString(
    raw.content ?? raw.text ?? raw.token ?? raw.message ?? raw.response ?? raw.result ?? ''
  );
  if (fallbackContent) {
    return { type: 'token', content: fallbackContent, done: false };
  }

  // Unknown format - return as error
  return {
    type: 'error',
    message: `Unrecognized SSE format: ${safeString(raw).slice(0, 200)}`,
    done: true,
  };
}

// -- Core SSE Streamer -----------------------------------------------------
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

      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
      }

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
              // If JSON parse fails, treat raw text as a token
              if (raw) {
                accumContent += raw;
                hasContent = true;
                onEvent?.({ type: 'token', content: accumContent });
              }
              continue;
            }

            const evt = normalize(parsed);

            switch (evt.type) {
              case 'token': {
                const tokenContent = evt.content || '';
                accumContent += tokenContent;
                hasContent = true;
                onEvent?.({ type: 'token', content: accumContent });
                break;
              }
              case 'done': {
                onEvent?.(evt);
                done();
                return;
              }
              case 'error': {
                onEvent?.(evt);
                done();
                return;
              }
              case 'status': {
                // Only show status before content starts
                if (!hasContent) {
                  onEvent?.(evt);
                }
                break;
              }
              default: {
                onEvent?.(evt);
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      const errMsg = e instanceof Error ? e.message : String(e);
      onError?.(new Error(errMsg));
      done();
    }
  };

  run();
  return () => ctrl.abort();
}

// -- Chat Message -----------------------------------------------------------
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

// -- File Upload ------------------------------------------------------------
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
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Upload failed');
    throw new Error(`Upload failed: HTTP ${res.status} - ${errorText}`);
  }
  return res.json();
}

// -- Session Management -----------------------------------------------------
export async function getSessions(): Promise<Session[]> {
  try {
    const res = await fetch(`${BASE}/api/sessions`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getSession(id: string): Promise<Session | null> {
  try {
    const res = await fetch(`${BASE}/api/sessions/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function deleteSession(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

// -- Health Check -----------------------------------------------------------
export async function getStatus(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { status: 'error' };
    return res.json();
  } catch {
    return { status: 'offline' };
  }
}
