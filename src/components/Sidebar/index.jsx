import { useState, useRef, useEffect } from "react";
import { groupByTime } from "../../utils/parse";

/* ── Icons ── */
const Ico = ({ d, s=18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const HamI   = () => <Ico d="M3 6h18M3 12h18M3 18h18"/>;
const PlusI  = () => <Ico d="M12 5v14M5 12h14" s={18}/>;
const TrashI = () => <Ico d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" s={14}/>;
const PenI   = () => <Ico d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" s={14}/>;
const OutI   = () => <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" s={16}/>;
const GearI  = () => <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>;
const FolderI = () => <Ico d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" s={16}/>;
const NewI   = () => <Ico d="M12 5v14M5 12h14" s={20}/>;
const SearchI= () => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" s={18}/>;

function IconBtn({ onClick, children, title, className="" }) {
  return (
    <button onClick={onClick} title={title}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-100 hover:bg-[#2a2a2a] text-[#b0b0c0] hover:text-white flex-shrink-0 ${className}`}>
      {children}
    </button>
  );
}

/**
 * Sidebar — CSS-Grid driven, fluid-reflow.
 *
 * Parent layout must use:
 *   display: grid;
 *   grid-template-columns: <60px|260px> 1fr;
 *   transition: grid-template-columns 0.3s ease;
 *
 * This component renders the FIRST grid column.
 * `expanded` (boolean) + `onToggle` are controlled from the parent (App.jsx).
 */
export default function Sidebar({
  expanded, onToggle,
  onNewChat, onStartProject, onSelectSession, onDeleteSession, onRenameSession,
  activeSessionId, sessions,
  isMobile, mobileOpen, onMobileClose,
  user, displayName, initials, onSignOut,
}) {
  const [hov, setHov]       = useState(null);
  const [q, setQ]           = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal]   = useState("");
  const inputRef = useRef(null);

  const filtered = q.trim() ? sessions.filter(s => s.title.toLowerCase().includes(q.toLowerCase())) : sessions;
  const grouped  = groupByTime(filtered);

  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const startRename = (s) => { setRenamingId(s.id); setRenameVal(s.title); };
  const commitRename = () => {
    const val = renameVal.trim();
    if (val && renamingId) onRenameSession?.(renamingId, val);
    setRenamingId(null);
  };
  const cancelRename = () => setRenamingId(null);

  /* On mobile the sidebar is a fixed overlay that slides in/out (always "expanded" width) */
  const isOpenMobile = isMobile && mobileOpen;
  const showExpanded = isMobile ? isOpenMobile : expanded;

  return (
    <>
      {/* mobile backdrop */}
      {isMobile && mobileOpen && (
        <div onClick={onMobileClose} className="fixed inset-0 z-40" style={{ background:"rgba(0,0,0,0.5)" }}/>
      )}

      <aside
        className="h-full flex flex-col overflow-hidden"
        style={{
          background: "#1e1e1e",
          borderRight: "1px solid #2a2a2a",
          position: isMobile ? "fixed" : "relative",
          inset: isMobile ? "0 auto 0 0" : undefined,
          width: isMobile ? 260 : "100%",
          zIndex: 50,
          transform: isMobile ? (isOpenMobile ? "translateX(0)" : "translateX(-100%)") : "none",
          transition: isMobile ? "transform 0.3s ease" : "none",
        }}
      >
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center flex-shrink-0 px-2.5 py-3"
          style={{ justifyContent: showExpanded ? "space-between" : "center" }}>
          {showExpanded && (
            <div className="flex items-center gap-2 px-1.5 overflow-hidden">
              <span className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ background: "radial-gradient(circle at 38% 36%,#ff5540,#c0392b)" }}/>
              <span className="font-display font-extrabold text-sm text-white tracking-wider whitespace-nowrap">RUBRA</span>
            </div>
          )}
          <IconBtn onClick={isMobile ? onMobileClose : onToggle} title={showExpanded ? "Collapse sidebar" : "Expand sidebar"}>
            <HamI/>
          </IconBtn>
        </div>

        {/* ═══ NEW CHAT + PROJECT ═══ */}
        <div className="px-2.5 mb-2 flex-shrink-0 flex flex-col gap-1.5">
          {showExpanded ? (
            <>
              <button
                onClick={() => { onNewChat(); if (isMobile) onMobileClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap overflow-hidden transition-colors duration-150"
                style={{ background:"#7b241c", color:"#ffffff" }}
                onMouseEnter={e => e.currentTarget.style.background="#5e1b15"}
                onMouseLeave={e => e.currentTarget.style.background="#7b241c"}
              >
                <PlusI/> New Chat
              </button>
              <button
                onClick={() => { onStartProject?.(); if (isMobile) onMobileClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap overflow-hidden transition-colors duration-150"
                style={{ background:"#161624", color:"#a0a0c0", border:"1px solid #252535" }}
                onMouseEnter={e => { e.currentTarget.style.background="#1e1e30"; e.currentTarget.style.color="#ffffff"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#161624"; e.currentTarget.style.color="#a0a0c0"; }}
              >
                <FolderI/> Project
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => { onNewChat(); }}
                title="New chat"
                className="w-9 h-9 mx-auto flex items-center justify-center rounded-lg transition-colors duration-150"
                style={{ background:"#7b241c", color:"#ffffff" }}
                onMouseEnter={e => e.currentTarget.style.background="#5e1b15"}
                onMouseLeave={e => e.currentTarget.style.background="#7b241c"}
              >
                <PlusI/>
              </button>
              <button
                onClick={() => { onStartProject?.(); }}
                title="Project"
                className="w-9 h-9 mx-auto flex items-center justify-center rounded-lg transition-colors duration-150"
                style={{ background:"#161624", color:"#8080a0", border:"1px solid #252535" }}
                onMouseEnter={e => { e.currentTarget.style.background="#1e1e30"; e.currentTarget.style.color="#ffffff"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#161624"; e.currentTarget.style.color="#8080a0"; }}
              >
                <FolderI/>
              </button>
            </div>
          )}
        </div>

        {/* ═══ SEARCH (expanded only) ═══ */}
        {showExpanded ? (
          <div className="px-2.5 mb-3 flex-shrink-0">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6a6a6a]"><SearchI/></span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search sessions…"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md outline-none transition-colors"
                style={{ background:"#161616", border:"1px solid #2a2a2a", color:"#e8e8f0" }}
                onFocus={e => e.target.style.borderColor="#3a3a3a"}
                onBlur={e  => e.target.style.borderColor="#2a2a2a"}
              />
            </div>
          </div>
        ) : (
          <div className="mb-3 flex-shrink-0 flex justify-center">
            <IconBtn title="Search"><SearchI/></IconBtn>
          </div>
        )}

        {/* ═══ SESSION LIST ═══ */}
        <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll"
          style={{ paddingLeft: showExpanded ? 10 : 0, paddingRight: showExpanded ? 10 : 0 }}>
          {showExpanded ? (
            <>
              {Object.entries(grouped).map(([label, items]) =>
                items.length === 0 ? null : (
                  <div key={label}>
                    <p className="px-2 py-1.5 text-xs uppercase tracking-wider text-gray-500 font-semibold whitespace-nowrap">
                      {label}
                    </p>
                    {items.map(s => (
                      <div key={s.id}
                        onMouseEnter={() => setHov(s.id)} onMouseLeave={() => setHov(null)}
                        onClick={() => { if (renamingId !== s.id) { onSelectSession(s.id); if (isMobile) onMobileClose(); } }}
                        className="group flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors duration-100"
                        style={{ background: s.id === activeSessionId ? "#2a2a2a" : hov === s.id ? "#242424" : "transparent" }}
                      >
                        {renamingId === s.id ? (
                          <input
                            ref={inputRef}
                            value={renameVal}
                            onChange={e => setRenameVal(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") cancelRename();
                            }}
                            onBlur={commitRename}
                            className="text-xs flex-1 bg-transparent outline-none rounded px-1 -mx-1"
                            style={{ color:"#e8e8f0", border:"1px solid #3a3a3a" }}
                          />
                        ) : (
                          <span className="text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-1"
                            style={{ color: s.id === activeSessionId ? "#ffffff" : "#c0c0c0" }}>
                            {s.title}
                          </span>
                        )}

                        {renamingId !== s.id && (
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                            <span onClick={e => { e.stopPropagation(); startRename(s); }}
                              className="text-[#9090a0] hover:text-white transition-colors" title="Rename">
                              <PenI/>
                            </span>
                            <span onClick={e => { e.stopPropagation(); onDeleteSession(s.id); }}
                              className="text-[#9090a0] hover:text-[#f87171] transition-colors" title="Delete">
                              <TrashI/>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
              {sessions.length === 0 && (
                <p className="text-center text-xs py-8 whitespace-nowrap" style={{ color:"#6a6a6a" }}>
                  No sessions yet.<br/>Start a new chat.
                </p>
              )}
            </>
          ) : (
            /* Collapsed: show small dots for recent sessions (icon-only dock) */
            <div className="flex flex-col items-center gap-1.5 pt-1">
              {sessions.slice(0, 8).map(s => (
                <button key={s.id} onClick={() => onSelectSession(s.id)} title={s.title}
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
                  style={{ background: s.id === activeSessionId ? "#e8301f" : "#3a3a3a" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ═══ FOOTER / PROFILE ═══ */}
        <div className="flex-shrink-0 border-t border-[#2a2a2a]"
          style={{ padding: showExpanded ? "12px 10px" : "12px 0" }}>
          {showExpanded ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background:"linear-gradient(135deg,#c0392b,#7b241c)" }}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-ellipsis overflow-hidden whitespace-nowrap" style={{ color:"#ffffff" }}>{displayName}</div>
                  <div className="text-[10px] text-ellipsis overflow-hidden whitespace-nowrap" style={{ color:"#8888a0" }}>{user?.email}</div>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <IconBtn title="Settings"><GearI/></IconBtn>
                <IconBtn onClick={onSignOut} title="Sign out" className="hover:text-[#f87171]"><OutI/></IconBtn>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white cursor-pointer"
                onClick={onToggle} title={displayName}
                style={{ background:"linear-gradient(135deg,#c0392b,#7b241c)" }}>
                {initials}
              </div>
              <IconBtn onClick={onSignOut} title="Sign out" className="hover:text-[#f87171]"><OutI/></IconBtn>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 6px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #4a4a4a; }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #3a3a3a transparent; }
      `}</style>
    </>
  );
}
