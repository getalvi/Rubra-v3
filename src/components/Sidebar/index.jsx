import { useState } from "react";
import { groupByTime } from "../../utils/parse";

/* Icons */
const Ico = ({ d, s=18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const HamI   = () => <Ico d="M3 6h18M3 12h18M3 18h18"/>;
const PlusI  = () => <Ico d="M12 5v14M5 12h14" s={16}/>;
const TrashI = () => <Ico d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" s={15}/>;
const OutI   = () => <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" s={16}/>;
const GearI  = () => <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>;

function IBtn({ onClick, children, title, className="" }) {
  return (
    <button onClick={onClick} title={title}
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100 hover:bg-[#1e1e2e] text-[#5a5a7a] hover:text-[#c0c0d8] ${className}`}>
      {children}
    </button>
  );
}

export default function Sidebar({ open, onClose, onNewChat, onSelectSession, onDeleteSession, activeSessionId, sessions, isMobile, user, displayName, initials, onSignOut }) {
  const [hov, setHov] = useState(null);
  const [q,   setQ]   = useState("");

  const filtered = q.trim() ? sessions.filter(s => s.title.toLowerCase().includes(q.toLowerCase())) : sessions;
  const grouped  = groupByTime(filtered);

  return (
    <>
      {/* mobile backdrop */}
      {isMobile && open && (
        <div onClick={onClose} className="fixed inset-0 z-40" style={{ background:"rgba(0,0,0,0.5)" }}/>
      )}

      <aside
        className="flex flex-col h-full z-50 flex-shrink-0"
        style={{
          width: 240,
          background: "#0d0d14",
          borderRight: "1px solid #1a1a2a",
          position: isMobile ? "fixed" : "relative",
          inset:  isMobile ? "0 auto 0 0" : undefined,
          transform: isMobile ? (open ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
          transition: isMobile ? "transform .25s ease" : "none",
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-3.5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ background: "radial-gradient(circle at 38% 36%,#ff5540,#c0392b)" }}/>
            <span className="font-display font-extrabold text-sm text-white tracking-wider">RUBRA</span>
          </div>
          <IBtn onClick={onClose} title="Close"><HamI/></IBtn>
        </div>

        {/* new chat */}
        <div className="px-3 mb-2">
          <button onClick={() => { onNewChat(); if (isMobile) onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-100"
            style={{ background:"#1a1a2a", color:"#c0c0d8", border:"1px solid #222238" }}
            onMouseEnter={e => e.currentTarget.style.background="#222238"}
            onMouseLeave={e => e.currentTarget.style.background="#1a1a2a"}>
            <PlusI/> New Chat
          </button>
        </div>

        {/* search */}
        <div className="px-3 mb-3">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search sessions…"
            className="w-full px-3 py-1.5 text-xs rounded-md outline-none transition-colors"
            style={{ background:"#111118", border:"1px solid #1a1a2a", color:"#8080a0" }}
            onFocus={e => e.target.style.borderColor="#2a2a4a"}
            onBlur={e  => e.target.style.borderColor="#1a1a2a"}
          />
        </div>

        {/* sessions */}
        <div className="flex-1 overflow-y-auto px-2">
          {Object.entries(grouped).map(([label, items]) =>
            items.length === 0 ? null : (
              <div key={label}>
                <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color:"#2e2e4e" }}>{label}</p>
                {items.map(s => (
                  <div key={s.id}
                    onMouseEnter={() => setHov(s.id)} onMouseLeave={() => setHov(null)}
                    onClick={() => { onSelectSession(s.id); if (isMobile) onClose(); }}
                    className="flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors duration-100"
                    style={{ background: s.id === activeSessionId ? "#1a1a2a" : hov === s.id ? "#141420" : "transparent" }}
                  >
                    <span className="text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-1"
                      style={{ color: s.id === activeSessionId ? "#c0c0d8" : "#6a6a8a" }}>
                      {s.title}
                    </span>
                    {hov === s.id && (
                      <span onClick={e => { e.stopPropagation(); onDeleteSession(s.id); }}
                        className="flex-shrink-0 text-[#5a2a2a] hover:text-[#f87171] transition-colors">
                        <TrashI/>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
          {sessions.length === 0 && (
            <p className="text-center text-xs py-8" style={{ color:"#2e2e4e" }}>
              No sessions yet.<br/>Start a new chat.
            </p>
          )}
        </div>

        {/* footer */}
        <div className="px-3 py-3 flex items-center justify-between" style={{ borderTop:"1px solid #1a1a2a" }}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background:"linear-gradient(135deg,#c0392b,#7b241c)" }}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap" style={{ color:"#8080a0" }}>{displayName}</div>
              <div className="text-[10px] text-ellipsis overflow-hidden whitespace-nowrap" style={{ color:"#3a3a55" }}>{user?.email}</div>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <IBtn title="Settings"><GearI/></IBtn>
            <IBtn onClick={onSignOut} title="Sign out" className="hover:text-[#f87171]"><OutI/></IBtn>
          </div>
        </div>
      </aside>
    </>
  );
}
