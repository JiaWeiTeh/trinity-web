import { useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import ParameterTable from './ParameterTable'
import AppLink from './AppLink'
import CopyButton from './CopyButton'

/* Fenced code blocks with a recognised language slot become custom
   interactive blocks. The marker is the language tag on a ``` fence,
   e.g. ```parameter-table to mount the parameter reference. */
const CUSTOM_BLOCKS = {
  'language-parameter-table': () => <ParameterTable />,
}

/* Keep inline maths and the punctuation right after it on one line. KaTeX
   output is a run of inline blocks, and the browser may break after them,
   which starts the next line with "," or ".". */
const PUNCTUATION = /^[.,;:!?)]+/

function rehypeMathPunctuation() {
  const walk = (node) => {
    const kids = node.children ?? []
    kids.forEach((math, i) => {
      const next = kids[i + 1]
      const isMath = math.type === 'element' && math.properties?.className?.includes('katex')
      const mark = isMath && next?.type === 'text' && next.value.match(PUNCTUATION)
      if (!mark) return walk(math)
      next.value = next.value.slice(mark[0].length)
      kids[i] = {
        type: 'element', tagName: 'span',
        properties: { className: ['whitespace-nowrap'] },
        children: [math, { type: 'text', value: mark[0] }],
      }
    })
  }
  return walk
}

function getCodeClass(children) {
  const first = Array.isArray(children) ? children[0] : children
  return first?.props?.className ?? ''
}

function CodeBlock(props) {
  const preRef = useRef(null)
  const { children, ...rest } = props
  delete rest.node

  const codeClass = getCodeClass(children)
  for (const [marker, render] of Object.entries(CUSTOM_BLOCKS)) {
    if (codeClass.includes(marker)) return render()
  }

  return (
    <div className="code-block">
      <CopyButton getText={() => preRef.current?.textContent ?? ''} />
      <pre ref={preRef} {...rest}>{children}</pre>
    </div>
  )
}

function Anchor(props) {
  const { href, children, onNavigate, ...rest } = props
  delete rest.node

  // Internal app routes are written as query-only hrefs (?view=…&page=…)
  // — intercept them for client-side navigation instead of a full reload.
  if (href && href.startsWith('?')) {
    return <AppLink href={href} onNavigate={onNavigate} {...rest}>{children}</AppLink>
  }

  // A link to a file the reader wants to keep, rather than a page to look at.
  // Without the download attribute the browser just renders the JSON.
  const isDownload = href && /\.(ipynb|zip|csv|param)$/i.test(href)
  if (isDownload) {
    return (
      <a href={href} download {...rest}>
        {children}
      </a>
    )
  }

  // http(s) links leave the site; so do absolute paths, which point at static
  // files served alongside it (the rendered notebook). Both open in a new tab.
  const external = href && (/^https?:\/\//.test(href) || href.startsWith('/'))
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  )
}

export default function Markdown({ content, onNavigate }) {
  const components = useMemo(() => ({
    pre: CodeBlock,
    a: (props) => <Anchor {...props} onNavigate={onNavigate} />,
  }), [onNavigate])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeSlug, rehypeKatex, rehypeMathPunctuation]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
