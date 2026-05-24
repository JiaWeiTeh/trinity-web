import { useMemo, useState, useRef, useEffect } from 'react'
import Markdown from './Markdown'

const rawDocs = import.meta.glob('../docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

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
    .map(([path, content]) => ({
      key: deriveKey(path),
      title: deriveTitle(path, content),
      content,
    }))
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
    <div className="docs-layout">
      <aside className="docs-index" aria-label="Documentation contents">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[11px] uppercase tracking-widest text-ink-tertiary mb-3">
          Contents
        </p>

        <ol className="docs-index-list">
          {docs.map((d) => (
            <li key={d.key}>
              <button
                onClick={() => onPageChange(d.key)}
                aria-current={active.key === d.key ? 'page' : undefined}
                className={`docs-index-link ${active.key === d.key ? 'is-active' : ''}`}
              >
                {d.title}
              </button>

              {active.key === d.key && sections.length > 0 && (
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
              )}
            </li>
          ))}
        </ol>

        <select
          className="docs-index-select"
          aria-label="Select documentation page"
          value={active.key}
          onChange={(e) => onPageChange(e.target.value)}
        >
          {docs.map((d) => (
            <option key={d.key} value={d.key}>{d.title}</option>
          ))}
        </select>
      </aside>

      <div className="docs-body">
        <article className="docs-article" ref={articleRef}>
          <Markdown content={active.content} onNavigate={onNavigate} />
        </article>
      </div>
    </div>
  )
}
