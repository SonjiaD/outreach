import { useEffect, useState, useRef } from 'react'

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

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
    } catch { setError(true) }
  }, [])
  return { data, error }
}

// ---------------------------------------------------------------------------
// Shared atoms
// ---------------------------------------------------------------------------

function FlintLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="2.7" y1="6.5" x2="21.3" y2="17.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="2.7" y1="17.5" x2="21.3" y2="6.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

function SparkyAvatar({ size = 32 }) {
  return (
    <div
      className="rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <FlintLogo size={size * 0.5} />
    </div>
  )
}

function StepDots({ current, total = 5 }) {
  const labels = ['Welcome', 'Create Activity', 'Student Session', 'Analytics', 'Get Started']
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-orange-500' : i < current ? 'w-2 bg-orange-300' : 'w-2 bg-gray-200'
            }`}
          />
        </div>
      ))}
      <span className="ml-1 text-xs text-gray-400">{labels[current]}</span>
    </div>
  )
}

function StepLabel({ step, instruction }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
        Step {step} of 5
      </p>
      <p className="text-sm text-gray-600 leading-relaxed">{instruction}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Welcome
// ---------------------------------------------------------------------------

function WelcomeStep({ data, onNext }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6">
        <FlintLogo size={32} />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Hi {data.name} — welcome to Flint
      </h1>
      <p className="text-gray-500 mb-1 text-sm max-w-md">
        You're about to see how Flint would work in <span className="font-medium text-gray-700">{data.district}</span>'s classrooms.
      </p>
      <p className="text-gray-400 text-sm mb-8 max-w-md">
        This takes about 2 minutes. You'll create an activity, watch a live student session, and see what the teacher dashboard looks like — all built specifically for your students.
      </p>
      <button
        onClick={onNext}
        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-8 py-3 rounded-lg transition-colors"
      >
        Let's start →
      </button>
      <p className="text-xs text-gray-300 mt-4">Personalized for {data.district}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Activity Builder
// ---------------------------------------------------------------------------

function ActivityStep({ data, onNext }) {
  const demo = data.demo || {}
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState(demo.teacher_setup_prompt || '')
  const [sparkyTyping, setSparkyTyping] = useState(false)
  const [sparkyVisible, setSparkyVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)

  const handleSend = () => {
    if (sent) return
    setSent(true)
    setSparkyTyping(true)
    setTimeout(() => {
      setSparkyTyping(false)
      setSparkyVisible(true)
    }, 1200)
    setTimeout(() => setPreviewVisible(true), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <StepLabel step={2} instruction="You're a teacher at your school. Ask Sparky to create an activity for your students — or just click Send to use the suggestion below." />

      <div className="grid grid-cols-[1fr_320px] gap-4 h-[480px]">
        {/* Chat panel */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <SparkyAvatar size={28} />
            <div>
              <p className="text-xs font-semibold text-gray-900">Activity Builder</p>
              <p className="text-[10px] text-gray-400">Build with Sparky</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Sparky opening */}
            <div className="flex gap-2 items-start">
              <SparkyAvatar size={28} />
              <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-xs">
                <p className="text-[10px] font-semibold text-orange-500 mb-1">Sparky ✦</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Hi! I'm Sparky. What kind of activity would you like to create for your students?
                </p>
              </div>
            </div>

            {/* Teacher message */}
            {sent && (
              <div className="flex justify-end">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-xs">
                  <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                </div>
              </div>
            )}

            {/* Sparky reply */}
            {sparkyTyping && (
              <div className="flex gap-2 items-start">
                <SparkyAvatar size={28} />
                <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {sparkyVisible && (
              <div className="flex gap-2 items-start">
                <SparkyAvatar size={28} />
                <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-xs">
                  <p className="text-[10px] font-semibold text-orange-500 mb-1">Sparky ✦</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {demo.sparky_reply || `Perfect! I've created a ${demo.subject} activity for ${demo.grade_level}. Students will work through it step by step while I guide them with questions — I never just give them the answer.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3">
            {!sent ? (
              <div className="flex gap-2 items-end">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700 placeholder-gray-300"
                  placeholder="Type a message to Sparky..."
                />
                <button
                  onClick={handleSend}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors h-fit"
                >
                  Send →
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">Message sent</p>
            )}
          </div>
        </div>

        {/* Session Preview panel */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700">Session Preview</p>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            {!previewVisible ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 opacity-20">
                  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                    <circle cx="32" cy="24" r="12" stroke="#9CA3AF" strokeWidth="2"/>
                    <path d="M16 48c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#9CA3AF" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Once you finish building, a preview will show up here.</p>
              </div>
            ) : (
              <div className="w-full space-y-3 animate-[fadeIn_0.5s_ease-in]">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mb-1">Activity Ready ✓</p>
                  <p className="text-sm font-semibold text-gray-900">{demo.title || 'Custom Activity'}</p>
                </div>
                <div className="space-y-1.5">
                  {[
                    ['Grade', demo.grade_level],
                    ['Subject', demo.subject],
                    ['Type', 'AI-guided tutoring session'],
                    ['Scaffolding', 'Enabled — Flint guides, doesn\'t answer'],
                  ].map(([k, v]) => v && (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-gray-700 font-medium text-right max-w-[140px] truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {previewVisible && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={onNext}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                View student session →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Student Session
// ---------------------------------------------------------------------------

function SessionStep({ data, onNext }) {
  const demo = data.demo || {}
  const interactions = demo.student_interaction || []

  // Interleave: show pairs (student message, then Flint response)
  // visibleCount: how many messages are shown (student messages shown instantly, Flint shown after delay)
  const [visibleCount, setVisibleCount] = useState(0)
  const [flintTyping, setFlintTyping] = useState(false)
  const [pendingFlint, setPendingFlint] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount, flintTyping])

  const handleSend = () => {
    if (flintTyping || pendingFlint) return
    const nextStudent = visibleCount // show this student message (0-indexed)
    if (nextStudent >= interactions.length) return

    // Show student message immediately
    setVisibleCount(nextStudent + 1)

    // If next message is a Flint message, auto-show after delay
    const nextMsg = interactions[nextStudent + 1]
    if (nextMsg && nextMsg.speaker === 'Flint') {
      setPendingFlint(true)
      setFlintTyping(true)
      setTimeout(() => {
        setFlintTyping(false)
        setVisibleCount(nextStudent + 2)
        setPendingFlint(false)
      }, 900)
    }
  }

  const shownMessages = interactions.slice(0, visibleCount)
  const nextMsg = interactions[visibleCount]
  const isStudentNext = nextMsg?.speaker === 'Student'
  const allDone = visibleCount >= interactions.length

  return (
    <div className="max-w-4xl mx-auto w-full">
      <StepLabel step={3} instruction={`A student just started "${demo.title || 'your activity'}". Click → Send to submit each of their messages and watch how Flint guides them.`} />

      <div className="grid grid-cols-[200px_1fr] gap-4 h-[480px]">
        {/* Sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Activity</p>
            <p className="text-xs font-medium text-gray-800 mt-1 leading-snug">{demo.title || 'Activity'}</p>
          </div>
          <div className="p-3 space-y-2">
            {demo.grade_level && (
              <div>
                <p className="text-[10px] text-gray-400">Grade</p>
                <p className="text-xs text-gray-700 font-medium">{demo.grade_level}</p>
              </div>
            )}
            {demo.subject && (
              <div>
                <p className="text-[10px] text-gray-400">Subject</p>
                <p className="text-xs text-gray-700 font-medium">{demo.subject}</p>
              </div>
            )}
          </div>
          <div className="mt-auto p-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Students</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">
                {data.district?.[0] || 'S'}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Student</p>
                <p className="text-[10px] text-orange-500 font-medium">● In session</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <SparkyAvatar size={24} />
            <p className="text-xs font-semibold text-gray-700">Live Session</p>
            <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">● Active</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Opening Flint message */}
            <div className="flex gap-2 items-start">
              <SparkyAvatar size={28} />
              <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-sm">
                <p className="text-[10px] font-semibold text-orange-500 mb-1">Flint ✦</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Hi! I'm ready to help you work through this. What's on your mind to start?
                </p>
              </div>
            </div>

            {shownMessages.map((msg, i) => {
              const isFlint = msg.speaker === 'Flint'
              return (
                <div key={i} className={`flex gap-2 items-start ${!isFlint ? 'justify-end' : ''}`}>
                  {isFlint && <SparkyAvatar size={28} />}
                  <div className={`rounded-2xl px-3.5 py-2.5 max-w-sm text-sm leading-relaxed ${
                    isFlint
                      ? 'bg-blue-50 border border-blue-100 rounded-tl-sm text-gray-700'
                      : 'bg-white border border-gray-200 rounded-tr-sm text-gray-700'
                  }`}>
                    {isFlint && <p className="text-[10px] font-semibold text-orange-500 mb-1">Flint ✦</p>}
                    {msg.text}
                  </div>
                  {!isFlint && (
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600 flex-shrink-0">
                      {data.district?.[0] || 'S'}
                    </div>
                  )}
                </div>
              )
            })}

            {flintTyping && (
              <div className="flex gap-2 items-start">
                <SparkyAvatar size={28} />
                <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <div className="flex gap-1 items-center py-0.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-100 p-3">
            {allDone ? (
              <button
                onClick={onNext}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                See what the teacher sees →
              </button>
            ) : isStudentNext ? (
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 truncate">
                  {nextMsg.text}
                </div>
                <button
                  onClick={handleSend}
                  disabled={flintTyping || pendingFlint}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  Send →
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">Flint is responding...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — Teacher Analytics
// ---------------------------------------------------------------------------

function AnalyticsStep({ data, onNext }) {
  const demo = data.demo || {}
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(1), 300),
      setTimeout(() => setVisible(2), 700),
      setTimeout(() => setVisible(3), 1100),
      setTimeout(() => setVisible(4), 1500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const cols = [
    {
      label: 'TEACHER FEEDBACK',
      color: 'text-gray-400 border-gray-200',
      badge: 'bg-gray-100 text-gray-500',
      content: null,
      empty: 'No feedback provided yet.',
    },
    {
      label: 'STRENGTHS',
      color: 'text-green-600 border-green-200',
      badge: 'bg-green-100 text-green-700',
      content: demo.strengths,
      highlight: 'green',
    },
    {
      label: 'AREAS OF IMPROVEMENT',
      color: 'text-orange-600 border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      content: demo.areas_for_improvement,
      highlight: 'orange',
    },
    {
      label: 'FOLLOW-UP',
      color: 'text-blue-600 border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      content: demo.follow_up_suggestion,
      action: true,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto w-full">
      <StepLabel step={4} instruction="The session just ended. Flint automatically analyzed everything. Here's your teacher dashboard." />

      <div className="grid grid-cols-[180px_1fr] gap-4">
        {/* Student list sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Chats</p>
          </div>
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gray-50 cursor-default">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                {data.district?.[0] || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">Student</p>
                <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">PROFICIENT</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-2 mt-auto">
            <p className="text-[10px] text-gray-400 leading-relaxed">{demo.teacher_dashboard_insight}</p>
          </div>
        </div>

        {/* Analytics columns */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-700">Session Analytics</p>
            <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">● PROFICIENT</span>
          </div>

          <div className="grid grid-cols-4 divide-x divide-gray-100 min-h-[240px]">
            {cols.map((col, i) => (
              <div
                key={col.label}
                className={`p-4 transition-all duration-500 ${
                  visible > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded mb-3 tracking-wider ${col.badge}`}>
                  {col.label}
                </span>
                {col.content ? (
                  <p className="text-xs text-gray-600 leading-relaxed">{col.content}</p>
                ) : col.empty ? (
                  <p className="text-xs text-gray-300 italic">{col.empty}</p>
                ) : null}
                {col.action && col.content && (
                  <button className="mt-3 text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors">
                    Create a follow-up activity
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={onNext}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              See how to get started →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 5 — CTA
// ---------------------------------------------------------------------------

function CTAStep({ data }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6">
        <FlintLogo size={28} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {data.district} could have this for every student.
      </h2>
      <p className="text-gray-500 text-sm mb-2 max-w-md">
        Free for up to 80 users. No credit card required. Setup takes under 10 minutes.
      </p>
      <p className="text-gray-400 text-xs mb-8 max-w-sm">
        FERPA compliant · COPPA compliant · SOC 2 Type II · Does not train on student data
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <a
          href="https://flintk12.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Start free pilot →
        </a>
        <a
          href="https://flintk12.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Book a demo
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const { data, error } = useDemoData()
  const [step, setStep] = useState(0)

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
            <FlintLogo size={24} />
          </div>
          <p className="text-sm text-gray-500 mb-2">Demo link is invalid or expired.</p>
          <a href="https://flintk12.com" className="text-xs text-orange-500 hover:underline">
            Visit flintk12.com →
          </a>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <div className="flex items-center gap-2 text-orange-500">
            <FlintLogo size={18} />
            <span className="font-bold text-gray-900 text-sm">Flint</span>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <StepDots current={step} />
            <a
              href="https://flintk12.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              flintk12.com ↗
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {step === 0 && <WelcomeStep data={data} onNext={() => setStep(1)} />}
        {step === 1 && <ActivityStep data={data} onNext={() => setStep(2)} />}
        {step === 2 && <SessionStep data={data} onNext={() => setStep(3)} />}
        {step === 3 && <AnalyticsStep data={data} onNext={() => setStep(4)} />}
        {step === 4 && <CTAStep data={data} />}
      </main>
    </div>
  )
}
