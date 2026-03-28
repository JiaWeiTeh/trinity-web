import { useState } from 'react'
import 'katex/dist/katex.min.css'
import katex from 'katex'

const STROKE = '#2A3442'

const T_TRANS_START = 2.0
const T_MOM_START = 4.0

function lerp(a, b, t) { return a + (b - a) * t }

const ENERGY  = { cloud: 115, shell: 105, ionised: 92, bubble: 76 }
const TRANS   = { cloud: 117, shell: 107, ionised: 94, bubble: 68 }
const MOMENTUM = { cloud: 119, shell: 109, ionised: 96, bubble: 0 }

function getRingRadii(time) {
  if (time <= T_TRANS_START) {
    const frac = Math.max(0, time / T_TRANS_START)
    return {
      cloud:   lerp(110, ENERGY.cloud, frac),
      shell:   lerp(100, ENERGY.shell, frac),
      ionised: lerp(87,  ENERGY.ionised, frac),
      bubble:  lerp(70,  ENERGY.bubble, frac),
    }
  } else if (time <= T_MOM_START) {
    const frac = (time - T_TRANS_START) / (T_MOM_START - T_TRANS_START)
    return {
      cloud:   lerp(ENERGY.cloud,   TRANS.cloud, frac),
      shell:   lerp(ENERGY.shell,   TRANS.shell, frac),
      ionised: lerp(ENERGY.ionised, TRANS.ionised, frac),
      bubble:  lerp(ENERGY.bubble,  TRANS.bubble, frac),
    }
  } else {
    const frac = Math.min((time - T_MOM_START) / (10 - T_MOM_START), 1)
    return {
      cloud:   lerp(TRANS.cloud,   MOMENTUM.cloud, frac),
      shell:   lerp(TRANS.shell,   MOMENTUM.shell, frac),
      ionised: lerp(TRANS.ionised, MOMENTUM.ionised, frac),
      bubble:  lerp(TRANS.bubble,  MOMENTUM.bubble, Math.min(frac * 2, 1)),
    }
  }
}

function getPhase(time) {
  if (time < T_TRANS_START) return 'energy'
  if (time < T_MOM_START) return 'transition'
  return 'momentum'
}

const ZONE_EQUATIONS = {
  winds: {
    title: 'Free wind',
    latex: '\\rho_w(r) = \\frac{\\dot{M}_w}{4\\pi r^2 v_\\infty}',
    source: 'Castor et al. (1975)',
  },
  bubble: {
    title: 'Hot bubble',
    latex: '\\frac{dE_b}{dt} = L_w - L_{\\rm cool} - P_b \\frac{dV_b}{dt}',
    source: 'Weaver et al. (1977)',
  },
  ionised: {
    title: 'Ionised shell',
    latex: '\\frac{d\\phi}{dr} = -\\frac{4\\pi r^2}{Q_i}\\alpha_B n_{\\rm sh}^2 - n_{\\rm sh}\\sigma_d \\phi',
    source: 'Rahner et al. (2017)',
  },
  shell: {
    title: 'Shell dynamics',
    latex: '\\frac{d}{dt}\\left(M_{\\rm sh}\\dot{R}\\right) = 4\\pi R^2 P_{\\rm drive} - \\frac{G M_{\\rm sh} M_{\\rm enc}}{R^2}',
    source: 'Rahner et al. (2017)',
  },
  cloud: {
    title: 'Cloud profile',
    latex: '\\rho_{\\rm cl}(r) = \\rho_0 \\left(\\frac{r}{r_0}\\right)^{-\\alpha_\\rho}',
    source: 'Power-law profile',
  },
}

// Shell hatching lines (decorative, between shell and ionised rings)
function ShellHatching({ shellR, ionisedR }) {
  const midR = (shellR + ionisedR) / 2
  const halfWidth = 4
  const angles = [-35, -15, 5, 25, 155, 175, 195, 215]
  return (
    <g>
      {angles.map((deg) => {
        const rad = (deg * Math.PI) / 180
        const cx = 130 + midR * Math.cos(rad)
        const cy = 130 + midR * Math.sin(rad)
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

// H II region texture lines for momentum phase
function HIITexture({ ionisedR, windsR }) {
  const positions = [0.3, 0.45, 0.6, 0.75]
  return (
    <g>
      {positions.map((p, i) => {
        const r = windsR + (ionisedR - windsR) * p
        const x = 130 + r * 0.15
        return (
          <line key={i}
            x1={x} y1={130 - r * 0.3} x2={x} y2={130 + r * 0.3}
            stroke={STROKE} strokeWidth={0.3} opacity={0.1} strokeDasharray="1 2"
          />
        )
      })}
    </g>
  )
}

function Labels({ radii, bubbleOpacity }) {
  const showBubble = bubbleOpacity > 0.15
  const showHII = !showBubble

  const labels = [
    { key: 'cloud',   text: 'CLOUD',    sub: null,      y: 30,  ringR: radii.cloud },
    { key: 'shell',   text: 'SHELL',    sub: 'neutral', y: 52,  ringR: radii.shell },
    { key: 'ionised', text: 'SHELL',    sub: 'ionised', y: 76,  ringR: radii.ionised },
    ...(showBubble
      ? [{ key: 'bubble', text: 'BUBBLE', sub: null, y: 130, ringR: radii.bubble, opacity: bubbleOpacity }]
      : []),
    ...(showHII
      ? [{ key: 'hii', text: 'H\u2009II', sub: null, y: 120, ringR: (radii.ionised + 46) / 2 }]
      : []),
    { key: 'winds', text: 'WINDS', sub: null, y: 168, ringR: 46 },
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
        const op = l.opacity !== undefined ? Math.min(1, l.opacity * 2) : 1

        return (
          <g key={l.key} style={{ opacity: op, transition: 'opacity 300ms ease' }}>
            <circle cx={dotX} cy={l.y} r={1.5} fill="#97948C" />
            <line x1={dotX + 2} y1={l.y} x2={leaderEnd} y2={l.y}
              stroke="#97948C" strokeWidth={0.5} />
            <text x={textX} y={l.sub ? l.y - 1 : l.y + 3.5}
              fill="#5E6776" fontSize={10} fontWeight={500}
              style={{ fontFamily: 'var(--font-ui)' }}>
              {l.text}
            </text>
            {l.sub && (
              <text x={textX} y={l.y + 9}
                fill="#97948C" fontSize={8} fontWeight={400} fontStyle="italic"
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
  // Midpoint radii for hover targets
  const zones = [
    { key: 'cloud',   r: (radii.cloud + radii.shell) / 2 },
    { key: 'shell',   r: (radii.shell + radii.ionised) / 2 },
    { key: 'ionised', r: (radii.ionised + Math.max(radii.bubble, 46)) / 2 },
    ...(radii.bubble > 10
      ? [{ key: 'bubble', r: (radii.bubble + 46) / 2 }]
      : []),
    { key: 'winds', r: (46 + 16) / 2 },
  ]

  return (
    <g>
      {zones.map((z) => (
        <circle key={z.key} cx={130} cy={130} r={z.r}
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

function EquationTooltip({ zone }) {
  if (!zone || !ZONE_EQUATIONS[zone]) return null
  const eq = ZONE_EQUATIONS[zone]

  let html
  try {
    html = katex.renderToString(eq.latex, { throwOnError: false, displayMode: true })
  } catch {
    html = eq.latex
  }

  return (
    <div style={{
      position: 'absolute',
      left: 12, top: '50%', transform: 'translateY(-50%)',
      background: '#FFFFFF',
      border: '0.5px solid #D3D1C7',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      maxWidth: 240,
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 11, fontWeight: 500,
        color: '#1E2430',
        marginBottom: 6
      }}>
        {eq.title}
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 9, color: '#97948C',
        marginTop: 6
      }}>
        {eq.source}
      </div>
    </div>
  )
}

export default function BubbleDiagram({ time = 1.0 }) {
  const [hoveredZone, setHoveredZone] = useState(null)

  const radii = getRingRadii(time)
  const phase = getPhase(time)
  const bubbleOpacity = radii.bubble > 5 ? 0.5 * (radii.bubble / 76) : 0
  const showHIITexture = phase === 'momentum' || (phase === 'transition' && time > 3.5)
  const transition = 'all 300ms ease'

  const handleZone = (zoneOrFn) => {
    if (typeof zoneOrFn === 'function') {
      setHoveredZone(zoneOrFn)
    } else {
      setHoveredZone(zoneOrFn)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox="0 0 260 260"
        width="100%"
        style={{ maxWidth: 260 }}
        role="img"
        aria-label="Cross-section diagram of a stellar feedback bubble showing concentric zones: free wind, hot bubble, ionised shell, neutral shell, and cloud"
      >
        {/* Rings (outside-in) */}
        <circle cx={130} cy={130} r={radii.cloud} stroke={STROKE} strokeWidth={0.5} fill="none"
          style={{ opacity: 0.25, transition }} />
        <circle cx={130} cy={130} r={radii.shell} stroke={STROKE} strokeWidth={1.2} fill="none"
          style={{ opacity: 1, transition }} />
        <circle cx={130} cy={130} r={radii.ionised} stroke={STROKE} strokeWidth={1.0} fill="none"
          strokeDasharray="2 2.5" style={{ opacity: 1, transition }} />
        <circle cx={130} cy={130} r={radii.bubble} stroke={STROKE} strokeWidth={0.6} fill="none"
          strokeDasharray="3.5 2.5" style={{ opacity: bubbleOpacity, transition }} />
        <circle cx={130} cy={130} r={46} stroke={STROKE} strokeWidth={0.5} fill="none"
          style={{ opacity: 0.4, transition }} />
        <circle cx={130} cy={130} r={16} stroke={STROKE} strokeWidth={0.7} fill="none"
          style={{ opacity: 1, transition }} />

        {/* Shell hatching */}
        <ShellHatching shellR={radii.shell} ionisedR={radii.ionised} />

        {/* H II texture */}
        {showHIITexture && <HIITexture ionisedR={radii.ionised} windsR={46} />}

        {/* Central cluster */}
        <circle cx={130} cy={130} r={2.5} fill={STROKE} />
        <circle cx={133} cy={127} r={1} fill={STROKE} opacity={0.5} />
        <circle cx={127} cy={133} r={0.8} fill={STROKE} opacity={0.4} />
        <circle cx={134} cy={133} r={0.6} fill={STROKE} opacity={0.3} />

        {/* Labels */}
        <Labels radii={radii} bubbleOpacity={bubbleOpacity} />

        {/* Hover regions (on top for pointer events) */}
        <HoverRegions radii={radii} onZone={handleZone} />
      </svg>

      {/* Equation tooltip (HTML, outside SVG) */}
      <EquationTooltip zone={hoveredZone} />
    </div>
  )
}
