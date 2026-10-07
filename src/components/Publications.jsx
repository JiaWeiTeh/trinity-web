import { PAPER_URL } from '../links'

/* Papers that describe TRINITY. New papers in the series are rows here. */
const PAPERS = [
  { tag: 'Paper I', title: 'Code & Methods', status: 'Teh et al. (2026), arXiv:2605.27517', href: PAPER_URL },
]

/* Other studies that use TRINITY. */
const USING = [
  { tag: '2026', title: 'Neutral hydrogen around the Orion nebula',
    status: 'Soler et al., A&A 711, A85; NeAtHood I',
    href: 'https://ui.adsabs.harvard.edu/abs/2026A%26A...711A..85S/abstract' },
  { tag: '2024', title: 'Massive star cluster formation',
    status: 'Polak et al., A&A 690, A94; resolving feedback of individual stars',
    href: 'https://ui.adsabs.harvard.edu/abs/2024A%26A...690A..94P/abstract' },
]

const WARPFIELD = [
  { label: 'Rahner et al. (2017)', href: 'https://ui.adsabs.harvard.edu/abs/2017MNRAS.470.4453R/abstract' },
  { label: 'Rahner et al. (2019)', href: 'https://ui.adsabs.harvard.edu/abs/2019MNRAS.483.2547R/abstract' },
]

const LINK = 'text-teal underline underline-offset-[3px] decoration-1'

function Row({ tag, title, status, href }) {
  return (
    <div className="py-3 border-b border-border-rule flex flex-wrap items-baseline gap-x-3 gap-y-1 last:border-b-0">
      <span style={{ fontFamily: 'var(--font-ui)' }}
            className="text-[12px] font-medium text-teal w-[56px] shrink-0">
        <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>{tag}</a>
      </span>
      <span style={{ fontFamily: 'var(--font-display)' }}
            className="text-[15px] font-semibold text-ink-primary">
        {title}
      </span>
      <span style={{ fontFamily: 'var(--font-ui)' }}
            className="text-[12px] text-ink-tertiary">
        <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>{status}</a>
      </span>
    </div>
  )
}

function GroupLabel({ children }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)' }}
       className="text-[11px] uppercase tracking-[0.22em] text-ink-tertiary mt-9 mb-2">
      {children}
    </p>
  )
}

export default function Publications() {
  return (
    <>
      <div>
        {PAPERS.map((p) => <Row key={p.tag} {...p} />)}
      </div>

      <GroupLabel>Work using TRINITY</GroupLabel>
      <div>
        {USING.map((p) => <Row key={p.href} {...p} />)}
      </div>

      <GroupLabel>Citing TRINITY</GroupLabel>
      <p style={{ fontFamily: 'var(--font-display)' }}
         className="text-[15px] leading-7 text-ink-secondary">
        If you use TRINITY in published work, please cite{' '}
        <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className={LINK}>Paper I</a>;
        the ADS record carries the BibTeX entry, and the repository&rsquo;s{' '}
        <code className="text-[13px]">CITATION.cff</code> gives GitHub&rsquo;s{' '}
        <em>Cite this repository</em> button the same entry. TRINITY builds on
        WARPFIELD, so you may also wish to cite{' '}
        <a href={WARPFIELD[0].href} target="_blank" rel="noopener noreferrer" className={LINK}>{WARPFIELD[0].label}</a>
        {' '}and{' '}
        <a href={WARPFIELD[1].href} target="_blank" rel="noopener noreferrer" className={LINK}>{WARPFIELD[1].label}</a>.
      </p>
    </>
  )
}
