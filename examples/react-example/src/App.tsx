import { useState, useCallback } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import MetaCode from './components/sections/MetaCode'
import TextCode from './components/sections/TextCode'
import ImageCode from './components/sections/ImageCode'
import AudioCode from './components/sections/AudioCode'
import VideoCode from './components/sections/VideoCode'
import MixedCode from './components/sections/MixedCode'
import DataCode from './components/sections/DataCode'
import InstanceCode from './components/sections/InstanceCode'
import IsccCode from './components/sections/IsccCode'
import FlakeCode from './components/sections/FlakeCode'
import IsccId from './components/sections/IsccId'
import CodecUtils from './components/sections/CodecUtils'
import CodeInspector from './components/sections/CodeInspector'

function App() {
  const [activeSection, setActiveSection] = useState('meta')

  const handleNavigate = useCallback((id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className="app-layout">
      <header className="app-header">
        <img src="/assets/iscc-logo-icon-black.svg" alt="ISCC" />
        <h1>ISCC Core TS</h1>
        <span className="version">v0.3.0 — Interactive Demo</span>
      </header>

      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="main-content">
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
  )
}

export default App
