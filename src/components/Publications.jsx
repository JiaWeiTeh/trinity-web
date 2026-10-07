import { PAPER_URL } from '../links'

/* Papers that describe TRINITY. New papers in the series are rows here. */
const PAPERS = [
  { tag: 'Paper I',
    title: 'TRINITY: A coupled model of winds, radiation, and photoionised gas in molecular clouds. I. Methods and validation',
    status: 'Teh et al. (2026), arXiv:2605.27517',
    href: PAPER_URL },
]

/* Other studies that use TRINITY, newest first. */
const USING = [
  { tag: '2026',
    title: "JWST Observations of Starbursts: A Young Bubble in NGC 253's Central Starburst",
    status: 'Sheriff et al., arXiv:2609.16190',
    href: 'https://ui.adsabs.harvard.edu/abs/arXiv:2609.16190/abstract' },
  { tag: '2026',
    title: 'The Neutral Atomic Hydrogen in the solar neighborhood (NeAtHood) project: I. Ghost in the shell: Neutral atomic hydrogen in the extended Orion nebula',
    status: 'Soler et al., A&A 711, A85',
    href: 'https://ui.adsabs.harvard.edu/abs/2026A%26A...711A..85S/abstract' },
  { tag: '2024',
    title: 'Massive star cluster formation: I. High star formation efficiency while resolving feedback of individual stars',
    status: 'Polak et al., A&A 690, A94',
    href: 'https://ui.adsabs.harvard.edu/abs/2024A%26A...690A..94P/abstract' },
]

const WARPFIELD = [
  { label: 'Rahner et al. (2017)', href: 'https://ui.adsabs.harvard.edu/abs/2017MNRAS.470.4453R/abstract' },
  { label: 'Rahner et al. (2019)', href: 'https://ui.adsabs.harvard.edu/abs/2019MNRAS.483.2547R/abstract' },
]

const LINK = 'text-teal underline underline-offset-[3px] decoration-1'

/* Tag in the margin; title over its citation, both linking to the ADS record. */
function Row({ tag, title, status, href }) {
  return (
    <div className="py-3 border-b border-border-rule flex gap-3 last:border-b-0">
      <span className="font-ui text-[12px] font-medium text-teal w-[56px] shrink-0 pt-[3px]">
        <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>{tag}</a>
      </span>
      <span className="min-w-0">
        <a href={href} target="_blank" rel="noopener noreferrer"
           className="font-display text-[15px] font-semibold text-ink-primary leading-snug hover:underline underline-offset-[3px] decoration-1">
          {title}
        </a>
        <span className="font-ui block text-[12px] text-ink-tertiary mt-0.5">{status}</span>
      </span>
    </div>
  )
}

function GroupLabel({ children }) {
  return (
    <p className="font-ui text-[11px] uppercase tracking-[0.22em] text-ink-tertiary mt-9 mb-2">
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
      <p className="font-display text-[15px] leading-7 text-ink-secondary">
        If you use TRINITY in published work, please cite{' '}
        <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className={LINK}>Paper I</a>;
        the ADS record carries the BibTeX entry, and the repository&rsquo;s{' '}
        <code className="text-[13px]">CITATION.cff</code> gives GitHub&rsquo;s{' '}
        <em>Cite this repository</em> button the same entry. TRINITY builds on
        WARPFIELD, so you may also wish to cite{' '}
        <a href={WARPFIELD[0].href} target="_blank" rel="noopener noreferrer" className={LINK}>{WARPFIELD[0].label}</a>
        {' '}and{' '}
        <a href={WARPFIELD[1].href} target="_blank" rel="noopener noreferrer" className={LINK}>{WARPFIELD[1].label}</a>.
        Stellar feedback rates come by default from{' '}
        <a href="https://www.stsci.edu/science/starburst99/" target="_blank" rel="noopener noreferrer" className={LINK}>Starburst99</a>
        {' '}(Leitherer et al. 1999).
      </p>
    </>
  )
}
