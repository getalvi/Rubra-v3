import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://kkeacytrbrnundprstv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWFjeXRyYnJuZHVuZHByc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzY1MjUsImV4cCI6MjA5NjIxMjUyNX0.axvOFv8Lz4s9F4bW5xYHg3nor0CL9-lPdsNleZbP7cM",
  {
    auth: {
      autoRefreshToken:   true,
      persistSession:     true,
      detectSessionInUrl: true,
      flowType:           "pkce",
    },
  }
);
