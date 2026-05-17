import { useState } from 'react'

export default function DrilldownPanel({ state, onDiscover, loading }) {
  const [city, setCity] = useState('')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-orange-600 rounded-full" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Selected</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{state}</h2>
      <p className="text-sm text-gray-500 mb-5">
        Optionally focus on a specific city, or search the entire state.
      </p>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          City <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Chicago, Springfield..."
          disabled={loading}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      <button
        onClick={() => onDiscover(city.trim() || null)}
        disabled={loading}
        className="w-full bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-700 active:bg-orange-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Discovering...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.5"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Find Targets
          </>
        )}
      </button>
    </div>
  )
}
