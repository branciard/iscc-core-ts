<script lang="ts">
  import { gen_text_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  let text = $state('The quick brown fox jumps over the lazy dog. This is a sample text for demonstrating the ISCC Content-Code Text generation algorithm which uses MinHash for similarity hashing.')
  let bits = $state(64)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')

  function generate() {
    error = ''
    try {
      const res = gen_text_code(text, bits)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    }
  }

  let fields = $derived(result ? [
    { label: 'Characters', value: result.characters as number },
  ] : undefined)
</script>

<div id="text" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-content)"></span>
    <h2>Content-Code Text</h2>
  </div>
  <p class="section-desc">
    Generates a similarity hash from text content using character-level n-gram shingling and MinHash.
    Similar texts produce similar codes.
  </p>

  <div class="form-group">
    <label for="text-content">Text Content</label>
    <textarea id="text-content" class="form-textarea" bind:value={text} rows="5" placeholder="Enter text..."></textarea>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="text-bits">Bits</label>
      <select id="text-bits" class="form-select" bind:value={bits}>
        <option value={64}>64</option>
        <option value={128}>128</option>
        <option value={256}>256</option>
      </select>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate} disabled={!text}>
        Generate Text-Code
      </button>
    </div>
  </div>

  <ResultDisplay
    {error}
    iscc={result?.iscc as string | undefined}
    {fields}
    raw={result}
  />
</div>
