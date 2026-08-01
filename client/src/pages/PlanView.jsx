import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import {
  Flame,
  Beef,
  Wheat,
  Cookie,
  Droplets,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronRight,
  Apple,
  Info,
  Scale,
  Utensils,
  Sparkles,
} from 'lucide-react'

function IndicadorCard({ label, value, unit, color }) {
  return (
    <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
      <p className={`text-xl font-bold ${color}`}>{value || '—'}</p>
      <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      {unit && <p className="text-[10px] text-gray-400 dark:text-gray-500">{unit}</p>}
    </div>
  )
}

function ComidaCard({ comida }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{comida.tipo}</h4>
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
          {comida.calorias} kcal
        </span>
      </div>
      <div className="space-y-1">
        {comida.alimentos?.map((al, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-700 dark:text-gray-300">{al.nombre}</span>
            <span className="text-gray-500 dark:text-gray-400">{al.porcion}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PlanView() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.plan.get()
      setPlan(data.plan)
    } catch (err) {
      setError(err.message || 'Error al cargar el plan')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    setError('')
    try {
      const data = await api.plan.generate()
      setPlan(data.plan)
    } catch (err) {
      setError(err.message || 'Error al regenerar el plan')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando tu plan...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="page-container space-y-4">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Scale className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No tenés un plan aún
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Completá el test nutricional para generar tu plan personalizado
          </p>
          <button
            onClick={() => navigate('/app/test')}
            className="btn-primary"
          >
            Hacer el test nutricional
          </button>
        </div>
      </div>
    )
  }

  const indicadores = plan.indicadores || {}
  const macros = plan.macros || {}
  const comidas = plan.planComidas || []
  const recomendaciones = plan.recomendaciones_generales || []
  const productos = plan.productos || []

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mi Plan</h2>
        <div className="flex items-center gap-2">
          {plan.generadoPor === 'ia' && (
            <span className="flex items-center gap-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              IA
            </span>
          )}
          {plan.generadoPor === 'reglas' && (
            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full">
              Reglas
            </span>
          )}
          <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerar
        </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Rotación automática */}
      {plan.renuevaEl && (
        <div className="flex items-center gap-2 p-3 bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 rounded-xl text-sm text-brand-700 dark:text-brand-300">
          <RefreshCw className="w-4 h-4 flex-shrink-0" />
          <span>
            Este plan se renueva automáticamente con variantes nuevas. Próxima
            actualización:{' '}
            <b>
              {new Date(plan.renuevaEl).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
              })}
            </b>
          </span>
        </div>
      )}

      {/* Resumen del plan */}
      {plan.resumen && (
        <div className="card bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{plan.resumen}</p>
          </div>
        </div>
      )}

      {/* Indicadores */}
      {indicadores.imc && (
        <div className="card">
          <h3 className="section-title">Tus indicadores</h3>
          <div className="grid grid-cols-4 gap-2">
            <IndicadorCard
              label="IMC"
              value={indicadores.imc}
              color={
                indicadores.imc < 18.5
                  ? 'text-blue-500'
                  : indicadores.imc < 25
                  ? 'text-green-500'
                  : indicadores.imc < 30
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }
            />
            <IndicadorCard
              label="Clasificación"
              value={indicadores.imcClasificacion}
              color="text-gray-700 dark:text-gray-300"
            />
            <IndicadorCard
              label="TMB"
              value={indicadores.tmb}
              unit="kcal/día"
              color="text-brand-600 dark:text-brand-400"
            />
            <IndicadorCard
              label="Agua"
              value={indicadores.aguaMl ? `${(indicadores.aguaMl / 1000).toFixed(1)}L` : '—'}
              unit="diario"
              color="text-blue-500"
            />
          </div>
        </div>
      )}

      {/* Macros */}
      {macros.calorias && (
        <div className="card">
          <h3 className="section-title">Macronutrientes diarios</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{macros.calorias}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">kcal</p>
            </div>
            <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
              <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{macros.proteinas_g}g</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Proteína</p>
            </div>
            <div className="text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
              <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{macros.carbohidratos_g}g</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Carbos</p>
            </div>
            <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <Cookie className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{macros.grasas_g}g</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Grasas</p>
            </div>
          </div>
        </div>
      )}

      {/* Plan de comidas */}
      {comidas.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-brand-500" />
            <h3 className="section-title mb-0">Plan de comidas diario</h3>
          </div>
          <div className="space-y-3">
            {comidas.map((comida, i) => (
              <ComidaCard key={i} comida={comida} />
            ))}
          </div>
        </div>
      )}

      {/* Productos recomendados */}
      {productos.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Apple className="w-5 h-5 text-brand-500" />
            <h3 className="section-title mb-0">Productos recomendados</h3>
          </div>
          <div className="space-y-2">
            {productos.map((p, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.motivo}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.tags.map((tag, ti) => (
                        <span
                          key={ti}
                          className="text-[10px] bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recomendaciones.length > 0 && (
        <div className="card">
          <h3 className="section-title">Recomendaciones</h3>
          <ul className="space-y-2">
            {recomendaciones.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-brand-500 mt-1">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Volver al test */}
      <button
        onClick={() => navigate('/app/test')}
        className="card w-full text-center text-sm text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
      >
        Actualizar respuestas del test
      </button>
    </div>
  )
}
