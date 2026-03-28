import { lazy, Suspense } from 'react'
import TeamGrid from './TeamGrid'
import ComparisonSlider from './ComparisonSlider'

const FeedbackExplorer = lazy(() => import('./FeedbackExplorer'))

const features = [
  { title: 'Phase-aware driving pressure', desc: 'Switches between thermal and ram pressure at each evolutionary phase.' },
  { title: 'Smooth energy → momentum transition', desc: 'Blends driving pressure across the cooling transition instead of a hard switch.' },
  { title: 'Flexible density profiles', desc: 'Supports power-law (α = 0, −1, −2) and Bonnor-Ebert sphere profiles.' },
  { title: 'Radiation pressure + dust', desc: 'Direct and IR-reprocessed radiation pressure on dusty shells.' },
  { title: 'Ionisation-front tracking', desc: 'Strömgren-radius calculation within the swept-up shell.' },
  { title: 'Terminal momentum & scaling', desc: 'Tracks total injected momentum and bubble size for population synthesis.' },
]

const papers = [
  { num: 'I', title: 'Code & Methods', cite: 'Teh et al. (in prep.)' },
  { num: 'II', title: 'Feedback Dominance', cite: '(upcoming)' },
  { num: 'III', title: 'Cluster Property Inference', cite: '(upcoming)' },
  { num: 'IV', title: 'Scaling Relations', cite: '(upcoming)' },
  { num: 'V', title: 'Synthetic Bubble Populations', cite: '(upcoming)' },
]

function SectionMarker({ children }) {
  return (
    <div
      className="text-ink-tertiary text-[10px] uppercase tracking-widest mb-6"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2
      className="text-[32px] font-semibold text-ink-primary mb-4 leading-tight"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {children}
    </h2>
  )
}

function Rule({ wide }) {
  return (
    <div className={wide ? 'max-w-[900px] mx-auto' : 'max-w-[640px] mx-auto'}>
      <hr className="border-t border-border-rule" />
    </div>
  )
}

export default function ContentSections() {
  return (
    <div className="bg-paper">
      {/* Physics */}
      <section id="physics" className="py-16 px-6 md:px-10">
        <div className="max-w-[640px] mx-auto">
          <SectionMarker>§ Physics</SectionMarker>
          <SectionTitle>What is TRINITY?</SectionTitle>
          <p
            className="text-[17px] text-ink-secondary mb-6"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.65 }}
          >
            TRINITY is a 1D spherical thin-shell code that self-consistently models
            stellar winds, supernovae, radiation pressure, photoionised gas pressure,
            and gravity to track the evolution of feedback-driven bubbles in molecular
            clouds. It succeeds WARPFIELD (Rahner et al. 2017, 2019) with a
            phase-aware treatment of the energy-to-momentum transition, multiple
            density profiles, and ionisation-front tracking.
          </p>
          <div className="border border-border-card rounded-lg bg-card p-5 mt-6">
            <p className="text-ink-secondary text-sm" style={{ fontFamily: 'var(--font-display)' }}>
              Full code documentation, installation guide, and API reference →{' '}
              <a
                href="https://trinitysf.readthedocs.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline underline-offset-[3px] decoration-1"
                style={{ fontFamily: 'var(--font-ui)', fontSize: 13 }}
              >
                trinitysf.readthedocs.io
              </a>
            </p>
          </div>
        </div>
      </section>

      <Rule />

      {/* Observation vs. model comparison */}
      <section className="py-12 px-6 md:px-10">
        <div className="max-w-[640px] mx-auto">
          <SectionMarker>§ Observation vs. model</SectionMarker>
          <h2
            className="text-[26px] font-semibold text-ink-primary mb-3 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            From nebula to schematic
          </h2>
          <p
            className="text-[15px] text-ink-secondary mb-6"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.6 }}
          >
            Drag the slider to compare the Rosette Nebula — a wind-blown bubble
            around NGC 2244 — with the idealised zones that TRINITY models.
          </p>
          <ComparisonSlider />
          <p className="text-[11px] text-ink-tertiary mt-3" style={{ fontFamily: 'var(--font-ui)' }}>
            Image: NGC 2244 / Rosette Nebula. DECam, Blanco 4m, CTIO/NOIRLab/DOE/NSF/AURA.
          </p>
        </div>
      </section>

      <Rule />

      {/* What's New */}
      <section id="features" className="py-16 px-6 md:px-10">
        <div className="max-w-[640px] mx-auto">
          <SectionMarker>§ What&apos;s new</SectionMarker>
          <SectionTitle>What&apos;s New?</SectionTitle>
          <div>
            {features.map((f, i) => (
              <div key={i} className="py-3.5 border-b border-border-rule flex gap-4 items-baseline last:border-b-0">
                <span className="text-[13px] text-ink-tertiary w-5 shrink-0" style={{ fontFamily: 'var(--font-ui)' }}>{i + 1}</span>
                <div>
                  <div className="text-[15px] font-semibold text-ink-primary" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</div>
                  <div className="text-[14px] text-ink-secondary mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Rule wide />

      {/* Explorer */}
      <section id="explorer" className="py-16 px-6 md:px-10">
        <div className="max-w-[900px] mx-auto">
          <SectionMarker>§ Explorer</SectionMarker>
          <SectionTitle>Feedback Explorer</SectionTitle>
          <Suspense fallback={<p className="text-ink-tertiary text-sm">Loading explorer...</p>}>
            <FeedbackExplorer />
          </Suspense>
        </div>
      </section>

      <Rule />

      {/* Papers */}
      <section id="papers" className="py-16 px-6 md:px-10">
        <div className="max-w-[640px] mx-auto">
          <SectionMarker>§ Papers</SectionMarker>
          <SectionTitle>Papers</SectionTitle>
          <div>
            {papers.map((p) => (
              <div key={p.num} className="py-3 border-b border-border-rule flex items-baseline gap-3">
                <span className="text-[12px] font-medium text-teal w-[56px] shrink-0" style={{ fontFamily: 'var(--font-ui)' }}>Paper {p.num}</span>
                <span className="text-[15px] font-semibold text-ink-primary" style={{ fontFamily: 'var(--font-display)' }}>{p.title}</span>
                <span className="text-[12px] text-ink-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>— {p.cite}</span>
              </div>
            ))}
          </div>
          <p className="text-[14px] italic text-ink-tertiary mt-6" style={{ fontFamily: 'var(--font-display)' }}>
            Further papers covering stochastic sampling, observational comparisons,
            and sub-grid prescriptions are planned.
          </p>
        </div>
      </section>

      <Rule />

      {/* Team */}
      <section id="team" className="py-16 px-6 md:px-10">
        <div className="max-w-[640px] mx-auto">
          <SectionMarker>§ Team</SectionMarker>
          <SectionTitle>Team</SectionTitle>
          <TeamGrid />
        </div>
      </section>
    </div>
  )
}
