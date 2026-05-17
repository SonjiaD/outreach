import { useState } from 'react'

const EXAMPLES = [
  {
    district: 'Chicago Public Schools',
    contact_name: 'Pedro Martinez',
    contact_title: 'CEO',
  },
  {
    district: 'Los Angeles Unified School District',
    contact_name: 'Alberto Carvalho',
    contact_title: 'Superintendent',
  },
  {
    district: 'Wake County Public Schools',
    contact_name: 'Robert Taylor',
    contact_title: 'Superintendent',
  },
]

export default function InputForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ district: '', contact_name: '', contact_title: '' })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.district || !form.contact_name || !form.contact_title) return
    onSubmit(form)
  }

  const fillExample = (ex) => {
    if (!loading) setForm(ex)
  }

  const isReady = form.district && form.contact_name && form.contact_title

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">Generate Outreach Package</h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          The agent researches the district, then generates a personalized email,
          compliance one-pager, and demo activity — tailored to that administrator.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            District Name
          </label>
          <input
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="e.g. Chicago Public Schools"
            disabled={loading}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Contact Name
          </label>
          <input
            name="contact_name"
            value={form.contact_name}
            onChange={handleChange}
            placeholder="e.g. Pedro Martinez"
            disabled={loading}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Contact Title
          </label>
          <input
            name="contact_title"
            value={form.contact_title}
            onChange={handleChange}
            placeholder="e.g. Superintendent, CEO, Asst. Superintendent"
            disabled={loading}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isReady}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Package'
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2.5">
          Try an example
        </p>
        <div className="space-y-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.district}
              onClick={() => fillExample(ex)}
              disabled={loading}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 border border-gray-100 hover:border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors group"
            >
              <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                {ex.contact_name}
              </span>
              <span className="text-gray-400 text-xs"> · {ex.contact_title}</span>
              <br />
              <span className="text-gray-500 text-xs">{ex.district}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Phase 1 — Google Search grounding researches the district.{' '}
          Phase 2 — Gemini generates the package. Takes ~30s.
        </p>
      </div>
    </div>
  )
}
