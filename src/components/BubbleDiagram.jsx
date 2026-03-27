const STROKE = '#2A3442'

const ringData = {
  energy: {
    cloud:    { r: 115, sw: 0.5, opacity: 0.25, dash: 'none' },
    shell:    { r: 105, sw: 1.2, opacity: 1,    dash: 'none' },
    ionised:  { r: 92,  sw: 1.0, opacity: 1,    dash: '2 2.5' },
    bubble:   { r: 76,  sw: 0.6, opacity: 0.5,  dash: '3.5 2.5' },
    winds:    { r: 46,  sw: 0.5, opacity: 0.4,  dash: 'none' },
    cluster:  { r: 16,  sw: 0.7, opacity: 1,    dash: 'none' },
  },
  transition: {
    cloud:    { r: 117, sw: 0.5, opacity: 0.25, dash: 'none' },
    shell:    { r: 107, sw: 1.2, opacity: 1,    dash: 'none' },
    ionised:  { r: 94,  sw: 1.0, opacity: 1,    dash: '2 2.5' },
    bubble:   { r: 68,  sw: 0.6, opacity: 0.25, dash: '3.5 2.5' },
    winds:    { r: 46,  sw: 0.5, opacity: 0.4,  dash: 'none' },
    cluster:  { r: 16,  sw: 0.7, opacity: 1,    dash: 'none' },
  },
  momentum: {
    cloud:    { r: 118, sw: 0.5, opacity: 0.25, dash: 'none' },
    shell:    { r: 108, sw: 1.2, opacity: 1,    dash: 'none' },
    ionised:  { r: 96,  sw: 1.0, opacity: 1,    dash: '2 2.5' },
    bubble:   { r: 0,   sw: 0.6, opacity: 0,    dash: '3.5 2.5' },
    winds:    { r: 46,  sw: 0.5, opacity: 0.4,  dash: 'none' },
    cluster:  { r: 16,  sw: 0.7, opacity: 1,    dash: 'none' },
  },
}

// Shell hatching lines (decorative, between shell and ionised rings)
function ShellHatching({ shellR, ionisedR }) {
  const midR = (shellR + ionisedR) / 2
  const halfWidth = 4
  const lines = []
  const angles = [-35, -15, 5, 25, 155, 175, 195, 215]
  for (const deg of angles) {
    const rad = (deg * Math.PI) / 180
    const cx = 130 + midR * Math.cos(rad)
    const cy = 130 + midR * Math.sin(rad)
    lines.push(
      <line
        key={deg}
        x1={cx - halfWidth}
        y1={cy}
        x2={cx + halfWidth}
        y2={cy}
        stroke={STROKE}
        strokeWidth={0.3}
        opacity={0.13}
      />
    )
  }
  return <g>{lines}</g>
}

// H II region texture lines for momentum phase
function HIITexture({ ionisedR, windsR }) {
  const lines = []
  const positions = [0.3, 0.45, 0.6, 0.75]
  for (let i = 0; i < positions.length; i++) {
    const r = windsR + (ionisedR - windsR) * positions[i]
    const x = 130 + r * 0.15
    lines.push(
      <line
        key={i}
        x1={x}
        y1={130 - r * 0.3}
        x2={x}
        y2={130 + r * 0.3}
        stroke={STROKE}
        strokeWidth={0.3}
        opacity={0.1}
        strokeDasharray="1 2"
      />
    )
  }
  return <g>{lines}</g>
}

function Labels({ phase, rings }) {
  const showBubble = phase !== 'momentum'

  const labels = [
    { key: 'cloud',   text: 'CLOUD',  sub: null,      y: 30,  ringR: rings.cloud.r },
    { key: 'shell',   text: 'SHELL',  sub: 'neutral',  y: 52,  ringR: rings.shell.r },
    { key: 'ionised', text: 'SHELL',  sub: 'ionised',  y: 76,  ringR: rings.ionised.r },
    ...(showBubble
      ? [{ key: 'bubble', text: 'BUBBLE', sub: null, y: 130, ringR: rings.bubble.r }]
      : [{ key: 'hii',    text: 'H\u2009II', sub: null, y: 120, ringR: (rings.ionised.r + rings.winds.r) / 2 }]
    ),
    { key: 'winds',   text: 'WINDS',  sub: null,       y: 168, ringR: rings.winds.r },
  ]

  const leaderEnd = 200
  const textX = 204

  return (
    <g>
      {labels.map((l) => {
        const dy = l.y - 130
        const rSq = l.ringR * l.ringR
        const intersects = rSq > dy * dy
        const dotX = intersects ? 130 + Math.sqrt(rSq - dy * dy) : 130 + l.ringR * 0.3

        return (
          <g key={l.key} style={{ transition: 'opacity 300ms ease' }}>
            <circle cx={dotX} cy={l.y} r={1.5} fill="#97948C" />
            <line
              x1={dotX + 2}
              y1={l.y}
              x2={leaderEnd}
              y2={l.y}
              stroke="#97948C"
              strokeWidth={0.5}
            />
            <text
              x={textX}
              y={l.sub ? l.y - 1 : l.y + 3.5}
              fill="#5E6776"
              fontSize={10}
              fontWeight={500}
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {l.text}
            </text>
            {l.sub && (
              <text
                x={textX}
                y={l.y + 9}
                fill="#97948C"
                fontSize={8}
                fontWeight={400}
                fontStyle="italic"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {l.sub}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

export default function BubbleDiagram({ phase = 'energy' }) {
  const rings = ringData[phase]
  const transition = 'all 300ms ease'

  return (
    <svg
      viewBox="0 0 260 260"
      width="100%"
      style={{ maxWidth: 260 }}
      role="img"
      aria-label="Cross-section diagram of a stellar feedback bubble showing concentric zones: free wind, hot bubble, ionised shell, neutral shell, and cloud"
    >
      {/* Rings (outside-in) */}
      <circle cx={130} cy={130} r={rings.cloud.r} stroke={STROKE} strokeWidth={rings.cloud.sw} fill="none" style={{ opacity: rings.cloud.opacity, transition }} />
      <circle cx={130} cy={130} r={rings.shell.r} stroke={STROKE} strokeWidth={rings.shell.sw} fill="none" style={{ opacity: rings.shell.opacity, transition }} />
      <circle cx={130} cy={130} r={rings.ionised.r} stroke={STROKE} strokeWidth={rings.ionised.sw} fill="none" strokeDasharray={rings.ionised.dash} style={{ opacity: rings.ionised.opacity, transition }} />
      <circle cx={130} cy={130} r={rings.bubble.r} stroke={STROKE} strokeWidth={rings.bubble.sw} fill="none" strokeDasharray={rings.bubble.dash} style={{ opacity: rings.bubble.opacity, transition }} />
      <circle cx={130} cy={130} r={rings.winds.r} stroke={STROKE} strokeWidth={rings.winds.sw} fill="none" style={{ opacity: rings.winds.opacity, transition }} />
      <circle cx={130} cy={130} r={rings.cluster.r} stroke={STROKE} strokeWidth={rings.cluster.sw} fill="none" style={{ opacity: rings.cluster.opacity, transition }} />

      {/* Shell hatching */}
      <ShellHatching shellR={rings.shell.r} ionisedR={rings.ionised.r} />

      {/* H II texture in momentum phase */}
      {phase === 'momentum' && <HIITexture ionisedR={rings.ionised.r} windsR={rings.winds.r} />}

      {/* Central cluster */}
      <circle cx={130} cy={130} r={2.5} fill={STROKE} />
      <circle cx={133} cy={127} r={1} fill={STROKE} opacity={0.5} />
      <circle cx={127} cy={133} r={0.8} fill={STROKE} opacity={0.4} />
      <circle cx={134} cy={133} r={0.6} fill={STROKE} opacity={0.3} />

      {/* Labels with leader lines */}
      <Labels phase={phase} rings={rings} />
    </svg>
  )
}
