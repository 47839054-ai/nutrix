import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import logo from '../assets/logo.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('El email es obligatorio')
      return
    }
    if (!password) {
      setError('La contraseña es obligatoria')
      return
    }

    setLoading(true)
    try {
      const data = await login(email.trim(), password)
      if (data.profile?.testCompleted) {
        navigate('/app/dashboard')
      } else {
        navigate('/app/test')
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    try {
      const data = await loginWithGoogle(credentialResponse.credential)
      if (data.profile?.testCompleted) {
        navigate('/app/dashboard')
      } else {
        navigate('/app/test')
      }
    } catch (err) {
      setError(err.message || 'Error al autenticar con Google')
    }
  }

  const handleGoogleError = () => {
    setError('Error al iniciar sesión con Google')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg shadow-brand-500/30 ring-2 ring-brand-500/40">
            <img src={logo} alt="Nutrix" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nutrix</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Login */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <div className="flex justify-center mb-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500">o</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-brand-500 dark:text-brand-400 font-semibold hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
