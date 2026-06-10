import { useState } from "react";

/* ── tiny eye icons ── */
const EyeOn = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
  </svg>
);

/* ── password strength ── */
function StrengthMeter({ pw }) {
  if (!pw) return null;
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const colors = { 1:"#ef4444", 2:"#f97316", 3:"#eab308", 4:"#22c55e", 5:"#16a34a" };
  const labels = { 1:"Very weak", 2:"Weak", 3:"Fair", 4:"Strong", 5:"Very strong" };
  const col = colors[score] || "#ef4444";
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-0.5 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= score ? col : "#1e1e2e" }}/>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-medium" style={{ color: col }}>{labels[score]}</span>
        <div className="flex gap-3">
          {[["8+", pw.length>=8], ["A-Z", /[A-Z]/.test(pw)], ["0-9", /\d/.test(pw)], ["#@", /[^A-Za-z0-9]/.test(pw)]].map(([k,v]) => (
            <span key={k} className="text-[10px]" style={{ color: v ? "#22c55e" : "#3a3a55" }}>
              {v ? "✓" : "·"} {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── single input field ── */
function Input({ label, type = "text", value, onChange, placeholder, error, autoFocus }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a4a6a" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={isPass ? "current-password" : type === "email" ? "email" : "off"}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-colors duration-150"
          style={{
            background: "#111118",
            border: `1px solid ${error ? "#7f1d1d" : "#1e1e2e"}`,
            color: "#e8e8f0",
            caretColor: "#e8301f",
          }}
          onFocus={e => e.target.style.borderColor = error ? "#ef4444" : "#2e2e4e"}
          onBlur={e  => e.target.style.borderColor = error ? "#7f1d1d" : "#1e1e2e"}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3a55] hover:text-[#8080a0] transition-colors">
            {show ? <EyeOff/> : <EyeOn/>}
          </button>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
}

/* ── main auth modal ── */
export default function AuthModal({ onSignIn, onSignUp, onResetPassword }) {
  const [mode,    setMode]    = useState("login"); // login | signup | forgot
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [conf,    setConf]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [ferr,    setFerr]    = useState({});

  const go = m => { setMode(m); setError(""); setSuccess(""); setFerr({}); };

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (mode !== "forgot") {
      if (pass.length < 8) e.pass = "Minimum 8 characters required";
      if (mode === "signup" && pass !== conf) e.conf = "Passwords do not match";
    }
    setFerr(e);
    return !Object.keys(e).length;
  };

  const submit = async e => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!validate()) return;
    setLoading(true);

    if (mode === "login") {
      const { error } = await onSignIn(email, pass);
      if (error) setError(error.message);
    } else if (mode === "signup") {
      const { error } = await onSignUp(email, pass);
      if (error) setError(error.message);
      else setSuccess("Account created! Check your email to confirm, then sign in.");
    } else {
      const { error } = await onResetPassword(email);
      if (error) setError(error.message);
      else setSuccess("Reset link sent — check your inbox.");
    }
    setLoading(false);
  };

  return (
    /* full-screen backdrop — not dismissable */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "#0a0a0f" }}>

      <div className="w-full max-w-sm">

        {/* logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="w-5 h-5 rounded-full flex-shrink-0"
            style={{ background: "radial-gradient(circle at 38% 36%, #ff5540, #c0392b)" }}/>
          <span className="font-display font-extrabold text-xl tracking-wider text-white">RUBRA</span>
        </div>

        {/* heading */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-white mb-1 tracking-tight">
            {mode === "login"  ? "Sign in"         :
             mode === "signup" ? "Create account"  :
                                 "Reset password"}
          </h1>
          <p className="text-sm" style={{ color: "#5a5a7a" }}>
            {mode === "login"  ? "Welcome back to RUBRA"               :
             mode === "signup" ? "Start using AI — it's free"          :
                                 "We'll email you a reset link"}
          </p>
        </div>

        {/* tab switcher — login / signup only */}
        {mode !== "forgot" && (
          <div className="flex mb-6 rounded-lg p-0.5" style={{ background: "#111118", border: "1px solid #1e1e2e" }}>
            {[["login","Sign In"],["signup","Sign Up"]].map(([m, lbl]) => (
              <button key={m} type="button" onClick={() => go(m)}
                className="flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-150"
                style={{
                  background:   mode === m ? "#1e1e2e"             : "transparent",
                  color:        mode === m ? "#e8e8f0"             : "#4a4a6a",
                }}>
                {lbl}
              </button>
            ))}
          </div>
        )}

        {/* alerts */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
            <span className="mt-0.5 flex-shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 px-3.5 py-2.5 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "#0a1a0a", border: "1px solid #14532d", color: "#86efac" }}>
            <span className="mt-0.5 flex-shrink-0">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* form */}
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={ferr.email}
            autoFocus
          />

          {mode !== "forgot" && (
            <div>
              <Input
                label="Password"
                type="password"
                value={pass}
                onChange={setPass}
                placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
                error={ferr.pass}
              />
              {mode === "signup" && <StrengthMeter pw={pass}/>}
            </div>
          )}

          {mode === "signup" && (
            <Input
              label="Confirm password"
              type="password"
              value={conf}
              onChange={setConf}
              placeholder="Repeat your password"
              error={ferr.conf}
            />
          )}

          {/* forgot password link */}
          {mode === "login" && (
            <div className="text-right -mt-1">
              <button type="button" onClick={() => go("forgot")}
                className="text-xs transition-colors"
                style={{ color: "#4a4a6a" }}
                onMouseEnter={e => e.target.style.color="#8080a0"}
                onMouseLeave={e => e.target.style.color="#4a4a6a"}>
                Forgot password?
              </button>
            </div>
          )}

          {/* submit */}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 flex items-center justify-center gap-2"
            style={{
              background: "#e8301f",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "default" : "pointer",
              marginTop: 8,
            }}>
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white inline-block"
                style={{ animation: "spin .6s linear infinite" }}/>
            )}
            {mode === "login"  ? "Sign In"           :
             mode === "signup" ? "Create Account"    :
                                 "Send Reset Link"}
          </button>
        </form>

        {/* mode switch footer */}
        <p className="mt-5 text-center text-sm" style={{ color: "#4a4a6a" }}>
          {mode === "forgot" ? (
            <>
              <button type="button" onClick={() => go("login")}
                className="transition-colors" style={{ color: "#e8301f" }}
                onMouseEnter={e => e.target.style.opacity=0.8}
                onMouseLeave={e => e.target.style.opacity=1}>
                ← Back to Sign In
              </button>
            </>
          ) : mode === "login" ? (
            <>No account?{" "}
              <button type="button" onClick={() => go("signup")}
                className="font-medium transition-colors" style={{ color: "#e8301f" }}>
                Sign up free
              </button>
            </>
          ) : (
            <>Have an account?{" "}
              <button type="button" onClick={() => go("login")}
                className="font-medium transition-colors" style={{ color: "#e8301f" }}>
                Sign in
              </button>
            </>
          )}
        </p>

        {/* security note */}
        <p className="mt-6 text-center text-[11px]" style={{ color: "#2e2e4e" }}>
          🔒 Secured by Supabase Auth · Rate limited
          {mode === "signup" && " · By signing up you agree to our Terms"}
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
