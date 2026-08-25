import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))

import EnterpriseServicesPage from '../docs/.vitepress/theme/EnterpriseServicesPage.vue'

const apps: App[] = []
afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
})

function mountPage() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(EnterpriseServicesPage)
  app.mount(host)
  apps.push(app)
}

describe('enterprise services page', () => {
  it('lets the hero title wrap naturally instead of forcing a line break', () => {
    mountPage()

    const title = document.querySelector('.wbx-enterprise__hero h1')

    expect(title?.querySelector('br')).toBeNull()
    expect(title?.textContent).toBe('从真实场景出发，把 AI 变成可交付的工作系统。')
  })

  it('offers four scoped services with real destinations', () => {
    mountPage()
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.wbx-enterprise-service'))

    expect(cards.map((card) => card.id)).toEqual(['training', 'workshop', 'diagnosis', 'custom'])
    expect(cards.map((card) => card.querySelector('h2')?.textContent)).toEqual([
      '团队培训',
      '场景工作坊',
      '需求诊断',
      '企业定制',
    ])
    expect(cards[1]?.querySelector('a')?.getAttribute('href')).toBe('/WBWB-X/#workshop-registration')
    expect(cards.filter((_, index) => index !== 1).every((card) => card.querySelector('a')?.getAttribute('href')?.startsWith('mailto:contact@sparkx.zone'))).toBe(true)
    expect(document.body.textContent).not.toMatch(/¥|￥|元\/|套餐价/)
  })

  it('reuses the existing six-person team without duplicating the About header', () => {
    mountPage()

    expect(document.querySelector('#team')).not.toBeNull()
    expect(document.querySelectorAll('#team .wbx-about-member')).toHaveLength(6)
    expect(document.querySelector('.wbx-about__header')).toBeNull()
    expect(document.querySelectorAll('#about-team-title')).toHaveLength(1)
  })

  it('closes Join Us from a global Escape key and restores trigger focus', async () => {
    mountPage()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-about-join__trigger')

    trigger?.click()
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })
})
