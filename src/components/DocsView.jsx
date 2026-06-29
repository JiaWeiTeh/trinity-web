import { useMemo, useState, useRef, useEffect } from 'react'
import Markdown from './Markdown'

const rawDocs = import.meta.glob('../docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/* Per-page card metadata. Pages not listed here fall back to a generic
   "Page" kicker and an empty description. */
const PAGE_META = {
  running: {
    kicker: 'Guide',
    description: 'Commands, sweep modes, outputs.',
  },
  parameters: {
    kicker: 'Reference',
    description: 'Every recognised keyword, grouped by role.',
  },
  publications: {
    kicker: 'Citation',
    description: 'How to cite TRINITY and the WARPFIELD lineage.',
  },
  license: {
    kicker: 'Legal',
    description: 'License terms and citation.',
  },
}

function deriveTitle(path, content) {
  const h1 = content.match(/^\s*#\s+(.+?)\s*$/m)
  if (h1) return h1[1].trim()
  const base = path.split('/').pop().replace(/\.md$/, '')
  return base.replace(/^\d+[-_]?/, '').replace(/[-_]/g, ' ')
}

function deriveKey(path) {
  const base = path.split('/').pop().replace(/\.md$/, '')
  return base.replace(/^\d+[-_]?/, '')
}

function buildDocs() {
  return Object.entries(rawDocs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, content]) => {
      const key = deriveKey(path)
      const meta = PAGE_META[key] ?? {}
      return {
        key,
        title: deriveTitle(path, content),
        kicker: meta.kicker ?? 'Page',
        description: meta.description ?? '',
        content,
      }
    })
}

function DocsHeader({ docs, active, onPageChange }) {
  return (
    <header className="mb-12 max-w-[760px]">
      <p style={{ fontFamily: 'var(--font-ui)' }}
         className="text-[11px] uppercase tracking-[0.28em] text-ink-tertiary">
        Manual pages
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)' }}
          className="mt-5 text-[34px] sm:text-[42px] font-semibold leading-tight tracking-[-0.015em] text-ink-primary">
        Documentation
      </h1>
      <p style={{ fontFamily: 'var(--font-display)' }}
         className="mt-5 max-w-[680px] text-[17px] sm:text-[20px] leading-[1.55] text-ink-secondary">
        A compact reference for running TRINITY simulations and configuring parameter files.
      </p>

      <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => {
          const isActive = active.key === d.key
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onPageChange(d.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`group min-h-[124px] rounded-[14px] border p-5 text-left transition duration-200 ${
                isActive
                  ? 'border-teal bg-paper shadow-[0_18px_45px_rgba(14,165,200,0.10)]'
                  : 'border-border-card bg-paper/60 shadow-sm hover:-translate-y-[2px] hover:bg-paper hover:shadow-[0_12px_30px_rgba(55,48,39,0.07)]'
              }`}
            >
              <p
                style={{ fontFamily: 'var(--font-ui)' }}
                className={`text-[11px] uppercase tracking-[0.26em] ${isActive ? 'text-teal' : 'text-ink-tertiary'}`}
              >
                {d.kicker}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)' }}
                  className="mt-4 text-[20px] font-semibold leading-tight text-ink-primary">
                {d.title}
              </h2>
              {d.description && (
                <p style={{ fontFamily: 'var(--font-ui)' }}
                   className="mt-2 text-[13px] text-ink-secondary">
                  {d.description}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </header>
  )
}

export default function DocsView({ page, onPageChange, onNavigate }) {
  const docs = useMemo(() => buildDocs(), [])
  const active = docs.find((d) => d.key === page) ?? docs[0]
  const articleRef = useRef(null)
  const [sections, setSections] = useState([])
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    const root = articleRef.current
    if (!root) return
    const headings = Array.from(root.querySelectorAll('h2'))
    setSections(headings.map((h) => ({ id: h.id, text: h.textContent })))
    setActiveSection(headings[0]?.id ?? null)
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [active?.key])

  if (!docs.length) {
    return (
      <div className="max-w-[680px] mx-auto py-16 text-center">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[13px] text-ink-tertiary">
          No documentation pages yet. Add markdown files to{' '}
          <code className="text-ink-secondary">src/docs/</code> to populate this view.
        </p>
      </div>
    )
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section>
      <DocsHeader docs={docs} active={active} onPageChange={onPageChange} />

      <div className="docs-layout">
        <div className="docs-body">
          <article className="docs-article" ref={articleRef}>
            <Markdown content={active.content} onNavigate={onNavigate} />
          </article>
        </div>

        <aside className="docs-index" aria-label="On this page">
          {sections.length > 0 && (
            <>
              <p style={{ fontFamily: 'var(--font-ui)' }}
                 className="text-[11px] uppercase tracking-[0.18em] text-ink-tertiary mb-3">
                On this page
              </p>
              <ul className="docs-section-list">
                {sections.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToSection(s.id)}
                      className={`docs-section-link ${activeSection === s.id ? 'is-active' : ''}`}
                    >
                      {s.text}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
