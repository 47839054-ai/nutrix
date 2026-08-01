import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Loader2,
  AlertCircle,
  Plus,
  TrendingUp,
  Scale,
  Flame,
  Calendar,
} from 'lucide-react'

const COLORS = ['#14b8a6', '#f97316', '#ef4444', '#3b82f6']

export default function ProgressPage() {
  const { user } = useAuth()
  const [weightRecords, setWeightRecords] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [addingWeight, setAddingWeight] = useState(false)
  const [activeTab, setActiveTab] = useState('weight')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.allSettled([
        api.stats.getWeight(),
        api.meals.getWeeklySummary(),
      ])
      const weight = results[0].status === 'fulfilled' ? results[0].value : null
      const weekly = results[1].status === 'fulfilled' ? results[1].value : null
      if (weight) {
        setWeightRecords(weight.records || weight || [])
      }
      setWeeklyData(weekly?.summaries || [])
    } catch (err) {
      setError('Error al cargar datos de progreso')
    } finally {
      setLoading(false)
    }
  }

  const handleAddWeight = async () => {
    const peso = parseFloat(weightInput)
    if (!peso || peso < 20 || peso > 500) return
    setAddingWeight(true)
    try {
      await api.stats.addWeight({ peso, date: new Date().toISOString().split('T')[0] })
      setWeightInput('')
      await loadData()
    } catch (err) {
      setError('Error al guardar peso')
    } finally {
      setAddingWeight(false)
    }
  }

  const weightData = weightRecords.map((w) => ({
    date: new Date(w.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    weight: w.peso,
  }))

  const calorieData = weeklyData.map((d) => ({
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    calories: Math.round(d.totalCalories),
  }))

  const avgCalories = calorieData.length > 0
    ? Math.round(calorieData.reduce((s, d) => s + d.calories, 0) / calorieData.length)
    : 0

  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null
  const startWeight = weightData.length > 0 ? weightData[0].weight : null
  const weightChange = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null

  const macroData = (() => {
    const totals = weeklyData.reduce(
      (acc, d) => ({
        protein: acc.protein + (d.totalProtein || 0),
        carbs: acc.carbs + (d.totalCarbs || 0),
        fat: acc.fat + (d.totalFat || 0),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    )
    return [
      { name: 'Proteina', value: Math.round(totals.protein / Math.max(weeklyData.length, 1)) },
      { name: 'Carbos', value: Math.round(totals.carbs / Math.max(weeklyData.length, 1)) },
      { name: 'Grasas', value: Math.round(totals.fat / Math.max(weeklyData.length, 1)) },
    ]
  })()

  const tabs = [
    { key: 'weight', label: 'Peso' },
    { key: 'calories', label: 'Calorias' },
    { key: 'macros', label: 'Macros' },
  ]

  return (
    <div className="page-container space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Progreso</h2>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
      ) : (
        <>
          {/* Resumen rapido */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <Scale className="w-5 h-5 text-brand-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentWeight || '--'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Peso actual (kg)</p>
            </div>
            <div className="card text-center">
              <TrendingUp className="w-5 h-5 text-brand-500 mx-auto mb-1" />
              <p className={`text-lg font-bold ${
                weightChange && parseFloat(weightChange) < 0
                  ? 'text-green-500'
                  : weightChange && parseFloat(weightChange) > 0
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}>
                {weightChange ? `${parseFloat(weightChange) > 0 ? '+' : ''}${weightChange}` : '--'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Cambio (kg)</p>
            </div>
            <div className="card text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{avgCalories || '--'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Prom. kcal/dia</p>
            </div>
          </div>

          {/* Peso */}
          {activeTab === 'weight' && (
            <>
              {weightData.length > 0 && (
                <div className="card">
                  <h3 className="section-title">Tendencia de peso</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="card">
                <h3 className="section-title">Registrar peso</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Peso en kg"
                    step="0.1"
                    min="20"
                    max="500"
                  />
                  <button
                    onClick={handleAddWeight}
                    disabled={addingWeight || !weightInput}
                    className="btn-primary px-4"
                  >
                    {addingWeight ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {weightData.length > 0 && (
                <div className="card">
                  <h3 className="section-title">Historial de peso</h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {[...weightData].reverse().map((entry, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Calorias */}
          {activeTab === 'calories' && (
            <>
              {calorieData.length > 0 && (
                <div className="card">
                  <h3 className="section-title">Calorias por dia</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calorieData}>
                        <defs>
                          <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="calories" stroke="#14b8a6" fill="url(#colorCal)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {calorieData.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Aun no hay datos de calorias</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Registra comidas para ver tu progreso</p>
                </div>
              )}
            </>
          )}

          {/* Macros */}
          {activeTab === 'macros' && (
            <>
              {macroData.some((d) => d.value > 0) ? (
                <div className="card">
                  <h3 className="section-title">Promedio semanal de macros</h3>
                  <div className="h-56 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={macroData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={4} dataKey="value">
                          {macroData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Aun no hay datos de macros</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Registra comidas para ver tu distribucion</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
