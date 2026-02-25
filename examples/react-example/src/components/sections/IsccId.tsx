import { useState, useCallback } from 'react'
import { gen_iscc_id } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

export default function IsccId() {
  const [hubId, setHubId] = useState(42)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const res = gen_iscc_id(hubId)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    }
  }, [hubId])

  return (
    <div id="iscc-id" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-iscc-id)' }} />
        <h2>ISCC-ID</h2>
      </div>
      <p className="section-desc">
        Generates a globally unique, owned identifier based on a timestamp and HUB-ID.
        The 52-bit UTC timestamp + 12-bit HUB-ID ensures uniqueness across distributed systems.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>HUB ID (0–4095)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            max={4095}
            value={hubId}
            onChange={(e) => setHubId(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={generate}>
            Generate ISCC-ID
          </button>
        </div>
      </div>

      <ResultDisplay
        error={error}
        iscc={result?.iscc as string | undefined}
        raw={result}
      />
    </div>
  )
}
