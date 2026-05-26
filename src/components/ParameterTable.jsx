import { useMemo, useState } from 'react'
import paramsData from '../docs/parameters.json'

export default function ParameterTable() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')

  const groups = useMemo(
    () => ['all', ...Array.from(new Set(paramsData.map((p) => p.group)))],
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return paramsData.filter((p) => {
      const matchesText =
        !q ||
        [p.name, p.group, p.unit, p.defaultValue, p.desc]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchesGroup = group === 'all' || p.group === group
      return matchesText && matchesGroup
    })
  }, [query, group])

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
              placeholder="name, group, unit, default, description…"
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
        <p className="mt-3 text-[12px] text-ink-tertiary">
          Showing {filtered.length} of {paramsData.length} parameters.
        </p>
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
        {filtered.map((p) => (
          <div
            key={p.name}
            className="grid grid-cols-[1.1fr_0.8fr_0.7fr_0.6fr_2fr] gap-3 border-t border-border-rule px-4 py-3 text-[13px] items-baseline"
            role="row"
          >
            <code className="text-teal" style={{ wordBreak: 'break-word' }}>{p.name}</code>
            <span className="text-ink-tertiary">{p.group}</span>
            <span className="text-ink-secondary" style={{ wordBreak: 'break-word' }}>{p.defaultValue}</span>
            <span className="text-ink-tertiary">{p.unit}</span>
            <span className="text-ink-secondary leading-snug">{p.desc}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="border-t border-border-rule px-4 py-6 text-center text-[13px] text-ink-tertiary">
            No matching parameters.
          </div>
        )}
      </div>
    </div>
  )
}
