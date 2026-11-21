import { useMemo, useState } from 'react'
import paramsData from '../docs/parameters.json'
import { prepare, search } from '../paramSearch'

/* The parameter reference: one entry per keyword, name and default on the
   first line, description below. Keywords are grouped; groups come in the
   order they first appear in trinity/_input/default.param (which is also the
   order of parameters.json), keywords in file order within a group. Search
   rule: see paramSearch.js. */

const ENTRIES = prepare(paramsData)
const GROUPS = [...new Set(paramsData.map((p) => p.group))]
// Unit values that are not units: "—" (none) and "path" (a kind of value).
const NO_UNIT = new Set(['—', 'path'])

export default function ParameterTable() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => search(ENTRIES, query), [query])

  return (
    <div className="font-ui my-6">
      <div className="flex items-center gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or description"
          aria-label="Search parameters"
          className="min-w-0 flex-1 rounded-md border border-border-card bg-paper px-3 py-2 text-[14px] text-ink-primary outline-none transition focus:border-teal"
        />
        <span className="shrink-0 text-[12.5px] text-ink-tertiary" aria-live="polite">
          {results.length} of {ENTRIES.length}
        </span>
      </div>

      {GROUPS.map((group) => {
        const rows = results.filter((p) => p.group === group)
        if (rows.length === 0) return null
        return (
          <section key={group}>
            <h3 className="capitalize">{group}</h3>
            <dl>
              {rows.map((p) => (
                <div key={p.name} className="border-t border-border-rule py-3">
                  <dt className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <code className="text-teal">{p.name}</code>
                    <span className="text-[13px] text-ink-secondary">
                      {p.defaultValue}
                      {p.unit && !NO_UNIT.has(p.unit) && <span className="text-ink-tertiary"> {p.unit}</span>}
                    </span>
                  </dt>
                  <dd className="mt-1 text-[14px] leading-snug text-ink-secondary">{p.desc}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}

      {results.length === 0 && (
        <p className="py-6 text-center text-[13px] text-ink-tertiary">No matching parameters.</p>
      )}
    </div>
  )
}
