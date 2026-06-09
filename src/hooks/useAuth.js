import { useState, useEffect, useRef } from "react";
import { supabase, signInWithGoogle, signInWithGithub, signInWithFacebook } from "../services/supabase";

/* ── Brute-force protection (client-side) ── */
const A_KEY = "rubra_att";
const L_KEY = "rubra_lock";
const MAX   = 5;
const LOCK  = 15 * 60 * 1000; // 15 min

const getAtt  = ()  => parseInt(localStorage.getItem(A_KEY) || "0", 10);
const getLock = ()  => parseInt(localStorage.getItem(L_KEY) || "0", 10);
const locked  = ()  => Date.now() < getLock();
const lockSec = ()  => Math.ceil((getLock() - Date.now()) / 1000);

function fail() {
  const n = getAtt() + 1;
  localStorage.setItem(A_KEY, n);
  if (n >= MAX) {
    localStorage.setItem(L_KEY, Date.now() + LOCK);
    localStorage.setItem(A_KEY, "0");
  }
}
function clear() {
  localStorage.removeItem(A_KEY);
  localStorage.removeItem(L_KEY);
}

export function useAuth() {
  const [user,    setUser]    = useState(undefined);
  const [loading, setLoading] = useState(true);
  const t0 = useRef(Date.now());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetTimer = () => { t0.current = Date.now(); };

  const signUp = async (email, password, fullName, honeypot = "") => {
    if (honeypot)  return { error: { message: "Bot detected." } };
    if (locked())  return { error: { message: `Locked ${Math.ceil(lockSec()/60)} min.` } };
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) { fail(); return { error }; }
      clear();
      return { data, error: null };
    } catch { return { error: { message: "Network error. Check your connection." } }; }
  };

  const signIn = async (email, password, honeypot = "") => {
    if (honeypot)  return { error: { message: "Bot detected." } };
    if (locked())  return { error: { message: `Too many attempts. Try in ${Math.ceil(lockSec()/60)} min.` } };
    if (Date.now() - t0.current < 800) await new Promise(r => setTimeout(r, 1000));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (error) {
        fail();
        const left = MAX - getAtt();
        return { error: { message: left > 0 ? `Wrong credentials. ${left} attempt${left !== 1 ? "s" : ""} left.` : "Account locked 15 min." } };
      }
      clear();
      return { data, error: null };
    } catch { return { error: { message: "Network error. Check your connection." } }; }
  };

  const signInGoogle   = async () => { try { return await signInWithGoogle();   } catch { return { error: { message: "Google sign-in failed." } }; } };
  const signInGithub   = async () => { try { return await signInWithGithub();   } catch { return { error: { message: "GitHub sign-in failed." } }; } };
  const signInFacebook = async () => { try { return await signInWithFacebook(); } catch { return { error: { message: "Facebook sign-in failed." } }; } };

  const signOut = () => supabase.auth.signOut();

  const resetPassword = async (email) => {
    try {
      return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      });
    } catch { return { error: { message: "Network error." } }; }
  };

  const raw = user?.user_metadata;
  const displayName = raw?.full_name || raw?.name || raw?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return {
    user, loading, displayName, initials,
    signUp, signIn, signOut, resetPassword,
    signInGoogle, signInGithub, signInFacebook,
    resetTimer,
    attemptsLeft: MAX - getAtt(),
    isLockedOut: locked(),
  };
}
