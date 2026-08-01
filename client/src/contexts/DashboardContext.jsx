import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useAuth } from './AuthContext'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [dailyStats, setDailyStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()

  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.stats.dashboard()
      const today = data.today || {}
      setDailyStats({
        calories: {
          consumed: today.calories?.current || 0,
          goal: today.calories?.goal || 2000,
        },
        protein: {
          consumed: today.protein?.current || 0,
          goal: today.protein?.goal || 150,
        },
        carbs: {
          consumed: today.carbs?.current || 0,
          goal: today.carbs?.goal || 250,
        },
        fat: {
          consumed: today.fat?.current || 0,
          goal: today.fat?.goal || 65,
        },
        water: {
          consumed: today.water?.current || 0,
          goal: today.water?.goal || 2500,
        },
        waterGlasses: Math.round((today.water?.current || 0) / 250),
        profile: data.profile || null,
      })
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshDashboard()
  }, [refreshDashboard])

  return (
    <DashboardContext.Provider value={{ dailyStats, loading, error, refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
