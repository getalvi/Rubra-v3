import { useState, useEffect } from "react";
import WaveBackground from "../components/WaveBackground";
import Sidebar from "../components/Sidebar";
import Welcome from "../components/Welcome";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import { useChat } from "../hooks/useChat";

/* ── Icons ── */
const HamIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="rgba(255,255,255,0.72)" strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);
const NewIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="rgba(255,255,255,0.72)" strokeWidth={2} strokeLinecap="round"/>
  </svg>
);
const SearchIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="rgba(255,255,255,0.50)" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const GearIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.48)" strokeWidth={1.5}/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="rgba(255,255,255,0.48)" strokeWidth={1.5}/>
  </svg>
);
const UserAvatar = () => (
  <div style={{
    width:30, height:30, borderRadius:"50%",
    background:"linear-gradient(135deg,#c0392b,#922b21)",
    border:"1.5px solid rgba(255,255,255,0.18)",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:12, fontWeight:700, color:"white", flexShrink:0,
  }}>U</div>
);

function SideIconBtn({ onClick, children, title }) {
  const [h, setH] = useState(false);
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
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true); // desktop panel default open
  const [isMobile, setIsMobile] = useState(false);

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

  const hasMessages = messages.length > 0;

  return (
    <div style={{
      width:"100vw", height:"100dvh", overflow:"hidden",
      display:"flex", background:"#060610",
      position:"relative",
    }}>
      <WaveBackground />

      {/* ═══ DESKTOP ═══ */}
      {!isMobile && (
        <>
          {/* Thin icon strip — always visible */}
          <div style={{
            position:"relative", zIndex:20, width:56, height:"100%",
            background:"rgba(6,5,14,0.80)",
            backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
            borderRight:"0.5px solid rgba(255,255,255,0.07)",
            display:"flex", flexDirection:"column", alignItems:"center",
            paddingTop:12, paddingBottom:12, gap:2, flexShrink:0,
          }}>
            <SideIconBtn onClick={()=>setPanelOpen(v=>!v)} title="Toggle sidebar">
              <HamIcon/>
            </SideIconBtn>
            <div style={{height:6}}/>
            <SideIconBtn onClick={newChat} title="New chat"><NewIcon/></SideIconBtn>
            <SideIconBtn title="Search"><SearchIcon/></SideIconBtn>
            <div style={{flex:1}}/>
            <SideIconBtn title="Settings"><GearIcon/></SideIconBtn>
            <SideIconBtn title="Profile"><UserAvatar/></SideIconBtn>
          </div>

          {/* Collapsible panel */}
          <div style={{
            position:"relative", zIndex:19, height:"100%",
            width: panelOpen ? 260 : 0,
            overflow:"hidden",
            transition:"width 0.32s cubic-bezier(0.22,1,0.36,1)",
            flexShrink:0,
          }}>
            <div style={{ width:260, height:"100%", position:"relative" }}>
              <Sidebar
                open={true}
                onClose={()=>setPanelOpen(false)}
                onNewChat={newChat}
                onSelectSession={selectSession}
                onDeleteSession={deleteSession}
                activeSessionId={activeId}
                sessions={sessions}
                isMobile={false}
              />
            </div>
          </div>
        </>
      )}

      {/* ═══ MOBILE SIDEBAR ═══ */}
      {isMobile && (
        <Sidebar
          open={sidebarMobileOpen}
          onClose={()=>setSidebarMobileOpen(false)}
          onNewChat={newChat}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          activeSessionId={activeId}
          sessions={sessions}
          isMobile={true}
        />
      )}

      {/* ═══ MAIN AREA ═══ */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        height:"100%", overflow:"hidden",
        position:"relative", zIndex:5, minWidth:0,
      }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"14px 14px 8px", flexShrink:0,
          }}>
            <SideIconBtn onClick={()=>setSidebarMobileOpen(true)} title="Menu"><HamIcon/></SideIconBtn>

            {/* Center logo */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{
                width:18, height:18, borderRadius:"50%", display:"inline-block",
                background:"radial-gradient(circle at 38% 36%,#ff5a48,#c0392b)",
                boxShadow:"0 0 10px rgba(192,57,43,0.6)",
              }}/>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"white", letterSpacing:"0.06em" }}>
                RUBRA
              </span>
            </div>

            <SideIconBtn onClick={newChat} title="New chat"><NewIcon/></SideIconBtn>
          </div>
        )}

        {/* Content */}
        {!hasMessages
          ? <Welcome isMobile={isMobile}/>
          : <MessageList
              messages={messages}
              onEditMessage={editMessage}
              onRetry={retryMessage}
            />
        }

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isStreaming}/>
      </div>
    </div>
  );
}
