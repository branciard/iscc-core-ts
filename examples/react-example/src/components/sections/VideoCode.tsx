import { useState, useCallback } from 'react'
import { gen_video_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

// Sample frame signatures: array of 380-element arrays (each frame = 380 features)
// Using a small set of 5 synthetic frames
function makeSampleFrames(): number[][] {
  const frames: number[][] = []
  for (let f = 0; f < 5; f++) {
    const frame: number[] = []
    for (let i = 0; i < 380; i++) {
      frame.push(((f * 380 + i) * 17 + 42) % 256)
    }
    frames.push(frame)
  }
  return frames
}

const SAMPLE_FRAMES = makeSampleFrames()

export default function VideoCode() {
  const [framesStr, setFramesStr] = useState(JSON.stringify(SAMPLE_FRAMES))
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const frames: number[][] = JSON.parse(framesStr)
      if (!Array.isArray(frames) || !frames.every(Array.isArray)) {
        setError('Input must be an array of arrays (each frame = array of 380 integers)')
        return
      }
      const res = gen_video_code(frames, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    }
  }, [framesStr, bits])

  return (
    <div id="video" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-content)' }} />
        <h2>Content-Code Video</h2>
      </div>
      <p className="section-desc">
        Generates a similarity hash from video frame signatures. Each frame is an array of 380 feature values.
        Uses WTA (Winner-Take-All) hashing for perceptual video fingerprinting.
      </p>

      <div className="form-group">
        <label>Frame Signatures (JSON array of arrays, each with 380 integer values)</label>
        <textarea className="form-textarea" value={framesStr} onChange={(e) => setFramesStr(e.target.value)} rows={5} />
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
            Generate Video-Code
          </button>
        </div>
      </div>

      <ResultDisplay error={error} iscc={result?.iscc as string | undefined} raw={result} />
    </div>
  )
}
