import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

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

export default function DocsView({ page, onPageChange }) {
  const docs = useMemo(() => buildDocs(), [])

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

  const active = docs.find((d) => d.key === page) ?? docs[0]

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
        <article className="docs-article">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {active.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
