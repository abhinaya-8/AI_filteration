import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await apiLogin({ email, password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-slate-50 to-secondary-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-slideUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">AI-powered recruitment platform</p>
        </div>

        {/* Form Card */}
        <div className="card p-8 md:p-10 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="relative animate-slideDown bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-lg mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="label-base">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="label-base">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-3 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Signing in...
                </span>
              ) : (
                '✓ Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center p-4 bg-white/50 backdrop-blur rounded-xl border border-slate-200">
          <p className="text-slate-600 text-sm">
            Don't have an account? {' '}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
              Create one now
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs font-medium text-blue-900 mb-2">Demo Credentials:</p>
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
