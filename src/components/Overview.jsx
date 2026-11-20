import { useState, useEffect, useCallback } from 'react'
import Publications from './Publications'
import AppLink from './AppLink'
import CopyButton from './CopyButton'
import { PAPER_URL } from '../links'

const QUICKSTART = `git clone https://github.com/JiaWeiTeh/trinity
cd trinity && pip install -r requirements.txt
python run.py param/simple_cluster.param`

/* ── Shared pieces ───────────────────────────────────────────── */

function Rule() {
  return <hr className="border-t border-border-rule" />
}

function SectionHeading({ children }) {
  return (
    <h2 
        className="font-display text-[26px] font-semibold text-ink-primary leading-none mb-5">
      {children}
    </h2>
  )
}

/* One place to tune the body type for the page. */
function Prose({ children }) {
  return (
    <div 
         className="font-display text-[17px] text-ink-secondary leading-[1.65] space-y-4">
      {children}
    </div>
  )
}

function TextLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="text-teal underline underline-offset-[3px] decoration-1">
      {children}
    </a>
  )
}

/* ── Sections ────────────────────────────────────────────────── */

function Introduction() {
  return (
    <Prose>
      <p>
        TRINITY is a one-dimensional code for the feedback-driven expansion of
        bubbles in molecular clouds. Given a cloud&rsquo;s mass, density profile,
        star-formation efficiency and surroundings, it integrates the equation
        of motion of a single swept-up shell and follows its radius, velocity,
        thermal state and force budget from the first stellar winds to the
        shell&rsquo;s fate: dispersal of the cloud, or stalling and re-collapse.
      </p>
      <p>
        Clouds in nearby galaxies are cleared within a few million years of
        forming their first massive stars, before any of them explode as
        supernovae. TRINITY therefore follows the pre-supernova channels
        together: stellar winds, direct and dust-reprocessed radiation
        pressure, and the pressure of photoionised gas, each applied according
        to the bubble&rsquo;s evolutionary phase. It succeeds WARPFIELD, keeping
        that code&rsquo;s speed while adding photoionised-gas pressure as an
        explicit driver and a choice of cloud profile: uniform, power-law, or
        Bonnor–Ebert.
      </p>
      <p>
        A run takes tens of minutes on one core and returns quantities that
        can be compared with observations: the shell&rsquo;s size and speed, the
        balance of forces, and the fraction of ionising photons that escape.
        Surveys across cloud mass, density, efficiency and metallicity are
        therefore practical. The model, its validation, and the first results
        are in <TextLink href={PAPER_URL}>Paper I</TextLink>.
      </p>
    </Prose>
  )
}

function GetTheCode({ onNavigate }) {
  return (
    <section id="code" className="py-12">
      <SectionHeading>Get the code</SectionHeading>
      <div className="code-block">
        <CopyButton getText={() => QUICKSTART} />
        <pre>{QUICKSTART}</pre>
      </div>
      <p 
         className="font-ui mt-4 text-[13px] text-ink-tertiary leading-relaxed">
        Pure Python, no compilation step.{' '}
        <AppLink href="?view=docs&page=running" onNavigate={onNavigate}
                 className="text-teal underline underline-offset-[3px] decoration-1">
          Running TRINITY →
        </AppLink>
        {' '}covers parameter files, sweeps and outputs.
      </p>
    </section>
  )
}

function Acknowledgements() {
  const messages = [
    'JWT acknowledges the shell for not dissolving before the paper was written.',
    'JWT thanks the ODE solver for converging most of the time.',
    'JWT thanks the mass-to-light ratio for keeping things interesting, and coffee for keeping things moving.',
    'JWT acknowledges the Sun for powering the H II regions, and espresso for powering the code.',
    'JWT is grateful to the Rosette Nebula for looking exactly like a textbook figure.',
    'JWT acknowledges gravity for providing the only restoring force in this problem, and in the chair.',
    'JWT thanks the interstellar medium for being compressible, and deadlines for being incompressible.',
    'JWT is grateful to Starburst99 for the stellar models, and to Heidelberg\'s bakeries for the fuel.',
    'JWT acknowledges Reviewer 1, who was right.',
    'JWT acknowledges the units, which were checked. Twice.',
  ]

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const advance = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setIndex((i) => (i + 1) % messages.length)
      setVisible(true)
    }, 500)
  }, [messages.length])

  useEffect(() => {
    const id = setTimeout(advance, 60000)
    return () => clearTimeout(id)
  }, [index, advance])

  return (
    <section className="py-10">
      <p 
         className="font-ui text-[12px] font-medium italic text-ink-tertiary mb-2">
        Acknowledgements
      </p>
      <p
        onClick={advance}
        title="Click for another"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 500ms ease', cursor: 'pointer' }}
        className="font-ui text-[12px] text-ink-tertiary leading-relaxed hover:text-ink-secondary">
        {messages[index]}
      </p>
    </section>
  )
}

/* ── Composition ─────────────────────────────────────────────── */

export default function Overview({ onNavigate }) {
  return (
    <>
      <Rule />
      <section id="introduction" className="py-12">
        <Introduction />
      </section>
      <Rule />
      <GetTheCode onNavigate={onNavigate} />
      <Rule />
      <section id="publications" className="py-12">
        <SectionHeading>Publications</SectionHeading>
        <Publications />
      </section>
      <Rule />
      <Acknowledgements />
    </>
  )
}
