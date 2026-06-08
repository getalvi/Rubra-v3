import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://kkeacytrbrnundprstv.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWFjeXRyYnJuZHVuZHByc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzY1MjUsImV4cCI6MjA5NjIxMjUyNX0.axvOFv8Lz4s9F4bW5xYHg3nor0CL9-lPdsNleZbP7cM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  true,
    flowType:            "pkce",
  },
  global: {
    headers: { "X-Client-Info": "rubra-v3" },
  },
});

// OAuth helpers
export const OAUTH_REDIRECT = typeof window !== "undefined"
  ? window.location.origin
  : "http://localhost:3000";

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: OAUTH_REDIRECT,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
}

export async function signInWithGithub() {
  return supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: OAUTH_REDIRECT },
  });
}

export async function signInWithFacebook() {
  return supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: { redirectTo: OAUTH_REDIRECT },
  });
}
