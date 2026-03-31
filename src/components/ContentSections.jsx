import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import ComparisonSlider from './ComparisonSlider'
import BubbleDiagram from './BubbleDiagram'
import TimeScrubber from './TimeScrubber'
import Sparkline from './Sparkline'
import PressureBar from './PressureBar'

const FeedbackExplorer = lazy(() => import('./FeedbackExplorer'))

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

function Cite({ authors, year, title, journal, volume, page }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [above, setAbove] = useState(true)
  const spanRef = useRef(null)

  const surname = authors.split(',')[0].split('.').pop().trim()
  const label = `${surname} et al. ${year}`
  const full = `${authors}, ${year}, ${title}, ${journal}, ${volume}, ${page}`

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
        ({label})
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
          {full}
        </span>
      )}
    </span>
  )
}

function CiteGroup({ refs }) {
  const [show, setShow] = useState(false)
  const [above, setAbove] = useState(true)
  const spanRef = useRef(null)

  const labels = refs.map(r => {
    const surname = r.authors.split(',')[0].split('.').pop().trim()
    return `${surname} et al. ${r.year}`
  }).join('; ')

  const fulls = refs.map(r =>
    `${r.authors}, ${r.year}, ${r.journal}, ${r.volume}, ${r.page}`
  )

  useEffect(() => {
    if (show && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect()
      setAbove(rect.top > 120)
    }
  }, [show])

  return (
    <span
      ref={spanRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-teal cursor-help">
        ({labels})
      </span>
      {show && (
        <span
          style={{ fontFamily: 'var(--font-ui)' }}
          className={`absolute left-1/2 -translate-x-1/2
                     bg-white border border-border-card rounded-lg shadow-sm
                     px-3 py-2 text-[11px] text-ink-secondary leading-relaxed
                     z-20 pointer-events-none whitespace-pre-line
                     ${above ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          {fulls.join('\n')}
        </span>
      )}
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
            TRINITY is a 1D spherical thin-shell code that self-consistently evolves stellar wind bubbles, photoionised regions, and swept-up shells in giant molecular clouds. The code couples stellar winds, supernovae, radiation pressure, photoionised-gas thermal pressure, and gravity across energy-driven, transition, and momentum-driven phases. It succeeds WARPFIELD {' '}
            <CiteGroup refs={[REFS.rahner17, REFS.rahner19]} /> with a phase-aware treatment of the energy-to-momentum transition, flexible density profiles, and ionisation-front tracking within the shell. This site presents the code, its physical model, and interactive diagnostics exploring feedback dominance across parameter space.
          </p>

          {/* Keywords */}
          <p style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[12px] text-ink-tertiary mt-4">
            <span className="font-medium" style={{ fontStyle: 'italic' }}>Key words. </span>
            ISM: bubbles — H{'\u2009'}II regions — stars: winds, outflows — methods: numerical — stars: formation
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

function Figure1() {
  return (
    <section id="fig1" className="py-10">
      <div className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1">
          Interactive Fig. 1
        </p>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[15px] font-semibold text-ink-primary mb-4">
          From nebula to schematic
        </p>

        <div className="max-w-[340px] mx-auto">
          <ComparisonSlider />
        </div>

        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mt-3 leading-relaxed max-w-[680px]">
          Fig. 1 — Comparison between NGC 2244 (Rosette Nebula; DECam, CTIO/NOIRLab/DOE/NSF/AURA) and the idealised spherical zones evolved by TRINITY. Drag the divider to compare observed morphology with model structure.
        </p>
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
            Massive stars reshape their natal molecular clouds through stellar winds, supernovae, radiation pressure, and the thermal pressure of photoionised gas.
            <Sidenote>
              In the energy-driven phase, the hot shocked wind at T ~ 10⁶–10⁷ K provides the dominant pressure. This is the classical <span className="whitespace-nowrap">Weaver et al. (1977)</span> regime.
            </Sidenote>
            {' '}The relative importance of these mechanisms — and how dominance shifts over time — controls cloud dispersal timescales, triggered star formation, and the momentum budget available to drive galactic outflows.
          </p>
          <p>
            Existing models typically treat these feedback channels in isolation or make simplifying assumptions about the transition from energy-driven to momentum-driven expansion. TRINITY evolves all five mechanisms self-consistently within a 1D spherical thin-shell framework, tracking the full dynamical sequence from initial wind-blown bubble through shell formation, radiative cooling, and late-time momentum-driven expansion.
            <Sidenote>
              WARPFIELD (Rahner et al. 2017, 2019) is the predecessor 1D feedback code. TRINITY adds phase-aware driving, smooth transitions, and ionisation-front tracking.
            </Sidenote>
          </p>
          <p>
            The dynamics of the swept-up shell are governed by a single equation of motion balancing the driving pressure against gravity:
          </p>
        </div>

        <Equation
          id="eq1"
          number={1}
          latex={String.raw`\frac{d}{dt}\!\left(M_{\rm sh}\,\dot{R}\right) = 4\pi R^2\,P_{\rm drive} - \frac{G\,M_{\rm sh}\,M_{\rm enc}}{R^2}`}
        />

        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            The Rosette Nebula (<Ref target="fig1">Fig. 1</Ref>) illustrates the multi-zone structure that TRINITY captures: a central cluster driving a wind cavity, surrounded by a hot bubble, an ionised shell, a neutral swept-up shell, and the ambient molecular cloud.
          </p>
        </div>
      </div>
    </section>
  )
}

function Section2Model({ time, setTime }) {
  const phase = time < 2 ? 'energy' : time < 4 ? 'transition' : 'momentum'

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
            As radiative cooling drains thermal energy from the bubble interior, the system transitions to a momentum-driven regime where photoionised-gas pressure and wind ram pressure sustain the expansion. TRINITY switches the driving pressure formulation between phases:
          </p>
        </div>

        <Equation
          id="eq3"
          number={3}
          latex={String.raw`P_{\rm drive} = \begin{cases} \max\!\left(P_{\rm b},\; P_{\rm H\,\scriptscriptstyle II}\right) & \text{energy-driven} \\[6pt] P_{\rm H\,\scriptscriptstyle II} + P_{\rm ram} & \text{momentum-driven} \end{cases}`}
        />

        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            This phase-aware treatment (<Ref target="eq3">Eq. 3</Ref>) is one of the key differences from WARPFIELD, which does not include photoionised-gas pressure as a driving term (see <Ref target="fig2">Interactive Fig. 2</Ref> for the effect on shell structure).
            <Sidenote>
              The max(
              <NotationTerm label={<>P<sub>b</sub></>} definition="Thermal pressure inside the hot shocked wind bubble." />
              , {' '}
              <NotationTerm label={<>P<sub>H II</sub></>} definition="Thermal pressure in ionised gas at approximately 10⁴ K." />
              ) formulation prevents double-counting when the bubble pressure already exceeds the H{'\u2009'}II pressure.
            </Sidenote>
          </p>
        </div>
      </div>

      <div id="fig2" className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1">
          Interactive Fig. 2
        </p>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[15px] font-semibold text-ink-primary mb-4">
          Shell structure across evolutionary phases
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-[380px]">
            <BubbleDiagram time={time} />
          </div>

          <div className="w-full max-w-[320px]">
            <Sparkline time={time} />
          </div>

          <div className="w-full max-w-[320px]">
            <PressureBar time={time} />
          </div>

          <p style={{ fontFamily: 'var(--font-display)' }}
             className="text-[15px] italic text-ink-secondary text-center min-h-[48px] max-w-[520px]">
            {phase === 'energy' && 'Energy-driven: hot bubble pressure inflates the shell.'}
            {phase === 'transition' && 'Transition: thermal energy radiates away.'}
            {phase === 'momentum' && 'Momentum-driven: photoionised gas pressure and ram pressure sustain expansion.'}
          </p>

          <div className="w-full max-w-[520px]">
            <TimeScrubber time={time} onTimeChange={setTime} />
          </div>
        </div>

        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mt-3 leading-relaxed max-w-[680px] mx-auto">
          Interactive Fig. 2 — Idealised 1D shell structure in the energy-driven, transition, and momentum-driven regimes. Drag the time slider to evolve the bubble and hover layer labels to isolate each zone. The pressure bar shows the instantaneous force-fraction decomposition.
        </p>
      </div>
    </section>
  )
}

function Section3Diagnostics() {
  return (
    <section id="diagnostics" className="py-12">
      <div className="max-w-[680px] mx-auto mb-8">
        <SectionHeading number={3} title="Interactive diagnostics" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65]">
          TRINITY computes the full force-fraction history for any combination of cloud mass and star-formation efficiency.
          <Sidenote>
            The grid spans M<sub>cl</sub> = 10⁴–10⁷ M<sub>☉</sub> and ε<sub>sf</sub> = 5–30%. Force fractions are normalised to sum to unity.
          </Sidenote>
          {' '}The explorer below interpolates across a precomputed grid to show how the dominant feedback mechanism shifts across parameter space.
        </p>
      </div>

      <div id="fig3" className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1">
          Interactive Fig. 3
        </p>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[15px] font-semibold text-ink-primary mb-4">
          Force-fraction evolution across parameter space
        </p>

        <Suspense fallback={
          <div style={{ fontFamily: 'var(--font-ui)' }}
               className="text-[13px] text-ink-tertiary py-20 text-center">
            Loading explorer…
          </div>
        }>
          <FeedbackExplorer />
        </Suspense>

        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mt-3 leading-relaxed max-w-[680px] mx-auto">
          Interactive Fig. 3 — Illustrative force-fraction histories for selected cloud mass and star formation efficiency. Quantitative results in Paper I (Teh et al., in prep.). Use the sliders to explore how the dominant feedback mechanism shifts across parameter space.
        </p>

        <p className="mt-2">
          <a href="https://trinitysf.readthedocs.io/"
             target="_blank" rel="noopener noreferrer"
             style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[13px] text-teal underline underline-offset-[3px] decoration-1">
            How does TRINITY compute this? →
          </a>
        </p>
      </div>
    </section>
  )
}

function Section4Contributions() {
  const items = [
    { title: 'Phase-aware driving pressure', desc: 'Switches between thermal and ram pressure at each evolutionary phase.' },
    { title: 'Smooth energy → momentum transition', desc: 'Blends driving pressure across the cooling transition instead of a hard switch.' },
    { title: 'Flexible density profiles', desc: 'Supports power-law (α = 0, −1, −2) and Bonnor-Ebert sphere profiles.' },
    { title: 'Radiation pressure + dust', desc: 'Direct and IR-reprocessed radiation pressure on dusty shells.' },
    { title: 'Ionisation-front tracking', desc: 'Strömgren-radius calculation within the swept-up shell.' },
    { title: 'Terminal momentum diagnostics', desc: 'Tracks total injected momentum and bubble size for population synthesis.' },
  ]

  return (
    <section id="contributions" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={4} title="Contributions" />
        <div>
          {items.map((item, i) => (
            <div key={i} className="py-3.5 border-b border-border-rule flex gap-4 items-baseline last:border-b-0">
              <span style={{ fontFamily: 'var(--font-ui)' }}
                    className="text-[13px] text-ink-tertiary w-5 shrink-0 text-right">
                {i + 1}
              </span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)' }}
                     className="text-[15px] font-semibold text-ink-primary">
                  {item.title}
                </div>
                <div style={{ fontFamily: 'var(--font-display)' }}
                     className="text-[14px] text-ink-secondary mt-0.5">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Section5Papers() {
  const papers = [
    { num: 'Paper I', title: 'Code & Methods', status: 'Teh et al. (in prep.)' },
    { num: 'Paper II', title: 'Feedback Dominance', status: '(upcoming)' },
    { num: 'Paper III', title: 'Cluster Property Inference', status: '(upcoming)' },
    { num: 'Paper IV', title: 'Scaling Relations', status: '(upcoming)' },
    { num: 'Paper V', title: 'Synthetic Bubble Populations', status: '(upcoming)' },
  ]

  return (
    <section id="papers" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={5} title="Papers" />
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
              <span style={{ fontFamily: 'var(--font-display)' }}
                    className="text-[15px] font-semibold text-ink-primary">
                {p.title}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)' }}
                    className="text-[12px] text-ink-tertiary">
                — {p.status}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[14px] italic text-ink-tertiary mt-6">
          Further papers covering stochastic sampling, observational comparisons,
          and sub-grid prescriptions are planned.
        </p>
      </div>
    </section>
  )
}

function Section6Code() {
  return (
    <section id="code" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={6} title="Code and documentation" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65]">
          Full documentation, installation guide, and API reference are available at{' '}
          <a href="https://trinitysf.readthedocs.io/"
             target="_blank" rel="noopener noreferrer"
             style={{ fontFamily: 'var(--font-ui)' }}
             className="text-teal underline underline-offset-[3px] decoration-1">
            trinitysf.readthedocs.io
          </a>.
          {' '}The source code is hosted on{' '}
          <a href="https://github.com/JiaWeiTeh/trinity"
             target="_blank" rel="noopener noreferrer"
             style={{ fontFamily: 'var(--font-ui)' }}
             className="text-teal underline underline-offset-[3px] decoration-1">
            GitHub
          </a>.
        </p>
      </div>
    </section>
  )
}

function Appendices() {
  return (
    <section id="appendices" className="py-12">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number="A" title="Appendices" />
        <div className="space-y-3">
          <details className="appendix-card">
            <summary>Appendix A. Notation</summary>
            <p>R<sub>sh</sub>: shell outer radius; R<sub>b</sub>: bubble radius; R<sub>IF</sub>: ionisation-front radius; P<sub>H II</sub>: ionised-gas thermal pressure; P<sub>rad</sub>: radiation pressure.</p>
          </details>
          <details className="appendix-card">
            <summary>Appendix B. Explorer assumptions</summary>
            <p>The explorer shows interpolated force fractions from a precomputed grid (log M<sub>cl</sub>=4–7 and ε<sub>sf</sub>=5–30%) with channels normalised to sum to unity at every timestep.</p>
          </details>
          <details className="appendix-card">
            <summary>Appendix C. Image credits</summary>
            <p>Rosette Nebula image: DECam, CTIO/NOIRLab/DOE/NSF/AURA. Schematic figures and derived visual diagnostics are generated for TRINITY website presentation.</p>
          </details>
          <details className="appendix-card">
            <summary>Appendix D. Code availability</summary>
            <p>TRINITY source code and documentation are maintained publicly via the project GitHub repository and Read the Docs documentation site.</p>
          </details>
        </div>
      </div>
    </section>
  )
}

function Acknowledgements() {
  const messages = [
    'JWT thanks the mass-to-light ratio for keeping things interesting, and coffee for keeping things moving.',
    'JWT acknowledges the Sun for powering the H\u2009II regions, and espresso for powering the code.',
    'JWT is grateful to the Rosette Nebula for looking exactly like a textbook figure, and to RSK for pointing out when the code does not.',
    'JWT thanks the ODE solver for converging most of the time.',
    'JWT acknowledges gravity for providing the only restoring force in this problem, and in the chair.',
    'JWT thanks the interstellar medium for being compressible, and deadlines for being incompressible.',
    'JWT is grateful to Starburst99 for the stellar models, and to Heidelberg\'s bakeries for the fuel.',
    'JWT thanks the anonymous mass-loading parameter for absorbing all remaining uncertainties.',
    'JWT acknowledges the shell for not dissolving before the paper was written.',
  ];

  const [msg] = useState(() => messages[Math.floor(Math.random() * messages.length)]);

  return (
    <section className="py-10">
      <div className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary leading-relaxed">
          <span className="font-medium italic">Acknowledgements. </span>
          {msg}
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
           className="text-[12px] text-ink-tertiary leading-relaxed">
          <span className="font-medium italic">Contact. </span>
          Jia Wei Teh · PhD student, International Max Planck Research School for Astronomy and Cosmic Physics at the University of Heidelberg (IMPRS-HD) · Institut für Theoretische Astrophysik (ITA), Zentrum für Astronomie der Universität Heidelberg, Albert-Ueberle-Str. 2, 69120 Heidelberg, Germany
        </p>
      </div>
    </section>
  );
}

/* ── Composition ─────────────────────────────────────────────── */

export default function ContentSections() {
  const [time, setTime] = useState(1.0)

  return (
    <div>
      <Abstract />
      <SectionRule />
      <Figure1 />
      <SectionRule />
      <Section1Overview />
      <SectionRule />
      <Section2Model time={time} setTime={setTime} />
      <SectionRule />
      <Section3Diagnostics />
      <SectionRule />
      <Section4Contributions />
      <SectionRule />
      <Section5Papers />
      <SectionRule />
      <Section6Code />
      <SectionRule />
      <Appendices />
      <SectionRule />
      <Acknowledgements />
      <SectionRule />
      <Contact />
    </div>
  )
}
