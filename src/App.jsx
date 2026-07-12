import { useAuth } from './hooks/useAuth'
import AuthScreen from './components/AuthScreen'
import FinanceIAApp from './components/FinanceIAApp'

export default function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center" style={{ backgroundColor: '#E7EAE4' }}>
        <p style={{ color: '#6B7A72', fontFamily: 'Inter, sans-serif' }}>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4">
      <FinanceIAApp userId={user.id} userEmail={user.email} onLogout={signOut} />
    </div>
  )
}
