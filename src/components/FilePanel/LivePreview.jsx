import { useMemo, useRef, useState } from "react";

/** Determine if a set of files is previewable (contains HTML, or JS+CSS combo) */
export function isPreviewable(files) {
  return files.some(f => f.lang?.toLowerCase() === "html");
}

/** Build a single-document HTML preview by inlining matched CSS/JS siblings */
function buildPreviewDoc(files) {
  const html = files.find(f => f.lang?.toLowerCase() === "html");
  if (!html) return null;

  const cssFiles = files.filter(f => f.lang?.toLowerCase() === "css");
  const jsFiles  = files.filter(f => ["javascript","js"].includes(f.lang?.toLowerCase()));

  let doc = html.content;

  // If the HTML doesn't already have <style>/<script>, inject sibling CSS/JS
  const styleTag  = cssFiles.map(f => `<style>${f.content}</style>`).join("\n");
  const scriptTag = jsFiles.map(f => `<script>${f.content}</script>`).join("\n");

  if (!/<\/head>/i.test(doc)) doc = `<head></head>${doc}`;
  doc = doc.replace(/<\/head>/i, `${styleTag}</head>`);

  if (/<\/body>/i.test(doc)) doc = doc.replace(/<\/body>/i, `${scriptTag}</body>`);
  else doc += scriptTag;

  return doc;
}

export default function LivePreview({ files }) {
  const [reloadKey, setReloadKey] = useState(0);
  const doc = useMemo(() => buildPreviewDoc(files), [files, reloadKey]);

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs" style={{ color:"#5a5a7a" }}>
        No HTML file to preview
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background:"#ffffff" }}>
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ background:"#161620", borderBottom:"1px solid #232330" }}>
        <span className="text-[11px]" style={{ color:"#6a6a8a" }}>Live Preview</span>
        <button onClick={() => setReloadKey(k => k + 1)}
          className="text-[11px] px-2 py-0.5 rounded transition-colors"
          style={{ color:"#8080a0" }}
          onMouseEnter={e => e.currentTarget.style.background="#232330"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
          ⟲ Refresh
        </button>
      </div>
      <iframe
        key={reloadKey}
        srcDoc={doc}
        sandbox="allow-scripts allow-modals allow-forms"
        title="Live preview"
        className="flex-1 w-full border-0"
        style={{ background:"white" }}
      />
    </div>
  );
}
