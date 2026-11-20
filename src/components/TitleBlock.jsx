import AppLink from './AppLink'
import { PAPER_URL, REPO_URL } from '../links'

const BUTTON = 'font-ui text-[14px] font-medium rounded-[7px] px-4 py-[9px] border transition-colors'
const PLAIN = `${BUTTON} border-border-card text-ink-primary hover:border-teal`

export default function TitleBlock({ onNavigate }) {
  return (
    <section className="pb-12">
      <h1 className="font-display text-[42px] sm:text-[56px] font-semibold text-ink-primary tracking-[0.01em] leading-[1.05] mb-4">
        TRINITY
      </h1>

      <p className="font-display text-[19px] sm:text-[22px] text-ink-secondary leading-[1.45] mb-5">
        Feedback-driven bubble evolution in molecular clouds
      </p>

      <p className="font-ui text-[14px] text-ink-tertiary leading-relaxed mb-7">
        Jia Wei Teh (郑家伟), Ralf S. Klessen, Simon C. O. Glover and Kathryn Kreckel @ Universität Heidelberg
      </p>

      <div className="flex flex-wrap gap-2.5">
        <AppLink
          href="?view=docs&page=getting-started"
          onNavigate={onNavigate}
          className={`${BUTTON} border-teal bg-teal text-paper hover:opacity-90`}
        >
          Get started
        </AppLink>
        <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className={PLAIN}>
          Read Paper I
        </a>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={PLAIN}>
          GitHub
        </a>
      </div>
    </section>
  )
}
