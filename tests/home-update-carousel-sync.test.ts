import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'

const fixtureHomeUpdates = vi.hoisted(() => [
  {
    date: '2026-08-12',
    title: 'Fixture update one',
    href: '/fixture-update-one',
  },
  {
    date: '2026-08-11',
    title: 'Fixture update two',
    href: '/fixture-update-two',
  },
  {
    date: '2026-08-10',
    title: 'Fixture update three',
    href: '/fixture-update-three',
  },
])

vi.mock('vitepress', () => ({
  withBase: (path: string) => path,
}))

vi.mock('../docs/.vitepress/theme/homeUpdates', () => ({
  homeUpdates: fixtureHomeUpdates,
}))

import HomePage from '../docs/.vitepress/theme/HomePage.vue'

const apps: App[] = []

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
}

describe('home update carousel synchronization', () => {
  it('keeps every title, date, and href synchronized in the continuous track', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverStub {
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
      },
    )
    mountHomePage()

    const groups = document.querySelectorAll('.wbx-update-ticker__title-group')
    const links = groups[0]?.querySelectorAll<HTMLAnchorElement>('.wbx-update-ticker__link')

    expect(groups).toHaveLength(2)
    expect(links).toHaveLength(fixtureHomeUpdates.length)
    links?.forEach((link, index) => {
      expect(link.getAttribute('aria-label')).toBe(
        `${fixtureHomeUpdates[index].date} ${fixtureHomeUpdates[index].title}`,
      )
      expect(link.getAttribute('href')).toBe(fixtureHomeUpdates[index].href)
      expect(link.textContent).toBe(fixtureHomeUpdates[index].title)
    })
  })
})
