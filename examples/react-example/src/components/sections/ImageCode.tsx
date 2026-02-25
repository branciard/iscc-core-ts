import { useState, useCallback } from 'react'
import { gen_image_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

// Sample 1024 grayscale pixel values (32x32 gradient pattern)
const SAMPLE_PIXELS = Array.from({ length: 1024 }, (_, i) => {
  const x = i % 32
  const y = Math.floor(i / 32)
  return Math.round((x + y) * (255 / 62))
})

export default function ImageCode() {
  const [pixelsStr, setPixelsStr] = useState(SAMPLE_PIXELS.join(', '))
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const pixels = pixelsStr.split(',').map((s) => Number(s.trim()))
      if (pixels.length !== 1024) {
        setError(`Expected 1024 pixel values, got ${pixels.length}`)
        return
      }
      const res = gen_image_code(pixels, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    }
  }, [pixelsStr, bits])

  return (
    <div id="image" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-content)' }} />
        <h2>Content-Code Image</h2>
      </div>
      <p className="section-desc">
        Generates a perceptual hash from 1024 normalized grayscale pixel values (32×32) using DCT.
        Visually similar images produce similar codes.
      </p>

      <div className="form-group">
        <label>Pixel Values (1024 comma-separated grayscale values, 0–255)</label>
        <textarea className="form-textarea" value={pixelsStr} onChange={(e) => setPixelsStr(e.target.value)} rows={4} />
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
            Generate Image-Code
          </button>
        </div>
      </div>

      <ResultDisplay error={error} iscc={result?.iscc as string | undefined} raw={result} />
    </div>
  )
}
