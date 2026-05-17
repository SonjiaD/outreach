import PersonCard from './PersonCard'

function ConferenceCard({ conf }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5">
      <p className="text-sm font-semibold text-gray-900 leading-snug">{conf.name}</p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        {conf.date_range && (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            {conf.date_range}
          </span>
        )}
        {conf.location && (
          <span className="text-[10px] text-gray-400">{conf.location}</span>
        )}
      </div>
      {conf.description && (
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{conf.description}</p>
      )}
      {conf.relevance && (
        <p className="text-xs text-blue-600 mt-1.5 leading-relaxed">↗ {conf.relevance}</p>
      )}
    </div>
  )
}

function FallbackNotice() {
  return (
    <div className="col-span-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
      <p className="font-medium mb-1">Couldn't verify contacts automatically</p>
      <p className="text-xs text-amber-700 leading-relaxed">
        The agent couldn't find verified administrators for this area. Try a different state or city, or use the original form to enter a specific contact manually.
      </p>
    </div>
  )
}

export default function DiscoveryPanel({ state, city, result, onSelectPerson, generatingFor }) {
  const conferences = result.conferences || []
  const people = result.people || []
  const hasFallback = result.people_fallback

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Targets in {city ? `${city}, ${state}` : state}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {people.length} administrator{people.length !== 1 ? 's' : ''} · {conferences.length} conference{conferences.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {conferences.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Upcoming Conferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conferences.map((conf, i) => (
              <ConferenceCard key={i} conf={conf} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Key Decision-Makers
        </h3>
        {hasFallback ? (
          <FallbackNotice />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((person, i) => (
              <PersonCard
                key={i}
                person={person}
                onSelect={onSelectPerson}
                loading={!!generatingFor}
              />
            ))}
          </div>
        )}
        {generatingFor && (
          <div className="mt-4 text-xs text-blue-600 text-center animate-pulse">
            Generating outreach for {generatingFor}...
          </div>
        )}
      </div>
    </div>
  )
}
