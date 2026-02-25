import { useState, useCallback } from 'react'
import { gen_data_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

export default function DataCode() {
  const [data, setData] = useState('Hello World! This is sample data for the ISCC Data-Code generation. The Data-Code uses Content-Defined Chunking and MinHash for similarity hashing of binary data streams.')
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const buf = Buffer.from(data, 'utf-8')
      const res = await gen_data_code(buf, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [data, bits])

  return (
    <div id="data" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-data)' }} />
        <h2>Data-Code</h2>
      </div>
      <p className="section-desc">
        Generates a similarity hash from binary data using Content-Defined Chunking (CDC) and MinHash.
        Identifies similar binary data streams regardless of format.
      </p>

      <div className="form-group">
        <label>Data (text will be UTF-8 encoded)</label>
        <textarea className="form-textarea" value={data} onChange={(e) => setData(e.target.value)} rows={5} placeholder="Enter data..." />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Bits</label>
          <select className="form-select" value={bits} onChange={(e) => setBits(Number(e.target.value))}>
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
          </select>
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={generate} disabled={!data || loading}>
            Generate Data-Code
          </button>
        </div>
      </div>

      <ResultDisplay
        loading={loading}
        error={error}
        iscc={result?.iscc as string | undefined}
        raw={result}
      />
    </div>
  )
}
