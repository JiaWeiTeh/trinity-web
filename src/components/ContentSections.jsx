import { useState, lazy, Suspense } from 'react'
import ComparisonSlider from './ComparisonSlider'
import BubbleDiagram from './BubbleDiagram'
import TimeScrubber from './TimeScrubber'
import Sparkline from './Sparkline'
import PressureBar from './PressureBar'

const FeedbackExplorer = lazy(() => import('./FeedbackExplorer'))

function SectionRule({ wide = false }) {
  return (
    <div className={`${wide ? 'max-w-[960px]' : 'max-w-[680px]'} mx-auto px-6 md:px-10`}>
      <hr className="border-t border-border-rule" />
    </div>
  )
}

function SectionHeading({ number, title }) {
  return (
    <h2 className="mb-4 flex items-baseline gap-2">
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-[26px] font-semibold text-ink-tertiary">
        {number}.
      </span>
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-[26px] font-semibold text-ink-primary">
        {title}
      </span>
    </h2>
  )
}

function Abstract() {
  return (
    <section id="abstract" className="py-10 px-6 md:px-10">
      <div className="max-w-[680px] mx-auto">
        <div className="border-l-4 border-border-card pl-5 py-1">
          <p style={{ fontFamily: 'var(--font-display)' }}
             className="text-[15px] text-ink-secondary leading-[1.7]">
            TRINITY is a 1D spherical thin-shell code that self-consistently evolves stellar wind bubbles, photoionised regions, and swept-up shells in giant molecular clouds. The code couples stellar winds, supernovae, radiation pressure, photoionised-gas thermal pressure, and gravity across energy-driven, transition, and momentum-driven phases. It succeeds WARPFIELD (Rahner et al. 2017, 2019) with a phase-aware treatment of the energy-to-momentum transition, flexible density profiles, and ionisation-front tracking within the shell. This site presents the code, its physical model, and interactive diagnostics exploring feedback dominance across parameter space.
          </p>
        </div>
      </div>
    </section>
  )
}

function Figure1() {
  return (
    <section className="py-10 px-6 md:px-10">
      <div className="max-w-[960px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1">
          Interactive Fig. 1
        </p>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[15px] font-semibold text-ink-primary mb-4">
          From nebula to schematic
        </p>

        <ComparisonSlider />

        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mt-3 leading-relaxed max-w-[800px]">
          Fig. 1 — Comparison between NGC 2244 (Rosette Nebula; DECam, CTIO/NOIRLab/DOE/NSF/AURA) and the idealised spherical zones evolved by TRINITY. Drag the divider to compare observed morphology with model structure.
        </p>
      </div>
    </section>
  )
}

function Section1Overview() {
  return (
    <section id="overview" className="py-12 px-6 md:px-10">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={1} title="Overview" />
        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            Massive stars reshape their natal molecular clouds through stellar winds, supernovae, radiation pressure, and the thermal pressure of photoionised gas. The relative importance of these mechanisms — and how dominance shifts over time — controls cloud dispersal timescales, triggered star formation, and the momentum budget available to drive galactic outflows.
          </p>
          <p>
            Existing models typically treat these feedback channels in isolation or make simplifying assumptions about the transition from energy-driven to momentum-driven expansion. TRINITY evolves all five mechanisms self-consistently within a 1D spherical thin-shell framework, tracking the full dynamical sequence from initial wind-blown bubble through shell formation, radiative cooling, and late-time momentum-driven expansion.
          </p>
          <p>
            The Rosette Nebula (Fig. 1) illustrates the multi-zone structure that TRINITY captures: a central cluster driving a wind cavity, surrounded by a hot bubble, an ionised shell, a neutral swept-up shell, and the ambient molecular cloud.
          </p>
        </div>
      </div>
    </section>
  )
}

function Section2Model({ time, setTime }) {
  const phase = time < 2 ? 'energy' : time < 4 ? 'transition' : 'momentum'

  return (
    <section id="model" className="py-12 px-6 md:px-10">
      <div className="max-w-[680px] mx-auto mb-8">
        <SectionHeading number={2} title="Physical model" />
        <div style={{ fontFamily: 'var(--font-display)' }}
             className="text-[17px] text-ink-secondary leading-[1.65] space-y-4">
          <p>
            TRINITY divides the feedback-driven expansion into three dynamical phases. In the energy-driven phase, the hot shocked wind inflates a high-pressure bubble that drives a swept-up shell into the surrounding cloud. As radiative cooling drains thermal energy from the bubble interior, the system transitions to a momentum-driven regime where photoionised-gas pressure and wind ram pressure sustain the expansion. The transition between these regimes is handled smoothly rather than as a discrete switch.
          </p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1 px-6 md:px-0">
          Interactive Fig. 2
        </p>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[15px] font-semibold text-ink-primary mb-4 px-6 md:px-0">
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
           className="text-[12px] text-ink-tertiary mt-4 leading-relaxed max-w-[800px] mx-auto px-6 md:px-0">
          Interactive Fig. 2 — Idealised 1D shell structure in the energy-driven, transition, and momentum-driven regimes. Drag the time slider to evolve the bubble; hover zones to reveal governing equations. The pressure bar shows the instantaneous force-fraction decomposition.
        </p>
      </div>
    </section>
  )
}

function Section3Diagnostics() {
  return (
    <section id="diagnostics" className="py-12 px-6 md:px-10">
      <div className="max-w-[680px] mx-auto mb-8">
        <SectionHeading number={3} title="Interactive diagnostics" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65]">
          TRINITY computes the full force-fraction history for any combination of cloud mass and star-formation efficiency. The explorer below interpolates across a precomputed grid to show how the dominant feedback mechanism shifts across parameter space.
        </p>
      </div>

      <div className="max-w-[960px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1 px-6 md:px-0">
          Interactive Fig. 3
        </p>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[15px] font-semibold text-ink-primary mb-4 px-6 md:px-0">
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
           className="text-[12px] text-ink-tertiary mt-4 leading-relaxed max-w-[800px] mx-auto px-6 md:px-0">
          Interactive Fig. 3 — Illustrative force-fraction histories for selected cloud mass and star formation efficiency. Quantitative results in Paper I (Teh et al., in prep.). Use the sliders to explore how the dominant feedback mechanism shifts across parameter space.
        </p>

        <p className="mt-2 px-6 md:px-0">
          <a href="https://trinitysf.readthedocs.io"
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
    <section id="contributions" className="py-12 px-6 md:px-10">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={4} title="Contributions" />
        <div>
          {items.map((item, i) => (
            <div key={i} className="py-3.5 border-b border-border-rule flex gap-4 items-baseline last:border-b-0">
              <span style={{ fontFamily: 'var(--font-ui)' }}
                    className="text-[13px] text-ink-tertiary w-5 shrink-0">
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
    <section id="papers" className="py-12 px-6 md:px-10">
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
    <section id="code" className="py-12 px-6 md:px-10">
      <div className="max-w-[680px] mx-auto">
        <SectionHeading number={6} title="Code and documentation" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65]">
          Full documentation, installation guide, and API reference are available at{' '}
          <a href="https://trinitysf.readthedocs.io"
             target="_blank" rel="noopener noreferrer"
             style={{ fontFamily: 'var(--font-ui)' }}
             className="text-teal underline underline-offset-[3px] decoration-1">
            trinitysf.readthedocs.io
          </a>.
          {' '}The source code is hosted on{' '}
          <a href="https://github.com/jiaweiteh/trinity"
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

export default function ContentSections() {
  const [time, setTime] = useState(1.0)

  return (
    <div>
      <Abstract />
      <SectionRule />
      <Figure1 />
      <SectionRule wide />
      <Section1Overview />
      <SectionRule />
      <Section2Model time={time} setTime={setTime} />
      <SectionRule wide />
      <Section3Diagnostics />
      <SectionRule wide />
      <Section4Contributions />
      <SectionRule />
      <Section5Papers />
      <SectionRule />
      <Section6Code />
    </div>
  )
}
