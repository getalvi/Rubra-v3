import { useState } from "react";

const Ico = ({ d, s=13 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const CopyI = ({ ok }) => ok
  ? <Ico d="M20 6L9 17l-5-5"/>
  : <Ico d="M8 17.9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M10 21h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/>;
const DownI = () => <Ico d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>;
const ZipI  = () => <Ico d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>;

function Btn({ onClick, children, title }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors"
      style={{ background: h ? "#252533" : "transparent", color:"#9090b0" }}>
      {children}
    </button>
  );
}

const extMap = { javascript:"js", typescript:"ts", python:"py", html:"html", css:"css",
  json:"json", bash:"sh", sql:"sql", rust:"rs", go:"go", java:"java", cpp:"cpp" };

export default function ExportBar({ activeFile, files }) {
  const [copied,   setCopied]   = useState(false);
  const [zipping,  setZipping]  = useState(false);

  const copy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const downloadFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = activeFile.name; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadZip = async () => {
    if (!files?.length) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      files.forEach(f => zip.file(f.path || f.name, f.content));
      const blob = await zip.generateAsync({ type:"blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "project.zip"; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0" style={{ background:"#161620", borderTop:"1px solid #232330" }}>
      <Btn onClick={copy} title="Copy current file">
        <span style={{ color: copied ? "#22c55e" : "currentColor" }}><CopyI ok={copied}/></span>
        {copied ? "Copied" : "Copy"}
      </Btn>
      <Btn onClick={downloadFile} title="Download current file"><DownI/> File</Btn>
      {files?.length > 1 && (
        <Btn onClick={downloadZip} title="Download all files as ZIP">
          <ZipI/> {zipping ? "Zipping…" : "Project ZIP"}
        </Btn>
      )}
    </div>
  );
}
