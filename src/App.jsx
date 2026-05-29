import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import TitleBlock from './components/TitleBlock'
import ContentSections from './components/ContentSections'
import PaperTabs from './components/PaperTabs'
import Footer from './components/Footer'

const DocsView = lazy(() => import('./components/DocsView'))
const StartView = lazy(() => import('./components/StartView'))

const VALID_VIEWS = ['paper', 'start', 'docs']

function readLocation() {
  const params = new URLSearchParams(window.location.search)
  const v = params.get('view')
  return {
    view: VALID_VIEWS.includes(v) ? v : 'paper',
    page: params.get('page'),
  }
}

const docsFallback = (
  <div
    style={{ fontFamily: 'var(--font-ui)' }}
    className="text-[13px] text-ink-tertiary py-20 text-center"
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
    if (nextView === 'paper') url.searchParams.delete('view')
    else url.searchParams.set('view', nextView)
    url.searchParams.delete('page')
    url.hash = ''
    history.pushState(null, '', url.toString())
    smoothScrollToTop()
  }, [])

  const changePage = useCallback((nextPage) => {
    setLocation({ view: 'docs', page: nextPage })
    const url = new URL(window.location.href)
    url.searchParams.set('view', 'docs')
    url.searchParams.set('page', nextPage)
    url.hash = ''
    history.pushState(null, '', url.toString())
    smoothScrollToTop()
  }, [])

  const navigateTo = useCallback((href) => {
    const query = href.includes('?') ? href.slice(href.indexOf('?')) : ''
    const params = new URLSearchParams(query)
    const p = params.get('page')
    const v = params.get('view')
    if (p) changePage(p)
    else changeView(VALID_VIEWS.includes(v) ? v : 'paper')
  }, [changePage, changeView])

  useEffect(() => {
    const onPop = () => setLocation(readLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <>
      <Navbar view={view} onViewChange={changeView} />
      <div className="paper-wrap">
        <PaperTabs activeView={view} onChange={changeView} />
        <main
          id="paper-content"
          className={`paper-container${view === 'docs' ? ' paper-container--docs' : ''}`}
        >
          {view === 'paper' && (
            <>
              <TitleBlock onViewChange={changeView} />
              <ContentSections />
            </>
          )}
          {view === 'start' && (
            <Suspense fallback={docsFallback}>
              <StartView onNavigate={navigateTo} />
            </Suspense>
          )}
          {view === 'docs' && (
            <Suspense fallback={docsFallback}>
              <DocsView page={page} onPageChange={changePage} onNavigate={navigateTo} />
            </Suspense>
          )}
        </main>
      </div>
      <Footer onViewChange={changeView} />
    </>
  )
}
