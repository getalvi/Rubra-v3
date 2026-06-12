import { createClient } from "@supabase/supabase-js";

// এনভায়রনমেন্ট ভ্যারিয়েবল থেকে ইউআরএল এবং অ্যানন কি রিড করা হচ্ছে
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kkeacytrbrnundprstv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWFjeXRyYnJuZHVuZHByc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzY1MjUsImV4cCI6MjA5NjIxMjUyNX0.axvOFv8Lz4s9F4bW5xYHg3nor0CL9-lPdsNleZbP7cM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: true,
    // flowType অপশনটি পুরোপুরি রিমুভ করা হয়েছে যাতে Supabase নিজে থেকে তার ডিফল্ট ফ্লো হ্যান্ডেল করতে পারে
  },
});
