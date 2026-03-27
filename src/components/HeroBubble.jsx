const defaultZoneWidths = {
  freeWind: 0.1667,
  hotBubble: 0.4444,
  hii: 0.0556,
  shell: 0.1111,
  cloud: 0.2222,
}

// Labels with fixed vertical spread positions (evenly spaced on the right)
const zoneLabels = [
  { id: 'cloud',     label: 'Cloud',         labelY: 18 },
  { id: 'shell',     label: 'Shell',  sub: 'neu', labelY: 30 },
  { id: 'hii',       label: 'Shell',  sub: 'ion', labelY: 42 },
  { id: 'hotBubble', label: 'Bubble',        labelY: 58 },
  { id: 'freeWind',  label: 'Winds',         labelY: 72 },
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

  // Midpoint radius for each zone (where the tick mark meets the zone)
  const zoneMidR = {
    cloud: scale((shellOuter + cloudOuter) / 2),
    shell: scale((hiiOuter + shellOuter) / 2),
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

  const labelAreaX = 108
  const tickLen = 1.2

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
        <svg viewBox="-10 0 145 100" xmlns="http://www.w3.org/2000/svg">
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

          {/* Zone labels with angled leader lines */}
          <g style={{ opacity: labelOpacity, transition: 'opacity 0.3s ease-out' }}>
            {zoneLabels.map((zl) => {
              const midR = zoneMidR[zl.id]
              // Point on the circle boundary at the label's angle
              const labelY = zl.labelY
              const dy = labelY - 50
              const dx = Math.sqrt(Math.max(0, midR * midR - dy * dy))
              const circleX = 50 + dx
              const circleY = labelY

              return (
                <g key={zl.id}>
                  {/* Tick mark at zone midpoint */}
                  <line
                    x1={circleX - tickLen}
                    y1={circleY}
                    x2={circleX + tickLen}
                    y2={circleY}
                    stroke="white"
                    strokeWidth="0.4"
                    strokeOpacity="0.7"
                  />
                  {/* Horizontal leader line from tick to label area */}
                  <line
                    x1={circleX + tickLen}
                    y1={circleY}
                    x2={labelAreaX - 1}
                    y2={circleY}
                    stroke="white"
                    strokeWidth="0.25"
                    strokeOpacity="0.4"
                    strokeDasharray="1 0.8"
                  />
                  {/* Label text */}
                  <text
                    x={labelAreaX}
                    y={zl.sub ? circleY - 0.3 : circleY + 1.2}
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
                      y={circleY + 3.5}
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
