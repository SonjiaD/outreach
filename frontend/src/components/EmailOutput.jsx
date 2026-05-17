import { useState } from 'react'

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

function buildDemoUrl(person, demoActivity) {
  try {
    const data = {
      name: person.name,
      title: person.title,
      district: person.district,
      city: person.city,
      state: person.state_abbreviation,
      demo: demoActivity,
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    return `${window.location.origin}/demo?d=${encoded}`
  } catch {
    return null
  }
}

export default function EmailOutput({ result, person, onBack }) {
  const { email_subject, email_body, demo_activity } = result
  const demoUrl = demo_activity ? buildDemoUrl(person, demo_activity) : null

  const fullEmail = `Subject: ${email_subject}\n\n${email_body}`

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          ← Back to people
        </button>
        <span className="text-gray-200">|</span>
        <span className="text-xs text-gray-500">
          Outreach for <span className="font-medium text-gray-700">{person.name}</span> · {person.district}
        </span>
      </div>

      {/* Email */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
          <CopyButton text={fullEmail} label="Copy all" />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Subject</p>
              <p className="text-sm font-medium text-gray-900">{email_subject}</p>
            </div>
            <CopyButton text={email_subject} />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Body</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{email_body}</p>
          </div>
        </div>
      </div>

      {/* Demo link */}
      {demoUrl && (
        <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-orange-100 bg-orange-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M4 1L7 2.75V5.25L4 7L1 5.25V2.75L4 1Z" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-orange-800">Personalized Demo Link</span>
            </div>
            <CopyButton text={demoUrl} label="Copy link" />
          </div>

          <div className="p-5">
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Share this link with <span className="font-medium">{person.name}</span> — it opens a Flint demo built specifically for{' '}
              <span className="font-medium">{person.district}</span>. Include it in the email or send separately.
            </p>

            <div className="bg-gray-50 rounded-lg px-3 py-2.5 flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 truncate flex-1 font-mono">{demoUrl}</span>
            </div>

            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Preview demo page ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
