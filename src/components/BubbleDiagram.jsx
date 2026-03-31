import { useState } from 'react'

const STROKE = '#2A3442'
const CX = 120
const CY = 130
const R_CLOUD = 105
const T_TRANS = 2.0
const T_MOM = 4.0

const LABEL_X = 260
const LEADER_END = 254

const ENERGY_FRACS = {
  freeWind: 0.1667, hotBubble: 0.4444, hii: 0.0556, shell: 0.1111, cloud: 0.2222
}
const TRANS_FRACS = {
  freeWind: 0.4352, hotBubble: 0.2278, hii: 0.0694, shell: 0.1111, cloud: 0.1565
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
    fracs = ENERGY_FRACS
  } else if (time <= T_MOM) {
    const f = (time - T_TRANS) / (T_MOM - T_TRANS)
    fracs = lerpFracs(ENERGY_FRACS, TRANS_FRACS, f)
  } else {
    const f = Math.min((time - T_MOM) / (10 - T_MOM), 1)
    fracs = lerpFracs(TRANS_FRACS, MOMENTUM_FRACS, f)
  }
  return getRadiiFromFractions(fracs)
}

function ShellHatching({ shellR, ionisedR }) {
  const midR = (shellR + ionisedR) / 2
  const halfWidth = 4
  const angles = [-35, -15, 5, 25, 155, 175, 195, 215]
  return (
    <g>
      {angles.map((deg) => {
        const rad = (deg * Math.PI) / 180
        const cx = CX + midR * Math.cos(rad)
        const cy = CY + midR * Math.sin(rad)
        return (
          <line key={deg}
            x1={cx - halfWidth} y1={cy} x2={cx + halfWidth} y2={cy}
            stroke={STROKE} strokeWidth={0.3} opacity={0.13}
          />
        )
      })}
    </g>
  )
}

function HIITexture({ ionisedR, windsR }) {
  const positions = [0.3, 0.45, 0.6, 0.75]
  return (
    <g>
      {positions.map((p, i) => {
        const r = windsR + (ionisedR - windsR) * p
        const x = CX + r * 0.15
        return (
          <line key={i}
            x1={x} y1={CY - r * 0.3} x2={x} y2={CY + r * 0.3}
            stroke={STROKE} strokeWidth={0.3} opacity={0.1} strokeDasharray="1 2"
          />
        )
      })}
    </g>
  )
}

function dotXOnCircle(dotY, r) {
  const dy = dotY - CY
  if (Math.abs(dy) >= r) return CX + r * 0.3
  return CX + Math.sqrt(r * r - dy * dy)
}

function Labels({ radii, bubbleOpacity }) {
  const showBubble = bubbleOpacity > 0.15
  const showHII = !showBubble

  const labelDefs = [
    { key: 'cloud',   text: 'CLOUD',    sub: null,      dotY: 42,  labelY: 42,  r: radii.R_cloud },
    { key: 'shell',   text: 'SHELL',    sub: 'neutral', dotY: 62,  labelY: 62,  r: radii.R_sh },
    { key: 'ionised', text: 'SHELL',    sub: 'ionised', dotY: 86,  labelY: 86,  r: radii.R_if },
    ...(showBubble
      ? [{ key: 'bubble', text: 'BUBBLE', sub: null, dotY: 140, labelY: 140, r: radii.R_b, opacity: bubbleOpacity }]
      : []),
    ...(showHII
      ? [{ key: 'hii', text: 'H\u2009II', sub: null, dotY: 120, labelY: 120, r: (radii.R_if + radii.R_w) / 2 }]
      : []),
    { key: 'winds', text: 'WINDS', sub: null, dotY: CY, labelY: CY, r: radii.R_w },
  ]

  return (
    <g>
      {labelDefs.map((l) => {
        const dX = dotXOnCircle(l.dotY, l.r)
        const op = l.opacity !== undefined ? Math.min(1, l.opacity * 2) : 1

        return (
          <g key={l.key} style={{ opacity: op, transition: 'opacity 300ms ease' }}>
            <circle cx={dX} cy={l.dotY} r={1.5} fill="#97948C" />
            <line x1={dX + 2} y1={l.dotY} x2={LEADER_END} y2={l.labelY}
              stroke="#97948C" strokeWidth={0.5} />
            <text x={LABEL_X} y={l.sub ? l.labelY - 1 : l.labelY}
              fill="#5E6776" fontSize={10} fontWeight={500}
              dominantBaseline="central"
              style={{ fontFamily: 'var(--font-ui)' }}>
              {l.text}
            </text>
            {l.sub && (
              <text x={LABEL_X} y={l.labelY + 12}
                fill="#97948C" fontSize={8} fontWeight={400} fontStyle="italic"
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

function HoverRegions({ radii, onZone }) {
  const zones = [
    { key: 'cloud',   r: (radii.R_cloud + radii.R_sh) / 2 },
    { key: 'shell',   r: (radii.R_sh + radii.R_if) / 2 },
    { key: 'ionised', r: (radii.R_if + Math.max(radii.R_b, radii.R_w)) / 2 },
    ...(radii.R_b > 5
      ? [{ key: 'bubble', r: (radii.R_b + radii.R_w) / 2 }]
      : []),
    { key: 'winds', r: (radii.R_w + 8) / 2 },
  ]

  return (
    <g>
      {zones.map((z) => (
        <circle key={z.key} cx={CX} cy={CY} r={z.r}
          fill="transparent" stroke="none"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onZone(z.key)}
          onMouseLeave={() => onZone(null)}
          onClick={() => onZone(prev => prev === z.key ? null : z.key)}
        />
      ))}
    </g>
  )
}

export default function BubbleDiagram({ time = 1.0 }) {
  const [hoveredZone, setHoveredZone] = useState(null)

  const radii = getRadii(time)
  const bubbleOpacity = radii.R_b > 5 ? 0.5 * (radii.R_b / 64) : 0
  const showHIITexture = time > 3.5
  const transition = 'all 300ms ease'
  const isDimmed = (zoneKey) => hoveredZone && hoveredZone !== zoneKey
  const opacityFor = (zoneKey, base = 1) => (isDimmed(zoneKey) ? base * 0.2 : base)
  const strokeWidthFor = (zoneKey, base) => (hoveredZone === zoneKey ? base + 0.6 : base)

  const handleZone = (zoneOrFn) => {
    setHoveredZone(zoneOrFn)
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox="0 0 380 260"
        width="100%"
        role="img"
        aria-label="Cross-section diagram of a stellar feedback bubble showing concentric zones: free wind, hot bubble, ionised shell, neutral shell, and cloud"
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

        {/* Cluster boundary */}
        <circle cx={CX} cy={CY} r={8}
          stroke={STROKE} strokeWidth={0.7} fill="none" style={{ opacity: opacityFor('winds', 1) }} />

        {/* Shell hatching */}
        <g style={{ opacity: opacityFor('shell', 1), transition: 'opacity 200ms ease' }}>
          <ShellHatching shellR={radii.R_sh} ionisedR={radii.R_if} />
        </g>

        {/* H II texture */}
        {showHIITexture && (
          <g style={{ opacity: opacityFor('ionised', 1), transition: 'opacity 200ms ease' }}>
            <HIITexture ionisedR={radii.R_if} windsR={radii.R_w} />
          </g>
        )}

        {/* Central cluster */}
        <circle cx={CX} cy={CY} r={2.5} fill={STROKE} style={{ opacity: opacityFor('winds', 1) }} />
        <circle cx={CX + 3} cy={CY - 3} r={1} fill={STROKE} opacity={opacityFor('winds', 0.5)} />
        <circle cx={CX - 3} cy={CY + 3} r={0.8} fill={STROKE} opacity={opacityFor('winds', 0.4)} />
        <circle cx={CX + 4} cy={CY + 3} r={0.6} fill={STROKE} opacity={opacityFor('winds', 0.3)} />

        {/* Labels */}
        <Labels radii={radii} bubbleOpacity={bubbleOpacity} />

        {/* Hover regions */}
        <HoverRegions radii={radii} onZone={handleZone} />
      </svg>
    </div>
  )
}
