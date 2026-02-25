<script lang="ts">
  import { gen_mixed_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  const SAMPLE_CODES = [
    'ISCC:EAASKDNZNYGUUF5A',
    'ISCC:EAAS2QPBFTG7HLUQ',
  ].join('\n')

  let codesStr = $state(SAMPLE_CODES)
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')

  function generate() {
    error = ''
    try {
      const codes = codesStr.split('\n').map((s) => s.trim()).filter(Boolean)
      if (codes.length < 2) {
        error = 'Enter at least 2 ISCC Content-Codes (one per line)'
        return
      }
      const res = gen_mixed_code(codes, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    }
  }
</script>

<div id="mixed" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-content)"></span>
    <h2>Content-Code Mixed</h2>
  </div>
  <p class="section-desc">
    Combines multiple Content-Codes into a single Mixed-Code using SimHash.
    Useful when content has multiple media types (e.g., text + images).
  </p>

  <div class="form-group">
    <label for="mixed-codes">ISCC Content-Codes (one per line)</label>
    <textarea id="mixed-codes" class="form-textarea" bind:value={codesStr} rows="4" placeholder="ISCC:EAAS..."></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="mixed-bits">Bits</label>
      <select id="mixed-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate}>
        Generate Mixed-Code
      </button>
    </div>
  </div>

  <ResultDisplay {error} iscc={result?.iscc as string | undefined} raw={result} />
</div>
