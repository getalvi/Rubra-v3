import { useState, useEffect } from "react";

const HamIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="rgba(255,255,255,0.75)" strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);
const SearchIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="white" strokeWidth={2.2} strokeLinecap="round"/>
  </svg>
);
const EditIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="rgba(255,100,100,0.7)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const GearIcon = () => (
  <svg width={19} height={19} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5}/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5}/>
  </svg>
);

function timeLabel(ts) {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function groupSessions(sessions) {
  const now = Date.now();
  const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };
  sessions.forEach(s => {
    const diff = now - s.ts;
    if (diff < 86400000) groups["Today"].push(s);
    else if (diff < 172800000) groups["Yesterday"].push(s);
    else if (diff < 604800000) groups["This Week"].push(s);
    else groups["Older"].push(s);
  });
  return groups;
}

export default function Sidebar({ open, onClose, onNewChat, onSelectSession, activeSessionId, sessions, onDeleteSession, isMobile }) {
  const [hovered, setHovered] = useState(null);
  const grouped = groupSessions(sessions || []);

  return (
    <>
      {isMobile && open && (
        <div onClick={onClose} style={{
          position:"fixed", inset:0,
          background:"rgba(0,0,0,0.5)",
          backdropFilter:"blur(4px)",
          zIndex:48,
        }}/>
      )}

      <aside style={{
        position: isMobile ? "fixed" : "relative",
        inset: isMobile ? "0 auto 0 0" : undefined,
        width: 260,
        height: "100%",
        background: "rgba(10,8,18,0.92)",
        backdropFilter: "blur(36px)",
        WebkitBackdropFilter: "blur(36px)",
        borderRight: "0.5px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        transform: isMobile ? (open ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        flexShrink: 0,
      }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 14px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{
              width:16, height:16, borderRadius:"50%", flexShrink:0, display:"inline-block",
              background:"radial-gradient(circle at 38% 36%,#ff5a48,#c0392b)",
              boxShadow:"0 0 8px rgba(192,57,43,0.6)",
            }}/>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"white", letterSpacing:"0.06em" }}>RUBRA</span>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            <IconBtn title="Search"><SearchIcon /></IconBtn>
            <IconBtn onClick={onClose} title="Close"><HamIcon /></IconBtn>
          </div>
        </div>

        {/* New Chat */}
        <div style={{ padding:"4px 12px 12px" }}>
          <button onClick={() => { onNewChat(); if (isMobile) onClose(); }} style={{
            width:"100%", display:"flex", alignItems:"center", gap:8,
            padding:"10px 14px",
            background:"rgba(255,255,255,0.07)",
            border:"0.5px solid rgba(255,255,255,0.12)",
            borderRadius:10, color:"white", cursor:"pointer",
            fontSize:13.5, fontWeight:600, fontFamily:"inherit",
            transition:"background 0.2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}>
            <PlusIcon /> New Chat
          </button>
        </div>

        {/* Session list */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 8px" }}>
          {Object.entries(grouped).map(([label, items]) => items.length === 0 ? null : (
            <div key={label}>
              <p style={{
                fontSize:10.5, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase",
                color:"rgba(255,255,255,0.28)", padding:"10px 8px 4px",
              }}>{label}</p>
              {items.map(s => (
                <div
                  key={s.id}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { onSelectSession(s.id); if (isMobile) onClose(); }}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 10px", borderRadius:8, cursor:"pointer", marginBottom:1,
                    background: s.id === activeSessionId
                      ? "rgba(255,255,255,0.10)"
                      : hovered === s.id ? "rgba(255,255,255,0.055)" : "transparent",
                    transition:"background 0.15s",
                  }}
                >
                  <span style={{
                    fontSize:13, color:"rgba(255,255,255,0.72)", overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, lineHeight:1.4,
                  }}>{s.title}</span>
                  {hovered === s.id && (
                    <div style={{ display:"flex", gap:4, marginLeft:6, flexShrink:0 }}>
                      <span title="Delete" onClick={e=>{e.stopPropagation();onDeleteSession(s.id)}} style={{cursor:"pointer",display:"flex"}}><TrashIcon /></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {(!sessions || sessions.length === 0) && (
            <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.25)", textAlign:"center", marginTop:32, lineHeight:1.6 }}>
              No sessions yet.<br/>Start a new chat!
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:"12px", borderTop:"0.5px solid rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            background:"rgba(255,255,255,0.06)",
            border:"0.5px solid rgba(255,255,255,0.10)",
            borderRadius:20, padding:"5px 14px 5px 5px",
          }}>
            <div style={{
              width:30, height:30, borderRadius:"50%",
              background:"linear-gradient(135deg,#c0392b,#922b21)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:"white",
            }}>U</div>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)", fontWeight:500 }}>User486</span>
          </div>
          <IconBtn title="Settings"><GearIcon /></IconBtn>
        </div>
      </aside>
    </>
  );
}

function IconBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      background:"transparent", border:"none", cursor:"pointer",
      width:34, height:34, borderRadius:8,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</button>
  );
}
