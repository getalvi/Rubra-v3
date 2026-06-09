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
import { parseSegments, extractFiles, uid } from "../utils/parse";

const I = ({d,s=20,c="rgba(255,255,255,0.6)",sw=1.7})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const HamI  = ()=><I d="M3 6h18M3 12h18M3 18h18"/>;
const NewI  = ()=><I d="M12 5v14M5 12h14" sw={2}/>;
const GearI = ()=><I d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" s={19}/>;

function SBtn({onClick,children,title}){
  const[h,setH]=useState(false);
  return(
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:h?"rgba(255,255,255,0.08)":"transparent",border:"none",cursor:"pointer",width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s",flexShrink:0}}>
      {children}
    </button>
  );
}

function Splash(){
  return(
    <div style={{width:"100vw",height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#080810",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{width:22,height:22,borderRadius:"50%",background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",boxShadow:"0 0 14px rgba(192,57,43,0.6)",display:"inline-block"}}/>
        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:21,color:"white",letterSpacing:".06em"}}>RUBRA</span>
      </div>
      <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.12)",borderTopColor:"#e8301f",animation:"_spin .8s linear infinite"}}/>
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App(){
  const { user, loading, displayName, initials, signUp, signIn, signOut, resetPassword, signInGoogle, signInGithub, signInFacebook, resetTimer, attemptsLeft, isLockedOut } = useAuth();
  const [isMobile,  setIsMobile]  = useState(false);
  const [mobOpen,   setMobOpen]   = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [fpFiles,   setFpFiles]   = useState([]);
  const [fpOpen,    setFpOpen]    = useState(false);

  const { sessions, activeId, messages, isStreaming, sendMessage, newChat, selectSession, deleteSession, editMessage, retryMessage } = useChat();

  useEffect(()=>{
    const chk = ()=>setIsMobile(window.innerWidth<768);
    chk(); window.addEventListener("resize",chk);
    return ()=>window.removeEventListener("resize",chk);
  },[]);

  useEffect(()=>{
    if(user) return;
    const fn=e=>{if(e.key==="Escape")e.preventDefault();};
    window.addEventListener("keydown",fn);
    return ()=>window.removeEventListener("keydown",fn);
  },[user]);

  const openFilePanel = useCallback(({lang,content})=>{
    const ext={javascript:"js",typescript:"ts",python:"py",html:"html",css:"css",json:"json",bash:"sh",sh:"sh",sql:"sql",rust:"rs",go:"go",java:"java",cpp:"cpp"}[lang?.toLowerCase()]||"txt";
    setFpFiles([{id:uid(),lang,content,name:`code.${ext}`,size:new Blob([content]).size}]);
    setFpOpen(true);
  },[]);

  if(loading) return <Splash/>;

  const hasMsg   = messages.length > 0;
  const showFP   = fpOpen && fpFiles.length > 0 && !isMobile;

  return(
    <div style={{width:"100vw",height:"100dvh",overflow:"hidden",display:"flex",background:"#080810",position:"relative"}}>
      <WaveBackground/>

      {/* Auth modal — shown when not logged in, blocks everything */}
      {!user && (
        <AuthModal
          onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword}
          onGoogleLogin={signInGoogle} onGithubLogin={signInGithub} onFacebookLogin={signInFacebook}
          attemptsLeft={attemptsLeft} isLockedOut={isLockedOut} onFormStart={resetTimer}
        />
      )}

      {/* Desktop strip */}
      {!isMobile && (
        <>
          <div style={{position:"relative",zIndex:20,width:54,height:"100%",background:"rgba(5,4,12,0.82)",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",borderRight:"0.5px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:12,paddingBottom:12,gap:2,flexShrink:0}}>
            <SBtn onClick={()=>setPanelOpen(v=>!v)} title="Sidebar"><HamI/></SBtn>
            <div style={{height:6}}/>
            <SBtn onClick={newChat} title="New chat"><NewI/></SBtn>
            <div style={{flex:1}}/>
            <SBtn title="Settings"><GearI/></SBtn>
            {user&&(
              <div onClick={()=>setPanelOpen(true)} title="Profile"
                style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#c0392b,#7b241c)",border:"1.5px solid rgba(255,255,255,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",marginBottom:4,userSelect:"none"}}>
                {initials}
              </div>
            )}
          </div>
          <div style={{position:"relative",zIndex:19,height:"100%",width:panelOpen?252:0,overflow:"hidden",transition:"width .3s cubic-bezier(.22,1,.36,1)",flexShrink:0}}>
            <div style={{width:252,height:"100%"}}>
              <Sidebar open={true} isMobile={false} onClose={()=>setPanelOpen(false)} onNewChat={newChat}
                onSelectSession={selectSession} onDeleteSession={deleteSession}
                activeSessionId={activeId} sessions={sessions}
                user={user} displayName={displayName} initials={initials} onSignOut={signOut}/>
            </div>
          </div>
        </>
      )}

      {/* Mobile sidebar */}
      {isMobile&&(
        <Sidebar open={mobOpen} isMobile={true} onClose={()=>setMobOpen(false)} onNewChat={newChat}
          onSelectSession={selectSession} onDeleteSession={deleteSession}
          activeSessionId={activeId} sessions={sessions}
          user={user} displayName={displayName} initials={initials} onSignOut={signOut}/>
      )}

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",position:"relative",zIndex:5,minWidth:0}}>
        {isMobile&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 12px 6px",flexShrink:0}}>
            <SBtn onClick={()=>setMobOpen(true)} title="Menu"><HamI/></SBtn>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{width:16,height:16,borderRadius:"50%",display:"inline-block",background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",boxShadow:"0 0 9px rgba(192,57,43,0.55)"}}/>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"white",letterSpacing:".06em"}}>RUBRA</span>
            </div>
            <SBtn onClick={newChat} title="New chat"><NewI/></SBtn>
          </div>
        )}

        <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
            {!hasMsg
              ? <Welcome isMobile={isMobile} displayName={user?displayName:""}/>
              : <MessageList messages={messages} onEditMessage={editMessage} onRetry={retryMessage} onOpenFilePanel={openFilePanel}/>
            }
            <ChatInput onSend={sendMessage} disabled={isStreaming||!user}/>
          </div>

          {showFP&&(
            <>
              <div style={{width:"0.5px",background:"rgba(255,255,255,0.07)",flexShrink:0}}/>
              <div style={{width:420,flexShrink:0,height:"100%"}}>
                <FilePanel files={fpFiles} onClose={()=>{setFpOpen(false);setFpFiles([]);}}/>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes _spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>
    </div>
  );
}
