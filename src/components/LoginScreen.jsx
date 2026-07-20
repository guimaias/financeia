import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const palette = {
  primary: "#1F6F5C",
  primaryDeep: "#123A30",
  expense: "#B8483A",
  ink: "#14261F",
  muted: "#6B7A72",
  border: "#E4E7E1",
  card: "#FFFFFF",
  bg: "#F3F5F1",
};

function fieldStyle() {
  return { backgroundColor: "#F6F7F4", border: `1px solid ${palette.border}` };
}

function friendlyError(message) {
  if (!message) return "Algo deu errado. Tente novamente.";
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already"))
    return "Esse email já tem uma conta. Tente entrar em vez de cadastrar.";
  if (m.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (m.includes("password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("email not confirmed")) return "Confirme seu email antes de entrar. Verifique sua caixa de entrada.";
  if (m.includes("rate limit")) return "Muitas tentativas seguidas. Aguarde um pouco e tente de novo.";
  return message;
}

export default function LoginScreen({ initialMode = "login" }) {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function resetMessages() {
    setError("");
    setNotice("");
  }

  function switchMode(next) {
    setMode(next);
    resetMessages();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();

    if (mode === "forgot") {
      if (!email) {
        setError("Digite seu email.");
        return;
      }
      setLoading(true);
      const { error: resetErr } = await sendPasswordReset(email);
      setLoading(false);
      if (resetErr) {
        setError(friendlyError(resetErr.message));
        return;
      }
      setNotice("Link enviado! Verifique seu email para redefinir a senha.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error: authErr } = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);

    if (authErr) {
      setError(friendlyError(authErr.message));
      return;
    }

    if (mode === "signup") {
      setNotice("Conta criada! Se a confirmação de email estiver ativa, verifique sua caixa de entrada antes de entrar.");
    }
  }

  const title = mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Recuperar senha";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: palette.bg }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div className="w-full max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.primaryDeep})`,
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            F
          </div>
          <span className="text-lg font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: palette.ink }}>
            Finance
          </span>
        </div>

        <div className="rounded-3xl p-7" style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}` }}>
          {mode === "forgot" && (
            <button
              onClick={() => switchMode("login")}
              className="flex items-center gap-1 text-xs font-medium mb-4"
              style={{ color: palette.muted }}
            >
              <ArrowLeft size={14} /> Voltar para o login
            </button>
          )}

          <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: palette.ink }}>
            {title}
          </h1>
          <p className="text-xs mb-6" style={{ color: palette.muted }}>
            {mode === "login" && "Entre para acessar suas finanças."}
            {mode === "signup" && "Leva menos de um minuto pra criar sua conta."}
            {mode === "forgot" && "Enviamos um link de redefinição para o seu email."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: palette.muted }}>
                Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={fieldStyle()}>
                <Mail size={15} style={{ color: palette.muted }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="bg-transparent outline-none text-sm flex-1"
                  style={{ color: palette.ink }}
                  autoComplete="email"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: palette.muted }}>
                    Senha
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs font-medium"
                      style={{ color: palette.primary }}
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={fieldStyle()}>
                  <Lock size={15} style={{ color: palette.muted }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent outline-none text-sm flex-1"
                    style={{ color: palette.ink }}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar senha">
                    {showPassword ? (
                      <EyeOff size={15} style={{ color: palette.muted }} />
                    ) : (
                      <Eye size={15} style={{ color: palette.muted }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: palette.muted }}>
                  Confirmar senha
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={fieldStyle()}>
                  <Lock size={15} style={{ color: palette.muted }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent outline-none text-sm flex-1"
                    style={{ color: palette.ink }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label="Mostrar confirmação de senha">
                    {showConfirm ? (
                      <EyeOff size={15} style={{ color: palette.muted }} />
                    ) : (
                      <Eye size={15} style={{ color: palette.muted }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs rounded-lg px-3 py-2" style={{ color: palette.expense, backgroundColor: `${palette.expense}12` }}>
                {error}
              </p>
            )}
            {notice && (
              <p className="text-xs rounded-lg px-3 py-2" style={{ color: palette.primary, backgroundColor: `${palette.primary}12` }}>
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: palette.primary, opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === "login" && "Entrar"}
              {mode === "signup" && "Criar conta"}
              {mode === "forgot" && "Enviar link"}
            </button>
          </form>

          {mode !== "forgot" && (
            <p className="text-xs text-center mt-5" style={{ color: palette.muted }}>
              {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="font-medium"
                style={{ color: palette.primary }}
              >
                {mode === "login" ? "Criar conta" : "Entrar"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
