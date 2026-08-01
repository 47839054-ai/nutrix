import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem('nutrix_splash_seen')
    if (hasSeenSplash) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true })
      } else if (user && !user.testCompleted) {
        navigate('/app/test', { replace: true })
      } else {
        navigate('/app/dashboard', { replace: true })
      }
      return
    }

    setVisible(true)
    const timer = setTimeout(() => {
      localStorage.setItem('nutrix_splash_seen', 'true')
      if (!isAuthenticated) {
        navigate('/login', { replace: true })
      } else if (user && !user.testCompleted) {
        navigate('/app/test', { replace: true })
      } else {
        navigate('/app/dashboard', { replace: true })
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate, isAuthenticated, user])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700">
      <div
        className={`flex flex-col items-center gap-4 transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="w-20 h-20 rounded-3xl overflow-hidden ring-2 ring-white/40 shadow-xl">
          <img src={logo} alt="Nutrix" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Nutrix</h1>
        <p className="text-brand-100 text-lg font-medium">Nutrición inteligente</p>
      </div>
      <div
        className={`mt-12 transition-opacity duration-700 delay-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  )
}
