import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('nutrix_token'))
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!token && !!user

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await api.auth.me()
      setUser(data.profile || data.user)
    } catch (err) {
      console.error('Failed to load user:', err)
      localStorage.removeItem('nutrix_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password })
    localStorage.setItem('nutrix_token', data.token)
    setToken(data.token)
    setUser(data.profile || data.user)
    return data
  }

  const register = async (name, email, password) => {
    const data = await api.auth.register({ name, email, password })
    localStorage.setItem('nutrix_token', data.token)
    setToken(data.token)
    setUser(data.profile || data.user)
    return data
  }

  const loginWithGoogle = async (credential) => {
    const data = await api.auth.googleLogin(credential)
    localStorage.setItem('nutrix_token', data.token)
    setToken(data.token)
    setUser(data.profile || data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('nutrix_token')
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    const data = await api.auth.updateProfile(profileData)
    setUser(data.profile || data.user)
    return data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
