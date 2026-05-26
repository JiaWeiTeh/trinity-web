export default function TitleBlock({ onViewChange }) {
  return (
    <section className="pb-8">
      <div className="max-w-[720px] mx-auto text-center">

        {/* Kicker — same style as the Docs / Start headers */}
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[11px] uppercase tracking-[0.28em] text-ink-tertiary mb-6">
          Methods code · Paper I
        </p>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-5xl md:text-6xl font-semibold text-ink-primary tracking-[0.01em] leading-tight mb-4">
          TRINITY
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[17px] md:text-[20px] text-ink-secondary leading-[1.55] mb-6">
          Feedback-driven bubble evolution in molecular clouds
        </p>

        {/* Author line */}
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[14px] text-ink-primary mb-1">
          Jia Wei Teh<sup>1</sup>, Ralf S. Klessen<sup>1</sup>, Simon C. O. Glover<sup>1</sup>, Kathryn Kreckel<sup>2</sup>
        </p>

        {/* Affiliations */}
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mb-6 leading-relaxed">
          <sup>1</sup> ITA/ZAH, Universität Heidelberg &nbsp;&nbsp; <sup>2</sup> ARI/ZAH, Universität Heidelberg
        </p>

        {/* Links */}
        <div className="flex justify-center gap-5">
          <button
            type="button"
            onClick={() => onViewChange?.('start')}
            style={{ fontFamily: 'var(--font-ui)' }}
            className="text-[13px] text-teal underline underline-offset-[3px] decoration-1">
            Get started →
          </button>
          <a href="#papers"
             style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[13px] text-teal underline underline-offset-[3px] decoration-1">
            View Paper I →
          </a>
        </div>
      </div>
    </section>
  );
}
