import { useState, useEffect, useRef } from "react";

const EmailIco = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={1.6} strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const LockIco = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={1.6} strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const UserIco = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={1.6} strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const EyeOn = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.6} strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOff = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.6} strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);
const ShieldIco = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(74,222,128,0.8)" strokeWidth={2} strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const GoogleIco = () => (
  <svg width={18} height={18} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);
const GithubIco = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="rgba(255,255,255,0.82)"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
);
const FbIco = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

function StrengthBar({ pw }) {
  if (!pw) return null;
  const c = { len:pw.length>=8, up:/[A-Z]/.test(pw), lo:/[a-z]/.test(pw), num:/[0-9]/.test(pw), sym:/[^A-Za-z0-9]/.test(pw) };
  const score = Object.values(c).filter(Boolean).length;
  const cols = ["#ef4444","#f97316","#eab308","#22c55e","#16a34a"];
  const lbls = ["Very weak","Weak","Fair","Strong","Very strong"];
  const col  = cols[score-1]||"#ef4444";
  return (
    <div style={{marginTop:8}}>
      <div style={{display:"flex",gap:3}}>
        {[1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:3,borderRadius:3,background:i<=score?col:"rgba(255,255,255,0.08)",transition:"background 0.25s"}}/>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
        <span style={{fontSize:11,color:col,fontWeight:600}}>{lbls[score-1]||""}</span>
        <div style={{display:"flex",gap:10}}>
          {[["8+",c.len],["A-Z",c.up],["0-9",c.num],["@#",c.sym]].map(([k,v])=>(
            <span key={k} style={{fontSize:10.5,color:v?"rgba(74,222,128,0.8)":"rgba(255,255,255,0.22)"}}>{v?"✓":"○"} {k}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type="text", value, onChange, placeholder, icon, error, autoFocus, children }) {
  const [show,setShow]=useState(false);
  const isP = type==="password";
  return (
    <div style={{marginBottom:11}}>
      {label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:5,letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        {icon&&<span style={{position:"absolute",left:12,display:"flex",pointerEvents:"none",zIndex:1}}>{icon}</span>}
        <input type={isP&&show?"text":type} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder} autoFocus={autoFocus}
          autoComplete={isP?"current-password":type==="email"?"email":"off"}
          style={{width:"100%",padding:`11px ${isP?"42px":"14px"} 11px ${icon?"38px":"14px"}`,background:"rgba(255,255,255,0.045)",border:`1px solid ${error?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.07)"}`,borderRadius:10,color:"rgba(255,255,255,0.9)",fontSize:14,outline:"none",fontFamily:"inherit",transition:"border-color 0.18s,box-shadow 0.18s",boxSizing:"border-box"}}
          onFocus={e=>{e.target.style.borderColor=error?"rgba(239,68,68,0.7)":"rgba(255,255,255,0.2)";e.target.style.boxShadow=error?"0 0 0 3px rgba(239,68,68,0.08)":"0 0 0 3px rgba(255,255,255,0.04)";}}
          onBlur={e=>{e.target.style.borderColor=error?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.07)";e.target.style.boxShadow="none";}}
        />
        {isP&&<button type="button" onClick={()=>setShow(v=>!v)} style={{position:"absolute",right:11,background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}>{show?<EyeOff/>:<EyeOn/>}</button>}
      </div>
      {error&&<p style={{fontSize:11.5,color:"rgba(239,68,68,0.9)",marginTop:4}}>⚠ {error}</p>}
      {children}
    </div>
  );
}

function OBtn({ ico, label, onClick, busy }) {
  const [h,setH]=useState(false);
  return (
    <button type="button" onClick={onClick} disabled={busy}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9,width:"100%",padding:"11px 14px",background:h?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.052)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"rgba(255,255,255,0.80)",fontSize:13.5,fontWeight:500,fontFamily:"inherit",cursor:busy?"default":"pointer",transition:"background 0.18s,border-color 0.18s"}}>
      {busy?<span style={{width:15,height:15,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"white",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>:ico}
      <span>{label}</span>
    </button>
  );
}

function Alert({ type, msg }) {
  const t={error:{bg:"rgba(239,68,68,0.09)",bd:"rgba(239,68,68,0.22)",c:"rgba(255,120,100,0.95)",i:"⚠"},success:{bg:"rgba(34,197,94,0.09)",bd:"rgba(34,197,94,0.22)",c:"rgba(74,222,128,0.95)",i:"✓"},warning:{bg:"rgba(251,191,36,0.09)",bd:"rgba(251,191,36,0.22)",c:"rgba(251,191,36,0.9)",i:"⚠"}}[type]||{};
  return <div style={{display:"flex",alignItems:"center",gap:8,background:t.bg,border:`1px solid ${t.bd}`,borderRadius:9,padding:"10px 12px",fontSize:13,color:t.c,marginBottom:12,animation:"fadeIn 0.2s ease"}}><span style={{flexShrink:0}}>{t.i}</span><span>{msg}</span></div>;
}

function Countdown({ isLockedOut }) {
  const [s,setS]=useState(0);
  useEffect(()=>{
    if(!isLockedOut)return;
    const tick=()=>{const k=parseInt(localStorage.getItem("rubra_lockout")||"0",10);setS(Math.max(0,Math.ceil((k-Date.now())/1000)));};
    tick(); const id=setInterval(tick,1000); return()=>clearInterval(id);
  },[isLockedOut]);
  if(!isLockedOut||s<=0)return null;
  return <Alert type="warning" msg={`Too many attempts. Try again in ${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}/>;
}

export default function AuthModal({ onSignIn, onSignUp, onResetPassword, onGoogleLogin, onGithubLogin, onFacebookLogin, attemptsLeft, isLockedOut, onFormStart }) {
  const [mode,setMode]=useState("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [confirm,setConfirm]=useState("");
  const [honey,setHoney]=useState("");
  const [loading,setLoading]=useState(false);
  const [obl,setObl]=useState("");
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [ferrs,setFerrs]=useState({});
  const cardRef=useRef(null);

  useEffect(()=>{onFormStart?.();},[mode]);
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape")e.preventDefault();};
    window.addEventListener("keydown",fn);
    return()=>window.removeEventListener("keydown",fn);
  },[]);

  const reset=()=>{setError("");setSuccess("");setFerrs({});};
  const go=(m)=>{setMode(m);reset();};
  const shake=()=>{const c=cardRef.current;if(!c)return;c.style.animation="none";c.offsetHeight;c.style.animation="shake 0.4s ease";};

  const validate=()=>{
    const e={};
    if(mode==="signup"&&!name.trim())e.name="Name is required";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))e.email="Enter a valid email";
    if(mode!=="forgot"){if(pass.length<8)e.pass="Min 8 characters";if(mode==="signup"&&pass!==confirm)e.confirm="Passwords don't match";}
    setFerrs(e);return Object.keys(e).length===0;
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();reset();
    if(isLockedOut||!validate())return;
    setLoading(true);
    if(mode==="login"){const{error}=await onSignIn(email,pass,honey);if(error){setError(error.message);shake();}
    }else if(mode==="signup"){const{error}=await onSignUp(email,pass,name,honey);if(error){setError(error.message);shake();}else{setSuccess("Account created! Check your email to confirm.");setName("");setEmail("");setPass("");setConfirm("");}}
    else{const{error}=await onResetPassword(email);if(error)setError(error.message);else setSuccess("Reset link sent! Check your inbox.");}
    setLoading(false);
  };

  const doOAuth=async(key,fn)=>{setObl(key);reset();try{await fn();}catch{setError("OAuth failed. Try another method.");}setObl("");};
  const left=Math.max(0,attemptsLeft);

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)shake();}} style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(2,1,8,0.87)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}>
      <div ref={cardRef} style={{width:"100%",maxWidth:396,background:"linear-gradient(160deg,rgba(13,11,26,0.98),rgba(8,7,18,0.99))",border:"1px solid rgba(255,255,255,0.085)",borderRadius:22,boxShadow:"0 40px 100px rgba(0,0,0,0.78),inset 0 1px 0 rgba(255,255,255,0.055)",padding:"26px 24px 22px",animation:"cardIn 0.38s cubic-bezier(0.22,1,0.36,1)",maxHeight:"92dvh",overflowY:"auto"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <span style={{width:19,height:19,borderRadius:"50%",display:"inline-block",background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",boxShadow:"0 0 14px rgba(192,57,43,0.65)"}}/>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"white",letterSpacing:"0.06em"}}>RUBRA</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.17)",borderRadius:20,padding:"4px 10px"}}>
            <ShieldIco/><span style={{fontSize:11,color:"rgba(74,222,128,0.82)",fontWeight:600}}>Secured</span>
          </div>
        </div>

        {/* Tabs */}
        {mode!=="forgot"&&(
          <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:11,padding:3,marginBottom:20,border:"1px solid rgba(255,255,255,0.06)"}}>
            {[["login","Sign In"],["signup","Create Account"]].map(([m,l])=>(
              <button key={m} type="button" onClick={()=>go(m)} style={{flex:1,padding:"9px 0",background:mode===m?"rgba(255,255,255,0.09)":"transparent",border:"none",borderRadius:9,cursor:"pointer",color:mode===m?"white":"rgba(255,255,255,0.36)",fontSize:13,fontWeight:mode===m?600:400,fontFamily:"inherit",transition:"all 0.2s",boxShadow:mode===m?"0 1px 6px rgba(0,0,0,0.25)":"none"}}>{l}</button>
            ))}
          </div>
        )}

        {/* Heading */}
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"white",marginBottom:3,letterSpacing:"-0.01em"}}>
          {mode==="login"?"Welcome back":mode==="signup"?"Create your account":"Reset your password"}
        </h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.33)",marginBottom:18,lineHeight:1.5}}>
          {mode==="login"?"Sign in to continue to RUBRA":mode==="signup"?"Start using AI — free forever":"We'll send a reset link to your inbox"}
        </p>

        {/* Lockout countdown */}
        <Countdown isLockedOut={isLockedOut}/>

        {/* Alerts */}
        {error&&<Alert type="error" msg={error}/>}
        {success&&<Alert type="success" msg={success}/>}

        {/* Attempt dots */}
        {!isLockedOut&&mode==="login"&&left<5&&(
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:11}}>
            <span style={{fontSize:11,color:"rgba(251,191,36,0.72)"}}>Attempts left:</span>
            {Array.from({length:5}).map((_,i)=><span key={i} style={{width:7,height:7,borderRadius:"50%",display:"inline-block",background:i<left?"rgba(251,191,36,0.7)":"rgba(255,255,255,0.10)",transition:"background 0.3s"}}/>)}
          </div>
        )}

        {/* OAuth */}
        {mode!=="forgot"&&!isLockedOut&&(
          <>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
              <OBtn ico={<GoogleIco/>} label={obl==="google"?"Connecting…":"Continue with Google"} busy={obl==="google"} onClick={()=>doOAuth("google",onGoogleLogin)}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                <OBtn ico={<GithubIco/>} label={obl==="github"?"…":"GitHub"} busy={obl==="github"} onClick={()=>doOAuth("github",onGithubLogin)}/>
                <OBtn ico={<FbIco/>} label={obl==="fb"?"…":"Facebook"} busy={obl==="fb"} onClick={()=>doOAuth("fb",onFacebookLogin)}/>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:16}}>
              <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.07)"}}/>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.22)",fontWeight:500}}>or with email</span>
              <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.07)"}}/>
            </div>
          </>
        )}

        {/* Form */}
        {!isLockedOut&&(
          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot */}
            <div style={{position:"absolute",opacity:0,pointerEvents:"none",left:"-9999px",top:"-9999px"}} aria-hidden="true">
              <input type="text" name="website" value={honey} onChange={e=>setHoney(e.target.value)} tabIndex={-1} autoComplete="off"/>
            </div>

            {mode==="signup"&&<Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" icon={<UserIco/>} error={ferrs.name} autoFocus/>}
            <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={<EmailIco/>} error={ferrs.email} autoFocus={mode!=="signup"}/>
            {mode!=="forgot"&&(
              <Field label="Password" type="password" value={pass} onChange={setPass} placeholder={mode==="signup"?"Min 8 characters":"Your password"} icon={<LockIco/>} error={ferrs.pass}>
                {mode==="signup"&&<StrengthBar pw={pass}/>}
              </Field>
            )}
            {mode==="signup"&&<Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" icon={<LockIco/>} error={ferrs.confirm}/>}

            {mode==="login"&&(
              <div style={{textAlign:"right",marginBottom:12,marginTop:-3}}>
                <button type="button" onClick={()=>go("forgot")} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.32)",fontSize:12.5,fontFamily:"inherit"}}>Forgot password?</button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",background:loading?"rgba(232,48,31,0.38)":"linear-gradient(135deg,#e8301f,#b02010)",border:"none",borderRadius:11,color:"white",fontSize:14.5,fontWeight:700,fontFamily:"inherit",cursor:loading?"default":"pointer",boxShadow:loading?"none":"0 4px 24px rgba(232,48,31,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"transform 0.15s,box-shadow 0.15s",letterSpacing:"0.01em"}}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(232,48,31,0.48)";}}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=loading?"none":"0 4px 24px rgba(232,48,31,0.35)";}}>
              {loading&&<span style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"white",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>}
              {mode==="login"?"Sign In to RUBRA":mode==="signup"?"Create Account":"Send Reset Link"}
            </button>
          </form>
        )}

        {/* Switch mode */}
        <p style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.28)",marginTop:16}}>
          {mode==="forgot"?<Lnk onClick={()=>go("login")}>← Back to Sign In</Lnk>
          :mode==="login"?<>Don't have an account? <Lnk onClick={()=>go("signup")}>Sign up free</Lnk></>
          :<>Already have an account? <Lnk onClick={()=>go("login")}>Sign in</Lnk></>}
        </p>

        {/* Footer */}
        <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.05)",textAlign:"center"}}>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.16)",lineHeight:1.7}}>
            🔒 Supabase Auth · Rate limited · Anti-bot · {mode==="signup"&&<><span style={{textDecoration:"underline",cursor:"pointer"}}>Terms</span> &amp; <span style={{textDecoration:"underline",cursor:"pointer"}}>Privacy</span></>}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cardIn{from{opacity:0;transform:scale(0.93) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

function Lnk({onClick,children}){return<button type="button" onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",color:"#ff5540",fontWeight:600,fontSize:"inherit",fontFamily:"inherit"}}>{children}</button>;}
