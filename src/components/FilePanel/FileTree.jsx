import { useState } from "react";

const ChevronI = ({ open }) => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .12s", flexShrink:0 }}>
    <path d="M9 6l6 6-6 6"/>
  </svg>
);
const FolderI = ({ open }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#7aa2c4" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {open
      ? <path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-9l-2-3H4a1 1 0 0 0-1 1v1z"/>
      : <path d="M3 7a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z"/>
    }
  </svg>
);
const FileDot = ({ color }) => (
  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }}/>
);

function FolderNode({ node, depth, activeId, onSelect, langColor }) {
  const [open, setOpen] = useState(true);
  const entries = Object.values(node.children).sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      {node.name && (
        <div onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 py-1 px-1.5 rounded cursor-pointer transition-colors"
          style={{ paddingLeft: depth * 12 + 6, color: "#c8c8d8" }}
          onMouseEnter={e => e.currentTarget.style.background = "#252533"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <ChevronI open={open}/>
          <FolderI open={open}/>
          <span className="text-xs truncate">{node.name}</span>
        </div>
      )}
      {open && entries.map(child =>
        child.type === "folder" ? (
          <FolderNode key={child.name} node={child} depth={depth + 1} activeId={activeId} onSelect={onSelect} langColor={langColor}/>
        ) : (
          <div key={child.file.id}
            onClick={() => onSelect(child.file.id)}
            className="flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors"
            style={{
              paddingLeft: (depth + 1) * 12 + 6,
              background: activeId === child.file.id ? "#2a2a3a" : "transparent",
              color: activeId === child.file.id ? "#ffffff" : "#a0a0b8",
            }}
            onMouseEnter={e => { if (activeId !== child.file.id) e.currentTarget.style.background = "#202028"; }}
            onMouseLeave={e => { if (activeId !== child.file.id) e.currentTarget.style.background = "transparent"; }}>
            <FileDot color={langColor(child.file.lang)}/>
            <span className="text-xs truncate">{child.name}</span>
          </div>
        )
      )}
    </div>
  );
}

export default function FileTree({ tree, activeId, onSelect }) {
  return (
    <div className="py-1.5 overflow-y-auto h-full" style={{ background:"#161620" }}>
      <FolderNode node={tree} depth={0} activeId={activeId} onSelect={onSelect}
        langColor={(lang) => {
          const m = { js:"#f7df1e", javascript:"#f7df1e", ts:"#3178c6", typescript:"#3178c6",
            python:"#3572A5", py:"#3572A5", html:"#e34c26", css:"#563d7c",
            json:"#89d96e", rust:"#dea584", go:"#00add8", java:"#b07219",
            bash:"#89e051", sh:"#89e051", sql:"#e38c00", cpp:"#f34b7d" };
          return m[lang?.toLowerCase()] || "#6a6a8a";
        }}
      />
    </div>
  );
}
