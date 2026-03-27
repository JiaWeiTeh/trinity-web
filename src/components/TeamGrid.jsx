const team = [
  {
    name: 'Jia Wei Teh',
    initials: 'JT',
    affiliation: 'ITA/ZAH, Universität Heidelberg',
    color: '#0EA5C8',
    link: 'https://jiaweiteh.github.io/',
  },
  {
    name: 'Ralf S. Klessen',
    initials: 'RK',
    affiliation: 'ITA/ZAH, Universität Heidelberg',
    color: '#E85D4A',
    link: 'https://www.ita.uni-heidelberg.de/~klessen/', // verify URL is current
  },
  {
    name: 'Simon C. O. Glover',
    initials: 'SG',
    affiliation: 'ITA/ZAH, Universität Heidelberg',
    color: '#6BAE8A',
    link: 'https://www.ita.uni-heidelberg.de/~glover/', // verify URL is current
  },
  {
    name: 'Kathryn Kreckel',
    initials: 'KK',
    affiliation: 'ARI/ZAH, Universität Heidelberg',
    color: '#F59E0B',
    link: 'https://www.kreckel.org/', // verify URL is current
  },
]

export default function TeamGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {team.map((member) => (
        <a
          key={member.name}
          href={member.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name}'s page`}
          className="flex flex-col items-center text-center p-5 rounded-lg border border-white/5 hover:bg-white/[0.03] transition-colors group"
        >
          <div
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
            style={{ background: member.color }}
          >
            <span className="text-white font-bold text-lg">{member.initials}</span>
          </div>
          <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-teal transition-colors">
            {member.name}
          </h3>
          <p className="text-white/40 text-xs">{member.affiliation}</p>
        </a>
      ))}
    </div>
  )
}
