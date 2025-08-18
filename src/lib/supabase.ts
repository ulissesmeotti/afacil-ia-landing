// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Credenciais fornecidas pela integração nativa do Lovable com Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'As credenciais do Supabase não foram encontradas. ' +
    'Certifique-se de que a integração com Supabase está ativa no Lovable.'
  );
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (primeiros caracteres):', supabaseAnonKey?.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});