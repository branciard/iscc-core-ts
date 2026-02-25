<script lang="ts">
  import { gen_data_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  let data = $state('Hello World! This is sample data for the ISCC Data-Code generation. The Data-Code uses Content-Defined Chunking and MinHash for similarity hashing of binary data streams.')
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')
  let loading = $state(false)

  async function generate() {
    error = ''
    loading = true
    try {
      const buf = Buffer.from(data, 'utf-8')
      const res = await gen_data_code(buf, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    } finally {
      loading = false
    }
  }
</script>

<div id="data" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-data)"></span>
    <h2>Data-Code</h2>
  </div>
  <p class="section-desc">
    Generates a similarity hash from binary data using Content-Defined Chunking (CDC) and MinHash.
    Identifies similar binary data streams regardless of format.
  </p>

  <div class="form-group">
    <label for="data-input">Data (text will be UTF-8 encoded)</label>
    <textarea id="data-input" class="form-textarea" bind:value={data} rows="5" placeholder="Enter data..."></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="data-bits">Bits</label>
      <select id="data-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate} disabled={!data || loading}>
        Generate Data-Code
      </button>
    </div>
  </div>

  <ResultDisplay
    {loading}
    {error}
    iscc={result?.iscc as string | undefined}
    raw={result}
  />
</div>
