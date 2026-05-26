import startContent from '../content/getting-started.md?raw'
import Markdown from './Markdown'

export default function StartView({ onNavigate }) {
  return (
    <section>
      <header className="mb-10 max-w-[760px]">
        <p style={{ fontFamily: 'var(--font-ui)' }}
           className="text-[11px] uppercase tracking-[0.28em] text-ink-tertiary">
          Quickstart
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="mt-5 text-[34px] sm:text-[42px] font-semibold leading-tight tracking-[-0.015em] text-ink-primary">
          Getting started
        </h1>
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="mt-5 max-w-[680px] text-[17px] sm:text-[20px] leading-[1.55] text-ink-secondary">
          The shortest path from cloning the repository to running a shipped model. For the physical picture see the Paper tab; for the full keyword reference, see Docs.
        </p>
      </header>

      <article className="docs-article max-w-[760px]">
        <Markdown content={startContent} onNavigate={onNavigate} />
      </article>
    </section>
  )
}
