import { useState, useCallback } from 'react'
import { gen_instance_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

export default function InstanceCode() {
  const [data, setData] = useState('Hello World! This is sample data for the ISCC Instance-Code.')
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const buf = Buffer.from(data, 'utf-8')
      const res = await gen_instance_code(buf, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [data, bits])

  return (
    <div id="instance" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-instance)' }} />
        <h2>Instance-Code</h2>
      </div>
      <p className="section-desc">
        Generates a cryptographic hash (BLAKE3) for exact binary content identification.
        Also provides a datahash (multihash) and filesize.
      </p>

      <div className="form-group">
        <label>Data (text will be UTF-8 encoded)</label>
        <textarea className="form-textarea" value={data} onChange={(e) => setData(e.target.value)} rows={4} placeholder="Enter data..." />
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
            Generate Instance-Code
          </button>
        </div>
      </div>

      <ResultDisplay
        loading={loading}
        error={error}
        iscc={result?.iscc as string | undefined}
        fields={result ? [
          ...(result.datahash ? [{ label: 'Data Hash', value: result.datahash as string }] : []),
          ...(result.filesize !== undefined ? [{ label: 'File Size', value: `${result.filesize} bytes` }] : []),
        ] : undefined}
        raw={result}
      />
    </div>
  )
}
