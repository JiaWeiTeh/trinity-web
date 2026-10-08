import CopyButton from './CopyButton'
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

/* Paper I as an arXiv e-print, keyed by its ADS bibcode. Replace with the
   journal entry once the A&A version is out. */
const BIBTEX = `@ARTICLE{2026arXiv260527517T,
       author = {{Teh}, Jia Wei and {Klessen}, Ralf S. and {Glover}, Simon C.~O. and {Kreckel}, Kathryn},
        title = "{TRINITY: A coupled model of winds, radiation, and photoionised gas in molecular clouds. I. Methods and validation}",
      journal = {arXiv e-prints},
         year = 2026,
        month = may,
          eid = {arXiv:2605.27517},
archivePrefix = {arXiv},
       eprint = {2605.27517},
       adsurl = {https://ui.adsabs.harvard.edu/abs/2026arXiv260527517T},
}`

const LINK = 'text-teal underline underline-offset-[3px] decoration-1'

/* Tag in the margin; title over its citation, the title linking to the ADS record. */
function Row({ tag, title, status, href }) {
  return (
    <div className="py-3 border-b border-border-rule flex gap-3 last:border-b-0">
      <span className="font-ui text-[12px] font-medium text-teal w-[56px] shrink-0 pt-[3px]">{tag}</span>
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
        <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className={LINK}>Paper I</a>:
      </p>
      <div className="code-block code-block--light">
        <CopyButton getText={() => BIBTEX} />
        <pre className="font-mono text-[12px] leading-[1.55] rounded-md m-0 px-4 py-3.5 pr-12 overflow-x-auto">
          {BIBTEX}
        </pre>
      </div>
      <p className="font-display text-[15px] leading-7 text-ink-secondary">
        The repository&rsquo;s <code className="text-[13px]">CITATION.cff</code>{' '}
        gives GitHub&rsquo;s <em>Cite this repository</em> button the same
        paper. TRINITY builds on WARPFIELD, so you may also wish to cite{' '}
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
