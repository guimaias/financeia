import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginScreen from "./components/LoginScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import FinanceIAApp from "./components/FinanceIAApp";

function Gate() {
  const { loading, user, passwordRecovery } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#F3F5F1" }}>
        <p className="text-sm" style={{ color: "#6B7A72" }}>
          Carregando…
        </p>
      </div>
    );
  }

  if (passwordRecovery) return <ResetPasswordScreen />;
  if (!user) return <LoginScreen />;
  return <FinanceIAApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
