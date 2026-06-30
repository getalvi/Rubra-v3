import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const BASE = "https://getalvi-rubra-v3.hf.space";

/* ── Icons ── */
const I = ({ d, s=16, sw=1.8 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const BackI    = () => <I d="M19 12H5M12 19l-7-7 7-7"/>;
const TrashI   = () => <I d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" s={14}/>;
const PlusI    = () => <I d="M12 5v14M5 12h14" s={14}/>;
const SendI    = () => <I d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" s={15}/>;
const StopI    = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>;
const FlaskI   = () => <I d="M9 3h6M8 3v6l-4 9a1 1 0 0 0 .9 1.5h14.2A1 1 0 0 0 20 18l-4-9V3" s={16}/>;
const SpinI    = () => <span className="inline-block w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor:"#1e2a1e", borderTopColor:"#4ade80", animation:"pgSpin .6s linear infinite" }}/>;

const PRESETS = ["openrouter","groq","cerebras","gemini","openai","custom"];
const PRESET_URLS = {
  openrouter: "https://openrouter.ai/api/v1",
  groq:       "https://api.groq.com/openai/v1",
  cerebras:   "https://api.cerebras.ai/v1",
  gemini:     "https://generativelanguage.googleapis.com/v1beta/openai",
  openai:     "https://api.openai.com/v1",
  custom:     "",
};

/* ── API helpers ── */
async function apiGet(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}
async function apiPost(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(()=>"");
    throw new Error(t || `${r.status}`);
  }
  return r.json();
}
async function apiDelete(path) {
  const r = await fetch(`${BASE}${path}`, { method:"DELETE" });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

/* ── Streaming playground chat ── */
async function playgroundStream({ body, onToken, onDone, onError, signal }) {
  try {
    const r = await fetch(`${BASE}/api/playground/chat`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body), signal,
    });
    if (!r.ok) {
      const t = await r.text().catch(()=>"");
      onError?.(t || `Error ${r.status}`); return;
    }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream:true });
      const lines = buf.split("\n"); buf = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const raw = t.slice(5).trim();
        if (raw === "[DONE]") { onDone?.(); return; }
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "token") {
            if (evt.done) { onDone?.(); return; }
            if (evt.content) onToken?.(evt.content);
          }
          if (evt.type === "error") { onError?.(evt.message); return; }
        } catch {}
      }
    }
    onDone?.();
  } catch(err) {
    if (err?.name === "AbortError") { onDone?.(); return; }
    onError?.(err.message);
  }
}

/* ── Left panel: Config form ── */
function ConfigForm({ userId, activeConfig, onActivate }) {
  const [preset,  setPreset]  = useState("openrouter");
  const [baseUrl, setBaseUrl] = useState("");
  const [model,   setModel]   = useState("");
  const [apiKey,  setApiKey]  = useState("");
  const [label,   setLabel]   = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const handlePreset = (p) => {
    setPreset(p);
    if (p !== "custom") setBaseUrl(PRESET_URLS[p] || "");
  };

  const useNow = () => {
    setErr("");
    if (!model || !apiKey) { setErr("Model and API key required"); return; }
    onActivate({
      id: null,
      label: label || `${preset} / ${model}`,
      preset,
      base_url: preset === "custom" ? baseUrl : PRESET_URLS[preset],
      model,
      api_key: apiKey,
    });
  };

  const save = async () => {
    setErr(""); setSaving(true);
    try {
      if (!model || !apiKey) { setErr("Model and API key required"); return; }
      const cfg = await apiPost("/api/playground/configs", {
        user_id: userId, label: label || `${preset} / ${model}`,
        preset, base_url: preset === "custom" ? baseUrl : null,
        model, api_key: apiKey,
      });
      onActivate({ ...cfg, api_key: apiKey });
      setApiKey(""); setModel(""); setLabel("");
    } catch(e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="mt-4">
      <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color:"#3a3a3a" }}>Quick test / Save</p>

      {/* Label */}
      <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label (optional)"
        className="w-full px-3 py-1.5 rounded-lg text-xs mb-2 outline-none"
        style={{ background:"#111", border:"1px solid #222", color:"#e0e0e0" }}/>

      {/* Provider preset */}
      <select value={preset} onChange={e=>handlePreset(e.target.value)}
        className="w-full px-3 py-1.5 rounded-lg text-xs mb-2 outline-none"
        style={{ background:"#111", border:"1px solid #222", color:"#a0a0a0" }}>
        {PRESETS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
      </select>

      {/* Custom base URL */}
      {preset === "custom" && (
        <input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="https://your-endpoint/v1"
          className="w-full px-3 py-1.5 rounded-lg text-xs mb-2 outline-none"
          style={{ background:"#111", border:"1px solid #222", color:"#e0e0e0" }}/>
      )}

      {/* Model */}
      <input value={model} onChange={e=>setModel(e.target.value)} placeholder="Model (e.g. gpt-4o)"
        className="w-full px-3 py-1.5 rounded-lg text-xs mb-2 outline-none"
        style={{ background:"#111", border:"1px solid #222", color:"#e0e0e0" }}/>

      {/* API Key */}
      <div className="relative mb-2">
        <input
          type={showKey ? "text" : "password"}
          value={apiKey} onChange={e=>setApiKey(e.target.value)}
          placeholder="API Key (sk-...)"
          className="w-full px-3 py-1.5 pr-8 rounded-lg text-xs outline-none"
          style={{ background:"#111", border:"1px solid #222", color:"#e0e0e0" }}/>
        <button onClick={()=>setShowKey(v=>!v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
          style={{ color:"#555" }}>{showKey?"Hide":"Show"}</button>
      </div>

      {err && <p className="text-[11px] mb-2 px-2 py-1 rounded" style={{ color:"#f87171", background:"#1a0808" }}>{err}</p>}

      <div className="flex gap-2">
        <button onClick={useNow}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background:"#1a2a1a", color:"#4ade80", border:"1px solid #1e3a1e" }}
          onMouseEnter={e=>{e.currentTarget.style.background="#1e3a1e";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#1a2a1a";}}>
          Use this
        </button>
        <button onClick={save} disabled={saving}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background:"#111", color:"#888", border:"1px solid #222" }}
          onMouseEnter={e=>{e.currentTarget.style.background="#1a1a1a";e.currentTarget.style.color="#ccc";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#111";e.currentTarget.style.color="#888";}}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ── Left panel: Saved config row ── */
function ConfigRow({ cfg, isActive, onSelect, onDelete }) {
  return (
    <div onClick={onSelect}
      className="flex items-start gap-2 px-2.5 py-2 rounded-lg cursor-pointer mb-1 group transition-colors"
      style={{ background: isActive ? "#1a2a1a" : "transparent", border: `1px solid ${isActive?"#1e3a1e":"transparent"}` }}
      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background="#0f0f0f"; }}
      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background="transparent"; }}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: isActive?"#4ade80":"#c0c0c0" }}>
          ⚡ {cfg.label}
        </div>
        <div className="text-[10px] truncate mt-0.5" style={{ color:"#555" }}>{cfg.model}</div>
        {cfg.api_key && <div className="text-[9px] mt-0.5 font-mono" style={{ color:"#333" }}>{cfg.api_key}</div>}
      </div>
      <button onClick={e=>{e.stopPropagation();onDelete(cfg.id);}}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-5 h-5 flex items-center justify-center rounded"
        style={{ color:"#555" }}
        onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
        onMouseLeave={e=>e.currentTarget.style.color="#555"}>
        <TrashI/>
      </button>
    </div>
  );
}

/* ── Right panel: Chat bubble ── */
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className="flex mb-3" style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div className="max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed"
        style={{
          background: isUser ? "#1a2a1a" : "#111",
          color: msg.error ? "#f87171" : "#d8d8d8",
          border: `1px solid ${isUser ? "#1e3a1e" : msg.error ? "#3a0808" : "#1e1e1e"}`,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
        {msg.content}
        {msg.streaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 align-middle"
            style={{ background:"#4ade80", animation:"pgBlink .8s step-end infinite" }}/>
        )}
      </div>
    </div>
  );
}

/* ── Main Playground page ── */
export default function Playground() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?.email || null;

  const [configs,       setConfigs]       = useState([]);
  const [activeConfig,  setActiveConfig]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [isStreaming,   setIsStreaming]    = useState(false);
  const [temperature,   setTemperature]   = useState(0.7);
  const [maxTokens,     setMaxTokens]     = useState(2048);
  const [loadingCfgs,   setLoadingCfgs]   = useState(false);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Load saved configs
  useEffect(() => {
    if (!userId) return;
    setLoadingCfgs(true);
    apiGet(`/api/playground/configs?user_id=${encodeURIComponent(userId)}`)
      .then(d => setConfigs(d.configs || []))
      .catch(() => {})
      .finally(() => setLoadingCfgs(false));
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  const deleteConfig = async (id) => {
    try {
      await apiDelete(`/api/playground/configs/${id}?user_id=${encodeURIComponent(userId)}`);
      setConfigs(prev => prev.filter(c => c.id !== id));
      if (activeConfig?.id === id) setActiveConfig(null);
    } catch {}
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    if (!activeConfig) {
      setMessages(prev => [...prev, { role:"assistant", content:"⚠ Select or configure a model first.", error:true }]);
      return;
    }

    const userMsg = { role:"user", content:text };
    const history = messages.map(m => ({ role:m.role, content:m.content }));
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const asstId = Date.now();
    setMessages(prev => [...prev, { id:asstId, role:"assistant", content:"", streaming:true }]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const body = {
      user_id:     userId,
      message:     text,
      history,
      temperature,
      max_tokens:  maxTokens,
      ...(activeConfig.id
        ? { config_id: activeConfig.id }
        : {
            preset:   activeConfig.preset,
            base_url: activeConfig.base_url,
            model:    activeConfig.model,
            api_key:  activeConfig.api_key,
          }
      ),
    };

    let full = "";
    await playgroundStream({
      body, signal: controller.signal,
      onToken: (chunk) => {
        full += chunk;
        setMessages(prev => prev.map(m => m.id===asstId ? {...m,content:full} : m));
      },
      onDone: () => {
        setMessages(prev => prev.map(m => m.id===asstId ? {...m,streaming:false} : m));
        setIsStreaming(false); abortRef.current = null;
        inputRef.current?.focus();
      },
      onError: (err) => {
        setMessages(prev => prev.map(m => m.id===asstId ? {...m,content:`⚠ ${err}`,streaming:false,error:true} : m));
        setIsStreaming(false); abortRef.current = null;
      },
    });
  };

  const onKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const stop  = () => { abortRef.current?.abort(); };

  // Not logged in
  if (!user) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-4" style={{ background:"#000" }}>
        <FlaskI/>
        <p className="text-white text-sm">Log in to use the Playground</p>
        <button onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background:"#111", color:"#888", border:"1px solid #222" }}>
          ← Back to RUBRA
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ background:"#000" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom:"1px solid #111" }}>
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color:"#555" }}
          onMouseEnter={e=>e.currentTarget.style.color="#999"}
          onMouseLeave={e=>e.currentTarget.style.color="#555"}>
          <BackI/> Back to RUBRA
        </button>
        <div className="flex items-center gap-2">
          <FlaskI/>
          <span className="font-bold text-sm tracking-wider" style={{ color:"#4ade80" }}>PLAYGROUND</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color:"#444" }}>Temp</span>
            <input type="range" min={0} max={2} step={0.05} value={temperature}
              onChange={e=>setTemperature(parseFloat(e.target.value))}
              style={{ width:60, accentColor:"#4ade80" }}/>
            <span className="text-[10px] w-6" style={{ color:"#666" }}>{temperature}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color:"#444" }}>Tokens</span>
            <input type="number" min={64} max={8192} step={64} value={maxTokens}
              onChange={e=>setMaxTokens(parseInt(e.target.value)||2048)}
              className="text-xs text-center rounded outline-none w-14"
              style={{ background:"#111", border:"1px solid #1e1e1e", color:"#888" }}/>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Config panel ── */}
        <div className="flex-shrink-0 flex flex-col overflow-y-auto p-4"
          style={{ width:240, borderRight:"1px solid #111", background:"#050505" }}>

          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color:"#3a3a3a" }}>
            Saved Configs
          </p>

          {loadingCfgs && <p className="text-[11px]" style={{ color:"#333" }}>Loading…</p>}

          {configs.map(cfg => (
            <ConfigRow key={cfg.id} cfg={cfg}
              isActive={activeConfig?.id === cfg.id}
              onSelect={() => setActiveConfig(cfg)}
              onDelete={deleteConfig}
            />
          ))}

          {configs.length === 0 && !loadingCfgs && (
            <p className="text-[11px] py-2" style={{ color:"#333" }}>No saved configs yet</p>
          )}

          <div className="mt-3 mb-1 border-t pt-3" style={{ borderColor:"#111" }}>
            <ConfigForm userId={userId} activeConfig={activeConfig} onActivate={cfg => {
              setActiveConfig(cfg);
              // If it's a newly saved config, refresh list
              if (cfg.id) {
                apiGet(`/api/playground/configs?user_id=${encodeURIComponent(userId)}`)
                  .then(d => setConfigs(d.configs || [])).catch(()=>{});
              }
            }}/>
          </div>

          {activeConfig && (
            <div className="mt-3 px-2 py-2 rounded-lg" style={{ background:"#0a1a0a", border:"1px solid #1e3a1e" }}>
              <p className="text-[10px] mb-0.5" style={{ color:"#2a4a2a" }}>Active config</p>
              <p className="text-xs font-medium truncate" style={{ color:"#4ade80" }}>{activeConfig.label}</p>
              <p className="text-[10px] truncate" style={{ color:"#2a6a2a" }}>{activeConfig.model}</p>
            </div>
          )}
        </div>

        {/* ── Right: Chat area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <div style={{ opacity:0.3 }}><FlaskI/></div>
                <p className="text-sm" style={{ color:"#444" }}>
                  {activeConfig ? `Ready — using ${activeConfig.model}` : "Select or configure a model to start testing"}
                </p>
              </div>
            )}
            {messages.map((m, i) => <Bubble key={m.id || i} msg={m}/>)}
            <div ref={bottomRef}/>
          </div>

          {/* Clear button */}
          {messages.length > 0 && (
            <div className="px-6 pb-1 flex justify-end">
              <button onClick={() => setMessages([])}
                className="text-[11px] px-2 py-0.5 rounded"
                style={{ color:"#333" }}
                onMouseEnter={e=>e.currentTarget.style.color="#666"}
                onMouseLeave={e=>e.currentTarget.style.color="#333"}>
                Clear chat
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-5 flex-shrink-0">
            <div className="rounded-xl flex items-end gap-2 px-4 py-3 max-w-3xl mx-auto"
              style={{ background:"#0d0d0d", border:"1px solid #1a1a1a" }}>
              <textarea ref={inputRef} value={input}
                onChange={e=>{setInput(e.target.value);const t=e.target;t.style.height="auto";t.style.height=Math.min(t.scrollHeight,130)+"px";}}
                onKeyDown={onKey} placeholder="Type a message…" rows={1}
                className="flex-1 resize-none outline-none bg-transparent text-sm"
                style={{ color:"#d8d8d8", caretColor:"#4ade80", minHeight:22, maxHeight:130 }}
              />
              {isStreaming
                ? <button onClick={stop}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:"#1a2a1a", color:"#4ade80" }}>
                    <StopI/>
                  </button>
                : <button onClick={send} disabled={!input.trim() || !activeConfig}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: input.trim()&&activeConfig ? "#1a2a1a" : "#0d0d0d",
                      color: input.trim()&&activeConfig ? "#4ade80" : "#333",
                      cursor: input.trim()&&activeConfig ? "pointer" : "default" }}>
                    <SendI/>
                  </button>
              }
            </div>
            <p className="text-center text-[10px] mt-1.5" style={{ color:"#222" }}>
              API keys are stored encrypted. Keys are never returned in full.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pgSpin { to { transform: rotate(360deg); } }
        @keyframes pgBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
