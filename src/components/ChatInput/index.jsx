import { useState, useRef } from "react";

/* ── Icons ── */
const SendI = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const StopI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);
const AttI = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const FileI = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
);
const ImgI = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const CloseI = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const SpinI = () => (
  <span className="inline-block w-3 h-3 rounded-full border-2 flex-shrink-0"
    style={{ borderColor:"#2a2a3a", borderTopColor:"#e8301f", animation:"spin .6s linear infinite" }}/>
);

const PILLS = ["Code </>", "Write", "Research", "Learn", "News"];
const PASTE_LINES = 15;
const PASTE_CHARS = 800;
const BASE = "https://getalvi-rubra-v3.hf.space";

/* Accepted file types — mirrors what the backend /api/upload handles */
const ACCEPT = [
  "image/jpeg","image/png","image/gif","image/webp",
  "text/plain","text/markdown","text/csv",
  "application/json","application/xml","text/html","text/css",
  "application/pdf",
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
  if (b < 1024*1024) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1024/1024).toFixed(1)} MB`;
}

/* ── Upload a single file to the backend /api/upload ── */
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/api/upload`, { method:"POST", body:fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json(); // { type, filename, text, ... }
}

/* ── Attachment card (image preview or file icon) ── */
function AttachCard({ att, onRemove }) {
  const isImg = att.file.type.startsWith("image/");
  return (
    <div className="relative flex-shrink-0 rounded-lg overflow-hidden group"
      style={{ border:"1px solid #26263a", background:"#141420" }}>
      {isImg && att.preview ? (
        <img src={att.preview} alt={att.file.name}
          className="w-16 h-16 object-cover"/>
      ) : (
        <div className="w-16 h-16 flex flex-col items-center justify-center gap-1">
          {att.uploading ? <SpinI/> : <FileI/>}
          {!att.uploading && (
            <span className="text-[9px] text-center px-1 leading-tight truncate w-full text-center"
              style={{ color:"#6a6a8a" }}>
              {att.file.name.slice(0,10)}{att.file.name.length>10?"…":""}
            </span>
          )}
        </div>
      )}

      {att.uploading && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background:"rgba(10,10,20,0.7)" }}>
          <SpinI/>
        </div>
      )}
      {att.error && (
        <div className="absolute inset-0 flex items-center justify-center px-1"
          style={{ background:"rgba(120,0,0,0.85)" }}>
          <span className="text-[9px] text-center" style={{ color:"#fca5a5" }}>Upload failed</span>
        </div>
      )}

      {/* remove button */}
      <button onClick={() => onRemove(att.id)}
        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full items-center justify-center hidden group-hover:flex transition-all"
        style={{ background:"rgba(0,0,0,0.8)", color:"white" }}>
        <CloseI/>
      </button>

      {/* filename tooltip strip */}
      {!isImg && !att.uploading && !att.error && (
        <div className="px-1.5 py-0.5 text-[9px] truncate" style={{ color:"#5a5a7a", maxWidth:64 }}>
          {fmtBytes(att.file.size)}
        </div>
      )}
    </div>
  );
}

/* ── Pasted-text card ── */
function PasteCard({ p, onRemove }) {
  return (
    <div className="flex items-center gap-2 rounded-lg pl-2.5 pr-1.5 py-1.5 flex-shrink-0"
      style={{ background:"#1a1a2a", border:"1px solid #26263a", maxWidth:200 }}>
      <FileI/>
      <div className="min-w-0">
        <div className="text-xs font-medium text-white truncate">Pasted content</div>
        <div className="text-[10px]" style={{ color:"#5a5a7a" }}>{p.lines} lines · {p.lang}</div>
      </div>
      <button onClick={() => onRemove(p.id)}
        className="flex-shrink-0 ml-1 w-4 h-4 rounded flex items-center justify-center"
        style={{ color:"#5a5a7a" }}
        onMouseEnter={e=>{e.currentTarget.style.color="#f87171";}}
        onMouseLeave={e=>{e.currentTarget.style.color="#5a5a7a";}}>
        <CloseI/>
      </button>
    </div>
  );
}

export default function ChatInput({ onSend, onStop, isStreaming, disabled }) {
  const [val,    setVal]    = useState("");
  const [pasted, setPasted] = useState([]);   // { id, content, lines, lang }
  const [atts,   setAtts]   = useState([]);   // { id, file, preview?, uploading, result?, error }
  const textRef = useRef(null);
  const fileRef = useRef(null);

  const resetHeight = () => { if (textRef.current) textRef.current.style.height = "auto"; };

  /* ── Build and send the full message ── */
  const submit = () => {
    const t = val.trim();
    const allReady = atts.every(a => !a.uploading);
    if ((!t && pasted.length === 0 && atts.length === 0) || isStreaming || disabled || !allReady) return;

    let full = t;

    // Append uploaded file content as context blocks
    for (const a of atts) {
      if (a.error || !a.result) continue;
      const r = a.result;
      if (r.type === "image") {
        full = full ? `${full}\n\n[Image: ${r.filename}]\n${r.text || ""}` : `[Image: ${r.filename}]\n${r.text || ""}`;
      } else if (r.type === "text") {
        const fence = "```\n" + r.text.slice(0, 12000) + "\n```";
        full = full ? `${full}\n\n[File: ${r.filename}]\n${fence}` : `[File: ${r.filename}]\n${fence}`;
      } else {
        full = full ? `${full}\n\n[File: ${r.filename} — ${r.mime || "unknown type"}]`
                    : `[File: ${r.filename} — ${r.mime || "unknown type"}]`;
      }
    }

    // Append pasted code blocks
    for (const p of pasted) {
      const fence = "```" + (p.lang !== "text" ? p.lang : "") + "\n" + p.content + "\n```";
      full = full ? `${full}\n\n${fence}` : fence;
    }

    if (!full.trim()) return;
    onSend(full);
    setVal(""); setPasted([]); setAtts([]);
    resetHeight();
  };

  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };
  const onInput = e => {
    setVal(e.target.value);
    const ta = textRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px"; }
  };

  /* ── Paste handler: large text → pasted card ── */
  const onPaste = e => {
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    const lineCount = text.split("\n").length;
    if (lineCount > PASTE_LINES || text.length > PASTE_CHARS) {
      e.preventDefault();
      setPasted(prev => [...prev, {
        id: Date.now() + Math.random().toString(36).slice(2),
        content: text, lines: lineCount, chars: text.length, lang: langGuess(text),
      }]);
    }
  };

  /* ── File picker triggered ── */
  const handleFiles = async (files) => {
    const list = Array.from(files);
    const newAtts = list.map(file => ({
      id: Date.now() + Math.random().toString(36).slice(2) + file.name,
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      uploading: true,
      result: null,
      error: null,
    }));
    setAtts(prev => [...prev, ...newAtts]);

    // Upload each file
    for (const att of newAtts) {
      try {
        const result = await uploadFile(att.file);
        setAtts(prev => prev.map(a => a.id === att.id ? { ...a, uploading:false, result } : a));
      } catch (err) {
        setAtts(prev => prev.map(a => a.id === att.id ? { ...a, uploading:false, error:err.message } : a));
      }
    }
  };

  /* ── Drag-and-drop ── */
  const onDrop = e => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
  };
  const onDragOver = e => e.preventDefault();

  const removePaste = (id) => setPasted(prev => prev.filter(p => p.id !== id));
  const removeAtt   = (id) => {
    setAtts(prev => {
      const a = prev.find(x => x.id === id);
      if (a?.preview) URL.revokeObjectURL(a.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const anyUploading = atts.some(a => a.uploading);
  const canSend = (val.trim() || pasted.length > 0 || atts.some(a => a.result))
                  && !disabled && !isStreaming && !anyUploading;

  return (
    <div className="px-4 pb-5 max-w-3xl w-full mx-auto"
      onDrop={onDrop} onDragOver={onDragOver}>

      {/* hidden file input */}
      <input ref={fileRef} type="file" multiple accept={ACCEPT} className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}/>

      <div className="rounded-xl overflow-hidden"
        style={{ background:"#111118", border:"1px solid #1e1e2e" }}>

        {/* ── Attachment + paste cards ── */}
        {(atts.length > 0 || pasted.length > 0) && (
          <div className="flex flex-wrap gap-2 px-3.5 pt-3 pb-1">
            {atts.map(a => <AttachCard key={a.id} att={a} onRemove={removeAtt}/>)}
            {pasted.map(p => <PasteCard key={p.id} p={p} onRemove={removePaste}/>)}
          </div>
        )}

        {/* ── Textarea + send/stop ── */}
        <div className="flex items-start px-3.5 pt-3 pb-1.5 gap-2">
          <textarea
            ref={textRef} value={val} onChange={onInput} onKeyDown={onKey} onPaste={onPaste}
            disabled={disabled} placeholder="Type something…" rows={1}
            className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent"
            style={{ color:"#e8e8f0", caretColor:"#e8301f", minHeight:24, maxHeight:140, opacity:disabled?0.5:1 }}
          />
          {isStreaming ? (
            <button onClick={onStop} title="Stop generating"
              className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background:"#e8301f", color:"white" }}
              onMouseEnter={e=>e.currentTarget.style.background="#c9281a"}
              onMouseLeave={e=>e.currentTarget.style.background="#e8301f"}>
              <StopI/>
            </button>
          ) : (
            <button onClick={submit} disabled={!canSend}
              className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background:canSend?"#e8301f":"#1e1e2e", color:canSend?"white":"#3a3a55", opacity:canSend?1:0.6, cursor:canSend?"pointer":"default" }}>
              <SendI/>
            </button>
          )}
        </div>

        {/* ── Bottom bar: attach + streaming bars ── */}
        <div className="flex items-center px-3 pb-2.5 gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            title="Attach file (image, PDF, text, JSON…)"
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors"
            style={{ color:"#5a5a7a", opacity:disabled?0.4:1 }}
            onMouseEnter={e=>{if(!disabled){e.currentTarget.style.background="#1a1a2a";e.currentTarget.style.color="#a0a0c0";}}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#5a5a7a";}}>
            <AttI/>
            <span>Attach</span>
          </button>

          {anyUploading && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color:"#5a5a7a" }}>
              <SpinI/> Uploading…
            </div>
          )}

          {isStreaming && !anyUploading && (
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="w-0.5 rounded-full inline-block"
                  style={{ height:8+Math.sin(i)*4, background:"#3a3a55", animation:`barP ${.4+i*.08}s ease-in-out infinite alternate` }}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* pills */}
      <div className="flex gap-2 mt-2.5 flex-wrap justify-center">
        {PILLS.map(p => (
          <button key={p} onClick={() => onSend(p)} disabled={isStreaming || disabled}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ background:"#111118", border:"1px solid #1e1e2e", color:"#5a5a7a", opacity:(isStreaming||disabled)?0.5:1, cursor:(isStreaming||disabled)?"default":"pointer" }}
            onMouseEnter={e=>{if(!isStreaming&&!disabled){e.currentTarget.style.background="#1a1a2a";e.currentTarget.style.color="#a0a0c0";}}}
            onMouseLeave={e=>{e.currentTarget.style.background="#111118";e.currentTarget.style.color="#5a5a7a";}}>
            {p}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes barP{from{transform:scaleY(.4)}to{transform:scaleY(1.4)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
