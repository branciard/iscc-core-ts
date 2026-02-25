import { useState, useCallback } from 'react'
import { gen_text_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

export default function TextCode() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog. This is a sample text for demonstrating the ISCC Content-Code Text generation algorithm which uses MinHash for similarity hashing.')
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const res = gen_text_code(text, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    }
  }, [text, bits])

  return (
    <div id="text" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-content)' }} />
        <h2>Content-Code Text</h2>
      </div>
      <p className="section-desc">
        Generates a similarity hash from text content using character-level n-gram shingling and MinHash.
        Similar texts produce similar codes.
      </p>

      <div className="form-group">
        <label>Text Content</label>
        <textarea className="form-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Enter text..." />
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
          <button className="btn btn-primary" onClick={generate} disabled={!text}>
            Generate Text-Code
          </button>
        </div>
      </div>

      <ResultDisplay
        error={error}
        iscc={result?.iscc as string | undefined}
        fields={result ? [
          { label: 'Characters', value: result.characters as number },
        ] : undefined}
        raw={result}
      />
    </div>
  )
}
