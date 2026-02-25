import { useState, useCallback } from 'react'
import { gen_flake_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

export default function FlakeCode() {
  const [results, setResults] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const res = gen_flake_code()
      setResults((prev) => [res as Record<string, unknown>, ...prev].slice(0, 10))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  return (
    <div id="flake" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-flake)' }} />
        <h2>Flake-Code</h2>
      </div>
      <p className="section-desc">
        Generates a unique, time-sorted identifier (48-bit timestamp + 16-bit randomness).
        Useful as a database surrogate key. Each click generates a new unique flake.
      </p>

      <div className="form-group">
        <button className="btn btn-primary" onClick={generate}>
          Generate Flake-Code
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {results.map((res, i) => (
        <ResultDisplay
          key={i}
          iscc={res.iscc as string}
          raw={res}
        />
      ))}
    </div>
  )
}
