import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kkeacytrbrnundprstv.supabase.co";

// নিচে ড্যাশবোর্ডের Settings > API থেকে কপি করা একদম নতুন Anon Key-টি বসান
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWFjeXRyYnJuZHVuZHByc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzY1MjUsImV4cCI6MjA5NjIxMjUyNX0.axvOFv8Lz4s9F4bW5xYHg3nor0CL9-lPdsNleZbP7cM"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
