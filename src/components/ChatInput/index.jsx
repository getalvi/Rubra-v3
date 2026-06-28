import { useState, useRef, useEffect } from "react";

/* ── Icons ── */
const SendI = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const StopI = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);
const AttachI = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const FileI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
);
const CloseI = () => (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const SpinI = () => (
  <span className="inline-block w-3 h-3 rounded-full border-2 flex-shrink-0"
    style={{ borderColor:"#2a2a3a", borderTopColor:"#e8301f", animation:"chatSpin .6s linear infinite" }}/>
);
const ChevI = ({ open }) => (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
    style={{ opacity:0.5, transform: open ? "rotate(180deg)" : "rotate(0)", transition:"transform .15s" }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

/* ── Mode config ── */
const MODES = [
  { id:"fast",  label:"Rubra Fast",  desc:"Quick answers",             dot:"#22c55e", mode:"fast"   },
  { id:"think", label:"Rubra Think", desc:"Deeper reasoning",          dot:"#60a5fa", mode:"hermes" },
  { id:"agent", label:"Rubra Agent", desc:"Multi-step agentic tasks",  dot:"#a78bfa", mode:"agent"  },
];

const PILLS = ["Code </>", "Write", "Research", "Learn", "News"];
const PASTE_LINES = 15;
const PASTE_CHARS  = 800;
const BASE = "https://getalvi-rubra-v3.hf.space";
const ACCEPT = [
  "image/jpeg","image/png","image/gif","image/webp",
  "text/plain","text/markdown","text/csv",
  "application/json","application/xml","text/html","text/css",
  "application/pdf",
  "audio/mpeg","audio/wav","audio/ogg","audio/mp4","audio/flac","audio/webm",
].join(",");

function langGuess(text) {
  if (/^\s*(import |from |def |class |print\()/m.test(text)) return "python";
  if (/^\s*(function |const |let |var |import .* from|export )/m.test(text)) return "javascript";
  if (/^\s*[{[]/.test(text.trim()) && /[}\]]\s*$/.test(text.trim())) return "json";
  if (/^\s*<\/?[a-z]/i.test(text.trim())) return "html";
  return "text";
}
function fmtBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}
async function uploadFile(file) {
  const fd = new FormData(); fd.append("file", file);
  const res = await fetch(`${BASE}/api/upload`, { method:"POST", body:fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

/* ── Mode Dropdown ── */
function ModeDropdown({ selected, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = MODES.find(m => m.id === selected) || MODES[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-medium select-none transition-colors rounded-lg px-2 py-1"
        style={{
          color:      disabled ? "#3a3a55" : "#a0a0b8",
          cursor:     disabled ? "default" : "pointer",
          background: open ? "#1a1a28" : "transparent",
          border:     "1px solid " + (open ? "#2a2a3a" : "#1a1a2a"),
        }}
        onMouseEnter={e => { if (!disabled && !open) { e.currentTarget.style.background="#161624"; e.currentTarget.style.borderColor="#2a2a3a"; }}}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="#1a1a2a"; }}}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: disabled ? "#3a3a55" : cur.dot, flexShrink:0 }}/>
        <span>{cur.label}</span>
        <ChevI open={open}/>
      </button>

      {/* Dropdown panel — rendered in a portal-like fixed div so it never gets clipped */}
      {open && (
        <div
          style={{
            position:"absolute",
            bottom:"calc(100% + 8px)",
            left:0,
            zIndex:9999,
            background:"#0e0e18",
            border:"1px solid #252535",
            borderRadius:12,
            boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
            minWidth:210,
            overflow:"hidden",
          }}
        >
          {MODES.map((m, i) => {
            const isActive = selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                style={{
                  width:"100%",
                  display:"flex",
                  alignItems:"center",
                  gap:12,
                  padding:"10px 14px",
                  background: isActive ? "#1a1a2a" : "transparent",
                  borderBottom: i < MODES.length-1 ? "1px solid #181828" : "none",
                  cursor:"pointer",
                  textAlign:"left",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="#131320"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ width:8, height:8, borderRadius:"50%", background:m.dot, flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color: isActive ? "#ffffff" : "#c8c8e0", marginBottom:2 }}>
                    {m.label}
                    {isActive && <span style={{ marginLeft:6, color:"#e8301f", fontSize:10 }}>✓</span>}
                  </div>
                  <div style={{ fontSize:11, color:"#5a5a7a" }}>{m.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Attachment card ── */
function AttachCard({ att, onRemove }) {
  const isImg = att.file.type.startsWith("image/");
  return (
    <div className="relative flex-shrink-0 rounded-lg overflow-hidden group"
      style={{ border:"1px solid #26263a", background:"#141420" }}>
      {isImg && att.preview
        ? <img src={att.preview} alt={att.file.name} className="w-14 h-14 object-cover"/>
        : (
          <div className="w-14 h-14 flex flex-col items-center justify-center gap-1">
            {att.uploading ? <SpinI/> : <FileI/>}
            {!att.uploading && <span className="text-[9px] px-1 text-center truncate w-full" style={{ color:"#6a6a8a" }}>{att.file.name.slice(0,9)}</span>}
          </div>
        )
      }
      {att.uploading && <div className="absolute inset-0 flex items-center justify-center" style={{ background:"rgba(10,10,20,0.7)" }}><SpinI/></div>}
      {att.error   && <div className="absolute inset-0 flex items-center justify-center px-1" style={{ background:"rgba(120,0,0,0.85)" }}><span className="text-[9px]" style={{ color:"#fca5a5" }}>Failed</span></div>}
      <button onClick={() => onRemove(att.id)}
        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full items-center justify-center hidden group-hover:flex"
        style={{ background:"rgba(0,0,0,0.8)", color:"white" }}>
        <CloseI/>
      </button>
      {!isImg && !att.uploading && !att.error && (
        <div className="px-1 py-0.5 text-[9px] truncate" style={{ color:"#5a5a7a", maxWidth:56 }}>{fmtBytes(att.file.size)}</div>
      )}
    </div>
  );
}

/* ── Pasted-text card ── */
function PasteCard({ p, onRemove }) {
  return (
    <div className="flex items-center gap-2 rounded-lg pl-2 pr-1.5 py-1.5 flex-shrink-0"
      style={{ background:"#1a1a2a", border:"1px solid #252535", maxWidth:180 }}>
      <FileI/>
      <div className="min-w-0">
        <div className="text-xs font-medium text-white truncate">Pasted</div>
        <div className="text-[10px]" style={{ color:"#5a5a7a" }}>{p.lines} lines · {p.lang}</div>
      </div>
      <button onClick={() => onRemove(p.id)} className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
        style={{ color:"#5a5a7a" }}
        onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
        onMouseLeave={e=>e.currentTarget.style.color="#5a5a7a"}>
        <CloseI/>
      </button>
    </div>
  );
}

/* ── Main ChatInput ── */
export default function ChatInput({ onSend, onStop, isStreaming, disabled }) {
  const [val,    setVal]    = useState("");
  const [pasted, setPasted] = useState([]);
  const [atts,   setAtts]   = useState([]);
  const [modeId, setModeId] = useState("fast");
  const textRef = useRef(null);
  const fileRef = useRef(null);

  // Listen for mode-change events from sidebar Project button
  useEffect(() => {
    const handler = (e) => {
      const m = MODES.find(x => x.mode === e.detail || x.id === e.detail);
      if (m) setModeId(m.id);
      // Focus the textarea so user can start typing immediately
      setTimeout(() => textRef.current?.focus(), 50);
    };
    window.addEventListener("rubra:set-mode", handler);
    return () => window.removeEventListener("rubra:set-mode", handler);
  }, []);

  const getMode = () => (MODES.find(m => m.id === modeId) || MODES[0]).mode;
  const resetH  = () => { if (textRef.current) textRef.current.style.height = "auto"; };

  const submit = () => {
    const t = val.trim();
    const allReady = atts.every(a => !a.uploading);
    if ((!t && !pasted.length && !atts.length) || isStreaming || disabled || !allReady) return;

    let full = t;
    for (const a of atts) {
      if (a.error || !a.result) continue;
      const r = a.result;
      if (r.type === "image") full = (full ? full+"\n\n" : "") + `[Image: ${r.filename}]\n${r.text||""}`;
      else if (r.type === "text") full = (full ? full+"\n\n" : "") + `[File: ${r.filename}]\n\`\`\`\n${r.text.slice(0,12000)}\n\`\`\``;
      else full = (full ? full+"\n\n" : "") + `[File: ${r.filename}]`;
    }
    for (const p of pasted) {
      const fence = "```"+(p.lang!=="text"?p.lang:"")+"\n"+p.content+"\n```";
      full = full ? full+"\n\n"+fence : fence;
    }
    if (!full.trim()) return;
    onSend(full, getMode());
    setVal(""); setPasted([]); setAtts([]); resetH();
  };

  const onKey   = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };
  const onInput = e => {
    setVal(e.target.value);
    const ta = textRef.current;
    if (ta) { ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight,140)+"px"; }
  };
  const onPaste = e => {
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    const lines = text.split("\n").length;
    if (lines > PASTE_LINES || text.length > PASTE_CHARS) {
      e.preventDefault();
      setPasted(prev => [...prev, { id:Date.now()+Math.random().toString(36).slice(2), content:text, lines, lang:langGuess(text) }]);
    }
  };

  const handleFiles = async (files) => {
    const list = Array.from(files);
    const newAtts = list.map(f => ({
      id: Date.now()+Math.random().toString(36).slice(2)+f.name,
      file:f, preview:f.type.startsWith("image/")?URL.createObjectURL(f):null, uploading:true, result:null, error:null
    }));
    setAtts(prev => [...prev, ...newAtts]);
    for (const att of newAtts) {
      try {
        const result = await uploadFile(att.file);
        setAtts(prev => prev.map(a => a.id===att.id ? {...a,uploading:false,result} : a));
      } catch (err) {
        setAtts(prev => prev.map(a => a.id===att.id ? {...a,uploading:false,error:err.message} : a));
      }
    }
  };

  const onDrop = e => { e.preventDefault(); if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files); };
  const removeAtt  = id => { setAtts(prev => { const a=prev.find(x=>x.id===id); if (a?.preview) URL.revokeObjectURL(a.preview); return prev.filter(x=>x.id!==id); }); };
  const removePaste = id => setPasted(prev => prev.filter(p => p.id!==id));

  const anyUploading = atts.some(a => a.uploading);
  const canSend = (val.trim() || pasted.length || atts.some(a=>a.result)) && !disabled && !isStreaming && !anyUploading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5" onDrop={onDrop} onDragOver={e=>e.preventDefault()}>
      <input ref={fileRef} type="file" multiple accept={ACCEPT} className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value=""; }}/>

      {/* ── Input box ── */}
      <div className="rounded-2xl" style={{ background:"#111118", border:"1px solid #1e1e2e" }}>

        {/* Attachment + paste cards */}
        {(atts.length > 0 || pasted.length > 0) && (
          <div className="flex flex-wrap gap-2 px-3.5 pt-3 pb-1">
            {atts.map(a   => <AttachCard key={a.id} att={a} onRemove={removeAtt}/>)}
            {pasted.map(p => <PasteCard  key={p.id} p={p}   onRemove={removePaste}/>)}
          </div>
        )}

        {/* Textarea row */}
        <div className="flex items-start px-4 pt-3.5 pb-2 gap-3">
          <textarea
            ref={textRef} value={val} onChange={onInput} onKeyDown={onKey} onPaste={onPaste}
            disabled={disabled} placeholder="Type something…" rows={1}
            className="flex-1 resize-none outline-none bg-transparent text-sm leading-relaxed"
            style={{ color:"#e8e8f0", caretColor:"#e8301f", minHeight:22, maxHeight:140, opacity:disabled?0.45:1 }}
          />
          {/* Send / Stop */}
          {isStreaming
            ? <button onClick={onStop}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background:"#e8301f", color:"#fff", marginTop:1 }}
                onMouseEnter={e=>e.currentTarget.style.background="#c9281a"}
                onMouseLeave={e=>e.currentTarget.style.background="#e8301f"}>
                <StopI/>
              </button>
            : <button onClick={submit} disabled={!canSend}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background:canSend?"#e8301f":"#1a1a28", color:canSend?"#fff":"#3a3a55", marginTop:1, opacity:canSend?1:0.6, cursor:canSend?"pointer":"default" }}>
                <SendI/>
              </button>
          }
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center gap-2 px-3.5 pb-3">
          {/* Mode selector */}
          <ModeDropdown selected={modeId} onChange={setModeId} disabled={disabled||isStreaming}/>

          {/* Divider */}
          <span style={{ width:1, height:14, background:"#1e1e2e", flexShrink:0 }}/>

          {/* Attach */}
          <button onClick={() => fileRef.current?.click()} disabled={disabled}
            className="flex items-center gap-1 text-xs transition-colors rounded-lg px-1.5 py-1"
            style={{ color:"#6060808", opacity:disabled?0.4:1 }}
            onMouseEnter={e=>{ if(!disabled){e.currentTarget.style.color="#a0a0c0";}}}
            onMouseLeave={e=>e.currentTarget.style.color="#606080"}>
            <AttachI/>
            <span style={{ color:"#606080" }}>Attach</span>
          </button>

          {/* Uploading indicator */}
          {anyUploading && (
            <div className="flex items-center gap-1.5 text-xs ml-1" style={{ color:"#5a5a7a" }}>
              <SpinI/><span>Uploading…</span>
            </div>
          )}

          {/* Streaming bars */}
          {isStreaming && !anyUploading && (
            <div className="flex items-center gap-0.5 ml-auto">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="w-0.5 rounded-full"
                  style={{ display:"inline-block", height:6+Math.sin(i)*3, background:"#3a3a55",
                    animation:`chatBar ${.4+i*.09}s ease-in-out infinite alternate` }}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick pills ── */}
      <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
        {PILLS.map(p => (
          <button key={p} onClick={() => !isStreaming && !disabled && onSend(p, getMode())}
            disabled={isStreaming || disabled}
            className="text-xs px-3.5 py-1.5 rounded-full transition-colors"
            style={{
              background:"#0e0e18", border:"1px solid #1a1a2a", color:"#6060808",
              opacity:(isStreaming||disabled)?0.4:1, cursor:(isStreaming||disabled)?"default":"pointer"
            }}
            onMouseEnter={e=>{ if(!isStreaming&&!disabled){e.currentTarget.style.background="#161624";e.currentTarget.style.borderColor="#252535";e.currentTarget.style.color="#a0a0c0";}}}
            onMouseLeave={e=>{e.currentTarget.style.background="#0e0e18";e.currentTarget.style.borderColor="#1a1a2a";e.currentTarget.style.color="#606080";}}>
            {p}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes chatSpin{to{transform:rotate(360deg)}}
        @keyframes chatBar{from{transform:scaleY(.4)}to{transform:scaleY(1.5)}}
      `}</style>
    </div>
  );
}
