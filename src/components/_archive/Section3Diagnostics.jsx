// Archived: the "Diagnostic atlas" section, temporarily removed from the
// paper page (ContentSections.jsx) and to be reinstated later. When restoring,
// re-import this section and renumber its figure to follow the shell-structure
// figure. SectionHeading and Sidenote live in ContentSections.jsx; FeedbackExplorer
// is the force-fraction explorer.
import { lazy, Suspense } from 'react'

const FeedbackExplorer = lazy(() => import('../FeedbackExplorer'))

export default function Section3Diagnostics({ onViewChange, SectionHeading, Sidenote }) {
  return (
    <section id="diagnostics" className="py-12">
      <div className="max-w-[680px] mx-auto mb-8">
        <SectionHeading number={3} title="Diagnostic atlas" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-[1.65]">
          TRINITY computes the full force-fraction history for any combination of cloud mass and star-formation efficiency.
          <Sidenote>
            The grid spans M<sub>cl</sub> = 10⁴–10⁷ M<sub>☉</sub> and ε<sub>sf</sub> = 5–30%. Force fractions are normalised to sum to unity.
          </Sidenote>
          {' '}The explorer below interpolates across a precomputed grid to show how the dominant feedback mechanism shifts across parameter space.
        </p>
      </div>

      <div id="fig2" className="max-w-[680px] mx-auto">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] font-medium text-teal mb-1">
          Interactive Fig. 2
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
          Interactive Fig. 2 — Illustrative force-fraction histories for selected cloud mass and star formation efficiency. Quantitative results in Paper I (Teh et al., in prep.). Use the sliders to explore how the dominant feedback mechanism shifts across parameter space.
        </p>

        <p className="mt-2">
          <button
            type="button"
            onClick={() => onViewChange?.('docs')}
            style={{ fontFamily: 'var(--font-ui)' }}
            className="text-[13px] text-teal underline underline-offset-[3px] decoration-1">
            How does TRINITY compute this? →
          </button>
        </p>
      </div>
    </section>
  )
}
