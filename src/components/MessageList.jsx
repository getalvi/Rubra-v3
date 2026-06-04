import { useEffect, useRef, useState } from "react";

/* ── Icons ── */
const CopyIcon = ({copied}) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    {copied
      ? <path d="M20 6L9 17l-5-5" stroke="#4ade80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      : <>
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6}/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6}/>
        </>
    }
  </svg>
);
const EditIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="rgba(255,255,255,0.7)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const RetryIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <path d="M1 4v6h6M23 20v-6h-6" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Typing cursor ── */
function Cursor() {
  return <span style={{
    display:"inline-block", width:2, height:"1em",
    background:"rgba(255,255,255,0.8)", marginLeft:2, verticalAlign:"text-bottom",
    animation:"blink 0.8s step-start infinite",
  }}/>;
}

/* ── Code block ── */
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const safeCode = typeof code === "string" ? code : Array.isArray(code) ? code.map(c => typeof c === "string" ? c : "").join("") : String(code ?? "");

  const handleCopy = () => {
    navigator.clipboard.writeText(safeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const ext = lang === "python" ? "py" : lang === "javascript" ? "js" : lang === "typescript" ? "ts" : lang === "html" ? "html" : lang === "css" ? "css" : lang || "txt";
    const blob = new Blob([safeCode], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `code.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background:"rgba(0,0,0,0.55)", border:"0.5px solid rgba(255,255,255,0.10)",
      borderRadius:10, overflow:"hidden", margin:"10px 0", fontSize:13,
    }}>
      {/* Header bar */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"7px 14px",
        background:"rgba(255,255,255,0.05)",
        borderBottom:"0.5px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{ color:"rgba(255,255,255,0.40)", fontSize:11.5, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>
          {lang || "code"}
        </span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={handleDownload} title="Download file" style={codeBtn}>
            <DownloadIcon /> <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginLeft:4 }}>Download</span>
          </button>
          <button onClick={handleCopy} title="Copy" style={codeBtn}>
            <CopyIcon copied={copied} />
            <span style={{ fontSize:11, color: copied ? "#4ade80" : "rgba(255,255,255,0.5)", marginLeft:4 }}>
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </div>
      </div>
      {/* Code */}
      <pre style={{
        margin:0, padding:"14px 16px", overflowX:"auto",
        color:"rgba(220,220,255,0.88)", lineHeight:1.65, fontFamily:"'JetBrains Mono','Fira Code',monospace",
        whiteSpace:"pre", fontSize:13,
      }}>
        <code>{safeCode}</code>
      </pre>
    </div>
  );
}

/* ── Parse markdown-ish content into segments ── */
function parseContent(text) {
  if (typeof text !== "string") return [{ type:"text", content: String(text ?? "") }];
  const segments = [];
  const codeReg = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = codeReg.exec(text)) !== null) {
    if (m.index > last) segments.push({ type:"text", content: text.slice(last, m.index) });
    segments.push({ type:"code", lang: m[1], content: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ type:"text", content: text.slice(last) });
  return segments.length ? segments : [{ type:"text", content: text }];
}

/* ── Render inline text with bold/italic ── */
function InlineText({ text }) {
  if (!text) return null;
  // Split on **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} style={{ color:"white", fontWeight:700 }}>{p.slice(2,-2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*")) return <em key={i}>{p.slice(1,-1)}</em>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ── Text segment renderer ── */
function TextSegment({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Heading
    if (line.startsWith("### ")) { elements.push(<h3 key={i} style={{ fontSize:14.5, fontWeight:700, color:"rgba(255,255,255,0.92)", margin:"12px 0 4px" }}><InlineText text={line.slice(4)}/></h3>); i++; continue; }
    if (line.startsWith("## ")) { elements.push(<h2 key={i} style={{ fontSize:16, fontWeight:700, color:"white", margin:"14px 0 5px" }}><InlineText text={line.slice(3)}/></h2>); i++; continue; }
    if (line.startsWith("# ")) { elements.push(<h1 key={i} style={{ fontSize:18, fontWeight:800, color:"white", margin:"16px 0 6px", fontFamily:"'Syne',sans-serif" }}><InlineText text={line.slice(2)}/></h1>); i++; continue; }
    // Bullet
    if (line.match(/^[-•*] /)) { elements.push(<div key={i} style={{ display:"flex", gap:8, margin:"2px 0" }}><span style={{ color:"rgba(255,255,255,0.35)", flexShrink:0, marginTop:2 }}>•</span><span><InlineText text={line.slice(2)}/></span></div>); i++; continue; }
    // Numbered list
    if (line.match(/^\d+\. /)) { const [num, ...rest] = line.split(". "); elements.push(<div key={i} style={{ display:"flex", gap:8, margin:"2px 0" }}><span style={{ color:"rgba(255,255,255,0.35)", flexShrink:0, minWidth:16 }}>{num}.</span><span><InlineText text={rest.join(". ")}/></span></div>); i++; continue; }
    // Horizontal rule
    if (line.match(/^---+$/)) { elements.push(<hr key={i} style={{ border:"none", borderTop:"0.5px solid rgba(255,255,255,0.10)", margin:"12px 0" }}/>); i++; continue; }
    // Empty line
    if (line.trim() === "") { elements.push(<br key={i}/>); i++; continue; }
    // Normal paragraph
    elements.push(<span key={i} style={{ display:"block" }}><InlineText text={line}/></span>);
    i++;
  }
  return <>{elements}</>;
}

/* ── Full message content renderer ── */
function MessageContent({ content, streaming }) {
  const safe = typeof content === "string" ? content : typeof content === "object" ? JSON.stringify(content) : String(content ?? "");
  const segments = parseContent(safe);
  return (
    <div style={{ fontSize:14, lineHeight:1.72, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter',sans-serif" }}>
      {segments.map((seg, i) =>
        seg.type === "code"
          ? <CodeBlock key={i} code={seg.content} lang={seg.lang}/>
          : <TextSegment key={i} text={seg.content}/>
      )}
      {streaming && <Cursor/>}
    </div>
  );
}

/* ── Action buttons ── */
function ActionRow({ msg, onEdit, onRetry, onCopy }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content || "");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{
      display:"flex", gap:6, marginTop:6, opacity:0,
      transition:"opacity 0.2s",
      className:"msg-actions",
    }} className="msg-actions">
      {msg.role === "user" && (
        <ABtn title="Edit message" onClick={() => onEdit(msg)}><EditIcon/> Edit</ABtn>
      )}
      {msg.role === "assistant" && (
        <ABtn title="Retry" onClick={() => onRetry(msg)}><RetryIcon/> Retry</ABtn>
      )}
      <ABtn title="Copy" onClick={handleCopy}><CopyIcon copied={copied}/> {copied ? "Copied" : "Copy"}</ABtn>
    </div>
  );
}
function ABtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      display:"flex", alignItems:"center", gap:5,
      background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.10)",
      borderRadius:7, padding:"4px 10px", cursor:"pointer",
      color:"rgba(255,255,255,0.50)", fontSize:12, fontFamily:"inherit",
      transition:"background 0.15s, color 0.15s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.11)";e.currentTarget.style.color="rgba(255,255,255,0.8)";}}
    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.50)";}}
    >{children}</button>
  );
}

/* ── Edit modal ── */
function EditModal({ msg, onSave, onCancel }) {
  const [val, setVal] = useState(msg.content);
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div style={{
        background:"rgba(14,12,24,0.97)", border:"0.5px solid rgba(255,255,255,0.12)",
        borderRadius:16, padding:24, width:"100%", maxWidth:560,
        boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
      }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"white", marginBottom:14 }}>Edit Message</h3>
        <textarea value={val} onChange={e=>setVal(e.target.value)} rows={6} style={{
          width:"100%", background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)",
          borderRadius:10, color:"rgba(255,255,255,0.88)", fontSize:14, fontFamily:"'Inter',sans-serif",
          padding:"12px 14px", resize:"vertical", outline:"none", lineHeight:1.6, boxSizing:"border-box",
        }}/>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:14 }}>
          <button onClick={onCancel} style={{ padding:"8px 18px", borderRadius:8, background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:13 }}>Cancel</button>
          <button onClick={()=>onSave(val)} style={{ padding:"8px 20px", borderRadius:8, background:"linear-gradient(135deg,#c0392b,#922b21)", border:"none", color:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>Save & Resend</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function MessageList({ messages, onEditMessage, onRetry }) {
  const bottomRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth", block:"end" });
  }, [messages]);

  const handleSaveEdit = (newContent) => {
    onEditMessage?.(editing.id, newContent);
    setEditing(null);
  };

  if (!messages.length) return null;

  return (
    <div style={{
      flex:1, overflowY:"auto", padding:"28px 16px 12px",
      display:"flex", flexDirection:"column", gap:24,
      maxWidth:800, width:"100%", margin:"0 auto",
      boxSizing:"border-box",
    }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .msg-wrap:hover .msg-actions { opacity:1 !important; }
      `}</style>

      {messages.map((msg) => (
        <div
          key={msg.id}
          className="msg-wrap"
          onMouseEnter={() => setHoveredId(msg.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ display:"flex", flexDirection:"column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}
        >
          {msg.role === "user" ? (
            <div style={{
              background:"rgba(255,255,255,0.08)", backdropFilter:"blur(16px)",
              border:"0.5px solid rgba(255,255,255,0.10)",
              borderRadius:"18px 18px 4px 18px",
              padding:"11px 16px", maxWidth:"72%",
              color:"rgba(255,255,255,0.90)", fontSize:14, lineHeight:1.6, fontFamily:"'Inter',sans-serif",
            }}>
              {msg.content}
            </div>
          ) : (
            <div style={{ maxWidth:"88%" }}>
              <MessageContent content={msg.content} streaming={msg.streaming}/>
            </div>
          )}

          {/* Action row — shows on hover */}
          {!msg.streaming && (
            <div className="msg-actions" style={{ opacity:0, transition:"opacity 0.18s", display:"flex", gap:6, marginTop:6 }}>
              {msg.role === "user" && (
                <ABtn title="Edit" onClick={()=>setEditing(msg)}><EditIcon/> Edit</ABtn>
              )}
              {msg.role === "assistant" && (
                <ABtn title="Retry" onClick={()=>onRetry?.(msg)}><RetryIcon/> Retry</ABtn>
              )}
              <ABtn title="Copy" onClick={()=>navigator.clipboard.writeText(typeof msg.content==="string"?msg.content:"")}><CopyIcon copied={false}/> Copy</ABtn>
            </div>
          )}
        </div>
      ))}

      <div ref={bottomRef} style={{ height:1 }}/>

      {editing && (
        <EditModal msg={editing} onSave={handleSaveEdit} onCancel={()=>setEditing(null)}/>
      )}
    </div>
  );
}

const codeBtn = {
  display:"flex", alignItems:"center",
  background:"transparent", border:"none", cursor:"pointer", padding:"2px 4px", borderRadius:5,
};
