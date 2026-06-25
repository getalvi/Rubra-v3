import { useState } from "react";

/* ── Icons ── */
const DownloadI = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);
const EyeI = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const ZipI = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>
  </svg>
);
const WarnI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
  </svg>
);

/* Language → color dot */
const LANG_COLOR = {
  html:"#e34c26", css:"#563d7c", js:"#f7df1e", javascript:"#f7df1e",
  ts:"#3178c6", typescript:"#3178c6", py:"#3572A5", python:"#3572A5",
  json:"#89d96e", md:"#083fa1", markdown:"#083fa1", txt:"#8080a0",
  jsx:"#61dafb", tsx:"#3178c6", sql:"#e38c00", sh:"#89e051", bash:"#89e051",
};
function dotColor(path) {
  const ext = (path || "").split(".").pop().toLowerCase();
  return LANG_COLOR[ext] || "#6a6a8a";
}
function langLabel(path) {
  const ext = (path || "").split(".").pop().toUpperCase();
  return ext || "FILE";
}
function fmtSize(content) {
  const b = new Blob([content || ""]).size;
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}
function downloadFile(filename, content) {
  const url = URL.createObjectURL(new Blob([content || ""]));
  Object.assign(document.createElement("a"), { href:url, download:filename }).click();
  URL.revokeObjectURL(url);
}

/* ── Live preview for HTML projects ── */
function LivePreviewModal({ files, onClose }) {
  const html = files.find(f => f.path?.endsWith(".html") || f.path?.endsWith("index.html"));
  const css  = files.filter(f => f.path?.endsWith(".css")).map(f => f.content).join("\n");
  const js   = files.filter(f => f.path?.endsWith(".js")).map(f => f.content).join("\n");

  let doc = html?.content || "<p>No HTML file</p>";
  if (css) doc = doc.replace("</head>", `<style>${css}</style></head>`);
  if (js)  doc = doc.includes("</body>") ? doc.replace("</body>", `<script>${js}</script></body>`) : doc + `<script>${js}</script>`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background:"#0a0a0f" }}>
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ background:"#111118", borderBottom:"1px solid #1e1e2e" }}>
        <span className="text-sm font-medium" style={{ color:"#c0c0d8" }}>Live Preview</span>
        <button onClick={onClose} className="text-xs px-3 py-1 rounded-lg transition-colors"
          style={{ background:"#1a1a2a", color:"#8080a0" }}
          onMouseEnter={e=>e.currentTarget.style.color="#ffffff"}
          onMouseLeave={e=>e.currentTarget.style.color="#8080a0"}>
          Close ✕
        </button>
      </div>
      <iframe srcDoc={doc} sandbox="allow-scripts allow-forms allow-modals"
        className="flex-1 w-full border-0" style={{ background:"white" }}/>
    </div>
  );
}

/* ── Single file card (Claude-style) ── */
function FileCard({ file, onPreview }) {
  const isFailed = file.failed;
  const name     = (file.path || "file").split("/").pop();
  const color    = dotColor(file.path);

  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors"
      style={{ background:"#111118", border:`1px solid ${isFailed ? "#3a0808" : "#1e1e2e"}` }}>

      {/* File icon with lang dot */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background:"#1a1a2a", position:"relative" }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={isFailed?"#f87171":color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: isFailed ? "#f87171" : "#e0e0f0" }}>
          {name}
          {isFailed && <span className="ml-2"><WarnI/></span>}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color:"#5a5a7a" }}>
          {isFailed
            ? (file.error || "Generation failed")
            : `${langLabel(file.path)} · ${fmtSize(file.content)}`
          }
        </div>
      </div>

      {/* Action buttons */}
      {!isFailed && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onPreview && (
            <button onClick={() => onPreview(file)} title="Preview"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color:"#6a6a8a", background:"transparent" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#1e1e2e"; e.currentTarget.style.color="#c0c0d8"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6a6a8a"; }}>
              <EyeI/>
            </button>
          )}
          <button onClick={() => downloadFile(name, file.content)} title="Download"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{ background:"#1a1a2a", color:"#a0a0c0", border:"1px solid #252535" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#252535"; e.currentTarget.style.color="#ffffff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#1a1a2a"; e.currentTarget.style.color="#a0a0c0"; }}>
            <DownloadI/> Download
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main export: project file card list ── */
export default function ProjectFileCards({ files, failedFiles, framework, streaming }) {
  const [preview, setPreview] = useState(false);
  const [zipping, setZipping] = useState(false);

  if (!files?.length && !failedFiles?.length) return null;
  if (streaming) return null; // don't show while still streaming

  const allFiles    = [...(files||[]), ...(failedFiles||[]).map(f=>({...f,failed:true}))];
  const successFiles = files || [];
  const isHtml      = framework === "html" || successFiles.some(f=>f.path?.endsWith(".html"));

  const downloadAll = async () => {
    if (!successFiles.length) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      successFiles.forEach(f => zip.file(f.path || f.path?.split("/").pop() || "file.txt", f.content || ""));
      const blob = await zip.generateAsync({ type:"blob" });
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href:url, download:"project.zip" }).click();
      URL.revokeObjectURL(url);
    } finally { setZipping(false); }
  };

  return (
    <>
      {preview && <LivePreviewModal files={successFiles} onClose={() => setPreview(false)}/>}

      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border:"1px solid #1e1e2e" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5"
          style={{ background:"#0d0d14", borderBottom:"1px solid #1e1e2e" }}>
          <div className="text-xs font-semibold" style={{ color:"#6a6a8a" }}>
            {successFiles.length} file{successFiles.length !== 1 ? "s" : ""}
            {failedFiles?.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                style={{ background:"rgba(248,113,113,0.12)", color:"#f87171" }}>
                {failedFiles.length} failed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isHtml && (
              <button onClick={() => setPreview(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{ background:"#1a1a2a", color:"#a0a0c0", border:"1px solid #252535" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="#252535"; e.currentTarget.style.color="#fff"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="#1a1a2a"; e.currentTarget.style.color="#a0a0c0"; }}>
                <EyeI/> Preview
              </button>
            )}
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

        {/* File list */}
        <div className="flex flex-col gap-1.5 p-2.5" style={{ background:"#0a0a10" }}>
          {allFiles.map((f, i) => (
            <FileCard key={f.path || i} file={f}
              onPreview={isHtml && !f.failed ? () => setPreview(true) : null}
            />
          ))}
        </div>
      </div>
    </>
  );
}
