import startContent from '../content/getting-started.md?raw'
import Markdown from './Markdown'

const STEPS = [
  { num: '01', label: 'Clone', detail: 'git clone the repository.' },
  { num: '02', label: 'Install', detail: 'pip install the Python dependencies.' },
  { num: '03', label: 'Run', detail: 'python run.py with a parameter file.' },
]

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

        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className="rounded-[14px] border border-border-card bg-paper/60 p-5"
            >
              <p
                style={{ fontFamily: 'var(--font-ui)' }}
                className="text-[11px] uppercase tracking-[0.26em] text-ink-tertiary"
              >
                {s.num}
              </p>
              <p
                style={{ fontFamily: 'var(--font-display)' }}
                className="mt-4 text-[20px] font-semibold leading-tight text-ink-primary"
              >
                {s.label}
              </p>
              <p
                style={{ fontFamily: 'var(--font-ui)' }}
                className="mt-2 text-[13px] text-ink-secondary"
              >
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </header>

      <article className="docs-article max-w-[760px]">
        <Markdown content={startContent} onNavigate={onNavigate} />
      </article>
    </section>
  )
}
