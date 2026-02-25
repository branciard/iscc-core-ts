import { useState, useCallback } from 'react'
import { Code, iscc_clean } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

export default function CodeInspector() {
  const [input, setInput] = useState('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  const [fields, setFields] = useState<Array<{ label: string; value: string }>>([])
  const [error, setError] = useState('')

  const inspect = useCallback(() => {
    setError('')
    try {
      const cleaned = iscc_clean(input)
      const code = new Code(cleaned)
      
      const hashHex = Array.from(code.hashBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      setFields([
        { label: 'Code', value: code.code },
        { label: 'URI', value: code.uri },
        { label: 'Type ID', value: code.typeId },
        { label: 'Main Type', value: String(code.maintype) },
        { label: 'SubType', value: String(code.subtype) },
        { label: 'Version', value: String(code.version) },
        { label: 'Hash Bits', value: String(code.hashBits) },
        { label: 'Hash Bytes (hex)', value: hashHex },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setFields([])
    }
  }, [input])

  return (
    <div id="inspector" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--deep-navy)' }} />
        <h2>Code Inspector</h2>
      </div>
      <p className="section-desc">
        Parse and inspect any ISCC code using the <code>Code</code> class.
        Shows the decoded header fields, type information, and raw hash bytes.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>ISCC Code</label>
          <input className="form-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ISCC:..." />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={inspect}>
            Inspect
          </button>
        </div>
      </div>

      <ResultDisplay
        error={error}
        fields={fields}
      />
    </div>
  )
}
