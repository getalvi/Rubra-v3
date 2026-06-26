import { useState, useEffect } from "react";
import { langColor, fmtSize, buildFileTree } from "../../utils/parse";
import FileTree from "./FileTree";
import LivePreview, { isPreviewable } from "./LivePreview";
import ExportBar from "./ExportBar";

/* ── Icons ── */
const I = ({ d, s=14, sw=1.7 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const CloseI    = () => <I d="M18 6L6 18M6 6l12 12" sw={2}/>;
const WrapI     = () => <I d="M3 6h18M3 12h12M3 18h15M17 15l3-3-3-3"/>;
const TreeI     = () => <I d="M9 3v18M3 3h18v18H3z"/>;
const CodeI     = () => <I d="M16 18l6-6-6-6M8 6l-6 6 6 6" s={13}/>;
const EyeI      = () => <I d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" s={13}/>;
const ExpandI   = () => <I d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>;
const CollapseI = () => <I d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/>;

const LANG_LABEL = {
  js:"JavaScript", javascript:"JavaScript", ts:"TypeScript", typescript:"TypeScript",
  py:"Python", python:"Python", html:"HTML", css:"CSS", json:"JSON",
  bash:"Bash", sh:"Shell", sql:"SQL", rust:"Rust", go:"Go",
  java:"Java", cpp:"C++", c:"C", yaml:"YAML", yml:"YAML",
  md:"Markdown", markdown:"Markdown", jsx:"JSX", tsx:"TSX", text:"Plain Text",
};
function langLabel(lang) { return LANG_LABEL[lang?.toLowerCase()] || lang || "Text"; }

/* ── Tab strip ── */
function TabStrip({ files, activeId, onSelect, onClose }) {
  return (
    <div className="flex items-center overflow-x-auto flex-shrink-0"
      style={{ background:"#161620", borderBottom:"1px solid #1e1e2a", scrollbarWidth:"none" }}>
      {files.map(f => {
        const active = f.id === activeId;
        return (
          <div key={f.id} onClick={() => onSelect(f.id)}
            className="flex items-center gap-1.5 px-3 py-2 cursor-pointer flex-shrink-0 select-none"
            style={{
              borderRight:"1px solid #1e1e2a",
              borderBottom: active ? "2px solid #e8301f" : "2px solid transparent",
              background: active ? "#1c1c28" : "transparent",
            }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: langColor(f.lang) }}/>
            <span className="text-xs font-mono truncate"
              style={{ color: active ? "#fff" : "#8080a0", maxWidth:110 }}>
              {f.name}
            </span>
            {files.length > 1 && (
              <span
                onClick={e => { e.stopPropagation(); onClose(f.id); }}
                className="w-3.5 h-3.5 flex items-center justify-center text-xs flex-shrink-0 rounded"
                style={{ color:"#5a5a7a" }}
                onMouseEnter={e => { e.currentTarget.style.color="white"; e.currentTarget.style.background="#2a2a3a"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#5a5a7a"; e.currentTarget.style.background="transparent"; }}>
                ×
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Code viewer with line numbers ── */
function CodeView({ file, wordWrap }) {
  if (!file) return null;
  const lines = (file.content || "").split("\n");
  return (
    <div className="flex-1 overflow-auto" style={{ background:"#0d0d12" }}>
      <div className="flex min-h-full">
        <div className="py-3.5 select-none flex-shrink-0" style={{ borderRight:"1px solid #1c1c28" }}>
          {lines.map((_, i) => (
            <div key={i} className="font-mono text-xs text-right"
              style={{ color:"#3a3a4a", minWidth:36, paddingRight:9, paddingLeft:10, lineHeight:"1.65em" }}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 py-3.5 px-4 font-mono text-xs"
          style={{
            color:"#c8cce8", margin:0, lineHeight:"1.65em",
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

/* ── Main FilePanel ── */
export default function FilePanel({ files, onClose, expanded, onToggleExpand }) {
  // Track open tab IDs separately from the files prop
  const [openIds,   setOpenIds]   = useState(() => files.length ? [files[0].id] : []);
  const [activeTab, setActiveTab] = useState(() => files.length ? files[0].id : null);
  const [wordWrap,  setWordWrap]  = useState(false);
  const [view,      setView]      = useState("code");
  const [treeOpen,  setTreeOpen]  = useState(true);

  // When files prop changes (new project loaded), reset to first file
  useEffect(() => {
    if (!files.length) return;
    const firstId = files[0].id;
    setOpenIds([firstId]);
    setActiveTab(firstId);
    setView("code");
  }, [files.map(f => f.id).join(",")]); // eslint-disable-line

  const closeTab = id => {
    const next = openIds.filter(x => x !== id);
    setOpenIds(next);
    if (activeTab === id) setActiveTab(next[next.length - 1] || null);
    if (next.length === 0) onClose();
  };

  // Open a file: add to tabs if not present, then activate
  const openFile = id => {
    setOpenIds(prev => prev.includes(id) ? prev : [...prev, id]);
    setActiveTab(id);
  };

  const openTabs   = openIds.map(id => files.find(f => f.id === id)).filter(Boolean);
  const activeFile = files.find(f => f.id === activeTab);
  const tree       = buildFileTree(files);
  const canPreview = isPreviewable(files);
  const showTree   = files.length > 1;

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background:"#0d0d12" }}>

      {/* ── File tree ── */}
      {showTree && treeOpen && (
        <div className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width:160, borderRight:"1px solid #1e1e2a" }}>
          <div className="px-2.5 py-2 flex-shrink-0"
            style={{ borderBottom:"1px solid #1e1e2a" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color:"#5a5a7a" }}>Files</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree tree={tree} activeId={activeTab} onSelect={openFile}/>
          </div>
        </div>
      )}

      {/* ── Editor area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-2 py-1.5 flex-shrink-0"
          style={{ background:"#161620", borderBottom:"1px solid #1e1e2a" }}>

          <div className="flex items-center gap-1 min-w-0">
            {showTree && (
              <button onClick={() => setTreeOpen(v => !v)} title="Toggle file tree"
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ color: treeOpen ? "#e8301f" : "#6a6a8a" }}
                onMouseEnter={e => e.currentTarget.style.background="#1e1e2a"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <TreeI/>
              </button>
            )}
            {activeFile && (
              <span className="text-xs font-mono truncate" style={{ color:"#5a5a7a" }}>
                {langLabel(activeFile.lang)} · {fmtSize(activeFile.size)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Code ↔ Preview toggle */}
            {canPreview && (
              <div className="flex rounded-md p-0.5 mr-1"
                style={{ background:"#0d0d12", border:"1px solid #1e1e2a" }}>
                {[["code","Code",<CodeI key="c"/>],["preview","Preview",<EyeI key="e"/>]].map(([v,l,ic]) => (
                  <button key={v} onClick={() => setView(v)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors"
                    style={{ background:view===v?"#252533":"transparent", color:view===v?"white":"#6a6a8a" }}>
                    {ic}{l}
                  </button>
                ))}
              </div>
            )}
            {/* Word wrap */}
            {view === "code" && (
              <button onClick={() => setWordWrap(v => !v)} title="Word wrap"
                className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                style={{ color: wordWrap ? "#e8301f" : "#6a6a8a" }}
                onMouseEnter={e => e.currentTarget.style.background="#1e1e2a"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <WrapI/>
              </button>
            )}
            {/* Expand/Collapse */}
            <button onClick={onToggleExpand} title={expanded ? "Collapse" : "Expand"}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color:"#6a6a8a" }}
              onMouseEnter={e => { e.currentTarget.style.background="#1e1e2a"; e.currentTarget.style.color="white"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6a6a8a"; }}>
              {expanded ? <CollapseI/> : <ExpandI/>}
            </button>
            {/* Close */}
            <button onClick={onClose} title="Close"
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color:"#6a6a8a" }}
              onMouseEnter={e => { e.currentTarget.style.background="#1e1e2a"; e.currentTarget.style.color="white"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6a6a8a"; }}>
              <CloseI/>
            </button>
          </div>
        </div>

        {/* Tabs */}
        {view === "code" && openTabs.length > 1 && (
          <TabStrip files={openTabs} activeId={activeTab} onSelect={setActiveTab} onClose={closeTab}/>
        )}

        {/* Content */}
        {view === "preview" && canPreview
          ? <LivePreview files={files}/>
          : <CodeView file={activeFile || files[0]} wordWrap={wordWrap}/>
        }

        {/* Export bar */}
        {activeFile && <ExportBar activeFile={activeFile} files={files}/>}
      </div>
    </div>
  );
}
