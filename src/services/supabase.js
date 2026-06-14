import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://kkeacytrbrnundprstv.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWFjeXRyYnJuZHVuZHByc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzY1MjUsImV4cCI6MjA5NjIxMjUyNX0.axvOFv8Lz4s9F4bW5xYHg3nor0CL9-lPdsNleZbP7cM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export async function checkSupabaseHealth() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
