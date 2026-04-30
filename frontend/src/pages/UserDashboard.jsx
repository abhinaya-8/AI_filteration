import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCompanies } from '../services/api'

export default function UserDashboard() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompanies()
      .then((res) => setCompanies(res.data))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading opportunities...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 animate-slideUp">
        <h1 className="section-title">🌟 Discover Opportunities</h1>
        <p className="section-subtitle">
          Browse through top companies and find your dream job
        </p>
      </div>

      {/* Companies Grid */}
      {companies.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
          {companies.map((company, index) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}/drives`}
              className="card-interactive group animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6 sm:p-8">
                {/* Logo/Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🏢</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {company.companyName}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {company.description || 'Click to view open positions and apply now'}
                </p>

                {/* Arrow */}
                <div className="inline-flex items-center gap-1 text-primary-600 font-semibold group-hover:gap-2 transition-all duration-200">
                  <span>View positions</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Hover Accent */}
              <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-300" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center animate-slideUp">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg font-semibold text-slate-900 mb-2">No Companies Available</p>
          <p className="text-slate-600">
            Check back soon for exciting new opportunities from top companies!
          </p>
        </div>
      )}
    </div>
  )
}
