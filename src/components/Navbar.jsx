import AppLink from './AppLink'
import { REPO_URL } from '../links'

const VIEWS = [
  { key: 'overview', label: 'Overview', href: '?view=overview' },
  { key: 'docs', label: 'Docs', href: '?view=docs' },
]

/* The site's one navigation: always visible, no menu. */
export default function Navbar({ view = 'overview', onNavigate }) {
  return (
    <nav aria-label="Site" className="fixed top-0 left-0 right-0 z-50 bg-desk/80 backdrop-blur-md border-b border-border-rule">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        <AppLink
          href="?view=overview"
          onNavigate={onNavigate}
          aria-label="TRINITY overview"
          className="font-display text-ink-primary font-semibold tracking-widest text-sm hover:text-teal transition-colors"
        >
          TRINITY
        </AppLink>

        <div className="font-ui flex items-center gap-5 text-sm">
          {VIEWS.map((v) => {
            const isActive = view === v.key
            return (
              <AppLink
                key={v.key}
                href={v.href}
                onNavigate={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={`transition-colors duration-150 ${
                  isActive ? 'text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {v.label}
              </AppLink>
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
