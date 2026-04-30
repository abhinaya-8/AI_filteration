export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slideUp border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="text-slate-700">
          {children}
        </div>
      </div>
    </div>
  )
}
