// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Use the Supabase URL and anon key provided by Lovable's Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fpajmowdardbslmchqun.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWptb3dkYXJkYnNsbWNocXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA5NjgsImV4cCI6MjA2OTkwNjk2OH0.wLXKMr-gym-oiB61cOQ0xS6DSkGBzzFv9oPB4SnImEc";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

console.log('Supabase client initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);