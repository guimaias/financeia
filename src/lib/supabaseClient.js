import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase não configurado. Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. Veja CONFIGURAR_LOGIN_SUPABASE.md"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
