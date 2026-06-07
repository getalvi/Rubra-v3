import { useState, useEffect, useCallback } from "react";
import WaveBackground  from "../components/WaveBackground";
import Sidebar         from "../components/Sidebar/index.jsx";
import Welcome         from "../components/Welcome/index.jsx";
import MessageList     from "../components/Messages/index.jsx";
import ChatInput       from "../components/ChatInput/index.jsx";
import FilePanel       from "../components/FilePanel/index.jsx";
import AuthModal       from "../components/AuthModal";
import { useChat }     from "../hooks/useChat";
import { useAuth }     from "../hooks/useAuth";
import { parseSegments, extractFiles, uid } from "../utils/parse";

/* ── Icons ── */
const I = ({d,s=20,c="rgba(255,255,255,0.62)",sw=1.7})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const HamI  = ()=><I d="M3 6h18M3 12h18M3 18h18"/>;
const NewI  = ()=><I d="M12 5v14M5 12h14" sw={2}/>;
const GearI = ()=><I d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" s={19}/>;

function SBtn({onClick,children,title}){
  const[h,setH]=useState(false);
  return(
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:h?"rgba(255,255,255,0.08)":"transparent",border:"none",cursor:"pointer",
        width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",
        justifyContent:"center",transition:"background 0.15s",flexShrink:0}}>
      {children}
    </button>
  );
}

/* ── Loading splash ── */
function LoadingSplash(){
  return(
    <div style={{width:"100vw",height:"100dvh",display:"flex",alignItems:"center",
      justifyContent:"center",background:"#080810",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{width:22,height:22,borderRadius:"50%",
          background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
          boxShadow:"0 0 16px rgba(192,57,43,0.6)",display:"inline-block"}}/>
        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,
          color:"white",letterSpacing:"0.06em"}}>RUBRA</span>
      </div>
      <div style={{width:22,height:22,borderRadius:"50%",
        border:"2px solid rgba(255,255,255,0.12)",borderTopColor:"#e8301f",
        animation:"spin 0.8s linear infinite"}}/>
    </div>
  );
}

/* ════════════════════════════════ MAIN APP ════════════════════════════════ */
export default function App(){
  const {
    user, loading, displayName, initials,
    signUp, signIn, signOut, resetPassword,
    resetFormTimer, attemptsLeft, isLockedOut,
  } = useAuth();

  const [isMobile,   setIsMobile]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen,  setPanelOpen]  = useState(true);
  const [filePanelFiles, setFilePanelFiles] = useState([]);
  const [filePanelOpen,  setFilePanelOpen]  = useState(false);

  const {
    sessions, activeId, messages, isStreaming,
    sendMessage, newChat, selectSession, deleteSession,
    editMessage, retryMessage,
  } = useChat();

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<768);
    check(); window.addEventListener("resize",check);
    return ()=>window.removeEventListener("resize",check);
  },[]);

  /* Keyboard trap — ESC does nothing when not authed */
  useEffect(()=>{
    if(user) return;
    const trap = e=>{
      if(e.key==="Escape") e.preventDefault();
    };
    window.addEventListener("keydown", trap);
    return ()=>window.removeEventListener("keydown", trap);
  },[user]);

  const handleOpenFilePanel = useCallback(({lang,content})=>{
    const id=uid();
    const ext={javascript:"js",python:"py",html:"html",css:"css",typescript:"ts",json:"json",bash:"sh",sql:"sql",rust:"rs",go:"go"}[lang?.toLowerCase()]||"txt";
    const file={id,lang,content,name:`code.${ext}`,size:new Blob([content]).size};
    setFilePanelFiles([file]); setFilePanelOpen(true);
  },[]);

  /* ── Loading ── */
  if(loading) return <LoadingSplash/>;

  const hasMessages = messages.length > 0;
  const showRight   = filePanelOpen && filePanelFiles.length > 0 && !isMobile;

  return(
    <div style={{width:"100vw",height:"100dvh",overflow:"hidden",
      display:"flex",flexDirection:"row",position:"relative",background:"#080810"}}>

      <WaveBackground/>

      {/* ════ AUTH MODAL — always on top when not logged in ════ */}
      {!user && (
        <AuthModal
          onSignIn={signIn}
          onSignUp={signUp}
          onResetPassword={resetPassword}
          attemptsLeft={attemptsLeft}
          isLockedOut={isLockedOut}
          onFormStart={resetFormTimer}
        />
      )}

      {/* ════ DESKTOP STRIP + SIDEBAR ════ */}
      {!isMobile && (
        <>
          <div style={{
            position:"relative",zIndex:20,width:54,height:"100%",
            background:"rgba(5,4,12,0.82)",
            backdropFilter:"blur(36px)",WebkitBackdropFilter:"blur(36px)",
            borderRight:"0.5px solid rgba(255,255,255,0.075)",
            display:"flex",flexDirection:"column",alignItems:"center",
            paddingTop:12,paddingBottom:12,gap:2,flexShrink:0,
          }}>
            <SBtn onClick={()=>setPanelOpen(v=>!v)} title="Toggle sidebar"><HamI/></SBtn>
            <div style={{height:6}}/>
            <SBtn onClick={newChat} title="New chat"><NewI/></SBtn>
            <div style={{flex:1}}/>
            <SBtn title="Settings"><GearI/></SBtn>
            {user && (
              <div onClick={()=>setPanelOpen(true)} title="Profile"
                style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#c0392b,#7b241c)",
                  border:"1.5px solid rgba(255,255,255,0.18)",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:11,fontWeight:700,color:"white",marginBottom:4,userSelect:"none"}}>
                {initials}
              </div>
            )}
          </div>

          {/* Collapsible panel */}
          <div style={{position:"relative",zIndex:19,height:"100%",
            width:panelOpen?252:0,overflow:"hidden",
            transition:"width 0.3s cubic-bezier(0.22,1,0.36,1)",flexShrink:0}}>
            <div style={{width:252,height:"100%",position:"relative"}}>
              <Sidebar open={true} isMobile={false}
                onClose={()=>setPanelOpen(false)}
                onNewChat={newChat} onSelectSession={selectSession}
                onDeleteSession={deleteSession} activeSessionId={activeId}
                sessions={sessions} user={user} displayName={displayName}
                initials={initials} onSignOut={signOut}
              />
            </div>
          </div>
        </>
      )}

      {/* ════ MOBILE SIDEBAR ════ */}
      {isMobile && (
        <Sidebar open={mobileOpen} isMobile={true}
          onClose={()=>setMobileOpen(false)}
          onNewChat={newChat} onSelectSession={selectSession}
          onDeleteSession={deleteSession} activeSessionId={activeId}
          sessions={sessions} user={user} displayName={displayName}
          initials={initials} onSignOut={signOut}
        />
      )}

      {/* ════ MAIN CONTENT ════ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",
        height:"100%",overflow:"hidden",position:"relative",zIndex:5,minWidth:0}}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"12px 12px 6px",flexShrink:0}}>
            <SBtn onClick={()=>setMobileOpen(true)} title="Menu"><HamI/></SBtn>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:16,height:16,borderRadius:"50%",display:"inline-block",
                background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
                boxShadow:"0 0 10px rgba(192,57,43,0.55)"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,
                color:"white",letterSpacing:"0.06em"}}>RUBRA</span>
            </div>
            <SBtn onClick={newChat} title="New chat"><NewI/></SBtn>
          </div>
        )}

        {/* Split area */}
        <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
            {!hasMessages
              ? <Welcome isMobile={isMobile} displayName={user ? displayName : ""}/>
              : <MessageList messages={messages} onEditMessage={editMessage}
                  onRetry={retryMessage} onOpenFilePanel={handleOpenFilePanel}/>
            }
            <ChatInput onSend={sendMessage} disabled={isStreaming || !user}/>
          </div>

          {showRight && (
            <>
              <div style={{width:"0.5px",background:"rgba(255,255,255,0.075)",flexShrink:0}}/>
              <div style={{width:420,flexShrink:0,height:"100%",animation:"fadeIn 0.22s ease"}}>
                <FilePanel files={filePanelFiles}
                  onClose={()=>{setFilePanelOpen(false);setFilePanelFiles([]);}}/>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>
    </div>
  );
}
