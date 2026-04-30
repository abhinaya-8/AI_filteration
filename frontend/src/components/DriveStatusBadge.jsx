/**
 * DriveStatusBadge Component
 * Displays recruitment drive status with color coding and animations
 * - Green (Open)
 * - Orange (Filling Fast)
 * - Red (Closed)
 */
export default function DriveStatusBadge({ status, size = 'md' }) {
  const statusStyles = {
    Open: {
      bg: 'bg-gradient-to-r from-green-100 to-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: '🟢',
      pulse: 'animate-pulse',
    },
    'Filling Fast': {
      bg: 'bg-gradient-to-r from-orange-100 to-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: '🟠',
      pulse: 'animate-pulse',
    },
    Closed: {
      bg: 'bg-gradient-to-r from-red-100 to-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '🔴',
      pulse: '',
    },
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }

  const style = statusStyles[status] || statusStyles.Open
  const sizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold border-2
        ${style.bg} ${style.text} ${style.border} ${sizeClass}
        shadow-sm hover:shadow-md transition-all duration-200
      `}
    >
      <span className={style.pulse}>{style.icon}</span>
      <span>{status || 'Open'}</span>
    </span>
  )
}
