import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

/* simple brute-force guard */
const K_ATT = "r_att", K_LCK = "r_lck", MAX = 5, WAIT = 15 * 60 * 1000;
const getAtt  = () => parseInt(localStorage.getItem(K_ATT) || "0", 10);
const getLck  = () => parseInt(localStorage.getItem(K_LCK) || "0", 10);
const isLocked = () => Date.now() < getLck();
function onFail() {
  const n = getAtt() + 1;
  localStorage.setItem(K_ATT, n);
  if (n >= MAX) { localStorage.setItem(K_LCK, Date.now() + WAIT); localStorage.setItem(K_ATT, "0"); }
}
function onOk() { localStorage.removeItem(K_ATT); localStorage.removeItem(K_LCK); }

export function useAuth() {
  const [user,    setUser]    = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

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

  const signUp = async (email, password) => {
    if (isLocked()) return { error: { message: `Too many attempts. Wait ${Math.ceil((getLck()-Date.now())/60000)} min.` } };
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
      if (error) { onFail(); return { error }; }
      onOk();
      return { data, error: null };
    } catch {
      return { error: { message: "Network error — check your connection." } };
    }
  };

  const signIn = async (email, password) => {
    if (isLocked()) return { error: { message: `Too many attempts. Wait ${Math.ceil((getLck()-Date.now())/60000)} min.` } };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) {
        onFail();
        const left = MAX - getAtt();
        return { error: { message: left > 0 ? `Invalid credentials. ${left} attempt${left !== 1 ? "s" : ""} left.` : "Account locked for 15 min." } };
      }
      onOk();
      return { data, error: null };
    } catch {
      return { error: { message: "Network error — check your connection." } };
    }
  };

  const signOut = () => supabase.auth.signOut();

  const resetPassword = async (email) => {
    try {
      return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin });
    } catch {
      return { error: { message: "Network error." } };
    }
  };

  const meta = user?.user_metadata;
  const displayName = meta?.full_name || meta?.name || user?.email?.split("@")[0] || "User";
  const initials    = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return { user, loading, displayName, initials, signUp, signIn, signOut, resetPassword };
}
