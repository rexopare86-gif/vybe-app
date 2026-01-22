// lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// 🔐 Put your own values here from
// Supabase Dashboard → Settings → API
export const SUPABASE_URL = "https://ifqakmvzdgsbutjfksfj.supabase.co"; // <-- your URL
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcWFrbXZ6ZGdzYnV0amZrc2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDIzNjgsImV4cCI6MjA4MjU3ODM2OH0.Y7qDjZVfM4j9-nh-tE7O4f4QmSRTx1-BeS-qTjVtroY"; // <-- your anon key

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("⚠️ Supabase env vars are missing!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
