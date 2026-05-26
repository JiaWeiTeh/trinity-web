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

/* Stopwords are filtered out of the query before scoring. Without this,
   short common words ("i", "the", "not", "me") substring-match dozens
   of parameter descriptions and aliases, so a casual query like
   "im not sure what i want" returns most of the table. After filtering,
   a query that contains only stopwords returns zero results — which is
   the correct answer for noise. */
const STOP_WORDS = new Set([
  // articles, conjunctions, prepositions
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'so', 'as', 'at', 'by',
  'for', 'from', 'in', 'into', 'of', 'on', 'to', 'with', 'about',
  'over', 'under', 'up', 'down', 'out', 'off', 'than', 'then', 'too',
  // pronouns
  'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'we', 'us', 'our',
  'ours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
  'they', 'them', 'their', 'theirs',
  // be / aux / modal
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'will', 'would', 'should', 'shall', 'may', 'might', 'must',
  // questions / negation
  'what', 'whats', 'who', 'whose', 'whom', 'which', 'when', 'where',
  'why', 'how', 'no', 'not', 'nor', 'never',
  // determiners / quantifiers
  'this', 'that', 'these', 'those', 'all', 'any', 'each', 'every',
  'some', 'such', 'one', 'two', 'both', 'only', 'just', 'very',
  // common verbs that show up in casual queries but aren't parameter content
  'want', 'wants', 'need', 'needs', 'know', 'find', 'show', 'tell',
  'help', 'see', 'look', 'try', 'mean', 'think', 'use', 'used',
  // colloquial / typos / politeness
  'im', 'sure', 'please', 'thanks', 'thank', 'hi', 'hey', 'hello',
  'ok', 'okay', 'yes', 'yeah',
])

function expandQuery(query) {
  const q = normalise(query)
  if (!q) return []
  const rawTokens = q.split(' ').filter(Boolean)
  const tokens = rawTokens.filter((t) => !STOP_WORDS.has(t))
  if (tokens.length === 0) return []
  const expanded = new Set(tokens)
  // Re-add the joined non-stopword phrase as a single term so multi-word
  // alias matches still fire (e.g. "molecular cloud" as an alias).
  expanded.add(tokens.join(' '))
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

/* Surface tier — lower is higher priority. Used as the primary sort
   key so a name-matched result always beats a description-matched
   result, regardless of cumulative term score. The point score within
   each surface is the tiebreaker. */
const SURFACE_TIER = {
  'exact name': 1,
  'parameter name': 2,
  'alias': 3,
  'accepted value': 4,
  'description': 5,
  'notes': 6,
  'docs': 6,
  'schema comment': 6,
  'group': 7,
  'unit/default': 8,
}

/* Weighted scoring. The point weight controls ranking within a tier;
   the surface controls the tier itself.

   Two anti-noise rules:
   1. Substring matches require length >= 3. Short tokens like "g" or
      "kb" only count when they exactly equal a whole word, so a search
      for "G" finds the param G (and gamma_adia by name-prefix) instead
      of every parameter that happens to contain the letter "g".
   2. Names are matched word-by-word, after splitting on underscores
      (already done by normalise). "bhcut" then matches SB99_BHCUT as
      an exact-word hit even though the full name is "sb99 bhcut". */
const MIN_SUBSTR = 3

function scoreParam(p, query) {
  if (!query.trim()) return { score: 1, reason: '', tier: 0 }
  const terms = expandQuery(query)
  if (terms.length === 0) return { score: 0, reason: '', tier: Infinity }
  const text = searchableText(p)
  const nameWords = text.name.split(' ').filter(Boolean)
  const aliasWords = text.aliases.split(' ').filter(Boolean)
  const acceptedWords = text.acceptedValues.split(' ').filter(Boolean)
  let score = 0
  let reason = ''
  let tier = Infinity
  const note = (r) => {
    const t = SURFACE_TIER[r] ?? 99
    if (t < tier) { tier = t; reason = r }
  }
  for (const term of terms) {
    if (!term) continue
    const long = term.length >= MIN_SUBSTR

    if (text.name === term || nameWords.includes(term)) {
      score += 100; note('exact name')
    } else if (text.name.startsWith(term) || nameWords.some((w) => w.startsWith(term))) {
      score += 80; note('parameter name')
    } else if (long && text.name.includes(term)) {
      score += 60; note('parameter name')
    } else if (aliasWords.includes(term) || (long && text.aliases.includes(term))) {
      score += 70; note('alias')
    } else if (acceptedWords.includes(term) || (long && text.acceptedValues.includes(term))) {
      score += 50; note('accepted value')
    } else if (long && text.desc.includes(term)) {
      score += 35; note('description')
    } else if (long && text.notes.includes(term)) {
      score += 25; note('notes')
    } else if (long && text.doc.includes(term)) {
      score += 25; note('docs')
    } else if (long && text.sourceComment.includes(term)) {
      score += 25; note('schema comment')
    } else if (long && text.group.includes(term)) {
      score += 20; note('group')
    } else if (long && (text.unit.includes(term) || text.defaultValue.includes(term))) {
      score += 10; note('unit/default')
    }
  }
  return { score, reason, tier }
}

export default function ParameterTable() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [tableOpen, setTableOpen] = useState(true)

  const groups = useMemo(
    () => ['all', ...Array.from(new Set(paramsData.map((p) => p.group)))],
    []
  )

  const results = useMemo(() => {
    return paramsData
      .map((p) => {
        const { score, reason, tier } = scoreParam(p, query)
        return { ...p, _score: score, _reason: reason, _tier: tier }
      })
      .filter((p) => {
        const matchesQuery = !query.trim() || p._score > 0
        const matchesGroup = group === 'all' || p.group === group
        return matchesQuery && matchesGroup
      })
      // Sort primarily by surface tier (name beats alias beats description …),
      // then by cumulative term score within the tier, then alphabetically.
      .sort((a, b) =>
        a._tier - b._tier ||
        b._score - a._score ||
        a.name.localeCompare(b.name)
      )
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
          <button
            type="button"
            onClick={() => setTableOpen((v) => !v)}
            aria-expanded={tableOpen}
            aria-controls="parameter-table-body"
            className="inline-flex items-center gap-1 text-ink-tertiary transition hover:text-teal"
          >
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: tableOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 140ms ease' }}
              aria-hidden="true"
            >
              <polyline points="2,3.5 5,6.5 8,3.5" />
            </svg>
            {tableOpen ? 'Hide table' : 'Show table'}
          </button>
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

      {tableOpen && (
      <div id="parameter-table-body" className="mt-5 overflow-hidden rounded-md border border-border-card">
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
      )}
    </div>
  )
}
