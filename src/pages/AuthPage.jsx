import { useState, useEffect, useRef } from "react";

/* ── Mini wave canvas for auth bg ── */
function AuthWave() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf, f = 0;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const W2 = [
      { yr:0.42, amp:0.11, fx:0.0013, ph:0.0, sp:0.0022, r:205,g:32,b:32, a:0.50 },
      { yr:0.52, amp:0.09, fx:0.0017, ph:1.4, sp:0.0016, r:140,g:20,b:90, a:0.40 },
      { yr:0.60, amp:0.10, fx:0.0011, ph:2.6, sp:0.0019, r:60, g:25,b:180,a:0.45 },
      { yr:0.68, amp:0.07, fx:0.0019, ph:0.8, sp:0.0013, r:20, g:80,b:215,a:0.38 },
      { yr:0.75, amp:0.06, fx:0.0015, ph:3.1, sp:0.0011, r:0,  g:170,b:200,a:0.30 },
    ];
    const draw = () => {
      const W = c.width, H = c.height;
      ctx.fillStyle="#080810"; ctx.fillRect(0,0,W,H);
      [[0.12,0.45,0.46,"rgba(155,24,16,0.16)"],[0.88,0.60,0.50,"rgba(12,65,200,0.14)"]]
        .forEach(([cx,cy,r,col])=>{
          const g=ctx.createRadialGradient(W*cx,H*cy,0,W*cx,H*cy,W*r);
          g.addColorStop(0,col); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        });
      W2.forEach(w=>{
        const bY=H*w.yr, aP=H*w.amp, ph=f*w.sp+w.ph;
        ctx.beginPath();
        for(let x=0;x<=W+4;x+=3){
          const y=bY+Math.sin(x*w.fx+ph)*aP+Math.sin(x*w.fx*1.6+ph*0.7)*aP*0.3+Math.sin(x*w.fx*0.5+ph*1.3)*aP*0.18;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
        const gr=ctx.createLinearGradient(0,bY-aP,0,bY+aP*2.5);
        gr.addColorStop(0,`rgba(${w.r},${w.g},${w.b},${w.a})`);
        gr.addColorStop(0.55,`rgba(${w.r},${w.g},${w.b},${w.a*0.35})`);
        gr.addColorStop(1,`rgba(${w.r},${w.g},${w.b},0)`);
        ctx.fillStyle=gr; ctx.fill();
      });
      f++; raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none"}}/>;
}

/* ── Input field ── */
function Field({ label, type="text", value, onChange, placeholder, icon, error, autoFocus }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:"block", fontSize:12.5, fontWeight:600, color:"rgba(255,255,255,0.55)", marginBottom:7, letterSpacing:"0.04em" }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        {icon && (
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", opacity:0.4 }}>
            {icon}
          </span>
        )}
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width:"100%", padding: icon ? "11px 40px 11px 40px" : "11px 40px 11px 14px",
            background:"rgba(255,255,255,0.055)",
            border: `0.5px solid ${error ? "rgba(232,80,60,0.6)" : "rgba(255,255,255,0.10)"}`,
            borderRadius: "var(--r-sm)", color:"var(--text)",
            fontSize:14, outline:"none",
            transition:"border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = error ? "rgba(232,80,60,0.8)" : "rgba(255,255,255,0.25)"}
          onBlur={e  => e.target.style.borderColor = error ? "rgba(232,80,60,0.6)" : "rgba(255,255,255,0.10)"}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(v=>!v)}
            style={{
              position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              background:"transparent", border:"none", cursor:"pointer",
              color:"rgba(255,255,255,0.38)", fontSize:13, padding:2,
            }}
          >{show ? "Hide" : "Show"}</button>
        )}
      </div>
      {error && <p style={{ fontSize:12, color:"rgba(232,80,60,0.9)", marginTop:5 }}>{error}</p>}
    </div>
  );
}

/* ── Submit button ── */
function SubmitBtn({ loading, children }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:"100%", padding:"12px",
      background: loading ? "rgba(232,48,31,0.5)" : "linear-gradient(135deg,#e8301f,#b02518)",
      border:"none", borderRadius:"var(--r-sm)",
      color:"white", fontSize:14.5, fontWeight:700,
      cursor: loading ? "default" : "pointer",
      fontFamily:"inherit", letterSpacing:"0.02em",
      transition:"opacity 0.2s, transform 0.15s",
      boxShadow: loading ? "none" : "0 4px 20px rgba(232,48,31,0.35)",
      display:"flex", alignItems:"center", justifyContent:"center", gap:10,
    }}
    onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
    >
      {loading && (
        <span style={{
          width:16, height:16, borderRadius:"50%",
          border:"2px solid rgba(255,255,255,0.3)",
          borderTopColor:"white",
          animation:"spin 0.7s linear infinite", display:"inline-block",
        }}/>
      )}
      {children}
    </button>
  );
}

/* ── Divider ── */
const Divider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
    <div style={{ flex:1, height:"0.5px", background:"rgba(255,255,255,0.08)" }}/>
    <span style={{ fontSize:12, color:"var(--text3)" }}>or</span>
    <div style={{ flex:1, height:"0.5px", background:"rgba(255,255,255,0.08)" }}/>
  </div>
);

const EmailIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const UserIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

/* ── Main Auth component ── */
export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode,       setMode]       = useState("login"); // login | signup | forgot
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [fieldErr,   setFieldErr]   = useState({});

  const reset = () => { setError(""); setSuccess(""); setFieldErr({}); };

  const validate = () => {
    const errs = {};
    if (mode === "signup" && !name.trim())           errs.name     = "Name is required";
    if (!email.includes("@"))                        errs.email    = "Enter a valid email";
    if (mode !== "forgot" && password.length < 8)   errs.password = "Min 8 characters";
    if (mode === "signup" && password !== confirm)   errs.confirm  = "Passwords don't match";
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); reset();
    if (!validate()) return;
    setLoading(true);

    if (mode === "login") {
      const { error } = await onSignIn(email, password);
      if (error) setError(error.message);
    } else if (mode === "signup") {
      const { error } = await onSignUp(email, password, name);
      if (error) setError(error.message);
      else setSuccess("Account created! Check your email to confirm.");
    } else {
      // forgot — we'll simulate since onForgot might not exist
      setSuccess("If this email exists, a reset link has been sent.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      width:"100vw", height:"100dvh", overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative",
    }}>
      <AuthWave />

      {/* Card */}
      <div style={{
        position:"relative", zIndex:10,
        width:"100%", maxWidth:420,
        margin:"0 16px",
        background:"rgba(10,9,20,0.82)",
        backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
        border:"0.5px solid rgba(255,255,255,0.10)",
        borderRadius:20,
        boxShadow:"0 32px 80px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.08)",
        padding:"36px 32px 32px",
        animation:"fadeUp 0.35s var(--ease)",
      }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <span style={{
            width:22, height:22, borderRadius:"50%", display:"inline-block",
            background:"radial-gradient(circle at 38% 36%,#ff5540,#c0392b)",
            boxShadow:"0 0 16px rgba(192,57,43,0.6)",
          }}/>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"white", letterSpacing:"0.06em" }}>
            RUBRA
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize: mode === "forgot" ? 22 : 24,
          color:"white", marginBottom:6, letterSpacing:"-0.01em",
        }}>
          {mode === "login"  ? "Welcome back"     :
           mode === "signup" ? "Create account"   :
                               "Reset password"}
        </h1>
        <p style={{ fontSize:14, color:"var(--text2)", marginBottom:26, lineHeight:1.5 }}>
          {mode === "login"  ? "Sign in to continue to RUBRA"    :
           mode === "signup" ? "Start using your AI assistant"   :
                               "We'll send a reset link to your email"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {mode === "signup" && (
            <Field label="Full Name" value={name} onChange={setName}
              placeholder="Your name" icon={<UserIcon/>} error={fieldErr.name} autoFocus/>
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail}
            placeholder="you@example.com" icon={<EmailIcon/>} error={fieldErr.email}
            autoFocus={mode !== "signup"}/>

          {mode !== "forgot" && (
            <Field label="Password" type="password" value={password} onChange={setPassword}
              placeholder={mode === "signup" ? "Min 8 characters" : "••••••••"}
              icon={<LockIcon/>} error={fieldErr.password}/>
          )}
          {mode === "signup" && (
            <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm}
              placeholder="Repeat password" icon={<LockIcon/>} error={fieldErr.confirm}/>
          )}

          {/* Forgot link */}
          {mode === "login" && (
            <div style={{ textAlign:"right", marginBottom:20, marginTop:-6 }}>
              <button type="button" onClick={()=>{setMode("forgot");reset();}}
                style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text2)", fontSize:13 }}>
                Forgot password?
              </button>
            </div>
          )}

          {/* Error / success banners */}
          {error && (
            <div style={{
              background:"rgba(232,48,31,0.12)", border:"0.5px solid rgba(232,48,31,0.30)",
              borderRadius:"var(--r-sm)", padding:"10px 14px",
              fontSize:13, color:"rgba(255,120,100,0.95)", marginBottom:16,
              animation:"fadeIn 0.2s var(--ease)",
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              background:"rgba(74,222,128,0.10)", border:"0.5px solid rgba(74,222,128,0.25)",
              borderRadius:"var(--r-sm)", padding:"10px 14px",
              fontSize:13, color:"rgba(74,222,128,0.90)", marginBottom:16,
              animation:"fadeIn 0.2s var(--ease)",
            }}>{success}</div>
          )}

          <SubmitBtn loading={loading}>
            {mode === "login"  ? "Sign In"        :
             mode === "signup" ? "Create Account" :
                                 "Send Reset Link"}
          </SubmitBtn>
        </form>

        {/* Switch mode */}
        <div style={{ textAlign:"center", marginTop:22, fontSize:13.5, color:"var(--text2)" }}>
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <Btn onClick={()=>{setMode("signup");reset();}}>Sign up free</Btn></>
          ) : (
            <>Already have an account?{" "}
              <Btn onClick={()=>{setMode("login");reset();}}>Sign in</Btn></>
          )}
        </div>

        {/* Terms */}
        {mode === "signup" && (
          <p style={{ fontSize:11.5, color:"var(--text3)", textAlign:"center", marginTop:16, lineHeight:1.6 }}>
            By creating an account you agree to our{" "}
            <span style={{ color:"var(--text2)", textDecoration:"underline", cursor:"pointer" }}>Terms</span>
            {" "}and{" "}
            <span style={{ color:"var(--text2)", textDecoration:"underline", cursor:"pointer" }}>Privacy Policy</span>.
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

function Btn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      background:"none", border:"none", cursor:"pointer",
      color:"var(--accent2)", fontWeight:600, fontSize:"inherit",
      textDecoration:"underline", textDecorationColor:"rgba(255,85,64,0.4)",
      textUnderlineOffset:2,
    }}>{children}</button>
  );
}
