import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { readFileSync } from 'node:fs'

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))

import EnterpriseServicesPage from '../docs/.vitepress/theme/EnterpriseServicesPage.vue'

const apps: App[] = []
afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.head.querySelectorAll('style[data-enterprise-test]').forEach((style) => style.remove())
  document.body.replaceChildren()
})

function installStyles() {
  const style = document.createElement('style')
  style.dataset.enterpriseTest = ''
  style.textContent = `${readFileSync('docs/.vitepress/theme/about.css', 'utf8')}\n${readFileSync('docs/.vitepress/theme/enterprise-services.css', 'utf8')}`
  document.head.append(style)
}

function mountPage() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(EnterpriseServicesPage)
  app.mount(host)
  apps.push(app)
}

describe('enterprise services page', () => {
  it('uses the approved page heading and cooperation-path description', () => {
    mountPage()

    const title = document.querySelector('.wbx-enterprise__hero h1')
    const description = document.querySelector('.wbx-enterprise__hero > p:last-child')

    expect(title?.querySelector('br')).toBeNull()
    expect(title?.textContent).toBe('企业服务')
    expect(description?.textContent).toBe('从问题梳理到场景落地，把 AI 变成可执行、可验收、可复用的工作系统。你可以从需求诊断开始，也可以直接选择培训、工作坊或企业定制。')
  })

  it('introduces a single, non-repeating service choice section', () => {
    mountPage()

    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('.wbx-enterprise__heading .wbx-pixel-label')?.textContent).toBe('HOW WE WORK')
    expect(document.querySelector('#enterprise-services-title')?.textContent).toBe('选择适合你的合作方式')
    expect(document.querySelector('.wbx-enterprise__heading > p:last-child')?.textContent).toBe('还不确定从哪里开始？建议先进行需求诊断。')
  })

  it('uses compact service-card spacing and a container-free embedded team', () => {
    installStyles()
    mountPage()

    const card = getComputedStyle(document.querySelector('.wbx-enterprise-service')!)
    const cardTitle = getComputedStyle(document.querySelector('.wbx-enterprise-service h3')!)
    const description = getComputedStyle(document.querySelector('.wbx-enterprise-service > p:not(.wbx-pixel-label)')!)
    const team = getComputedStyle(document.querySelector('#team')!)

    expect(card.display).toBe('flex')
    expect(card.flexDirection).toBe('column')
    expect(card.paddingTop).toBe('28px')
    expect(cardTitle.marginTop).toBe('0px')
    expect(cardTitle.paddingTop).toBe('0px')
    expect(cardTitle.borderTopWidth).toBe('0px')
    expect(Number.parseFloat(description.minHeight)).toBe(0)
    expect(description.marginBottom).toBe('20px')
    expect(team.paddingTop).toBe('0px')
    expect(team.borderTopWidth).toBe('0px')
    expect(team.boxShadow).toBe('none')
    expect(team.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('offers four scoped services with real destinations', () => {
    mountPage()
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.wbx-enterprise-service'))

    expect(cards.map((card) => card.id)).toEqual(['diagnosis', 'training', 'workshop', 'custom'])
    expect(cards.map((card) => card.querySelector('h3')?.textContent)).toEqual([
      '需求诊断',
      '团队培训',
      '场景工作坊',
      '企业定制',
    ])
    expect(cards[0]?.classList.contains('is-recommended')).toBe(true)
    expect(cards[0]?.textContent).toContain('推荐起点')
    expect(cards[2]?.querySelector('a')?.getAttribute('href')).toBe('/WBWB-X/#workshop-registration')
    expect(cards.filter((_, index) => index !== 2).every((card) => card.querySelector('a')?.getAttribute('href')?.startsWith('mailto:contact@sparkx.zone'))).toBe(true)
    expect(document.body.textContent).not.toMatch(/¥|￥|元\/|套餐价/)
  })

  it('reuses the existing six-person team without duplicating the About header', () => {
    mountPage()

    expect(document.querySelector('#team')).not.toBeNull()
    expect(document.querySelectorAll('#team .wbx-about-member')).toHaveLength(6)
    expect(document.querySelector('.wbx-about__header')).toBeNull()
    expect(document.querySelectorAll('#about-team-title')).toHaveLength(1)
    expect(document.querySelector('#team .wbx-pixel-label')?.textContent).toBe('DELIVERY TEAM')
    expect(document.querySelector('#about-team-title')?.textContent).toBe('场景教练与前线部署工程师（FDE）')
    expect(document.querySelector('.wbx-about__heading > p')?.textContent).toBe('汇集产品、设计、运营与 AI 实践者，为培训、工作坊和企业场景落地提供一线支持。')
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
