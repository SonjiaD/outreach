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
// Atoms
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
      className="rounded-full bg-amber-400 flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.45 }}>S</span>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-start">
      <SparkyAvatar size={28} />
      <div className="border border-dashed border-blue-300 bg-blue-50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-blue-400 italic">
        ↔ Thinking...
      </div>
    </div>
  )
}

function FlintBubble({ children }) {
  return (
    <div className="flex gap-2 items-start">
      <SparkyAvatar size={28} />
      <div className="bg-[#EBF4FF] rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
        <p className="text-sm text-gray-800 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

function UserBubble({ children, initial = 'T' }) {
  return (
    <div className="flex gap-2 items-start justify-end">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
        <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
      </div>
      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[11px] font-bold text-orange-600 flex-shrink-0">
        {initial}
      </div>
    </div>
  )
}

// Progress dots in header
function StepDots({ current }) {
  const steps = ['Welcome', 'Create Activity', 'Student Session', 'Analytics', 'Get Started']
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`h-2 rounded-full transition-all duration-300 ${
            i === current ? 'w-6 bg-orange-500' : i < current ? 'w-2 bg-orange-300' : 'w-2 bg-gray-200'
          }`} />
        </div>
      ))}
      <span className="ml-1 text-xs text-gray-400">{steps[current]}</span>
    </div>
  )
}

// Orange banner shown at the top of each demo step
function StepBanner({ number, title, description }) {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// Sidebar that looks lived-in — multiple past chats + user info at bottom
function DemoSidebar({ data, demo }) {
  const pastChats = [
    demo?.title || 'Unnamed Activity',
    'Reading Comprehension',
    'Science Vocabulary',
    'Math Problem Solving',
    'Essay Writing Practice',
  ]
  return (
    <aside className="w-[220px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-gray-100">
        <a href="https://flintk12.com" className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
          ← Back to Home
        </a>
      </div>
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">My chats</span>
        <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">+</button>
      </div>
      <div className="px-2 space-y-0.5 overflow-y-auto flex-1">
        {pastChats.map((title, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-default ${
              i === 0 ? 'bg-blue-50' : 'opacity-60'
            }`}
          >
            <SparkyAvatar size={20} />
            <p className={`text-xs truncate ${i === 0 ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
              {title}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 p-4 flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {data?.name?.[0] || 'U'}
        </div>
        <p className="text-xs text-gray-700 font-medium truncate">{data?.name || 'Teacher'}</p>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Step 0 — Welcome
// ---------------------------------------------------------------------------

function WelcomeStep({ data, onNext }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-6 bg-[#FFF8F5]">
      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6">
        <FlintLogo size={32} />
      </div>
      <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
        Personalized for {data.district}
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Hi {data.name} — welcome to Flint
      </h1>
      <p className="text-gray-500 text-sm max-w-md mb-8">
        This 2-minute interactive tour shows how Flint would work in{' '}
        <span className="font-medium text-gray-700">{data.district}</span>'s classrooms —
        built around your students.
      </p>

      <div className="grid grid-cols-3 gap-4 max-w-xl mb-10 w-full">
        {[
          { icon: '✏️', label: 'Create an Activity', sub: 'Watch a teacher set up a lesson with Sparky' },
          { icon: '💬', label: 'Live Student Session', sub: 'See how Flint guides students step by step' },
          { icon: '📊', label: 'Teacher Analytics', sub: 'Review what Flint surfaces after every session' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-4 text-left shadow-sm">
            <p className="text-2xl mb-2">{item.icon}</p>
            <p className="text-xs font-semibold text-gray-800">{item.label}</p>
            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{item.sub}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
      >
        Start Demo →
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Activity Builder (auto-plays)
// ---------------------------------------------------------------------------

function ActivityStep({ data, onNext }) {
  const demo = data.demo?.demo_activity ?? data.demo ?? {}
  const teacherInitial = data.name?.[0] || 'T'
  // phase: 0=initial sparky msg, 1=user msg typed, 2=sparky typing, 3=sparky reply, 4=activity ready, 5=done
  const [phase, setPhase] = useState(0)
  const bottomRef = useRef(null)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3400),
      setTimeout(() => setPhase(4), 4200),
      setTimeout(() => setPhase(5), 5000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [phase])

  const teacherPrompt = demo.teacher_setup_prompt || `Create a ${demo.subject || 'reading'} activity for ${demo.grade_level || 'middle school'} students focused on critical thinking.`
  const sparkyReply = demo.sparky_reply || `Perfect! I've created a ${demo.subject || 'reading'} activity for ${demo.grade_level || 'your students'}. I'll guide each student through it with questions that build understanding step by step — I never just give answers. The activity is ready to share.`

  return (
    <div className="max-w-4xl mx-auto w-full">
      <StepBanner
        number="1"
        title="Creating a lesson activity"
        description="Watch how a teacher describes what they want and Sparky builds it instantly. No setup, no lesson plans — just describe and go."
      />

      <div className="grid grid-cols-[1fr_300px] gap-4 h-[440px]">
        {/* Chat */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <SparkyAvatar size={26} />
            <p className="text-sm font-semibold text-gray-900 flex-1">Activity Builder</p>
            <span className="text-[10px] text-gray-400 border border-gray-200 rounded-md px-2 py-0.5">Created just now</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <FlintBubble>
              Hi! I'm Sparky. Describe the activity you'd like to create and I'll build it for your class.
            </FlintBubble>

            {phase >= 1 && (
              <UserBubble initial={teacherInitial}>{teacherPrompt}</UserBubble>
            )}

            {phase === 2 && <TypingIndicator />}

            {phase >= 3 && (
              <FlintBubble>{sparkyReply}</FlintBubble>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar — locked after send */}
          <div className="border-t border-gray-100 p-3 bg-white">
            <div className={`border rounded-xl px-3 py-2 flex items-center gap-2 transition-colors ${phase >= 1 ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}>
              <span className={`flex-1 text-sm truncate ${phase >= 1 ? 'text-gray-400' : 'text-gray-700'}`}>
                {phase >= 1 ? teacherPrompt : 'Type a message here.'}
              </span>
              <div className="flex items-center gap-2.5 flex-shrink-0 text-gray-300 text-sm">
                <span>+</span>
                <span className={`font-bold ${phase >= 1 ? 'text-gray-300' : 'text-orange-400'}`}>Send →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity preview */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity Preview</p>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            {phase < 4 ? (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 opacity-10">
                  <FlintLogo size={48} />
                </div>
                <p className="text-xs text-gray-400">Activity will appear here once Sparky finishes.</p>
                {phase >= 2 && (
                  <div className="mt-3 flex justify-center">
                    <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full space-y-3 animate-[fadeIn_0.5s_ease-in]">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">✓ Activity Ready</p>
                  <p className="text-sm font-semibold text-gray-900">{demo.title || 'Custom Activity'}</p>
                </div>
                <div className="space-y-2">
                  {[
                    ['Grade', demo.grade_level],
                    ['Subject', demo.subject],
                    ['Mode', 'AI-guided tutoring'],
                    ['Scaffolding', 'Enabled'],
                    ['Anti-cheat', 'Flint never gives answers'],
                  ].map(([k, v]) => v && (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-gray-700 font-medium text-right max-w-[130px] truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {phase >= 5 && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={onNext}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
              >
                Next: See a student session →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Student Session (auto-plays)
// ---------------------------------------------------------------------------

function buildFallbackInteractions(demo) {
  const subject = demo.subject || 'the subject'
  const grade = demo.grade_level || 'students'
  return [
    { speaker: 'Student', text: `I'm not sure where to start with ${subject}. Can you just tell me the answer?` },
    { speaker: 'Flint', text: `I could, but then you wouldn't really understand it! Let's figure it out together. What do you already know about ${subject}? Even a small piece is a good starting point.` },
    { speaker: 'Student', text: `I think I know the basics, but it gets confusing when it gets more complicated.` },
    { speaker: 'Flint', text: `That's a really honest answer — and it's exactly where we should start. Tell me one thing you feel solid on. We'll build from there.` },
    { speaker: 'Student', text: `Okay… I think I understand how the main idea works, just not how to apply it.` },
    { speaker: 'Flint', text: `You're closer than you think. Applying an idea is really about asking: "when would this matter in real life?" Can you think of one situation where this concept shows up outside of class?` },
    { speaker: 'Student', text: `Oh — kind of like how prices change at the store? That's related, right?` },
    { speaker: 'Flint', text: `Yes! That's a great real-world connection. Now let's go one step deeper: why do those prices change? If you can explain the "why," you've got the whole concept.` },
  ]
}

function SessionStep({ data, onNext }) {
  const demo = data.demo?.demo_activity ?? data.demo ?? {}
  const rawInteractions = demo.student_interaction
  const interactions = (Array.isArray(rawInteractions) && rawInteractions.length > 0)
    ? rawInteractions
    : buildFallbackInteractions(demo)
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef(null)
  const districtInitial = data.district?.[0] || 'S'

  useEffect(() => {
    if (interactions.length === 0) {
      const t = setTimeout(() => setDone(true), 3000)
      return () => clearTimeout(t)
    }
    // Play through interactions automatically
    let delay = 1200
    const timers = []
    interactions.forEach((msg, i) => {
      if (msg.speaker === 'Student') {
        timers.push(setTimeout(() => setVisibleCount(i + 1), delay))
        delay += 800
      } else {
        // Flint: show typing, then message
        timers.push(setTimeout(() => setTyping(true), delay))
        delay += 1000
        const capturedI = i
        timers.push(setTimeout(() => {
          setTyping(false)
          setVisibleCount(capturedI + 1)
        }, delay))
        delay += 600
      }
    })
    timers.push(setTimeout(() => setDone(true), delay + 400))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount, typing])

  const shownMessages = interactions.slice(0, visibleCount)

  return (
    <div className="max-w-4xl mx-auto w-full">
      <StepBanner
        number="2"
        title="A student working through the activity"
        description="Watch how Flint keeps the student thinking. It asks guiding questions, corrects misconceptions, and builds understanding — without ever just giving the answer."
      />

      <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[440px] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <SparkyAvatar size={24} />
          <p className="text-sm font-semibold text-gray-900 flex-1">{demo.title || 'Live Session'}</p>
          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
            ● Live
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <FlintBubble>
            Hi! I'm here to help you work through this. What's the first thing on your mind?
          </FlintBubble>

          {shownMessages.map((msg, i) => {
            const isFlint = msg.speaker === 'Flint'
            return isFlint ? (
              <FlintBubble key={i}>{msg.text}</FlintBubble>
            ) : (
              <div key={i} className="flex gap-2 items-start justify-end">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
                  <p className="text-sm text-gray-700 leading-relaxed">{msg.text}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600 flex-shrink-0">
                  {districtInitial}
                </div>
              </div>
            )
          })}

          {typing && <TypingIndicator />}

          {done && (
            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 border-t border-dashed border-gray-200" />
              <span className="text-[10px] text-gray-400 font-medium px-2">Session complete</span>
              <div className="flex-1 border-t border-dashed border-gray-200" />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-3 bg-white">
          {done ? (
            <button
              onClick={onNext}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              Next: See the teacher dashboard →
            </button>
          ) : (
            <div className="border border-dashed border-blue-300 bg-blue-50 rounded-xl px-3 py-2.5 text-sm text-blue-400 italic text-center">
              ↔ Session in progress...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Teacher Analytics (animates in)
// ---------------------------------------------------------------------------

function AnalyticsStep({ data, onNext }) {
  const demo = data.demo?.demo_activity ?? data.demo ?? {}
  const [visible, setVisible] = useState(0)
  const [showNext, setShowNext] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(1), 300),
      setTimeout(() => setVisible(2), 700),
      setTimeout(() => setVisible(3), 1100),
      setTimeout(() => setVisible(4), 1500),
      setTimeout(() => setShowNext(true), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const cols = [
    { label: 'TEACHER NOTES', badge: 'bg-gray-100 text-gray-500', content: null, empty: 'No notes added.' },
    { label: 'STRENGTHS', badge: 'bg-green-100 text-green-700', content: demo.strengths },
    { label: 'AREAS TO IMPROVE', badge: 'bg-orange-100 text-orange-700', content: demo.areas_for_improvement },
    { label: 'SUGGESTED FOLLOW-UP', badge: 'bg-blue-100 text-blue-700', content: demo.follow_up_suggestion, action: true },
  ]

  const statCards = [
    { value: '94%', label: 'Comprehension', color: 'text-green-600', bg: 'bg-green-50' },
    { value: '8', label: 'Exchanges', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: '12m', label: 'Time on task', color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: '0', label: 'Answers given', color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto w-full">
      <StepBanner
        number="3"
        title="The teacher dashboard — instant after every session"
        description="Flint automatically generates a full report when the student finishes. Strengths, gaps, a suggested next activity — no grading required."
      />

      {/* Stat row */}
      <div className={`grid grid-cols-4 gap-3 mb-4 transition-all duration-500 ${visible >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {statCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[180px_1fr] gap-4">
        {/* Students sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Students</p>
          </div>
          <div className="p-2 space-y-1">
            {['Student A', 'Student B', 'Student C'].map((name, i) => (
              <div key={name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${i === 0 ? 'bg-gray-50' : ''} cursor-default`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {name[8]}
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-medium truncate ${i === 0 ? 'text-gray-800' : 'text-gray-400'}`}>{name}</p>
                  {i === 0 && <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1 py-0.5 rounded">PROFICIENT</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto px-3 py-2.5 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 leading-relaxed">{demo.teacher_dashboard_insight || 'Student showed strong engagement throughout the session.'}</p>
          </div>
        </div>

        {/* Analytics panel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-700">Session Analytics</p>
            <div className="ml-auto flex items-center gap-2">
              <button className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5">Print</button>
              <button className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5">Share</button>
              <button className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-0.5">Cite</button>
              <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">● PROFICIENT</span>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-gray-100 min-h-[200px]">
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
                  <button className="mt-3 text-[10px] text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors">
                    Create follow-up →
                  </button>
                )}
              </div>
            ))}
          </div>

          {showNext && (
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end animate-[fadeIn_0.4s_ease-in]">
              <button
                onClick={onNext}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Next: Get started for {data.district} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — CTA
// ---------------------------------------------------------------------------

function CTAStep({ data }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
      <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6">
        <FlintLogo size={28} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Every student in {data.district} could have this.
      </h2>
      <p className="text-gray-500 text-sm mb-1 max-w-md">
        Free for up to 80 users. No credit card required. Setup takes under 10 minutes.
      </p>
      <p className="text-gray-400 text-xs mb-8 max-w-sm">
        FERPA compliant · COPPA compliant · SOC 2 Type II · Does not train on student data
      </p>

      <div className="grid grid-cols-3 gap-4 max-w-lg mb-10 w-full">
        {[
          { icon: '⚡', label: 'Up in 10 minutes', sub: 'No IT required' },
          { icon: '🔒', label: 'FERPA compliant', sub: 'Student data stays yours' },
          { icon: '🆓', label: 'Free pilot', sub: 'Up to 80 users, no cost' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left">
            <p className="text-xl mb-1.5">{item.icon}</p>
            <p className="text-xs font-semibold text-gray-800">{item.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <a
          href="https://flintk12.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-7 py-3 rounded-full transition-colors"
        >
          Start free pilot →
        </a>
        <a
          href="https://flintk12.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium px-7 py-3 rounded-xl transition-colors"
        >
          Book a live demo
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const { data, error } = useDemoData()
  const [step, setStep] = useState(0)

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
            <FlintLogo size={24} />
          </div>
          <p className="text-sm text-gray-500 mb-2">Demo link is invalid or expired.</p>
          <a href="https://flintk12.com" className="text-xs text-orange-500 hover:underline">Visit flintk12.com →</a>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Unwrap double-wrapped demo_activity if present
  const demo = data.demo?.demo_activity ?? data.demo ?? {}

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 flex-shrink-0">
        <div className="px-6 py-3.5 flex items-center gap-3">
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

      {/* Welcome: full cream page */}
      {step === 0 && (
        <WelcomeStep data={data} onNext={() => setStep(1)} />
      )}

      {/* CTA: centered */}
      {step === 4 && (
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          <CTAStep data={data} />
        </main>
      )}

      {/* Steps 1–3: Flint app shell with lived-in sidebar */}
      {step >= 1 && step <= 3 && (
        <div className="flex flex-1 overflow-hidden">
          <DemoSidebar data={data} demo={demo} />
          <main className="flex-1 overflow-auto px-6 py-8">
            {step === 1 && <ActivityStep key="activity" data={data} onNext={() => setStep(2)} />}
            {step === 2 && <SessionStep key="session" data={data} onNext={() => setStep(3)} />}
            {step === 3 && <AnalyticsStep key="analytics" data={data} onNext={() => setStep(4)} />}
          </main>
        </div>
      )}
    </div>
  )
}
