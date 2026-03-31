import Navbar from './components/Navbar'
import TitleBlock from './components/TitleBlock'
import ContentSections from './components/ContentSections'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="paper-container">
        <TitleBlock />
        <ContentSections />
      </main>
      <Footer />
    </>
  )
}
