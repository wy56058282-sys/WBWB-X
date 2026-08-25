import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  mountMarketingReveal,
  unmountMarketingReveal,
} from '../docs/.vitepress/theme/marketingReveal'

class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = []
  callback: IntersectionObserverCallback
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  options: IntersectionObserverInit | undefined

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    IntersectionObserverStub.instances.push(this)
  }
}

describe('marketing reveal', () => {
  beforeEach(() => {
    IntersectionObserverStub.instances = []
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reveals once at the approved threshold and stops observing', () => {
    const element = document.createElement('section')
    mountMarketingReveal(element)

    const observer = IntersectionObserverStub.instances[0]
    expect(element.classList.contains('wbx-marketing-reveal')).toBe(true)
    expect(element.dataset.motionReady).toBe('true')
    expect(observer.options).toEqual({
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px',
    })
    expect(observer.observe).toHaveBeenCalledWith(element)

    observer.callback(
      [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    )

    expect(element.classList.contains('is-visible')).toBe(true)
    expect(observer.unobserve).toHaveBeenCalledWith(element)
  })

  it('shows immediately without IntersectionObserver or with reduced motion', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const unsupported = document.createElement('div')
    mountMarketingReveal(unsupported)
    expect(unsupported.classList.contains('is-visible')).toBe(true)
    expect(unsupported.dataset.motionReady).toBeUndefined()

    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    const reduced = document.createElement('div')
    mountMarketingReveal(reduced)
    expect(reduced.classList.contains('is-visible')).toBe(true)
    expect(IntersectionObserverStub.instances).toHaveLength(0)
  })

  it('disconnects its observer when the component unmounts', () => {
    const element = document.createElement('div')
    mountMarketingReveal(element)
    const observer = IntersectionObserverStub.instances[0]

    unmountMarketingReveal(element)

    expect(observer.disconnect).toHaveBeenCalledOnce()
  })
})
