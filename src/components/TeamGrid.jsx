const team = [
  { name: 'Jia Wei Teh', aff: 'ITA/ZAH, Heidelberg', colour: '#0EA5C8', link: 'https://jiaweiteh.github.io' },
  { name: 'Ralf S. Klessen', aff: 'ITA/ZAH, Heidelberg', colour: '#E85D4A', link: 'https://ita.uni-heidelberg.de/~klessen/' },
  { name: 'Simon C. O. Glover', aff: 'ITA/ZAH, Heidelberg', colour: '#6BAE8A', link: 'https://ita.uni-heidelberg.de/~glover/' },
  { name: 'Kathryn Kreckel', aff: 'ARI/ZAH, Heidelberg', colour: '#F59E0B', link: 'https://kreckel.org' },
]

export default function TeamGrid() {
  return (
    <div className="flex flex-wrap gap-x-7 gap-y-4">
      {team.map((m) => (
        <a
          key={m.name}
          href={m.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${m.name}'s page`}
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: m.colour }}
          />
          <div>
            <div className="text-[14px] text-ink-primary group-hover:text-teal transition-colors duration-150" style={{ fontFamily: 'var(--font-display)' }}>
              {m.name}
            </div>
            <div className="text-[11px] text-ink-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>
              {m.aff}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
