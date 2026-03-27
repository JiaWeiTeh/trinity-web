import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts'
import gridData from '../data/feedbackGrid.json'

const LOG_M_VALUES = [4, 4.5, 5, 5.5, 6, 6.5, 7]
const SFE_VALUES = [5, 10, 15, 20, 25, 30]

function findEntry(logM, sfe) {
  return gridData.grid.find(
    (e) => Math.abs(e.logM - logM) < 0.01 && e.sfe === sfe
  )
}

function lerpArrays(a, b, t) {
  return a.map((v, i) => v + (b - a[i]) * t)
}

function lerpArraysPair(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t)
}

function interpolateData(logM, sfe) {
  // Find bounding grid indices
  let li = 0
  for (let i = 0; i < LOG_M_VALUES.length - 1; i++) {
    if (logM >= LOG_M_VALUES[i]) li = i
  }
  let si = 0
  for (let i = 0; i < SFE_VALUES.length - 1; i++) {
    if (sfe >= SFE_VALUES[i]) si = i
  }

  const l0 = LOG_M_VALUES[li]
  const l1 = LOG_M_VALUES[Math.min(li + 1, LOG_M_VALUES.length - 1)]
  const s0 = SFE_VALUES[si]
  const s1 = SFE_VALUES[Math.min(si + 1, SFE_VALUES.length - 1)]

  const tl = l1 !== l0 ? (logM - l0) / (l1 - l0) : 0
  const ts = s1 !== s0 ? (sfe - s0) / (s1 - s0) : 0

  const e00 = findEntry(l0, s0)
  const e10 = findEntry(l1, s0)
  const e01 = findEntry(l0, s1)
  const e11 = findEntry(l1, s1)

  if (!e00 || !e10 || !e01 || !e11) return null

  const keys = ['winds', 'phii', 'prad', 'gravity']
  const result = { time: e00.time }

  for (const key of keys) {
    // Bilinear interpolation
    const top = lerpArraysPair(e00[key], e10[key], tl)
    const bot = lerpArraysPair(e01[key], e11[key], tl)
    result[key] = lerpArraysPair(top, bot, ts)
  }

  return result
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy/95 border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white/60 mb-1">{label} Myr</p>
      {payload
        .filter((p) => p.dataKey !== 'gravity')
        .map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="leading-relaxed">
            {p.name}: {(p.value * 100).toFixed(1)}%
          </p>
        ))}
      {payload
        .filter((p) => p.dataKey === 'gravity')
        .map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="leading-relaxed">
            {p.name}: {(p.value * 100).toFixed(1)}%
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
    return d.time.map((t, i) => ({
      time: t,
      winds: d.winds[i],
      phii: d.phii[i],
      prad: d.prad[i],
      gravity: d.gravity[i],
    }))
  }, [logM, sfe])

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Chart */}
        <div className="w-full md:w-[65%]">
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                label={{ value: 'Time (Myr)', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <YAxis
                domain={[0, 1]}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                label={{ value: 'Force fraction', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="winds"
                name="Winds / SN"
                stackId="1"
                stroke="#E85D4A"
                fill="#E85D4A"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="phii"
                name="P_HII"
                stackId="1"
                stroke="#0EA5C8"
                fill="#0EA5C8"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="prad"
                name="P_rad"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.7}
              />
              <Line
                type="monotone"
                dataKey="gravity"
                name="Gravity"
                stroke="#8B6FBE"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Controls */}
        <div className="w-full md:w-[35%] flex flex-col justify-center gap-8">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-white/70 text-sm font-medium">Cloud mass</label>
              <span className="text-white text-sm font-mono">
                10<sup>{logM.toFixed(1)}</sup> M<sub>&#9737;</sub>
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
              <span>10&#8308;</span>
              <span>10&#8311;</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-white/70 text-sm font-medium">Star formation efficiency</label>
              <span className="text-white text-sm font-mono">{sfe}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={sfe}
              onChange={(e) => setSfe(parseInt(e.target.value))}
              className="w-full slider"
            />
            <div className="flex justify-between text-white/30 text-xs mt-1">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#E85D4A' }} />
              Winds / SN
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#0EA5C8' }} />
              P<sub>HII</sub>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#F59E0B' }} />
              P<sub>rad</sub>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed" style={{ borderColor: '#8B6FBE' }} />
              Gravity
            </span>
          </div>
        </div>
      </div>

      {/* Footer notes */}
      <div className="mt-6 space-y-2">
        <p className="text-white/40 text-sm italic">
          Illustrative; quantitative results in Paper I (Teh et al., in prep.)
        </p>
        {/* TODO: update to specific physics page once ReadTheDocs structure is confirmed */}
        <a
          href="https://trinitysf.readthedocs.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal/70 text-sm hover:text-teal transition-colors inline-flex items-center gap-1"
        >
          How does TRINITY compute this? &rarr;
        </a>
      </div>
    </div>
  )
}
