import { PAPER_URL, REPO_URL } from '../links'

const LINK = 'text-[13px] text-teal underline underline-offset-[3px] decoration-1'

export default function TitleBlock({ onNavigate }) {
  return (
    <section className="pb-8">
      <div className="max-w-[720px] mx-auto text-center">
        <h1 
            className="font-display text-5xl md:text-6xl font-semibold text-ink-primary tracking-[0.01em] leading-tight mb-4">
          TRINITY
        </h1>

        <p 
           className="font-display text-[17px] md:text-[20px] text-ink-secondary leading-[1.55] mb-6">
          Feedback-driven bubble evolution in molecular clouds
        </p>

        <p 
           className="font-display text-[14px] text-ink-primary mb-1">
          Jia Wei Teh (郑家伟), Ralf S. Klessen, Simon C. O. Glover, and Kathryn Kreckel
        </p>
        <p 
           className="font-ui text-[12px] text-ink-tertiary mb-2">
          Zentrum für Astronomie der Universität Heidelberg
        </p>
        <p 
           className="font-ui text-[11px] text-ink-tertiary italic mb-6">
          Code version 1.0 · Paper I, Teh et al. (2026)
        </p>

        <div 
             className="font-ui flex flex-wrap justify-center gap-x-5 gap-y-2">
          <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
            Read Paper I →
          </a>
          <button type="button" onClick={() => onNavigate?.('?view=docs&page=getting-started')}
                  className={`${LINK} cursor-pointer`}>
            Get started →
          </button>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
            GitHub →
          </a>
        </div>
      </div>
    </section>
  )
}
