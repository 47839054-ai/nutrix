import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import {
  ArrowLeft,
  ShoppingCart,
  RefreshCw,
  Loader2,
  AlertCircle,
  Trash2,
  Check,
  Scale,
  Sparkles,
} from 'lucide-react'

export default function ShoppingList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [hasPlan, setHasPlan] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(`nutrix_lista_${user?._id || 'anon'}`)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const persistChecked = useCallback(
    (next) => {
      setChecked(next)
      try {
        localStorage.setItem(`nutrix_lista_${user?._id || 'anon'}`, JSON.stringify(next))
      } catch (err) {
        console.error('No se pudo guardar la lista:', err)
      }
    },
    [user?._id],
  )

  const loadList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.plan.shoppingList()
      setItems(data.items || [])
      setProducts(data.products || [])
      setHasPlan(data.hasPlan !== false)
    } catch (err) {
      setError(err.message || 'Error al cargar la lista de compras')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  const toggle = (key) => {
    persistChecked({ ...checked, [key]: !checked[key] })
  }

  const clearChecked = () => {
    persistChecked({})
  }

  const totalItems = items.length + products.length
  const checkedCount = [...items, ...products].filter((i) => checked[i.nombre]).length
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/plan')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Lista de compras</h2>
        </div>
        <button
          onClick={loadList}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : !hasPlan ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Scale className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No tenés un plan aún
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Generá tu plan nutricional para armar la lista de lo que tenés que comprar
          </p>
          <button onClick={() => navigate('/app/plan')} className="btn-primary">
            Ver mi plan
          </button>
        </div>
      ) : (
        <>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-brand-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {checkedCount} de {totalItems} comprados
                </span>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {totalItems === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tu plan no tiene alimentos todavía
              </p>
            </div>
          ) : (
            <>
              {items.length > 0 && (
                <div className="card">
                  <h3 className="section-title">Alimentos del plan</h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isChecked = !!checked[item.nombre]
                      return (
                        <button
                          key={item.nombre}
                          onClick={() => toggle(item.nombre)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isChecked ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                              isChecked
                                ? 'bg-brand-500 border-brand-500 text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4" />}
                          </span>
                          <span className="flex-1 text-left min-w-0">
                            <span
                              className={`block text-sm font-medium truncate ${
                                isChecked
                                  ? 'text-gray-400 dark:text-gray-500 line-through'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {item.nombre}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.detalle}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <h3 className="section-title mb-0">Productos recomendados</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Sugeridos por tu plan
                  </p>
                  <div className="space-y-1">
                    {products.map((p) => {
                      const isChecked = !!checked[p.nombre]
                      return (
                        <button
                          key={p.nombre}
                          onClick={() => toggle(p.nombre)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isChecked ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                              isChecked
                                ? 'bg-brand-500 border-brand-500 text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4" />}
                          </span>
                          <span className="flex-1 text-left min-w-0">
                            <span
                              className={`block text-sm font-medium truncate ${
                                isChecked
                                  ? 'text-gray-400 dark:text-gray-500 line-through'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {p.nombre}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {p.motivo}
                            </span>
                            {p.tags && p.tags.length > 0 && (
                              <span className="flex flex-wrap gap-1 mt-1">
                                {p.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </span>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {checkedCount > 0 && (
                <button
                  onClick={clearChecked}
                  className="card w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-semibold">Limpiar marcados</span>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
