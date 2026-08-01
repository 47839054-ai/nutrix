import { useState, useEffect } from 'react'
import { api } from '../services/api'
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react'

const mealTypeLabels = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  snack: 'Merienda',
  dinner: 'Cena',
  water: 'Agua',
}

const mealTypeTabs = [
  { key: 'all', label: 'Todos' },
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'lunch', label: 'Almuerzo' },
  { key: 'snack', label: 'Merienda' },
  { key: 'dinner', label: 'Cena' },
]

export default function History() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState('all')
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadMeals()
  }, [selectedDate])

  const loadMeals = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.meals.getByDate(selectedDate)
      setMeals(data.meals || data || [])
    } catch (err) {
      setError('Error al cargar las comidas')
      setMeals([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMeals = activeTab === 'all'
    ? meals
    : meals.filter((m) => m.mealType === activeTab)

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.meals.delete(id)
      setMeals((prev) => prev.filter((m) => (m._id || m.id) !== id))
    } catch (err) {
      setError('Error al eliminar la comida')
    } finally {
      setDeletingId(null)
    }
  }

  const changeDate = (days) => {
    const date = new Date(selectedDate + 'T00:00:00')
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const selected = new Date(dateStr + 'T00:00:00')

    if (selected.getTime() === today.getTime()) return 'Hoy'
    if (selected.getTime() === yesterday.getTime()) return 'Ayer'
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
  }

  const totalCalories = filteredMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0)
  const totalProtein = filteredMeals.reduce((sum, m) => sum + (m.totalProtein || 0), 0)
  const totalCarbs = filteredMeals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0)
  const totalFat = filteredMeals.reduce((sum, m) => sum + (m.totalFat || 0), 0)

  return (
    <div className="page-container space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {formatDateDisplay(selectedDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDate}</p>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {mealTypeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-0 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredMeals.length > 0 && (
        <div className="card bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                {Math.round(totalCalories)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">kcal</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">{Math.round(totalProtein)}g</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">protein</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-500">{Math.round(totalCarbs)}g</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">carbos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-500">{Math.round(totalFat)}g</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">grasa</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No hay comidas registradas
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {activeTab === 'all'
              ? 'Empieza a registrar tus comidas'
              : `No hay ${mealTypeLabels[activeTab]?.toLowerCase()} registrados`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMeals.map((meal) => {
            const mealId = meal._id || meal.id
            return (
              <div
                key={mealId}
                className="card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded-full">
                        {mealTypeLabels[meal.mealType] || meal.mealType}
                      </span>
                      {meal.createdAt && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(meal.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {(meal.foods || []).map((f, i) => (
                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                          {f.name} <span className="text-gray-400">({f.quantity}g)</span>
                        </p>
                      ))}
                      {(!meal.foods || meal.foods.length === 0) && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">Comida</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {Math.round(meal.totalCalories || 0)}
                      </p>
                      <p className="text-[10px] text-gray-400">kcal</p>
                    </div>
                    <button
                      onClick={() => handleDelete(mealId)}
                      disabled={deletingId === mealId}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      {deletingId === mealId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {(meal.totalProtein > 0 || meal.totalCarbs > 0 || meal.totalFat > 0) && (
                  <div className="flex gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      P: {Math.round(meal.totalProtein)}g
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      C: {Math.round(meal.totalCarbs)}g
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      G: {Math.round(meal.totalFat)}g
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
