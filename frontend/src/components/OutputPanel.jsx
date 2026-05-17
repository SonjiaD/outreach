import { useState } from 'react'

const TABS = ['Email', 'One-Pager', 'Demo Activity']

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function ResearchBadges({ research }) {
  if (!research) return null
  const enrollment = research.enrollment
  const displayEnrollment =
    typeof enrollment === 'number'
      ? enrollment.toLocaleString()
      : enrollment && enrollment !== 'unknown'
      ? enrollment
      : null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {displayEnrollment && (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {displayEnrollment} students
        </span>
      )}
      {research.title_one_status && (
        <span className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">
          Title I
        </span>
      )}
      {research.ell_percentage && research.ell_percentage !== 'unknown' && (
        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full">
          {research.ell_percentage} ELL
        </span>
      )}
      {research.ai_policy_status && research.ai_policy_status !== 'unknown' && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${
            research.ai_policy_status === 'supportive'
              ? 'bg-green-50 text-green-700 border-green-100'
              : research.ai_policy_status === 'ban'
              ? 'bg-red-50 text-red-700 border-red-100'
              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
          }`}
        >
          AI policy: {research.ai_policy_status}
        </span>
      )}
      {research.state_privacy_law && research.state_privacy_law !== 'FERPA' && (
        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
          {research.state_privacy_law}
        </span>
      )}
    </div>
  )
}

function EmailTab({ result }) {
  const emailText = `Subject: ${result.email_subject}\n\n${result.email_body}`
  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Subject Line
          </span>
          <CopyButton text={result.email_subject} />
        </div>
        <p className="text-sm font-semibold text-gray-900">{result.email_subject}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Email Body
          </span>
          <CopyButton text={emailText} />
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {result.email_body}
        </p>
      </div>
    </div>
  )
}

function OnePagerTab({ result }) {
  const op = result.one_pager_bullets
  if (!op) return <p className="text-sm text-gray-400">No one-pager data available.</p>

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          What Flint Is
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{op.what_flint_is}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Student Data Privacy
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{op.student_data_privacy}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Compliance Credentials
        </p>
        <ul className="space-y-1.5">
          {(op.compliance_credentials || []).map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 flex-shrink-0 mt-px">✓</span>
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Proof Point
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{op.comparable_proof_point}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Pricing
        </p>
        <p className="text-sm text-gray-700">{op.pricing}</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          Next Step
        </p>
        <p className="text-sm text-blue-800 font-medium">{op.next_step}</p>
      </div>
    </div>
  )
}

function DemoActivityTab({ result }) {
  const demo = result.demo_activity
  if (!demo) return <p className="text-sm text-gray-400">No demo activity data available.</p>

  return (
    <div className="space-y-4">
      <div className="bg-blue-600 rounded-xl p-4 text-white">
        <h3 className="font-semibold text-base leading-snug">{demo.title}</h3>
        <div className="flex items-center gap-2 mt-1.5 text-blue-200 text-xs">
          <span>{demo.grade_level}</span>
          <span>·</span>
          <span>{demo.subject}</span>
        </div>
        {demo.context && (
          <p className="text-blue-100 text-xs mt-2 leading-relaxed">{demo.context}</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Teacher Setup Prompt
        </p>
        <div className="bg-gray-50 border-l-2 border-blue-400 rounded-r-lg px-4 py-3 text-sm text-gray-600 italic leading-relaxed">
          {demo.teacher_setup_prompt}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Student Interaction Preview
        </p>
        <div className="space-y-2.5">
          {(demo.student_interaction || []).map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.speaker === 'Flint' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.speaker === 'Flint'
                    ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                    : 'bg-blue-600 text-white rounded-tr-sm'
                }`}
              >
                {msg.speaker === 'Flint' && (
                  <span className="text-[11px] font-semibold text-blue-500 block mb-1">
                    Flint ✦
                  </span>
                )}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Teacher Dashboard Insight
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {demo.teacher_dashboard_insight}
        </p>
      </div>
    </div>
  )
}

export default function OutputPanel({ result, loading, error, district }) {
  const [activeTab, setActiveTab] = useState('Email')

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[480px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-700">
          {district ? `Researching ${district}...` : 'Researching district...'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Phase 1: Google Search · Phase 2: Generating package
        </p>
        <p className="text-xs text-gray-300 mt-1">Takes ~30 seconds</p>
      </div>
    )
  }

  if (error) {
    const isRateLimit = error.includes('rate limit') || error.includes('RESOURCE_EXHAUSTED') || error.includes('429')
    return (
      <div className="bg-white rounded-xl border border-red-100 flex flex-col items-center justify-center min-h-[480px] px-8">
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-3">
          <span className="text-red-500 text-lg">!</span>
        </div>
        <p className="text-sm font-medium text-red-600 mb-1">
          {isRateLimit ? 'Rate limit hit' : 'Generation failed'}
        </p>
        <p className="text-xs text-gray-400 text-center max-w-sm">
          {isRateLimit
            ? 'Gemini free tier limit reached. The agent will retry automatically — or wait a minute and try again.'
            : error}
        </p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[480px] px-8">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3L17 7V13L10 17L3 13V7L10 3Z"
              fill="#2563EB"
              fillOpacity="0.2"
              stroke="#2563EB"
              strokeWidth="1.5"
            />
            <circle cx="10" cy="10" r="2" fill="#2563EB" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          Your outreach package will appear here
        </p>
        <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
          Personalized email, state-compliant one-pager, and a demo Flint activity —
          tailored to the district's demographics and administrator's background.
        </p>
      </div>
    )
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'Email':
        return <EmailTab result={result} />
      case 'One-Pager':
        return <OnePagerTab result={result} />
      case 'Demo Activity':
        return <DemoActivityTab result={result} />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {result.research?.district_name || district}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {result.research?.state}
              {result.research?.num_schools && result.research.num_schools !== 'unknown'
                ? ` · ${result.research.num_schools} schools`
                : ''}
            </p>
          </div>
        </div>
        <ResearchBadges research={result.research} />
        {result.research?.best_flint_angle && (
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Best angle: </span>
              {result.research.best_flint_angle}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  )
}
