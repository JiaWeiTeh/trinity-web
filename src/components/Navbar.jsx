import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Abstract', href: '#abstract' },
  { label: '1. Overview', href: '#overview' },
  { label: '2. Model', href: '#model' },
  { label: '3. Diagnostics', href: '#diagnostics' },
  { label: '4. Papers', href: '#papers' },
]

export default function Navbar({ view = 'paper', onViewChange }) {
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const onPaper = view === 'paper'

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.3)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    if (href === '#top') {
      history.pushState(null, '', window.location.pathname + window.location.search)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    history.pushState(null, '', href)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDocsClick = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    onViewChange?.(onPaper ? 'docs' : 'paper')
  }

  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash
      if (!hash) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-desk/80 backdrop-blur-md border-b border-border-rule transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <a
            href="#top"
            onClick={(e) => scrollTo(e, '#top')}
            aria-label="Scroll to top"
            className="text-ink-primary font-semibold tracking-widest text-sm hover:text-teal transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            TRINITY
          </a>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-6">
            {onPaper && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                aria-label={`Navigate to ${link.label}`}
                className="text-ink-secondary text-sm hover:text-ink-primary transition-colors duration-150"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={handleDocsClick}
              aria-pressed={!onPaper}
              className={`text-sm transition-colors ${onPaper ? 'text-teal hover:text-teal/80' : 'text-ink-primary hover:text-teal'}`}
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {onPaper ? 'Docs' : '← Back to paper'}
            </button>
          </div>

          {/* Hamburger button (mobile) */}
          <button
            className="sm:hidden text-ink-primary hover:text-ink-primary transition-colors p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Full-screen mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 sm:hidden">
          {onPaper && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              aria-label={`Navigate to ${link.label}`}
              className="text-ink-primary text-2xl font-medium hover:text-teal transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleDocsClick}
            className="text-teal text-xl hover:text-teal/80 transition-colors"
          >
            {onPaper ? 'Documentation' : '← Back to paper'}
          </button>
        </div>
      )}
    </>
  )
}
