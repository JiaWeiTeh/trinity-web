import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import TitleBlock from './components/TitleBlock'
import ContentSections from './components/ContentSections'
import PaperTabs from './components/PaperTabs'
import Footer from './components/Footer'

const DocsView = lazy(() => import('./components/DocsView'))

const VALID_VIEWS = ['paper', 'docs']

function readViewFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const v = params.get('view')
  return VALID_VIEWS.includes(v) ? v : 'paper'
}

export default function App() {
  const [view, setView] = useState(readViewFromUrl)

  const changeView = useCallback((next) => {
    setView(next)
    const url = new URL(window.location.href)
    if (next === 'paper') url.searchParams.delete('view')
    else url.searchParams.set('view', next)
    url.hash = ''
    history.pushState(null, '', url.toString())
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    const onPop = () => setView(readViewFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <>
      <Navbar view={view} onViewChange={changeView} />
      <div className="paper-wrap">
        <PaperTabs activeView={view} onChange={changeView} />
        <main id="paper-content" className="paper-container">
          {view === 'paper' ? (
            <>
              <TitleBlock onViewChange={changeView} />
              <ContentSections onViewChange={changeView} />
            </>
          ) : (
            <Suspense
              fallback={
                <div
                  style={{ fontFamily: 'var(--font-ui)' }}
                  className="text-[13px] text-ink-tertiary py-20 text-center"
                >
                  Loading documentation…
                </div>
              }
            >
              <DocsView />
            </Suspense>
          )}
        </main>
      </div>
      <Footer onViewChange={changeView} />
    </>
  )
}
