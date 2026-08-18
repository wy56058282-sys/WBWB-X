import { afterEach, beforeEach, vi } from 'vitest'
import { createApp, type App } from 'vue'
import HomePage from '../../docs/.vitepress/theme/HomePage.vue'

vi.mock('vitepress', () => ({
  withBase: (path: string) => path,
}))

export function useHomePageHarness() {
  const apps: App[] = []
  let removeMediaListener: ReturnType<typeof vi.fn>

  function stubMatchMedia(matches: boolean) {
    removeMediaListener = vi.fn()
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: removeMediaListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
  }

  beforeEach(() => {
    stubMatchMedia(false)
    vi.stubGlobal('ResizeObserver', class ResizeObserverStub {
      constructor(_callback: ResizeObserverCallback) {}

      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    })
  })

  afterEach(() => {
    apps.splice(0).forEach((app) => app.unmount())
    document.body.replaceChildren()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function mountHomePage() {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(HomePage)
    app.mount(host)
    apps.push(app)
    return app
  }

  return {
    mountHomePage,
    stubMatchMedia,
    mediaQueryRemoveEventListener: () => removeMediaListener,
  }
}
