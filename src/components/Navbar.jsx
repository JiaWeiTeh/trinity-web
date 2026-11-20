import { useState } from 'react'
import AppLink from './AppLink'
import { REPO_URL } from '../links'

const VIEWS = [
  { key: 'overview', label: 'Overview', href: '?view=overview' },
  { key: 'docs', label: 'Docs', href: '?view=docs' },
]

const LINK = 'transition-colors duration-150 text-ink-secondary hover:text-ink-primary'

/* Light or dark. The choice is written on <html data-theme> (index.css reads it)
   and saved, so index.html can apply it before the next visit paints. */
function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const chosen = document.documentElement.dataset.theme
    if (chosen) return chosen === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const flip = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage blocked (private window): the choice lasts for this visit
    }
    setDark(!dark)
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={flip}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  )
}

/* The site's one navigation: always visible, no menu. */
export default function Navbar({ view = 'overview', onNavigate }) {
  return (
    <nav aria-label="Site" className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-border-rule">
      <div className="font-ui max-w-[1280px] mx-auto px-4 sm:px-6 h-[52px] flex items-center gap-4 sm:gap-5 text-sm">
        <AppLink
          href="?view=overview"
          onNavigate={onNavigate}
          aria-label="TRINITY overview"
          className="font-display mr-auto text-ink-primary font-semibold tracking-[0.14em] text-[15px] hover:text-teal transition-colors"
        >
          TRINITY
        </AppLink>

        {VIEWS.map((v) => {
          const isActive = view === v.key
          return (
            <AppLink
              key={v.key}
              href={v.href}
              onNavigate={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={isActive ? 'text-ink-primary font-medium' : LINK}
            >
              {v.label}
            </AppLink>
          )
        })}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
          GitHub
        </a>
        <ThemeToggle />
      </div>
    </nav>
  )
}
