import { useState } from 'react'
import InputForm from './components/InputForm'
import OutputPanel from './components/OutputPanel'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [currentDistrict, setCurrentDistrict] = useState('')

  const handleGenerate = async ({ district, contact_name, contact_title }) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setCurrentDistrict(district)
    try {
      const res = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district, contact_name, contact_title }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Generation failed')
      }
      setResult(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">FlintReach</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-sm">Agentic GTM for Flint K-12</span>
          </div>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          <InputForm onSubmit={handleGenerate} loading={loading} />
          <OutputPanel
            result={result}
            loading={loading}
            error={error}
            district={currentDistrict}
          />
        </div>
      </main>
    </div>
  )
}
