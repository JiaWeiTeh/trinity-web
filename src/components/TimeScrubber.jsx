export default function TimeScrubber({ time, onTimeChange }) {
  const phase = time < 2 ? 'energy' : time < 4 ? 'transition' : 'momentum'
  const narrative = {
    energy: 'Energy-driven: hot bubble pressure inflates the shell.',
    transition: 'Transition: thermal energy radiates away.',
    momentum: 'Momentum-driven: photoionised gas pressure and ram pressure sustain expansion.',
  }[phase]

  return (
    <div className="w-full">
      <p style={{ fontFamily: 'var(--font-display)' }}
         className="italic text-[17px] text-ink-secondary leading-snug min-h-[48px]">
        {narrative}
      </p>
      <p style={{ fontFamily: 'var(--font-ui)' }}
         className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
        <span style={{ fontStyle: 'italic' }}>t</span>{' = '}{time.toFixed(2)}{' Myr'}
      </p>

      <div className="mt-4 relative">
        <input
          type="range"
          min={0} max={10} step={0.05}
          value={time}
          onChange={(e) => onTimeChange(parseFloat(e.target.value))}
          className="w-full slider"
          aria-label="Simulation time"
        />
        {/* Phase boundary ticks at t=2 (20%) and t=4 (40%) */}
        <div className="absolute left-0 right-0 top-0 h-0 pointer-events-none">
          <div className="absolute" style={{ left: '20%', top: -2, width: 1, height: 8, background: 'var(--color-border-card)' }} />
          <div className="absolute" style={{ left: '40%', top: -2, width: 1, height: 8, background: 'var(--color-border-card)' }} />
        </div>
      </div>

      <div className="mt-2 relative h-5 text-[10px] text-ink-tertiary"
           style={{ fontFamily: 'var(--font-ui)' }}>
        <span className="absolute left-0">0</span>
        <span className="absolute left-[10%] -translate-x-1/2 tracking-[0.08em]">Energy</span>
        <span className="absolute left-[30%] -translate-x-1/2 tracking-[0.08em]">Transition</span>
        <span className="absolute left-[70%] -translate-x-1/2 tracking-[0.08em]">Momentum</span>
        <span className="absolute right-0">10</span>
      </div>
    </div>
  )
}
