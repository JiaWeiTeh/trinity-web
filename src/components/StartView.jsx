import startContent from '../content/getting-started.md?raw'
import Markdown from './Markdown'

export default function StartView({ onNavigate }) {
  return (
    <div className="max-w-[720px] mx-auto">
      <article className="docs-article">
        <Markdown content={startContent} onNavigate={onNavigate} />
      </article>
    </div>
  )
}
