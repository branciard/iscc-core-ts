<script lang="ts">
  import { gen_iscc_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  const SAMPLE_CODES = [
    'ISCC:AAAWN3GVSSQLNPE4',
    'ISCC:EAASKDNZNYGUUF5A',
    'ISCC:GAAW2PRCRS5LNVZK',
    'ISCC:IAAW7EDERHK3SFHH',
  ].join('\n')

  let codesStr = $state(SAMPLE_CODES)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')

  function generate() {
    error = ''
    try {
      const codes = codesStr.split('\n').map((s) => s.trim()).filter(Boolean)
      if (codes.length < 2) {
        error = 'Enter at least 2 ISCC units (one per line)'
        return
      }
      const res = gen_iscc_code(codes)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    }
  }
</script>

<div id="iscc-code" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-iscc-code)"></span>
    <h2>ISCC-CODE</h2>
  </div>
  <p class="section-desc">
    Combines multiple ISCC-UNITs (Meta, Content, Data, Instance) into a single composite ISCC-CODE
    with a common header. This is the full ISCC identifier for a digital asset.
  </p>

  <div class="form-group">
    <label for="iscc-codes">ISCC Units (one per line: Meta, Content, Data, Instance)</label>
    <textarea id="iscc-codes" class="form-textarea" bind:value={codesStr} rows="5" placeholder="ISCC:AAAW...&#10;ISCC:EAAS...&#10;ISCC:GAAW...&#10;ISCC:IAAW..."></textarea>
  </div>
  <div class="form-group">
    <button class="btn btn-primary" onclick={generate}>
      Generate ISCC-CODE
    </button>
  </div>

  <ResultDisplay
    {error}
    iscc={result?.iscc as string | undefined}
    raw={result}
  />
</div>
