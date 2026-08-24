import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { useHomePageHarness } from './helpers/home-page-harness'
import type { WorkshopEdition } from '../docs/.vitepress/workshop-editions'
import HomeWorkshop from '../docs/.vitepress/theme/HomeWorkshop.vue'

const harness = useHomePageHarness()
const apps: App[] = []

function mountWorkshop(editions: readonly WorkshopEdition[]) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(HomeWorkshop, { editions })
  app.mount(host)
  apps.push(app)
}

function edition(overrides: Partial<WorkshopEdition>): WorkshopEdition {
  return {
    id: 'test', title: '场景实战工作坊', edition: '测试期', date: '08.15', fullDate: '2026 年 8 月 15 日', startsAt: '2026-08-15T14:00:00+08:00', endsAt: '2026-08-15T18:00:00+08:00', time: '14:00–18:00', capacity: '15–25 人', venue: '星辉 OPC', area: '人工智能产业园', coverPath: '/cover.png', posterPaths: ['/cover.png'], activityDetailUrl: '', registrationQrPath: '/qr.png', ...overrides,
  }
}

describe('homepage workshop card', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-24T12:00:00+08:00'))
  })
  afterEach(() => { apps.splice(0).forEach((app) => app.unmount()); vi.useRealTimers() })

  it('shows one upcoming workshop between task categories and the system section', () => {
    harness.mountHomePage()
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.wbx-home > section'))
    const workshop = document.querySelector<HTMLElement>('.wbx-home-workshop')
    expect(workshop?.textContent).toContain('第二期')
    expect(workshop?.textContent).toContain('2026 年 8 月 29 日')
    expect(workshop?.querySelectorAll('.wbx-home-workshop__poster')).toHaveLength(1)
    expect(workshop?.querySelector<HTMLAnchorElement>('.wbx-home-workshop__all')?.getAttribute('href')).toBe('/help/#workshop-registration')
    expect(sections.indexOf(workshop!)).toBe(sections.indexOf(document.querySelector('.wbx-tasks')!) + 1)
    expect(sections.indexOf(workshop!)).toBe(sections.indexOf(document.querySelector('.wbx-system')!) - 1)
  })

  it('opens and closes the registration QR through activation, Escape, and outside pointer input', async () => {
    harness.mountHomePage()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-home-workshop__registration-trigger')
    const card = document.querySelector('.wbx-home-workshop__registration')

    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    expect(trigger?.getAttribute('aria-controls')).toBe('home-workshop-registration')
    trigger?.click()
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
    expect(card?.querySelector('img')?.alt).toContain('粗门报名二维码')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    trigger?.click()
    await nextTick()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')

    trigger?.click()
    await nextTick()
    trigger?.click()
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps the registration control available while an edition is ongoing', async () => {
    vi.setSystemTime(new Date('2026-08-29T16:00:00+08:00'))
    mountWorkshop([edition({ id: 'ongoing', startsAt: '2026-08-29T14:00:00+08:00', endsAt: '2026-08-29T18:00:00+08:00' })])
    await nextTick()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-home-workshop__registration-trigger')

    expect(document.querySelector('.wbx-home-workshop__state')).toBeNull()
    expect(trigger?.textContent).toBe('报名最近一期')
    trigger?.click()
    await nextTick()
    expect(document.querySelector('.wbx-home-workshop__registration-popover.is-open')).not.toBeNull()
  })

  it('renders an external recap without a registration QR when a past edition has details', async () => {
    vi.setSystemTime(new Date('2026-09-01T12:00:00+08:00'))
    mountWorkshop([edition({ activityDetailUrl: 'https://example.com/recap' })])
    await nextTick()
    const recap = document.querySelector<HTMLAnchorElement>('.wbx-home-workshop__recap')

    expect(document.querySelector('.wbx-home-workshop__registration-trigger')).toBeNull()
    expect(recap?.getAttribute('href')).toBe('https://example.com/recap')
    expect(recap?.getAttribute('target')).toBe('_blank')
    expect(recap?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(recap?.getAttribute('aria-label')).toContain('在新页面打开')
  })

  it('falls back to workshop history when a past edition has no detail URL', async () => {
    vi.setSystemTime(new Date('2026-09-01T12:00:00+08:00'))
    mountWorkshop([edition({ activityDetailUrl: '' })])
    await nextTick()

    expect(document.querySelector('.wbx-home-workshop__registration-trigger')).toBeNull()
    expect(document.querySelector<HTMLAnchorElement>('.wbx-home-workshop__recap')?.getAttribute('href')).toBe('/help/#workshop-history')
  })

  it('refreshes the selected edition after the next workshop boundary', async () => {
    vi.setSystemTime(new Date('2026-08-29T17:59:59+08:00'))
    harness.mountHomePage()
    await nextTick()

    expect(document.querySelector('.wbx-home-workshop')?.textContent).toContain('第二期')
    await vi.advanceTimersByTimeAsync(1_001)
    await nextTick()
    expect(document.querySelector('.wbx-home-workshop')?.textContent).toContain('第三期')
  })

  it('closes an open QR and focuses recap when the last edition becomes past', async () => {
    vi.setSystemTime(new Date('2026-08-29T17:59:59+08:00'))
    mountWorkshop([edition({ startsAt: '2026-08-29T14:00:00+08:00', endsAt: '2026-08-29T18:00:00+08:00' })])
    await nextTick()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-home-workshop__registration-trigger')

    trigger?.click()
    await nextTick()
    await vi.advanceTimersByTimeAsync(1_001)
    await nextTick()

    const recap = document.querySelector<HTMLAnchorElement>('.wbx-home-workshop__recap')
    expect(document.querySelector('.wbx-home-workshop__registration-trigger')).toBeNull()
    expect(document.activeElement).toBe(recap)
  })
})
