interface ResultField {
  label: string
  value: string | number | boolean
}

interface Props {
  iscc?: string
  fields?: ResultField[]
  raw?: unknown
  error?: string
  loading?: boolean
}

export default function ResultDisplay({ iscc, fields, raw, error, loading }: Props) {
  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />
        Computing...
      </div>
    )
  }

  if (error) {
    return <div className="error-msg">{error}</div>
  }

  if (!iscc && !fields && !raw) return null

  return (
    <div className="result-box">
      {iscc && (
        <>
          <div className="result-label">ISCC Code</div>
          <div className="iscc-display">{iscc}</div>
        </>
      )}
      {fields && fields.length > 0 && (
        <div>
          {fields.map((f) => (
            <div key={f.label} className="result-row">
              <span className="result-key">{f.label}</span>
              <span className="result-value">{String(f.value)}</span>
            </div>
          ))}
        </div>
      )}
      {raw != null && (
        <details className="json-toggle">
          <summary>Raw JSON Output</summary>
          <pre className="json-pre">{JSON.stringify(raw, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}
