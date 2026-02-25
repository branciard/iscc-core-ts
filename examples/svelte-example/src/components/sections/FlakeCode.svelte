<script lang="ts">
  import { gen_flake_code } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  let results: Array<Record<string, unknown>> = $state([])
  let error = $state('')

  function generate() {
    error = ''
    try {
      const res = gen_flake_code()
      results = [res as Record<string, unknown>, ...results].slice(0, 10)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }
  }
</script>

<div id="flake" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--color-flake)"></span>
    <h2>Flake-Code</h2>
  </div>
  <p class="section-desc">
    Generates a unique, time-sorted identifier (48-bit timestamp + 16-bit randomness).
    Useful as a database surrogate key. Each click generates a new unique flake.
  </p>

  <div class="form-group">
    <button class="btn btn-primary" onclick={generate}>
      Generate Flake-Code
    </button>
  </div>

  {#if error}
    <div class="error-msg">{error}</div>
  {/if}

  {#each results as res, i (i)}
    <ResultDisplay
      iscc={res.iscc as string}
      raw={res}
    />
  {/each}
</div>
