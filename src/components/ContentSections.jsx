import { useState, useRef, useEffect, useCallback } from 'react'
import katex from 'katex'
import BubbleDiagram from './BubbleDiagram'
import TimeScrubber from './TimeScrubber'

/* ── Reference data ─────────────────────────────────────────── */

const REFS = {
  weaver77: {
    authors: 'Weaver, R., McCray, R., Castor, J., Shapiro, P., Moore, R.',
    year: '1977',
    title: 'Interstellar Bubbles. II. Structure and Evolution',
    journal: 'ApJ',
    volume: '218',
    page: '377',
  },
  rahner17: {
    authors: 'Rahner, D., Pellegrini, E. W., Glover, S. C. O., Klessen, R. S.',
    year: '2017',
    title: 'Winds and radiation in unison',
    journal: 'MNRAS',
    volume: '470',
    page: '4453',
  },
  rahner19: {
    authors: 'Rahner, D., Pellegrini, E. W., Glover, S. C. O., Klessen, R. S.',
    year: '2019',
    title: 'WARPFIELD 2.0',
    journal: 'MNRAS',
    volume: '483',
    page: '2547',
  },
  lancaster21: {
    authors: 'Lancaster, L., Ostriker, E. C., Kim, J.-G., Kim, C.-G.',
    year: '2021',
    title: 'Efficiently Cooled Stellar Wind Bubbles in Turbulent Clouds. I.',
    journal: 'ApJ',
    volume: '914',
    page: '89',
  },
  lancaster25: {
    authors: 'Lancaster, L., Ostriker, E. C., Kim, J.-G., Kim, C.-G.',
    year: '2025',
    title: 'Coevolution of Stellar Wind-Blown Bubbles and Photoionized Gas. I.',
    journal: 'ApJ',
    volume: '989',
    page: '42',
  },
}

/* ── Helpers ─────────────────────────────────────────────────── */

function SectionRule() {
  return (
    <div className="max-w-[680px] mx-auto">
      <hr className="border-t border-border-rule" />
    </div>
  )
}

function SectionHeading({ number, title }) {
  return (
    <h2 className="mb-4 flex items-baseline gap-2">
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-[26px] font-semibold text-ink-tertiary leading-none">
        {number}.
      </span>
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-[26px] font-semibold text-ink-primary leading-none">
        {title}
      </span>
    </h2>
  )
}

function Equation({ latex, number, id }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: true,
  })

  return (
    <div id={id} className="my-6 flex items-start justify-center gap-4 max-w-[680px] mx-auto relative">
      <div
        className="flex-1 text-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-[15px] text-ink-tertiary shrink-0 pt-0.5">
        ({number})
      </span>
    </div>
  )
}

function Sidenote({ children }) {
  return <span className="sidenote">{children}</span>
}

function Ref({ target, children }) {
  const handleClick = (e) => {
    e.preventDefault()
    history.pushState(null, '', `#${target}`)
    const el = document.getElementById(target)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('figure-pulse')
      window.setTimeout(() => el.classList.remove('figure-pulse'), 1100)
    }
  }
  return (
    <a href={`#${target}`}
       onClick={handleClick}
       style={{ fontFamily: 'var(--font-ui)' }}
       className="text-teal text-[inherit] no-underline hover:underline cursor-pointer">
      {children}
    </a>
  )
}

function NotationTerm({ label, definition }) {
  return (
    <span className="notation-term group">
      {label}
      <span className="notation-note">{definition}</span>
    </span>
  )
}

function formatFirstThreeAuthors(authors) {
  const parts = authors.split(', ')
  const firstThree = parts.slice(0, 6).join(', ')
  return parts.length > 6 ? `${firstThree} et al.` : firstThree
}

function Cite({ authors, year, journal, volume, page, bare = false }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [above, setAbove] = useState(true)
  const spanRef = useRef(null)

  const surname = authors.split(',')[0].split('.').pop().trim()
  const label = `${surname} et al. ${year}`
  const authorRow = formatFirstThreeAuthors(authors)
  const journalRow = `${journal} ${volume}, ${page} (${year})`

  useEffect(() => {
    if (showTooltip && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect()
      setAbove(rect.top > 120)
    }
  }, [showTooltip])

  return (
    <span
      ref={spanRef}
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-teal cursor-help">
        {bare ? label : `(${label})`}
      </span>
      {showTooltip && (
        <span
          style={{ fontFamily: 'var(--font-ui)' }}
          className={`absolute left-1/2 -translate-x-1/2
                     bg-white border border-border-card rounded-lg shadow-sm
                     px-3 py-2 text-[11px] text-ink-secondary leading-relaxed
                     whitespace-nowrap z-20 pointer-events-none
                     ${above ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          <span className="block">{authorRow}</span>
          <span className="block">{journalRow}</span>
        </span>
      )}
    </span>
  )
}

function CiteList({ refs }) {
  return (
    <span style={{ fontFamily: 'var(--font-display)' }} className="text-teal">
      (
      {refs.map((r, i) => (
        <span key={i}>
          {i > 0 && '; '}
          <Cite {...r} bare />
        </span>
      ))}
      )
    </span>
  )
}

/* ── Sections ────────────────────────────────────────────────── */

function Abstract() {
  return (
    <section id="abstract" className="py-10">
      <div className="max-w-[680px] mx-auto">
        <div className="border-l-4 border-border-card pl-5 py-1">
          <p style={{ fontFamily: 'var(--font-display)' }}
             className="text-[15px] text-ink-secondary leading-[1.7]">
            TRINITY is a 1D spherical thin-shell code for stellar feedback in giant molecular clouds. It couples stellar winds, supernovae, radiation pressure, the thermal pressure of photoionised gas, and gravity in a single equation of motion for the swept-up shell. The shell is followed from the early energy-driven phase, when a hot wind bubble does the pushing, into the late momentum-driven phase. TRINITY succeeds WARPFIELD {' '}
            <CiteList refs={[REFS.rahner17, REFS.rahner19]} />; it adds a driving pressure that depends on the phase, a configurable cloud density profile, and an ionisation front tracked inside the shell. The pages below give the model and an interactive view of the shell across all three phases.
          </p>

          {/* Keywords */}
          <p style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[12px] text-ink-tertiary mt-4">
            <span className="font-medium" style={{ fontStyle: 'italic' }}>Key words. </span>
            ISM: bubbles — H{' '}II regions — stars: winds, outflows — methods: numerical — stars: formation
          </p>

          {/* Status line */}
          <p style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[11px] text-ink-tertiary mt-2 italic">
            Paper I in preparation · Code version 1.0
          </p>
        </div>
      </div>
    </section>
  )
}

function Section1Overview() {
  return (
    <section id="overview" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={1} title="Overview" />
        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            Massive stars destroy the clouds that formed them. Stellar winds, supernovae, radiation pressure, and the thermal pressure of photoionised gas all push on the surrounding gas, and a giant molecular cloud is dispersed within a few Myr of the first massive stars forming.
            <Sidenote>
              In the energy-driven phase, the hot shocked wind at T ~ 10⁶–10⁷ K provides the dominant pressure. This is the classical <span className="whitespace-nowrap">Weaver et al. (1977)</span> regime.
            </Sidenote>
            {' '}Which mechanism does the pushing, and when, sets how fast the cloud disperses, whether the expanding shell triggers a new generation of stars, and how much momentum survives to drive a galactic outflow.
          </p>
          <p>
            Many feedback models follow one channel at a time, or fix the energy-to-momentum transition by hand. TRINITY evolves all five together and lets the transition happen on its own, as radiative cooling drains the bubble.
            <Sidenote>
              WARPFIELD (Rahner et al. 2017, 2019) is the predecessor 1D feedback code. TRINITY adds phase-aware driving, smooth transitions, and ionisation-front tracking.
            </Sidenote>
            {' '}A single run follows the shell from the first wind-blown bubble, through the moment it cools and collapses into a thin shell, to its late coasting expansion.
          </p>
          <p>
            The shell obeys one equation of motion, with the driving pressure and radiation force on one side and gravity on the other:
          </p>
        </div>

        <Equation
          id="eq1"
          number={1}
          latex={String.raw`\frac{d}{dt}\!\left(M_{\rm sh}\,\dot{R}\right) = 4\pi R^2\,P_{\rm drive} + F_{\rm rad} - \frac{G\,M_{\rm sh}\,M_{\rm enc}}{R^2}`}
        />

        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            The Rosette Nebula has the same layered structure TRINITY models: a central cluster, a wind cavity, a hot bubble, an ionised shell, a neutral swept-up shell, and the molecular cloud beyond.
          </p>
        </div>
      </div>
    </section>
  )
}

function Section2Model({ time, setTime }) {
  return (
    <section id="model" className="py-12">
      <div className="max-w-[680px] mx-auto mb-8">
        <SectionHeading number={2} title="Physical model" />
        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            TRINITY divides the feedback-driven expansion into three dynamical phases. In the energy-driven phase, the hot shocked wind inflates a high-pressure bubble that drives a swept-up shell into the surrounding cloud (<Ref target="eq1">Eq. 1</Ref>).
            <Sidenote>
              <NotationTerm
                label={<>P<sub>H II</sub></>}
                definition="Thermal pressure of photoionised gas in the H II region."
              /> is computed at T<sub>i</sub> ≈ 10⁴ K from a cavity-aware Strömgren integral.
            </Sidenote>
            {' '}In the classical solution <Cite {...REFS.weaver77} />, the bubble radius evolves as:
          </p>
        </div>

        <Equation
          id="eq2"
          number={2}
          latex={String.raw`R(t) = \left(\frac{125}{154\pi}\right)^{\!1/5} L_{\rm w}^{1/5}\,\bar{\rho}^{-1/5}\,t^{3/5}`}
        />

        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            Radiative cooling drains the bubble of thermal energy. Once that energy is gone the bubble can no longer push, and the shell coasts on photoionised-gas pressure and wind ram pressure instead. The driving pressure therefore changes from one phase to the next:
          </p>
        </div>

        <Equation
          id="eq3"
          number={3}
          latex={String.raw`P_{\rm drive} = \begin{cases} \max\!\left(P_{\rm b},\; P_{\rm H\,{\scriptscriptstyle\rm II}}\right) & \text{energy-driven} \\[6pt] \max\!\left(P_{\rm b},\; P_{\rm H\,{\scriptscriptstyle\rm II}} + P_{\rm ram}\right) & \text{transition} \\[6pt] P_{\rm H\,{\scriptscriptstyle\rm II}} + P_{\rm ram} & \text{momentum-driven} \end{cases}`}
        />

        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            WARPFIELD never carries photoionised-gas pressure as a driving term; TRINITY does, and switches its form with the phase (<Ref target="eq3">Eq. 3</Ref>). <Ref target="fig1">Interactive Fig. 1</Ref> shows what that does to the shell structure.
            <Sidenote>
              In the max formulation, {' '}
              <NotationTerm label={<>P<sub>b</sub></>} definition="Thermal pressure inside the hot shocked wind bubble." />
              {' '}and{' '}
              <NotationTerm label={<>P<sub>H II</sub></>} definition="Thermal pressure in ionised gas at roughly 10⁴ K." />
              {' '}describe competing equilibria for the cavity gas: a hot wind-shock state versus a photoionisation-equilibrium state, so the driving pressure is whichever equilibrium is set higher, not the sum.
            </Sidenote>
          </p>
        </div>
      </div>

      <div id="fig1" className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1">
          Interactive Fig. 1
        </p>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[15px] font-semibold text-ink-primary mb-4">
          Shell structure across evolutionary phases
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="figure-card w-full">
            <div className="grid md:grid-cols-[1.3fr_1fr]">
              <div className="figure-card-image flex items-center justify-center p-6 md:p-7 border-b border-border-card md:border-b-0 md:border-r">
                <div className="w-full max-w-[380px]">
                  <BubbleDiagram time={time} />
                </div>
              </div>
              <div className="flex flex-col p-6 md:p-7">
                <p style={{ fontFamily: 'var(--font-ui)' }}
                   className="text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
                  Figure caption
                </p>
                <p style={{ fontFamily: 'var(--font-display)' }}
                   className="mt-3 text-[15px] leading-7 text-ink-secondary">
                  Idealised 1D shell structure in the energy-driven, transition, and momentum-driven regimes. Drag the time slider to evolve the bubble and hover layer labels to isolate each zone. Layer sizes are schematic and not to scale — shown for illustration only.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[520px]">
            <TimeScrubber time={time} onTimeChange={setTime} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Section3Papers() {
  const papers = [
    { num: 'Paper I', title: 'Code & Methods', status: 'Teh et al. (in prep.)' },
    { num: 'Paper II', title: '', status: '(upcoming)' },
  ]

  return (
    <section id="papers" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={3} title="Papers" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65] mb-6">
          TRINITY is developed across a series of methods and science papers.
        </p>
        <div>
          {papers.map((p, i) => (
            <div key={i} className="py-3 border-b border-border-rule flex items-baseline gap-3 last:border-b-0">
              <span style={{ fontFamily: 'var(--font-ui)' }}
                    className="text-[12px] font-medium text-teal w-[56px] shrink-0">
                {p.num}
              </span>
              {p.title && (
                <span style={{ fontFamily: 'var(--font-display)' }}
                      className="text-[15px] font-semibold text-ink-primary">
                  {p.title}
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-ui)' }}
                    className="text-[12px] text-ink-tertiary">
                {p.title ? '— ' : ''}{p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Acknowledgements() {
  const messages = [
    'JWT thanks the mass-to-light ratio for keeping things interesting, and coffee for keeping things moving.',
    'JWT acknowledges the Sun for powering the H II regions, and espresso for powering the code.',
    'JWT is grateful to the Rosette Nebula for looking exactly like a textbook figure, and to RSK for pointing out when the code does not.',
    'JWT thanks the ODE solver for converging most of the time.',
    'JWT acknowledges gravity for providing the only restoring force in this problem, and in the chair.',
    'JWT thanks the interstellar medium for being compressible, and deadlines for being incompressible.',
    'JWT is grateful to Starburst99 for the stellar models, and to Heidelberg\'s bakeries for the fuel.',
    'JWT thanks the anonymous mass-loading parameter for absorbing all remaining uncertainties.',
    'JWT acknowledges the shell for not dissolving before the paper was written.',
  ];

  const [index, setIndex] = useState(() => Math.floor(Math.random() * messages.length));
  const [visible, setVisible] = useState(true);

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % messages.length);
      setVisible(true);
    }, 500);
  }, [messages.length]);

  useEffect(() => {
    const id = setTimeout(advance, 60000);
    return () => clearTimeout(id);
  }, [index, advance]);

  return (
    <section className="py-10">
      <div className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium italic text-ink-tertiary mb-2">
          Acknowledgements
        </p>
        <p
          onClick={advance}
          title="Click for another"
          style={{ fontFamily: 'var(--font-ui)', opacity: visible ? 1 : 0, transition: 'opacity 500ms ease', cursor: 'pointer' }}
          className="text-[12px] text-ink-tertiary leading-relaxed hover:text-ink-secondary">
          {messages[index]}
        </p>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="py-10">
      <div className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium italic text-ink-tertiary mb-2">
          Contact
        </p>
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[13px] text-ink-primary leading-relaxed">
          Jia Wei Teh
        </p>
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-secondary leading-relaxed mt-0.5">
          PhD student, International Max Planck Research School for Astronomy
          and Cosmic Physics at the University of Heidelberg (IMPRS-HD)
        </p>
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary leading-relaxed mt-0.5">
          Institut für Theoretische Astrophysik (ITA), Zentrum für Astronomie
          der Universität Heidelberg
        </p>
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary leading-relaxed mt-0.5">
          Albert-Ueberle-Str. 2, 69120 Heidelberg, Germany
        </p>
      </div>
    </section>
  );
}

/* ── Composition ─────────────────────────────────────────────── */

export default function ContentSections() {
  const [time, setTime] = useState(0)

  return (
    <div>
      <Abstract />
      <SectionRule />
      <Section1Overview />
      <SectionRule />
      <Section2Model time={time} setTime={setTime} />
      <SectionRule />
      <Section3Papers />
      <SectionRule />
      <Acknowledgements />
      <SectionRule />
      <Contact />
    </div>
  );
}
