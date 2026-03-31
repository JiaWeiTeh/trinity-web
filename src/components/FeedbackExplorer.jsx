import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
const PRESETS = [
  { label: 'low-mass cloud', logM: 4.5, sfe: 12 },
  { label: 'massive cloud', logM: 6.8, sfe: 12 },
  { label: 'low SFE', logM: 5.8, sfe: 6 },
  { label: 'high SFE', logM: 5.8, sfe: 28 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-primary/95 border border-ink-line/20 rounded-lg px-3 py-2 text-xs">
      <p className="text-paper/60 mb-1">
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
  const [pinnedTime, setPinnedTime] = useState(null)

  const chartData = useMemo(() => {
    const d = interpolateData(logM, sfe)
    if (!d) return []
    return d.time.map((t, i) => {
      const row = { time: t }
      for (const key of DATA_KEYS) row[key] = d[key][i]
      return row
    })
  }, [logM, sfe])

  const pinnedRow = useMemo(() => {
    if (!chartData.length || pinnedTime === null) return null
    let closest = chartData[0]
    for (const row of chartData) {
      if (Math.abs(row.time - pinnedTime) < Math.abs(closest.time - pinnedTime)) {
        closest = row
      }
    }
    return closest
  }, [chartData, pinnedTime])

  const pinnedSummary = useMemo(() => {
    if (!pinnedRow) return null
    const ranked = DATA_KEYS
      .map((key) => ({ key, value: pinnedRow[key] }))
      .sort((a, b) => b.value - a.value)
    const [top, second] = ranked
    return {
      time: pinnedRow.time,
      dominant: CHANNEL_META[top.key].name,
      second: CHANNEL_META[second.key].name,
      sentence: `At ${pinnedRow.time.toFixed(1)} Myr, ${CHANNEL_META[top.key].name.toLowerCase()} dominates while ${CHANNEL_META[second.key].name.toLowerCase()} is secondary.`,
    }
  }, [pinnedRow])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4" style={{ fontFamily: 'var(--font-ui)' }}>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setLogM(preset.logM)
              setSfe(preset.sfe)
              setPinnedTime(null)
            }}
            className="text-[12px] px-2.5 py-1.5 rounded-full border border-border-card text-ink-secondary hover:bg-teal-wash hover:text-ink-primary transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border-card rounded-lg p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 14, left: 20, bottom: 26 }}
            onClick={(state) => {
              if (typeof state?.activeLabel === 'number') {
                setPinnedTime(state.activeLabel)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 36, 48, 0.06)" />
            <XAxis
              dataKey="time"
              stroke="rgba(30, 36, 48, 0.3)"
              height={40}
              tick={{ fill: '#5E6776', fontSize: 12 }}
              label={{ value: 't (Myr)', position: 'insideBottom', offset: -14, fill: '#5E6776', fontSize: 12, fontStyle: 'italic' }}
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
              width={52}
              stroke="rgba(30, 36, 48, 0.3)"
              tickFormatter={(v) => v.toFixed(1)}
              tick={{ fill: '#5E6776', fontSize: 12 }}
              label={{ value: 'Force fraction', angle: -90, position: 'insideLeft', offset: -8, fill: '#5E6776', fontSize: 12 }}
            />
            <ReferenceLine y={0.5} stroke="#2A3442" strokeOpacity={0.15} strokeDasharray="4 3" strokeWidth={0.8} />
            {pinnedRow && (
              <ReferenceLine x={pinnedRow.time} stroke="#1E2430" strokeOpacity={0.45} strokeDasharray="3 3" />
            )}
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

      {pinnedSummary && (
        <div className="mt-4 border border-border-card rounded-lg px-4 py-3 bg-white" style={{ fontFamily: 'var(--font-ui)' }}>
          <div className="text-[12px] text-ink-tertiary mb-1">Pinned diagnostic readout</div>
          <div className="text-[13px] text-ink-secondary">
            <span className="font-medium text-ink-primary">t = {pinnedSummary.time.toFixed(1)} Myr</span>
            {' '}· dominant: <span className="font-medium text-ink-primary">{pinnedSummary.dominant}</span>
            {' '}· second: <span className="font-medium text-ink-primary">{pinnedSummary.second}</span>
          </div>
          <p className="text-[13px] text-ink-secondary mt-1.5 italic">{pinnedSummary.sentence}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-ink-secondary mt-4" style={{ fontFamily: 'var(--font-ui)' }}>
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

      {/* Controls */}
      <div className="mt-6 flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-2">
            <label className="text-[13px] text-ink-secondary" style={{ fontFamily: 'var(--font-ui)' }}>Cloud mass</label>
            <span className="text-ink-primary font-medium text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
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
            onChange={(e) => {
              setLogM(parseFloat(e.target.value))
              setPinnedTime(null)
            }}
            className="w-full slider"
          />
          <div className="flex justify-between text-[12px] text-ink-tertiary mt-1" style={{ fontFamily: 'var(--font-ui)' }}>
            <span>10<sup className="text-[0.7em] align-super">4</sup></span>
            <span>10<sup className="text-[0.7em] align-super">7</sup></span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-2">
            <label className="text-[13px] text-ink-secondary" style={{ fontFamily: 'var(--font-ui)' }}>
              Star formation efficiency (<span className="italic">ε</span><sub className="text-[0.7em]">sf</sub>)
            </label>
            <span className="text-ink-primary font-medium text-sm" style={{ fontFamily: 'var(--font-ui)' }}>{sfe}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={sfe}
            onChange={(e) => {
              setSfe(Number(e.target.value))
              setPinnedTime(null)
            }}
            className="w-full slider"
          />
          <div className="flex justify-between text-[12px] text-ink-tertiary mt-1" style={{ fontFamily: 'var(--font-ui)' }}>
            <span>5%</span>
            <span>30%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
