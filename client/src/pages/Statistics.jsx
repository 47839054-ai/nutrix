import { useState, useEffect } from 'react'
import { api } from '../services/api'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react'

const COLORS = ['#14b8a6', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6']

export default function Statistics() {
  const [activeTab, setActiveTab] = useState('weekly')
  const [dashboardData, setDashboardData] = useState(null)
  const [weightRecords, setWeightRecords] = useState([])
  const [progressData, setProgressData] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [addingWeight, setAddingWeight] = useState(false)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.allSettled([
        api.stats.dashboard(),
        api.stats.getWeight(),
        api.stats.getProgress(),
        api.meals.getWeeklySummary(),
        api.meals.getMonthlySummary(),
      ])

      const dashboard = results[0].status === 'fulfilled' ? results[0].value : null
      const weight = results[1].status === 'fulfilled' ? results[1].value : null
      const progress = results[2].status === 'fulfilled' ? results[2].value : null
      const weekly = results[3].status === 'fulfilled' ? results[3].value : null
      const monthly = results[4].status === 'fulfilled' ? results[4].value : null

      setDashboardData(dashboard)
      setProgressData(progress)
      setWeeklyData(weekly?.summaries || [])
      setMonthlyData(monthly?.summaries || [])

      if (weight) {
        const records = weight.records || weight || []
        setWeightRecords(records)
      }
    } catch (err) {
      setError('Error al cargar estadisticas')
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

  const calorieData = (activeTab === 'monthly' ? monthlyData : weeklyData).map((d) => ({
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    calories: Math.round(d.totalCalories),
  }))

  const macroData = (() => {
    const totals = (activeTab === 'monthly' ? monthlyData : weeklyData).reduce(
      (acc, d) => ({
        protein: acc.protein + (d.totalProtein || 0),
        carbs: acc.carbs + (d.totalCarbs || 0),
        fat: acc.fat + (d.totalFat || 0),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    )
    return [
      { name: 'Proteina', value: Math.round(totals.protein / Math.max(activeTab === 'monthly' ? 30 : 7, 1)) },
      { name: 'Carbos', value: Math.round(totals.carbs / Math.max(activeTab === 'monthly' ? 30 : 7, 1)) },
      { name: 'Grasas', value: Math.round(totals.fat / Math.max(activeTab === 'monthly' ? 30 : 7, 1)) },
    ]
  })()

  const goalCompliance = (activeTab === 'monthly' ? monthlyData : weeklyData).map((d) => ({
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    compliance: dashboardData?.today?.calories?.goal
      ? Math.min(Math.round((d.totalCalories / dashboardData.today.calories.goal) * 100), 100)
      : 70,
  }))

  const weightData = weightRecords.map((w) => ({
    date: new Date(w.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    weight: w.peso,
  }))

  const avgCalories = calorieData.length > 0
    ? Math.round(calorieData.reduce((s, d) => s + d.calories, 0) / calorieData.length)
    : 0

  const avgWeight = weightData.length > 0
    ? (weightData.reduce((s, d) => s + d.weight, 0) / weightData.length).toFixed(1)
    : '--'

  const weightChange = weightData.length >= 2
    ? (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
    : null

  const tabs = [
    { key: 'weekly', label: 'Semanal' },
    { key: 'monthly', label: 'Mensual' },
    { key: 'all', label: 'Todo' },
  ]

  return (
    <div className="page-container space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Estadisticas</h2>

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
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prom. cal/dia</p>
              <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{avgCalories}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peso prom.</p>
              <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{avgWeight}</p>
              <p className="text-[10px] text-gray-400">kg</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cambio</p>
              <p
                className={`text-lg font-bold ${
                  weightChange && parseFloat(weightChange) < 0
                    ? 'text-green-500'
                    : weightChange && parseFloat(weightChange) > 0
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}
              >
                {weightChange ? (
                  <>
                    {parseFloat(weightChange) > 0 ? '+' : ''}
                    {weightChange}
                  </>
                ) : (
                  '--'
                )}
              </p>
              <p className="text-[10px] text-gray-400">kg</p>
            </div>
          </div>

          {calorieData.length > 0 && (
            <div className="card">
              <h3 className="section-title">Tendencia calorica</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calorieData}>
                    <defs>
                      <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      stroke="#14b8a6"
                      fill="url(#colorCalories)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="section-title">Distribucion de macros (promedio)</h3>
            <div className="h-48 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {weightData.length > 0 && (
            <div className="card">
              <h3 className="section-title">Tendencia de peso</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: '#f97316', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {goalCompliance.length > 0 && (
            <div className="card">
              <h3 className="section-title">Cumplimiento de objetivo</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalCompliance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="compliance" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
                {addingWeight ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {weightData.length > 0 && (
            <div className="card">
              <h3 className="section-title">Historial de peso</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...weightData].reverse().map((entry, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {entry.weight} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {progressData && progressData.weightTrend && (
            <div className="card">
              <h3 className="section-title">Resumen de progreso</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                    {progressData.avgCalories || 0}
                  </p>
                  <p className="text-[10px] text-gray-500">Prom. cal/dia (30d)</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                    {progressData.goalCompliance?.percentage || 0}%
                  </p>
                  <p className="text-[10px] text-gray-500">Cumplimiento</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
