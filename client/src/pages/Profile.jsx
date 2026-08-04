import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import {
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Target,
  Activity,
  Droplets,
  Save,
  LogOut,
  Moon,
  Sun,
  Loader2,
  AlertCircle,
  Check,
  ClipboardList,
  HelpCircle,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentario', desc: 'Poco o ningún ejercicio' },
  { value: 'light', label: 'Ligero', desc: 'Ejercicio ligero 1-3 días/semana' },
  { value: 'moderate', label: 'Moderado', desc: 'Ejercicio moderado 3-5 días/semana' },
  { value: 'active', label: 'Activo', desc: 'Ejercicio intenso 6-7 días/semana' },
  { value: 'very_active', label: 'Muy activo', desc: 'Ejercicio muy intenso diario' },
]

const GOALS = [
  { value: 'lose_weight', label: 'Perder peso' },
  { value: 'maintain', label: 'Mantener peso' },
  { value: 'gain_muscle', label: 'Ganar músculo' },
]

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: '',
    goal: '',
    dailyWaterGoal: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [passForm, setPassForm] = useState({ current: '', nueva: '', confirm: '' })
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        sex: user.sex || '',
        height: user.height || '',
        weight: user.weight || '',
        targetWeight: user.targetWeight || '',
        activityLevel: user.activityLevel || '',
        goal: user.goal || '',
        dailyWaterGoal: user.dailyWaterGoal || '',
      })
    }
  }, [user])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  const calculateBMI = () => {
    const h = parseFloat(form.height) / 100
    const w = parseFloat(form.weight)
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1)
    }
    return null
  }

  const calculateBMR = () => {
    const w = parseFloat(form.weight)
    const h = parseFloat(form.height)
    const a = parseFloat(form.age)
    if (!w || !h || !a) return null
    if (form.sex === 'male') {
      return Math.round(10 * w + 6.25 * h - 5 * a + 5)
    } else {
      return Math.round(10 * w + 6.25 * h - 5 * a - 161)
    }
  }

  const calculateRecommendedCalories = () => {
    const bmr = calculateBMR()
    if (!bmr) return null
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }
    const multiplier = multipliers[form.activityLevel] || 1.2
    const calories = Math.round(bmr * multiplier)
    if (form.goal === 'lose_weight') return Math.round(calories - 500)
    if (form.goal === 'gain_muscle') return Math.round(calories + 300)
    return calories
  }

  const getBMILabel = (bmi) => {
    if (!bmi) return ''
    const n = parseFloat(bmi)
    if (n < 18.5) return 'Bajo peso'
    if (n < 25) return 'Normal'
    if (n < 30) return 'Sobrepeso'
    return 'Obesidad'
  }

  const getBMIColor = (bmi) => {
    if (!bmi) return 'text-gray-400'
    const n = parseFloat(bmi)
    if (n < 18.5) return 'text-blue-500'
    if (n < 25) return 'text-green-500'
    if (n < 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    setLoading(true)
    try {
      const data = {
        name: form.name.trim(),
        age: form.age ? parseInt(form.age) : undefined,
        sex: form.sex || undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : undefined,
        activityLevel: form.activityLevel || undefined,
        goal: form.goal || undefined,
        dailyWaterGoal: form.dailyWaterGoal ? parseInt(form.dailyWaterGoal) : undefined,
      }
      await updateProfile(data)
      setSuccess('Perfil actualizado correctamente')
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassError('')
    setPassSuccess('')

    if (!passForm.nueva) {
      setPassError('Ingresá la contraseña nueva')
      return
    }
    if (passForm.nueva.length < 6) {
      setPassError('La contraseña nueva debe tener al menos 6 caracteres')
      return
    }
    if (passForm.nueva !== passForm.confirm) {
      setPassError('Las contraseñas no coinciden')
      return
    }

    setPassLoading(true)
    try {
      await api.auth.changePassword({
        currentPassword: passForm.current,
        newPassword: passForm.nueva,
      })
      setPassSuccess('Contraseña actualizada correctamente')
      setPassForm({ current: '', nueva: '', confirm: '' })
    } catch (err) {
      setPassError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setPassLoading(false)
    }
  }

  const bmi = calculateBMI()
  const bmr = calculateBMR()
  const recommended = calculateRecommendedCalories()

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="page-container space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Perfil</h2>

      <div className="card flex flex-col items-center py-6">
        <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-brand-500/30">
          <span className="text-2xl font-bold text-white">{getInitials(user?.name)}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {user?.name || 'Usuario'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
      </div>

      {bmi && (
        <div className="card">
          <h3 className="section-title">Calculos</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className={`text-xl font-bold ${getBMIColor(bmi)}`}>{bmi}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">IMC</p>
              <p className={`text-[10px] font-medium ${getBMIColor(bmi)}`}>{getBMILabel(bmi)}</p>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{bmr || '--'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">TMB</p>
              <p className="text-[10px] text-gray-400">kcal/dia</p>
            </div>
            <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xl font-bold text-accent-500">{recommended || '--'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Recomendado</p>
              <p className="text-[10px] text-gray-400">kcal/dia</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/app/test')}
        className="card w-full flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]"
      >
        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-brand-500" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Rehacer test nutricional</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Actualizar tus respuestas y regenerar el plan</p>
        </div>
      </button>

      <button
        onClick={() => navigate('/app/help')}
        className="card w-full flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]"
      >
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ayuda y contacto</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Preguntas frecuentes y soporte</p>
        </div>
      </button>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="label">Nombre</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={form.email}
                className="input-field pl-11 bg-gray-100 dark:bg-gray-600"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Edad</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="input-field pl-11"
                  placeholder="Edad"
                  min="10"
                  max="120"
                />
              </div>
            </div>
            <div>
              <label className="label">Sexo</label>
              <select
                value={form.sex}
                onChange={(e) => handleChange('sex', e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Altura (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="input-field pl-11"
                  placeholder="Altura"
                  min="50"
                  max="250"
                />
              </div>
            </div>
            <div>
              <label className="label">Peso (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="input-field pl-11"
                  placeholder="Peso"
                  min="20"
                  max="500"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Peso objetivo (kg)</label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={form.targetWeight}
                onChange={(e) => handleChange('targetWeight', e.target.value)}
                className="input-field pl-11"
                placeholder="Peso objetivo"
                min="20"
                max="500"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <label className="label">Nivel de actividad</label>
            <select
              value={form.activityLevel}
              onChange={(e) => handleChange('activityLevel', e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar</option>
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.desc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Objetivo</label>
            <select
              value={form.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar</option>
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Meta de agua diaria (ml)</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={form.dailyWaterGoal}
                onChange={(e) => handleChange('dailyWaterGoal', e.target.value)}
                className="input-field pl-11"
                placeholder="2500"
                min="500"
                max="10000"
                step="100"
              />
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
              <>
                <Save className="w-5 h-5" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="w-5 h-5 text-brand-500" />
          <h3 className="section-title mb-0">Cambiar contraseña</h3>
        </div>

        {passError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{passError}</span>
          </div>
        )}
        {passSuccess && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Contraseña actual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={passForm.current}
                onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                className="input-field pl-11 pr-11"
                placeholder="Tu contraseña actual"
                autoComplete="current-password"
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
            <label className="label">Contraseña nueva</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={passForm.nueva}
                onChange={(e) => setPassForm({ ...passForm, nueva: e.target.value })}
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
                value={passForm.confirm}
                onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                className="input-field pl-11 pr-11"
                placeholder="Repetí la contraseña nueva"
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
            disabled={passLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {passLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                <span>Actualizar contraseña</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="w-5 h-5 text-brand-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Modo oscuro
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isDark ? 'Activado' : 'Desactivado'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
              isDark ? 'bg-brand-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="card w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold">Cerrar sesion</span>
      </button>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4">
        Nutrix v1.0.0
      </p>
    </div>
  )
}
