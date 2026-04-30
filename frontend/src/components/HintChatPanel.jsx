import React, { useState, useRef, useEffect } from 'react'
import { hintChat } from '../services/api'

const HintChatPanel = ({ isOpen, question, onClose }) => {
  const [hints, setHints] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [hintCount, setHintCount] = useState(0)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && question) {
      setHints({})
      setHintCount(0)
    }
  }, [isOpen, question])

  useEffect(() => {
    scrollToBottom()
  }, [hints])

  const requestHint = async (level) => {
    if (hintCount >= 3 || hints[level]) return

    setIsLoading(true)

    try {
      const response = await hintChat({
        question,
        level,
        userAttempt: 'No attempt yet'
      })

      setHints(prev => ({
        ...prev,
        [level]: response.data.reply
      }))
      setHintCount(prev => prev + 1)
    } catch (error) {
      console.error('Hint request error:', error)
      setHints(prev => ({
        ...prev,
        [level]: '⚠️ Error loading hint. Please try again.'
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const hintConfigs = [
    { level: 1, bgClass: 'from-amber-50 to-amber-100', borderClass: 'border-amber-500', textClass: 'text-amber-700', bgLight: 'bg-amber-100', textLight: 'text-amber-700', bgButton: 'bg-amber-500 hover:bg-amber-600 border-amber-600', icon: '💡', title: 'Subtle Hint' },
    { level: 2, bgClass: 'from-orange-50 to-orange-100', borderClass: 'border-orange-500', textClass: 'text-orange-700', bgLight: 'bg-orange-100', textLight: 'text-orange-700', bgButton: 'bg-orange-500 hover:bg-orange-600 border-orange-600', icon: '🔍', title: 'Specific Guidance' },
    { level: 3, bgClass: 'from-green-50 to-green-100', borderClass: 'border-green-500', textClass: 'text-green-700', bgLight: 'bg-green-100', textLight: 'text-green-700', bgButton: 'bg-green-500 hover:bg-green-600 border-green-600', icon: '🎯', title: 'Almost Answer' },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div className={`fixed top-0 right-0 z-40 h-screen w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-primary-600 to-primary-700 flex-shrink-0">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🤖</span>
              <span>AI Tutor</span>
            </h3>
            <p className="text-xs text-primary-100 mt-1">Progressive hint system (max 3)</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-primary-800 transition-all duration-200 flex-shrink-0"
            aria-label="Close hint panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hints Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-slate-50 to-white">
          {/* Current Question */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-5 border-2 border-primary-200">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-2">❓ Question</p>
            <p className="text-sm font-medium text-slate-800 leading-relaxed">{question}</p>
          </div>

          {/* Hint Display Area */}
          <div className="space-y-4">
            {hintConfigs.map(({ level, bgClass, borderClass, textClass, icon, title }) =>
              hints[level] && (
                <div
                  key={level}
                  className={`bg-gradient-to-br ${bgClass} rounded-2xl p-5 border-l-4 ${borderClass} shadow-sm hover:shadow-md transition-all duration-200 animate-slideUp`}
                >
                  <p className={`text-xs font-bold ${textClass} uppercase tracking-wide mb-2 flex items-center gap-1`}>
                    <span>{icon}</span>
                    <span>Level {level} - {title}</span>
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{hints[level]}</p>
                </div>
              )
            )}
          </div>

          {/* No hints yet */}
          {hintCount === 0 && (
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-300">
              <p className="text-sm font-medium text-slate-600">📝 No hints requested yet</p>
              <p className="text-xs text-slate-500 mt-1">Select a level below to start</p>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-6 animate-slideUp">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}

          {/* Hint count display */}
          <div className="text-center pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full">
              <span className="text-sm font-bold text-primary-700">{hintCount}/3</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i <= hintCount ? 'bg-primary-600' : 'bg-primary-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Hint Buttons Area */}
        <div className="p-6 border-t border-slate-200 bg-white flex-shrink-0 space-y-3">
          {hintConfigs.map(({ level, bgLight, textLight, bgButton, icon, title }) => (
            <button
              key={level}
              onClick={() => requestHint(level)}
              disabled={isLoading || hintCount >= 3 || hints[level]}
              className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${
                hints[level]
                  ? `${bgLight} ${textLight} cursor-default border-2 border-yellow-300`
                  : hintCount >= 3
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : `text-white border-2 ${bgButton}`
              }`}
            >
              {hints[level] ? (
                <>
                  <span>✓</span>
                  <span>Level {level} {title}</span>
                </>
              ) : (
                <>
                  <span>{icon}</span>
                  <span>Level {level} - {title}</span>
                </>
              )}
            </button>
          ))}

          <p className="text-xs text-slate-500 text-center pt-2 font-medium">
            {hintCount >= 3
              ? '✅ Maximum hints reached'
              : `💡 ${3 - hintCount} hints remaining`}
          </p>
        </div>
      </div>
    </>
  )
}

export default HintChatPanel