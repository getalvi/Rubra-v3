import { useState } from "react";
import { groupByTime } from "../../utils/parse";

const I = ({d,s=17,c="rgba(255,255,255,0.58)",sw=1.55})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const HamI    = ()=><I d="M3 6h18M3 12h18M3 18h18" c="rgba(255,255,255,0.68)"/>;
const SearchI = ()=><I d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>;
const PlusI   = ()=><I d="M12 5v14M5 12h14" c="white" sw={2.1}/>;
const TrashI  = ()=><I d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" c="rgba(255,100,100,0.75)" s={13}/>;
const GearI   = ()=><I d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" s={18}/>;
const SignOutI= ()=><I d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" c="rgba(255,100,100,0.65)" s={16}/>;

function IBtn({onClick,children,title}){
  return(
    <button onClick={onClick} title={title} style={{background:"transparent",border:"none",cursor:"pointer",width:32,height:32,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {children}
    </button>
  );
}

export default function Sidebar({open,onClose,onNewChat,onSelectSession,onDeleteSession,activeSessionId,sessions,isMobile,user,displayName,initials,onSignOut}){
  const [hov,setHov]=useState(null);
  const [q,setQ]=useState("");
  const filtered = q.trim() ? sessions.filter(s=>s.title.toLowerCase().includes(q.toLowerCase())) : sessions;
  const grouped = groupByTime(filtered);

  return(
    <>
      {isMobile&&open&&(
        <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:48,background:"rgba(0,0,0,0.52)",backdropFilter:"blur(4px)"}}/>
      )}
      <aside style={{
        position:isMobile?"fixed":"relative",
        inset:isMobile?"0 auto 0 0":undefined,
        width:"var(--sw)",height:"100%",
        background:"rgba(9,8,20,0.94)",
        backdropFilter:"var(--blur)",WebkitBackdropFilter:"var(--blur)",
        borderRight:"0.5px solid var(--border)",
        display:"flex",flexDirection:"column",zIndex:50,flexShrink:0,
        transform:isMobile?(open?"translateX(0)":"translateX(-100%)"):"translateX(0)",
        transition:"transform 0.3s var(--ease)",
      }}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 13px 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:14,height:14,borderRadius:"50%",display:"inline-block",background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",boxShadow:"0 0 8px rgba(192,57,43,0.55)",flexShrink:0}}/>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"white",letterSpacing:"0.07em"}}>RUBRA</span>
          </div>
          <div style={{display:"flex",gap:2}}>
            <IBtn title="Search"><SearchI/></IBtn>
            <IBtn onClick={onClose} title="Close"><HamI/></IBtn>
          </div>
        </div>

        {/* New Chat */}
        <div style={{padding:"2px 11px 11px"}}>
          <button onClick={()=>{onNewChat();if(isMobile)onClose();}} style={{
            width:"100%",display:"flex",alignItems:"center",gap:8,
            padding:"9px 13px",borderRadius:"var(--r-md)",
            background:"var(--glass2)",border:"0.5px solid var(--border)",
            color:"white",cursor:"pointer",fontSize:13.5,fontWeight:600,
            fontFamily:"inherit",transition:"background 0.18s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
          onMouseLeave={e=>e.currentTarget.style.background="var(--glass2)"}>
            <PlusI/> New Chat
          </button>
        </div>

        {/* Search */}
        <div style={{padding:"0 11px 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.04)",border:"0.5px solid var(--border)",borderRadius:"var(--r-sm)",padding:"7px 10px"}}>
            <SearchI/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search sessions…" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"var(--text)",fontSize:12.5,fontFamily:"inherit"}}/>
          </div>
        </div>

        {/* Sessions */}
        <div style={{flex:1,overflowY:"auto",padding:"0 7px"}}>
          {Object.entries(grouped).map(([label,items])=>
            items.length===0?null:(
              <div key={label}>
                <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:"var(--text3)",padding:"10px 9px 4px"}}>{label}</p>
                {items.map(s=>(
                  <div key={s.id}
                    onMouseEnter={()=>setHov(s.id)} onMouseLeave={()=>setHov(null)}
                    onClick={()=>{onSelectSession(s.id);if(isMobile)onClose();}}
                    style={{
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"8px 9px",borderRadius:"var(--r-sm)",cursor:"pointer",marginBottom:1,
                      background:s.id===activeSessionId?"rgba(255,255,255,0.09)":hov===s.id?"rgba(255,255,255,0.05)":"transparent",
                      transition:"background 0.13s",
                    }}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.4}}>{s.title}</div>
                      {s.messageCount>0&&<div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{s.messageCount} msg{s.messageCount!==1?"s":""}</div>}
                    </div>
                    {hov===s.id&&(
                      <span title="Delete" onClick={e=>{e.stopPropagation();onDeleteSession(s.id);}} style={{cursor:"pointer",flexShrink:0,marginLeft:5,display:"flex",opacity:0.75}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.75}>
                        <TrashI/>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
          {sessions.length===0&&(
            <div style={{textAlign:"center",padding:"32px 16px"}}>
              <p style={{fontSize:13,color:"var(--text3)",lineHeight:1.7}}>No sessions yet.<br/>Start a new chat!</p>
            </div>
          )}
        </div>

        {/* Footer — user profile + sign out */}
        <div style={{padding:"10px 11px",borderTop:"0.5px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,flex:1,minWidth:0}}>
              <div style={{
                width:32,height:32,borderRadius:"50%",flexShrink:0,
                background:"linear-gradient(135deg,#c0392b,#7b241c)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,color:"white",
                border:"1.5px solid rgba(255,255,255,0.15)",
              }}>{initials}</div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div>
                <div style={{fontSize:11,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:2,flexShrink:0}}>
              <IBtn title="Settings"><GearI/></IBtn>
              <IBtn onClick={onSignOut} title="Sign out"><SignOutI/></IBtn>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
