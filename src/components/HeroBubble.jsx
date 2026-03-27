const defaultZoneWidths = {
  freeWind: 0.1667,
  hotBubble: 0.4444,
  hii: 0.0556,
  shell: 0.1111,
  cloud: 0.2222,
}

// Labels point to zone boundaries, spread vertically for readability
// Each label points to the OUTER boundary of the named zone
const zoneLabels = [
  { id: 'cloud',     boundary: 'cloudOuter',     label: 'Cloud',  labelY: 15 },
  { id: 'shell',     boundary: 'shellOuter',     label: 'Shell',  sub: 'neu', labelY: 29 },
  { id: 'hii',       boundary: 'hiiOuter',       label: 'Shell',  sub: 'ion', labelY: 43 },
  { id: 'hotBubble', boundary: 'hotBubbleOuter', label: 'Bubble', labelY: 60 },
  { id: 'freeWind',  boundary: 'freeWindOuter',  label: 'Winds',  labelY: 74 },
]

export default function HeroBubble({
  zoneWidths = defaultZoneWidths,
  breathing = true,
  chevronOpacity = 1,
  titleOpacity = 1,
  labelOpacity = 0,
  dispersalProgress = 0,
  children,
}) {
  const w = { ...defaultZoneWidths, ...zoneWidths }

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

  const total = cloudOuter
  const scale = (frac) => (frac / total) * R

  // Boundary radii for label positioning
  const boundaries = {
    cloudOuter: scale(cloudOuter),
    shellOuter: scale(shellOuter),
    hiiOuter: scale(hiiOuter),
    hotBubbleOuter: scale(hotBubbleOuter),
    freeWindOuter: scale(freeWindOuter),
  }

  const zones = [
    { id: 'cloud', outer: scale(cloudOuter), fill: 'url(#cloudGradient)' },
    { id: 'shell', outer: scale(shellOuter), fill: '#8B4D5C' },
    { id: 'hii', outer: scale(hiiOuter), fill: '#C4929B' },
    { id: 'hotBubble', outer: scale(hotBubbleOuter), fill: '#B4CEE8' },
    { id: 'freeWind', outer: scale(freeWindOuter), fill: '#2A3A4E' },
  ]

  const labelAreaX = 110
  const tickLen = 1.0

  // Dispersal: scale up and fade out
  const dispersalScale = 1 + dispersalProgress * 2.5
  const dispersalOpacity = 1 - dispersalProgress

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
        style={{
          animationPlayState: breathing ? 'running' : 'paused',
          transform: `scale(${dispersalScale})`,
          opacity: dispersalOpacity,
          willChange: 'transform, opacity',
          transition: dispersalProgress > 0 ? 'none' : undefined,
        }}
      >
        <svg viewBox="-10 0 145 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cross-section of a stellar feedback bubble showing concentric zones: free wind, hot bubble, ionised shell, neutral shell, and ambient cloud">
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

          {/* Star cluster at center */}
          <g transform="translate(50,50)">
            {/* Central stars — small 4-pointed sparkles */}
            {[
              { x: 0, y: 0, s: 1.8 },
              { x: -2.5, y: -1.8, s: 1.2 },
              { x: 2.2, y: -2.0, s: 1.0 },
              { x: -1.0, y: 2.2, s: 1.1 },
              { x: 2.8, y: 1.5, s: 0.8 },
            ].map((star, i) => (
              <g key={i} transform={`translate(${star.x},${star.y})`}>
                <path
                  d={`M0,${-star.s} L${star.s * 0.25},${-star.s * 0.25} L${star.s},0 L${star.s * 0.25},${star.s * 0.25} L0,${star.s} L${-star.s * 0.25},${star.s * 0.25} L${-star.s},0 L${-star.s * 0.25},${-star.s * 0.25}Z`}
                  fill="#F5E6C8"
                  fillOpacity="0.9"
                />
              </g>
            ))}
          </g>

          {/* Zone labels with leader lines to actual boundaries */}
          <g style={{ opacity: labelOpacity, transition: 'opacity 0.3s ease-out' }}>
            {zoneLabels.map((zl) => {
              const boundaryR = boundaries[zl.boundary]
              const labelY = zl.labelY
              // Find intersection of boundary circle with the horizontal line at labelY
              const dy = labelY - 50
              const rSq = boundaryR * boundaryR
              const dySq = dy * dy
              // If the horizontal line intersects the circle
              const intersects = rSq > dySq
              const circleX = intersects ? 50 + Math.sqrt(rSq - dySq) : 50 + boundaryR * 0.3

              return (
                <g key={zl.id}>
                  {/* Small dot at boundary intersection */}
                  <circle
                    cx={circleX}
                    cy={labelY}
                    r="0.6"
                    fill="white"
                    fillOpacity="0.7"
                  />
                  {/* Leader line from boundary to label */}
                  <line
                    x1={circleX + tickLen}
                    y1={labelY}
                    x2={labelAreaX - 1}
                    y2={labelY}
                    stroke="white"
                    strokeWidth="0.25"
                    strokeOpacity="0.35"
                  />
                  {/* Label text */}
                  <text
                    x={labelAreaX}
                    y={zl.sub ? labelY - 0.3 : labelY + 1.2}
                    fill="white"
                    fillOpacity="0.9"
                    fontSize="3.5"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {zl.label}
                  </text>
                  {zl.sub && (
                    <text
                      x={labelAreaX}
                      y={labelY + 3.5}
                      fill="white"
                      fillOpacity="0.5"
                      fontSize="2.6"
                      fontFamily="Inter, sans-serif"
                      fontWeight="400"
                      fontStyle="italic"
                    >
                      {zl.sub}
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

      {/* Bright flash overlay during dispersal */}
      {dispersalProgress > 0.6 && (
        <div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(255,255,255,${(dispersalProgress - 0.6) * 0.6}) 0%, transparent 70%)`,
          }}
        />
      )}

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
