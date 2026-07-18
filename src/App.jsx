import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LandingPage from "./components/LandingPage";
import LoginScreen from "./components/LoginScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import FinanceIAApp from "./components/FinanceIAApp";

function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#F3F5F1" }}>
      <p className="text-sm" style={{ color: "#6B7A72" }}>
        Carregando…
      </p>
    </div>
  );
}

function AppGate() {
  const { loading, user, passwordRecovery } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  if (loading) return <LoadingScreen />;
  if (passwordRecovery) return <ResetPasswordScreen />;
  if (!user) return <LoginScreen initialMode={initialMode} />;
  return <FinanceIAApp />;
}

function LandingGate() {
  const { loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/app" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingGate />} />
          <Route path="/app" element={<AppGate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
