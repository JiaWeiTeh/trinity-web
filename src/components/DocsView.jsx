import { useMemo, useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const rawDocs = import.meta.glob('../docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function deriveTitle(path, content) {
  const h1 = content.match(/^\s*#\s+(.+?)\s*$/m)
  if (h1) return h1[1].trim()
  const base = path.split('/').pop().replace(/\.md$/, '')
  return base.replace(/^\d+[-_]?/, '').replace(/[-_]/g, ' ')
}

function buildDocs() {
  return Object.entries(rawDocs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, content]) => {
      const title = deriveTitle(path, content)
      return { path, title, slug: slugify(title), content }
    })
}

export default function DocsView() {
  const docs = useMemo(() => buildDocs(), [])
  const [activeSlug, setActiveSlug] = useState(docs[0]?.slug ?? null)
  const sectionRefs = useRef({})

  useEffect(() => {
    if (!docs.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveSlug(visible[0].target.id.replace(/^doc-/, ''))
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [docs])

  const scrollTo = (slug) => {
    const el = sectionRefs.current[slug]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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

  return (
    <div className="docs-layout">
      <aside className="docs-index" aria-label="Documentation contents">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[11px] uppercase tracking-widest text-ink-tertiary mb-3">
          Contents
        </p>
        <ol className="docs-index-list">
          {docs.map((d) => (
            <li key={d.slug}>
              <button
                onClick={() => scrollTo(d.slug)}
                className={`docs-index-link ${activeSlug === d.slug ? 'is-active' : ''}`}
              >
                {d.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div className="docs-body">
        {docs.map((d) => (
          <article
            key={d.slug}
            id={`doc-${d.slug}`}
            ref={(el) => { sectionRefs.current[d.slug] = el }}
            className="docs-article"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {d.content}
            </ReactMarkdown>
          </article>
        ))}
      </div>
    </div>
  )
}
