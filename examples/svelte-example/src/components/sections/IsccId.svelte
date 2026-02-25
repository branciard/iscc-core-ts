<script lang="ts">
  import { gen_iscc_id } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  let hubId = $state(42)
  let result: Record<string, unknown> | null = $state(null)
  let error = $state('')

  function generate() {
    error = ''
    try {
      const res = gen_iscc_id(hubId)
      result = res as Record<string, unknown>
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      result = null
    }
  }
</script>

<div id="iscc-id" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-iscc-id)"></span>
    <h2>ISCC-ID</h2>
  </div>
  <p class="section-desc">
    Generates a globally unique, owned identifier based on a timestamp and HUB-ID.
    The 52-bit UTC timestamp + 12-bit HUB-ID ensures uniqueness across distributed systems.
  </p>

  <div class="form-row">
    <div class="form-group">
      <label for="iscc-id-hub">HUB ID (0–4095)</label>
      <input
        id="iscc-id-hub"
        class="form-input"
        type="number"
        min="0"
        max="4095"
        bind:value={hubId}
      />
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={generate}>
        Generate ISCC-ID
      </button>
    </div>
  </div>

  <ResultDisplay
    {error}
    iscc={result?.iscc as string | undefined}
    raw={result}
  />
</div>
