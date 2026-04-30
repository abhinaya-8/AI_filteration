import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, getDrives, createDrive, updateDrive } from '../services/api'
import Modal from '../components/Modal'
import DriveCard from '../components/DriveCard'

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null)
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [roleTitle, setRoleTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [totalOpenings, setTotalOpenings] = useState('')
  const [deadline, setDeadline] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const [meRes, drivesRes] = await Promise.all([getMe(), getDrives()])
      setProfile(meRes.data)
      setDrives(drivesRes.data)
    } catch {
      setDrives([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatusChange = async (driveId, newStatus) => {
    try {
      await updateDrive(driveId, { statusOverride: newStatus })
      load() // Refresh the drive list
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status. Please try again.')
    }
  }

  const handleEditDrive = (drive) => {
    // TODO: Implement edit functionality
    console.log('Edit drive:', drive)
  }

  const handleViewDriveDetails = (drive) => {
    navigate(`/admin/drives/${drive.id}`)
  }

  const handleCreateDrive = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitLoading(true)
    try {
      await createDrive({
        roleTitle,
        jobDescription,
        totalOpenings: totalOpenings ? parseInt(totalOpenings) : 0,
        deadline: deadline || null,
      })
      setShowModal(false)
      setRoleTitle('')
      setJobDescription('')
      setTotalOpenings('')
      setDeadline('')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create drive')
    } finally {
      setSubmitLoading(false)
    }
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          {profile?.companyName && (
            <p className="text-slate-600 mt-1">Company: <span className="font-medium text-primary-700">{profile.companyName}</span></p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
        >
          Create Recruitment Drive
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drives.map((drive) => (
          <DriveCard
            key={drive.id}
            drive={drive}
            isAdmin={true}
            onStatusChange={handleStatusChange}
            onEdit={handleEditDrive}
            onViewDetails={handleViewDriveDetails}
            showDeadline={true}
          />
        ))}
      </div>

      {drives.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
          <p className="text-lg">No recruitment drives yet. Create one to get started.</p>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Recruitment Drive">
        <form onSubmit={handleCreateDrive} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role Title</label>
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Openings</label>
            <input
              type="number"
              value={totalOpenings}
              onChange={(e) => setTotalOpenings(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              min="1"
              placeholder="e.g., 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={submitLoading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {submitLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
