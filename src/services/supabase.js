import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tmlnhsofgxjfchnxcooj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbG5oc29mZ3hqZmNobnhjb29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjQzNDAsImV4cCI6MjA5Njg0MDM0MH0.LsIZbHi60-dk1VpvtFvV54TJiBq4Z1GyPCiYpmMpAis";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
