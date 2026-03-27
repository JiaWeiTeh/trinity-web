import FeedbackExplorer from './FeedbackExplorer'

const featureCards = [
  {
    title: 'Phase-aware driving',
    desc: 'Switches between thermal and ram pressure at each evolutionary phase.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c-4-3-8-7-8-12a8 8 0 0116 0c0 5-4 9-8 12z" />
        <path d="M12 14c-1.5-1-3-3-3-5a3 3 0 016 0c0 2-1.5 4-3 5z" />
      </svg>
    ),
  },
  {
    title: 'Smooth energy → momentum',
    desc: 'Blends driving pressure across the cooling transition instead of a hard switch.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c2-4 6-4 8 0s6 4 8 0" />
        <path d="M2 17c2-4 6-4 8 0s6 4 8 0" />
      </svg>
    ),
  },
  {
    title: 'Flexible density profiles',
    desc: 'Supports power-law (α = 0, −1, −2) and Bonnor-Ebert sphere profiles.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6BAE8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20L8 10l4 5 4-9 6 14" />
      </svg>
    ),
  },
  {
    title: 'Radiation pressure + dust',
    desc: 'Tracks direct and dust-reprocessed radiation pressure on the shell.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" />
      </svg>
    ),
  },
  {
    title: 'Ionisation-front tracking',
    desc: 'Resolves the photoionised layer structure within the swept-up shell.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" strokeDasharray="3 2" />
      </svg>
    ),
  },
  {
    title: 'Terminal momentum & scaling',
    desc: 'Computes terminal radial momentum for comparison with simulations and observations.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20L7 12l4 4 4-8 6 12" />
        <path d="M21 5l-3-1 1 3" />
      </svg>
    ),
  },
]

const papers = [
  { num: 'I', title: 'Code & Methods', cite: 'Teh et al. (in prep.)' },
  { num: 'II', title: 'Feedback Dominance', cite: '(upcoming)' },
  { num: 'III', title: 'Cluster Property Inference', cite: '(upcoming)' },
  { num: 'IV', title: 'Scaling Relations', cite: '(upcoming)' },
  { num: 'V', title: 'Synthetic Bubble Populations', cite: '(upcoming)' },
]

function Section({ id, children }) {
  return (
    <section id={id} className="py-24 px-6">
      <div className="max-w-[900px] mx-auto">
        {children}
      </div>
    </section>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">{children}</h2>
}

export default function ContentSections() {
  return (
    <div className="bg-navy">
      {/* Physics */}
      <Section id="physics">
        <SectionTitle>What is TRINITY?</SectionTitle>
        <p className="text-white/70 leading-relaxed text-base md:text-lg mb-8">
          TRINITY is a 1D spherical thin-shell code that self-consistently models
          stellar winds, supernovae, radiation pressure, photoionised gas pressure,
          and gravity to track the evolution of feedback-driven bubbles in molecular
          clouds. It succeeds WARPFIELD (Rahner et al. 2017, 2019) with a
          phase-aware treatment of the energy-to-momentum transition, multiple
          density profiles, and ionisation-front tracking.
        </p>
        <div className="border border-white/10 rounded-lg bg-white/[0.03] px-6 py-5">
          <p className="text-white/60 text-sm md:text-base">
            Full code documentation, installation guide, and API reference →{' '}
            <a
              href="https://trinitysf.readthedocs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-teal/80 underline underline-offset-2 transition-colors"
            >
              trinitysf.readthedocs.io
            </a>
          </p>
        </div>
      </Section>

      {/* What's New */}
      <Section id="features">
        <SectionTitle>What&apos;s New?</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-lg bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="mb-3">{card.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{card.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Explorer */}
      <Section id="explorer">
        <SectionTitle>Feedback Explorer</SectionTitle>
        <FeedbackExplorer />
      </Section>

      {/* Papers */}
      <Section id="papers">
        <SectionTitle>Papers</SectionTitle>
        <div className="space-y-4 mb-8">
          {papers.map((p) => (
            <div key={p.num} className="flex items-baseline gap-4 border-b border-white/5 pb-4">
              <span className="text-teal font-bold text-sm shrink-0">Paper {p.num}</span>
              <div>
                <span className="text-white font-medium text-base">{p.title}</span>
                <span className="text-white/40 text-sm ml-2">— {p.cite}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-sm">
          Further papers covering stochastic sampling, observational comparisons,
          and sub-grid prescriptions are planned.
        </p>
      </Section>

      {/* Team */}
      <Section id="team">
        <SectionTitle>Team</SectionTitle>
        <p className="text-white/50 italic text-base">
          Meet the team — coming soon.
        </p>
      </Section>
    </div>
  )
}
