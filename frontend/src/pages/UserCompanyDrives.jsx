import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCompanies, getDrives, uploadResume } from '../services/api'
import Modal from '../components/Modal'
import DriveCard from '../components/DriveCard'

export default function UserCompanyDrives() {
  const { companyId } = useParams()
  const [companyName, setCompanyName] = useState('')
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [applyDrive, setApplyDrive] = useState(null)
  const [file, setFile] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successRoleTitle, setSuccessRoleTitle] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getCompanies().then((r) => r.data.find((c) => c.id === companyId)),
      getDrives(companyId).then((r) => r.data),
    ]).then(([company, driveList]) => {
      if (!cancelled) {
        setCompanyName(company?.companyName || 'Company')
        setDrives(driveList)
      }
    }).catch(() => {
      if (!cancelled) setDrives([])
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [companyId])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!applyDrive || !file) return
    setError('')
    setSubmitLoading(true)
    setSuccess(false)
    try {
      await uploadResume(applyDrive.id, file)
      setSuccessRoleTitle(applyDrive.roleTitle)
      setSuccess(true)
      setFile(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const closeApplyModal = () => {
    setApplyDrive(null)
    setSuccess(false)
    setSuccessRoleTitle('')
    setError('')
  }

  const openApply = (drive) => {
    setApplyDrive(drive)
    setFile(null)
    setError('')
    setSuccess(false)
    setSuccessRoleTitle('')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <Link to="/dashboard" className="text-primary-600 hover:underline text-sm mb-4 inline-block">← Back to Companies</Link>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Open positions at {companyName}</h1>
      <p className="text-slate-500 mb-6">Apply by uploading your resume (PDF or DOCX).</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drives.map((d) => (
          <DriveCard
            key={d.id}
            drive={d}
            isAdmin={false}
            onApply={openApply}
            showDeadline={true}
          />
        ))}
      </div>

      {drives.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No open recruitment drives for this company.
        </div>
      )}

      <Modal open={!!applyDrive} onClose={() => !submitLoading && closeApplyModal()} title={applyDrive ? `Apply: ${applyDrive.roleTitle}` : 'Apply'}>
        {applyDrive && (
          <>
            {success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-2xl" aria-hidden>✓</span>
                  <div>
                    <p className="font-semibold text-green-800">Successfully applied!</p>
                    <p className="text-green-700 text-sm mt-0.5">Your application for {successRoleTitle} has been submitted. Status: Pending.</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">You can view all your applications and their status on the My Applications page.</p>
                <div className="flex gap-2 justify-end pt-2">
                  <Link to="/my-applications" onClick={closeApplyModal} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center">
                    View my applications
                  </Link>
                  <button type="button" onClick={closeApplyModal} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resume (PDF or DOCX, max 10MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={closeApplyModal} disabled={submitLoading} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitLoading || !file} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                    {submitLoading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
