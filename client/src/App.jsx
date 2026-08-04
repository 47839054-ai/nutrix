import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SplashScreen from './pages/SplashScreen'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPassword from './pages/ForgotPassword'
import NutritionalTest from './pages/NutritionalTest'
import PlanView from './pages/PlanView'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import ProgressPage from './pages/ProgressPage'
import HelpPage from './pages/HelpPage'
import Profile from './pages/Profile'
import Recipes from './pages/Recipes'
import ShoppingList from './pages/ShoppingList'

function App() {
  const { isAuthenticated, loading, user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <ForgotPassword />}
      />

      {/* Test nutricional — wizard sin nav */}
      <Route
        path="/app/test"
        element={
          <ProtectedRoute>
            <NutritionalTest />
          </ProtectedRoute>
        }
      />

      {/* App principal con Layout y nav */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="plan" element={<PlanView />} />
        <Route path="scan" element={<Scanner />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="shopping-list" element={<ShoppingList />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
