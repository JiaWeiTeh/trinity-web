import { HOMEPAGE_URL, REPO_URL } from '../links'

/* The site's one contact block. Keeps id="contact": trinity's README links
   to /#contact. The address is written out rather than a mailto:, so it is
   not a link a crawler can harvest in one pass. */
export default function Footer() {
  return (
    <footer id="contact" className="py-8">
      <div 
           className="font-ui max-w-[1060px] mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-4 text-[12px] text-ink-tertiary leading-relaxed text-center md:text-left">
        <div>
          <div className="text-ink-primary">
            <a href={HOMEPAGE_URL} target="_blank" rel="noopener noreferrer"
               className="underline underline-offset-[3px] decoration-1">
              Jia Wei Teh
            </a>
          </div>
          <div className="text-ink-secondary">jiaweiteh.astro (at) gmail.com</div>
          <div>Universität Heidelberg, Zentrum für Astronomie, Institut für Theoretische Astrophysik, Albert-Ueberle-Straße 2, 69120 Heidelberg, Germany</div>
        </div>
        <div className="md:text-right">
          <div>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
               className="hover:text-ink-primary transition-colors duration-150">
              GitHub
            </a>
          </div>
          <div>Site and code under active development, 2026.</div>
        </div>
      </div>
    </footer>
  )
}
