import { createApp, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeAnalyticsStrip from '../docs/.vitepress/theme/HomeAnalyticsStrip.vue'
import type { HomeAnalyticsConfig } from '../docs/.vitepress/theme/homeAnalytics'

const fetchMock = vi.fn()
vi.mock('../docs/.vitepress/theme/homeAnalytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../docs/.vitepress/theme/homeAnalytics')>()
  return { ...actual, fetchHomeAnalytics: (...args: unknown[]) => fetchMock(...args) }
})

const config: HomeAnalyticsConfig = {
  websiteId: 'site',
  shareUrl: 'https://cloud.umami.is/share/public',
  collectionStartedAt: 1,
}

function mountStrip() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(HomeAnalyticsStrip, { config })
  app.mount(host)
  return { host, unmount: () => { app.unmount(); host.remove() } }
}

describe('HomeAnalyticsStrip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders loading then formatted live values', async () => {
    let resolve!: (value: unknown) => void
    fetchMock.mockReturnValue(new Promise((done) => { resolve = done }))
    const view = mountStrip()
    expect(view.host.querySelector('section')?.getAttribute('aria-label')).toBe('网站访问统计')
    expect([...view.host.querySelectorAll('dt')].map((node) => node.textContent)).toEqual([
      '今日访问', '今日浏览', '累计访问', '累计浏览',
    ])
    expect([...view.host.querySelectorAll('dd')].map((node) => node.textContent)).toEqual(['···', '···', '···', '···'])
    resolve({ todayVisits: 1234, todayPageviews: 5678, lifetimeVisits: 9012, lifetimePageviews: 34567, fetchedAt: Date.now() })
    await Promise.resolve(); await nextTick()
    expect([...view.host.querySelectorAll('dd')].map((node) => node.textContent)).toEqual(['1,234', '5,678', '9,012', '34,567'])
    expect(view.host.querySelector('.wbx-home-analytics__status')?.textContent).toContain('实时统计')
    view.unmount()
  })

  it('shows a quiet error state and retains stale data', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    const view = mountStrip()
    await Promise.resolve(); await nextTick()
    expect([...view.host.querySelectorAll('dd')].map((node) => node.textContent)).toEqual(['--', '--', '--', '--'])
    expect(view.host.textContent).toContain('暂未同步')
    view.unmount()

    fetchMock.mockResolvedValueOnce({ todayVisits: 1, todayPageviews: 2, lifetimeVisits: 3, lifetimePageviews: 4, fetchedAt: Date.now() })
      .mockRejectedValueOnce(new Error('offline'))
    const stale = mountStrip()
    await Promise.resolve(); await nextTick()
    await vi.advanceTimersByTimeAsync(300_000); await nextTick()
    expect([...stale.host.querySelectorAll('dd')].map((node) => node.textContent)).toEqual(['1', '2', '3', '4'])
    expect(stale.host.textContent).toContain('暂未同步')
    stale.unmount()
  })

  it('refreshes every five minutes without concurrent requests and aborts on cleanup', async () => {
    let resolve!: (value: unknown) => void
    fetchMock.mockReturnValue(new Promise((done) => { resolve = done }))
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
    const view = mountStrip()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(300_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    resolve({ todayVisits: 1, todayPageviews: 2, lifetimeVisits: 3, lifetimePageviews: 4, fetchedAt: Date.now() })
    await Promise.resolve(); await nextTick()
    await vi.advanceTimersByTimeAsync(300_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    view.unmount()
    expect(abortSpy).toHaveBeenCalled()
    abortSpy.mockRestore()
  })
})
