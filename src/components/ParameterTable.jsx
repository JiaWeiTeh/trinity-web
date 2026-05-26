import { useMemo, useState } from 'react'
import paramsData from '../docs/parameters.json'

/* Physics-aware query expansion. Searching any synonym in a group expands
   to the others — so "ionized" also matches "photoionised", and "cloud"
   matches "GMC". */
const SYNONYMS = {
  hii: ['hii', 'h ii', 'photoionised', 'photoionized', 'ionised', 'ionized'],
  sfe: ['sfe', 'star formation efficiency', 'epsilon', 'efficiency'],
  cloud: ['cloud', 'gmc', 'molecular cloud'],
  output: ['output', 'write', 'save', 'snapshot', 'directory'],
  density: ['density', 'profile', 'slope', 'alpha', 'core'],
  wind: ['wind', 'winds', 'mechanical', 'ram'],
  gravity: ['gravity', 'gravitational', 'collapse', 'turnaround'],
  metallicity: ['metallicity', 'z cloud'],
  cooling: ['cooling', 'cool', 'radiative'],
}

const SUGGESTIONS = ['cloud mass', 'photoionised pressure', 'density profile', 'output path']

function normalise(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandQuery(query) {
  const q = normalise(query)
  if (!q) return []
  const tokens = q.split(' ').filter(Boolean)
  const expanded = new Set(tokens)
  expanded.add(q)
  for (const token of tokens) {
    for (const values of Object.values(SYNONYMS)) {
      if (values.includes(token)) values.forEach((v) => expanded.add(normalise(v)))
    }
  }
  return Array.from(expanded).filter(Boolean)
}

function searchableText(p) {
  return {
    name: normalise(p.name),
    group: normalise(p.group),
    unit: normalise(p.unit),
    defaultValue: normalise(p.defaultValue),
    desc: normalise(p.desc),
    aliases: normalise((p.aliases || []).join(' ')),
    acceptedValues: normalise((p.acceptedValues || []).join(' ')),
    notes: normalise(p.notes || ''),
    doc: normalise(p.doc || ''),
    sourceComment: normalise(p.sourceComment || ''),
  }
}

/* Weighted scoring. Higher weights for matches at more specific surfaces:
   exact name beats name-prefix; alias beats accepted-value; accepted-value
   beats description; description beats notes; notes beat group; group
   beats unit/default. */
function scoreParam(p, query) {
  if (!query.trim()) return { score: 1, reason: '' }
  const terms = expandQuery(query)
  const text = searchableText(p)
  let score = 0
  let reason = ''
  const note = (r) => { reason = reason || r }
  for (const term of terms) {
    if (!term) continue
    if (text.name === term) {
      score += 100; note('exact name')
    } else if (text.name.startsWith(term)) {
      score += 80; note('parameter name')
    } else if (text.aliases.split(' ').some((w) => w === term) || text.aliases.includes(term)) {
      score += 70; note('alias')
    } else if (text.acceptedValues.split(' ').some((w) => w === term) || text.acceptedValues.includes(term)) {
      score += 50; note('accepted value')
    } else if (text.desc.includes(term)) {
      score += 35; note('description')
    } else if (text.notes.includes(term)) {
      score += 25; note('notes')
    } else if (text.doc.includes(term)) {
      score += 25; note('docs')
    } else if (text.sourceComment.includes(term)) {
      score += 25; note('schema comment')
    } else if (text.group.includes(term)) {
      score += 20; note('group')
    } else if (text.unit.includes(term) || text.defaultValue.includes(term)) {
      score += 10; note('unit/default')
    }
  }
  return { score, reason }
}

export default function ParameterTable() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')

  const groups = useMemo(
    () => ['all', ...Array.from(new Set(paramsData.map((p) => p.group)))],
    []
  )

  const results = useMemo(() => {
    return paramsData
      .map((p) => {
        const { score, reason } = scoreParam(p, query)
        return { ...p, _score: score, _reason: reason }
      })
      .filter((p) => {
        const matchesQuery = !query.trim() || p._score > 0
        const matchesGroup = group === 'all' || p.group === group
        return matchesQuery && matchesGroup
      })
      .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name))
  }, [query, group])

  const hasQuery = query.trim().length > 0

  return (
    <div className="my-6" style={{ fontFamily: 'var(--font-ui)' }}>
      <div className="rounded-xl border border-border-card bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
              Search parameters
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="name, alias, group, unit, default, description…"
              className="w-full rounded-md border border-border-card bg-paper px-3 py-2 text-[13px] text-ink-primary outline-none transition focus:border-teal"
              aria-label="Search parameters"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
              Group
            </span>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full rounded-md border border-border-card bg-paper px-3 py-2 text-[13px] text-ink-primary outline-none transition focus:border-teal"
              aria-label="Filter by parameter group"
            >
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ink-tertiary">
          <span>Showing {results.length} of {paramsData.length} parameters.</span>
          {!hasQuery && (
            <>
              <span className="text-ink-tertiary/60">·</span>
              <span>Try</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-border-card bg-paper px-2.5 py-0.5 text-[11px] text-ink-secondary transition hover:border-teal hover:text-teal"
                >
                  {s}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-border-card">
        <div
          className="grid grid-cols-[1.1fr_0.8fr_0.7fr_0.6fr_2fr] gap-3 bg-card px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-ink-tertiary"
          role="row"
        >
          <span>Parameter</span>
          <span>Group</span>
          <span>Default</span>
          <span>Unit</span>
          <span>Description</span>
        </div>
        {results.map((p) => (
          <div
            key={p.name}
            className="grid grid-cols-[1.1fr_0.8fr_0.7fr_0.6fr_2fr] gap-3 border-t border-border-rule px-4 py-3 text-[13px] items-baseline"
            role="row"
          >
            <div>
              <code className="text-teal" style={{ wordBreak: 'break-word' }}>{p.name}</code>
              {hasQuery && p._reason && (
                <div className="mt-1 text-[10.5px] text-ink-tertiary">
                  matched on {p._reason}
                </div>
              )}
            </div>
            <span className="text-ink-tertiary">{p.group}</span>
            <span className="text-ink-secondary" style={{ wordBreak: 'break-word' }}>{p.defaultValue}</span>
            <span className="text-ink-tertiary">{p.unit}</span>
            <span className="text-ink-secondary leading-snug">{p.desc}</span>
          </div>
        ))}
        {results.length === 0 && (
          <div className="border-t border-border-rule px-4 py-6 text-center text-[13px] text-ink-tertiary">
            No matching parameters.
          </div>
        )}
      </div>
    </div>
  )
}
