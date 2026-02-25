<script lang="ts">
  import { gen_meta_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  let title = $state('ISCC Demo Document')
  let description = $state('A sample document for testing the ISCC Meta-Code generation.')
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')
  let loading = $state(false)

  async function generate() {
    error = ''
    loading = true
    try {
      const res = await gen_meta_code(title, description || undefined, undefined, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    } finally {
      loading = false
    }
  }

  let fields = $derived(result ? [
    { label: 'Name', value: result.name as string },
    ...(result.description ? [{ label: 'Description', value: result.description as string }] : []),
    ...(result.metahash ? [{ label: 'Meta Hash', value: result.metahash as string }] : []),
  ] : undefined)
</script>

<div id="meta" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-meta)"></span>
    <h2>Meta-Code</h2>
  </div>
  <p class="section-desc">
    Generates a similarity-preserving hash from metadata (title, description).
    Useful for identifying content by its descriptive metadata.
  </p>

  <div class="form-group">
    <label for="meta-title">Title</label>
    <input id="meta-title" class="form-input" bind:value={title} placeholder="Enter title..." />
  </div>
  <div class="form-group">
    <label for="meta-desc">Description (optional)</label>
    <textarea id="meta-desc" class="form-textarea" bind:value={description} rows="3" placeholder="Enter description..."></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="meta-bits">Bits</label>
      <select id="meta-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate} disabled={!title || loading}>
        Generate Meta-Code
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
