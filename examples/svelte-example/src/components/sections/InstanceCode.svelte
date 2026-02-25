<script lang="ts">
  import { gen_instance_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  let data = $state('Hello World! This is sample data for the ISCC Instance-Code.')
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')
  let loading = $state(false)

  async function generate() {
    error = ''
    loading = true
    try {
      const buf = Buffer.from(data, 'utf-8')
      const res = await gen_instance_code(buf, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    } finally {
      loading = false
    }
  }

  let fields = $derived(result ? [
    ...(result.datahash ? [{ label: 'Data Hash', value: result.datahash as string }] : []),
    ...(result.filesize !== undefined ? [{ label: 'File Size', value: `${result.filesize} bytes` }] : []),
  ] : undefined)
</script>

<div id="instance" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-instance)"></span>
    <h2>Instance-Code</h2>
  </div>
  <p class="section-desc">
    Generates a cryptographic hash (BLAKE3) for exact binary content identification.
    Also provides a datahash (multihash) and filesize.
  </p>

  <div class="form-group">
    <label for="instance-data">Data (text will be UTF-8 encoded)</label>
    <textarea id="instance-data" class="form-textarea" bind:value={data} rows="4" placeholder="Enter data..."></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="instance-bits">Bits</label>
      <select id="instance-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate} disabled={!data || loading}>
        Generate Instance-Code
      </button>
    </div>
  </div>

  <ResultDisplay
    {loading}
    {error}
    iscc={result?.iscc as string | undefined}
    {fields}
    raw={result}
  />
</div>
