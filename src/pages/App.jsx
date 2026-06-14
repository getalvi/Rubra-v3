import { useState, useEffect, useCallback } from "react";
import WaveBackground from "../components/WaveBackground";
import Sidebar        from "../components/Sidebar/index.jsx";
import Welcome        from "../components/Welcome/index.jsx";
import MessageList    from "../components/Messages/index.jsx";
import ChatInput      from "../components/ChatInput/index.jsx";
import FilePanel      from "../components/FilePanel/index.jsx";
import AuthModal      from "../components/AuthModal";
import { useChat }    from "../hooks/useChat";
import { useAuth }    from "../hooks/useAuth";
import { uid }        from "../utils/parse";

/* icons */
const Ico = ({d,s=20})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const HamI  = ()=><Ico d="M3 6h18M3 12h18M3 18h18"/>;
const NewI  = ()=><Ico d="M12 5v14M5 12h14" s={18}/>;
const GearI = ()=><Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" s={18}/>;

function IBtn({onClick,children,title}){
  return(
    <button onClick={onClick} title={title}
      className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-100 text-[#4a4a6a] hover:text-[#9090b0] hover:bg-[#1a1a2a]">
      {children}
    </button>
  );
}

function Splash(){
  return(
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4" style={{background:"#0a0a0f"}}>
      <div className="flex items-center gap-2.5">
        <span className="w-5 h-5 rounded-full" style={{background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)"}}/>
        <span className="font-display font-extrabold text-xl text-white tracking-wider">RUBRA</span>
      </div>
      <div className="w-5 h-5 rounded-full border-2 border-[#1e1e2e] border-t-[#e8301f]"
        style={{animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  const { user, loading, healthy, displayName, initials, signUp, signIn, signOut, resetPassword } = useAuth();
  const [isMobile,  setIsMobile]  = useState(false);
  const [mobOpen,   setMobOpen]   = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [fpFiles,   setFpFiles]   = useState([]);
  const [fpOpen,    setFpOpen]    = useState(false);

  const { sessions, activeId, messages, isStreaming, sendMessage, newChat, selectSession, deleteSession, editMessage, retryMessage, renameSession } = useChat();

  useEffect(() => {
    const chk = () => setIsMobile(window.innerWidth < 768);
    chk(); window.addEventListener("resize", chk);
    return () => window.removeEventListener("resize", chk);
  }, []);

  /* block ESC when not authed */
  useEffect(() => {
    if (user) return;
    const fn = e => { if (e.key === "Escape") e.preventDefault(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [user]);

  const openFP = useCallback(({ lang, content }) => {
    const ext = {javascript:"js",typescript:"ts",python:"py",html:"html",css:"css",json:"json",bash:"sh",sql:"sql",rust:"rs",go:"go",java:"java",cpp:"cpp"}[lang?.toLowerCase()]||"txt";
    setFpFiles([{ id:uid(), lang, content, name:`code.${ext}`, size:new Blob([content]).size }]);
    setFpOpen(true);
  }, []);

  if (loading) return <Splash/>;

  const hasMsg  = messages.length > 0;
  const showFP  = fpOpen && fpFiles.length > 0 && !isMobile;

  return (
    <div className="w-screen overflow-hidden flex relative" style={{ height:"100dvh", background:"#0a0a0f" }}>
      <WaveBackground/>

      {/* ── auth modal gate ── */}
      {!user && (
        <AuthModal
          onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword}
          healthy={healthy}
          onRetryHealth={()=>window.location.reload()}
        />
      )}

      {/* ── desktop layout ── */}
      {!isMobile && (
        <>
          {/* icon strip */}
          <div className="relative z-20 flex-shrink-0 flex flex-col items-center py-3 gap-1"
            style={{ width:54, background:"#0d0d14", borderRight:"1px solid #1a1a2a" }}>
            <IBtn onClick={()=>setPanelOpen(v=>!v)} title="Toggle sidebar"><HamI/></IBtn>
            <div className="h-2"/>
            <IBtn onClick={newChat} title="New chat"><NewI/></IBtn>
            <div className="flex-1"/>
            <IBtn title="Settings"><GearI/></IBtn>
            {user && (
              <button onClick={()=>setPanelOpen(true)} title="Profile"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white mb-2 cursor-pointer"
                style={{ background:"linear-gradient(135deg,#c0392b,#7b241c)" }}>
                {initials}
              </button>
            )}
          </div>

          {/* collapsible sidebar */}
          <div className="relative z-10 flex-shrink-0 h-full overflow-hidden"
            style={{ width: panelOpen ? 240 : 0, transition:"width .25s ease" }}>
            <div style={{ width:240, height:"100%" }}>
              <Sidebar open={true} isMobile={false}
                onClose={()=>setPanelOpen(false)} onNewChat={newChat}
                onSelectSession={selectSession} onDeleteSession={deleteSession} onRenameSession={renameSession}
                activeSessionId={activeId} sessions={sessions}
                user={user} displayName={displayName} initials={initials} onSignOut={signOut}/>
            </div>
          </div>
        </>
      )}

      {/* ── mobile sidebar ── */}
      {isMobile && (
        <Sidebar open={mobOpen} isMobile={true}
          onClose={()=>setMobOpen(false)} onNewChat={newChat}
          onSelectSession={selectSession} onDeleteSession={deleteSession} onRenameSession={renameSession}
          activeSessionId={activeId} sessions={sessions}
          user={user} displayName={displayName} initials={initials} onSignOut={signOut}/>
      )}

      {/* ── main content ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 min-w-0">

        {/* mobile top bar */}
        {isMobile && (
          <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0" style={{ borderBottom:"1px solid #1a1a2a" }}>
            <IBtn onClick={()=>setMobOpen(true)} title="Menu"><HamI/></IBtn>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)"}}/>
              <span className="font-display font-extrabold text-base text-white tracking-wider">RUBRA</span>
            </div>
            <IBtn onClick={newChat} title="New chat"><NewI/></IBtn>
          </div>
        )}

        {/* chat + file panel */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {!hasMsg
              ? <Welcome isMobile={isMobile} displayName={user ? displayName : ""}/>
              : <MessageList messages={messages} onEditMessage={editMessage} onRetry={retryMessage} onOpenFilePanel={openFP}/>
            }
            <ChatInput onSend={sendMessage} disabled={isStreaming || !user}/>
          </div>

          {showFP && (
            <>
              <div className="flex-shrink-0 w-px" style={{ background:"#1a1a2a" }}/>
              <div className="flex-shrink-0 h-full" style={{ width:420 }}>
                <FilePanel files={fpFiles} onClose={()=>{ setFpOpen(false); setFpFiles([]); }}/>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
