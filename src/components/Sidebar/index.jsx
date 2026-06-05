import { useState } from "react";
import { groupByTime } from "../../utils/parse";

/* Icons */
const I = ({ d, s=18, c="rgba(255,255,255,0.6)", sw=1.6 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const HamIcon  = () => <I d="M3 6h18M3 12h18M3 18h18" c="rgba(255,255,255,0.7)"/>;
const SearchI  = () => <I d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>;
const PlusI    = () => <I d="M12 5v14M5 12h14" c="white" sw={2.2}/>;
const TrashI   = () => <I d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" c="rgba(255,100,100,0.75)" s={14}/>;
const GearI    = () => <I d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>;

function Btn({ onClick, children, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      background:"transparent", border:"none", cursor:"pointer",
      width:32, height:32, borderRadius:8,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</button>
  );
}

export default function Sidebar({ open, onClose, onNewChat, onSelectSession, onDeleteSession, activeSessionId, sessions, isMobile }) {
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState("");
  const grouped = groupByTime(
    search.trim()
      ? sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
      : sessions
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div onClick={onClose} style={{
          position:"fixed", inset:0, zIndex:48,
          background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)",
        }}/>
      )}

      <aside style={{
        position: isMobile ? "fixed" : "relative",
        inset: isMobile ? "0 auto 0 0" : undefined,
        width: "var(--sidebar-w)",
        height: "100%",
        background: "var(--bg-panel)",
        backdropFilter: "var(--blur)",
        WebkitBackdropFilter: "var(--blur)",
        borderRight: "0.5px solid var(--border)",
        display: "flex", flexDirection: "column",
        zIndex: 50, flexShrink: 0,
        transform: isMobile ? (open ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
        transition: "transform 0.3s var(--ease)",
      }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 12px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{
              width:15, height:15, borderRadius:"50%", flexShrink:0, display:"inline-block",
              background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
              boxShadow:"0 0 8px rgba(192,57,43,0.55)",
            }}/>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15.5, color:"white", letterSpacing:"0.06em" }}>RUBRA</span>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            <Btn title="Search"><SearchI /></Btn>
            <Btn onClick={onClose} title="Close"><HamIcon /></Btn>
          </div>
        </div>

        {/* New Chat */}
        <div style={{ padding:"2px 10px 12px" }}>
          <button onClick={() => { onNewChat(); if (isMobile) onClose(); }} style={{
            width:"100%", display:"flex", alignItems:"center", gap:8,
            padding:"9px 13px", borderRadius:"var(--radius-md)",
            background:"rgba(255,255,255,0.065)",
            border:"0.5px solid var(--border)",
            color:"white", cursor:"pointer",
            fontSize:13.5, fontWeight:600, fontFamily:"inherit",
            transition:"background 0.18s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.11)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.065)"}>
            <PlusI /> New Chat
          </button>
        </div>

        {/* Search box */}
        <div style={{ padding:"0 10px 10px" }}>
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,0.045)",
            border:"0.5px solid var(--border)",
            borderRadius:"var(--radius-sm)", padding:"7px 11px",
          }}>
            <SearchI />
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search sessions…"
              style={{
                flex:1, background:"transparent", border:"none", outline:"none",
                color:"var(--text-primary)", fontSize:13, fontFamily:"inherit",
              }}
            />
          </div>
        </div>

        {/* Sessions */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 8px" }}>
          {Object.entries(grouped).map(([label, items]) =>
            items.length === 0 ? null : (
              <div key={label}>
                <p style={{
                  fontSize:10.5, fontWeight:700, letterSpacing:"0.09em",
                  textTransform:"uppercase", color:"var(--text-dim)",
                  padding:"10px 8px 4px",
                }}>{label}</p>
                {items.map(s => (
                  <div
                    key={s.id}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => { onSelectSession(s.id); if (isMobile) onClose(); }}
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"8px 10px", borderRadius:"var(--radius-sm)", cursor:"pointer", marginBottom:1,
                      background: s.id === activeSessionId
                        ? "rgba(255,255,255,0.09)"
                        : hovered===s.id ? "rgba(255,255,255,0.05)" : "transparent",
                      transition:"background 0.14s",
                    }}
                  >
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.4 }}>
                        {s.title}
                      </div>
                      {s.messageCount > 0 && (
                        <div style={{ fontSize:11, color:"var(--text-dim)", marginTop:1 }}>
                          {s.messageCount} message{s.messageCount !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                    {hovered === s.id && (
                      <span
                        title="Delete"
                        onClick={e => { e.stopPropagation(); onDeleteSession(s.id); }}
                        style={{ cursor:"pointer", flexShrink:0, marginLeft:6, display:"flex", opacity:0.7, transition:"opacity 0.1s" }}
                        onMouseEnter={e=>e.currentTarget.style.opacity=1}
                        onMouseLeave={e=>e.currentTarget.style.opacity=0.7}
                      >
                        <TrashI />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
          {sessions.length === 0 && (
            <div style={{ textAlign:"center", padding:"36px 20px" }}>
              <p style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7 }}>No sessions yet.<br/>Start a new chat!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:"11px", borderTop:"0.5px solid var(--border)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:9,
            background:"rgba(255,255,255,0.055)",
            border:"0.5px solid var(--border)",
            borderRadius:20, padding:"5px 13px 5px 5px",
          }}>
            <div style={{
              width:28, height:28, borderRadius:"50%",
              background:"linear-gradient(135deg,#c0392b,#7b241c)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11.5, fontWeight:700, color:"white",
            }}>U</div>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.72)", fontWeight:500 }}>User486</span>
          </div>
          <Btn title="Settings"><GearI /></Btn>
        </div>
      </aside>
    </>
  );
}
