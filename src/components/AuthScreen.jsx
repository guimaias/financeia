import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const palette = {
  ink: "#14261F",
  primary: "#1F6F5C",
  primaryDeep: "#123A30",
  expense: "#B8483A",
  muted: "#6B7A72",
};

function translateError(msg) {
  if (!msg) return "Algo deu errado. Tente novamente.";
  if (msg.includes("Invalid login credentials")) return "Email ou senha incorretos.";
  if (msg.includes("User already registered")) return "Já existe uma conta com esse email.";
  if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("Unable to validate email")) return "Digite um email válido.";
  return msg;
}

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setInfo("Conta criada! Verifique seu email para confirmar antes de entrar.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: "#E7EAE4" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col relative p-6"
        style={{ backgroundColor: "#FFFFFF", border: "8px solid #161616", minHeight: 600, fontFamily: "Inter, sans-serif" }}
      >
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.primaryDeep})`, fontFamily: "Space Grotesk, sans-serif" }}
            >
              F
            </div>
            <h1 className="text-xl font-bold" style={{ color: palette.ink, fontFamily: "Space Grotesk, sans-serif" }}>
              FinanceIA
            </h1>
            <p className="text-sm mt-1" style={{ color: palette.muted }}>
              {mode === "login" ? "Entre para ver suas finanças" : "Crie sua conta gratuita"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "#F1F2EF", color: palette.ink }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "#F1F2EF", color: palette.ink }}
            />

            {error && <p className="text-xs px-1" style={{ color: palette.expense }}>{error}</p>}
            {info && <p className="text-xs px-1" style={{ color: palette.primary }}>{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2"
              style={{ backgroundColor: palette.primary, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            className="text-xs font-medium mt-5 text-center"
            style={{ color: palette.primary }}
          >
            {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
