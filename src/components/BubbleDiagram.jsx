import { useState } from 'react'

const STROKE = '#2A3442'
const CX = 120
const CY = 130
const R_CLOUD = 105
const T_TRANS = 0.5
const T_MOM = 1.2

const LABEL_X = 260
const LEADER_END = 254

const START_FRACS = {
  freeWind: 0.0952, hotBubble: 0.0143, hii: 0.0143, shell: 0.0095, cloud: 0.8667
}
const ENERGY_FRACS = {
  freeWind: 0.1667, hotBubble: 0.4444, hii: 0.0556, shell: 0.1111, cloud: 0.2222
}
const TRANS_FRACS = {
  freeWind: 0.6430, hotBubble: 0.0200, hii: 0.0694, shell: 0.1111, cloud: 0.1565
}
const MOMENTUM_FRACS = {
  freeWind: 0.7037, hotBubble: 0.0111, hii: 0.0833, shell: 0.1111, cloud: 0.0907
}

function lerpFracs(a, b, t) {
  const result = {}
  for (const key of Object.keys(a)) {
    result[key] = a[key] + (b[key] - a[key]) * t
  }
  return result
}

function getRadiiFromFractions(fracs) {
  const R_sh = R_CLOUD * (1 - fracs.cloud)
  const R_if = R_CLOUD * (1 - fracs.cloud - fracs.shell)
  const R_b  = R_CLOUD * (1 - fracs.cloud - fracs.shell - fracs.hii)
  const R_w  = R_CLOUD * fracs.freeWind
  return { R_cloud: R_CLOUD, R_sh, R_if, R_b, R_w }
}

function getRadii(time) {
  let fracs
  if (time <= T_TRANS) {
    const f = Math.min(time / T_TRANS, 1)
    fracs = lerpFracs(START_FRACS, ENERGY_FRACS, f)
  } else if (time <= T_MOM) {
    const f = (time - T_TRANS) / (T_MOM - T_TRANS)
    fracs = lerpFracs(ENERGY_FRACS, TRANS_FRACS, f)
  } else {
    const f = Math.min((time - T_MOM) / (5 - T_MOM), 1)
    fracs = lerpFracs(TRANS_FRACS, MOMENTUM_FRACS, f)
  }
  return getRadiiFromFractions(fracs)
}

function dotXOnCircle(dotY, r) {
  const dy = dotY - CY
  if (Math.abs(dy) >= r) return CX + r * 0.3
  return CX + Math.sqrt(r * r - dy * dy)
}

function Labels({ radii, bubbleOpacity, hoveredZone, groupOpacity }) {
  const showBubble = bubbleOpacity > 0.15
  const showHII = !showBubble
  const ionisedInner = Math.max(radii.R_b, radii.R_w)

  const labelDefs = [
    { key: 'cloud', zone: 'cloud', text: 'CLOUD', sub: null, dotY: 42, labelY: 42, r: (radii.R_cloud + radii.R_sh) / 2 },
    { key: 'shell', zone: 'shell', text: 'SHELL', sub: 'neutral', dotY: 62, labelY: 62, r: (radii.R_sh + radii.R_if) / 2 },
    { key: 'ionised-shell', zone: 'ionised', text: 'SHELL', sub: 'ionised', dotY: 86, labelY: 86, r: (radii.R_if + ionisedInner) / 2 },
    ...(showBubble
      ? [{ key: 'bubble', zone: 'bubble', text: 'BUBBLE', sub: null, dotY: 140, labelY: 140, r: (radii.R_b + radii.R_w) / 2, opacity: bubbleOpacity }]
      : []),
    ...(showHII ? [{ key: 'hii-label', zone: 'ionised', text: 'H\u2009II', sub: null, dotY: 120, labelY: 120, r: (radii.R_if + radii.R_w) / 2 }] : []),
    { key: 'winds', zone: 'winds', text: 'WINDS', sub: null, dotY: CY, labelY: CY, r: (radii.R_w + 8) / 2 },
  ]

  return (
    <g style={{ opacity: groupOpacity, transition: 'opacity 300ms ease' }}>
      {labelDefs.map((l) => {
        const dX = dotXOnCircle(l.dotY, l.r)
        const baseOpacity = l.opacity !== undefined ? Math.min(1, l.opacity * 2) : 1
        const dimmed = hoveredZone && hoveredZone !== l.zone
        const highlighted = hoveredZone === l.zone
        const op = dimmed ? baseOpacity * 0.28 : baseOpacity

        return (
          <g key={l.key} style={{ opacity: op, transition: 'opacity 300ms ease' }}>
            <circle cx={dX} cy={l.dotY} r={highlighted ? 2.2 : 1.5} fill={highlighted ? '#1E2430' : '#97948C'} />
            <line x1={dX + 2} y1={l.dotY} x2={LEADER_END} y2={l.labelY}
              stroke={highlighted ? '#1E2430' : '#97948C'} strokeWidth={highlighted ? 0.9 : 0.5} />
            <text x={LABEL_X} y={l.sub ? l.labelY - 1 : l.labelY}
              fill={highlighted ? '#1E2430' : '#5E6776'} fontSize={10} fontWeight={highlighted ? 600 : 500}
              dominantBaseline="central"
              style={{ fontFamily: 'var(--font-ui)' }}>
              {l.text}
            </text>
            {l.sub && (
              <text x={LABEL_X} y={l.labelY + 12}
                fill={highlighted ? '#5E6776' : '#97948C'} fontSize={8} fontWeight={400} fontStyle="italic"
                dominantBaseline="central"
                style={{ fontFamily: 'var(--font-ui)' }}>
                {l.sub}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

function zoneAtPointer(radii, radius) {
  if (radius > radii.R_cloud) return null
  if (radius >= radii.R_sh) return 'cloud'
  if (radius >= radii.R_if) return 'shell'
  const ionisedInner = Math.max(radii.R_b, radii.R_w)
  if (radius >= ionisedInner) return 'ionised'
  if (radii.R_b > radii.R_w && radius >= radii.R_w) return 'bubble'
  if (radius >= 8) return 'winds'
  return 'winds'
}

export default function BubbleDiagram({ time = 1.0 }) {
  const [hoveredZone, setHoveredZone] = useState(null)

  const radii = getRadii(time)
  const bubbleOpacity = radii.R_b > 5 ? 0.5 * (radii.R_b / 64) : 0
  const labelOpacity = Math.max(0, Math.min(1, (time - T_TRANS) / (T_MOM - T_TRANS)))
  const transition = 'all 300ms ease'
  const isDimmed = (zoneKey) => hoveredZone && hoveredZone !== zoneKey
  const opacityFor = (zoneKey, base = 1) => (isDimmed(zoneKey) ? base * 0.2 : base)
  const strokeWidthFor = (zoneKey, base) => (hoveredZone === zoneKey ? base + 0.6 : base)

  const handlePointerMove = (event) => {
    const svgRect = event.currentTarget.getBoundingClientRect()
    const scaleX = 380 / svgRect.width
    const scaleY = 260 / svgRect.height
    const x = (event.clientX - svgRect.left) * scaleX
    const y = (event.clientY - svgRect.top) * scaleY
    const radius = Math.hypot(x - CX, y - CY)
    setHoveredZone(zoneAtPointer(radii, radius))
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox="0 0 380 260"
        width="100%"
        role="img"
        aria-label="Cross-section diagram of a stellar feedback bubble showing concentric zones: free wind, hot bubble, ionised shell, neutral shell, and cloud"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setHoveredZone(null)}
      >
        {/* Cloud — fixed radius, never changes */}
        <circle cx={CX} cy={CY} r={R_CLOUD}
          stroke={STROKE} strokeWidth={strokeWidthFor('cloud', 0.5)} fill="none" opacity={opacityFor('cloud', 0.25)} />

        {/* Shell outer (R_sh) */}
        <circle cx={CX} cy={CY} r={radii.R_sh}
          stroke={STROKE} strokeWidth={strokeWidthFor('shell', 1.2)} fill="none"
          style={{ transition, opacity: opacityFor('shell', 1) }} />

        {/* Ionisation front (R_if) */}
        <circle cx={CX} cy={CY} r={radii.R_if}
          stroke={STROKE} strokeWidth={strokeWidthFor('ionised', 1)} fill="none"
          strokeDasharray="2 2.5" style={{ transition, opacity: opacityFor('ionised', 1) }} />

        {/* Bubble (R_b) */}
        <circle cx={CX} cy={CY} r={radii.R_b}
          stroke={STROKE} strokeWidth={strokeWidthFor('bubble', 0.6)} fill="none"
          strokeDasharray="3.5 2.5"
          style={{ opacity: opacityFor('bubble', bubbleOpacity), transition }} />

        {/* Free wind outer (R_w) */}
        <circle cx={CX} cy={CY} r={radii.R_w}
          stroke={STROKE} strokeWidth={strokeWidthFor('winds', 0.5)} fill="none"
          style={{ opacity: opacityFor('winds', 0.4), transition }} />

        {/* Central cluster */}
        <circle cx={CX} cy={CY} r={2.5} fill={STROKE} style={{ opacity: opacityFor('winds', 1) }} />
        <circle cx={CX + 3} cy={CY - 3} r={1} fill={STROKE} opacity={opacityFor('winds', 0.5)} />
        <circle cx={CX - 3} cy={CY + 3} r={0.8} fill={STROKE} opacity={opacityFor('winds', 0.4)} />
        <circle cx={CX + 4} cy={CY + 3} r={0.6} fill={STROKE} opacity={opacityFor('winds', 0.3)} />

        {/* Labels */}
        <Labels radii={radii} bubbleOpacity={bubbleOpacity} hoveredZone={hoveredZone} groupOpacity={labelOpacity} />
      </svg>
    </div>
  )
}
