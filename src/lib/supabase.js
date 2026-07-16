import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Supabase não configurado. Copie .env.example para .env e preencha " +
      "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja CONFIGURAR_LOGIN_SUPABASE.md)."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
