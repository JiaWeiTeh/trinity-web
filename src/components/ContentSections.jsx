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
  chevance20: {
    authors: 'Chevance, M., Kruijssen, J. M. D., Hygate, A. P. S., et al.',
    year: '2020',
    title: 'The lifecycle of molecular clouds in nearby star-forming disc galaxies',
    journal: 'MNRAS',
    volume: '493',
    page: '2872',
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

function formatAuthors(authors) {
  const parts = authors.split(', ')
  const shown = parts.slice(0, 6).join(', ')
  return parts.length > 6 ? `${shown} et al.` : shown
}

function Cite({ authors, year, journal, volume, page, bare = false }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [above, setAbove] = useState(true)
  const spanRef = useRef(null)

  const surname = authors.split(',')[0].split('.').pop().trim()
  const label = `${surname} et al. ${year}`
  const authorRow = formatAuthors(authors)
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

/* Shared prose block — one place to tune the body type for all sections. */
function Prose({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-display)' }}
         className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
      {children}
    </div>
  )
}

/* Figures live in /public/media as both a rasterised PNG (shown inline) and
   the original PDF (linked from the caption). BASE_URL resolves the Vite
   /trinity-web/ deploy prefix. */
const MEDIA = `${import.meta.env.BASE_URL}media/`

function PaperFigure({ src, pdf, alt, maxH = 460 }) {
  return (
    <a
      href={`${MEDIA}${pdf}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Open the full figure (PDF)"
      className="block bg-white"
    >
      <img
        src={`${MEDIA}${src}`}
        alt={alt}
        loading="lazy"
        className="mx-auto block w-auto max-w-full"
        style={{ maxHeight: maxH }}
      />
    </a>
  )
}

function FigureSource({ pdf, children }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)' }}
       className="text-[11px] text-ink-tertiary mt-3">
      {children}{' '}
      <a href={`${MEDIA}${pdf}`} target="_blank" rel="noopener noreferrer"
         className="text-teal underline underline-offset-[3px] decoration-1">
        view PDF →
      </a>
    </p>
  )
}

/* Teal kicker + serif title, shared by the interactive figure and the
   embedded paper figures. */
function FigureHeader({ kicker, title }) {
  return (
    <>
      <p style={{ fontFamily: 'var(--font-ui)' }}
         className="text-[12px] font-medium text-teal mb-1">
        {kicker}
      </p>
      <p style={{ fontFamily: 'var(--font-display)' }}
         className="text-[15px] font-semibold text-ink-primary mb-4">
        {title}
      </p>
    </>
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
            A giant molecular cloud is usually dispersed within a few million
            years of forming its first massive stars, before any of them explode
            as supernovae. The clearing is therefore done by pre-supernova
            feedback: stellar winds, radiation pressure, and the pressure of
            photoionised gas. TRINITY follows these processes in a single
            calculation. It is a 1D spherical thin-shell code that tracks one
            swept-up shell from the early wind-blown bubble to its late
            expansion, and it succeeds WARPFIELD
            {' '}<CiteList refs={[REFS.rahner17, REFS.rahner19]} />. The two main
            additions are photoionised-gas pressure that drives the shell
            directly, switched with the evolutionary phase, and a choice of
            cloud profile (uniform, power-law, or Bonnor–Ebert). This page
            summarises the model and its first results; the details are in
            Paper I.
          </p>

          {/* Keywords */}
          <p style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[12px] text-ink-tertiary mt-4">
            <span className="font-medium" style={{ fontStyle: 'italic' }}>Key words. </span>
            methods: numerical — ISM: bubbles — ISM: clouds — ISM: H{' '}II regions — ISM: kinematics and dynamics — stars: formation
          </p>

          {/* Status line */}
          <p style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[11px] text-ink-tertiary mt-2 italic">
            Code version 1.0 · Paper I, Teh et al. (2026)
          </p>
        </div>
      </div>
    </section>
  )
}

function Section1Setup() {
  return (
    <section id="setup" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={1} title="The setup" />
        <Prose>
          <p>
            Across nearby galaxies, molecular clouds disperse within about
            1–5 Myr of their first massive stars appearing {' '}
            <Cite {...REFS.chevance20} />. The first core-collapse supernovae
            arrive only after roughly 3–4 Myr, so the clouds are cleared before
            supernovae contribute.
            <Sidenote>
              Surveys such as PHANGS measure this by matching the molecular gas,
              exposed young clusters, dust, and ionised gas of the same regions
              at cloud-scale resolution.
            </Sidenote>
            {' '}The clearing is therefore set by pre-supernova feedback.
          </p>
          <p>
            This raises the question the code is built to address: among the
            pre-supernova channels (winds, direct and dust-reprocessed radiation
            pressure, and the pressure of photoionised gas, P<sub>H II</sub>),
            which one dominates, when, and for which clouds?
            <Sidenote>
              WARPFIELD (Rahner et al. 2017, 2019) is the predecessor 1D code.
              TRINITY keeps its efficiency and adds explicit P<sub>H II</sub>{' '}
              driving and a choice of cloud profile.
            </Sidenote>
            {' '}The answer depends on cloud mass, density profile, cluster mass,
            and metallicity. That parameter space is too large to cover with full
            3D simulations.
          </p>
          <p>
            TRINITY is designed to survey it at low cost, and to return
            quantities that can be compared with observations: shell sizes, the
            balance of forces, and the fraction of ionising photons that escape.
          </p>
        </Prose>
      </div>
    </section>
  )
}

function Section2Model({ time, setTime }) {
  return (
    <section id="model" className="py-12">
      <div className="max-w-[680px] mx-auto mb-8">
        <SectionHeading number={2} title="What TRINITY does" />
        <Prose>
          <p>
            TRINITY treats the swept-up shell as a single mass element and
            integrates one equation of motion for it. The driving pressure and
            radiation force push outward; gravity and any confining ambient
            pressure act inward:
          </p>
        </Prose>

        <Equation
          id="eq1"
          number={1}
          latex={String.raw`\frac{d}{dt}\!\left(M_{\rm sh}\,\dot{R}\right) = 4\pi R^2\!\left(P_{\rm drive} - P_{\rm ext}\right) + F_{\rm rad} - F_{\rm grav}`}
        />

        <Prose>
          <p>
            The form of the driving pressure depends on the evolutionary phase.
            A wind-blown bubble passes through three: an early{' '}
            <em>energy-driven</em> phase in which a hot shocked-wind bubble
            inflates the shell (<Cite {...REFS.weaver77} />), a{' '}
            <em>transition</em> as radiative cooling drains that bubble, and a
            late <em>momentum-driven</em> phase in which the shell coasts. The
            driving term is selected to match the phase so that the same
            pressure is not counted twice:
            <Sidenote>
              In the energy-driven phase the bubble pressure {' '}
              <NotationTerm label={<>P<sub>b</sub></>} definition="Thermal pressure inside the hot shocked-wind bubble." />
              {' '}and the photoionised-gas pressure {' '}
              <NotationTerm label={<>P<sub>H II</sub></>} definition="Thermal pressure of the ionised layer at ~10⁴ K." />
              {' '}describe competing equilibria for the cavity gas, so the
              larger of the two is used rather than their sum {' '}
              (<Cite {...REFS.lancaster25} />).
            </Sidenote>
          </p>
        </Prose>

        <Equation
          id="eq2"
          number={2}
          latex={String.raw`P_{\rm drive} = \begin{cases} \max\!\left(P_{\rm b},\; P_{\rm H\,{\scriptscriptstyle\rm II}}\right) & \text{energy-driven} \\[6pt] \max\!\left(P_{\rm b},\; P_{\rm H\,{\scriptscriptstyle\rm II}} + P_{\rm ram}\right) & \text{transition} \\[6pt] P_{\rm H\,{\scriptscriptstyle\rm II}} + P_{\rm ram} & \text{momentum-driven} \end{cases}`}
        />

        <Prose>
          <p>
            Two changes relative to WARPFIELD follow from this. P<sub>H II</sub>{' '}
            now enters the equation of motion explicitly (<Ref target="eq2">Eq. 2</Ref>),
            and the initial cloud is not restricted to a uniform sphere: it can
            be uniform, a power law, or a Bonnor–Ebert sphere. A single run
            takes about 30 minutes on one core, which makes systematic surveys
            practical. <Ref target="fig1">Interactive Fig. 1</Ref> shows how the
            shell structure changes across the three phases.
          </p>
        </Prose>
      </div>

      <div id="fig1" className="max-w-[680px] mx-auto">
        <FigureHeader
          kicker="Interactive Fig. 1"
          title="Shell structure across evolutionary phases"
        />

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
                  1D shell structure across the three phases. The central
                  cluster drives free-streaming winds out to the termination
                  shock R<sub>ts</sub>; shocked wind fills the hot bubble to
                  R<sub>b</sub>; outside it sit an ionised layer (to the
                  ionisation front R<sub>if</sub>) and a neutral swept-up layer
                  (to R<sub>sh</sub>), embedded in the natal cloud. Drag the
                  slider to evolve the bubble, or hover a label to isolate a
                  zone. The radii are schematic and not to scale.
                </p>
                <FigureSource pdf="paper_schematic.pdf">
                  Adapted from Fig. 1 of Paper I.
                </FigureSource>
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

function ResultCard({ index, title, figure, sourcePdf, sourceLabel, children }) {
  return (
    <div className="figure-card overflow-hidden">
      {figure && (
        <div className="border-b border-border-card p-4 bg-white">
          {figure}
        </div>
      )}
      <div className="p-6 md:p-7">
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: 'var(--font-display)' }}
                className="text-[22px] font-semibold text-ink-tertiary leading-none shrink-0">
            {index}
          </span>
          <h3 style={{ fontFamily: 'var(--font-display)' }}
              className="text-[17px] font-semibold text-ink-primary leading-snug">
            {title}
          </h3>
        </div>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="mt-3 text-[15px] leading-7 text-ink-secondary">
          {children}
        </p>
        {sourcePdf && <FigureSource pdf={sourcePdf}>{sourceLabel}</FigureSource>}
      </div>
    </div>
  )
}

function Section3Results() {
  return (
    <section id="results" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={3} title="Key results" />
        <Prose>
          <p>
            Paper I validates the code against analytic wind, photoionisation,
            and momentum limits, then explores clouds of mass 10<sup>5</sup>–10<sup>6.5</sup>{' '}
            M<sub>☉</sub> across a range of densities and star-formation
            efficiencies. A single run returns the shell dynamics, the force
            budget, and the ionising-photon budget on one time grid. This
            distinguishes two timescales: when feedback clears the cloud, and
            when Lyman-continuum photons begin to escape.
          </p>
        </Prose>

        {/* Diagnostic showcase — Fig. 3 of Paper I */}
        <div className="mt-6">
          <FigureHeader kicker="Diagnostic suite" title="One run, three diagnostics" />
          <div className="figure-card overflow-hidden p-4 bg-white">
            <PaperFigure
              src="teaser_fiducial.png"
              pdf="teaser_fiducial.pdf"
              alt="Three stacked panels versus time: shell radius and velocity; the fractional force budget split into gravity, drive, radiation and external pressure with wind/H II/SN sub-channels; and the ionising-photon budget split into gas absorption, dust absorption and LyC escape."
              maxH={560}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-display)' }}
             className="text-[13px] leading-6 text-ink-secondary mt-3">
            A fiducial run (M<sub>cloud</sub> = 10<sup>6</sup> M<sub>☉</sub>,
            ε = 0.10). <em>Top:</em> shell radius and velocity, with the energy,
            transition, and momentum phases marked. <em>Middle:</em> the force
            budget. Photoionised gas (H II) retains a measurable share after the
            transition, and radiation pressure remains sub-dominant.
            <em> Bottom:</em> the ionising-photon budget. The LyC escape fraction
            rises as the shell becomes density-bounded.
          </p>
          <FigureSource pdf="teaser_fiducial.pdf">
            Fig. 3 of Paper I.
          </FigureSource>
        </div>

        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65] mt-10 mb-5">
          Three results from the parameter survey are worth highlighting.
        </p>

        <div className="grid gap-5 md:grid-cols-1">
          <ResultCard
            index={1}
            title="Photoionised gas affects the dynamics"
            sourcePdf="radiusComparison_M1e6_sfe001_n1e3.pdf"
            sourceLabel="Fig. 2 of Paper I."
            figure={
              <PaperFigure
                src="radiusComparison_M1e6_sfe001_n1e3.png"
                pdf="radiusComparison_M1e6_sfe001_n1e3.pdf"
                alt="Bubble radius versus time. The TRINITY curve sits above a WARPFIELD-equivalent run with photoionised-gas pressure switched off, and between the pure-energy and pure-photoionised analytic limits."
                maxH={360}
              />
            }
          >
            Including P<sub>H II</sub> increases the shell radius by about 17% at
            10 Myr relative to a WARPFIELD-equivalent run, and the difference
            grows at later times as the cooled bubble loses its driving pressure.
            The full trajectory lies between the pure-energy and pure-photoionised
            limits, so neither channel dominates on its own at this efficiency.
          </ResultCard>

          <ResultCard
            index={2}
            title="Cloud structure sets the outcome"
            sourcePdf="densityProfile_paper.pdf"
            sourceLabel="Fig. 4 of Paper I."
            figure={
              <PaperFigure
                src="densityProfile_paper.png"
                pdf="densityProfile_paper.pdf"
                alt="Top: four cloud density profiles and their enclosed mass. Bottom: bubble radius versus time — only the steep r-to-the-minus-two cloud keeps expanding; the uniform, r-to-the-minus-one, and Bonnor–Ebert clouds turn over and re-collapse."
                maxH={520}
              />
            }
          >
            At fixed cloud mass, central density, and star-formation efficiency,
            uniform and shallow clouds stall and re-collapse, while a steep
            ρ ∝ r<sup>−2</sup> cloud continues to expand. The minimum efficiency
            required for dispersal is therefore not a single value; it depends on
            how the cloud&rsquo;s mass is distributed.
          </ResultCard>

          <ResultCard
            index={3}
            title="Emergence timing depends on cloud structure"
            sourcePdf="pedrini_emergence_timescales_merge.pdf"
            sourceLabel="Fig. 6 of Paper I."
            figure={
              <PaperFigure
                src="pedrini_emergence_timescales_merge.png"
                pdf="pedrini_emergence_timescales_merge.pdf"
                alt="Dispersal timescale versus cluster mass for Bonnor–Ebert clouds (left) and homogeneous clouds (right); at matched mass and efficiency the Bonnor–Ebert clouds disperse later."
                maxH={300}
              />
            }
          >
            Even when every cloud disperses, Bonnor–Ebert clouds clear about
            55% later than uniform clouds of the same mass, because the mass is
            spread over a larger radius. Dispersal times fall in the range
            0.3–3 Myr, before the first supernovae, so the outcome is set by
            pre-supernova feedback.
          </ResultCard>
        </div>
      </div>
    </section>
  )
}

function Section4Papers() {
  const papers = [
    { num: 'Paper I', title: 'Code & Methods', status: 'Teh et al. (2026), arXiv:2605.27517', href: 'https://arxiv.org/abs/2605.27517' },
  ]

  return (
    <section id="papers" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={4} title="Papers" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65] mb-6">
          TRINITY is described in a series of methods and science papers.
        </p>
        <div>
          {papers.map((p, i) => (
            <div key={i} className="py-3 border-b border-border-rule flex items-baseline gap-3 last:border-b-0">
              <span style={{ fontFamily: 'var(--font-ui)' }}
                    className="text-[12px] font-medium text-teal w-[56px] shrink-0">
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer"
                     className="underline underline-offset-[3px] decoration-1">
                    {p.num}
                  </a>
                ) : p.num}
              </span>
              {p.title && (
                <span style={{ fontFamily: 'var(--font-display)' }}
                      className="text-[15px] font-semibold text-ink-primary">
                  {p.title}
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-ui)' }}
                    className="text-[12px] text-ink-tertiary">
                {p.title ? '— ' : ''}
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer"
                     className="text-teal underline underline-offset-[3px] decoration-1">
                    {p.status}
                  </a>
                ) : p.status}
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
    'JWT acknowledges the shell for not dissolving before the paper was written.',
    'JWT thanks the ODE solver for converging most of the time.',
    'JWT thanks the mass-to-light ratio for keeping things interesting, and coffee for keeping things moving.',
    'JWT acknowledges the Sun for powering the H II regions, and espresso for powering the code.',
    'JWT is grateful to the Rosette Nebula for looking exactly like a textbook figure, and to RSK for pointing out when the code does not.',
    'JWT acknowledges gravity for providing the only restoring force in this problem, and in the chair.',
    'JWT thanks the interstellar medium for being compressible, and deadlines for being incompressible.',
    'JWT is grateful to Starburst99 for the stellar models, and to Heidelberg\'s bakeries for the fuel.',
    'JWT thanks the anonymous mass-loading parameter for absorbing all remaining uncertainties.',
  ];

  const [index, setIndex] = useState(0);
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
      <Section1Setup />
      <SectionRule />
      <Section2Model time={time} setTime={setTime} />
      <SectionRule />
      <Section3Results />
      <SectionRule />
      <Section4Papers />
      <SectionRule />
      <Acknowledgements />
      <SectionRule />
      <Contact />
    </div>
  );
}
