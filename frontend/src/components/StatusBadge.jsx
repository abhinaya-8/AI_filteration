export default function StatusBadge({ status }) {
  const styles = {
    Selected: { bg: 'bg-gradient-to-r from-green-100 to-green-50', text: 'text-green-700', border: 'border-green-200', icon: '✅' },
    Rejected: { bg: 'bg-gradient-to-r from-red-100 to-red-50', text: 'text-red-700', border: 'border-red-200', icon: '❌' },
    Pending: { bg: 'bg-gradient-to-r from-amber-100 to-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '⏳' },
  }
  const s = status || 'Pending'
  const style = styles[s] || styles.Pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${style.bg} ${style.text} ${style.border} shadow-sm hover:shadow-md transition-all duration-200`}>
      <span>{style.icon}</span>
      <span>{s}</span>
    </span>
  )
}
