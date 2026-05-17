import { useEffect, useState } from 'react'

function useDemoData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const encoded = params.get('d')
      if (!encoded) { setError(true); return }
      const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))))
      setData(decoded)
    } catch {
      setError(true)
    }
  }, [])

  return { data, error }
}

function ChatBubble({ speaker, text, index }) {
  const isFlint = speaker === 'Flint'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 400 + 200)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      className={`flex gap-3 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${isFlint ? 'justify-start' : 'justify-end'}`}
    >
      {isFlint && (
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.5L10.5 4.125V7.875L6 10.5L1.5 7.875V4.125L6 1.5Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isFlint
            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
            : 'bg-blue-600 text-white rounded-tr-sm'
        }`}
      >
        {isFlint && (
          <p className="text-[10px] font-semibold text-blue-500 mb-1 uppercase tracking-wider">Flint ✦</p>
        )}
        {text}
      </div>
      {!isFlint && (
        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium text-gray-600">
          S
        </div>
      )}
    </div>
  )
}

export default function DemoPage() {
  const { data, error } = useDemoData()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L17.5 6.875V13.125L10 17.5L2.5 13.125V6.875L10 2.5Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500">Demo link is invalid or expired.</p>
          <a href="https://flintk12.com" className="text-xs text-blue-600 mt-2 block hover:underline">
            Visit flintk12.com →
          </a>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const demo = data.demo || {}
  const interaction = demo.student_interaction || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Flint</span>
          <div className="ml-auto">
            <a
              href="https://flintk12.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              flintk12.com ↗
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span>Built for {data.district}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">
            A tutoring session tailored to your students
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Hi {data.name} — here's a preview of how Flint would work in {data.district}.
            This demo was built specifically for your district's students and curriculum.
          </p>
        </div>

        {/* Demo details */}
        {(demo.title || demo.grade_level || demo.subject) && (
          <div className="bg-blue-600 rounded-2xl p-6 text-white">
            {demo.title && <h2 className="text-lg font-bold mb-2">{demo.title}</h2>}
            <div className="flex flex-wrap gap-3 text-sm text-blue-100">
              {demo.grade_level && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  {demo.grade_level}
                </span>
              )}
              {demo.subject && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  {demo.subject}
                </span>
              )}
            </div>
            {demo.context && (
              <p className="text-blue-100 text-sm mt-3 leading-relaxed">{demo.context}</p>
            )}
          </div>
        )}

        {/* Teacher setup */}
        {demo.teacher_setup_prompt && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Teacher Setup
            </p>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              "{demo.teacher_setup_prompt}"
            </p>
          </div>
        )}

        {/* Chat */}
        {interaction.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sample Student Session
              </p>
            </div>
            <div className="p-5 space-y-4">
              {interaction.map((turn, i) => (
                <ChatBubble
                  key={i}
                  speaker={turn.speaker}
                  text={turn.text}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dashboard insight */}
        {demo.teacher_dashboard_insight && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              What You'd See in the Teacher Dashboard
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {demo.teacher_dashboard_insight}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white rounded-xl border border-blue-200 p-6 text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Ready to try Flint with your students?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Free for up to 80 users. No credit card required.
          </p>
          <a
            href="https://flintk12.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start free pilot at flintk12.com →
          </a>
        </div>
      </main>
    </div>
  )
}
