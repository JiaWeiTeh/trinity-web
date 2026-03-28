import { useState, useRef, useCallback } from 'react'

function ComparisonSchematic() {
  const W = 620
  const H = 500
  const CX = 210
  const CY = H / 2

  const R_cloud = 190
  const R_sh = 158
  const R_if = 140
  const R_b = 108
  const R_w = 36

  const STROKE = '#2A3442'

  const labelDefs = [
    { label: 'CLOUD', sub: null, y: CY - R_cloud + 20, r: R_cloud },
    { label: 'SHELL', sub: 'neutral', y: CY - R_sh + 15, r: R_sh },
    { label: 'SHELL', sub: 'ionised', y: CY - R_if + 15, r: R_if },
    { label: 'BUBBLE', sub: null, y: CY, r: R_b },
    { label: 'WINDS', sub: null, y: CY, r: R_w },
  ]

  const labelX = CX + R_cloud + 24

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ position: 'absolute', inset: 0 }}>

      {/* Cloud boundary */}
      <circle cx={CX} cy={CY} r={R_cloud}
        fill="none" stroke={STROKE} strokeWidth={0.8} opacity={0.2} />

      {/* Shell outer */}
      <circle cx={CX} cy={CY} r={R_sh}
        fill="none" stroke={STROKE} strokeWidth={1.5} />

      {/* Shell hatching */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const midR = (R_sh + R_if) / 2
        const x1 = CX + Math.cos(angle) * (midR - 6)
        const y1 = CY + Math.sin(angle) * (midR - 6)
        const x2 = CX + Math.cos(angle) * (midR + 6)
        const y2 = CY + Math.sin(angle) * (midR + 6)
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={STROKE} strokeWidth={0.4} opacity={0.12} />
        )
      })}

      {/* Ionisation front */}
      <circle cx={CX} cy={CY} r={R_if}
        fill="none" stroke={STROKE} strokeWidth={1.2}
        strokeDasharray="3 3" />

      {/* Bubble boundary */}
      <circle cx={CX} cy={CY} r={R_b}
        fill="none" stroke={STROKE} strokeWidth={0.8}
        strokeDasharray="5 3.5" opacity={0.5} />

      {/* Free wind boundary */}
      <circle cx={CX} cy={CY} r={R_w}
        fill="none" stroke={STROKE} strokeWidth={0.5} opacity={0.35} />

      {/* Central cluster */}
      <circle cx={CX} cy={CY} r={4} fill={STROKE} />
      <circle cx={CX - 5} cy={CY - 4} r={1.5} fill={STROKE} opacity={0.5} />
      <circle cx={CX + 4} cy={CY - 3} r={1.2} fill={STROKE} opacity={0.4} />
      <circle cx={CX + 2} cy={CY + 5} r={1} fill={STROKE} opacity={0.3} />

      {/* Labels */}
      {labelDefs.map((item, i) => {
        const dy = item.y - CY
        const rSq = item.r * item.r
        const dotX = rSq > dy * dy ? CX + Math.sqrt(rSq - dy * dy) : CX + item.r * 0.3
        return (
          <g key={i}>
            <circle cx={dotX} cy={item.y} r={2} fill="#97948C" />
            <line x1={dotX} y1={item.y} x2={labelX - 6} y2={item.y}
              stroke="#97948C" strokeWidth={0.5} />
            <text x={labelX} y={item.y}
              fontFamily="var(--font-ui)" fontSize={11} fontWeight={500}
              fill="#5E6776" dominantBaseline="central">
              {item.label}
            </text>
            {item.sub && (
              <text x={labelX} y={item.y + 13}
                fontFamily="var(--font-ui)" fontSize={9} fontStyle="italic"
                fill="#97948C" dominantBaseline="central">
                {item.sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function ComparisonSlider() {
  const containerRef = useRef(null)
  const [fraction, setFraction] = useState(0.5)
  const dragging = useRef(false)

  const handlePointerDown = useCallback((e) => {
    dragging.current = true
    e.target.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    setFraction(Math.max(0.05, Math.min(0.95, x / rect.width)))
  }, [])

  const handlePointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const pct = fraction * 100

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 8,
        overflow: 'hidden',
        border: '0.5px solid #D3D1C7',
        cursor: 'col-resize',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Layer 1: Observation image (full, underneath) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#1a0a14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={import.meta.env.BASE_URL + 'rosette.jpg'}
          alt="Rosette Nebula (NGC 2244) — DECam / NOIRLab"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          draggable={false}
          onError={(e) => { e.target.style.display = 'none' }}
        />
        {/* Placeholder text shown when image is missing */}
        <span style={{
          position: 'absolute',
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          color: 'rgba(255,255,255,0.3)',
          pointerEvents: 'none',
        }}>
          Image: Rosette Nebula (NGC 2244)
        </span>
      </div>

      {/* Layer 2: Schematic (clipped from the right) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 0 0 ${pct}%)`,
          background: '#F7F6F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ComparisonSchematic />
      </div>

      {/* Divider line */}
      <div
        onPointerDown={handlePointerDown}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${pct}%`,
          width: 3,
          background: '#FFFFFF',
          boxShadow: '0 0 6px rgba(0,0,0,0.3)',
          cursor: 'col-resize',
          zIndex: 5,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Grab handle */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <path d="M4.5 3L1.5 7L4.5 11" stroke="#5E6776" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 3L12.5 7L9.5 11" stroke="#5E6776" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Side labels */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
        color: '#FFFFFF', background: 'rgba(0,0,0,0.45)',
        padding: '3px 8px', borderRadius: 4,
        pointerEvents: 'none',
        opacity: fraction > 0.15 ? 1 : 0,
        transition: 'opacity 200ms',
      }}>
        NGC 2244 — Rosette Nebula
      </div>

      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
        color: '#5E6776', background: 'rgba(247,246,242,0.85)',
        padding: '3px 8px', borderRadius: 4,
        pointerEvents: 'none',
        opacity: fraction < 0.85 ? 1 : 0,
        transition: 'opacity 200ms',
      }}>
        TRINITY model
      </div>
    </div>
  )
}
