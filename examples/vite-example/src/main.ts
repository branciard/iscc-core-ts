import './style.css'
import {
  gen_meta_code,
  gen_text_code,
  gen_image_code,
  gen_audio_code,
  gen_video_code,
  gen_mixed_code,
  gen_data_code,
  gen_instance_code,
  gen_iscc_code,
  gen_flake_code,
  gen_iscc_id,
  iscc_explain,
  iscc_validate,
  iscc_similarity,
  iscc_distance,
  iscc_decompose,
  iscc_clean,
  encode_base32,
  decode_base32,
  Code,
} from 'iscc-core-ts'

// ─── Sample Data ────────────────────────────────────────────────────────────────

/** Sample 1024 grayscale pixel values (32×32 gradient pattern) */
const SAMPLE_PIXELS = Array.from({ length: 1024 }, (_, i) => {
  const x = i % 32
  const y = Math.floor(i / 32)
  return Math.round((x + y) * (255 / 62))
})

/** Sample chromaprint fingerprint (100 signed 32-bit integers) */
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

/** Generate 5 synthetic video frames of 380 elements each */
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

// ─── Helpers ────────────────────────────────────────────────────────────────────

interface ResultField {
  label: string
  value: string | number | boolean
}

/** Render a result box with ISCC code, field rows, and raw JSON toggle */
function renderResult(iscc: string | undefined, fields: ResultField[] | undefined, raw: unknown): string {
  let html = '<div class="result-box">'

  if (iscc) {
    html += '<div class="result-label">ISCC Code</div>'
    html += `<div class="iscc-display">${escapeHtml(iscc)}</div>`
  }

  if (fields && fields.length > 0) {
    html += '<div>'
    for (const f of fields) {
      html += `<div class="result-row">
        <span class="result-key">${escapeHtml(f.label)}</span>
        <span class="result-value">${escapeHtml(String(f.value))}</span>
      </div>`
    }
    html += '</div>'
  }

  if (raw != null) {
    html += `<details class="json-toggle">
      <summary>Raw JSON Output</summary>
      <pre class="json-pre">${escapeHtml(JSON.stringify(raw, null, 2))}</pre>
    </details>`
  }

  html += '</div>'
  return html
}

/** Render just fields (no ISCC header) */
function renderFields(fields: ResultField[]): string {
  let html = '<div class="result-box"><div>'
  for (const f of fields) {
    html += `<div class="result-row">
      <span class="result-key">${escapeHtml(f.label)}</span>
      <span class="result-value">${escapeHtml(String(f.value))}</span>
    </div>`
  }
  html += '</div></div>'
  return html
}

function showLoading(): string {
  return '<div class="loading"><span class="spinner"></span>Computing...</div>'
}

function showError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  return `<div class="error-msg">${escapeHtml(msg)}</div>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Get element by ID with type assertion */
function $<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

// ─── Sidebar Navigation ─────────────────────────────────────────────────────────

const sidebarItems = document.querySelectorAll<HTMLButtonElement>('.sidebar-item')

function setActive(targetId: string) {
  sidebarItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.target === targetId)
  })
}

sidebarItems.forEach((item) => {
  item.addEventListener('click', () => {
    const target = item.dataset.target
    if (!target) return
    setActive(target)
    const el = document.getElementById(target)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

// Track active section on scroll
const sections = document.querySelectorAll<HTMLDivElement>('.section')
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActive(entry.target.id)
      }
    }
  },
  { rootMargin: '-80px 0px -60% 0px' }
)
sections.forEach((section) => observer.observe(section))

// ─── Pre-fill sample data ───────────────────────────────────────────────────────

$<HTMLTextAreaElement>('image-pixels').value = SAMPLE_PIXELS.join(', ')
$<HTMLTextAreaElement>('audio-fp').value = SAMPLE_CHROMAPRINT.join(', ')
$<HTMLTextAreaElement>('video-frames').value = JSON.stringify(SAMPLE_FRAMES)

// ─── 1. Meta-Code ───────────────────────────────────────────────────────────────

$<HTMLFormElement>('meta-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('meta-result')
  resultEl.innerHTML = showLoading()
  try {
    const title = $<HTMLInputElement>('meta-title').value
    const desc = $<HTMLTextAreaElement>('meta-desc').value
    const bits = Number($<HTMLSelectElement>('meta-bits').value)
    const result = await gen_meta_code(title, desc || undefined, undefined, bits)
    const fields: ResultField[] = [
      { label: 'Name', value: result.name as string },
      ...(result.description ? [{ label: 'Description', value: result.description as string }] : []),
      ...(result.metahash ? [{ label: 'Meta Hash', value: result.metahash as string }] : []),
    ]
    resultEl.innerHTML = renderResult(result.iscc, fields, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 2. Text-Code ───────────────────────────────────────────────────────────────

$<HTMLFormElement>('text-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('text-result')
  try {
    const text = $<HTMLTextAreaElement>('text-content').value
    const bits = Number($<HTMLSelectElement>('text-bits').value)
    const result = gen_text_code(text, bits)
    const fields: ResultField[] = [
      { label: 'Characters', value: result.characters as number },
    ]
    resultEl.innerHTML = renderResult(result.iscc, fields, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 3. Image-Code ──────────────────────────────────────────────────────────────

$<HTMLFormElement>('image-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('image-result')
  try {
    const pixelsStr = $<HTMLTextAreaElement>('image-pixels').value
    const pixels = pixelsStr.split(',').map((s) => Number(s.trim()))
    if (pixels.length !== 1024) {
      resultEl.innerHTML = showError(`Expected 1024 pixel values, got ${pixels.length}`)
      return
    }
    const bits = Number($<HTMLSelectElement>('image-bits').value)
    const result = gen_image_code(pixels, bits)
    resultEl.innerHTML = renderResult(result.iscc, undefined, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 4. Audio-Code ──────────────────────────────────────────────────────────────

$<HTMLFormElement>('audio-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('audio-result')
  try {
    const fpStr = $<HTMLTextAreaElement>('audio-fp').value
    const fingerprint = fpStr.split(',').map((s) => Number(s.trim()))
    const bits = Number($<HTMLSelectElement>('audio-bits').value)
    const result = gen_audio_code(fingerprint, bits)
    resultEl.innerHTML = renderResult(result.iscc, undefined, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 5. Video-Code ──────────────────────────────────────────────────────────────

$<HTMLFormElement>('video-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('video-result')
  try {
    const framesStr = $<HTMLTextAreaElement>('video-frames').value
    const frames: number[][] = JSON.parse(framesStr)
    if (!Array.isArray(frames) || !frames.every(Array.isArray)) {
      resultEl.innerHTML = showError('Input must be an array of arrays (each frame = array of 380 integers)')
      return
    }
    const bits = Number($<HTMLSelectElement>('video-bits').value)
    const result = gen_video_code(frames, bits)
    resultEl.innerHTML = renderResult(result.iscc, undefined, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 6. Mixed-Code ──────────────────────────────────────────────────────────────

$<HTMLFormElement>('mixed-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('mixed-result')
  try {
    const codesStr = $<HTMLTextAreaElement>('mixed-codes').value
    const codes = codesStr.split('\n').map((s) => s.trim()).filter(Boolean)
    if (codes.length < 2) {
      resultEl.innerHTML = showError('Enter at least 2 ISCC Content-Codes (one per line)')
      return
    }
    const bits = Number($<HTMLSelectElement>('mixed-bits').value)
    const result = gen_mixed_code(codes, bits)
    resultEl.innerHTML = renderResult(result.iscc, undefined, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 7. Data-Code ───────────────────────────────────────────────────────────────

$<HTMLFormElement>('data-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('data-result')
  resultEl.innerHTML = showLoading()
  try {
    const data = $<HTMLTextAreaElement>('data-content').value
    const bits = Number($<HTMLSelectElement>('data-bits').value)
    const buf = Buffer.from(data, 'utf-8')
    const result = await gen_data_code(buf, bits)
    resultEl.innerHTML = renderResult(result.iscc, undefined, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 8. Instance-Code ───────────────────────────────────────────────────────────

$<HTMLFormElement>('instance-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('instance-result')
  resultEl.innerHTML = showLoading()
  try {
    const data = $<HTMLTextAreaElement>('instance-content').value
    const bits = Number($<HTMLSelectElement>('instance-bits').value)
    const buf = Buffer.from(data, 'utf-8')
    const result = await gen_instance_code(buf, bits)
    const fields: ResultField[] = [
      ...(result.datahash ? [{ label: 'Data Hash', value: result.datahash as string }] : []),
      ...(result.filesize !== undefined ? [{ label: 'File Size', value: `${result.filesize} bytes` }] : []),
    ]
    resultEl.innerHTML = renderResult(result.iscc, fields, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 9. ISCC-CODE ───────────────────────────────────────────────────────────────

$<HTMLFormElement>('iscc-code-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('iscc-code-result')
  try {
    const codesStr = $<HTMLTextAreaElement>('iscc-code-units').value
    const codes = codesStr.split('\n').map((s) => s.trim()).filter(Boolean)
    if (codes.length < 2) {
      resultEl.innerHTML = showError('Enter at least 2 ISCC units (one per line)')
      return
    }
    const result = gen_iscc_code(codes)
    resultEl.innerHTML = renderResult(result.iscc, undefined, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 10. Flake-Code ─────────────────────────────────────────────────────────────

const flakeResults: Array<Record<string, unknown>> = []

$<HTMLFormElement>('flake-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('flake-result')
  try {
    const result = gen_flake_code()
    flakeResults.unshift(result as Record<string, unknown>)
    if (flakeResults.length > 10) flakeResults.length = 10

    let html = ''
    for (const res of flakeResults) {
      html += renderResult(res.iscc as string, undefined, res)
    }
    resultEl.innerHTML = html
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 11. ISCC-ID ────────────────────────────────────────────────────────────────

$<HTMLFormElement>('iscc-id-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('iscc-id-result')
  try {
    const hubId = Number($<HTMLInputElement>('iscc-id-hub').value)
    const result = gen_iscc_id(hubId)
    resultEl.innerHTML = renderResult(result.iscc, undefined, result)
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 12. Codec Utilities ────────────────────────────────────────────────────────

// Explain
$<HTMLFormElement>('explain-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('explain-result')
  try {
    const input = $<HTMLInputElement>('explain-input').value
    const result = iscc_explain(input)
    resultEl.innerHTML = `<div class="result-box"><div class="iscc-display">${escapeHtml(result)}</div></div>`
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// Validate
$<HTMLFormElement>('validate-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('validate-result')
  try {
    const input = $<HTMLInputElement>('validate-input').value
    const valid = iscc_validate(input)
    const color = valid ? 'var(--lime-green)' : 'var(--coral-red)'
    const text = valid ? '✓ Valid' : '✗ Invalid'
    resultEl.innerHTML = `<div class="result-box">
      <div class="result-row">
        <span class="result-key">Valid</span>
        <span class="result-value" style="color: ${color}">${text}</span>
      </div>
    </div>`
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// Similarity / Distance
$<HTMLFormElement>('similarity-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('similarity-result')
  try {
    const codeA = $<HTMLInputElement>('sim-a').value
    const codeB = $<HTMLInputElement>('sim-b').value
    const similarity = iscc_similarity(codeA, codeB)
    const distance = iscc_distance(codeA, codeB)
    resultEl.innerHTML = renderFields([
      { label: 'Similarity', value: `${similarity}%` },
      { label: 'Hamming Distance', value: distance },
    ])
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// Base32 Encode
$<HTMLFormElement>('encode-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('encode-result')
  try {
    const hex = $<HTMLInputElement>('hex-input').value
    const result = encode_base32(hex)
    resultEl.innerHTML = `<div class="result-box"><div class="iscc-display">${escapeHtml(result)}</div></div>`
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// Base32 Decode
$<HTMLFormElement>('decode-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('decode-result')
  try {
    const b32 = $<HTMLInputElement>('b32-input').value
    const bytes = decode_base32(b32)
    const hex = Buffer.from(bytes).toString('hex')
    resultEl.innerHTML = `<div class="result-box"><div class="iscc-display">${escapeHtml(hex)}</div></div>`
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// Decompose
$<HTMLFormElement>('decompose-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('decompose-result')
  try {
    const input = $<HTMLInputElement>('decompose-input').value
    const units = iscc_decompose(input)
    let html = '<div class="result-box">'
    units.forEach((unit, i) => {
      const borderTop = i > 0 ? 'border-top: 1px solid var(--light-gray);' : ''
      html += `<div class="iscc-display" style="${borderTop}">${escapeHtml(unit)}</div>`
    })
    html += '</div>'
    resultEl.innerHTML = html
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})

// ─── 13. Code Inspector ─────────────────────────────────────────────────────────

$<HTMLFormElement>('inspector-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const resultEl = $<HTMLDivElement>('inspector-result')
  try {
    const input = $<HTMLInputElement>('inspector-input').value
    const cleaned = iscc_clean(input)
    const code = new Code(cleaned)

    const hashHex = Array.from(code.hashBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    resultEl.innerHTML = renderFields([
      { label: 'Code', value: code.code },
      { label: 'URI', value: code.uri },
      { label: 'Type ID', value: code.typeId },
      { label: 'Main Type', value: String(code.maintype) },
      { label: 'SubType', value: String(code.subtype) },
      { label: 'Version', value: String(code.version) },
      { label: 'Hash Bits', value: String(code.hashBits) },
      { label: 'Hash Bytes (hex)', value: hashHex },
    ])
  } catch (err) {
    resultEl.innerHTML = showError(err)
  }
})
