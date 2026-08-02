import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  Activity,
  Target,
  Salad,
  ShieldCheck,
  ClipboardCheck,
  X,
  Ban,
} from 'lucide-react'

const STEPS = [
  { label: 'Datos', icon: Activity },
  { label: 'Actividad', icon: Target },
  { label: 'Alimentación', icon: Salad },
  { label: 'Preferencias', icon: Ban },
  { label: 'Salud', icon: ShieldCheck },
  { label: 'Resumen', icon: ClipboardCheck },
]

const ACTIVITY_OPTIONS = [
  { value: 'sedentario', label: 'Sedentario', desc: 'Poco o ningún ejercicio', icon: '🪑' },
  { value: 'moderado', label: 'Moderado', desc: 'Ejercicio 3-5 días/semana', icon: '🏃' },
  { value: 'activo', label: 'Activo', desc: 'Ejercicio intenso 6-7 días/semana', icon: '💪' },
  { value: 'muy_activo', label: 'Muy activo', desc: 'Ejercicio muy intenso diario', icon: '🔥' },
]

const GOAL_OPTIONS = [
  { value: 'bajar', label: 'Bajar de peso', desc: 'Déficit calórico moderado', icon: '⬇️' },
  { value: 'mantener', label: 'Mantener peso', desc: 'Equilibrio calórico', icon: '⚖️' },
  { value: 'masa', label: 'Ganar músculo', desc: 'Superávit calórico leve', icon: '💪' },
]

const FOOD_TYPES = [
  { value: 'omnivoro', label: 'Omnívoro', desc: 'Como de todo, carne y vegetales', icon: '🍽️' },
  { value: 'vegetariano', label: 'Vegetariano', desc: 'Sin carne, pero con lácteos y huevos', icon: '🥚' },
  { value: 'vegano', label: 'Vegano', desc: 'Solo productos de origen vegetal', icon: '🌱' },
]

const FOODS_TO_AVOID = [
  { id: 'carne_vacuna', label: 'Carne vacuna', icon: '🥩' },
  { id: 'carne_pollo', label: 'Pollo', icon: '🍗' },
  { id: 'carne_cerdo', label: 'Cerdo', icon: '🐷' },
  { id: 'cordero', label: 'Cordero', icon: '🐑' },
  { id: 'pescado', label: 'Pescado', icon: '🐟' },
  { id: 'mariscos', label: 'Mariscos', icon: '🦐' },
  { id: 'leche', label: 'Leche', icon: '🥛' },
  { id: 'queso', label: 'Queso', icon: '🧀' },
  { id: 'manteca', label: 'Manteca', icon: '🧈' },
  { id: 'yogur', label: 'Yogur', icon: '🥣' },
  { id: 'lacteos', label: 'Lácteos (todos)', icon: '🥛' },
  { id: 'huevo', label: 'Huevo', icon: '🥚' },
  { id: 'trigo', label: 'Trigo / Gluten', icon: '🌾' },
  { id: 'avena', label: 'Avena', icon: '🌾' },
  { id: 'pan', label: 'Pan / Panificados', icon: '🍞' },
  { id: 'pastas', label: 'Fideos / Pastas', icon: '🍝' },
  { id: 'galletitas', label: 'Galletitas', icon: '🍪' },
  { id: 'arroz', label: 'Arroz', icon: '🍚' },
  { id: 'maiz', label: 'Maíz', icon: '🌽' },
  { id: 'soja', label: 'Soja', icon: '🫘' },
  { id: 'lentejas', label: 'Lentejas', icon: '🫘' },
  { id: 'garbanzos', label: 'Garbanzos', icon: '🫘' },
  { id: 'porotos', label: 'Porotos / Frijoles', icon: '🫘' },
  { id: 'banana', label: 'Banana', icon: '🍌' },
  { id: 'citricos', label: 'Cítricos', icon: '🍊' },
  { id: 'manzana', label: 'Manzana', icon: '🍎' },
  { id: 'frutas_rojas', label: 'Frutas rojas', icon: '🍓' },
  { id: 'papa', label: 'Papa', icon: '🥔' },
  { id: 'batata', label: 'Batata', icon: '🍠' },
  { id: 'zapallo', label: 'Zapallo / Calabaza', icon: '🎃' },
  { id: 'tomate', label: 'Tomate', icon: '🍅' },
  { id: 'cebolla', label: 'Cebolla / Ajo', icon: '🧅' },
  { id: 'champinones', label: 'Champiñones / Hongos', icon: '🍄' },
  { id: 'coliflor', label: 'Coliflor / Brócoli', icon: '🥦' },
  { id: 'palta', label: 'Palta', icon: '🥑' },
  { id: 'mani', label: 'Maní', icon: '🥜' },
  { id: 'frutos_secos', label: 'Frutos secos (todos)', icon: '🥜' },
  { id: 'sesamo', label: 'Sésamo', icon: '🌰' },
  { id: 'gaseosa', label: 'Gaseosas', icon: '🥤' },
  { id: 'jugo_azucar', label: 'Jugos con azúcar', icon: '🧃' },
  { id: 'cafe', label: 'Café / Cafeína', icon: '☕' },
  { id: 'alcohol', label: 'Alcohol', icon: '🍺' },
  { id: 'ultraprocesados', label: 'Ultraprocesados', icon: '🍔' },
  { id: 'azucar', label: 'Azúcar / Dulces', icon: '🍬' },
  { id: 'chocolate', label: 'Chocolate / Cacao', icon: '🍫' },
  { id: 'frituras', label: 'Frituras', icon: '🍟' },
  { id: 'embutidos', label: 'Fiambres / Embutidos', icon: '🥓' },
  { id: 'snacks', label: 'Snacks salados', icon: '🍿' },
  { id: 'mayonesa', label: 'Mayonesa / Aderezos', icon: '🥫' },
]

const RESTRICTIONS_OPTIONS = [
  { id: 'sin_tacc', label: 'Sin TACC / Celíaco' },
  { id: 'sin_lactosa', label: 'Sin lactosa' },
  { id: 'sin_gluten', label: 'Sin gluten' },
  { id: 'sin_frutos_secos', label: 'Sin frutos secos' },
  { id: 'bajo_sodio', label: 'Bajo en sodio' },
]

const HEALTH_OPTIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hipertension', label: 'Hipertensión' },
  { id: 'colesterol', label: 'Colesterol alto' },
  { id: 'celiaquia', label: 'Celiaquía' },
  { id: 'lactosa_intolerancia', label: 'Intolerancia a la lactosa' },
  { id: 'obesidad', label: 'Sobrepeso / Obesidad' },
  { id: 'embarazo', label: 'Embarazo / Lactancia' },
  { id: 'renal', label: 'Enfermedad renal' },
  { id: 'ninguna', label: 'Ninguna de las anteriores' },
]

export default function NutritionalTest() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    edad: user?.age || '',
    sexo: user?.sex === 'male' ? 'Masculino' : user?.sex === 'female' ? 'Femenino' : '',
    peso: user?.weight || '',
    altura: user?.height || '',
    actividad: '',
    objetivo: '',
    tipoAlimentacion: '',
    preferenciasNoComer: [],
    restricciones: [],
    condiciones: '',
  })

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const toggleFoodToAvoid = (id) => {
    setForm((prev) => ({
      ...prev,
      preferenciasNoComer: prev.preferenciasNoComer.includes(id)
        ? prev.preferenciasNoComer.filter((r) => r !== id)
        : [...prev.preferenciasNoComer, id],
    }))
  }

  const toggleRestriction = (id) => {
    setForm((prev) => ({
      ...prev,
      restricciones: prev.restricciones.includes(id)
        ? prev.restricciones.filter((r) => r !== id)
        : [...prev.restricciones, id],
    }))
  }

  const toggleHealth = (id) => {
    if (id === 'ninguna') {
      setForm((prev) => ({ ...prev, condiciones: '' }))
      return
    }
    setForm((prev) => ({
      ...prev,
      condiciones: prev.condiciones === id ? '' : id,
    }))
  }

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.edad || !form.sexo || !form.peso || !form.altura) {
          setError('Completá todos los campos')
          return false
        }
        if (form.edad < 10 || form.edad > 120) {
          setError('La edad debe ser entre 10 y 120 años')
          return false
        }
        if (form.peso < 20 || form.peso > 300) {
          setError('El peso debe ser entre 20 y 300 kg')
          return false
        }
        if (form.altura < 50 || form.altura > 250) {
          setError('La altura debe ser entre 50 y 250 cm')
          return false
        }
        return true
      case 1:
        if (!form.actividad) {
          setError('Selecciona tu nivel de actividad')
          return false
        }
        if (!form.objetivo) {
          setError('Selecciona tu objetivo')
          return false
        }
        return true
      case 2:
        if (!form.tipoAlimentacion) {
          setError('Selecciona tu tipo de alimentación')
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (!validateStep()) return
    setError('')
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const prevStep = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await api.test.save(form)
      await api.plan.generate()
      await updateProfile({
        age: parseInt(form.edad),
        sex: form.sexo === 'Masculino' ? 'male' : 'female',
        weight: parseFloat(form.peso),
        height: parseFloat(form.altura),
      })
      navigate('/app/plan', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al guardar el test')
    } finally {
      setLoading(false)
    }
  }

  const getIMCPreview = () => {
    const h = parseFloat(form.altura) / 100
    const w = parseFloat(form.peso)
    if (h > 0 && w > 0) {
      const imc = w / (h * h)
      return imc.toFixed(1)
    }
    return null
  }

  const getIMCLabel = (imc) => {
    if (!imc) return ''
    const n = parseFloat(imc)
    if (n < 18.5) return 'Bajo peso'
    if (n < 25) return 'Normal'
    if (n < 30) return 'Sobrepeso'
    return 'Obesidad'
  }

  const getIMCColor = (imc) => {
    if (!imc) return 'text-gray-400'
    const n = parseFloat(imc)
    if (n < 18.5) return 'text-blue-500'
    if (n < 25) return 'text-green-500'
    if (n < 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Test Nutricional
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full bg-brand-500 transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 0: Basic data */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Cuéntanos sobre ti
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Estos datos nos ayudan a calcular tus necesidades calóricas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Edad</label>
                <input
                  type="number"
                  value={form.edad}
                  onChange={(e) => update('edad', e.target.value)}
                  className="input-field"
                  placeholder="Años"
                  min="10"
                  max="120"
                />
              </div>
              <div>
                <label className="label">Sexo</label>
                <select
                  value={form.sexo}
                  onChange={(e) => update('sexo', e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Peso (kg)</label>
                <input
                  type="number"
                  value={form.peso}
                  onChange={(e) => update('peso', e.target.value)}
                  className="input-field"
                  placeholder="Kilogramos"
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
              <div>
                <label className="label">Altura (cm)</label>
                <input
                  type="number"
                  value={form.altura}
                  onChange={(e) => update('altura', e.target.value)}
                  className="input-field"
                  placeholder="Centímetros"
                  min="50"
                  max="250"
                />
              </div>
            </div>

            {getIMCPreview() && (
              <div className="card bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tu IMC estimado</span>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getIMCColor(getIMCPreview())}`}>
                      {getIMCPreview()}
                    </span>
                    <span className={`text-sm ml-2 ${getIMCColor(getIMCPreview())}`}>
                      {getIMCLabel(getIMCPreview())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Activity + Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Actividad y objetivo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ¿Qué tan activo sos y qué querés lograr?
              </p>
            </div>

            <div>
              <label className="label text-base font-semibold mb-3 block">Nivel de actividad</label>
              <div className="grid grid-cols-2 gap-3">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('actividad', opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      form.actividad === opt.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{opt.icon}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label text-base font-semibold mb-3 block">Tu objetivo</label>
              <div className="grid grid-cols-3 gap-3">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('objetivo', opt.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      form.objetivo === opt.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{opt.icon}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Food preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Tipo de alimentación
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ¿Cómo es tu alimentación habitual?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {FOOD_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update('tipoAlimentacion', opt.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                    form.tipoAlimentacion === opt.value
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl block mb-1">{opt.icon}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block">
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="label text-base font-semibold mb-3 block">
                Restricciones alimentarias
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Selecciona todas las que apliquen
              </p>
              <div className="space-y-2">
                {RESTRICTIONS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleRestriction(opt.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all duration-200 ${
                      form.restricciones.includes(opt.id)
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        form.restricciones.includes(opt.id)
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {form.restricciones.includes(opt.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Foods to avoid */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Preferencias de comidas
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Seleccioná los alimentos que NO querés incluir en tu plan
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {FOODS_TO_AVOID.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleFoodToAvoid(opt.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    form.preferenciasNoComer.includes(opt.id)
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <span className="text-xl block mb-1">{opt.icon}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100 block leading-tight">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            {form.preferenciasNoComer.length > 0 && (
              <div className="card bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  {form.preferenciasNoComer.length} alimento{form.preferenciasNoComer.length > 1 ? 's' : ''} excluido{form.preferenciasNoComer.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.preferenciasNoComer.map((id) => (
                    <span
                      key={id}
                      className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      {FOODS_TO_AVOID.find((f) => f.id === id)?.label}
                      <X className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Health conditions */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Condiciones de salud
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Esto nos ayuda a personalizar tu plan
              </p>
            </div>

            <div>
              <label className="label text-base font-semibold mb-3 block">
                ¿Tenés alguna condición?
              </label>
              <div className="space-y-2">
                {HEALTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleHealth(opt.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all duration-200 ${
                      (opt.id === 'ninguna' && form.condiciones === '') ||
                      form.condiciones === opt.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        (opt.id === 'ninguna' && form.condiciones === '') ||
                        form.condiciones === opt.id
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {((opt.id === 'ninguna' && form.condiciones === '') ||
                        form.condiciones === opt.id) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Resumen de tu perfil
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Revisa tus datos antes de generar tu plan
              </p>
            </div>

            <div className="card">
              <h3 className="section-title text-sm">Datos personales</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Edad:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{form.edad} años</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Sexo:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{form.sexo}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Peso:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{form.peso} kg</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Altura:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{form.altura} cm</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title text-sm">Actividad y objetivo</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Actividad:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {ACTIVITY_OPTIONS.find((a) => a.value === form.actividad)?.label || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Objetivo:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {GOAL_OPTIONS.find((g) => g.value === form.objetivo)?.label || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title text-sm">Alimentación</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {FOOD_TYPES.find((f) => f.value === form.tipoAlimentacion)?.label || '—'}
                  </span>
                </div>
                {form.restricciones.length > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Restricciones:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.restricciones.map((r) => (
                        <span key={r} className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                          {RESTRICTIONS_OPTIONS.find((o) => o.id === r)?.label || r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {form.preferenciasNoComer.length > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">No quiero comer:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.preferenciasNoComer.map((f) => (
                        <span key={f} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                          {FOODS_TO_AVOID.find((o) => o.id === f)?.label || f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {form.condiciones && form.condiciones !== 'ninguna' && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Condicion:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {HEALTH_OPTIONS.find((h) => h.id === form.condiciones)?.label || '—'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {getIMCPreview() && (
              <div className="card bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tu IMC estimado</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Se calcularán calorías, macros y plan según tus datos
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getIMCColor(getIMCPreview())}`}>
                      {getIMCPreview()}
                    </span>
                    <p className={`text-xs font-medium ${getIMCColor(getIMCPreview())}`}>
                      {getIMCLabel(getIMCPreview())}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-700 pb-safe-bottom">
          <div className="flex gap-3 p-4 max-w-lg mx-auto">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center justify-center gap-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generando plan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Generar mi plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
