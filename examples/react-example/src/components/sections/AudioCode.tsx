import { useState, useCallback } from 'react'
import { gen_audio_code } from 'iscc-core-ts'
import ResultDisplay from '../ResultDisplay'

// Sample chromaprint fingerprint (100 signed 32-bit integers)
const SAMPLE_CHROMAPRINT = [
  -1873940496, 1274603252, -1408172048, 1291380596, -1412362384, 1291397108,
  -1395570576, 1291397120, -1395537808, 1283024512, -1462629264, 1282000384,
  -1463677840, 1290376704, -1459499920, 1290376737, -1459499920, 1290376737,
  -1526592400, 1290376737, -1526596496, 1290311201, -1526596400, 1290319393,
  -1526592272, 1290319393, -1526592304, 1290319393, -1526592304, 1290319361,
  -1526592304, 1557757537, -1526592304, 1557757537, -1526592304, 1557757537,
  -1526596400, 1557757537, -1526596400, 1557757537, -459452304, 1557757537,
  -459452304, 1557757537, -459452304, 1557757537, -459460496, 1557757537,
  -459460496, 1557761633, -459460496, 1557761633, -459460512, 1557761633,
  -1533202336, 1557761633, -1533202336, 1557761633, -1533202352, 1557761633,
  -1533202352, 1557761633, -1533206448, 1557761601, -1533206448, 1557761601,
  -459464592, 1557761601, -459464592, 1557757505, -459464480, 1557757505,
  -459464464, 1557757505, -459464464, 1557757505, -459464464, 1557757505,
  -459464464, 1557757537, -459460368, 1557757537, -459460368, 1557757537,
  -459460368, 1557757537, -459460352, 1557757537, -459460352, 1557757537,
  -459460336, 1557757537, -459460336, 1557757537, -459460336, 1557757537,
  -1533202288, 1557757537, -1533202288, 1557757537,
]

export default function AudioCode() {
  const [fpStr, setFpStr] = useState(SAMPLE_CHROMAPRINT.join(', '))
  const [bits, setBits] = useState(64)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const fingerprint = fpStr.split(',').map((s) => Number(s.trim()))
      const res = gen_audio_code(fingerprint, bits)
      setResult(res as Record<string, unknown>)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setResult(null)
    }
  }, [fpStr, bits])

  return (
    <div id="audio" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--color-content)' }} />
        <h2>Content-Code Audio</h2>
      </div>
      <p className="section-desc">
        Generates a similarity hash from a Chromaprint audio fingerprint (array of signed 32-bit integers).
        Use <code>fpcalc -raw -json -signed -length 0</code> to extract fingerprints.
      </p>

      <div className="form-group">
        <label>Chromaprint Fingerprint (comma-separated signed 32-bit integers)</label>
        <textarea className="form-textarea" value={fpStr} onChange={(e) => setFpStr(e.target.value)} rows={5} />
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
            Generate Audio-Code
          </button>
        </div>
      </div>

      <ResultDisplay error={error} iscc={result?.iscc as string | undefined} raw={result} />
    </div>
  )
}
