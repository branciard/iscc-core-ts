<script lang="ts">
  import { gen_video_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

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

  let framesStr = $state(JSON.stringify(SAMPLE_FRAMES))
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')

  function generate() {
    error = ''
    try {
      const frames: number[][] = JSON.parse(framesStr)
      if (!Array.isArray(frames) || !frames.every(Array.isArray)) {
        error = 'Input must be an array of arrays (each frame = array of 380 integers)'
        return
      }
      const res = gen_video_code(frames, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    }
  }
</script>

<div id="video" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-content)"></span>
    <h2>Content-Code Video</h2>
  </div>
  <p class="section-desc">
    Generates a similarity hash from video frame signatures. Each frame is an array of 380 feature values.
    Uses WTA (Winner-Take-All) hashing for perceptual video fingerprinting.
  </p>

  <div class="form-group">
    <label for="video-frames">Frame Signatures (JSON array of arrays, each with 380 integer values)</label>
    <textarea id="video-frames" class="form-textarea" bind:value={framesStr} rows="5"></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="video-bits">Bits</label>
      <select id="video-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate}>
        Generate Video-Code
      </button>
    </div>
  </div>

  <ResultDisplay {error} iscc={result?.iscc as string | undefined} raw={result} />
</div>
