const AI_POLICY_COLORS = {
  supportive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-600',
  cautious: 'bg-yellow-100 text-yellow-700',
  ban: 'bg-red-100 text-red-700',
  unknown: 'bg-gray-100 text-gray-500',
}

export default function PersonCard({ person, onSelect, loading }) {
  const aiColor = AI_POLICY_COLORS[person.ai_policy_status] || AI_POLICY_COLORS.unknown

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-sm transition-all flex flex-col gap-3">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{person.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{person.title}</p>
          </div>
          {person.ai_policy_status && person.ai_policy_status !== 'unknown' && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${aiColor}`}>
              AI: {person.ai_policy_status}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1 font-medium">{person.district}</p>
        <p className="text-xs text-gray-400">{person.city}{person.state_abbreviation ? `, ${person.state_abbreviation}` : ''}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {person.enrollment && (
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {Number(person.enrollment).toLocaleString()} students
          </span>
        )}
        {person.title_one && (
          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            Title I
          </span>
        )}
        {person.ell_percentage && (
          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            {person.ell_percentage} ELL
          </span>
        )}
      </div>

      {person.why_target && (
        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2.5">
          {person.why_target}
        </p>
      )}

      <button
        onClick={() => onSelect(person)}
        disabled={loading}
        className="w-full mt-auto bg-orange-600 text-white rounded-lg py-2 text-xs font-medium hover:bg-orange-700 active:bg-orange-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Generate Outreach →
      </button>
    </div>
  )
}
