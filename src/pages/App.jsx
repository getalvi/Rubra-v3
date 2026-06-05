import { useState, useEffect, useCallback } from "react";
import WaveBackground    from "../components/WaveBackground";
import Sidebar           from "../components/Sidebar/index.jsx";
import Welcome           from "../components/Welcome/index.jsx";
import MessageList       from "../components/Messages/index.jsx";
import ChatInput         from "../components/ChatInput/index.jsx";
import FilePanel         from "../components/FilePanel/index.jsx";
import { useChat }       from "../hooks/useChat";
import { parseSegments, extractFiles, uid } from "../utils/parse";

/* ── Top-bar icons ── */
const HamI = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="rgba(255,255,255,0.7)" strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);
const NewI = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round"/>
  </svg>
);
const SearchI = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="rgba(255,255,255,0.48)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const GearI = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.46)" strokeWidth={1.5}/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="rgba(255,255,255,0.46)" strokeWidth={1.5}/>
  </svg>
);
const UserAv = () => (
  <div style={{
    width:30, height:30, borderRadius:"50%",
    background:"linear-gradient(135deg,#c0392b,#7b241c)",
    border:"1.5px solid rgba(255,255,255,0.16)",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:12, fontWeight:700, color:"white", flexShrink:0,
  }}>U</div>
);

function SBtn({ onClick, children, title }) {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: h ? "rgba(255,255,255,0.08)" : "transparent",
        border:"none", cursor:"pointer",
        width:40, height:40, borderRadius:10,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"background 0.15s", flexShrink:0,
      }}
    >{children}</button>
  );
}

export default function App() {
  const [isMobile,     setIsMobile]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [panelOpen,    setPanelOpen]    = useState(true);   // desktop sidebar panel
  const [filePanelFiles, setFilePanelFiles] = useState([]); // files in right panel
  const [filePanelOpen,  setFilePanelOpen]  = useState(false);

  const {
    sessions, activeId, messages, isStreaming,
    sendMessage, newChat, selectSession, deleteSession,
    editMessage, retryMessage,
  } = useChat();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Collect all code files from all messages for file panel */
  const allFiles = messages.flatMap(msg => {
    if (msg.role !== "assistant" || !msg.content) return [];
    const segs = parseSegments(typeof msg.content === "string" ? msg.content : "");
    return extractFiles(segs, msg.id);
  });

  /* Open file panel with a specific file (from "Open in panel" button) */
  const handleOpenFilePanel = useCallback(({ lang, content }) => {
    const id = uid();
    const file = {
      id, lang, content,
      name: lang === "javascript" ? "script.js" : lang === "python" ? "main.py" :
            lang === "html" ? "index.html" : lang === "css" ? "styles.css" :
            lang === "typescript" ? "script.ts" : `code.${lang || "txt"}`,
      size: new Blob([content]).size,
    };
    setFilePanelFiles([file]);
    setFilePanelOpen(true);
  }, []);

  const hasMessages = messages.length > 0;
  const showRightPanel = filePanelOpen && filePanelFiles.length > 0 && !isMobile;

  return (
    <div style={{
      width:"100vw", height:"100dvh", overflow:"hidden",
      display:"flex", flexDirection:"row",
      position:"relative", background:"var(--bg)",
    }}>
      <WaveBackground />

      {/* ════ DESKTOP ════ */}
      {!isMobile && (
        <>
          {/* Icon strip */}
          <div style={{
            position:"relative", zIndex:20,
            width:"var(--strip-w)", height:"100%",
            background:"rgba(5,4,12,0.82)",
            backdropFilter:"var(--blur)", WebkitBackdropFilter:"var(--blur)",
            borderRight:"0.5px solid var(--border)",
            display:"flex", flexDirection:"column", alignItems:"center",
            paddingTop:12, paddingBottom:12, gap:2, flexShrink:0,
          }}>
            <SBtn onClick={()=>setPanelOpen(v=>!v)} title="Toggle sidebar"><HamI/></SBtn>
            <div style={{height:6}}/>
            <SBtn onClick={newChat} title="New chat"><NewI/></SBtn>
            <SBtn title="Search"><SearchI/></SBtn>
            <div style={{flex:1}}/>
            <SBtn title="Settings"><GearI/></SBtn>
            <SBtn title="Profile"><UserAv/></SBtn>
          </div>

          {/* Collapsible sidebar panel */}
          <div style={{
            position:"relative", zIndex:19, height:"100%",
            width: panelOpen ? "var(--sidebar-w)" : 0,
            overflow:"hidden",
            transition:"width 0.32s var(--ease)",
            flexShrink:0,
          }}>
            <div style={{ width:"var(--sidebar-w)", height:"100%", position:"relative" }}>
              <Sidebar
                open={true} isMobile={false}
                onClose={()=>setPanelOpen(false)}
                onNewChat={newChat}
                onSelectSession={selectSession}
                onDeleteSession={deleteSession}
                activeSessionId={activeId}
                sessions={sessions}
              />
            </div>
          </div>
        </>
      )}

      {/* ════ MOBILE SIDEBAR ════ */}
      {isMobile && (
        <Sidebar
          open={mobileOpen} isMobile={true}
          onClose={()=>setMobileOpen(false)}
          onNewChat={newChat}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          activeSessionId={activeId}
          sessions={sessions}
        />
      )}

      {/* ════ MAIN CONTENT ════ */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        height:"100%", overflow:"hidden",
        position:"relative", zIndex:5, minWidth:0,
      }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"13px 13px 7px", flexShrink:0,
          }}>
            <SBtn onClick={()=>setMobileOpen(true)} title="Menu"><HamI/></SBtn>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{
                width:17, height:17, borderRadius:"50%", display:"inline-block",
                background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
                boxShadow:"0 0 10px rgba(192,57,43,0.55)",
              }}/>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:"white", letterSpacing:"0.06em" }}>RUBRA</span>
            </div>
            <SBtn onClick={newChat} title="New chat"><NewI/></SBtn>
          </div>
        )}

        {/* Split area: chat + optional right file panel */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

          {/* Chat column */}
          <div style={{
            flex:1, display:"flex", flexDirection:"column",
            overflow:"hidden", minWidth:0,
            transition:"flex 0.3s var(--ease)",
          }}>
            {!hasMessages
              ? <Welcome isMobile={isMobile}/>
              : <MessageList
                  messages={messages}
                  onEditMessage={editMessage}
                  onRetry={retryMessage}
                  onOpenFilePanel={handleOpenFilePanel}
                />
            }
            <ChatInput onSend={sendMessage} disabled={isStreaming}/>
          </div>

          {/* Right file panel */}
          {showRightPanel && (
            <>
              {/* Divider */}
              <div style={{ width:"0.5px", background:"var(--border)", flexShrink:0 }}/>
              <div style={{
                width:"var(--panel-w)", flexShrink:0, height:"100%",
                animation:"fadeIn 0.22s var(--ease)",
              }}>
                <FilePanel
                  files={filePanelFiles}
                  onClose={() => { setFilePanelOpen(false); setFilePanelFiles([]); }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
