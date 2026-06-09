import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://kkeacytrbrnundprstv.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWFjeXRyYnJuZHVuZHByc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzY1MjUsImV4cCI6MjA5NjIxMjUyNX0.axvOFv8Lz4s9F4bW5xYHg3nor0CL9-lPdsNleZbP7cM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: true,
    flowType:           "pkce",
  },
});

const redirect = () =>
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirect(),
      queryParams: { access_type: "offline", prompt: "select_account" },
    },
  });

export const signInWithGithub = () =>
  supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: redirect() },
  });

export const signInWithFacebook = () =>
  supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: { redirectTo: redirect() },
  });
