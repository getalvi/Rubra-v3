import { useState, useEffect } from "react";
import WaveBackground from "../components/WaveBackground";
import Sidebar from "../components/Sidebar";
import Welcome from "../components/Welcome";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import { useChat } from "../hooks/useChat";

/* ── Premium Icons (Using currentColor for smooth dynamic active/hover states) ── */
const HamIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);
const NewIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
  </svg>
);
const SearchIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"/>
  </svg>
);
const GearIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5}/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth={1.5}/>
  </svg>
);
const UserAvatar = () => (
  <div style={{
    width:32, height:32, borderRadius:"50%",
    background:"linear-gradient(135deg, #ff5a48, #c0392b)",
    border:"2px solid rgba(255,255,255,0.15)",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:13, fontWeight:700, color:"white", flexShrink:0,
    boxShadow: "0 2px 8px rgba(192,57,43,0.4)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
    userSelect: "none"
  }}>U</div>
);

function SideIconBtn({ onClick, children, title, special }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: special 
          ? (h ? "linear-gradient(135deg, #ff6c5c, #d34233)" : "linear-gradient(135deg, #ff5a48, #c0392b)")
          : (h ? "rgba(255,255,255,0.06)" : "transparent"),
        border:"none", cursor:"pointer",
        width:42, height:42, borderRadius:12,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", flexShrink:0,
        position: "relative",
        color: special ? "#ffffff" : (h ? "#ffffff" : "rgba(255,255,255,0.52)"),
        boxShadow: special 
          ? (h ? "0 0 16px rgba(255, 90, 72, 0.5)" : "0 0 8px rgba(192, 57, 43, 0.3)")
          : (h ? "0 4px 12px rgba(0,0,0,0.15)" : "none"),
      }}
    >
      {!special && h && (
        <div style={{
          position: "absolute", left: 0, width: 3, height: 16,
          background: "linear-gradient(to bottom, #ff5a48, #c0392b)",
          borderRadius: "0 4px 4px 0",
          boxShadow: "0 0 8px #ff5a48",
        }} />
      )}
      {children}
    </button>
  );
}

export default function App() {
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true); 
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

  // Premium keyframes for breathing core animation and subtle global styling overhauls
  const premiumStyles = `
    @keyframes rubra-pulse {
      0% { transform: scale(1); box-shadow: 0 0 12px rgba(255, 90, 72, 0.4), 0 0 24px rgba(192, 57, 43, 0.2); }
      50% { transform: scale(1.06); box-shadow: 0 0 20px rgba(255, 90, 72, 0.7), 0 0 35px rgba(192, 57, 43, 0.4); }
      100% { transform: scale(1); box-shadow: 0 0 12px rgba(255, 90, 72, 0.4), 0 0 24px rgba(192, 57, 43, 0.2); }
    }
    .rubra-core-glow {
      animation: rubra-pulse 3s infinite ease-in-out;
    }
    .avatar-hover-wrapper:hover {
      transform: scale(1.05);
      filter: brightness(1.1);
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 99px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  `;

  return (
    <div style={{
      width:"100vw", height:"100dvh", overflow:"hidden",
      display:"flex", background:"#04040c",
      position:"relative",
    }}>
      <style>{premiumStyles}</style>
      <WaveBackground />

      {/* ═══ DESKTOP ═══ */}
      {!isMobile && (
        <>
          {/* Thin left icon strip — high-end dark glassmorphism */}
          <div style={{
            position:"relative", zIndex:20, width:64, height:"100%",
            background:"rgba(6, 5, 14, 0.65)",
            backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
            borderRight:"1px solid rgba(255,255,255,0.04)",
            display:"flex", flexDirection:"column", alignItems:"center",
            paddingTop:16, paddingBottom:16, gap:6, flexShrink:0,
          }}>
            <SideIconBtn onClick={()=>setPanelOpen(v=>!v)} title="Toggle sidebar">
              <HamIcon/>
            </SideIconBtn>
            
            <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }}/>
            
            <SideIconBtn onClick={newChat} title="New chat" special={true}>
              <NewIcon/>
            </SideIconBtn>
            <SideIconBtn title="Search"><SearchIcon/></SideIconBtn>
            
            <div style={{flex:1}}/>
            
            <SideIconBtn title="Settings"><GearIcon/></SideIconBtn>
            <div style={{ height: 4 }} />
            <div className="avatar-hover-wrapper" style={{ cursor:"pointer", transition:"transform 0.2s ease" }}>
              <UserAvatar/>
            </div>
          </div>

          {/* Collapsible sidebar container with smooth bezier curve */}
          <div style={{
            position:"relative", zIndex:19, height:"100%",
            width: panelOpen ? 260 : 0,
            overflow:"hidden",
            transition:"width 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            flexShrink:0,
            background: "rgba(6, 5, 14, 0.4)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderRight: panelOpen ? "1px solid rgba(255,255,255,0.04)" : "none",
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

        {/* Mobile top bar with blurred aesthetic overlay */}
        {isMobile && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"12px 16px", flexShrink:0,
            background: "rgba(6, 5, 16, 0.6)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}>
            <SideIconBtn onClick={()=>setSidebarMobileOpen(true)} title="Menu"><HamIcon/></SideIconBtn>

            {/* Center logo with breathing animated core */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span className="rubra-core-glow" style={{
                width:12, height:12, borderRadius:"50%", display:"inline-block",
                background:"radial-gradient(circle at 35% 35%, #ff6c5c, #c0392b)",
              }}/>
              <span style={{ 
                fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19, color:"white", letterSpacing:"0.08em",
                background: "linear-gradient(135deg, #ffffff 60%, rgba(255,255,255,0.7))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                RUBRA
              </span>
            </div>

            <SideIconBtn onClick={newChat} title="New chat"><NewIcon/></SideIconBtn>
          </div>
        )}

        {/* Content container */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          {!hasMessages
            ? <Welcome isMobile={isMobile}/>
            : <MessageList
                messages={messages}
                onEditMessage={editMessage}
                onRetry={retryMessage}
              />
          }
        </div>

        {/* Input area */}
        <ChatInput onSend={sendMessage} disabled={isStreaming}/>
      </div>
    </div>
  );
}
