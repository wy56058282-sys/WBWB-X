import type { Directive } from 'vue'

const observers = new WeakMap<HTMLElement, IntersectionObserver>()

export function mountMarketingReveal(element: HTMLElement) {
  element.classList.add('wbx-marketing-reveal')

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion || typeof IntersectionObserver === 'undefined') {
    element.classList.add('is-visible')
    return
  }

  element.dataset.motionReady = 'true'
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      element.classList.add('is-visible')
      observer.unobserve(element)
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
  )

  observers.set(element, observer)
  observer.observe(element)
}

export function unmountMarketingReveal(element: HTMLElement) {
  observers.get(element)?.disconnect()
  observers.delete(element)
}

export const marketingReveal: Directive<HTMLElement> = {
  mounted: mountMarketingReveal,
  unmounted: unmountMarketingReveal,
}
