import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, ScanLine, Scale, TrendingUp, User } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import logo from '../assets/logo.png'

const navItems = [
  { to: '/app/dashboard', label: 'Inicio', icon: Home },
  { to: '/app/plan', label: 'Plan', icon: Scale },
  { to: '/app/scan', label: 'Escaner', icon: ScanLine },
  { to: '/app/progress', label: 'Progreso', icon: TrendingUp },
  { to: '/app/profile', label: 'Perfil', icon: User },
]

export default function Layout() {
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Nutrix" className="w-8 h-8 rounded-lg object-cover ring-1 ring-brand-500/30" />
            <h1 className="text-xl font-bold text-brand-600 dark:text-brand-400">
              Nutrix
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </header>

      <main className="pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-700 pb-safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                  isActive
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
