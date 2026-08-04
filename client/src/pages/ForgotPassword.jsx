import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react'
import logo from '../assets/logo.png'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: código + contraseña nueva
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Ingresá tu email')
      return
    }
    setLoading(true)
    try {
      const data = await api.auth.forgotPassword(email.trim())
      setMessage(
        data.message || 'Si el email está registrado, te enviamos un código para restablecer la contraseña.',
      )
      setStep(2)
    } catch (err) {
      setError(err.message || 'Error al enviar el código')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!code.trim()) {
      setError('Ingresá el código que recibiste por email')
      return
    }
    if (password.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const data = await api.auth.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: password,
      })
      setMessage(data.message || 'Contraseña restablecida correctamente.')
      setStep(3)
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg shadow-brand-500/30 ring-2 ring-brand-500/40">
            <img src={logo} alt="Nutrix" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recuperar contraseña
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-6 h-0.5 bg-brand-400 rounded-full" />
            <p className="text-[10px] font-light tracking-[0.3em] uppercase text-gray-500 dark:text-gray-400">
              Tu guía de nutrición
            </p>
            <span className="w-6 h-0.5 bg-brand-400 rounded-full" />
          </div>
        </div>

        <div className="card">
          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                ¡Listo!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Tu contraseña fue restablecida. Ya podés iniciar sesión con la nueva.
              </p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Ir a iniciar sesión
              </button>
            </div>
          )}

          {step !== 3 && (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Te enviamos un código de 6 dígitos a tu email para restablecer la contraseña.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Enviar código</span>
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="label">Código de 6 dígitos</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="input-field pl-11"
                        placeholder="123456"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Contraseña nueva</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pl-11 pr-11"
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Confirmar contraseña nueva</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="input-field pl-11 pr-11"
                        placeholder="Repetí la contraseña"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Restablecer contraseña</span>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-brand-500 dark:text-brand-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
