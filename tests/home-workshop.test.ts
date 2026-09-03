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
    id: 'test', title: '场景实战工作坊', edition: '测试期', date: '08.15', fullDate: '2026 年 8 月 15 日', startsAt: '2026-08-15T14:00:00+08:00', endsAt: '2026-08-15T18:00:00+08:00', time: '14:00–18:00', capacity: '15–25 人', venue: '星辉 OPC', area: '人工智能产业园', floor: 'A 座 4 楼', coverPath: '/cover.png', posterPaths: ['/cover.png'], activityDetailUrl: '', registrationQrPath: '/qr.png', ...overrides,
  }
}

describe('homepage workshop card', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-24T12:00:00+08:00'))
  })
  afterEach(() => {
    apps.splice(0).forEach((app) => app.unmount())
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('defers workshop images until the section approaches the viewport', async () => {
    let reveal: IntersectionObserverCallback | undefined
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        if (options?.rootMargin === '600px 0px') reveal = callback
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return [] }
      root = null
      rootMargin = '600px 0px'
      thresholds = [0]
    })

    harness.mountHomePage()
    const workshop = document.querySelector<HTMLElement>('.wbx-home-workshop')
    expect(workshop?.querySelector('img')).toBeNull()
    expect(workshop?.querySelector('.wbx-workshop__poster-placeholder')).not.toBeNull()

    reveal?.([{ isIntersecting: true, target: workshop } as IntersectionObserverEntry], {} as IntersectionObserver)
    await nextTick()

    expect(workshop?.querySelector('.wbx-workshop__poster')).not.toBeNull()
    expect(workshop?.querySelectorAll('.wbx-workshop__edition img')).toHaveLength(3)
  })

  it('uses responsive WebP derivatives with the original posters as fallbacks', () => {
    harness.mountHomePage()
    const workshop = document.querySelector<HTMLElement>('.wbx-home-workshop')

    expect(workshop?.querySelector<HTMLSourceElement>('.wbx-workshop__edition source')?.srcset)
      .toContain('workshop-815-thumb.webp')
    expect(workshop?.querySelector<HTMLSourceElement>('.wbx-workshop__poster-link source')?.srcset)
      .toContain('workshop-cover-display.webp')
    expect(workshop?.querySelector<HTMLImageElement>('.wbx-workshop__poster')?.src)
      .toContain('workshop-cover.png')
  })

  it('shows the complete workshop section between task categories and the system section', () => {
    harness.mountHomePage()
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.wbx-home > section'))
    const workshop = document.querySelector<HTMLElement>('.wbx-home-workshop')
    expect(workshop?.textContent).toContain('第二期')
    expect(workshop?.textContent).toContain('2026 年 8 月 29 日')
    expect(workshop?.id).toBe('workshop-registration')
    expect(workshop?.classList.contains('wbx-workshop')).toBe(true)
    expect(workshop?.classList.contains('wbx-service')).toBe(false)
    expect(workshop?.querySelector('.wbx-workshop__panel')).not.toBeNull()
    expect(workshop?.querySelector('.wbx-workshop__left .wbx-workshop__editions')).not.toBeNull()
    expect(workshop?.querySelector('.wbx-workshop__media .wbx-workshop__poster-navigation')).toBeNull()
    expect(workshop?.querySelector('.wbx-workshop__panel > .wbx-workshop__poster-navigation')).not.toBeNull()
    expect(workshop?.querySelectorAll('.wbx-workshop__edition')).toHaveLength(3)
    expect(workshop?.querySelector('.wbx-workshop__poster-navigation')).not.toBeNull()
    expect(workshop?.querySelector('.wbx-home-workshop__all')).toBeNull()
    expect(sections.indexOf(workshop!)).toBe(sections.indexOf(document.querySelector('.wbx-tasks')!) + 1)
    expect(sections.indexOf(workshop!)).toBe(sections.indexOf(document.querySelector('.wbx-system')!) - 1)
  })

  it('shows the floor after the location in the workshop facts', () => {
    mountWorkshop([edition({})])
    const facts = Array.from(document.querySelectorAll<HTMLElement>('.wbx-workshop__facts > div'))

    expect(facts.map((fact) => fact.querySelector('dt')?.textContent)).toEqual(['时间', '规模', '地点', '楼层'])
    expect(facts[3]?.querySelector('dd')?.textContent).toBe('A 座 4 楼')
  })

  it('places the active registration status below the title edition', () => {
    mountWorkshop([edition({
      edition: '第二期',
      startsAt: '2026-08-29T14:00:00+08:00',
      endsAt: '2026-08-29T18:00:00+08:00',
    })])
    const titleMeta = document.querySelector('.wbx-workshop__title-meta')

    expect(titleMeta?.querySelector('.wbx-workshop__title-edition')?.textContent).toBe('第二期')
    expect(titleMeta?.querySelector('.wbx-workshop__title-status')?.textContent).toBe('报名中')
  })

  it('omits the repeated workshop promise and tagline from the activity details', () => {
    harness.mountHomePage()
    const workshop = document.querySelector('.wbx-home-workshop')

    expect(workshop?.querySelector('.wbx-workshop__promise')).toBeNull()
    expect(workshop?.querySelector('.wbx-workshop__tagline')).toBeNull()
  })

  it('temporarily omits the enterprise service action without affecting workshop controls', () => {
    harness.mountHomePage()
    const workshop = document.querySelector('.wbx-home-workshop')

    expect(workshop?.textContent).not.toContain('了解企业服务')
    expect(workshop?.querySelector('a[href="/help/#enterprise-custom"]')).toBeNull()
    expect(workshop?.querySelector('.wbx-home-workshop__registration-trigger')).not.toBeNull()
    expect(workshop?.querySelector('.wbx-workshop__poster')).not.toBeNull()
    expect(workshop?.querySelectorAll('.wbx-workshop__edition')).toHaveLength(3)
  })

  it('shows the computer reminder immediately to the right of the workshop action', () => {
    harness.mountHomePage()
    const actions = document.querySelector<HTMLElement>('.wbx-workshop__actions')
    const reminder = document.querySelector<HTMLElement>('.wbx-workshop__reminder')

    expect(reminder?.parentElement).toBe(actions)
    expect(actions?.lastElementChild).toBe(reminder)
    expect(reminder?.classList.contains('wbx-workshop__reminder')).toBe(true)
    expect(reminder?.textContent?.trim()).toBe('携带电脑')
    expect(reminder?.querySelector('[aria-hidden="true"]')?.classList.contains('hn-laptop-code')).toBe(true)
  })

  it('shows registration status until the exact end instant and then marks the edition ended', async () => {
    vi.setSystemTime(new Date('2026-08-15T17:59:59+08:00'))
    mountWorkshop([edition({})])
    await nextTick()

    const titleStatus = () => document.querySelector<HTMLElement>('.wbx-workshop__title-status')
    expect(titleStatus()?.textContent).toBe('报名中')
    expect(document.querySelector('.wbx-home-workshop__registration-trigger')).not.toBeNull()

    await vi.advanceTimersByTimeAsync(1_001)
    await nextTick()

    expect(titleStatus()?.textContent).toBe('已结束')
    expect(document.querySelector('.wbx-home-workshop__registration-trigger')).toBeNull()
    expect(document.querySelector('.wbx-home-workshop__recap')).not.toBeNull()
  })

  it('shows the configured location and floor for each workshop edition', async () => {
    harness.mountHomePage()
    const editions = Array.from(document.querySelectorAll<HTMLButtonElement>('.wbx-workshop__edition'))
    const floor = () => document.querySelectorAll('.wbx-workshop__facts dd')[3]?.textContent

    expect(floor()).toBe('A1 座 4 楼')
    editions[0]?.click()
    await nextTick()
    expect(floor()).toBe('B2 栋 9 楼')
    editions[2]?.click()
    await nextTick()
    const thirdEditionFacts = Array.from(document.querySelectorAll<HTMLElement>('.wbx-workshop__facts > div'))
    expect(thirdEditionFacts.map((fact) => fact.querySelector('dt')?.textContent))
      .toEqual(['时间', '规模', '城市', '地点', '楼层'])
    expect(thirdEditionFacts[2]?.querySelector('dd')?.textContent).toBe('合肥')
    expect(Array.from(thirdEditionFacts[3]?.querySelectorAll('dd span') ?? []).map((part) => part.textContent))
      .toEqual(['高新区菖蒲路 668 号', '人工智能产业园一期'])
    expect(thirdEditionFacts[4]?.querySelector('dd')?.textContent).toBe('A1 栋 4 楼')
  })

  it.each([0, 1, 8, 9])('shows a stable attendee row for %i uploaded avatars', (count) => {
    const attendees = Array.from({ length: count }, (_, index) => ({
      name: `报名者${index + 1}`,
      imagePath: `/attendee-${index + 1}.png`,
      optimizedImagePath: index === 0 ? '/attendee-1.webp' : undefined,
    }))
    mountWorkshop([edition({ attendees })])

    const row = document.querySelector<HTMLElement>('.wbx-workshop__attendees')
    const avatars = document.querySelectorAll<HTMLImageElement>('.wbx-workshop__attendee img')
    const overflow = document.querySelector<HTMLElement>('.wbx-workshop__attendee-overflow')

    expect(row === null).toBe(count === 0)
    expect(avatars).toHaveLength(Math.min(count, 8))
    expect(overflow?.textContent ?? '').toBe(count > 8 ? `+${count - 8}` : '')
    if (count > 0) {
      expect(row?.getAttribute('aria-label')).toBe(`本期已展示 ${Math.min(count, 8)} 位报名者，共 ${count} 位`)
      expect(avatars[0]?.alt).toBe('报名者1头像')
      expect(document.querySelector<HTMLSourceElement>('.wbx-workshop__attendee source')?.getAttribute('srcset')).toContain('attendee-1.webp')
    }
  })

  it('switches editions and poster pages in the full homepage workshop section', async () => {
    harness.mountHomePage()
    const workshop = document.querySelector('.wbx-home-workshop')
    const editions = Array.from(workshop?.querySelectorAll<HTMLButtonElement>('.wbx-workshop__edition') ?? [])
    const posterSource = () => workshop?.querySelector<HTMLImageElement>('.wbx-workshop__poster')?.getAttribute('src')

    expect(editions.map((edition) => edition.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(workshop?.textContent).not.toContain('当前')
    expect(workshop?.querySelectorAll('.wbx-workshop__edition-status')).toHaveLength(1)
    expect(editions[1]?.querySelector('.wbx-workshop__edition-status')).not.toBeNull()
    expect(posterSource()).toContain('workshop-cover.png')
    workshop?.querySelector<HTMLButtonElement>('.wbx-workshop__poster-control--next')?.click()
    await nextTick()
    expect(posterSource()).toContain('workshop-829-agenda.png')

    editions[0]?.click()
    await nextTick()
    expect(editions.map((edition) => edition.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false'])
    expect(editions[0]?.querySelector('.wbx-workshop__edition-status')).not.toBeNull()
    expect(editions[1]?.querySelector('.wbx-workshop__edition-status')).toBeNull()
    expect(posterSource()).toContain('workshop-815.png')
    expect(workshop?.querySelector('.wbx-home-workshop__state')).toBeNull()
    expect(workshop?.querySelector('.wbx-home-workshop__recap')?.textContent).toBe('查看活动回顾')
    expect(workshop?.querySelector('.wbx-workshop__poster-page')?.textContent?.trim()).toBe('1 / 3')
  })

  it('keeps the enterprise WeChat QR out of the edition-card row', async () => {
    mountWorkshop([
      edition({ id: 'past', edition: '往期', startsAt: '2026-08-15T14:00:00+08:00', endsAt: '2026-08-15T18:00:00+08:00' }),
      edition({ id: 'open', edition: '报名期', startsAt: '2026-08-29T14:00:00+08:00', endsAt: '2026-08-29T18:00:00+08:00', registrationQrPath: '/enterprise-wechat-form.png' }),
    ])
    await nextTick()

    const tabs = document.querySelectorAll<HTMLButtonElement>('.wbx-workshop__edition')
    expect(document.querySelector('.wbx-workshop__registration-qr')).toBeNull()
    expect(document.querySelector('.wbx-workshop__editions-row')?.classList.contains('has-registration-qr')).toBe(false)

    tabs[0]?.click()
    await nextTick()

    expect(document.querySelector('.wbx-workshop__registration-qr')).toBeNull()
    expect(document.querySelector('.wbx-workshop__editions-row')?.classList.contains('has-registration-qr')).toBe(false)
  })

  it('uses HackerNoon pixel arrows for poster navigation', () => {
    harness.mountHomePage()
    const previous = document.querySelector<HTMLButtonElement>('.wbx-workshop__poster-control--previous')
    const next = document.querySelector<HTMLButtonElement>('.wbx-workshop__poster-control--next')

    expect(previous?.getAttribute('aria-label')).toBe('查看上一张海报')
    expect(previous?.querySelector('.hn-arrow-left')?.getAttribute('aria-hidden')).toBe('true')
    expect(previous?.textContent?.trim()).toBe('')
    expect(next?.getAttribute('aria-label')).toBe('查看下一张海报')
    expect(next?.querySelector('.hn-arrow-right')?.getAttribute('aria-hidden')).toBe('true')
    expect(next?.textContent?.trim()).toBe('')
  })

  it('supports complete keyboard tab navigation and poster cycling', async () => {
    harness.mountHomePage()
    const workshop = document.querySelector('.wbx-home-workshop')
    const editions = Array.from(workshop?.querySelectorAll<HTMLButtonElement>('.wbx-workshop__edition') ?? [])
    const posterSource = () => workshop?.querySelector<HTMLImageElement>('.wbx-workshop__poster')?.getAttribute('src')
    const next = () => workshop?.querySelector<HTMLButtonElement>('.wbx-workshop__poster-control--next')
    const previous = () => workshop?.querySelector<HTMLButtonElement>('.wbx-workshop__poster-control--previous')

    editions[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()
    expect(editions[2].getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(editions[2])

    editions[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    await nextTick()
    expect(editions[0].getAttribute('aria-selected')).toBe('true')
    editions[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await nextTick()
    expect(editions[2].getAttribute('aria-selected')).toBe('true')
    editions[0].click()
    await nextTick()
    editions[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    await nextTick()
    expect(editions[2].getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(editions[2])

    editions[1].click()
    await nextTick()
    for (const expected of ['workshop-829-agenda.png', 'workshop-829-benefits.png', 'workshop-cover.png']) {
      next()?.click()
      await nextTick()
      expect(posterSource()).toContain(expected)
    }
    previous()?.click()
    await nextTick()
    expect(posterSource()).toContain('workshop-829-benefits.png')
  })

  it('shows the three September posters and its dedicated registration QR', async () => {
    harness.mountHomePage()
    const workshop = document.querySelector('.wbx-home-workshop')
    const thirdEdition = workshop?.querySelectorAll<HTMLButtonElement>('.wbx-workshop__edition')[2]
    const posterSource = () => workshop?.querySelector<HTMLImageElement>('.wbx-workshop__poster')?.getAttribute('src')
    const next = () => workshop?.querySelector<HTMLButtonElement>('.wbx-workshop__poster-control--next')

    thirdEdition?.click()
    await nextTick()

    expect(posterSource()).toContain('workshop-912.png')
    expect(workshop?.querySelector('.wbx-workshop__poster-page')?.textContent?.trim()).toBe('1 / 3')
    next()?.click()
    await nextTick()
    expect(posterSource()).toContain('workshop-912-agenda.png')
    next()?.click()
    await nextTick()
    expect(posterSource()).toContain('workshop-912-benefits.png')

    workshop?.querySelector<HTMLButtonElement>('.wbx-home-workshop__registration-trigger')?.click()
    await nextTick()
    expect(workshop?.querySelector<HTMLImageElement>('.wbx-home-workshop__registration-popover img')?.getAttribute('src'))
      .toContain('workshop-912-registration-qr.png')
  })

  it('does not steal focus when an open QR is closed by another workshop control', async () => {
    harness.mountHomePage()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-home-workshop__registration-trigger')!
    const thirdEdition = document.querySelectorAll<HTMLButtonElement>('.wbx-workshop__edition')[2]

    trigger.click()
    await nextTick()
    thirdEdition.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    thirdEdition.focus()
    thirdEdition.click()
    await nextTick()

    expect(document.activeElement).toBe(thirdEdition)
    expect(document.querySelector('.wbx-home-workshop__registration-popover.is-open')).toBeNull()
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
    expect(document.querySelector('.wbx-home-workshop__state')).toBeNull()
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
    expect(document.querySelector<HTMLAnchorElement>('.wbx-home-workshop__recap')?.getAttribute('href')).toBe('#workshop-history')
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
