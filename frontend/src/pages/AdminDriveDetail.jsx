import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDrive, getResumesByDrive, runAnalyze } from '../services/api'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'

export default function AdminDriveDetail() {
  const { driveId } = useParams()
  const [drive, setDrive] = useState(null)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [keywords, setKeywords] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [driveRes, resumesRes] = await Promise.all([getDrive(driveId), getResumesByDrive(driveId)])
      setDrive(driveRes.data)
      setResumes(resumesRes.data || [])
      console.log('Loaded drive:', driveRes.data)
      console.log('Loaded resumes:', resumesRes.data)
    } catch (err) {
      console.error('Error loading drive details:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load drive')
      setDrive(null)
      setResumes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [driveId])

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError('')
    setAnalyzing(true)
    setAnalyzeResult(null)
    try {
      const { data } = await runAnalyze(driveId, keywords)
      setAnalyzeResult(data)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const selectedCount = resumes.filter((r) => r.status === 'Selected').length
  const rejectedCount = resumes.filter((r) => r.status === 'Rejected').length
  const pendingCount = resumes.filter((r) => r.status === 'Pending').length

  if (loading && !drive) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!drive) {
    return (
      <div className="text-center py-12 text-slate-500">
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
        Drive not found. <Link to="/dashboard" className="text-primary-600">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div>
      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
      <Link to="/dashboard" className="text-primary-600 hover:underline text-sm mb-4 inline-block">← Back to Dashboard</Link>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{drive.roleTitle}</h1>
          <p className="text-slate-500 mt-1 max-w-2xl">{drive.jobDescription}</p>
        </div>
        <button
          onClick={() => { setShowFilterModal(true); setAnalyzeResult(null); setError(''); setKeywords(''); }}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
        >
          Start AI Filter
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-slate-500 text-sm">Total Applicants</p>
          <p className="text-2xl font-bold text-slate-800">{resumes.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-slate-500 text-sm">Selected</p>
          <p className="text-2xl font-bold text-green-600">{selectedCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-slate-500 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-slate-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['All', 'Selected', 'Rejected', 'Pending'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-100 text-primary-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {resumes.filter(r => filter === 'All' || r.status === filter).map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-800">{r.applicantName || 'Applicant'}</h3>
              <div className="flex items-center gap-2">
                {r.aiScore != null && (
                  <span className="text-sm text-slate-500">
                    Score: <strong>{Math.round((r.aiScore || 0) * 100)}%</strong>
                  </span>
                )}
                <StatusBadge status={r.status} />
              </div>
            </div>
            {r.extractedText && (
              <p className="text-slate-600 text-sm mt-2 line-clamp-3">{r.extractedText}</p>
            )}
            {r.aiScore != null && (
              <div className="mt-2">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (r.aiScore || 0) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {resumes.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No resumes submitted yet for this drive.
        </div>
      )}

      <Modal open={showFilterModal} onClose={() => !analyzing && setShowFilterModal(false)} title="Start AI Filter">
        <p className="text-slate-600 text-sm mb-4">
          Enter optional keywords to improve matching. The job description is already used. Resumes will be scored with TF-IDF + cosine similarity (threshold 65%).
        </p>
        <form onSubmit={handleAnalyze} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Keywords (optional)</label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="e.g. Python, React, 3 years experience"
            />
          </div>
          {analyzing && (
            <div className="flex items-center gap-2 text-primary-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
              <span>Evaluating resumes...</span>
            </div>
          )}
          {analyzeResult && !analyzing && (
            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-slate-800">Analysis complete</p>
              <p>Selected: {analyzeResult.selectedCount} | Rejected: {analyzeResult.rejectedCount}</p>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowFilterModal(false)} disabled={analyzing} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              Close
            </button>
            <button type="submit" disabled={analyzing || resumes.length === 0} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
