<script lang="ts">
  interface ResultField {
    label: string
    value: string | number | boolean
  }

  interface Props {
    iscc?: string
    fields?: ResultField[]
    raw?: unknown
    error?: string
    loading?: boolean
  }

  let { iscc, fields, raw, error, loading }: Props = $props()
</script>

{#if loading}
  <div class="loading">
    <span class="spinner"></span>
    Computing...
  </div>
{:else if error}
  <div class="error-msg">{error}</div>
{:else if iscc || fields || raw}
  <div class="result-box">
    {#if iscc}
      <div class="result-label">ISCC Code</div>
      <div class="iscc-display">{iscc}</div>
    {/if}
    {#if fields && fields.length > 0}
      <div>
        {#each fields as f (f.label)}
          <div class="result-row">
            <span class="result-key">{f.label}</span>
            <span class="result-value">{String(f.value)}</span>
          </div>
        {/each}
      </div>
    {/if}
    {#if raw != null}
      <details class="json-toggle">
        <summary>Raw JSON Output</summary>
        <pre class="json-pre">{JSON.stringify(raw, null, 2)}</pre>
      </details>
    {/if}
  </div>
{/if}
