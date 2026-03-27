import { useRef } from 'react'
import HeroBubble from './components/HeroBubble'
import Navbar from './components/Navbar'
import ContentSections from './components/ContentSections'
import useScrollProgress from './hooks/useScrollProgress'

// Phase keyframes: energy-driven (compact) → transition → momentum-driven (expanded)
const phases = {
  energy:     { freeWind: 0.02, hotBubble: 0.03, hii: 0.06, shell: 0.08, cloud: 0.20 },
  transition: { freeWind: 0.05, hotBubble: 0.12, hii: 0.10, shell: 0.18, cloud: 0.20 },
  momentum:   { freeWind: 0.08, hotBubble: 0.30, hii: 0.14, shell: 0.22, cloud: 0.20 },
}

const zoneKeys = ['freeWind', 'hotBubble', 'hii', 'shell', 'cloud']

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpZones(from, to, t) {
  const result = {}
  for (const key of zoneKeys) {
    result[key] = lerp(from[key], to[key], t)
  }
  return result
}

function getZoneWidths(progress) {
  if (progress <= 0.30) {
    // Hold at energy-driven
    return phases.energy
  } else if (progress <= 0.55) {
    // Energy → transition
    const t = (progress - 0.30) / 0.25
    return lerpZones(phases.energy, phases.transition, t)
  } else if (progress <= 0.80) {
    // Transition → momentum
    const t = (progress - 0.55) / 0.25
    return lerpZones(phases.transition, phases.momentum, t)
  } else {
    // Hold at momentum-driven
    return phases.momentum
  }
}

// Annotation fade: ramp in over [fadeIn, fullStart], hold, ramp out over [fullEnd, fadeOut]
function getAnnotationOpacity(progress, fadeIn, fullStart, fullEnd, fadeOut) {
  if (progress < fadeIn || progress > fadeOut) return 0
  if (progress < fullStart) return (progress - fadeIn) / (fullStart - fadeIn)
  if (progress > fullEnd) return 1 - (progress - fullEnd) / (fadeOut - fullEnd)
  return 1
}

const annotations = [
  {
    text: 'Energy-driven: hot bubble pressure inflates the shell.',
    fadeIn: 0.05, fullStart: 0.10, fullEnd: 0.25, fadeOut: 0.30,
  },
  {
    text: 'Transition: thermal energy radiates away.',
    fadeIn: 0.30, fullStart: 0.35, fullEnd: 0.55, fadeOut: 0.60,
  },
  {
    text: 'Momentum-driven: photoionised gas pressure and ram pressure sustain expansion.',
    fadeIn: 0.60, fullStart: 0.65, fullEnd: 0.90, fadeOut: 0.95,
  },
]

export default function App() {
  const containerRef = useRef(null)
  const progress = useScrollProgress(containerRef)
  const zoneWidths = getZoneWidths(progress)

  // Title and chevron fade out as scroll begins
  const titleOpacity = progress < 0.02 ? 1 : Math.max(0, 1 - (progress - 0.02) / 0.05)
  const chevronOpacity = progress < 0.05 ? 1 : Math.max(0, 1 - (progress - 0.05) / 0.05)

  return (
    <>
      <Navbar />
      <div ref={containerRef} style={{ height: '400vh' }}>
        <div className="sticky top-0 h-screen">
          <HeroBubble
            zoneWidths={zoneWidths}
            breathing={progress < 0.005}
            chevronOpacity={chevronOpacity}
            titleOpacity={titleOpacity}
          >
            {/* Annotations — appear in the title area after it fades out */}
            <div className="absolute left-0 right-0 top-[10%] flex justify-center px-8 z-20 pointer-events-none">
              <div className="relative flex items-center justify-center w-full max-w-xl" style={{ minHeight: '3rem' }}>
                {annotations.map((a, i) => {
                  const opacity = getAnnotationOpacity(progress, a.fadeIn, a.fullStart, a.fullEnd, a.fadeOut)
                  return (
                    <p
                      key={i}
                      className="absolute inset-0 flex items-center justify-center text-center text-sm md:text-base leading-relaxed text-white/80 font-medium italic"
                      style={{ opacity, transition: 'opacity 0.1s ease-out' }}
                    >
                      {a.text}
                    </p>
                  )
                })}
              </div>
            </div>
          </HeroBubble>
        </div>
      </div>
      <ContentSections />
    </>
  )
}
