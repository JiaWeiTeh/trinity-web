import ComparisonSlider from '../ComparisonSlider'

export default function Figure1() {
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
