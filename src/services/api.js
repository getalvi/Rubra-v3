// Backend URL — HuggingFace Space
const BASE = "https://getalvi-rubra-v3.hf.space";

/**
 * Streaming chat via SSE.
 * Calls onToken(text) for each streamed token chunk.
 * Calls onDone(fullText, meta) when complete.
 * Calls onError(err) on failure.
 */
export async function streamChat({ message, sessionId, mode = "auto", onToken, onDone, onError }) {
  const body = {
    message,
    session_id: sessionId,
    mode,
    stream: true,
    force_hermes: false,
  };

  let fullText = "";
  let lastMeta = {};

  try {
    const res = await fetch(`${BASE}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Backend error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const raw = trimmed.slice(5).trim();
        if (raw === "[DONE]") {
          onDone?.(fullText, lastMeta);
          return;
        }

        try {
          const evt = JSON.parse(raw);

          if (evt.type === "meta" || evt.type === "status") {
            lastMeta = { ...lastMeta, ...evt };
            continue;
          }

          if (evt.type === "token") {
            const chunk = evt.content ?? "";
            if (evt.done) {
              onDone?.(fullText, { ...lastMeta, ...evt });
              return;
            }
            if (chunk) {
              fullText += chunk;
              onToken?.(chunk, fullText);
            }
          }

          if (evt.type === "error") {
            throw new Error(evt.message || "Stream error");
          }
        } catch (parseErr) {
          // Skip malformed lines
        }
      }
    }

    // EOF without [DONE]
    onDone?.(fullText, lastMeta);
  } catch (err) {
    onError?.(err);
  }
}

/**
 * Non-streaming chat (fallback)
 */
export async function sendChat({ message, sessionId, mode = "auto" }) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId, mode }),
  });
  if (!res.ok) throw new Error(`Backend ${res.status}`);
  return res.json();
}

/**
 * Load session history
 */
export async function loadSession(sessionId) {
  try {
    const res = await fetch(`${BASE}/api/sessions/${sessionId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * List all sessions
 */
export async function listSessions() {
  try {
    const res = await fetch(`${BASE}/api/sessions`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId) {
  await fetch(`${BASE}/api/sessions/${sessionId}`, { method: "DELETE" });
}

/**
 * Health check
 */
export async function healthCheck() {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
