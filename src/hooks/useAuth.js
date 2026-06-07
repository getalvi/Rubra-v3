import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";

/* ── Client-side rate limiting & brute force protection ── */
const ATTEMPT_KEY  = "rubra_login_attempts";
const LOCKOUT_KEY  = "rubra_lockout_until";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000; // 15 minutes

function getAttempts()  { return parseInt(localStorage.getItem(ATTEMPT_KEY) || "0", 10); }
function getLockout()   { return parseInt(localStorage.getItem(LOCKOUT_KEY)  || "0", 10); }
function isLockedOut()  { return Date.now() < getLockout(); }
function getRemainingLockoutSeconds() { return Math.ceil((getLockout() - Date.now()) / 1000); }

function recordFailedAttempt() {
  const n = getAttempts() + 1;
  localStorage.setItem(ATTEMPT_KEY, String(n));
  if (n >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
    localStorage.setItem(ATTEMPT_KEY, "0");
  }
}

function clearAttempts() {
  localStorage.removeItem(ATTEMPT_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

/* ── Simple honeypot + timing check ── */
function isSuspiciouslyFast(startTime) {
  return Date.now() - startTime < 800; // Bots fill forms in <800ms
}

export function useAuth() {
  const [user,    setUser]    = useState(undefined);
  const [loading, setLoading] = useState(true);
  const formStartTime = useRef(Date.now());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetFormTimer = () => { formStartTime.current = Date.now(); };

  const signUp = async (email, password, fullName, honeypot = "") => {
    // Honeypot check — bots fill hidden fields
    if (honeypot) return { error: { message: "Suspicious activity detected." } };
    // Rate limiting
    if (isLockedOut()) {
      return { error: { message: `Too many attempts. Try again in ${Math.ceil(getRemainingLockoutSeconds()/60)} minutes.` } };
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim(), display_name: fullName.trim() } },
    });
    if (error) { recordFailedAttempt(); return { error }; }
    clearAttempts();
    return { data, error: null };
  };

  const signIn = async (email, password, honeypot = "") => {
    // Honeypot
    if (honeypot) return { error: { message: "Suspicious activity detected." } };
    // Speed check
    if (isSuspiciouslyFast(formStartTime.current)) {
      await new Promise(r => setTimeout(r, 1200)); // add delay
    }
    // Lockout check
    if (isLockedOut()) {
      return { error: { message: `Too many failed attempts. Locked for ${Math.ceil(getRemainingLockoutSeconds()/60)} min.` } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    if (error) {
      recordFailedAttempt();
      const remaining = MAX_ATTEMPTS - getAttempts();
      const msg = remaining > 0
        ? `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
        : "Too many failed attempts. Account temporarily locked.";
      return { error: { message: msg } };
    }
    clearAttempts();
    return { data, error: null };
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin,
    });
    return { error };
  };

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.display_name
    || user?.email?.split("@")[0]
    || "User";

  const initials = displayName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return {
    user, loading, displayName, initials,
    signUp, signIn, signOut, resetPassword,
    resetFormTimer,
    attemptsLeft: MAX_ATTEMPTS - getAttempts(),
    isLockedOut: isLockedOut(),
  };
}
