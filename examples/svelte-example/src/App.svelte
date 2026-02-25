<script lang="ts">
  import Sidebar from './components/Sidebar.svelte'
  import MetaCode from './components/sections/MetaCode.svelte'
  import TextCode from './components/sections/TextCode.svelte'
  import ImageCode from './components/sections/ImageCode.svelte'
  import AudioCode from './components/sections/AudioCode.svelte'
  import VideoCode from './components/sections/VideoCode.svelte'
  import MixedCode from './components/sections/MixedCode.svelte'
  import DataCode from './components/sections/DataCode.svelte'
  import InstanceCode from './components/sections/InstanceCode.svelte'
  import IsccCode from './components/sections/IsccCode.svelte'
  import FlakeCode from './components/sections/FlakeCode.svelte'
  import IsccId from './components/sections/IsccId.svelte'
  import CodecUtils from './components/sections/CodecUtils.svelte'
  import CodeInspector from './components/sections/CodeInspector.svelte'

  let activeSection = $state('meta')

  function handleNavigate(id: string) {
    activeSection = id
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
</script>

<div class="app-layout">
  <header class="app-header">
    <img src="/assets/iscc-logo-icon-black.svg" alt="ISCC" />
    <h1>ISCC Core TS</h1>
    <span class="version">v0.3.0 — Svelte Interactive Demo</span>
  </header>

  <Sidebar {activeSection} onNavigate={handleNavigate} />

  <main class="main-content">
    <MetaCode />
    <TextCode />
    <ImageCode />
    <AudioCode />
    <VideoCode />
    <MixedCode />
    <DataCode />
    <InstanceCode />
    <IsccCode />
    <FlakeCode />
    <IsccId />
    <CodecUtils />
    <CodeInspector />
  </main>
</div>
