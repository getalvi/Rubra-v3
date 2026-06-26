import { useState } from "react";

/* ── Icons ── */
const DownI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);
const EyeI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const ZipI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>
  </svg>
);
const PanelI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18"/>
  </svg>
);
const WarnI = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
  </svg>
);

const LANG_COLOR = {
  html:"#e34c26",css:"#563d7c",js:"#f7df1e",javascript:"#f7df1e",
  ts:"#3178c6",typescript:"#3178c6",py:"#3572A5",python:"#3572A5",
  json:"#89d96e",md:"#4a90d9",markdown:"#4a90d9",jsx:"#61dafb",
  tsx:"#3178c6",sql:"#e38c00",sh:"#89e051",bash:"#89e051",txt:"#8080a0",
};
function dotColor(path) {
  const ext = (path||"").split(".").pop().toLowerCase();
  return LANG_COLOR[ext] || "#6a6a8a";
}
function langLabel(path) {
  return (path||"").split(".").pop().toUpperCase() || "FILE";
}
function fmtSize(content) {
  const b = new Blob([content||""]).size;
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}
function downloadFile(name, content) {
  const url = URL.createObjectURL(new Blob([content||""]));
  Object.assign(document.createElement("a"),{href:url,download:name}).click();
  URL.revokeObjectURL(url);
}

/* ── Single file row ── */
function FileRow({ file, onOpenPanel }) {
  const isFailed = file.failed;
  const name     = (file.path||"file").split("/").pop();
  const color    = dotColor(file.path);

  return (
    <div
      onClick={() => !isFailed && onOpenPanel?.(file)}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
      style={{
        background:"#111118", border:`1px solid ${isFailed?"#3a0808":"#1e1e2e"}`,
        cursor: isFailed ? "default" : "pointer",
      }}
      onMouseEnter={e=>{ if(!isFailed) e.currentTarget.style.borderColor="#2a2a3e"; }}
      onMouseLeave={e=>{ if(!isFailed) e.currentTarget.style.borderColor="#1e1e2e"; }}
    >
      {/* File icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background:"#1a1a2a" }}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={isFailed?"#f87171":color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate flex items-center gap-1.5"
          style={{ color: isFailed?"#f87171":"#e0e0f0" }}>
          {name}
          {isFailed && <WarnI/>}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color:"#5a5a7a" }}>
          {isFailed
            ? (file.error || "Generation failed")
            : `${langLabel(file.path)} · ${fmtSize(file.content)}`}
        </div>
      </div>

      {/* Actions */}
      {!isFailed && (
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e=>e.stopPropagation()}>
          <button onClick={() => onOpenPanel?.(file)} title="Open in panel"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color:"#6060808" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#1e1e2e"; e.currentTarget.style.color="#c0c0d8"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#606080"; }}>
            <PanelI/>
          </button>
          <button onClick={() => downloadFile(name, file.content)} title="Download"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{ background:"#1a1a2a", color:"#a0a0c0", border:"1px solid #252535" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#252535"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#1a1a2a"; e.currentTarget.style.color="#a0a0c0"; }}>
            <DownI/> Download
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main export ── */
export default function ProjectFileCards({ files, failedFiles, framework, streaming, onOpenPanel }) {
  const [zipping, setZipping] = useState(false);

  if ((!files?.length && !failedFiles?.length) || streaming) return null;

  const allFiles     = [...(files||[]), ...(failedFiles||[]).map(f=>({...f,failed:true}))];
  const successFiles = files || [];
  const isHtml       = framework==="html" || successFiles.some(f=>f.path?.endsWith(".html"));

  /* open ALL files in the side panel (shows file tree) */
  const openAll = () => {
    if (!successFiles.length) return;
    const panelFiles = successFiles.map(f => ({
      id:   f.path,
      name: f.path.split("/").pop(),
      path: f.path,
      lang: f.path.split(".").pop() || "text",
      content: f.content || "",
      size: new Blob([f.content||""]).size,
    }));
    onOpenPanel?.(panelFiles, "preview");
  };

  /* open a specific file in the side panel */
  const openOne = (file, view="code") => {
    const panelFiles = successFiles.map(f => ({
      id:   f.path,
      name: f.path.split("/").pop(),
      path: f.path,
      lang: f.path.split(".").pop() || "text",
      content: f.content || "",
      size: new Blob([f.content||""]).size,
    }));
    // Put clicked file first so it becomes the active tab
    const clicked = { id:file.path, name:file.path.split("/").pop(),
      path:file.path, lang:file.path.split(".").pop()||"text",
      content:file.content||"", size:new Blob([file.content||""]).size };
    const others  = panelFiles.filter(f => f.id !== file.path);
    onOpenPanel?.([clicked, ...others], view);
  };

  const downloadAll = async () => {
    if (!successFiles.length) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      successFiles.forEach(f => zip.file(f.path, f.content||""));
      const blob = await zip.generateAsync({ type:"blob" });
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"),{href:url,download:"project.zip"}).click();
      URL.revokeObjectURL(url);
    } finally { setZipping(false); }
  };

  return (
    <div className="mt-3 rounded-2xl overflow-hidden" style={{ border:"1px solid #1e1e2e" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5"
        style={{ background:"#0d0d14", borderBottom:"1px solid #1e1e2e" }}>
        <div className="text-xs font-semibold flex items-center gap-2" style={{ color:"#6a6a8a" }}>
          {successFiles.length} file{successFiles.length!==1?"s":""}
          {failedFiles?.length>0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background:"rgba(248,113,113,0.12)", color:"#f87171" }}>
              {failedFiles.length} failed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Preview button — opens side panel in preview mode */}
          {isHtml && (
            <button onClick={openAll}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ background:"#1a1a2a", color:"#a0a0c0", border:"1px solid #252535" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#252535"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#1a1a2a"; e.currentTarget.style.color="#a0a0c0"; }}>
              <EyeI/> Preview
            </button>
          )}
          {/* Open in panel */}
          {successFiles.length > 0 && (
            <button onClick={()=>openAll()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ background:"#1a1a2a", color:"#a0a0c0", border:"1px solid #252535" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#252535"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#1a1a2a"; e.currentTarget.style.color="#a0a0c0"; }}>
              <PanelI/> Open all
            </button>
          )}
          {/* Download all */}
          {successFiles.length > 1 && (
            <button onClick={downloadAll}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ background:"#1a1a2a", color:"#a0a0c0", border:"1px solid #252535" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#252535"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#1a1a2a"; e.currentTarget.style.color="#a0a0c0"; }}>
              <ZipI/> {zipping ? "Zipping…" : "Download all"}
            </button>
          )}
        </div>
      </div>

      {/* File rows */}
      <div className="flex flex-col gap-1.5 p-2.5" style={{ background:"#0a0a10" }}>
        {allFiles.map((f,i) => (
          <FileRow key={f.path||i} file={f} onOpenPanel={f2=>openOne(f2)}/>
        ))}
      </div>
    </div>
  );
}
