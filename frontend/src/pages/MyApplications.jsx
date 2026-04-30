import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications } from '../services/api'
import StatusBadge from '../components/StatusBadge'

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyApplications()
      .then((res) => {
        console.log('Loaded applications:', res.data)
        setApplications(res.data || [])
      })
      .catch((err) => {
        console.error('Error loading applications:', err)
        setError(err.response?.data?.error || err.message || 'Failed to load applications')
        setApplications([])
      })
      .finally(() => setLoading(false))
  }, [])

  const applicationsByCompany = useMemo(() => {
    const byCompany = {}
    applications.forEach((app) => {
      const name = app.companyName || 'Unknown Company'
      if (!byCompany[name]) byCompany[name] = []
      byCompany[name].push(app)
    })
    return byCompany
  }, [applications])

  const companyNames = useMemo(() => Object.keys(applicationsByCompany).sort(), [applicationsByCompany])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Companies I applied to</h1>
      <p className="text-slate-500 mb-6">
        View all companies and roles you've applied to. Status and ai score update after the recruiter runs the AI filter.
      </p>
      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      {companyNames.length > 0 ? (
        <div className="space-y-8">
          {companyNames.map((companyName) => (
            <div key={companyName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800">{companyName}</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {applicationsByCompany[companyName].length} application{applicationsByCompany[companyName].length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {applicationsByCompany[companyName].map((app) => (
                  <div key={app.id} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-800">{app.roleTitle}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.aiScore != null && (
                          <span className="text-sm text-slate-500">
                            Score: <strong>{Math.round((app.aiScore || 0) * 100)}%</strong>
                          </span>
                        )}
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                    {app.aiScore != null && (
                      <div className="mt-2">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${Math.min(100, (app.aiScore || 0) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <p className="mb-4">You haven't applied to any companies yet.</p>
          <Link to="/dashboard" className="text-primary-600 font-medium hover:underline">
            Browse companies and apply →
          </Link>
        </div>
      )}
    </div>
  )
}
