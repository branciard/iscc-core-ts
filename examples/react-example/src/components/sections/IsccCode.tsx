import { useState, useCallback } from 'react'
import { gen_iscc_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

const SAMPLE_CODES = [
  'ISCC:AAAWN3GVSSQLNPE4',
  'ISCC:EAASKDNZNYGUUF5A',
  'ISCC:GAAW2PRCRS5LNVZK',
  'ISCC:IAAW7EDERHK3SFHH',
].join('\n')

export default function IsccCode() {
  const [codesStr, setCodesStr] = useState(SAMPLE_CODES)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const codes = codesStr.split('\n').map((s) => s.trim()).filter(Boolean)
      if (codes.length < 2) {
        setError('Enter at least 2 ISCC units (one per line)')
        return
      }
      const res = gen_iscc_code(codes)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    }
  }, [codesStr])

  return (
    <div id="iscc-code" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-iscc-code)' }} />
        <h2>ISCC-CODE</h2>
      </div>
      <p className="section-desc">
        Combines multiple ISCC-UNITs (Meta, Content, Data, Instance) into a single composite ISCC-CODE
        with a common header. This is the full ISCC identifier for a digital asset.
      </p>

      <div className="form-group">
        <label>ISCC Units (one per line: Meta, Content, Data, Instance)</label>
        <textarea className="form-textarea" value={codesStr} onChange={(e) => setCodesStr(e.target.value)} rows={5} placeholder="ISCC:AAAW...&#10;ISCC:EAAS...&#10;ISCC:GAAW...&#10;ISCC:IAAW..." />
      </div>
      <div className="form-group">
        <button className="btn btn-primary" onClick={generate}>
          Generate ISCC-CODE
        </button>
      </div>

      <ResultDisplay
        error={error}
        iscc={result?.iscc as string | undefined}
        raw={result}
      />
    </div>
  )
}
