export default function TitleBlock({ onViewChange, onNavigate }) {
  // The contact block is at the foot of this same page, so this is an in-page
  // jump rather than a mailto — deliberate, see the address written out there.
  const jumpToContact = (e) => {
    e.preventDefault()
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'auto' : 'smooth'
    document.getElementById('contact')?.scrollIntoView({ behavior })
  }

  return (
    <section className="pb-8">
      <div className="max-w-[720px] mx-auto text-center">

        {/* Kicker — same style as the Docs / Start headers */}
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[11px] uppercase tracking-[0.28em] text-ink-tertiary mb-6">
          Paper I · Code & Methods
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
          Jia Wei Teh (郑家伟)<sup>1*</sup>, Ralf S. Klessen<sup>1,2</sup>, Simon C. O. Glover<sup>1</sup>, and Kathryn Kreckel<sup>3</sup>
        </p>

        {/* Affiliations */}
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mb-4 leading-relaxed">
          <sup>1</sup> Institut für Theoretische Astrophysik (ITA), Zentrum für Astronomie, Universität Heidelberg<br />
          <sup>2</sup> Interdisziplinäres Zentrum für Wissenschaftliches Rechnen (IWR), Universität Heidelberg<br />
          <sup>3</sup> Astronomisches Rechen-Institut (ARI), Zentrum für Astronomie, Universität Heidelberg
        </p>

        {/* Author links — quiet, in the manner of a paper's author line */}
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[12px] text-ink-tertiary mb-6 flex justify-center gap-3">
          <a href="#contact" onClick={jumpToContact}
             className="hover:text-ink-primary transition-colors duration-150">
            Email
          </a>
          <span aria-hidden="true">·</span>
          <a href="https://github.com/JiaWeiTeh" target="_blank" rel="noopener noreferrer"
             className="hover:text-ink-primary transition-colors duration-150">
            GitHub
          </a>
        </p>

        {/* Construction notice — intentionally feels like a taped-on note */}
        <div style={{ fontFamily: 'var(--font-ui)' }}
             className="inline-block border border-dashed border-ink-tertiary bg-amber-50/60 px-4 py-2 text-[12px] text-ink-secondary mb-6 max-w-[520px] text-left leading-relaxed">
          <span className="font-medium italic">Notice. </span>
          The documentation is under active construction; the website and code are expected to stabilise by the end of 2026.
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
          <button
            type="button"
            onClick={() => onNavigate?.('?view=docs&page=notebook')}
            style={{ fontFamily: 'var(--font-ui)' }}
            className="text-[13px] text-teal underline underline-offset-[3px] decoration-1 cursor-pointer">
            Notebook tutorial →
          </button>
          <a href="https://ui.adsabs.harvard.edu/abs/arXiv:2605.27517/abstract"
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
