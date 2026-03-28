function shellRadius(t) {
  if (t <= 0) return 0

  const T_TRANS = 2.0
  const T_MOM = 4.0

  if (t <= T_TRANS) {
    return 12 * Math.pow(t / T_TRANS, 0.6)
  } else if (t <= T_MOM) {
    const R_trans = 12
    const frac = (t - T_TRANS) / (T_MOM - T_TRANS)
    return R_trans + 5 * Math.pow(frac, 0.5)
  } else {
    const R_mom = 17
    const frac = (t - T_MOM) / (10 - T_MOM)
    return R_mom + 8 * Math.pow(frac, 0.35)
  }
}

export default function Sparkline({ time }) {
  const W = 260, H = 56, PAD_X = 28, PAD_Y = 8
  const plotW = W - 2 * PAD_X, plotH = H - 2 * PAD_Y

  const N = 100
  const maxR = shellRadius(10)
  const points = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 10
    const r = shellRadius(t)
    const x = PAD_X + (t / 10) * plotW
    const y = PAD_Y + plotH - (r / maxR) * plotH
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  const pathD = points.join(' ')

  const cursorX = PAD_X + (time / 10) * plotW
  const cursorR = shellRadius(time)
  const cursorY = PAD_Y + plotH - (cursorR / maxR) * plotH

  const x2 = PAD_X + (2 / 10) * plotW
  const x4 = PAD_X + (4 / 10) * plotW

  // Keep readout label inside SVG bounds
  const labelRight = cursorX + 8 + 40 > W
  const labelX = labelRight ? cursorX - 8 : cursorX + 8
  const labelAnchor = labelRight ? 'end' : 'start'

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Phase boundary dashes */}
      <line x1={x2} y1={PAD_Y} x2={x2} y2={H - PAD_Y}
        stroke="#D3D1C7" strokeWidth={0.5} strokeDasharray="2 2" />
      <line x1={x4} y1={PAD_Y} x2={x4} y2={H - PAD_Y}
        stroke="#D3D1C7" strokeWidth={0.5} strokeDasharray="2 2" />

      {/* R(t) curve */}
      <path d={pathD} fill="none" stroke="#2A3442" strokeWidth={1.2} />

      {/* Cursor dot */}
      <circle cx={cursorX} cy={cursorY} r={3.5}
        fill="#0EA5C8" stroke="#F7F6F2" strokeWidth={1.5} />

      {/* Y-axis label */}
      <text x={4} y={H / 2}
        fontFamily="var(--font-ui)" fontSize={8} fill="#97948C"
        textAnchor="middle" dominantBaseline="central"
        transform={`rotate(-90, 4, ${H / 2})`}>
        R (pc)
      </text>

      {/* Readout */}
      <text x={labelX} y={cursorY - 6}
        fontFamily="var(--font-ui)" fontSize={9} fill="#5E6776"
        textAnchor={labelAnchor}>
        {cursorR.toFixed(0)} pc
      </text>
    </svg>
  )
}
