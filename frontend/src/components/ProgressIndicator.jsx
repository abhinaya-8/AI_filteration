/**
 * ProgressIndicator Component
 * Displays application progress for a recruitment drive with animations
 */
export default function ProgressIndicator({ applications, total, showLabel = true, size = 'md' }) {
  const percentage = total > 0 ? Math.round((applications / total) * 100) : 0
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-4',
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const heightClass = sizeClasses[size] || sizeClasses.md
  const textClass = textSizeClasses[size] || textSizeClasses.md

  // Determine status and color based on percentage
  const getStatusColor = () => {
    if (percentage >= 90) return 'from-red-600 to-red-700'
    if (percentage >= 70) return 'from-orange-600 to-orange-700'
    if (percentage >= 40) return 'from-primary-600 to-primary-700'
    return 'from-green-600 to-green-700'
  }

  const getStatusText = () => {
    if (percentage >= 90) return '🔴 Nearly full'
    if (percentage >= 70) return '🟠 Filling fast'
    if (percentage >= 40) return '🟡 Moderate'
    return '🟢 Open'
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        {showLabel && (
          <div className={`${textClass} font-semibold text-slate-700 flex items-center gap-1`}>
            📊 Applications
          </div>
        )}
        <div className={`${textClass} font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg`}>
          {applications} / {total}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className={`w-full ${heightClass} bg-slate-200 rounded-full overflow-hidden shadow-sm`}>
        <div
          className={`${heightClass} bg-gradient-to-r ${getStatusColor()} rounded-full transition-all duration-500 ease-out shadow-lg relative`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center justify-between">
        <div className={`${textClass} font-semibold text-slate-600`}>
          {percentage}% filled
        </div>
        <div className={`${textClass} font-medium text-slate-700`}>
          {getStatusText()}
        </div>
      </div>
    </div>
  )
}
