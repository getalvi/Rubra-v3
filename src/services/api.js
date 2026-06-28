const BASE = "https://getalvi-rubra-v3.hf.space";

export async function streamChat({ message, sessionId, mode="auto", userId=null, onToken, onStep, onProject, onDone, onError, signal }) {
  let fullText = "";
  try {
    const res = await fetch(`${BASE}/api/chat/stream`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        message,
        session_id: sessionId,
        mode,
        user_id: userId || undefined,   // ← cross-session memory
        stream: true,
        force_hermes: false,
      }),
      signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(()=>"");
      throw new Error(`Backend ${res.status}${txt ? ": "+txt.slice(0,120) : ""}`);
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream:true });
      const lines = buf.split("\n");
      buf = lines.pop();

      for (const line of lines) {
        const t = line.trim();
        if (!t || !t.startsWith("data:")) continue;
        const raw = t.slice(5).trim();
        if (raw === "[DONE]") { onDone?.(fullText); return; }
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "token") {
            if (evt.done) { onDone?.(fullText); return; }
            const chunk = evt.content ?? "";
            if (chunk) { fullText += chunk; onToken?.(chunk, fullText); }
          }
          else if (
            evt.type === "tool_call"       || evt.type === "tool_result" ||
            evt.type === "status"          || evt.type === "meta"          ||
            evt.type === "plan"            || evt.type === "file_failed"   ||
            evt.type === "file_done"       || evt.type === "project_complete"
          ) {
            onStep?.(evt);
            // Fire dedicated callback so App.jsx can open the file panel immediately
            if (evt.type === "project_complete") onProject?.(evt);
          }
          else if (evt.type === "error") throw new Error(evt.message || "Stream error");
        } catch {}
      }
    }
    onDone?.(fullText);
  } catch(err) {
    if (err?.name === "AbortError") {
      onDone?.(fullText, { stopped: true });
      return;
    }
    onError?.(err);
  }
}

export async function healthCheck() {
  try { return (await fetch(`${BASE}/health`)).ok; } catch { return false; }
}
