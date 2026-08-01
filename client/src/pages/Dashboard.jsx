import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboard } from '../contexts/DashboardContext'
import { api } from '../services/api'
import {
  Plus,
  Droplets,
  Flame,
  Beef,
  Wheat,
  Cookie,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronRight,
  Trash2,
} from 'lucide-react'

function CircularProgress({ value, max, size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference - progress * circumference
  const remaining = Math.max(max - value, 0)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-500 dark:text-brand-400 transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{remaining}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">restantes</span>
      </div>
    </div>
  )
}

function MacroBar({ label, current, goal, color, icon: Icon }) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(current)}g / {goal}g
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            color.replace('text-', 'bg-')
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { dailyStats, loading, error, refreshDashboard } = useDashboard()
  const [waterCount, setWaterCount] = useState(0)
  const [addingWater, setAddingWater] = useState(false)
  const [todayMeals, setTodayMeals] = useState([])
  const [deletingMeal, setDeletingMeal] = useState(null)
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]
  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  useEffect(() => {
    loadTodayMeals()
  }, [])

  useEffect(() => {
    if (dailyStats) {
      setWaterCount(dailyStats.waterGlasses || 0)
    }
  }, [dailyStats])

  const loadTodayMeals = async () => {
    try {
      const data = await api.meals.getByDate(today)
      setTodayMeals(data.meals || data || [])
    } catch (err) {
      console.error('Failed to load meals:', err)
    }
  }

  const handleAddWater = async () => {
    setAddingWater(true)
    try {
      setWaterCount((prev) => prev + 1)
      await refreshDashboard()
    } catch (err) {
      setWaterCount((prev) => Math.max(prev - 1, 0))
    } finally {
      setAddingWater(false)
    }
  }

  const handleDeleteMeal = async (mealId) => {
    setDeletingMeal(mealId)
    try {
      await api.meals.delete(mealId)
      setTodayMeals((prev) => prev.filter((m) => (m._id || m.id) !== mealId))
      await refreshDashboard()
    } catch (err) {
      console.error('Failed to delete meal:', err)
    } finally {
      setDeletingMeal(null)
    }
  }

  const calories = dailyStats?.calories || { consumed: 0, goal: 2000 }
  const protein = dailyStats?.protein || { consumed: 0, goal: 150 }
  const carbs = dailyStats?.carbs || { consumed: 0, goal: 250 }
  const fat = dailyStats?.fat || { consumed: 0, goal: 65 }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {greeting}, {user?.name || 'Usuario'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {formatDate(today)}
          </p>
        </div>
        <button
          onClick={refreshDashboard}
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

      {loading && !dailyStats ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="card flex flex-col items-center py-6">
            <CircularProgress value={calories.consumed} max={calories.goal} />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(calories.consumed)} de {calories.goal} kcal
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {Math.round((calories.consumed / calories.goal) * 100)}% del objetivo
              </p>
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="section-title">Macronutrientes</h3>
            <MacroBar
              label="Proteína"
              current={protein.consumed}
              goal={protein.goal}
              color="text-red-500"
              icon={Beef}
            />
            <MacroBar
              label="Carbohidratos"
              current={carbs.consumed}
              goal={carbs.goal}
              color="text-amber-500"
              icon={Wheat}
            />
            <MacroBar
              label="Grasas"
              current={fat.consumed}
              goal={fat.goal}
              color="text-blue-500"
              icon={Cookie}
            />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title mb-0">Agua</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {waterCount} vasos
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 flex-wrap flex-1">
                {Array.from({ length: Math.min(waterCount, 12) }).map((_, i) => (
                  <Droplets key={i} className="w-5 h-5 text-blue-400" />
                ))}
              </div>
              <button
                onClick={handleAddWater}
                disabled={addingWater}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+1</span>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title mb-0">Comidas de hoy</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {todayMeals.length} registros
              </span>
            </div>
            {todayMeals.length === 0 ? (
              <div className="text-center py-6">
                <Flame className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No hay comidas registradas hoy
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeals.map((meal) => (
                  <div
                    key={meal._id || meal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {meal.mealType || meal.type || 'Comida'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(meal.totalCalories || meal.calories || 0)} kcal
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMeal(meal._id || meal.id)}
                      disabled={deletingMeal === (meal._id || meal.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {deletingMeal === (meal._id || meal.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <button
        onClick={() => navigate('/app/scan')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center transition-all duration-200 transform active:scale-90 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
