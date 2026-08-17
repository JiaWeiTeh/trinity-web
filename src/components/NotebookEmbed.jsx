import { useState } from 'react'

/* The rendered notebook, inline. It is a self-contained HTML file produced by
   examples/export_web.sh, already carrying this site's fonts and colours, so an
   iframe is the honest way to show it: no style collisions, and one source of
   truth for the page. It loads lazily, since the file is around half a megabyte
   of inlined figures. */

const HTML = `${import.meta.env.BASE_URL}notebook/quickstart.html`
const IPYNB = `${import.meta.env.BASE_URL}notebook/quickstart.ipynb`

export default function NotebookEmbed() {
  const [tall, setTall] = useState(false)

  return (
    <div className="my-6">
      <div
        className="rounded-[10px] border border-border-card overflow-hidden bg-paper"
        style={{ height: tall ? '150vh' : '70vh' }}
      >
        <iframe
          src={HTML}
          title="TRINITY quickstart notebook"
          loading="lazy"
          className="w-full h-full block"
          style={{ border: 0 }}
        />
      </div>

      <div style={{ fontFamily: 'var(--font-ui)' }}
           className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-tertiary">
        <button
          type="button"
          onClick={() => setTall((v) => !v)}
          className="text-teal underline underline-offset-[3px] decoration-1 cursor-pointer"
        >
          {tall ? 'Shrink' : 'Make taller'}
        </button>
        <a href={HTML} target="_blank" rel="noopener noreferrer"
           className="text-teal underline underline-offset-[3px] decoration-1">
          Open in a new tab
        </a>
        <a href={IPYNB} download
           className="text-teal underline underline-offset-[3px] decoration-1">
          Download the .ipynb
        </a>
        <span className="opacity-80">Scroll inside the frame to read it here.</span>
      </div>
    </div>
  )
}
