import { useState } from "react";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const palette = {
  primary: "#1F6F5C",
  expense: "#B8483A",
  ink: "#14261F",
  muted: "#6B7A72",
  border: "#E4E7E1",
  card: "#FFFFFF",
  bg: "#F3F5F1",
};

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error: updErr } = await updatePassword(password);
    setLoading(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: palette.bg }}>
      <div
        className="w-full max-w-sm rounded-3xl p-7"
        style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}`, fontFamily: "Inter, sans-serif" }}
      >
        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={32} style={{ color: palette.primary }} className="mx-auto mb-3" />
            <h1 className="text-lg font-semibold mb-1" style={{ color: palette.ink, fontFamily: "Space Grotesk, sans-serif" }}>
              Senha atualizada
            </h1>
            <p className="text-xs" style={{ color: palette.muted }}>
              Você já pode continuar usando o Finance normalmente.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold mb-1" style={{ color: palette.ink, fontFamily: "Space Grotesk, sans-serif" }}>
              Nova senha
            </h1>
            <p className="text-xs mb-5" style={{ color: palette.muted }}>
              Escolha uma nova senha para sua conta.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: "#F6F7F4", border: `1px solid ${palette.border}` }}
              >
                <Lock size={15} style={{ color: palette.muted }} />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="bg-transparent outline-none text-sm flex-1"
                  style={{ color: palette.ink }}
                />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label="Mostrar senha">
                  {show ? <EyeOff size={15} style={{ color: palette.muted }} /> : <Eye size={15} style={{ color: palette.muted }} />}
                </button>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: "#F6F7F4", border: `1px solid ${palette.border}` }}
              >
                <Lock size={15} style={{ color: palette.muted }} />
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirmar nova senha"
                  className="bg-transparent outline-none text-sm flex-1"
                  style={{ color: palette.ink }}
                />
              </div>
              {error && (
                <p className="text-xs rounded-lg px-3 py-2" style={{ color: palette.expense, backgroundColor: `${palette.expense}12` }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: palette.primary, opacity: loading ? 0.7 : 1 }}
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Salvar nova senha
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
