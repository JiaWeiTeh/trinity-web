/* Search for the parameter reference (components/ParameterTable.jsx).

   One rule: every word of the query must appear somewhere in the keyword's
   name, aliases, group, unit, default or description. Keywords whose name
   contains a query word come first; otherwise the input order is kept. */

// Lower case; underscores or hyphens read as spaces, so "stop_t" and "stop t"
// are the same query; "iz" reads as "is", so British and American spellings
// match (the descriptions use both "ionised" and "ionized").
const norm = (s) => String(s ?? '').toLowerCase().replace(/[_-]+/g, ' ').replace(/iz/g, 'is')

// Build the text each keyword is searched on, once.
export function prepare(params) {
  return params.map((p) => ({
    ...p,
    nameText: norm(p.name),
    text: norm([p.name, ...(p.aliases || []), p.group, p.unit, p.defaultValue, p.desc].join(' ')),
  }))
}

export function search(entries, query) {
  const words = norm(query).split(/\s+/).filter(Boolean)
  const hits = entries.filter((p) => words.every((w) => p.text.includes(w)))
  const nameHit = (p) => words.some((w) => p.nameText.includes(w))
  // Array.prototype.sort is stable, so the input order survives in each half.
  return hits.sort((a, b) => nameHit(b) - nameHit(a))
}
