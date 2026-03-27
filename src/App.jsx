import { useRef } from 'react'
import HeroBubble from './components/HeroBubble'
import useScrollProgress from './hooks/useScrollProgress'

const defaultWidths = {
  freeWind: 0.08,
  hotBubble: 0.28,
  hii: 0.06,
  shell: 0.15,
  cloud: 0.2,
}

export default function App() {
  const containerRef = useRef(null)
  const progress = useScrollProgress(containerRef)

  // Uniform scale: 0.6× at progress=0, 1.2× at progress=1
  const multiplier = 0.6 + progress * 0.6

  const zoneWidths = {
    freeWind: defaultWidths.freeWind * multiplier,
    hotBubble: defaultWidths.hotBubble * multiplier,
    hii: defaultWidths.hii * multiplier,
    shell: defaultWidths.shell * multiplier,
    cloud: defaultWidths.cloud * multiplier,
  }

  return (
    <>
      <div ref={containerRef} style={{ height: '400vh' }}>
        <div className="sticky top-0 h-screen">
          <HeroBubble
            zoneWidths={zoneWidths}
            breathing={progress === 0}
          />
        </div>
      </div>
      {/* Extra space so unsticking is visible */}
      <div style={{ height: '20vh' }} />
    </>
  )
}
