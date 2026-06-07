import { useState, useEffect, useRef } from "react";

/* ── Icons ── */
const CloseI = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);
const EmailI = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.6} strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockI = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.6} strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const UserI = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.6} strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const EyeI = ({show}) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.6} strokeLinecap="round">
    {show
      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    }
  </svg>
);
const ShieldI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(74,222,128,0.7)" strokeWidth={1.6} strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const WarnI = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth={1.6} strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
  </svg>
);

/* ── Password strength meter ── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = {
    len:    password.length >= 8,
    upper:  /[A-Z]/.test(password),
    lower:  /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special:/[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const colors = ["#ef4444","#f97316","#eab308","#22c55e","#16a34a"];
  const labels = ["Very weak","Weak","Fair","Strong","Very strong"];
  const col    = colors[score - 1] || "#ef4444";

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display:"flex", gap:3, marginBottom:5 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex:1, height:3, borderRadius:3,
            background: i <= score ? col : "rgba(255,255,255,0.10)",
            transition:"background 0.3s",
          }}/>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, color: col, fontWeight:600 }}>{labels[score-1] || ""}</span>
        <div style={{ display:"flex", gap:8 }}>
          {Object.entries({ "8+ chars":checks.len, "A-Z":checks.upper, "0-9":checks.number, "Special":checks.special }).map(([k,v]) => (
            <span key={k} style={{ fontSize:10, color: v ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.22)" }}>
              {v ? "✓" : "○"} {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Input field ── */
function Field({ label, type="text", value, onChange, placeholder, icon, error, note, autoFocus, children }) {
  const [showPass, setShowPass] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom:14 }}>
      {label && (
        <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.48)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>
          {label}
        </label>
      )}
      <div style={{ position:"relative" }}>
        {icon && (
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", display:"flex" }}>
            {icon}
          </span>
        )}
        <input
          type={isPass && showPass ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={isPass ? "current-password" : type === "email" ? "email" : "off"}
          style={{
            width:"100%",
            padding:`10px ${isPass ? "42px" : "14px"} 10px ${icon ? "38px" : "14px"}`,
            background:"rgba(255,255,255,0.055)",
            border:`1px solid ${error ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.09)"}`,
            borderRadius:10, color:"rgba(255,255,255,0.9)",
            fontSize:14, outline:"none", fontFamily:"inherit",
            transition:"border-color 0.2s, box-shadow 0.2s",
            boxSizing:"border-box",
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? "rgba(239,68,68,0.75)" : "rgba(255,255,255,0.24)";
            e.target.style.boxShadow   = error ? "0 0 0 3px rgba(239,68,68,0.10)" : "0 0 0 3px rgba(255,255,255,0.05)";
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.09)";
            e.target.style.boxShadow   = "none";
          }}
        />
        {isPass && (
          <button type="button" onClick={() => setShowPass(v=>!v)}
            style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:3, display:"flex" }}>
            <EyeI show={showPass}/>
          </button>
        )}
      </div>
      {error && <p style={{ fontSize:11.5, color:"rgba(239,68,68,0.9)", marginTop:5, display:"flex", alignItems:"center", gap:4 }}>⚠ {error}</p>}
      {note  && !error && <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.28)", marginTop:5 }}>{note}</p>}
      {children}
    </div>
  );
}

/* ── Alert banner ── */
function Alert({ type, children }) {
  const styles = {
    error:   { bg:"rgba(239,68,68,0.10)",   border:"rgba(239,68,68,0.25)",   color:"rgba(255,130,110,0.95)" },
    success: { bg:"rgba(34,197,94,0.10)",   border:"rgba(34,197,94,0.25)",   color:"rgba(74,222,128,0.95)"  },
    warning: { bg:"rgba(251,191,36,0.09)",  border:"rgba(251,191,36,0.22)",  color:"rgba(251,191,36,0.90)"  },
  };
  const s = styles[type] || styles.error;
  return (
    <div style={{
      background:s.bg, border:`1px solid ${s.border}`, borderRadius:9,
      padding:"10px 14px", fontSize:13, color:s.color, marginBottom:14,
      display:"flex", alignItems:"center", gap:8,
      animation:"fadeIn 0.2s ease",
    }}>
      {type === "success" ? <ShieldI/> : <WarnI/>}
      <span style={{flex:1}}>{children}</span>
    </div>
  );
}

/* ── Tab bar ── */
function TabBar({ mode, setMode, reset }) {
  return (
    <div style={{
      display:"flex", background:"rgba(255,255,255,0.045)",
      borderRadius:10, padding:3, marginBottom:24,
    }}>
      {[["login","Sign In"],["signup","Create Account"]].map(([m,label]) => (
        <button key={m} type="button" onClick={()=>{ setMode(m); reset(); }} style={{
          flex:1, padding:"8px 0",
          background: mode===m ? "rgba(255,255,255,0.10)" : "transparent",
          border:"none", borderRadius:8, cursor:"pointer",
          color: mode===m ? "white" : "rgba(255,255,255,0.42)",
          fontSize:13, fontWeight: mode===m ? 600 : 400,
          fontFamily:"inherit", transition:"all 0.2s",
        }}>{label}</button>
      ))}
    </div>
  );
}

/* ── Attempt indicator dots ── */
function AttemptDots({ left, max=5 }) {
  if (left >= max) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
      <span style={{ fontSize:11, color:"rgba(251,191,36,0.8)" }}>Attempts left:</span>
      {Array.from({length:max}).map((_,i) => (
        <span key={i} style={{
          width:7, height:7, borderRadius:"50%",
          background: i < left ? "rgba(251,191,36,0.75)" : "rgba(255,255,255,0.12)",
          transition:"background 0.3s",
        }}/>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN MODAL
════════════════════════════════════════════ */
export default function AuthModal({ onSignIn, onSignUp, onResetPassword, attemptsLeft, isLockedOut: locked, onFormStart }) {
  const [mode,    setMode]    = useState("login");   // login | signup | forgot
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [honey,   setHoney]   = useState("");        // invisible honeypot field
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [ferrs,   setFerrs]   = useState({});
  const [lockTimer, setLockTimer] = useState(0);
  const overlayRef = useRef(null);

  // Lockout countdown
  useEffect(() => {
    if (!locked) return;
    const tick = () => {
      const k = parseInt(localStorage.getItem("rubra_lockout_until") || "0", 10);
      const s = Math.max(0, Math.ceil((k - Date.now()) / 1000));
      setLockTimer(s);
      if (s <= 0) setLockTimer(0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locked]);

  // Notify parent that user started filling form (for speed check)
  useEffect(() => { onFormStart?.(); }, [mode]);

  const reset = () => { setError(""); setSuccess(""); setFerrs({}); };

  /* ── Validate ── */
  const validate = () => {
    const e = {};
    if (mode === "signup" && !name.trim())         e.name    = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email   = "Enter a valid email address";
    if (mode !== "forgot") {
      if (pass.length < 8)                         e.pass    = "Minimum 8 characters required";
      if (mode === "signup" && pass !== confirm)   e.confirm = "Passwords do not match";
    }
    setFerrs(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();
    if (locked) return;
    if (!validate()) return;

    setLoading(true);

    if (mode === "login") {
      const { error } = await onSignIn(email, pass, honey);
      if (error) setError(error.message);
    } else if (mode === "signup") {
      const { error } = await onSignUp(email, pass, name, honey);
      if (error) setError(error.message);
      else {
        setSuccess("Account created! Check your email for a confirmation link.");
        setName(""); setEmail(""); setPass(""); setConfirm("");
      }
    } else {
      const { error } = await onResetPassword(email);
      if (error) setError(error.message);
      else setSuccess("Reset link sent! Check your inbox.");
    }
    setLoading(false);
  };

  /* ── Click outside does NOTHING (user must authenticate) ── */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      // Shake the card instead of closing
      const card = overlayRef.current?.querySelector("#auth-card");
      if (card) {
        card.style.animation = "none";
        card.offsetHeight; // reflow
        card.style.animation = "shake 0.4s ease";
      }
    }
  };

  const fmtTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"16px",
        background:"rgba(4,3,12,0.88)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      }}
    >
      <div
        id="auth-card"
        style={{
          width:"100%", maxWidth:420,
          background:"rgba(11,9,24,0.96)",
          border:"1px solid rgba(255,255,255,0.10)",
          borderRadius:20,
          boxShadow:"0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)",
          padding:"32px 28px 28px",
          animation:"cardIn 0.36s cubic-bezier(0.22,1,0.36,1)",
          position:"relative",
        }}
      >
        {/* ── Top: Logo + Security badge ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <span style={{
              width:20, height:20, borderRadius:"50%", display:"inline-block",
              background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
              boxShadow:"0 0 14px rgba(192,57,43,0.6)",
            }}/>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"white", letterSpacing:"0.06em" }}>
              RUBRA
            </span>
          </div>
          <div style={{
            display:"flex", alignItems:"center", gap:5,
            background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.18)",
            borderRadius:20, padding:"4px 10px",
          }}>
            <ShieldI/>
            <span style={{ fontSize:11, color:"rgba(74,222,128,0.80)", fontWeight:600 }}>Secure</span>
          </div>
        </div>

        {/* ── Tab bar ── */}
        {mode !== "forgot" && <TabBar mode={mode} setMode={setMode} reset={reset}/>}

        {/* ── Heading ── */}
        <h2 style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22,
          color:"white", marginBottom:5, letterSpacing:"-0.01em",
        }}>
          {mode === "login"  ? "Welcome back"     :
           mode === "signup" ? "Create your account" :
                               "Forgot password?"}
        </h2>
        <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.40)", marginBottom:22, lineHeight:1.5 }}>
          {mode === "login"  ? "Sign in to access RUBRA AI" :
           mode === "signup" ? "Join and start using the AI assistant" :
                               "Enter your email to get a reset link"}
        </p>

        {/* ── Lockout state ── */}
        {locked && lockTimer > 0 && (
          <Alert type="warning">
            Account temporarily locked. Try again in <strong>{fmtTime(lockTimer)}</strong>.
          </Alert>
        )}

        {/* ── Attempt dots ── */}
        {!locked && mode === "login" && <AttemptDots left={attemptsLeft}/>}

        {/* ── Alerts ── */}
        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* ── Form ── */}
        {!(locked && lockTimer > 0) && (
          <form onSubmit={handleSubmit} noValidate>

            {/* HONEYPOT — invisible, bots fill this */}
            <div style={{ position:"absolute", left:"-9999px", top:"-9999px", opacity:0, pointerEvents:"none", tabIndex:-1, ariaHidden:"true" }}>
              <input
                type="text" name="website" value={honey}
                onChange={e=>setHoney(e.target.value)}
                tabIndex={-1} autoComplete="off" aria-hidden="true"
              />
            </div>

            {mode === "signup" && (
              <Field label="Full Name" value={name} onChange={setName}
                placeholder="Your full name" icon={<UserI/>} error={ferrs.name} autoFocus/>
            )}

            <Field label="Email Address" type="email" value={email} onChange={setEmail}
              placeholder="you@example.com" icon={<EmailI/>} error={ferrs.email}
              autoFocus={mode !== "signup"}/>

            {mode !== "forgot" && (
              <Field label="Password" type="password" value={pass} onChange={setPass}
                placeholder={mode === "signup" ? "Min 8 characters" : "Enter your password"}
                icon={<LockI/>} error={ferrs.pass}>
                {mode === "signup" && <PasswordStrength password={pass}/>}
              </Field>
            )}

            {mode === "signup" && (
              <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm}
                placeholder="Repeat your password" icon={<LockI/>} error={ferrs.confirm}/>
            )}

            {/* Forgot link */}
            {mode === "login" && (
              <div style={{ textAlign:"right", marginBottom:16, marginTop:-4 }}>
                <button type="button" onClick={()=>{setMode("forgot");reset();}} style={{
                  background:"none", border:"none", cursor:"pointer",
                  color:"rgba(255,255,255,0.38)", fontSize:12.5,
                  fontFamily:"inherit", textDecoration:"underline",
                  textUnderlineOffset:2,
                }}>Forgot password?</button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || (locked && lockTimer>0)} style={{
              width:"100%", padding:"12px", marginTop:4,
              background: loading || locked
                ? "rgba(232,48,31,0.35)"
                : "linear-gradient(135deg, #e8301f 0%, #b52015 100%)",
              border:"none", borderRadius:11, color:"white",
              fontSize:14.5, fontWeight:700, fontFamily:"inherit",
              cursor: loading || locked ? "default" : "pointer",
              letterSpacing:"0.02em",
              boxShadow: loading || locked ? "none" : "0 4px 24px rgba(232,48,31,0.35)",
              transition:"opacity 0.2s, transform 0.15s, box-shadow 0.2s",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            }}
            onMouseEnter={e=>{ if(!loading&&!locked){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(232,48,31,0.45)"; }}}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=loading||locked?"none":"0 4px 24px rgba(232,48,31,0.35)"; }}
            >
              {loading && (
                <span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>
              )}
              {mode==="login"  ? "Sign In to RUBRA"   :
               mode==="signup" ? "Create Account"      :
                                 "Send Reset Link"}
            </button>
          </form>
        )}

        {/* ── Switch ── */}
        {mode !== "forgot" ? (
          <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:20 }}>
            {mode === "login"
              ? <>Don't have an account? <Lnk onClick={()=>{setMode("signup");reset();}}>Sign up free</Lnk></>
              : <>Already have an account? <Lnk onClick={()=>{setMode("login");reset();}}>Sign in</Lnk></>
            }
          </p>
        ) : (
          <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:20 }}>
            <Lnk onClick={()=>{setMode("login");reset();}}>← Back to Sign In</Lnk>
          </p>
        )}

        {/* ── Terms + security note ── */}
        <div style={{
          marginTop:18, paddingTop:16,
          borderTop:"1px solid rgba(255,255,255,0.06)",
          textAlign:"center",
        }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.20)", lineHeight:1.7 }}>
            🔒 End-to-end secured · No spam · Rate limited
            {mode === "signup" && (
              <> · By signing up you agree to our <span style={{textDecoration:"underline",cursor:"pointer"}}>Terms</span> &amp; <span style={{textDecoration:"underline",cursor:"pointer"}}>Privacy</span></>
            )}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cardIn  { from{opacity:0;transform:scale(0.94) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

function Lnk({onClick,children}){
  return(
    <button type="button" onClick={onClick} style={{
      background:"none",border:"none",cursor:"pointer",
      color:"#ff5540",fontWeight:600,fontSize:"inherit",fontFamily:"inherit",
      textDecoration:"underline",textDecorationColor:"rgba(255,85,64,0.35)",
      textUnderlineOffset:2,
    }}>{children}</button>
  );
}
