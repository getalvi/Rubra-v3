import { useState, useEffect } from "react";
import { langColor, fmtSize, buildFileTree } from "../../utils/parse";
import FileTree from "./FileTree";
import LivePreview, { isPreviewable } from "./LivePreview";
import ExportBar from "./ExportBar";

/* Icons */
const Ico = ({ d, s=15, sw=1.6 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const CloseI    = () => <Ico d="M18 6L6 18M6 6l12 12" s={14} sw={2}/>;
const WrapI     = () => <Ico d="M3 6h18M3 12h12M3 18h15M17 15l3-3-3-3" s={14}/>;
const SidebarI  = () => <Ico d="M9 3v18M3 3h18v18H3z" s={14}/>;
const CodeIco   = () => <Ico d="M16 18l6-6-6-6M8 6l-6 6 6 6" s={13}/>;
const EyeIco    = () => <Ico d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" s={13}/>;

function langLabel(lang) {
  const m = { js:"JavaScript", javascript:"JavaScript", ts:"TypeScript", typescript:"TypeScript",
    python:"Python", py:"Python", html:"HTML", css:"CSS", json:"JSON", bash:"Bash",
    sh:"Shell", sql:"SQL", rust:"Rust", go:"Go", java:"Java", cpp:"C++", c:"C",
    yaml:"YAML", yml:"YAML", toml:"TOML", md:"Markdown", markdown:"Markdown", text:"Plain Text" };
  return m[lang?.toLowerCase()] || lang || "Text";
}

/* ── Tab strip ── */
function TabStrip({ files, activeId, onSelect, onClose }) {
  return (
    <div className="flex items-center overflow-x-auto flex-shrink-0" style={{ background:"#161620", borderBottom:"1px solid #232330", scrollbarWidth:"none" }}>
      {files.map(f => {
        const isActive = f.id === activeId;
        const dot = langColor(f.lang);
        return (
          <div key={f.id} onClick={() => onSelect(f.id)}
            className="flex items-center gap-1.5 px-3 py-2 cursor-pointer flex-shrink-0 transition-colors"
            style={{
              borderRight:"1px solid #232330",
              borderBottom: isActive ? "2px solid #e8301f" : "2px solid transparent",
              background: isActive ? "#1c1c28" : "transparent",
            }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }}/>
            <span className="text-xs font-mono truncate" style={{ color: isActive ? "#ffffff" : "#8080a0", maxWidth:120 }}>
              {f.name}
            </span>
            {files.length > 1 && (
              <span onClick={e => { e.stopPropagation(); onClose(f.id); }}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors"
                style={{ color:"#5a5a7a" }}
                onMouseEnter={e => { e.currentTarget.style.background="#2a2a3a"; e.currentTarget.style.color="white"; }}
                onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#5a5a7a"; }}>
                ×
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Code view (lightweight, no Monaco — keeps app fast) ── */
function CodeView({ file, wordWrap }) {
  if (!file) return null;
  const lines = file.content.split("\n");
  return (
    <div className="flex-1 overflow-auto" style={{ background:"#0d0d12" }}>
      <div className="flex min-h-full">
        <div className="py-3.5 select-none flex-shrink-0" style={{ borderRight:"1px solid #1c1c28" }}>
          {lines.map((_, i) => (
            <div key={i} className="font-mono text-xs text-right leading-relaxed"
              style={{ color:"#3a3a4a", minWidth:40, paddingRight:10, paddingLeft:14, lineHeight:"1.65em" }}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 py-3.5 px-4 font-mono text-xs leading-relaxed"
          style={{
            color:"#c8cce8", margin:0,
            whiteSpace: wordWrap ? "pre-wrap" : "pre",
            wordBreak: wordWrap ? "break-word" : "normal",
            overflowX: wordWrap ? "hidden" : "auto",
          }}>
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function FilePanel({ files, onClose }) {
  const [openIds,   setOpenIds]   = useState(files.length ? [files[0].id] : []);
  const [activeTab, setActiveTab] = useState(files.length ? files[0].id : null);
  const [wordWrap,  setWordWrap]  = useState(false);
  const [view,      setView]      = useState("code"); // code | preview
  const [treeOpen,  setTreeOpen]  = useState(true);

  // Sync newly-arrived files into open tabs automatically
  useEffect(() => {
    const newFile = files.find(f => !openIds.includes(f.id));
    if (newFile) {
      setOpenIds(prev => [...prev, newFile.id]);
      setActiveTab(newFile.id);
    }
  }, [files]); // eslint-disable-line

  const closeTab = (id) => {
    const next = openIds.filter(x => x !== id);
    setOpenIds(next);
    if (activeTab === id) setActiveTab(next[next.length - 1] || null);
    if (next.length === 0) onClose();
  };

  const openTabs   = openIds.map(id => files.find(f => f.id === id)).filter(Boolean);
  const activeFile = files.find(f => f.id === activeTab);
  const tree        = buildFileTree(files);
  const showTree    = files.length > 1;
  const canPreview  = isPreviewable(files);

  if (!activeFile) return null;

  return (
    <div className="flex h-full" style={{ background:"#0d0d12" }}>
      {/* ── File tree sidebar (only for multi-file projects) ── */}
      {showTree && treeOpen && (
        <div className="flex-shrink-0" style={{ width:170, borderRight:"1px solid #232330" }}>
          <div className="flex items-center justify-between px-2.5 py-2" style={{ borderBottom:"1px solid #232330" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"#5a5a7a" }}>Files</span>
          </div>
          <FileTree tree={tree} activeId={activeTab} onSelect={(id) => {
            if (!openIds.includes(id)) setOpenIds(prev => [...prev, id]);
            setActiveTab(id);
          }}/>
        </div>
      )}

      {/* ── Main editor column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 py-1.5 flex-shrink-0" style={{ background:"#161620", borderBottom:"1px solid #232330" }}>
          <div className="flex items-center gap-1">
            {showTree && (
              <button onClick={() => setTreeOpen(v => !v)} title="Toggle file tree"
                className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                style={{ color: treeOpen ? "#e8301f" : "#6a6a8a" }}
                onMouseEnter={e => e.currentTarget.style.background="#232330"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <SidebarI/>
              </button>
            )}
            <span className="text-xs font-mono px-1.5" style={{ color:"#6a6a8a" }}>
              {langLabel(activeFile.lang)} · {fmtSize(activeFile.size)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Code ↔ Preview toggle */}
            {canPreview && (
              <div className="flex rounded-md p-0.5 mr-1" style={{ background:"#0d0d12", border:"1px solid #232330" }}>
                <button onClick={() => setView("code")}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors"
                  style={{ background: view==="code" ? "#252533" : "transparent", color: view==="code" ? "white" : "#6a6a8a" }}>
                  <CodeIco/> Code
                </button>
                <button onClick={() => setView("preview")}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors"
                  style={{ background: view==="preview" ? "#252533" : "transparent", color: view==="preview" ? "white" : "#6a6a8a" }}>
                  <EyeIco/> Preview
                </button>
              </div>
            )}
            {view === "code" && (
              <button onClick={() => setWordWrap(v => !v)} title="Toggle word wrap"
                className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                style={{ color: wordWrap ? "#e8301f" : "#6a6a8a" }}
                onMouseEnter={e => e.currentTarget.style.background="#232330"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <WrapI/>
              </button>
            )}
            <button onClick={onClose} title="Close panel"
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color:"#6a6a8a" }}
              onMouseEnter={e => { e.currentTarget.style.background="#232330"; e.currentTarget.style.color="white"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6a6a8a"; }}>
              <CloseI/>
            </button>
          </div>
        </div>

        {/* Tabs (only shown in code view, multi-file) */}
        {view === "code" && files.length > 1 && (
          <TabStrip files={openTabs} activeId={activeTab} onSelect={setActiveTab} onClose={closeTab}/>
        )}

        {/* Body: code or live preview */}
        {view === "preview" && canPreview
          ? <LivePreview files={files}/>
          : <CodeView file={activeFile} wordWrap={wordWrap}/>
        }

        {/* Export bar */}
        <ExportBar activeFile={activeFile} files={files}/>
      </div>
    </div>
  );
}
