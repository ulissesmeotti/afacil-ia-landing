// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Lovable's native Supabase integration automatically provides these values
const supabaseUrl = "https://fpajmowdardbslmchqun.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWptb3dkYXJkYnNsbWNocXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMzc2ODQsImV4cCI6MjA1MDcxMzY4NH0.bFJlgOGO8Tw8L8pn2kzqJXhvV7lh6AJQEhpUTQ-5GwY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);