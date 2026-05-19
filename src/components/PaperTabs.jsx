const TABS = [
  { key: 'paper', label: 'Paper' },
  { key: 'docs', label: 'Docs' },
]

export default function PaperTabs({ activeView, onChange }) {
  return (
    <div className="paper-tabs" role="tablist" aria-label="Document view">
      {TABS.map((t) => {
        const isActive = activeView === t.key
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            aria-controls="paper-content"
            tabIndex={isActive ? 0 : -1}
            className={`paper-tab ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            <span className="paper-tab-label">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
