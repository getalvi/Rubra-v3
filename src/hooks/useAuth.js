import { useState, useEffect, useRef } from "react";
import { supabase, signInWithGoogle, signInWithGithub, signInWithFacebook } from "../services/supabase";

/* ── Brute force protection ── */
const ATTEMPT_KEY  = "rubra_attempts";
const LOCKOUT_KEY  = "rubra_lockout";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000;

const getAttempts = () => parseInt(localStorage.getItem(ATTEMPT_KEY) || "0", 10);
const getLockout  = () => parseInt(localStorage.getItem(LOCKOUT_KEY)  || "0", 10);
const isLocked    = () => Date.now() < getLockout();
const lockSeconds = () => Math.ceil((getLockout() - Date.now()) / 1000);

function failAttempt() {
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

export function useAuth() {
  const [user,    setUser]    = useState(undefined);
  const [loading, setLoading] = useState(true);
  const formStart = useRef(Date.now());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetTimer = () => { formStart.current = Date.now(); };

  /* ── Email Sign Up ── */
  const signUp = async (email, password, fullName, honeypot = "") => {
    if (honeypot)    return { error: { message: "Suspicious request blocked." } };
    if (isLocked())  return { error: { message: `Locked. Try in ${Math.ceil(lockSeconds()/60)} min.` } };

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim(), display_name: fullName.trim() } },
      });
      if (error) { failAttempt(); return { error }; }
      clearAttempts();
      return { data, error: null };
    } catch (e) {
      return { error: { message: "Network error. Check your connection." } };
    }
  };

  /* ── Email Sign In ── */
  const signIn = async (email, password, honeypot = "") => {
    if (honeypot)    return { error: { message: "Suspicious request blocked." } };
    if (isLocked())  return { error: { message: `Too many attempts. Locked for ${Math.ceil(lockSeconds()/60)} min.` } };

    // Bot speed check
    if (Date.now() - formStart.current < 800) await new Promise(r => setTimeout(r, 1200));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        failAttempt();
        const left = MAX_ATTEMPTS - getAttempts();
        return { error: { message: left > 0 ? `Wrong credentials. ${left} attempt${left !== 1 ? "s" : ""} left.` : "Account locked for 15 minutes." } };
      }
      clearAttempts();
      return { data, error: null };
    } catch (e) {
      return { error: { message: "Network error. Check your connection and try again." } };
    }
  };

  /* ── OAuth ── */
  const signInGoogle   = async () => { try { return await signInWithGoogle();   } catch { return { error: { message: "Google sign-in failed." } }; } };
  const signInGithub   = async () => { try { return await signInWithGithub();   } catch { return { error: { message: "GitHub sign-in failed." } }; } };
  const signInFacebook = async () => { try { return await signInWithFacebook(); } catch { return { error: { message: "Facebook sign-in failed." } }; } };

  /* ── Sign out + password reset ── */
  const signOut = async () => supabase.auth.signOut();
  const resetPassword = async (email) => {
    try {
      return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      });
    } catch { return { error: { message: "Network error." } }; }
  };

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.user_metadata?.display_name
    || user?.email?.split("@")[0]
    || "User";

  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  return {
    user, loading, displayName, initials,
    signUp, signIn, signOut, resetPassword,
    signInGoogle, signInGithub, signInFacebook,
    resetTimer,
    attemptsLeft: MAX_ATTEMPTS - getAttempts(),
    isLockedOut: isLocked(),
  };
}
