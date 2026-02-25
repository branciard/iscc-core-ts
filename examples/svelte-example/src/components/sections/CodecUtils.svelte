<script lang="ts">
  import {
    iscc_explain,
    iscc_validate,
    iscc_similarity,
    iscc_distance,
    iscc_decompose,
    encode_base32,
    decode_base32,
  } from 'iscc-core-ts'

  // Explain
  let explainInput = $state('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  let explainResult = $state('')
  let explainError = $state('')

  function doExplain() {
    explainError = ''
    try {
      explainResult = iscc_explain(explainInput)
    } catch (e) {
      explainError = e instanceof Error ? e.message : String(e)
      explainResult = ''
    }
  }

  // Validate
  let validateInput = $state('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  let validateResult: boolean | null = $state(null)
  let validateError = $state('')

  function doValidate() {
    validateError = ''
    try {
      validateResult = iscc_validate(validateInput)
    } catch (e) {
      validateError = e instanceof Error ? e.message : String(e)
      validateResult = null
    }
  }

  // Similarity
  let simA = $state('ISCC:EAAWVMZ5AQ2IOA43')
  let simB = $state('ISCC:EAAXNOS5MCRYKEPL')
  let simResult: { similarity: number; distance: number } | null = $state(null)
  let simError = $state('')

  function doSimilarity() {
    simError = ''
    try {
      const similarity = iscc_similarity(simA, simB)
      const distance = iscc_distance(simA, simB)
      simResult = { similarity, distance }
    } catch (e) {
      simError = e instanceof Error ? e.message : String(e)
      simResult = null
    }
  }

  // Base32
  let hexInput = $state('cc01f6728a8fa89e')
  let b32Result = $state('')
  let b32Error = $state('')

  function doEncode() {
    b32Error = ''
    try {
      b32Result = encode_base32(hexInput)
    } catch (e) {
      b32Error = e instanceof Error ? e.message : String(e)
    }
  }

  let b32Input = $state('ZQA7M4UKR6UJ4')
  let hexResult = $state('')
  let hexError = $state('')

  function doDecode() {
    hexError = ''
    try {
      const bytes = decode_base32(b32Input)
      hexResult = Buffer.from(bytes).toString('hex')
    } catch (e) {
      hexError = e instanceof Error ? e.message : String(e)
    }
  }

  // Decompose
  let decompInput = $state('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  let decompResult: string[] = $state([])
  let decompError = $state('')

  function doDecompose() {
    decompError = ''
    try {
      decompResult = iscc_decompose(decompInput)
    } catch (e) {
      decompError = e instanceof Error ? e.message : String(e)
      decompResult = []
    }
  }
</script>

<div id="codec" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--medium-gray)"></span>
    <h2>Codec Utilities</h2>
  </div>
  <p class="section-desc">
    Low-level codec functions for explaining, validating, comparing, encoding/decoding, and decomposing ISCC codes.
  </p>

  <!-- Explain -->
  <h3 style="font-size: 1rem; margin-bottom: 0.5rem; margin-top: 1.5rem">iscc_explain</h3>
  <div class="form-row">
    <div class="form-group">
      <input class="form-input" bind:value={explainInput} placeholder="ISCC:..." />
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={doExplain}>Explain</button>
    </div>
  </div>
  {#if explainError}
    <div class="error-msg">{explainError}</div>
  {/if}
  {#if explainResult}
    <div class="result-box">
      <div class="iscc-display">{explainResult}</div>
    </div>
  {/if}

  <!-- Validate -->
  <h3 style="font-size: 1rem; margin-bottom: 0.5rem; margin-top: 1.5rem">iscc_validate</h3>
  <div class="form-row">
    <div class="form-group">
      <input class="form-input" bind:value={validateInput} placeholder="ISCC:..." />
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={doValidate}>Validate</button>
    </div>
  </div>
  {#if validateError}
    <div class="error-msg">{validateError}</div>
  {/if}
  {#if validateResult !== null}
    <div class="result-box">
      <div class="result-row">
        <span class="result-key">Valid</span>
        <span class="result-value" style="color: {validateResult ? 'var(--lime-green)' : 'var(--coral-red)'}">
          {validateResult ? '✓ Valid' : '✗ Invalid'}
        </span>
      </div>
    </div>
  {/if}

  <!-- Similarity / Distance -->
  <h3 style="font-size: 1rem; margin-bottom: 0.5rem; margin-top: 1.5rem">iscc_similarity / iscc_distance</h3>
  <div class="form-group">
    <label for="sim-a">ISCC Code A</label>
    <input id="sim-a" class="form-input" bind:value={simA} />
  </div>
  <div class="form-group">
    <label for="sim-b">ISCC Code B</label>
    <input id="sim-b" class="form-input" bind:value={simB} />
  </div>
  <div class="form-group">
    <button class="btn btn-primary" onclick={doSimilarity}>Compare</button>
  </div>
  {#if simError}
    <div class="error-msg">{simError}</div>
  {/if}
  {#if simResult}
    <div class="result-box">
      <div class="result-row">
        <span class="result-key">Similarity</span>
        <span class="result-value">{simResult.similarity}%</span>
      </div>
      <div class="result-row">
        <span class="result-key">Hamming Distance</span>
        <span class="result-value">{simResult.distance}</span>
      </div>
    </div>
  {/if}

  <!-- Base32 Encode -->
  <h3 style="font-size: 1rem; margin-bottom: 0.5rem; margin-top: 1.5rem">encode_base32 / decode_base32</h3>
  <div class="form-row">
    <div class="form-group">
      <label for="hex-input">Hex → Base32</label>
      <input id="hex-input" class="form-input" bind:value={hexInput} placeholder="hex..." />
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={doEncode}>Encode</button>
    </div>
  </div>
  {#if b32Error}
    <div class="error-msg">{b32Error}</div>
  {/if}
  {#if b32Result}
    <div class="result-box"><div class="iscc-display">{b32Result}</div></div>
  {/if}

  <div class="form-row" style="margin-top: 0.75rem">
    <div class="form-group">
      <label for="b32-input">Base32 → Hex</label>
      <input id="b32-input" class="form-input" bind:value={b32Input} placeholder="base32..." />
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={doDecode}>Decode</button>
    </div>
  </div>
  {#if hexError}
    <div class="error-msg">{hexError}</div>
  {/if}
  {#if hexResult}
    <div class="result-box"><div class="iscc-display">{hexResult}</div></div>
  {/if}

  <!-- Decompose -->
  <h3 style="font-size: 1rem; margin-bottom: 0.5rem; margin-top: 1.5rem">iscc_decompose</h3>
  <div class="form-row">
    <div class="form-group">
      <input class="form-input" bind:value={decompInput} placeholder="ISCC:..." />
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={doDecompose}>Decompose</button>
    </div>
  </div>
  {#if decompError}
    <div class="error-msg">{decompError}</div>
  {/if}
  {#if decompResult.length > 0}
    <div class="result-box">
      {#each decompResult as unit, i (i)}
        <div class="iscc-display" style="border-top: {i > 0 ? '1px solid var(--light-gray)' : 'none'}">
          {unit}
        </div>
      {/each}
    </div>
  {/if}
</div>
