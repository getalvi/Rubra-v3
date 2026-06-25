import { useState, useEffect } from "react";
import { supabase, checkSupabaseHealth } from "../services/supabase";

/* ── Brute-force guard ── */
const K_ATT = "r_att", K_LCK = "r_lck", MAX = 5, WAIT = 15 * 60 * 1000;
const getAtt   = () => parseInt(localStorage.getItem(K_ATT) || "0", 10);
const getLck   = () => parseInt(localStorage.getItem(K_LCK) || "0", 10);
const isLocked = () => Date.now() < getLck();
const lockMins = () => Math.ceil((getLck() - Date.now()) / 60000);
function onFail() {
  const n = getAtt() + 1;
  localStorage.setItem(K_ATT, n);
  if (n >= MAX) {
    localStorage.setItem(K_LCK, Date.now() + WAIT);
    localStorage.setItem(K_ATT, "0");
  }
}
function onOk() {
  localStorage.removeItem(K_ATT);
  localStorage.removeItem(K_LCK);
}

/* ── Friendly error messages ── */
function friendly(msg = "") {
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch"))
    return "Cannot reach server. Check your internet or try again in a moment.";
  if (msg.includes("Invalid login credentials"))
    return "Wrong email or password.";
  if (msg.includes("Email not confirmed"))
    return "Please confirm your email first. Check your inbox.";
  if (msg.includes("User already registered") || msg.includes("already been registered"))
    return "An account with this email already exists. Try signing in.";
  if (msg.includes("Password should be"))
    return "Password must be at least 8 characters.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Too many requests. Please wait a minute and try again.";
  if (msg.includes("invalid") && msg.includes("email"))
    return "Please enter a valid email address.";
  return msg || "Something went wrong. Please try again.";
}

export function useAuth() {
  const [user,    setUser]    = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [healthy, setHealthy] = useState(true); // track if Supabase is reachable

  useEffect(() => {
    // Check Supabase health on mount
    checkSupabaseHealth().then(ok => setHealthy(ok));

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
      setHealthy(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ── Sign Up ── */
  const signUp = async (email, password) => {
    if (isLocked()) return { error: { message: `Too many attempts. Wait ${lockMins()} min.` } };

    // Health check first
    const ok = await checkSupabaseHealth();
    if (!ok) {
      setHealthy(false);
      return { error: { message: "Cannot reach authentication server. Check your internet connection and try again." } };
    }
    setHealthy(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        onFail();
        return { error: { message: friendly(error.message) } };
      }
      onOk();
      return { data, error: null };
    } catch (e) {
      return { error: { message: friendly(e?.message || "Failed to fetch") } };
    }
  };

  /* ── Sign In ── */
  const signIn = async (email, password) => {
    if (isLocked()) return { error: { message: `Too many attempts. Wait ${lockMins()} min.` } };

    const ok = await checkSupabaseHealth();
    if (!ok) {
      setHealthy(false);
      return { error: { message: "Cannot reach authentication server. Check your internet connection and try again." } };
    }
    setHealthy(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        onFail();
        const left = MAX - getAtt();
        const base = friendly(error.message);
        const msg  = left > 0 && left < MAX ? `${base} (${left} attempt${left !== 1 ? "s" : ""} left)` : base;
        return { error: { message: msg } };
      }
      onOk();
      return { data, error: null };
    } catch (e) {
      return { error: { message: friendly(e?.message || "Failed to fetch") } };
    }
  };

  /* ── Sign Out ── */
  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
  };

  /* ── Reset Password ── */
  const resetPassword = async (email) => {
    const ok = await checkSupabaseHealth();
    if (!ok) return { error: { message: "Cannot reach server. Try again later." } };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: window.location.origin }
      );
      return { error: error ? { message: friendly(error.message) } : null };
    } catch (e) {
      return { error: { message: friendly(e?.message) } };
    }
  };

  const meta        = user?.user_metadata;
  const displayName = meta?.full_name || meta?.name || user?.email?.split("@")[0] || "User";
  const initials    = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return {
    user, loading, healthy, displayName, initials,
    signUp, signIn, signOut, resetPassword,
  };
}
