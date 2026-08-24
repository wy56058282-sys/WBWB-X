import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useHomePageHarness } from './helpers/home-page-harness'

const harness = useHomePageHarness()

describe('homepage workshop card', () => {
  beforeEach(() => vi.setSystemTime(new Date('2026-08-24T12:00:00+08:00')))
  afterEach(() => vi.useRealTimers())

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
  })
})
