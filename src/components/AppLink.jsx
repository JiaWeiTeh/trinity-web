/* An in-app link. A real <a href="?view=…&page=…"> so middle-click, Ctrl-click,
   right-click and assistive tech all see a link; a plain left-click is
   intercepted for client-side navigation. */
function isPlainLeftClick(e) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

export default function AppLink({ href, onNavigate, children, ...rest }) {
  const onClick = (e) => {
    if (!isPlainLeftClick(e)) return
    e.preventDefault()
    onNavigate?.(href)
  }
  return <a href={href} onClick={onClick} {...rest}>{children}</a>
}
