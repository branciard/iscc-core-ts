<script lang="ts">
  import { gen_audio_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

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

  let fpStr = $state(SAMPLE_CHROMAPRINT.join(', '))
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')

  function generate() {
    error = ''
    try {
      const fingerprint = fpStr.split(',').map((s) => Number(s.trim()))
      const res = gen_audio_code(fingerprint, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    }
  }
</script>

<div id="audio" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-content)"></span>
    <h2>Content-Code Audio</h2>
  </div>
  <p class="section-desc">
    Generates a similarity hash from a Chromaprint audio fingerprint (array of signed 32-bit integers).
    Use <code>fpcalc -raw -json -signed -length 0</code> to extract fingerprints.
  </p>

  <div class="form-group">
    <label for="audio-fp">Chromaprint Fingerprint (comma-separated signed 32-bit integers)</label>
    <textarea id="audio-fp" class="form-textarea" bind:value={fpStr} rows="5"></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="audio-bits">Bits</label>
      <select id="audio-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate}>
        Generate Audio-Code
      </button>
    </div>
  </div>

  <ResultDisplay {error} iscc={result?.iscc as string | undefined} raw={result} />
</div>
