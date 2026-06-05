/** Parse markdown text into segments: text | code */
export function parseSegments(text) {
  if (typeof text !== "string") text = String(text ?? "");
  const segs = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ type: "text", content: text.slice(last, m.index) });
    segs.push({ type: "code", lang: m[1] || "text", content: m[2] || "" });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ type: "text", content: text.slice(last) });
  return segs.length ? segs : [{ type: "text", content: text }];
}

/** Extract virtual file objects from parsed segments */
export function extractFiles(segments, msgId) {
  return segments
    .filter(s => s.type === "code")
    .map((s, i) => ({
      id: `${msgId}-code-${i}`,
      lang: s.lang,
      content: s.content,
      name: inferFilename(s.lang, i),
      size: new Blob([s.content]).size,
    }));
}

function inferFilename(lang, idx) {
  const map = {
    javascript:"script.js", js:"script.js", typescript:"script.ts", ts:"script.ts",
    python:"main.py", py:"main.py", html:"index.html", css:"styles.css",
    json:"data.json", bash:"run.sh", sh:"run.sh", sql:"query.sql",
    rust:"main.rs", go:"main.go", java:"Main.java", cpp:"main.cpp", c:"main.c",
    yaml:"config.yaml", yml:"config.yml", toml:"config.toml", markdown:"README.md", md:"README.md",
    text:"output.txt",
  };
  const base = map[lang?.toLowerCase()] || `file_${idx + 1}.txt`;
  return idx > 0 ? base.replace(/\./, `_${idx + 1}.`) : base;
}

/** Group sessions by time */
export function groupByTime(sessions) {
  const now = Date.now();
  const g = { Today: [], Yesterday: [], "This Week": [], Older: [] };
  sessions.forEach(s => {
    const d = now - s.ts;
    if (d < 86400000)       g.Today.push(s);
    else if (d < 172800000) g.Yesterday.push(s);
    else if (d < 604800000) g["This Week"].push(s);
    else                    g.Older.push(s);
  });
  return g;
}

/** Unique id */
export function uid() {
  return Math.random().toString(36).slice(2,9) + Date.now().toString(36);
}

/** Format file size */
export function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)}KB`;
  return `${(bytes/1024/1024).toFixed(1)}MB`;
}

/** Lang → color */
export function langColor(lang) {
  const m = {
    js:"#f7df1e", javascript:"#f7df1e", ts:"#3178c6", typescript:"#3178c6",
    python:"#3572A5", py:"#3572A5", html:"#e34c26", css:"#563d7c",
    json:"#89d96e", rust:"#dea584", go:"#00add8", java:"#b07219",
    bash:"#89e051", sh:"#89e051", sql:"#e38c00", cpp:"#f34b7d",
  };
  return m[lang?.toLowerCase()] || "rgba(255,255,255,0.35)";
}
