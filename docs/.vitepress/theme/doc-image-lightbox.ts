export function isZoomableDocImage(
  target: EventTarget | null,
): target is HTMLImageElement {
  const src = target instanceof HTMLImageElement
    ? target.getAttribute('src')?.trim()
    : ''
  return (
    target instanceof HTMLImageElement &&
    target.matches('.vp-doc img') &&
    !target.closest('a') &&
    Boolean(src)
  )
}
