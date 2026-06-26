import { useState, useEffect } from "react";
import { langColor, fmtSize, buildFileTree } from "../../utils/parse";
import FileTree from "./FileTree";
import LivePreview, { isPreviewable } from "./LivePreview";
import ExportBar from "./ExportBar";

/* ── Icons ── */
const I = ({ d, s=14, sw=1.7 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const CloseI   = () => <I d="M18 6L6 18M6 6l12 12" sw={2}/>;
const WrapI    = () => <I d="M3 6h18M3 12h12M3 18h15M17 15l3-3-3-3"/>;
const TreeI    = () => <I d="M9 3v18M3 3h18v18H3z"/>;
const CodeI    = () => <I d="M16 18l6-6-6-6M8 6l-6 6 6 6" s={13}/>;
const EyeI     = () => <I d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" s={13}/>;
const ExpandI  = () => <I d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>;   // expand to full
const CollapseI= () => <I d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/>;   // collapse back

const LANG_LABEL = { js:"JavaScript",javascript:"JavaScript",ts:"TypeScript",typescript:"TypeScript",
  python:"Python",py:"Python",html:"HTML",css:"CSS",json:"JSON",bash:"Bash",sh:"Shell",
  sql:"SQL",rust:"Rust",go:"Go",java:"Java",cpp:"C++",c:"C",yaml:"YAML",yml:"YAML",
  md:"Markdown",markdown:"Markdown",text:"Plain Text",jsx:"JSX",tsx:"TSX" };

function langLabel(lang) { return LANG_LABEL[lang?.toLowerCase()] || lang || "Text"; }

/* ── Tab strip ── */
function TabStrip({ files, activeId, onSelect, onClose }) {
  return (
    <div className="flex items-center overflow-x-auto flex-shrink-0"
      style={{ background:"#161620", borderBottom:"1px solid #232330", scrollbarWidth:"none" }}>
      {files.map(f => {
        const active = f.id === activeId;
        return (
          <div key={f.id} onClick={() => onSelect(f.id)}
            className="flex items-center gap-1.5 px-3 py-2 cursor-pointer flex-shrink-0 transition-colors"
            style={{ borderRight:"1px solid #232330",
              borderBottom: active ? "2px solid #e8301f" : "2px solid transparent",
              background: active ? "#1c1c28" : "transparent" }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: langColor(f.lang) }}/>
            <span className="text-xs font-mono truncate" style={{ color: active ? "#fff" : "#8080a0", maxWidth:120 }}>{f.name}</span>
            {files.length > 1 && (
              <span onClick={e => { e.stopPropagation(); onClose(f.id); }}
                className="w-3.5 h-3.5 flex items-center justify-center text-xs flex-shrink-0"
                style={{ color:"#5a5a7a" }}
                onMouseEnter={e => { e.currentTarget.style.color="white"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#5a5a7a"; }}>×</span>
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
              style={{ color:"#3a3a4a", minWidth:38, paddingRight:10, paddingLeft:12, lineHeight:"1.65em" }}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 py-3.5 px-4 font-mono text-xs"
          style={{ color:"#c8cce8", margin:0, lineHeight:"1.65em",
            whiteSpace: wordWrap ? "pre-wrap" : "pre",
            wordBreak: wordWrap ? "break-word" : "normal",
            overflowX: wordWrap ? "hidden" : "auto" }}>
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
}

/* ── Handle button ── (the thin vertical strip on the left edge of the panel) */
function CollapseHandle({ onClick }) {
  return (
    <button onClick={onClick} title="Collapse panel"
      className="flex-shrink-0 flex items-center justify-center h-full transition-colors"
      style={{ width:16, background:"#0e0e18", borderLeft:"1px solid #1a1a2a",
        cursor:"col-resize", color:"#2a2a3a" }}
      onMouseEnter={e => { e.currentTarget.style.background="#141420"; e.currentTarget.style.color="#e8301f"; }}
      onMouseLeave={e => { e.currentTarget.style.background="#0e0e18"; e.currentTarget.style.color="#2a2a3a"; }}>
      <svg width={8} height={24} viewBox="0 0 8 24" fill="none">
        <circle cx="4" cy="8"  r="1.5" fill="currentColor"/>
        <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="4" cy="16" r="1.5" fill="currentColor"/>
      </svg>
    </button>
  );
}

/* ── Main FilePanel ── */
export default function FilePanel({ files, onClose, expanded, onToggleExpand }) {
  const [openIds,   setOpenIds]  = useState(files.length ? [files[0].id] : []);
  const [activeTab, setActiveTab]= useState(files.length ? files[0].id : null);
  const [wordWrap,  setWordWrap] = useState(false);
  const [view,      setView]     = useState("code"); // "code" | "preview"
  const [treeOpen,  setTreeOpen] = useState(true);

  // Auto-open newly-arrived files as new tabs
  useEffect(() => {
    const newFile = files.find(f => !openIds.includes(f.id));
    if (newFile) {
      setOpenIds(prev => [...prev, newFile.id]);
      setActiveTab(newFile.id);
    }
  }, [files]); // eslint-disable-line

  const closeTab = id => {
    const next = openIds.filter(x => x !== id);
    setOpenIds(next);
    if (activeTab === id) setActiveTab(next[next.length - 1] || null);
    if (next.length === 0) onClose();
  };

  const openTabs   = openIds.map(id => files.find(f => f.id === id)).filter(Boolean);
  const activeFile = files.find(f => f.id === activeTab);
  const tree       = buildFileTree(files);
  const canPreview = isPreviewable(files);
  const showTree   = files.length > 1;

  if (!activeFile) return null;

  return (
    <div className="flex h-full" style={{ background:"#0d0d12" }}>
      {/* ── collapse handle on the left edge ── */}
      <CollapseHandle onClick={onClose}/>

      {/* ── file tree ── */}
      {showTree && treeOpen && (
        <div className="flex-shrink-0 flex flex-col" style={{ width:160, borderRight:"1px solid #1e1e2a" }}>
          <div className="px-2.5 py-2 flex-shrink-0 flex items-center gap-1.5"
            style={{ borderBottom:"1px solid #1e1e2a" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider flex-1" style={{ color:"#5a5a7a" }}>Files</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree tree={tree} activeId={activeTab} onSelect={id => {
              if (!openIds.includes(id)) setOpenIds(prev => [...prev, id]);
              setActiveTab(id);
            }}/>
          </div>
        </div>
      )}

      {/* ── editor area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* top bar */}
        <div className="flex items-center justify-between px-2 py-1.5 flex-shrink-0"
          style={{ background:"#161620", borderBottom:"1px solid #1e1e2a" }}>
          <div className="flex items-center gap-1">
            {showTree && (
              <button onClick={() => setTreeOpen(v => !v)} title="Toggle file tree"
                className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                style={{ color: treeOpen ? "#e8301f" : "#6a6a8a" }}
                onMouseEnter={e=>e.currentTarget.style.background="#1e1e2a"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TreeI/>
              </button>
            )}
            <span className="text-xs font-mono" style={{ color:"#5a5a7a", paddingLeft:4 }}>
              {langLabel(activeFile.lang)} · {fmtSize(activeFile.size)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* code ↔ preview toggle */}
            {canPreview && (
              <div className="flex rounded-md p-0.5 mr-1" style={{ background:"#0d0d12", border:"1px solid #1e1e2a" }}>
                {[["code","Code",<CodeI/>],["preview","Preview",<EyeI/>]].map(([v,l,ic])=>(
                  <button key={v} onClick={()=>setView(v)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors"
                    style={{ background:view===v?"#252533":"transparent", color:view===v?"white":"#6a6a8a" }}>
                    {ic}{l}
                  </button>
                ))}
              </div>
            )}
            {/* word wrap */}
            {view==="code" && (
              <button onClick={()=>setWordWrap(v=>!v)} title="Word wrap"
                className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                style={{ color: wordWrap?"#e8301f":"#6a6a8a" }}
                onMouseEnter={e=>e.currentTarget.style.background="#1e1e2a"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <WrapI/>
              </button>
            )}
            {/* expand / collapse button */}
            <button onClick={onToggleExpand} title={expanded ? "Collapse panel" : "Expand panel"}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color:"#6a6a8a" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#1e1e2a"; e.currentTarget.style.color="white"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6a6a8a"; }}>
              {expanded ? <CollapseI/> : <ExpandI/>}
            </button>
            {/* close */}
            <button onClick={onClose} title="Close panel"
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color:"#6a6a8a" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#1e1e2a"; e.currentTarget.style.color="white"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6a6a8a"; }}>
              <CloseI/>
            </button>
          </div>
        </div>

        {/* tabs */}
        {view==="code" && files.length>1 && (
          <TabStrip files={openTabs} activeId={activeTab} onSelect={setActiveTab} onClose={closeTab}/>
        )}

        {/* content */}
        {view==="preview" && canPreview
          ? <LivePreview files={files}/>
          : <CodeView file={activeFile} wordWrap={wordWrap}/>
        }

        {/* export bar */}
        <ExportBar activeFile={activeFile} files={files}/>
      </div>
    </div>
  );
}
