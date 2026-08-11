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
  it('keeps date, title, and href on the same distinct-date fixture entry', async () => {
    vi.useFakeTimers()
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

    const ticker = document.querySelector('.wbx-update-ticker')
    const initialTime = ticker?.querySelector('time')
    const initialDay = ticker?.querySelector('.wbx-update-ticker__date-day')

    expect(ticker?.querySelectorAll('.wbx-update-ticker__link')).toHaveLength(1)
    expect(initialTime?.textContent).toBe(fixtureHomeUpdates[0].date)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      fixtureHomeUpdates[0].title,
    )
    expect(ticker?.querySelector<HTMLAnchorElement>('a')?.getAttribute('href')).toBe(
      fixtureHomeUpdates[0].href,
    )

    await vi.advanceTimersByTimeAsync(6000)

    const nextDay = Array.from(
      ticker?.querySelectorAll('.wbx-update-ticker__date-day') ?? [],
    ).find(
      (day) => day !== initialDay,
    )
    expect(nextDay).toBeDefined()
    expect(nextDay?.textContent).toBe('11')
    expect(ticker?.querySelector('time')?.getAttribute('datetime')).toBe(
      fixtureHomeUpdates[1].date,
    )
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      fixtureHomeUpdates[1].title,
    )
    expect(ticker?.querySelector<HTMLAnchorElement>('a')?.getAttribute('href')).toBe(
      fixtureHomeUpdates[1].href,
    )
    expect(ticker?.querySelectorAll('.wbx-update-ticker__link')).toHaveLength(1)
  })
})
