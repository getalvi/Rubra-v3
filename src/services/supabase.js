import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://tmlnhsofgxjfchnxcooj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbG5oc29mZ3hqZmNobnhjb29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjQzNDAsImV4cCI6MjA5Njg0MDM0MH0.LsIZbHi60-dk1VpvtFvV54TJiBq4Z1GyPCiYpmMpAis";

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
