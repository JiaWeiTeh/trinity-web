export default function TimeScrubber({ time, onTimeChange }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 8px' }}>
      {/* Phase labels */}
      <div style={{
        position: 'relative', height: 14,
        fontFamily: 'var(--font-ui)', fontSize: 11, color: '#97948C',
        marginBottom: 6, letterSpacing: '0.04em'
      }}>
        <span style={{ position: 'absolute', left: '10%', transform: 'translateX(-50%)' }}>Energy</span>
        <span style={{ position: 'absolute', left: '30%', transform: 'translateX(-50%)' }}>Transition</span>
        <span style={{ position: 'absolute', left: '70%', transform: 'translateX(-50%)' }}>Momentum</span>
      </div>

      {/* Slider with tick marks */}
      <div style={{ position: 'relative' }}>
        <input
          type="range"
          min={0} max={10} step={0.05}
          value={time}
          onChange={e => onTimeChange(parseFloat(e.target.value))}
          className="w-full slider"
        />
        {/* Phase boundary ticks at t=2 (20%) and t=4 (40%) */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute',
            left: '20%', top: -2,
            width: 1, height: 8,
            background: '#D3D1C7'
          }} />
          <div style={{
            position: 'absolute',
            left: '40%', top: -2,
            width: 1, height: 8,
            background: '#D3D1C7'
          }} />
        </div>
      </div>

      {/* Time readout */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: 'var(--font-ui)', fontSize: 12, color: '#5E6776',
        marginTop: 4
      }}>
        <span style={{ color: '#97948C' }}>0</span>
        <span>
          <span style={{ fontStyle: 'italic' }}>t</span>{' = '}
          <span style={{ fontWeight: 500, color: '#1E2430' }}>{time.toFixed(1)}</span>
          {' Myr'}
        </span>
        <span style={{ color: '#97948C' }}>10</span>
      </div>
    </div>
  )
}
