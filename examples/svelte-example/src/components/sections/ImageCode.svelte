<script lang="ts">
  import { gen_image_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  // Sample 1024 grayscale pixel values (32x32 gradient pattern)
  const SAMPLE_PIXELS = Array.from({ length: 1024 }, (_, i) => {
    const x = i % 32
    const y = Math.floor(i / 32)
    return Math.round((x + y) * (255 / 62))
  })

  let pixelsStr = $state(SAMPLE_PIXELS.join(', '))
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')

  function generate() {
    error = ''
    try {
      const pixels = pixelsStr.split(',').map((s) => Number(s.trim()))
      if (pixels.length !== 1024) {
        error = `Expected 1024 pixel values, got ${pixels.length}`
        return
      }
      const res = gen_image_code(pixels, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    }
  }
</script>

<div id="image" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-content)"></span>
    <h2>Content-Code Image</h2>
  </div>
  <p class="section-desc">
    Generates a perceptual hash from 1024 normalized grayscale pixel values (32×32) using DCT.
    Visually similar images produce similar codes.
  </p>

  <div class="form-group">
    <label for="image-pixels">Pixel Values (1024 comma-separated grayscale values, 0–255)</label>
    <textarea id="image-pixels" class="form-textarea" bind:value={pixelsStr} rows="4"></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="image-bits">Bits</label>
      <select id="image-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate}>
        Generate Image-Code
      </button>
    </div>
  </div>

  <ResultDisplay {error} iscc={result?.iscc as string | undefined} raw={result} />
</div>
