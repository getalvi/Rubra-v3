import { useEffect, useRef, useState } from "react";
import { parseSegments, langColor, fmtSize } from "../../utils/parse";

/* ── Icons ── */
const I = ({ d, s=15, c="rgba(255,255,255,0.55)", sw=1.5 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CopyI    = ({ok}) => ok ? <I d="M20 6L9 17l-5-5" c="#4ade80" sw={2}/> : <I d="M8 17.9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M10 21h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/>;
const EditI    = () => <I d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>;
const RetryI   = () => <I d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>;
const FileI    = () => <I d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>;
const ExpandI  = () => <I d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>;
const DownI    = () => <I d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" c="rgba(255,255,255,0.65)"/>;
const SlideI   = () => <I d="M2 3h20v14H2zM8 21h8M12 17v4"/>;

/* ── Cursor ── */
const Cursor = () => (
  <span style={{
    display:"inline-block", width:2, height:"1em",
    background:"rgba(255,255,255,0.8)", marginLeft:2,
    verticalAlign:"text-bottom",
    animation:"blink 0.8s step-start infinite",
  }}/>
);

/* ── Inline text renderer (bold/italic/code) ── */
function Inline({ text }) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i} style={{ color:"white", fontWeight:600 }}>{p.slice(2,-2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*"))
          return <em key={i} style={{ color:"rgba(255,255,255,0.8)" }}>{p.slice(1,-1)}</em>;
        if (p.startsWith("`") && p.endsWith("`"))
          return <code key={i} style={{
            fontFamily:"'JetBrains Mono',monospace", fontSize:"0.88em",
            background:"rgba(255,255,255,0.10)", borderRadius:4,
            padding:"1px 6px", color:"rgba(200,210,255,0.92)",
          }}>{p.slice(1,-1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ── Text block renderer ── */
function TextBlock({ text }) {
  if (!text?.trim()) return null;
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim())                    { out.push(<div key={i} style={{ height:8 }}/>); i++; continue; }
    if (line.startsWith("# "))           { out.push(<h1 key={i} style={H1}><Inline text={line.slice(2)}/></h1>); i++; continue; }
    if (line.startsWith("## "))          { out.push(<h2 key={i} style={H2}><Inline text={line.slice(3)}/></h2>); i++; continue; }
    if (line.startsWith("### "))         { out.push(<h3 key={i} style={H3}><Inline text={line.slice(4)}/></h3>); i++; continue; }
    if (line.match(/^[-•*] /))           { out.push(<div key={i} style={LI}><span style={{color:"var(--text-dim)",flexShrink:0,marginTop:3,fontSize:10}}>●</span><span><Inline text={line.slice(2)}/></span></div>); i++; continue; }
    if (line.match(/^\d+\. /)) {
      const [num,...rest] = line.split(". ");
      out.push(<div key={i} style={LI}><span style={{color:"var(--text-dim)",flexShrink:0,minWidth:18,fontWeight:600}}>{num}.</span><span><Inline text={rest.join(". ")}/></span></div>);
      i++; continue;
    }
    if (line.match(/^---+$/))            { out.push(<hr key={i} style={{ border:"none",borderTop:"0.5px solid rgba(255,255,255,0.10)",margin:"14px 0" }}/>); i++; continue; }
    if (line.startsWith("> "))           { out.push(<blockquote key={i} style={BQ}><Inline text={line.slice(2)}/></blockquote>); i++; continue; }
    out.push(<p key={i} style={{ margin:"2px 0", lineHeight:1.72 }}><Inline text={line}/></p>);
    i++;
  }
  return <>{out}</>;
}

const H1 = { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"white", margin:"16px 0 6px", letterSpacing:"-0.01em" };
const H2 = { fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:"white", margin:"14px 0 5px" };
const H3 = { fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.92)", margin:"12px 0 4px" };
const LI = { display:"flex", gap:8, margin:"3px 0", alignItems:"flex-start" };
const BQ = { borderLeft:"2px solid var(--accent)", paddingLeft:12, color:"var(--text-muted)", fontStyle:"italic", margin:"8px 0" };

/* ── Code block ── */
function CodeBlock({ seg, onOpenPanel }) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCol] = useState(false);
  const lines = seg.content.split("\n").length;
  const isLong = lines > 30;
  const dot = langColor(seg.lang);

  const handleCopy = () => {
    navigator.clipboard.writeText(seg.content);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const handleDownload = () => {
    const ext = { javascript:"js",typescript:"ts",python:"py",html:"html",css:"css",json:"json",bash:"sh",sh:"sh",sql:"sql",rust:"rs",go:"go",java:"java",cpp:"cpp",c:"c" }[seg.lang?.toLowerCase()] || "txt";
    const blob = new Blob([seg.content], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`code.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      border:"0.5px solid rgba(255,255,255,0.09)",
      borderRadius:"var(--radius-md)", overflow:"hidden",
      margin:"12px 0", background:"rgba(0,0,0,0.45)",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 13px",
        background:"rgba(255,255,255,0.04)",
        borderBottom: collapsed ? "none" : "0.5px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:dot, boxShadow:`0 0 5px ${dot}99`, flexShrink:0 }}/>
          <span style={{ fontSize:11.5, fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em" }}>
            {seg.lang || "code"}
          </span>
          <span style={{ fontSize:11, color:"var(--text-dim)" }}>{lines} lines</span>
        </div>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          {isLong && (
            <CBtn onClick={() => onOpenPanel?.(seg)} title="Open in panel"><ExpandI/><span>Panel</span></CBtn>
          )}
          <CBtn onClick={handleDownload} title="Download"><DownI/><span>Download</span></CBtn>
          <CBtn onClick={handleCopy} title="Copy"><CopyI ok={copied}/><span>{copied?"Copied":"Copy"}</span></CBtn>
          <button onClick={()=>setCol(v=>!v)} style={{
            background:"transparent",border:"none",cursor:"pointer",
            fontSize:11,color:"var(--text-dim)",padding:"3px 7px",borderRadius:5,
          }}>{collapsed ? "▶ Show" : "▼ Hide"}</button>
        </div>
      </div>

      {/* Code */}
      {!collapsed && (
        <div style={{ display:"flex", overflow:"hidden" }}>
          {/* Line numbers */}
          <div style={{
            flexShrink:0, padding:"14px 0",
            borderRight:"0.5px solid rgba(255,255,255,0.05)",
            userSelect:"none",
          }}>
            {seg.content.split("\n").map((_,i) => (
              <div key={i} style={{
                padding:"0 11px 0 14px", minWidth:40, textAlign:"right",
                fontSize:12, lineHeight:"1.65em",
                color:"rgba(255,255,255,0.16)",
                fontFamily:"'JetBrains Mono',monospace",
              }}>{i+1}</div>
            ))}
          </div>
          <pre style={{
            flex:1, margin:0, padding:"14px 18px",
            fontSize:13, lineHeight:1.65,
            fontFamily:"'JetBrains Mono',monospace",
            color:"rgba(210,215,245,0.88)",
            overflowX:"auto", whiteSpace:"pre",
          }}><code>{seg.content}</code></pre>
        </div>
      )}
    </div>
  );
}

function CBtn({ onClick, title, children }) {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} title={title} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      display:"flex", alignItems:"center", gap:5,
      background: h ? "rgba(255,255,255,0.10)" : "transparent",
      border:"none", cursor:"pointer", borderRadius:6,
      padding:"4px 9px", color:"rgba(255,255,255,0.50)", fontSize:11.5,
      fontFamily:"inherit", transition:"all 0.15s",
    }}>{children}</button>
  );
}

/* ── Presentation slide view ── */
function PresentationView({ segments }) {
  const [slide, setSlide] = useState(0);
  const textSegs = segments.filter(s => s.type === "text" && s.content.trim());
  const total = textSegs.length;
  if (!total) return null;
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"var(--radius-md)", overflow:"hidden", border:"0.5px solid var(--border)" }}>
      {/* Slide */}
      <div style={{ padding:"28px 32px", minHeight:180 }}>
        <div style={{ fontSize:11, color:"var(--text-dim)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:16 }}>
          SLIDE {slide+1} / {total}
        </div>
        <div style={{ fontSize:15, lineHeight:1.75, color:"var(--text-primary)" }}>
          <TextBlock text={textSegs[slide].content} />
        </div>
      </div>
      {/* Nav */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 16px", borderTop:"0.5px solid var(--border)",
        background:"rgba(255,255,255,0.025)",
      }}>
        <button onClick={()=>setSlide(v=>Math.max(0,v-1))} disabled={slide===0} style={navBtn(slide===0)}>← Prev</button>
        <div style={{ display:"flex", gap:5 }}>
          {Array.from({length:total}).map((_,i)=>(
            <span key={i} onClick={()=>setSlide(i)} style={{
              width:6, height:6, borderRadius:"50%", cursor:"pointer",
              background: i===slide ? "var(--accent)" : "rgba(255,255,255,0.18)",
              transition:"background 0.15s",
            }}/>
          ))}
        </div>
        <button onClick={()=>setSlide(v=>Math.min(total-1,v+1))} disabled={slide===total-1} style={navBtn(slide===total-1)}>Next →</button>
      </div>
    </div>
  );
}
const navBtn = dis => ({
  background:"transparent", border:"0.5px solid rgba(255,255,255,0.12)",
  borderRadius:7, padding:"5px 14px", color: dis ? "var(--text-dim)" : "var(--text-primary)",
  cursor: dis ? "default" : "pointer", fontSize:12.5, fontFamily:"inherit",
  transition:"all 0.15s", opacity: dis ? 0.4 : 1,
});

/* ── Message content ── */
function MessageContent({ content, streaming, onOpenPanel }) {
  const [pMode, setPMode] = useState(false);
  const safe = typeof content === "string" ? content : String(content ?? "");
  const segments = parseSegments(safe);
  const hasCode = segments.some(s => s.type === "code");

  return (
    <div style={{ fontSize:14.5, lineHeight:1.72, color:"rgba(255,255,255,0.85)", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Toolbar for AI messages */}
      {!streaming && hasCode && (
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          <button onClick={()=>setPMode(v=>!v)} style={{
            display:"flex", alignItems:"center", gap:6,
            background: pMode ? "rgba(230,48,39,0.12)" : "rgba(255,255,255,0.06)",
            border: `0.5px solid ${pMode ? "rgba(230,48,39,0.3)" : "var(--border)"}`,
            borderRadius:7, padding:"4px 12px", cursor:"pointer",
            color: pMode ? "#e63027" : "var(--text-muted)", fontSize:12, fontFamily:"inherit",
            transition:"all 0.18s",
          }}>
            <SlideI /> {pMode ? "Chat View" : "Presentation View"}
          </button>
        </div>
      )}

      {pMode ? (
        <PresentationView segments={segments} />
      ) : (
        segments.map((seg, i) =>
          seg.type === "code"
            ? <CodeBlock key={i} seg={seg} onOpenPanel={onOpenPanel} />
            : <TextBlock key={i} text={seg.content} />
        )
      )}
      {streaming && <Cursor />}
    </div>
  );
}

/* ── Edit modal ── */
function EditModal({ content, onSave, onCancel }) {
  const [val, setVal] = useState(content);
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
      animation:"fadeIn 0.15s var(--ease)",
    }}>
      <div style={{
        background:"rgba(12,10,22,0.98)",
        border:"0.5px solid rgba(255,255,255,0.14)",
        borderRadius:"var(--radius-lg)", padding:24,
        width:"100%", maxWidth:560,
        boxShadow:"0 24px 64px rgba(0,0,0,0.7)",
        animation:"fadeUp 0.2s var(--ease)",
      }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"white", marginBottom:14 }}>Edit Message</h3>
        <textarea
          value={val} onChange={e=>setVal(e.target.value)}
          rows={6}
          autoFocus
          style={{
            width:"100%", background:"rgba(255,255,255,0.055)",
            border:"0.5px solid rgba(255,255,255,0.12)", borderRadius:"var(--radius-md)",
            color:"var(--text-primary)", fontSize:14, fontFamily:"inherit",
            padding:"12px 14px", resize:"vertical", outline:"none", lineHeight:1.6,
            boxSizing:"border-box",
          }}
        />
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:14 }}>
          <Pill onClick={onCancel} dim>Cancel</Pill>
          <Pill onClick={()=>onSave(val)} accent>Save &amp; Resend</Pill>
        </div>
      </div>
    </div>
  );
}

function Pill({ onClick, children, accent, dim }) {
  return (
    <button onClick={onClick} style={{
      padding:"8px 20px", borderRadius:9, cursor:"pointer",
      border: accent ? "none" : "0.5px solid var(--border)",
      background: accent ? "linear-gradient(135deg,#c0392b,#7b241c)" : "rgba(255,255,255,0.07)",
      color: dim ? "var(--text-muted)" : "white",
      fontSize:13, fontWeight:600, fontFamily:"inherit",
      transition:"opacity 0.15s",
    }}>{children}</button>
  );
}

/* ── Action bar ── */
function ActionBar({ msg, onEdit, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const isBot  = msg.role === "assistant";

  const doCopy = () => {
    navigator.clipboard.writeText(typeof msg.content==="string"?msg.content:"");
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="action-bar" style={{
      display:"flex", gap:5, marginTop:6,
      opacity:0, transition:"opacity 0.18s",
    }}>
      {isUser && <ActionPill icon={<EditI/>} label="Edit" onClick={()=>onEdit(msg)}/>}
      {isBot  && <ActionPill icon={<RetryI/>} label="Retry" onClick={()=>onRetry(msg)}/>}
      <ActionPill icon={<CopyI ok={copied}/>} label={copied?"Copied":"Copy"} onClick={doCopy}/>
    </div>
  );
}

function ActionPill({ icon, label, onClick }) {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      display:"flex", alignItems:"center", gap:5,
      padding:"4px 10px", borderRadius:7, cursor:"pointer",
      background: h ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.055)",
      border:"0.5px solid rgba(255,255,255,0.10)",
      color:"var(--text-muted)", fontSize:12, fontFamily:"inherit",
      transition:"all 0.14s",
    }}>
      {icon}<span>{label}</span>
    </button>
  );
}

/* ── Main export ── */
export default function MessageList({ messages, onEditMessage, onRetry, onOpenFilePanel }) {
  const bottomRef = useRef(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth", block:"end" });
  }, [messages]);

  const handleSave = (newContent) => {
    onEditMessage?.(editing.id, newContent);
    setEditing(null);
  };

  const handleOpenPanel = (seg) => {
    onOpenFilePanel?.({ lang: seg.lang, content: seg.content });
  };

  return (
    <div style={{
      flex:1, overflowY:"auto", padding:"32px 20px 16px",
      display:"flex", flexDirection:"column", gap:28,
      maxWidth:800, width:"100%", margin:"0 auto", boxSizing:"border-box",
    }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .msg-wrap:hover .action-bar { opacity:1 !important; }
      `}</style>

      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          className="msg-wrap"
          style={{
            display:"flex", flexDirection:"column",
            alignItems: msg.role==="user" ? "flex-end" : "flex-start",
            animation:"fadeUp 0.22s var(--ease)",
            animationDelay: `${Math.min(idx*0.03, 0.15)}s`,
            animationFillMode:"both",
          }}
        >
          {msg.role === "user" ? (
            <>
              <div style={{
                background:"rgba(255,255,255,0.075)",
                backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
                border:"0.5px solid rgba(255,255,255,0.10)",
                borderRadius:"18px 18px 4px 18px",
                padding:"11px 17px", maxWidth:"70%",
                color:"var(--text-primary)", fontSize:14.5, lineHeight:1.65,
                fontFamily:"'DM Sans',sans-serif",
              }}>
                {msg.content}
              </div>
              <ActionBar msg={msg} onEdit={()=>setEditing(msg)} onRetry={onRetry}/>
            </>
          ) : (
            <>
              <div style={{ maxWidth:"92%", width:"100%" }}>
                {msg.error && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:8, marginBottom:8,
                    background:"rgba(230,48,39,0.10)", border:"0.5px solid rgba(230,48,39,0.25)",
                    borderRadius:"var(--radius-sm)", padding:"8px 12px",
                    color:"#ff6b5b", fontSize:13,
                  }}>
                    ⚠ Connection error — check backend
                  </div>
                )}
                <MessageContent
                  content={msg.content}
                  streaming={msg.streaming}
                  onOpenPanel={handleOpenPanel}
                />
              </div>
              {!msg.streaming && <ActionBar msg={msg} onEdit={()=>setEditing(msg)} onRetry={onRetry}/>}
            </>
          )}
        </div>
      ))}

      <div ref={bottomRef} style={{ height:1 }}/>
      {editing && <EditModal content={editing.content} onSave={handleSave} onCancel={()=>setEditing(null)}/>}
    </div>
  );
}
