import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Activity, Home as HomeIcon, BarChart3, LogOut, Menu, X, Snowflake } from 'lucide-react'
import Home from './pages/Home'
import Activities from './pages/Activities'
import Insights from './pages/Insights'
import YetiFruit from './pages/YetiFruit'
import Login from './components/Login'
import { checkAuthStatus, logout } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const status = await checkAuthStatus()
      setIsAuthenticated(status.authenticated)
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    await logout()
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-garmin-blue"></div>
      </div>
    )
  }

  // Allow Yeti Fruit game without authentication
  if (!isAuthenticated && location.pathname !== '/yeti-fruit') {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-garmin-light border-b border-garmin-accent/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-garmin-blue" />
              <span className="font-bold text-xl">Garmin Fitness</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link flex items-center gap-2 ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <HomeIcon className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink
                to="/activities"
                className={({ isActive }) =>
                  `nav-link flex items-center gap-2 ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <Activity className="w-4 h-4" />
                Activities
              </NavLink>
              <NavLink
                to="/insights"
                className={({ isActive }) =>
                  `nav-link flex items-center gap-2 ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <BarChart3 className="w-4 h-4" />
                Insights
              </NavLink>
              <NavLink
                to="/yeti-fruit"
                className={({ isActive }) =>
                  `nav-link flex items-center gap-2 ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <Snowflake className="w-4 h-4" />
                Yeti Fruit
              </NavLink>
              <button
                onClick={handleLogout}
                className="nav-link flex items-center gap-2 text-garmin-danger hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-garmin-accent/30 py-4 px-4 space-y-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link flex items-center gap-2 w-full ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <HomeIcon className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/activities"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link flex items-center gap-2 w-full ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <Activity className="w-4 h-4" />
              Activities
            </NavLink>
            <NavLink
              to="/insights"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link flex items-center gap-2 w-full ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <BarChart3 className="w-4 h-4" />
              Insights
            </NavLink>
            <NavLink
              to="/yeti-fruit"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link flex items-center gap-2 w-full ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <Snowflake className="w-4 h-4" />
              Yeti Fruit
            </NavLink>
            <button
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              className="nav-link flex items-center gap-2 w-full text-garmin-danger hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/yeti-fruit" element={<YetiFruit />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
