import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts'
import gridData from '../data/feedbackGrid.json'

const LOG_M_VALUES = [4, 4.5, 5, 5.5, 6, 6.5, 7]
const SFE_VALUES = [5, 10, 15, 20, 25, 30]
const DATA_KEYS = ['winds', 'sn', 'phii', 'prad', 'gravity']

function findEntry(logM, sfe) {
  return gridData.grid.find(
    (e) => Math.abs(e.logM - logM) < 0.01 && e.sfe === sfe
  )
}

function lerpArraysPair(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t)
}

function interpolateData(logM, sfe) {
  const clampedLogM = Math.max(LOG_M_VALUES[0], Math.min(LOG_M_VALUES[LOG_M_VALUES.length - 1], logM))
  const clampedSfe = Math.max(SFE_VALUES[0], Math.min(SFE_VALUES[SFE_VALUES.length - 1], sfe))

  let li = 0
  for (let i = 0; i < LOG_M_VALUES.length - 1; i++) {
    if (clampedLogM >= LOG_M_VALUES[i]) li = i
  }
  let si = 0
  for (let i = 0; i < SFE_VALUES.length - 1; i++) {
    if (clampedSfe >= SFE_VALUES[i]) si = i
  }

  const l0 = LOG_M_VALUES[li]
  const l1 = LOG_M_VALUES[Math.min(li + 1, LOG_M_VALUES.length - 1)]
  const s0 = SFE_VALUES[si]
  const s1 = SFE_VALUES[Math.min(si + 1, SFE_VALUES.length - 1)]

  const tl = l1 !== l0 ? (clampedLogM - l0) / (l1 - l0) : 0
  const ts = s1 !== s0 ? (clampedSfe - s0) / (s1 - s0) : 0

  const e00 = findEntry(l0, s0)
  const e10 = findEntry(l1, s0)
  const e01 = findEntry(l0, s1)
  const e11 = findEntry(l1, s1)

  if (!e00 || !e10 || !e01 || !e11) return null

  const result = { time: e00.time }

  for (const key of DATA_KEYS) {
    const top = lerpArraysPair(e00[key], e10[key], tl)
    const bot = lerpArraysPair(e01[key], e11[key], tl)
    result[key] = lerpArraysPair(top, bot, ts)
  }

  // Normalize: ensure all channels sum to exactly 1.0 at each time step
  // (bilinear interpolation can introduce floating-point drift)
  for (let i = 0; i < result.time.length; i++) {
    let sum = 0
    for (const key of DATA_KEYS) sum += result[key][i]
    if (sum > 0) {
      for (const key of DATA_KEYS) result[key][i] /= sum
    }
  }

  return result
}

const CHANNEL_META = {
  gravity: { name: 'Gravity', color: '#3A3A4A' },
  winds:   { name: 'Winds', color: '#5B8FC9' },
  sn:      { name: 'Supernovae', color: '#F59E0B' },
  phii:    { name: 'Photoionised gas pressure', color: '#E85D4A' },
  prad:    { name: 'Radiation pressure', color: '#0EA5C8' },
}

// Stack order (bottom to top): gravity, winds, sn, phii, prad
const STACK_ORDER = ['gravity', 'winds', 'sn', 'phii', 'prad']

// Custom X-axis label: italic t, upright Myr
function XAxisLabel({ viewBox }) {
  const { x, y, width } = viewBox
  return (
    <text
      x={x + width / 2}
      y={y + 18}
      textAnchor="middle"
      fill="rgba(255,255,255,0.5)"
      fontSize={12}
    >
      <tspan fontStyle="italic">t</tspan>
      <tspan>{' '}(Myr)</tspan>
    </text>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy/95 border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white/60 mb-1">
        <span className="italic">t</span> = {label} Myr
      </p>
      {[...payload].reverse().map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="leading-relaxed">
          {CHANNEL_META[p.dataKey].name}: {(p.value * 100).toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export default function FeedbackExplorer() {
  const [logM, setLogM] = useState(5.5)
  const [sfe, setSfe] = useState(10)

  const chartData = useMemo(() => {
    const d = interpolateData(logM, sfe)
    if (!d) return []
    return d.time.map((t, i) => {
      const row = { time: t }
      for (const key of DATA_KEYS) row[key] = d[key][i]
      return row
    })
  }, [logM, sfe])

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Chart */}
        <div className="w-full md:w-[65%]">
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              >
                <Label content={<XAxisLabel />} position="bottom" />
              </XAxis>
              <YAxis
                domain={[0, 1]}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                label={{ value: 'Force fraction', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {STACK_ORDER.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={CHANNEL_META[key].name}
                  stackId="1"
                  stroke={CHANNEL_META[key].color}
                  fill={CHANNEL_META[key].color}
                  fillOpacity={0.75}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Controls */}
        <div className="w-full md:w-[35%] flex flex-col justify-center gap-8">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-white/70 text-sm font-medium">Cloud mass</label>
              <span className="text-white text-sm">
                10<sup className="text-[0.7em] align-super">{logM.toFixed(1)}</sup>{' '}
                <span className="italic">M</span><sub className="text-[0.7em]">☉</sub>
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="7"
              step="0.5"
              value={logM}
              onChange={(e) => setLogM(parseFloat(e.target.value))}
              className="w-full slider"
            />
            <div className="flex justify-between text-white/30 text-xs mt-1">
              <span>10<sup className="text-[0.7em] align-super">4</sup></span>
              <span>10<sup className="text-[0.7em] align-super">7</sup></span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-white/70 text-sm font-medium">
                Star formation efficiency (<span className="italic">ε</span><sub className="text-[0.7em]">sf</sub>)
              </label>
              <span className="text-white text-sm">{sfe}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={sfe}
              onChange={(e) => setSfe(parseInt(e.target.value))}
              className="w-full slider"
            />
            <div className="flex justify-between text-white/30 text-xs mt-1">
              <span>5%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
            {[...STACK_ORDER].reverse().map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ background: CHANNEL_META[key].color }}
                />
                {CHANNEL_META[key].name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer notes */}
      <div className="mt-6 space-y-2">
        <p className="text-white/40 text-sm italic">
          Illustrative; quantitative results in Paper I (Teh et al., in prep.)
        </p>
        <a
          href="https://trinitysf.readthedocs.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal/70 text-sm hover:text-teal transition-colors inline-flex items-center gap-1"
        >
          How does TRINITY compute this? →
        </a>
      </div>
    </div>
  )
}
