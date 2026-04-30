/**
 * DriveCard Component
 * Displays a recruitment drive with status, progress, and actions
 * Reusable for both admin dashboard and user-facing pages
 */
import { useState } from 'react'
import DriveStatusBadge from './DriveStatusBadge'
import ProgressIndicator from './ProgressIndicator'

export default function DriveCard({
  drive,
  isAdmin = false,
  onStatusChange = null,
  onEdit = null,
  onViewDetails = null,
  onApply = null,
  showDeadline = true,
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!onStatusChange) return
    
    setIsUpdating(true)
    try {
      await onStatusChange(drive.id, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = () => {
    switch (drive.status) {
      case 'Open':
        return 'from-green-500 to-green-600'
      case 'Filling Fast':
        return 'from-orange-500 to-orange-600'
      case 'Closed':
        return 'from-red-500 to-red-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  return (
    <div className="card hover:shadow-hover transition-all duration-300 overflow-hidden group">
      {/* Header with gradient accent */}
      <div className={`h-1 w-full bg-gradient-to-r ${getStatusColor()}`} />

      {/* Main Content */}
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2">
              {drive.roleTitle}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2">
              {drive.jobDescription?.substring(0, 80)}
              {drive.jobDescription?.length > 80 ? '...' : ''}
            </p>
          </div>
          <DriveStatusBadge status={drive.status} size="md" />
        </div>

        {/* Progress */}
        {drive.progress && (
          <div className="mb-6">
            <ProgressIndicator
              applications={drive.progress.applications}
              total={drive.progress.total}
              showLabel={true}
              size="md"
            />
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              📋 Openings
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {drive.totalOpenings || 0}
            </p>
          </div>

          {showDeadline && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                📅 Deadline
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {formatDate(drive.deadline)}
              </p>
            </div>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && onStatusChange && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="mb-3 text-sm font-semibold text-blue-900">⚙️ Status Override</p>
            <div className="flex flex-wrap gap-2">
              {['Open', 'Filling Fast', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating || drive.status === status}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    drive.status === status
                      ? 'bg-blue-600 text-white shadow-md cursor-default'
                      : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Actions */}
      <div className="flex gap-3 p-6 sm:p-8 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(drive)}
            className="flex-1 btn-primary py-2.5"
          >
            📊 Details
          </button>
        )}
        {onApply && (
          <button
            onClick={() => onApply(drive)}
            disabled={drive.status === 'Closed'}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              drive.status === 'Closed' 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-accent-600 text-white hover:bg-accent-700 shadow-sm hover:shadow-md'
            }`}
          >
            {drive.status === 'Closed' ? '🚫 Closed' : '✓ Apply Now'}
          </button>
        )}
        {isAdmin && onEdit && (
          <button
            onClick={() => onEdit(drive)}
            className="flex-1 btn-outline py-2.5"
          >
            ✏️ Edit
          </button>
        )}
      </div>
    </div>
  )
}
