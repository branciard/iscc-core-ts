import { useState, useCallback } from 'react'
import {
  iscc_explain,
  iscc_validate,
  iscc_similarity,
  iscc_distance,
  iscc_decompose,
  encode_base32,
  decode_base32,
} from 'iscc-core-ts'

export default function CodecUtils() {
  // Explain
  const [explainInput, setExplainInput] = useState('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  const [explainResult, setExplainResult] = useState('')
  const [explainError, setExplainError] = useState('')

  const doExplain = useCallback(() => {
    setExplainError('')
    try {
      const res = iscc_explain(explainInput)
      setExplainResult(res)
    } catch (e) {
      setExplainError(e instanceof Error ? e.message : String(e))
      setExplainResult('')
    }
  }, [explainInput])

  // Validate
  const [validateInput, setValidateInput] = useState('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  const [validateResult, setValidateResult] = useState<boolean | null>(null)
  const [validateError, setValidateError] = useState('')

  const doValidate = useCallback(() => {
    setValidateError('')
    try {
      const res = iscc_validate(validateInput)
      setValidateResult(res)
    } catch (e) {
      setValidateError(e instanceof Error ? e.message : String(e))
      setValidateResult(null)
    }
  }, [validateInput])

  // Similarity
  const [simA, setSimA] = useState('ISCC:EAAWVMZ5AQ2IOA43')
  const [simB, setSimB] = useState('ISCC:EAAXNOS5MCRYKEPL')
  const [simResult, setSimResult] = useState<{ similarity: number; distance: number } | null>(null)
  const [simError, setSimError] = useState('')

  const doSimilarity = useCallback(() => {
    setSimError('')
    try {
      const similarity = iscc_similarity(simA, simB)
      const distance = iscc_distance(simA, simB)
      setSimResult({ similarity, distance })
    } catch (e) {
      setSimError(e instanceof Error ? e.message : String(e))
      setSimResult(null)
    }
  }, [simA, simB])

  // Base32
  const [hexInput, setHexInput] = useState('cc01f6728a8fa89e')
  const [b32Result, setB32Result] = useState('')
  const [b32Error, setB32Error] = useState('')

  const doEncode = useCallback(() => {
    setB32Error('')
    try {
      setB32Result(encode_base32(hexInput))
    } catch (e) {
      setB32Error(e instanceof Error ? e.message : String(e))
    }
  }, [hexInput])

  const [b32Input, setB32Input] = useState('ZQA7M4UKR6UJ4')
  const [hexResult, setHexResult] = useState('')
  const [hexError, setHexError] = useState('')

  const doDecode = useCallback(() => {
    setHexError('')
    try {
      const bytes = decode_base32(b32Input)
      setHexResult(Buffer.from(bytes).toString('hex'))
    } catch (e) {
      setHexError(e instanceof Error ? e.message : String(e))
    }
  }, [b32Input])

  // Decompose
  const [decompInput, setDecompInput] = useState('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  const [decompResult, setDecompResult] = useState<string[]>([])
  const [decompError, setDecompError] = useState('')

  const doDecompose = useCallback(() => {
    setDecompError('')
    try {
      const res = iscc_decompose(decompInput)
      setDecompResult(res)
    } catch (e) {
      setDecompError(e instanceof Error ? e.message : String(e))
      setDecompResult([])
    }
  }, [decompInput])

  return (
    <div id="codec" className="section">
      <div className="section-header">
        <span className="section-dot" style={{ background: 'var(--medium-gray)' }} />
        <h2>Codec Utilities</h2>
      </div>
      <p className="section-desc">
        Low-level codec functions for explaining, validating, comparing, encoding/decoding, and decomposing ISCC codes.
      </p>

      {/* Explain */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>iscc_explain</h3>
      <div className="form-row">
        <div className="form-group">
          <input className="form-input" value={explainInput} onChange={(e) => setExplainInput(e.target.value)} placeholder="ISCC:..." />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={doExplain}>Explain</button>
        </div>
      </div>
      {explainError && <div className="error-msg">{explainError}</div>}
      {explainResult && (
        <div className="result-box">
          <div className="iscc-display">{explainResult}</div>
        </div>
      )}

      {/* Validate */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>iscc_validate</h3>
      <div className="form-row">
        <div className="form-group">
          <input className="form-input" value={validateInput} onChange={(e) => setValidateInput(e.target.value)} placeholder="ISCC:..." />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={doValidate}>Validate</button>
        </div>
      </div>
      {validateError && <div className="error-msg">{validateError}</div>}
      {validateResult !== null && (
        <div className="result-box">
          <div className="result-row">
            <span className="result-key">Valid</span>
            <span className="result-value" style={{ color: validateResult ? 'var(--lime-green)' : 'var(--coral-red)' }}>
              {validateResult ? '✓ Valid' : '✗ Invalid'}
            </span>
          </div>
        </div>
      )}

      {/* Similarity / Distance */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>iscc_similarity / iscc_distance</h3>
      <div className="form-group">
        <label>ISCC Code A</label>
        <input className="form-input" value={simA} onChange={(e) => setSimA(e.target.value)} />
      </div>
      <div className="form-group">
        <label>ISCC Code B</label>
        <input className="form-input" value={simB} onChange={(e) => setSimB(e.target.value)} />
      </div>
      <div className="form-group">
        <button className="btn btn-primary" onClick={doSimilarity}>Compare</button>
      </div>
      {simError && <div className="error-msg">{simError}</div>}
      {simResult && (
        <div className="result-box">
          <div className="result-row">
            <span className="result-key">Similarity</span>
            <span className="result-value">{simResult.similarity}%</span>
          </div>
          <div className="result-row">
            <span className="result-key">Hamming Distance</span>
            <span className="result-value">{simResult.distance}</span>
          </div>
        </div>
      )}

      {/* Base32 Encode */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>encode_base32 / decode_base32</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Hex → Base32</label>
          <input className="form-input" value={hexInput} onChange={(e) => setHexInput(e.target.value)} placeholder="hex..." />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={doEncode}>Encode</button>
        </div>
      </div>
      {b32Error && <div className="error-msg">{b32Error}</div>}
      {b32Result && (
        <div className="result-box"><div className="iscc-display">{b32Result}</div></div>
      )}

      <div className="form-row" style={{ marginTop: '0.75rem' }}>
        <div className="form-group">
          <label>Base32 → Hex</label>
          <input className="form-input" value={b32Input} onChange={(e) => setB32Input(e.target.value)} placeholder="base32..." />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={doDecode}>Decode</button>
        </div>
      </div>
      {hexError && <div className="error-msg">{hexError}</div>}
      {hexResult && (
        <div className="result-box"><div className="iscc-display">{hexResult}</div></div>
      )}

      {/* Decompose */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>iscc_decompose</h3>
      <div className="form-row">
        <div className="form-group">
          <input className="form-input" value={decompInput} onChange={(e) => setDecompInput(e.target.value)} placeholder="ISCC:..." />
        </div>
        <div className="form-group">
          <button className="btn btn-primary" onClick={doDecompose}>Decompose</button>
        </div>
      </div>
      {decompError && <div className="error-msg">{decompError}</div>}
      {decompResult.length > 0 && (
        <div className="result-box">
          {decompResult.map((unit, i) => (
            <div key={i} className="iscc-display" style={{ borderTop: i > 0 ? '1px solid var(--light-gray)' : 'none' }}>
              {unit}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
