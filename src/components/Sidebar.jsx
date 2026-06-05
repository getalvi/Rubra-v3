import { useState } from "react";

/* ── Icons ── */
const Icon = ({ d, size = 18, stroke = "rgba(255,255,255,0.65)", sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HamIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="rgba(255,255,255,0.75)" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);
const SearchIcon = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" stroke="white" sw={2} />;
const DotsIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);
const GearIcon = () => <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={14} stroke="rgba(255,100,100,0.7)" />;

const SAMPLE_SESSIONS = [
  { id: "s1", title: "How to become a developer" },
  { id: "s2", title: "Making top Notch web apps" },
  { id: "s3", title: "Today's research about AI" },
  { id: "s4", title: "How to become productive" },
];

export default function Sidebar({ open, onClose, onNewChat, onSelectSession, activeSessionId, isMobile }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <>
      {/* Backdrop on mobile */}
      {isMobile && open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
            zIndex: 48,
          }}
        />
      )}

      <aside
        style={{
          position: isMobile ? "fixed" : "relative",
          inset: isMobile ? "0 auto 0 0" : undefined,
          width: 256,
          height: "100%",
          background: "rgba(12,10,16,0.90)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderRight: "0.5px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transform: isMobile ? (open ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
          transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
          flexShrink: 0,
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 14px 12px" }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:"white", letterSpacing:"0.06em" }}>
            RUBRA
          </span>
          <div style={{ display:"flex", gap:4 }}>
            <Btn><SearchIcon /></Btn>
            <Btn onClick={onClose}><HamIcon /></Btn>
          </div>
        </div>

        {/* ── New Chat ── */}
        <div style={{ padding:"0 12px 14px" }}>
          <button
            onClick={() => { onNewChat(); if (isMobile) onClose(); }}
            style={{
              width:"100%", display:"flex", alignItems:"center", gap:8,
              padding:"10px 14px",
              background:"rgba(255,255,255,0.06)",
              border:"0.5px solid rgba(255,255,255,0.11)",
              borderRadius:12, color:"white", cursor:"pointer",
              fontSize:14, fontWeight:600, fontFamily:"'Inter',sans-serif",
              transition:"background 0.2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.11)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          >
            <PlusIcon /> New Chat
          </button>
        </div>

        {/* ── Sessions ── */}
        <div style={{ padding:"0 10px", flex:1 }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.30)", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", marginBottom:6, paddingLeft:6 }}>
            Sessions
          </p>
          {SAMPLE_SESSIONS.map((s) => (
            <div
              key={s.id}
              onMouseEnter={()=>setHoveredId(s.id)}
              onMouseLeave={()=>setHoveredId(null)}
              onClick={()=>{ onSelectSession?.(s.id); if(isMobile) onClose(); }}
              style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"9px 10px", borderRadius:10, cursor:"pointer", marginBottom:2,
                background: s.id === activeSessionId ? "rgba(255,255,255,0.09)" : hoveredId===s.id ? "rgba(255,255,255,0.05)" : "transparent",
                transition:"background 0.15s",
              }}
            >
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.70)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                {s.title}
              </span>
              {hoveredId===s.id && (
                <span style={{ marginLeft:6, flexShrink:0, display:"flex", gap:4 }}>
                  <span title="Delete" style={{ cursor:"pointer" }}>
                    <TrashIcon />
                  </span>
                  <DotsIcon />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding:"12px",
          borderTop:"0.5px solid rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            background:"rgba(255,255,255,0.06)",
            border:"0.5px solid rgba(255,255,255,0.10)",
            borderRadius:20,
            padding:"5px 14px 5px 5px",
          }}>
            <div style={{
              width:30, height:30, borderRadius:"50%",
              background:"linear-gradient(135deg,#c0392b,#922b21)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:"white",
            }}>U</div>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)", fontWeight:500 }}>User486</span>
          </div>
          <Btn><GearIcon /></Btn>
        </div>
      </aside>
    </>
  );
}

function Btn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background:"transparent", border:"none", cursor:"pointer",
        padding:7, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
      }}
    >
      {children}
    </button>
  );
}
