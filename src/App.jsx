import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import TitleBlock from './components/TitleBlock'
import Overview from './components/Overview'
import Footer from './components/Footer'

const DocsView = lazy(() => import('./components/DocsView'))

/* Old links still say ?view=paper (the view was renamed when the page
   stopped being a paper) or ?view=start (now the first Docs page). */
function resolveLocation(view, page) {
  if (view === 'start') return { view: 'docs', page: 'getting-started' }
  // The Docs citation page was folded into the overview's Publications section.
  if (view === 'docs' && page === 'publications') return { view: 'overview', page: null }
  if (view === 'docs') return { view, page }
  return { view: 'overview', page: null }
}

function readLocation() {
  const params = new URLSearchParams(window.location.search)
  return resolveLocation(params.get('view'), params.get('page'))
}

/* Re-clicking the current view or page would otherwise stack identical
   history entries and make Back look dead. */
function commitUrl(url) {
  const next = url.toString()
  if (next === window.location.href) history.replaceState(null, '', next)
  else history.pushState(null, '', next)
}

const docsFallback = (
  <div
    
    className="font-ui text-[13px] text-ink-tertiary py-20 text-center"
  >
    Loading…
  </div>
)

/* The browser's behavior:"smooth" picks its own duration (often
   300-500ms) which can feel rushed when the view content changes too.
   This helper animates the scroll over a fixed duration with an
   ease-out curve, and bails to an instant jump when the user has
   prefers-reduced-motion set. */
function smoothScrollToTop(duration = 700) {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, 0)
    return
  }
  const start = window.scrollY
  if (start === 0) return
  const startTime = performance.now()
  const step = (now) => {
    const t = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    window.scrollTo(0, start * (1 - eased))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function App() {
  const [{ view, page }, setLocation] = useState(readLocation)

  const changeView = useCallback((nextView) => {
    setLocation({ view: nextView, page: null })
    const url = new URL(window.location.href)
    if (nextView === 'overview') url.searchParams.delete('view')
    else url.searchParams.set('view', nextView)
    url.searchParams.delete('page')
    url.hash = ''
    commitUrl(url)
    smoothScrollToTop()
  }, [])

  const changePage = useCallback((nextPage) => {
    setLocation({ view: 'docs', page: nextPage })
    const url = new URL(window.location.href)
    url.searchParams.set('view', 'docs')
    url.searchParams.set('page', nextPage)
    url.hash = ''
    commitUrl(url)
    smoothScrollToTop()
  }, [])

  const navigateTo = useCallback((href) => {
    const query = href.includes('?') ? href.slice(href.indexOf('?')) : ''
    const params = new URLSearchParams(query)
    const target = resolveLocation(params.get('view'), params.get('page'))
    if (target.page) changePage(target.page)
    else changeView(target.view)
  }, [changePage, changeView])

  useEffect(() => {
    const onPop = () => setLocation(readLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <>
      <Navbar view={view} onNavigate={navigateTo} />
      <main
        id="paper-content"
        className={`paper-container${view === 'docs' ? ' paper-container--docs' : ''}`}
      >
        {view === 'overview' && (
          <>
            <TitleBlock onNavigate={navigateTo} />
            <Overview onNavigate={navigateTo} />
          </>
        )}
        {view === 'docs' && (
          <Suspense fallback={docsFallback}>
            <DocsView page={page} onPageChange={changePage} onNavigate={navigateTo} />
          </Suspense>
        )}
      </main>
      <Footer />
    </>
  )
}
