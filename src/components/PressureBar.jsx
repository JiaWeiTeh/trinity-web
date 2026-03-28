const PRESSURE_DATA = [
  { t: 0.0,  winds: 0.55, phii: 0.10, prad: 0.15, sn: 0.00, gravity: 0.20 },
  { t: 0.5,  winds: 0.45, phii: 0.15, prad: 0.18, sn: 0.00, gravity: 0.22 },
  { t: 1.0,  winds: 0.35, phii: 0.22, prad: 0.20, sn: 0.00, gravity: 0.23 },
  { t: 2.0,  winds: 0.20, phii: 0.30, prad: 0.22, sn: 0.02, gravity: 0.26 },
  { t: 3.0,  winds: 0.12, phii: 0.35, prad: 0.18, sn: 0.08, gravity: 0.27 },
  { t: 4.0,  winds: 0.08, phii: 0.38, prad: 0.14, sn: 0.12, gravity: 0.28 },
  { t: 5.0,  winds: 0.05, phii: 0.35, prad: 0.10, sn: 0.20, gravity: 0.30 },
  { t: 7.0,  winds: 0.03, phii: 0.30, prad: 0.07, sn: 0.25, gravity: 0.35 },
  { t: 10.0, winds: 0.02, phii: 0.25, prad: 0.05, sn: 0.28, gravity: 0.40 },
]

const CHANNELS = [
  { key: 'gravity', colour: '#3A3A4A', label: 'Gravity' },
  { key: 'winds',   colour: '#5B8FC9', label: 'Winds' },
  { key: 'sn',      colour: '#F59E0B', label: 'SNe' },
  { key: 'phii',    colour: '#E85D4A', label: 'P_HII' },
  { key: 'prad',    colour: '#0EA5C8', label: 'P_rad' },
]

const KEYS = ['winds', 'phii', 'prad', 'sn', 'gravity']

function interpolatePressure(t) {
  const data = PRESSURE_DATA
  if (t <= data[0].t) return data[0]
  if (t >= data[data.length - 1].t) return data[data.length - 1]

  let i = 0
  while (i < data.length - 1 && data[i + 1].t < t) i++

  const lo = data[i], hi = data[i + 1]
  const frac = (t - lo.t) / (hi.t - lo.t)

  const result = {}
  for (const key of KEYS) {
    result[key] = lo[key] + (hi[key] - lo[key]) * frac
  }

  const total = KEYS.reduce((s, k) => s + result[k], 0)
  for (const key of KEYS) result[key] /= total

  return result
}

export default function PressureBar({ time }) {
  const fracs = interpolatePressure(time)

  return (
    <div>
      <div style={{
        display: 'flex', height: 10, borderRadius: 5,
        overflow: 'hidden', border: '0.5px solid #D3D1C7'
      }}>
        {CHANNELS.map(ch => (
          <div
            key={ch.key}
            style={{
              flex: fracs[ch.key],
              background: ch.colour,
              transition: 'flex 300ms ease',
              minWidth: fracs[ch.key] > 0.02 ? 2 : 0,
            }}
          />
        ))}
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px 12px',
        marginTop: 6,
        fontFamily: 'var(--font-ui)', fontSize: 10, color: '#97948C'
      }}>
        {CHANNELS.map(ch => (
          <span key={ch.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: ch.colour, display: 'inline-block'
            }} />
            {ch.label}
          </span>
        ))}
      </div>
    </div>
  )
}
