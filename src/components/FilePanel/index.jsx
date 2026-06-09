import { useState } from "react";
import { langColor, fmtSize } from "../../utils/parse";

/* Icons */
const I = ({ d, s=16, c="rgba(255,255,255,0.6)", sw=1.5, fill="none" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill}>
    <path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CloseI    = () => <I d="M18 6L6 18M6 6l12 12" c="rgba(255,255,255,0.5)"/>;
const CopyI     = ({ok}) => ok
  ? <I d="M20 6L9 17l-5-5" c="#4ade80" sw={2}/>
  : <I d="M8 17.9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M10 21h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/>;
const DownI     = () => <I d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" c="rgba(255,255,255,0.65)"/>;
const WrapI     = () => <I d="M3 6h18M3 12h12M3 18h15M17 15l3-3-3-3" c="rgba(255,255,255,0.5)"/>;
const MaxI      = () => <I d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>;
const FileI     = () => <I d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />;

function langLabel(lang) {
  const m = { js:"JavaScript", javascript:"JavaScript", ts:"TypeScript", typescript:"TypeScript",
    python:"Python", py:"Python", html:"HTML", css:"CSS", json:"JSON", bash:"Bash",
    sh:"Shell", sql:"SQL", rust:"Rust", go:"Go", java:"Java", cpp:"C++", c:"C",
    yaml:"YAML", yml:"YAML", toml:"TOML", md:"Markdown", markdown:"Markdown", text:"Plain Text" };
  return m[lang?.toLowerCase()] || lang || "Text";
}

function lineCount(code) {
  return (code || "").split("\n").length;
}

/* ── Single file viewer ── */
function FileViewer({ file, onClose }) {
  const [copied, setCopied]   = useState(false);
  const [wordWrap, setWrap]   = useState(true);
  const [expanded, setExpand] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type:"text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  };

  const lines = lineCount(file.content);
  const dot   = langColor(file.lang);

  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100%",
      background:"rgba(8,7,18,0.97)",
      animation:"fadeIn 0.18s var(--ease)",
    }}>
      {/* File header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 16px 10px",
        borderBottom:"0.5px solid var(--border)",
        flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <span style={{
            width:9, height:9, borderRadius:"50%", background:dot, flexShrink:0,
            boxShadow:`0 0 6px ${dot}88`,
          }}/>
          <span style={{
            fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:500,
            color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>{file.name}</span>
          <span style={{
            fontSize:10.5, color:"var(--text-dim)", fontWeight:600,
            background:"rgba(255,255,255,0.06)", borderRadius:5,
            padding:"2px 7px", flexShrink:0,
          }}>{langLabel(file.lang)}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
          <span style={{ fontSize:11, color:"var(--text-dim)", marginRight:6 }}>
            {lines}L · {fmtSize(file.size)}
          </span>
          <ActionBtn onClick={() => setWrap(v=>!v)} title="Toggle wrap" active={wordWrap}><WrapI/></ActionBtn>
          <ActionBtn onClick={handleDownload} title="Download"><DownI/></ActionBtn>
          <ActionBtn onClick={handleCopy} title="Copy"><CopyI ok={copied}/></ActionBtn>
          <ActionBtn onClick={onClose} title="Close panel"><CloseI/></ActionBtn>
        </div>
      </div>

      {/* Code area */}
      <div style={{ flex:1, overflowY:"auto", overflowX: wordWrap ? "hidden" : "auto" }}>
        <div style={{ display:"flex", minHeight:"100%" }}>
          {/* Line numbers */}
          <div style={{
            padding:"16px 0", userSelect:"none", flexShrink:0,
            borderRight:"0.5px solid rgba(255,255,255,0.06)",
          }}>
            {file.content.split("\n").map((_,i) => (
              <div key={i} style={{
                padding:"0 12px 0 16px",
                fontSize:12.5, lineHeight:"1.65em",
                color:"rgba(255,255,255,0.18)",
                fontFamily:"'JetBrains Mono',monospace",
                textAlign:"right", minWidth:44,
              }}>{i+1}</div>
            ))}
          </div>
          {/* Code */}
          <pre style={{
            flex:1, margin:0, padding:"16px 20px",
            fontSize:13, lineHeight:1.65,
            fontFamily:"'JetBrains Mono',monospace",
            color:"rgba(210,210,245,0.90)",
            whiteSpace: wordWrap ? "pre-wrap" : "pre",
            wordBreak: wordWrap ? "break-word" : "normal",
            overflowX: wordWrap ? "hidden" : "auto",
          }}>
            <code>{file.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, active, children }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      background: active || h ? "rgba(255,255,255,0.09)" : "transparent",
      border:"none", cursor:"pointer",
      width:30, height:30, borderRadius:7,
      display:"flex", alignItems:"center", justifyContent:"center",
      transition:"background 0.15s",
    }}>{children}</button>
  );
}

/* ── Tab strip ── */
function TabStrip({ files, activeId, onSelect, onClose }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", overflowX:"auto",
      borderBottom:"0.5px solid var(--border)",
      background:"rgba(6,5,14,0.6)", flexShrink:0,
      scrollbarWidth:"none",
    }}>
      {files.map(f => {
        const isActive = f.id === activeId;
        const dot = langColor(f.lang);
        return (
          <div
            key={f.id}
            onClick={() => onSelect(f.id)}
            style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"9px 14px 8px", cursor:"pointer", flexShrink:0,
              borderRight:"0.5px solid var(--border)",
              borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
              transition:"background 0.15s",
            }}
          >
            <span style={{ width:7, height:7, borderRadius:"50%", background:dot, flexShrink:0 }}/>
            <span style={{
              fontSize:12.5, fontFamily:"'JetBrains Mono',monospace",
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              whiteSpace:"nowrap", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis",
            }}>{f.name}</span>
            <span
              onClick={e => { e.stopPropagation(); onClose(f.id); }}
              style={{
                width:14, height:14, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--text-dim)", fontSize:12, cursor:"pointer", flexShrink:0,
                transition:"background 0.12s, color 0.12s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text-dim)";}}
            >×</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main FilePanel export ── */
export default function FilePanel({ files, onClose }) {
  const [openFiles, setOpenFiles] = useState(files.length > 0 ? [files[0].id] : []);
  const [activeTab, setActiveTab] = useState(files.length > 0 ? files[0].id : null);

  // Sync when new files arrive
  const allIds = files.map(f=>f.id);
  const newFile = files.find(f => !openFiles.includes(f.id));
  if (newFile) {
    setOpenFiles(prev => [...prev, newFile.id]);
    setActiveTab(newFile.id);
  }

  const closeTab = (id) => {
    const next = openFiles.filter(x=>x!==id);
    setOpenFiles(next);
    if (activeTab === id) setActiveTab(next[next.length-1] || null);
    if (next.length === 0) onClose();
  };

  const openTabs = openFiles.map(id => files.find(f=>f.id===id)).filter(Boolean);
  const activeFile = files.find(f => f.id === activeTab);

  if (!activeFile) return null;

  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100%",
      background:"rgba(7,6,16,0.96)",
      backdropFilter:"var(--blur)", WebkitBackdropFilter:"var(--blur)",
      borderLeft:"0.5px solid var(--border)",
      animation:"fadeIn 0.22s var(--ease)",
    }}>
      {/* Files in sidebar area */}
      {files.length > 1 && (
        <TabStrip
          files={openTabs}
          activeId={activeTab}
          onSelect={setActiveTab}
          onClose={closeTab}
        />
      )}

      {/* No tabs shown if single file — just show header + viewer */}
      {files.length === 1 && (
        <div style={{
          display:"flex", alignItems:"center", gap:8, padding:"10px 16px 8px",
          borderBottom:"0.5px solid var(--border)", flexShrink:0,
        }}>
          <FileI />
          <span style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"'JetBrains Mono',monospace" }}>
            File Preview
          </span>
          <div style={{ flex:1 }}/>
          <button onClick={onClose} style={{
            background:"transparent", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            width:26, height:26, borderRadius:6,
          }}><CloseI/></button>
        </div>
      )}

      <FileViewer file={activeFile} onClose={onClose} />
    </div>
  );
}
