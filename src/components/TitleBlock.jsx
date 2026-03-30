export default function TitleBlock() {
  return (
    <section className="pt-20 md:pt-28 pb-8 px-6 md:px-10">
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
           className="text-[12px] text-ink-tertiary mb-4">
          <sup>1</sup> ITA/ZAH, Universität Heidelberg &nbsp;&nbsp; <sup>2</sup> ARI/ZAH, Universität Heidelberg
        </p>

        {/* Metadata line */}
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mb-6">
          Methods code · Paper I in prep.
        </p>

        {/* Links */}
        <div className="flex justify-center gap-5">
          <a href="https://trinitysf.readthedocs.io"
             target="_blank" rel="noopener noreferrer"
             style={{ fontFamily: 'var(--font-ui)' }}
             className="text-[13px] text-teal underline underline-offset-[3px] decoration-1">
            Read documentation →
          </a>
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
