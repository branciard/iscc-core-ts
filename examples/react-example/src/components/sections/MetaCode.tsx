import { useState, useCallback } from 'react'
import { gen_meta_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

export default function MetaCode() {
  const [title, setTitle] = useState('ISCC Demo Document')
  const [description, setDescription] = useState('A sample document for testing the ISCC Meta-Code generation.')
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const res = await gen_meta_code(title, description || undefined, undefined, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [title, description, bits])

  return (
    <div id="meta" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-meta)' }} />
        <h2>Meta-Code</h2>
      </div>
      <p className="section-desc">
        Generates a similarity-preserving hash from metadata (title, description). 
        Useful for identifying content by its descriptive metadata.
      </p>

      <div className="form-group">
        <label>Title</label>
        <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." />
      </div>
      <div className="form-group">
        <label>Description (optional)</label>
        <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Enter description..." />
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
          <button className="btn btn-primary" onClick={generate} disabled={!title || loading}>
            Generate Meta-Code
          </button>
        </div>
      </div>

      <ResultDisplay
        loading={loading}
        error={error}
        iscc={result?.iscc as string | undefined}
        fields={result ? [
          { label: 'Name', value: result.name as string },
          ...(result.description ? [{ label: 'Description', value: result.description as string }] : []),
          ...(result.metahash ? [{ label: 'Meta Hash', value: result.metahash as string }] : []),
        ] : undefined}
        raw={result}
      />
    </div>
  )
}
