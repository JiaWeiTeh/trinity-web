const defaultZoneWidths = {
  freeWind: 0.1667,
  hotBubble: 0.4444,
  hii: 0.0556,
  shell: 0.1111,
  cloud: 0.2222,
}

const zoneLabels = [
  { id: 'cloud', label: 'Cloud' },
  { id: 'shell', label: 'Shell', subscript: 'neu' },
  { id: 'hii', label: 'Shell', subscript: 'ion' },
  { id: 'hotBubble', label: 'Bubble' },
  { id: 'freeWind', label: 'Winds' },
]

export default function HeroBubble({
  zoneWidths = defaultZoneWidths,
  breathing = true,
  chevronOpacity = 1,
  titleOpacity = 1,
  labelOpacity = 0,
  children,
}) {
  const w = { ...defaultZoneWidths, ...zoneWidths }

  // Build cumulative radii (inside-out) as fractions of total radius (50 SVG units)
  const R = 50
  let cursor = 0
  cursor += w.freeWind
  const freeWindOuter = cursor

  cursor += w.hotBubble
  const hotBubbleOuter = cursor

  cursor += w.hii
  const hiiOuter = cursor

  cursor += w.shell
  const shellOuter = cursor

  cursor += w.cloud
  const cloudOuter = cursor

  // Normalize so outermost edge = R
  const total = cloudOuter
  const scale = (frac) => (frac / total) * R

  // Compute midpoint radii for label leader lines
  const zoneMidpoints = {
    cloud: scale((shellOuter + cloudOuter) / 2),
    shell: scale(((hiiOuter) + shellOuter) / 2),
    hii: scale((hotBubbleOuter + hiiOuter) / 2),
    hotBubble: scale((freeWindOuter + hotBubbleOuter) / 2),
    freeWind: scale(freeWindOuter / 2),
  }

  const zones = [
    { id: 'cloud', outer: scale(cloudOuter), fill: 'url(#cloudGradient)' },
    { id: 'shell', outer: scale(shellOuter), fill: '#8B4D5C' },
    { id: 'hii', outer: scale(hiiOuter), fill: '#C4929B' },
    { id: 'hotBubble', outer: scale(hotBubbleOuter), fill: '#B4CEE8' },
    { id: 'freeWind', outer: scale(freeWindOuter), fill: '#2A3A4E' },
  ]

  // Leader line endpoint X (right side of viewBox)
  const leaderEndX = 95
  const labelX = 96

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
        className="w-72 h-72 md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem] z-10 animate-breathe"
        style={{ animationPlayState: breathing ? 'running' : 'paused' }}
      >
        <svg viewBox="-10 0 130 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
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

          {/* Zone labels with leader lines */}
          <g style={{ opacity: labelOpacity, transition: 'opacity 0.3s ease-out' }}>
            {zoneLabels.map((zl) => {
              const midR = zoneMidpoints[zl.id]
              const pointX = 50 + midR
              const pointY = 50

              return (
                <g key={zl.id}>
                  {/* Leader line */}
                  <line
                    x1={pointX}
                    y1={pointY}
                    x2={leaderEndX}
                    y2={pointY}
                    stroke="white"
                    strokeWidth="0.3"
                    strokeOpacity="0.5"
                  />
                  {/* Tick at zone boundary */}
                  <line
                    x1={pointX}
                    y1={pointY - 1.5}
                    x2={pointX}
                    y2={pointY + 1.5}
                    stroke="white"
                    strokeWidth="0.4"
                    strokeOpacity="0.6"
                  />
                  {/* Label text */}
                  <text
                    x={labelX}
                    y={zl.subscript ? pointY - 0.5 : pointY + 1}
                    fill="white"
                    fillOpacity="0.85"
                    fontSize="3.2"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {zl.label}
                  </text>
                  {zl.subscript && (
                    <text
                      x={labelX}
                      y={pointY + 3}
                      fill="white"
                      fillOpacity="0.5"
                      fontSize="2.4"
                      fontFamily="Inter, sans-serif"
                      fontWeight="400"
                    >
                      {zl.subscript}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
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
