import { useState, useCallback } from 'react'
import { gen_mixed_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

const SAMPLE_CODES = [
  'ISCC:EAASKDNZNYGUUF5A',
  'ISCC:EAAS2QPBFTG7HLUQ',
].join('\n')

export default function MixedCode() {
  const [codesStr, setCodesStr] = useState(SAMPLE_CODES)
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const codes = codesStr.split('\n').map((s) => s.trim()).filter(Boolean)
      if (codes.length < 2) {
        setError('Enter at least 2 ISCC Content-Codes (one per line)')
        return
      }
      const res = gen_mixed_code(codes, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    }
  }, [codesStr, bits])

  return (
    <div id="mixed" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-content)' }} />
        <h2>Content-Code Mixed</h2>
      </div>
      <p className="section-desc">
        Combines multiple Content-Codes into a single Mixed-Code using SimHash.
        Useful when content has multiple media types (e.g., text + images).
      </p>

      <div className="form-group">
        <label>ISCC Content-Codes (one per line)</label>
        <textarea className="form-textarea" value={codesStr} onChange={(e) => setCodesStr(e.target.value)} rows={4} placeholder="ISCC:EAAS..." />
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
          <button className="btn btn-primary" onClick={generate}>
            Generate Mixed-Code
          </button>
        </div>
      </div>

      <ResultDisplay error={error} iscc={result?.iscc as string | undefined} raw={result} />
    </div>
  )
}
