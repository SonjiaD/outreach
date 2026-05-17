import { useState } from 'react'
import USMap from './components/USMap'
import DrilldownPanel from './components/DrilldownPanel'
import DiscoveryPanel from './components/DiscoveryPanel'
import EmailOutput from './components/EmailOutput'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Steps: map → drilldown → discovering → people → generating → email
const STEPS = ['map', 'drilldown', 'discovering', 'people', 'generating', 'email']

const STEP_LABELS = {
  map: 'Select State',
  drilldown: 'Choose Focus',
  discovering: 'Discovering',
  people: 'Choose Contact',
  generating: 'Generating',
  email: 'Review Outreach',
}

function ProgressBar({ step }) {
  const idx = STEPS.indexOf(step)
  const visibleSteps = ['map', 'drilldown', 'people', 'email']
  return (
    <div className="flex items-center gap-1.5">
      {visibleSteps.map((s, i) => {
        const stepIdx = STEPS.indexOf(s)
        const isActive = stepIdx <= idx
        const isCurrent = s === step || (step === 'discovering' && s === 'drilldown') || (step === 'generating' && s === 'people')
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${isActive ? 'bg-orange-600' : 'bg-gray-200'}`} />
            {i < visibleSteps.length - 1 && <div className="h-px w-2 bg-gray-200" />}
          </div>
        )
      })}
      <span className="ml-2 text-xs text-gray-400">{STEP_LABELS[step] || ''}</span>
    </div>
  )
}

function DiscoveringLoader({ state, city }) {
  const [phase, setPhase] = useState(0)

  useState(() => {
    const t1 = setTimeout(() => setPhase(1), 2000)
    const t2 = setTimeout(() => setPhase(2), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  })

  const scope = city ? `${city}, ${state}` : state

  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-6">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-900">Discovering targets in {scope}...</p>
        <div className="space-y-1.5 text-xs text-gray-500">
          <p className={`transition-opacity duration-500 flex items-center justify-center gap-2 ${phase >= 0 ? 'opacity-100' : 'opacity-0'}`}>
            {phase >= 1 ? <span className="text-green-500">✓</span> : <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />}
            Searching for EdTech conferences in {scope}
          </p>
          <p className={`transition-opacity duration-500 flex items-center justify-center gap-2 ${phase >= 1 ? 'opacity-100' : 'opacity-30'}`}>
            {phase >= 2 ? <span className="text-green-500">✓</span> : <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />}
            Finding district administrators
          </p>
          <p className={`transition-opacity duration-500 flex items-center justify-center gap-2 ${phase >= 2 ? 'opacity-100' : 'opacity-30'}`}>
            {phase >= 2 ? <span className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin inline-block" /> : '·'}
            Identifying key decision-makers
          </p>
        </div>
      </div>
    </div>
  )
}

function GeneratingLoader({ person }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">Crafting outreach for {person.name}</p>
        <p className="text-xs text-gray-500 mt-1">{person.district}</p>
        <p className="text-xs text-gray-400 mt-3">Generating personalized email and demo activity...</p>
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState('map')
  const [selectedState, setSelectedState] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [discoveryResult, setDiscoveryResult] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [emailResult, setEmailResult] = useState(null)
  const [error, setError] = useState(null)

  const handleStateSelect = (stateName) => {
    setSelectedState(stateName)
    setStep('drilldown')
    setError(null)
  }

  const handleDiscover = async (city) => {
    setSelectedCity(city)
    setStep('discovering')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: selectedState, city: city || undefined }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Discovery failed')
      }
      const data = await res.json()
      setDiscoveryResult(data)
      setStep('people')
    } catch (e) {
      setError(e.message)
      setStep('drilldown')
    }
  }

  const handleSelectPerson = async (person) => {
    setSelectedPerson(person)
    setStep('generating')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/generate-for-person`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Generation failed')
      }
      const data = await res.json()
      setEmailResult(data)
      setStep('email')
    } catch (e) {
      setError(e.message)
      setStep('people')
    }
  }

  const handleReset = () => {
    setStep('map')
    setSelectedState(null)
    setSelectedCity(null)
    setDiscoveryResult(null)
    setSelectedPerson(null)
    setEmailResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={handleReset} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">FlintReach</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400 text-sm">Agentic GTM for Flint K-12</span>
            </div>
          </button>
          <div className="ml-auto flex items-center gap-4">
            <ProgressBar step={step} />
            <a
              href="https://flintk12.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              flintk12.com ↗
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error.includes('Rate limit') || error.includes('RESOURCE_EXHAUSTED')
              ? 'Rate limit hit — please wait a minute and try again.'
              : error}
          </div>
        )}

        {/* Step: map */}
        {step === 'map' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Where do you want to do outreach?</h1>
              <p className="text-sm text-gray-500 mt-1">
                Click a state to find conferences and administrators to target.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <USMap selectedState={selectedState} onSelect={handleStateSelect} />
            </div>
          </div>
        )}

        {/* Step: drilldown */}
        {step === 'drilldown' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('map')}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back to map
              </button>
            </div>
            <div className="flex justify-center pt-4">
              <DrilldownPanel
                state={selectedState}
                onDiscover={handleDiscover}
                loading={false}
              />
            </div>
          </div>
        )}

        {/* Step: discovering */}
        {step === 'discovering' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10">
            <DiscoveringLoader state={selectedState} city={selectedCity} />
          </div>
        )}

        {/* Step: people */}
        {step === 'people' && discoveryResult && (
          <DiscoveryPanel
            state={selectedState}
            city={selectedCity}
            result={discoveryResult}
            onSelectPerson={handleSelectPerson}
            generatingFor={null}
          />
        )}

        {/* Step: generating */}
        {step === 'generating' && selectedPerson && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10">
            <GeneratingLoader person={selectedPerson} />
          </div>
        )}

        {/* Step: email */}
        {step === 'email' && emailResult && selectedPerson && (
          <EmailOutput
            result={emailResult}
            person={selectedPerson}
            onBack={() => setStep('people')}
          />
        )}
      </main>
    </div>
  )
}
