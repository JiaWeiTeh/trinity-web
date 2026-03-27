const defaultZoneWidths = {
  freeWind: 0.1667,
  hotBubble: 0.4444,
  hii: 0.0556,
  shell: 0.1111,
  cloud: 0.2222,
}

export default function HeroBubble({
  zoneWidths = defaultZoneWidths,
  breathing = true,
  chevronOpacity = 1,
  titleOpacity = 1,
  children,
}) {
  const w = { ...defaultZoneWidths, ...zoneWidths }

  // Build cumulative radii (inside-out) as fractions of total radius (50 SVG units)
  const R = 50
  let cursor = 0
  const freeWindInner = cursor
  cursor += w.freeWind
  const freeWindOuter = cursor

  const hotBubbleInner = cursor
  cursor += w.hotBubble
  const hotBubbleOuter = cursor

  const hiiInner = cursor
  cursor += w.hii
  const hiiOuter = cursor

  const shellInner = cursor
  cursor += w.shell
  const shellOuter = cursor

  const cloudInner = cursor
  cursor += w.cloud
  const cloudOuter = cursor

  // Normalize so outermost edge = R
  const total = cloudOuter
  const scale = (frac) => (frac / total) * R

  const zones = [
    // Ambient cloud (outermost) — light grey
    {
      id: 'cloud',
      outer: scale(cloudOuter),
      fill: 'url(#cloudGradient)',
    },
    // Swept-up neutral shell — dark maroon
    {
      id: 'shell',
      outer: scale(shellOuter),
      fill: '#8B4D5C',
    },
    // Photoionised shell (HII) — muted rose/pink
    {
      id: 'hii',
      outer: scale(hiiOuter),
      fill: '#C4929B',
    },
    // Hot bubble — light blue
    {
      id: 'hotBubble',
      outer: scale(hotBubbleOuter),
      fill: '#B4CEE8',
    },
    // Free-wind zone (innermost) — dark navy
    {
      id: 'freeWind',
      outer: scale(freeWindOuter),
      fill: '#2A3A4E',
    },
  ]

  return (
    <section className="relative flex flex-col items-center justify-center h-screen w-screen bg-navy select-none overflow-hidden">
      {/* Title */}
      <div className="z-10" style={{ opacity: titleOpacity, transition: 'opacity 0.15s ease-out' }}>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-widest mb-2 text-center">
          TRINITY
        </h1>
        <p className="text-sm md:text-base text-white/60 font-medium tracking-wide mb-8 text-center">
          Feedback-driven bubble evolution in molecular clouds
        </p>
      </div>

      {/* Bubble SVG */}
      <div
        className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 z-10 animate-breathe"
        style={{ animationPlayState: breathing ? 'running' : 'paused' }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Cloud gradient — light grey fading into navy background */}
            <radialGradient id="cloudGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C8C8D0" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0D1B2A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Render zones outside-in so inner zones paint on top */}
          {zones.map((zone) => (
            <circle
              key={zone.id}
              cx="50"
              cy="50"
              r={zone.outer}
              fill={zone.fill}
            />
          ))}
        </svg>
      </div>

      {/* Annotations slot */}
      {children}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-pulse-fade z-10" style={{ opacity: chevronOpacity }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  )
}
