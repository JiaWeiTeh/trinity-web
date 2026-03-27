const phases = [
  { id: 'energy', label: 'Energy' },
  { id: 'transition', label: 'Transition' },
  { id: 'momentum', label: 'Momentum' },
]

export default function PhaseToggle({ phase, onPhaseChange }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {phases.map((p) => {
        const active = phase === p.id
        return (
          <button
            key={p.id}
            onClick={() => onPhaseChange(p.id)}
            className="cursor-pointer transition-all duration-200"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 400,
              padding: '5px 16px',
              borderRadius: 20,
              border: active ? '0.5px solid #1E2430' : '0.5px solid #D3D1C7',
              background: active ? '#1E2430' : 'transparent',
              color: active ? '#F7F6F2' : '#5E6776',
            }}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
