import { useState, useEffect, useRef } from "react";

/* ── Icons (inline SVG, zero deps) ── */
const Ico = ({ d, s = 16, c = "currentColor", sw = 1.6 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeOn  = () => <Ico d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" c="rgba(255,255,255,0.4)"/>;
const EyeOff = () => <Ico d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" c="rgba(255,255,255,0.4)"/>;
const Shield = () => <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" c="rgba(74,222,128,0.8)" sw={2}/>;

/* Real brand SVGs */
const GoogleSvg = () => (
  <svg width={18} height={18} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const GithubSvg = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const FbSvg = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const Spinner = () => (
  <span style={{ width:15, height:15, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"white", display:"inline-block", animation:"_spin .65s linear infinite" }}/>
);

/* ── Password strength ── */
function PwStrength({ pw }) {
  if (!pw) return null;
  const score = [pw.length>=8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const cols  = ["#ef4444","#f97316","#eab308","#22c55e","#16a34a"];
  const lbls  = ["Very weak","Weak","Fair","Strong","Very strong"];
  const col   = cols[score-1] || "#ef4444";
  return (
    <div style={{ marginTop:7 }}>
      <div style={{ display:"flex", gap:3, marginBottom:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:3, background: i<=score ? col : "rgba(255,255,255,0.07)", transition:"background .25s" }}/>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:11, color:col, fontWeight:600 }}>{lbls[score-1]||""}</span>
        <div style={{ display:"flex", gap:8 }}>
          {[["8+",pw.length>=8],["A-Z",/[A-Z]/.test(pw)],["0-9",/\d/.test(pw)],["@#",/[^A-Za-z0-9]/.test(pw)]].map(([k,v])=>(
            <span key={k} style={{ fontSize:10.5, color: v?"rgba(74,222,128,0.8)":"rgba(255,255,255,0.2)" }}>{v?"✓":"·"} {k}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Input field ── */
function Field({ label, type="text", value, onChange, placeholder, icon, err, autoFocus, children }) {
  const [show, setShow] = useState(false);
  const isP = type === "password";
  return (
    <div style={{ marginBottom:11 }}>
      {label && <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.32)", marginBottom:5, letterSpacing:".07em", textTransform:"uppercase" }}>{label}</div>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", display:"flex" }}>{icon}</span>}
        <input
          type={isP && show ? "text" : type}
          value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder} autoFocus={autoFocus}
          autoComplete={isP?"current-password":type==="email"?"email":"off"}
          style={{
            width:"100%", boxSizing:"border-box",
            padding:`10px ${isP?"40px":"13px"} 10px ${icon?"37px":"13px"}`,
            background:"rgba(255,255,255,0.045)",
            border:`1px solid ${err?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.08)"}`,
            borderRadius:9, color:"rgba(255,255,255,0.9)", fontSize:14,
            outline:"none", fontFamily:"inherit",
            transition:"border-color .18s",
          }}
          onFocus={e=>{ e.target.style.borderColor=err?"rgba(239,68,68,.7)":"rgba(255,255,255,.22)"; }}
          onBlur={e=>{  e.target.style.borderColor=err?"rgba(239,68,68,.45)":"rgba(255,255,255,.08)"; }}
        />
        {isP && (
          <button type="button" onClick={()=>setShow(v=>!v)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2, display:"flex" }}>
            {show ? <EyeOff/> : <EyeOn/>}
          </button>
        )}
      </div>
      {err && <div style={{ fontSize:11.5, color:"rgba(239,68,68,.9)", marginTop:4 }}>⚠ {err}</div>}
      {children}
    </div>
  );
}

/* ── OAuth button ── */
function OBtn({ ico, label, onClick, busy }) {
  const [h,setH] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={busy}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:9,
        width:"100%", padding:"10px 14px",
        background: h ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
        border:"1px solid rgba(255,255,255,0.08)", borderRadius:9,
        color:"rgba(255,255,255,0.82)", fontSize:13.5, fontWeight:500,
        fontFamily:"inherit", cursor: busy?"default":"pointer",
        transition:"background .15s",
      }}>
      {busy ? <Spinner/> : ico}
      <span>{label}</span>
    </button>
  );
}

/* ── Alert ── */
function Alert({ type, msg }) {
  const T = {
    error:   { bg:"rgba(239,68,68,.09)",  bd:"rgba(239,68,68,.22)",  c:"rgba(255,120,100,.95)", i:"⚠" },
    success: { bg:"rgba(34,197,94,.09)",  bd:"rgba(34,197,94,.22)",  c:"rgba(74,222,128,.95)",  i:"✓" },
    warning: { bg:"rgba(251,191,36,.09)", bd:"rgba(251,191,36,.22)", c:"rgba(251,191,36,.9)",   i:"⚠" },
  }[type] || {};
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, background:T.bg, border:`1px solid ${T.bd}`, borderRadius:8, padding:"10px 12px", fontSize:13, color:T.c, marginBottom:12 }}>
      <span style={{ flexShrink:0, marginTop:1 }}>{T.i}</span>
      <span>{msg}</span>
    </div>
  );
}

/* ── Lockout countdown ── */
function LockBanner() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const tick = () => {
      const v = parseInt(localStorage.getItem("rubra_lock")||"0",10);
      setS(Math.max(0, Math.ceil((v - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (s <= 0) return null;
  return <Alert type="warning" msg={`Too many failed attempts. Try again in ${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}.`}/>;
}

/* ════════════════════ MAIN MODAL ════════════════════ */
export default function AuthModal({
  onSignIn, onSignUp, onResetPassword,
  onGoogleLogin, onGithubLogin, onFacebookLogin,
  attemptsLeft, isLockedOut, onFormStart,
}) {
  const [tab,    setTab]    = useState("login"); // login | signup | forgot
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [pass,   setPass]   = useState("");
  const [conf,   setConf]   = useState("");
  const [honey,  setHoney]  = useState("");
  const [busy,   setBusy]   = useState(false);
  const [obusy,  setObusy]  = useState("");
  const [err,    setErr]    = useState("");
  const [ok,     setOk]     = useState("");
  const [ferr,   setFerr]   = useState({});
  const cardRef = useRef(null);

  // Block ESC
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") e.preventDefault(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => { onFormStart?.(); setErr(""); setOk(""); setFerr({}); }, [tab]);

  const reset = () => { setErr(""); setOk(""); setFerr({}); };
  const go    = t  => { setTab(t); reset(); };

  const shake = () => {
    const c = cardRef.current; if (!c) return;
    c.style.animation = "none";
    void c.offsetHeight;
    c.style.animation = "_shake .38s ease";
  };

  const validate = () => {
    const e = {};
    if (tab==="signup" && !name.trim())              e.name = "Name required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  e.email = "Enter a valid email";
    if (tab !== "forgot") {
      if (pass.length < 8)                           e.pass = "Min 8 characters";
      if (tab==="signup" && pass !== conf)           e.conf = "Passwords don't match";
    }
    setFerr(e);
    return !Object.keys(e).length;
  };

  const submit = async e => {
    e.preventDefault(); reset();
    if (isLockedOut || !validate()) return;
    setBusy(true);

    if (tab === "login") {
      const { error } = await onSignIn(email, pass, honey);
      if (error) { setErr(error.message); shake(); }
    } else if (tab === "signup") {
      const { error } = await onSignUp(email, pass, name, honey);
      if (error) { setErr(error.message); shake(); }
      else { setOk("Account created! Check your email to confirm."); setEmail(""); setPass(""); setConf(""); setName(""); }
    } else {
      const { error } = await onResetPassword(email);
      if (error) setErr(error.message);
      else setOk("Reset link sent — check your inbox.");
    }
    setBusy(false);
  };

  const doOAuth = async (key, fn) => {
    setObusy(key); reset();
    const { error } = await fn().catch(() => ({ error:{ message:"Failed. Try again." } }));
    if (error) { setErr(error.message); setObusy(""); }
    // on success page redirects, no need to clear
  };

  const left = Math.max(0, attemptsLeft);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) shake(); }}
      style={{
        position:"fixed", inset:0, zIndex:999,
        display:"flex", alignItems:"center", justifyContent:"center", padding:16,
        background:"rgba(0,0,0,0.78)",
        backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
      }}
    >
      {/* Card */}
      <div ref={cardRef} style={{
        width:"100%", maxWidth:388,
        background:"rgba(12,10,24,0.97)",
        border:"1px solid rgba(255,255,255,0.09)",
        borderRadius:20,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        padding:"26px 24px 22px",
        maxHeight:"92dvh", overflowY:"auto",
        animation:"_pop .3s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* ── Brand row ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:18, height:18, borderRadius:"50%", background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)", boxShadow:"0 0 12px rgba(192,57,43,0.6)", display:"inline-block", flexShrink:0 }}/>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"white", letterSpacing:".06em" }}>RUBRA</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,197,94,.07)", border:"1px solid rgba(34,197,94,.18)", borderRadius:20, padding:"3px 9px" }}>
            <Shield/>
            <span style={{ fontSize:11, color:"rgba(74,222,128,.82)", fontWeight:600 }}>Secured</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        {tab !== "forgot" && (
          <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:3, marginBottom:20 }}>
            {[["login","Sign In"],["signup","Sign Up"]].map(([m,l]) => (
              <button key={m} type="button" onClick={()=>go(m)} style={{
                flex:1, padding:"8px 0", border:"none", borderRadius:8, cursor:"pointer",
                background: tab===m ? "rgba(255,255,255,0.10)" : "transparent",
                color: tab===m ? "white" : "rgba(255,255,255,0.36)",
                fontSize:13, fontWeight: tab===m ? 600 : 400, fontFamily:"inherit",
                transition:"background .18s, color .18s",
              }}>{l}</button>
            ))}
          </div>
        )}

        {/* ── Heading ── */}
        <div style={{ marginBottom:18 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"white", margin:"0 0 3px", letterSpacing:"-.01em" }}>
            {tab==="login" ? "Welcome back" : tab==="signup" ? "Create account" : "Reset password"}
          </h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.32)", margin:0, lineHeight:1.5 }}>
            {tab==="login" ? "Sign in to use RUBRA AI" : tab==="signup" ? "Free forever — start in seconds" : "We'll email you a reset link"}
          </p>
        </div>

        {/* ── Lockout ── */}
        {isLockedOut && <LockBanner/>}

        {/* ── Alerts ── */}
        {err && <Alert type="error"   msg={err}/>}
        {ok  && <Alert type="success" msg={ok}/>}

        {/* ── Attempt dots ── */}
        {!isLockedOut && tab==="login" && left < MAX && left > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
            <span style={{ fontSize:11, color:"rgba(251,191,36,.7)" }}>Attempts left:</span>
            {Array.from({length:5}).map((_,i) => (
              <span key={i} style={{ width:7, height:7, borderRadius:"50%", display:"inline-block", background: i<left?"rgba(251,191,36,.7)":"rgba(255,255,255,.10)" }}/>
            ))}
          </div>
        )}

        {/* ── OAuth ── */}
        {tab !== "forgot" && !isLockedOut && (
          <>
            <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:16 }}>
              <OBtn
                ico={<GoogleSvg/>}
                label={obusy==="g" ? "Redirecting…" : "Continue with Google"}
                busy={obusy==="g"}
                onClick={()=>doOAuth("g", onGoogleLogin)}
              />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                <OBtn ico={<GithubSvg/>} label={obusy==="gh"?"…":"GitHub"}   busy={obusy==="gh"} onClick={()=>doOAuth("gh", onGithubLogin)}/>
                <OBtn ico={<FbSvg/>}    label={obusy==="fb"?"…":"Facebook"} busy={obusy==="fb"} onClick={()=>doOAuth("fb", onFacebookLogin)}/>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }}/>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.22)" }}>or email</span>
              <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }}/>
            </div>
          </>
        )}

        {/* ── Form ── */}
        {!isLockedOut && (
          <form onSubmit={submit} noValidate>
            {/* Honeypot */}
            <div style={{ position:"absolute", left:"-9999px", top:"-9999px", opacity:0, pointerEvents:"none" }} aria-hidden="true">
              <input type="text" name="site" value={honey} onChange={e=>setHoney(e.target.value)} tabIndex={-1} autoComplete="off"/>
            </div>

            {tab==="signup" && (
              <Field label="Full Name" value={name} onChange={setName} placeholder="Your name"
                icon={<Ico d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" c="rgba(255,255,255,0.3)"/>}
                err={ferr.name} autoFocus/>
            )}

            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com"
              icon={<Ico d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" c="rgba(255,255,255,0.3)"/>}
              err={ferr.email} autoFocus={tab!=="signup"}/>

            {tab !== "forgot" && (
              <Field label="Password" type="password" value={pass} onChange={setPass}
                placeholder={tab==="signup"?"Min 8 characters":"Your password"}
                icon={<Ico d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" c="rgba(255,255,255,0.3)"/>}
                err={ferr.pass}>
                {tab==="signup" && <PwStrength pw={pass}/>}
              </Field>
            )}

            {tab==="signup" && (
              <Field label="Confirm Password" type="password" value={conf} onChange={setConf} placeholder="Repeat password"
                icon={<Ico d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" c="rgba(255,255,255,0.3)"/>}
                err={ferr.conf}/>
            )}

            {tab==="login" && (
              <div style={{ textAlign:"right", marginBottom:12, marginTop:-4 }}>
                <button type="button" onClick={()=>go("forgot")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.32)", fontSize:12.5, fontFamily:"inherit" }}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={busy} style={{
              width:"100%", padding:"11px",
              background: busy ? "rgba(232,48,31,0.4)" : "linear-gradient(135deg,#e8301f,#b02010)",
              border:"none", borderRadius:10, color:"white",
              fontSize:14.5, fontWeight:700, fontFamily:"inherit",
              cursor: busy ? "default" : "pointer",
              boxShadow: busy ? "none" : "0 4px 20px rgba(232,48,31,0.32)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:9,
              transition:"opacity .15s",
              opacity: busy ? 0.7 : 1,
            }}>
              {busy && <Spinner/>}
              {tab==="login" ? "Sign In" : tab==="signup" ? "Create Account" : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* ── Switch mode ── */}
        <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.28)", marginTop:16, marginBottom:0 }}>
          {tab==="forgot"
            ? <Lnk onClick={()=>go("login")}>← Back to Sign In</Lnk>
            : tab==="login"
            ? <>No account? <Lnk onClick={()=>go("signup")}>Sign up free</Lnk></>
            : <>Have an account? <Lnk onClick={()=>go("login")}>Sign in</Lnk></>}
        </p>

        {/* ── Security footer ── */}
        <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.05)", textAlign:"center" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.16)", margin:0, lineHeight:1.7 }}>
            🔒 Secured by Supabase · Rate limited · Anti-spam
            {tab==="signup" && <> · <span style={{textDecoration:"underline",cursor:"pointer"}}>Terms</span> &amp; <span style={{textDecoration:"underline",cursor:"pointer"}}>Privacy</span></>}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes _pop  { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes _shake{ 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes _spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const MAX = 5;
function Lnk({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{ background:"none", border:"none", cursor:"pointer", color:"#ff5540", fontWeight:600, fontSize:"inherit", fontFamily:"inherit" }}>
      {children}
    </button>
  );
}
