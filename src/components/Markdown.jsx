import { useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import ParameterTable from './ParameterTable'

/* Fenced code blocks with a recognised language slot become custom
   interactive blocks. The marker is the language tag on a ``` fence,
   e.g. ```parameter-table to mount the parameter reference. */
const CUSTOM_BLOCKS = {
  'language-parameter-table': () => <ParameterTable />,
}

function getCodeClass(children) {
  const first = Array.isArray(children) ? children[0] : children
  return first?.props?.className ?? ''
}

function CodeBlock(props) {
  const preRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const { children, ...rest } = props
  delete rest.node

  const codeClass = getCodeClass(children)
  for (const [marker, render] of Object.entries(CUSTOM_BLOCKS)) {
    if (codeClass.includes(marker)) return render()
  }

  const copy = async () => {
    const text = preRef.current?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (non-secure context); ignore
    }
  }

  return (
    <div className="code-block">
      <button
        type="button"
        className="code-copy"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
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
    return (
      <a
        href={href}
        onClick={(e) => { e.preventDefault(); onNavigate?.(href) }}
        {...rest}
      >
        {children}
      </a>
    )
  }

  const external = href && /^https?:\/\//.test(href)
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
      rehypePlugins={[rehypeSlug, rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
