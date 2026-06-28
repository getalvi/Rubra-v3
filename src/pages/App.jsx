import { useState, useEffect, useCallback } from "react";
import WaveBackground from "../components/WaveBackground";
import Sidebar        from "../components/Sidebar/index.jsx";
import Welcome        from "../components/Welcome/index.jsx";
import MessageList    from "../components/Messages/index.jsx";
import ChatInput      from "../components/ChatInput/index.jsx";
import { ThinkingIndicator } from "../components/AgentSteps/index.jsx";
import FilePanel      from "../components/FilePanel/index.jsx";
import AuthModal      from "../components/AuthModal";
import { useChat }    from "../hooks/useChat";
import { useAuth }    from "../hooks/useAuth";
import { uid, extractFiles, parseSegments } from "../utils/parse";

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
  const [fpExpanded,setFpExpanded]= useState(false); // false=380px narrow, true=55vw wide

  const { sessions, activeId, messages, isStreaming, lastProject, streamStatus, sendMessage, newChat, selectSession, deleteSession, editMessage, retryMessage, renameSession, stopGeneration } = useChat();

  /* ── Auto-open FilePanel whenever a project_complete arrives (first build OR follow-up) ── */
  useEffect(() => {
    if (!lastProject) return;
    const { files, failedFiles, framework } = lastProject;
    if (!files?.length) return;

    // Convert backend file objects → FilePanel's expected shape
    const ext = { html:"html", react:"jsx", vue:"vue", css:"css", js:"js" };
    const panelFiles = files.map(f => ({
      id:      f.path,
      name:    f.path.split("/").pop(),
      path:    f.path,
      lang:    f.path.split(".").pop() || "text",
      content: f.content || "",
      size:    new Blob([f.content || ""]).size,
    }));

    // Add failed files too (so they appear in the tree with error state)
    for (const ff of (failedFiles || [])) {
      if (!panelFiles.find(f => f.path === ff.path)) {
        panelFiles.push({
          id: ff.path, name: ff.path.split("/").pop(),
          path: ff.path, lang: ff.path.split(".").pop() || "text",
          content: `// ⚠️ Generation failed: ${ff.error || "unknown error"}`,
          size: 0, failed: true,
        });
      }
    }

    setFpFiles(panelFiles);
    setFpOpen(true);
  }, [lastProject]);

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

  /* Open a single code block in the panel */
  const openFP = useCallback(({ lang, content, filename }) => {
    const ext  = {javascript:"js",typescript:"ts",python:"py",html:"html",css:"css",json:"json",bash:"sh",sql:"sql",rust:"rs",go:"go",java:"java",cpp:"cpp"}[lang?.toLowerCase()]||"txt";
    const name = filename || `code.${ext}`;
    setFpFiles([{ id:uid(), lang, content, name, path:name, size:new Blob([content]).size }]);
    setFpOpen(true);
  }, []);

  /* Open ALL code blocks from a message as a multi-file project */
  const openProjectFP = useCallback((msg) => {
    const segs  = parseSegments(typeof msg.content === "string" ? msg.content : "");
    const files = extractFiles(segs, msg.id);
    if (files.length === 0) return;
    setFpFiles(files);
    setFpOpen(true);
  }, []);

  /* Open an array of files directly (called from ProjectFileCards) */
  const openPanelWithFiles = useCallback((files, view) => {
    if (!files?.length) return;
    setFpFiles(files);
    setFpOpen(true);
    if (view === "preview") setFpExpanded(false);
  }, []);

  /* Start a new Project session — switches mode to Agent, focuses input */
  const startProject = useCallback(() => {
    newChat();
    window.dispatchEvent(new CustomEvent("rubra:set-mode", { detail: "agent" }));
    setTimeout(() => document.querySelector("textarea")?.focus(), 80);
  }, [newChat]);

  /* Wrap sendMessage to automatically inject the logged-in user's ID */
  const send = useCallback((text, mode) => {
    sendMessage(text, mode, user?.id || user?.email || null);
  }, [sendMessage, user]);

  const hasMsg  = messages.length > 0;
  const showFP  = fpOpen && fpFiles.length > 0 && !isMobile;

  if (loading) return <Splash/>;

  return (
    <div
      className="w-screen overflow-hidden relative"
      style={{
        height: "100dvh",
        background: "#0a0a0f",
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : (!user ? "1fr" : (panelOpen ? "260px 1fr" : "60px 1fr")),
        transition: isMobile ? undefined : "grid-template-columns 0.3s ease",
      }}
    >
      <WaveBackground/>

      {/* ── auth modal gate ── */}
      {!user && (
        <AuthModal
          onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword}
          healthy={healthy}
          onRetryHealth={()=>window.location.reload()}
        />
      )}

      {/* ── desktop sidebar (CSS Grid column 1) ── */}
      {!isMobile && user && (
        <Sidebar
          expanded={panelOpen}
          onToggle={() => setPanelOpen(v => !v)}
          onNewChat={newChat}
          onStartProject={startProject}
          onSelectSession={selectSession} onDeleteSession={deleteSession} onRenameSession={renameSession}
          activeSessionId={activeId} sessions={sessions}
          isMobile={false}
          user={user} displayName={displayName} initials={initials} onSignOut={signOut}
        />
      )}

      {/* ── mobile sidebar (fixed overlay) ── */}
      {isMobile && user && (
        <Sidebar
          expanded={true}
          onToggle={() => {}}
          onNewChat={newChat}
          onStartProject={startProject}
          onSelectSession={selectSession} onDeleteSession={deleteSession} onRenameSession={renameSession}
          activeSessionId={activeId} sessions={sessions}
          isMobile={true} mobileOpen={mobOpen} onMobileClose={()=>setMobOpen(false)}
          user={user} displayName={displayName} initials={initials} onSignOut={signOut}
        />
      )}

      {/* ── main content ── */}
      <div className="flex flex-col h-full overflow-hidden relative z-10" style={{ minWidth: 0 }}>

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
              : <MessageList messages={messages} onEditMessage={editMessage} onRetry={retryMessage} onOpenFilePanel={openFP} onOpenProject={openProjectFP} onOpenPanelWithFiles={openPanelWithFiles} onAskFollowUp={send} isStreaming={isStreaming}/>
            }
            {/* transient status / thinking indicator above input */}
            {isStreaming && (
              <div className="px-6 pb-1 max-w-3xl w-full mx-auto">
                {streamStatus ? (
                  <div className="flex items-center gap-2 text-xs" style={{ color:"#5a5a7a" }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background:"#e8301f", animation:"pulseDot 1s ease-in-out infinite" }}/>
                    {streamStatus}
                  </div>
                ) : (() => {
                  const lastMsg = messages[messages.length - 1];
                  const noTokens = lastMsg?.role==="assistant" && !lastMsg?.content?.trim() && (!lastMsg?.steps?.length);
                  return noTokens ? <ThinkingIndicator/> : null;
                })()}
              </div>
            )}
            <style>{`@keyframes pulseDot{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
            <ChatInput onSend={send} onStop={stopGeneration} isStreaming={isStreaming} disabled={!user}/>
          </div>

          {showFP && (
            <>
              <div className="flex-shrink-0 w-px" style={{ background:"#1a1a2a" }}/>
              {/* Panel width: normal 420px, expanded ~55% of screen */}
              <div
                className="flex-shrink-0 h-full overflow-hidden"
                style={{
                  width: fpExpanded ? "55vw" : 420,
                  minWidth: fpExpanded ? 480 : 280,
                  maxWidth: fpExpanded ? "75vw" : 560,
                  transition: "width 0.22s ease, min-width 0.22s ease",
                }}
              >
                <FilePanel
                  files={fpFiles}
                  expanded={fpExpanded}
                  onToggleExpand={() => setFpExpanded(v => !v)}
                  onClose={() => { setFpOpen(false); setFpFiles([]); setFpExpanded(false); }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile: file panel as a full-screen overlay */}
      {isMobile && fpOpen && fpFiles.length > 0 && (
        <div className="fixed inset-0 z-[60]" style={{ background:"#0a0a0f" }}>
          <FilePanel
            files={fpFiles}
            expanded={false}
            onToggleExpand={() => {}}
            onClose={() => { setFpOpen(false); setFpFiles([]); }}
          />
        </div>
      )}
    </div>
  );
}
