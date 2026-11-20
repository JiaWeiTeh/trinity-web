import { useState, useRef, useEffect } from 'react'
import Markdown from './Markdown'
import AppLink from './AppLink'

const rawDocs = import.meta.glob('../docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/* The sidebar, in reading order. Each key is a file in src/docs/ without its
   number prefix (00-getting-started.md -> 'getting-started'). A key with no
   file is skipped; a file with no key here is not shown. */
const NAV = [
  { group: 'Start here', pages: ['getting-started', 'notebook'] },
  { group: 'Using TRINITY', pages: ['running', 'output'] },
  { group: 'Reference', pages: ['parameters', 'license'] },
]

/* key -> { key, title, content }. The title is the page's own first heading. */
const DOCS = {}
for (const [path, content] of Object.entries(rawDocs)) {
  const key = path.split('/').pop().replace(/\.md$/, '').replace(/^\d+[-_]?/, '')
  const h1 = content.match(/^\s*#\s+(.+?)\s*$/m)
  DOCS[key] = { key, title: h1 ? h1[1] : key, content }
}

const GROUPS = NAV
  .map(({ group, pages }) => ({ group, pages: pages.filter((k) => DOCS[k]).map((k) => DOCS[k]) }))
  .filter((g) => g.pages.length > 0)

/* The same pages in one list, for the previous and next links. */
const ORDER = GROUPS.flatMap((g) => g.pages.map((p) => ({ ...p, group: g.group })))

const hrefFor = (key) => `?view=docs&page=${key}`

function PageList({ activeKey, onNavigate, label }) {
  return (
    <nav className="docs-nav" aria-label={label}>
      {GROUPS.map(({ group, pages }) => (
        <div key={group}>
          <p className="docs-nav-group">{group}</p>
          <ul>
            {pages.map((p) => (
              <li key={p.key}>
                <AppLink
                  href={hrefFor(p.key)}
                  onNavigate={onNavigate}
                  aria-current={p.key === activeKey ? 'page' : undefined}
                >
                  {p.title}
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function DocsView({ page, onNavigate }) {
  const index = Math.max(0, ORDER.findIndex((p) => p.key === page))
  const active = ORDER[index]
  const previous = ORDER[index - 1]
  const next = ORDER[index + 1]

  const articleRef = useRef(null)
  const [sections, setSections] = useState([])
  const [activeSection, setActiveSection] = useState(null)

  // The "on this page" rail is read off the rendered article's h2 headings.
  useEffect(() => {
    const headings = Array.from(articleRef.current.querySelectorAll('h2'))
    setSections(headings.map((h) => ({ id: h.id, text: h.textContent })))
    setActiveSection(headings[0]?.id ?? null)

    // A link that arrives with #section: the article did not exist when the
    // browser first looked for that id, so go there now.
    const hash = decodeURIComponent(window.location.hash.slice(1))
    if (hash) document.getElementById(hash)?.scrollIntoView()

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
  }, [active.key])

  return (
    <div className="docs-shell">
      <PageList activeKey={active.key} onNavigate={onNavigate} label="Docs pages" />

      <div className="docs-main">
        {/* Phones: the page list as a menu. The key closes it on every page change. */}
        <details className="docs-menu" key={active.key}>
          <summary>Docs menu: {active.title}</summary>
          <PageList activeKey={active.key} onNavigate={onNavigate} label="Docs pages (menu)" />
        </details>

        <p className="docs-kicker">{active.group}</p>
        <article className="docs-article" ref={articleRef}>
          <Markdown content={active.content} onNavigate={onNavigate} />
        </article>

        <div className="docs-pager">
          {previous && (
            <AppLink href={hrefFor(previous.key)} onNavigate={onNavigate}>
              <small>Previous</small>
              <strong>← {previous.title}</strong>
            </AppLink>
          )}
          {next && (
            <AppLink href={hrefFor(next.key)} onNavigate={onNavigate} className="docs-pager-next">
              <small>Next</small>
              <strong>{next.title} →</strong>
            </AppLink>
          )}
        </div>
      </div>

      <aside className="docs-toc" aria-label="On this page">
        {sections.length > 0 && (
          <>
            <p className="docs-nav-group">On this page</p>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} aria-current={activeSection === s.id ? 'location' : undefined}>
                    {s.text}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  )
}
