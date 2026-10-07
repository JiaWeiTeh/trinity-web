import { REPO_URL } from '../links'

const VIEWS = [
  { key: 'overview', label: 'Overview' },
  { key: 'docs', label: 'Docs' },
]

/* The site's one navigation: always visible, three items, no menu. */
export default function Navbar({ view = 'overview', onViewChange }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-desk/80 backdrop-blur-md border-b border-border-rule">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onViewChange?.('overview')}
          aria-label="TRINITY overview"
          className="font-display text-ink-primary font-semibold tracking-widest text-sm hover:text-teal transition-colors cursor-pointer"
        >
          TRINITY
        </button>

        <div 
             className="font-ui flex items-center gap-5 text-sm">
          {VIEWS.map((v) => {
            const isActive = view === v.key
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => onViewChange?.(v.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`transition-colors duration-150 cursor-pointer ${
                  isActive ? 'text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {v.label}
              </button>
            )
          })}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
             className="text-ink-secondary hover:text-ink-primary transition-colors duration-150">
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
