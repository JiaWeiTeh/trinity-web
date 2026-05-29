export default function TitleBlock({ onViewChange }) {
  return (
    <section className="pb-8">
      <div className="max-w-[680px] mx-auto text-center">

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-4xl md:text-5xl font-semibold text-ink-primary tracking-wide mb-3">
          TRINITY
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] text-ink-secondary leading-relaxed mb-5">
          Feedback-driven bubble evolution in molecular clouds
        </p>

        {/* Author line */}
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[14px] text-ink-primary mb-1">
          Jia Wei Teh<sup>1</sup>, Ralf S. Klessen<sup>1</sup>, Simon C. O. Glover<sup>1</sup>, Kathryn Kreckel<sup>2</sup>
        </p>

        {/* Affiliations */}
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mb-4 leading-relaxed">
          <sup>1</sup> ITA/ZAH, Universität Heidelberg &nbsp;&nbsp; <sup>2</sup> ARI/ZAH, Universität Heidelberg
        </p>

        {/* Construction notice — intentionally feels like a taped-on note */}
        <div style={{ fontFamily: 'var(--font-ui)' }}
             className="inline-block border border-dashed border-ink-tertiary bg-amber-50/60 px-4 py-2 text-[12px] text-ink-secondary mb-6 max-w-[520px] text-left leading-relaxed">
          <span className="font-medium italic">Notice. </span>
          The documentation is under active construction; the website and code are expected to stabilise by mid-2026.
        </div>

        {/* Links */}
        <div className="flex justify-center gap-5">
          <button
            type="button"
            onClick={() => onViewChange?.('start')}
            style={{ fontFamily: 'var(--font-ui)' }}
            className="text-[13px] text-teal underline underline-offset-[3px] decoration-1 cursor-pointer">
            Get started →
          </button>
          <a href="https://arxiv.org/abs/2605.27517"
             target="_blank" rel="noopener noreferrer"
             style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[13px] text-teal underline underline-offset-[3px] decoration-1">
            View Paper I →
          </a>
        </div>
      </div>
    </section>
  );
}
