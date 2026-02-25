<script lang="ts">
  import { Code, iscc_clean } from 'iscc-core-ts'
  import ResultDisplay from '../ResultDisplay.svelte'

  let input = $state('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY')
  let fields: Array<{ label: string; value: string }> = $state([])
  let error = $state('')

  function inspect() {
    error = ''
    try {
      const cleaned = iscc_clean(input)
      const code = new Code(cleaned)

      const hashHex = Array.from(code.hashBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      fields = [
        { label: 'Code', value: code.code },
        { label: 'URI', value: code.uri },
        { label: 'Type ID', value: code.typeId },
        { label: 'Main Type', value: String(code.maintype) },
        { label: 'SubType', value: String(code.subtype) },
        { label: 'Version', value: String(code.version) },
        { label: 'Hash Bits', value: String(code.hashBits) },
        { label: 'Hash Bytes (hex)', value: hashHex },
      ]
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      fields = []
    }
  }
</script>

<div id="inspector" class="section">
  <div class="section-header">
    <span class="section-dot" style="background: var(--deep-navy)"></span>
    <h2>Code Inspector</h2>
  </div>
  <p class="section-desc">
    Parse and inspect any ISCC code using the <code>Code</code> class.
    Shows the decoded header fields, type information, and raw hash bytes.
  </p>

  <div class="form-row">
    <div class="form-group">
      <label for="inspector-input">ISCC Code</label>
      <input id="inspector-input" class="form-input" bind:value={input} placeholder="ISCC:..." />
    </div>
    <div class="form-group">
      <button class="btn btn-primary" onclick={inspect}>
        Inspect
      </button>
    </div>
  </div>

  <ResultDisplay
    {error}
    {fields}
  />
</div>
