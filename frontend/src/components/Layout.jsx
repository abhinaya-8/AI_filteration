import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => setSidebarOpen((open) => !open)
  const closeSidebar = () => setSidebarOpen(false)

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    ...(user?.role === 'User' ? [
      { label: 'Resume Builder', path: '/resume-builder', icon: '📝' },
      { label: 'Knowledge Checker', path: '/knowledge-checker', icon: '🧠' },
      { label: 'My Applications', path: '/my-applications', icon: '📋' },
    ] : []),
    ...(user?.role === 'Admin' ? [
      { label: 'Admin Panel', path: '/admin-dashboard', icon: '⚙️' },
    ] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Menu & Logo */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleSidebar}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 lg:hidden"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                  <span className="text-lg font-bold text-white">🎯</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">AI</span>
                  <span className="text-xs text-slate-500 leading-none">Recruit</span>
                </div>
              </Link>
            </div>

            {/* Right: User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md font-semibold text-sm hover:shadow-lg transition-all duration-200">
                {user?.name ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'NA'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-fadeIn"
            onClick={closeSidebar}
            aria-label="Close menu"
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-12 left-0 z-40 w-72 max-w-full transform overflow-hidden bg-white shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:inset-auto lg:z-auto lg:shadow-none lg:translate-x-0 border-r border-slate-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 lg:hidden">
            <p className="text-lg font-semibold text-slate-900">Navigation</p>
            <button
              type="button"
              onClick={closeSidebar}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2 px-4 py-6 lg:space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-600 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 border-l-4 border-transparent'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-slate-200 my-4" />

          {/* Logout Button */}
          <div className="px-4 py-6">
            <button
              onClick={() => {
                closeSidebar()
                handleLogout()
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
