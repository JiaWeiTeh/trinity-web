const TABS = [
  { key: 'paper', label: 'Paper' },
  { key: 'start', label: 'Start' },
  { key: 'docs', label: 'Docs' },
]

export default function PaperTabs({ activeView, onChange }) {
  return (
    <nav className="paper-tabs" aria-label="Document view">
      {TABS.map((t) => {
        const isActive = activeView === t.key
        return (
          <button
            key={t.key}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            className={`paper-tab ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            <span className="paper-tab-label">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
