/* Phase boundaries match the bubble-diagram interpolation and the ticks
   drawn on the track: energy-driven up to 0.5 Myr, transition to 1.2 Myr,
   momentum-driven thereafter. */
function phaseFor(time) {
  if (time <= 0.5) return 'Energy-driven'
  if (time <= 1.2) return 'Transition'
  return 'Momentum-driven'
}

export default function TimeScrubber({ time, onTimeChange }) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
          <span style={{ fontStyle: 'italic' }}>t</span>{' = '}{time.toFixed(2)}{' Myr'}
        </p>
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[11px] uppercase tracking-[0.16em] text-teal font-medium">
          {phaseFor(time)}
        </p>
      </div>

      <div className="mt-4 relative">
        <input
          type="range"
          min={0} max={5} step={0.05}
          value={time}
          onChange={(e) => onTimeChange(parseFloat(e.target.value))}
          className="w-full slider"
          aria-label="Simulation time"
        />
        {/* Phase boundary ticks at t=0.5 (10%) and t=1.2 (24%) of the 0–5 Myr range */}
        <div className="absolute left-0 right-0 top-0 h-0 pointer-events-none">
          <div className="absolute" style={{ left: '10%', top: -2, width: 1, height: 8, background: 'var(--color-border-card)' }} />
          <div className="absolute" style={{ left: '24%', top: -2, width: 1, height: 8, background: 'var(--color-border-card)' }} />
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-ink-tertiary"
           style={{ fontFamily: 'var(--font-ui)' }}>
        <span>0</span>
        <span>5</span>
      </div>
    </div>
  )
}
