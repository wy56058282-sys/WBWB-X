import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import type { CaseCatalogItem } from '../docs/.vitepress/case-catalog'

const fixtureCatalog = vi.hoisted((): readonly CaseCatalogItem[] => [
  { route: '/cases/submissions/excel-store-analysis/', title: 'Excel 门店经营分析', date: '2026-08-03', productTag: 'WorkBuddy', category: '数据分析', outcome: '把门店 Excel 汇总为可复用的经营看板。', cover: '/article-assets/cases/excel-cover.jpg', coverAlt: '门店经营 Excel 看板' },
  { route: '/cases/submissions/content-calendar/', title: '内容排期协作', date: '2026-08-02', productTag: 'WorkBuddy', category: '内容创作', outcome: '把选题、文案和发布时间汇总为内容日历。', cover: '/article-assets/cases/content-cover.jpg', coverAlt: '内容日历界面' },
])

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))
vi.mock('../docs/.vitepress/case-catalog.data', () => ({ data: fixtureCatalog }))

import ServicePage from '../docs/.vitepress/theme/ServicePage.vue'

const apps: App[] = []
afterEach(() => { apps.splice(0).forEach((app) => app.unmount()); document.body.replaceChildren() })

function mountServicePage() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(ServicePage)
  app.mount(host)
  apps.push(app)
}

describe('custom service conversion page', () => {
  it('leads with the paid biweekly workshop and a working registration jump', () => {
    mountServicePage()
    const brandTitle = document.querySelector('.wbx-service > .wbx-service-header .wbx-service-brand-title')
    const header = document.querySelector('.wbx-service > .wbx-service-header')
    const hero = document.querySelector('.wbx-service-hero')
    const promise = hero?.querySelector('.wbx-service-hero__promise')
    const primary = hero?.querySelector<HTMLAnchorElement>('.wbx-service-action--primary')
    const registrationPopover = hero?.querySelector('.wbx-service-registration-popover')
    const registrationQr = registrationPopover?.querySelector<HTMLImageElement>('img')
    const poster = hero?.querySelector<HTMLImageElement>('.wbx-service-hero__poster')
    const posterLink = hero?.querySelector<HTMLAnchorElement>('.wbx-service-hero__poster-link')
    expect(Array.from(brandTitle?.querySelectorAll('span') ?? []).map((item) => item.textContent?.trim())).toEqual(['WorkBuddy-X', '定制服务'])
    expect(header?.querySelector('.wbx-service-header__eyebrow')?.textContent).toBe('WORKBUDDY CUSTOM SERVICE')
    expect(header?.querySelector('.wbx-service-header__title > .wbx-service-header__summary')?.textContent).toBe('从一场工作坊验证真实问题，再进入需求诊断与企业定制落地。')
    expect(header?.querySelector(':scope > .wbx-service-header__summary')).toBeNull()
    expect(hero?.querySelector('.wbx-service-brand-title')).toBeNull()
    expect(promise?.textContent).toContain('先用一场工作坊')
    expect(hero?.querySelector('.wbx-service-eyebrow')).toBeNull()
    expect(hero?.textContent).toContain('每 2 周一期')
    expect(hero?.textContent).toContain('¥39')
    expect(primary?.getAttribute('href')).toBe('#workshop-registration')
    expect(primary?.textContent).toContain('报名最近一期')
    expect(primary?.getAttribute('aria-describedby')).toBe('workshop-registration-popover')
    expect(registrationPopover?.getAttribute('role')).toBe('tooltip')
    expect(registrationQr?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/workshop-registration-qr.png')
    expect(registrationQr?.getAttribute('alt')).toContain('粗门报名二维码')
    expect(poster?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/workshop-cover.png')
    expect(poster?.getAttribute('alt')).toContain('WorkBuddy 场景实战工作坊')
    expect(poster?.getAttribute('width')).toBe('1800')
    expect(poster?.getAttribute('height')).toBe('2400')
    expect(posterLink?.getAttribute('href')).toBe('https://mp.weixin.qq.com/s/Kn-3p5G1mlxDJ7yC-v-fUw')
    expect(posterLink?.getAttribute('target')).toBe('_blank')
    expect(posterLink?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(posterLink?.getAttribute('aria-label')).toContain('查看工作坊活动详情')
  })

  it('orders the standalone page title, conversion path, workshop hero, and follow-up sections', () => {
    mountServicePage()
    const service = document.querySelector('.wbx-service')
    const main = service?.querySelector(':scope > .wbx-service-main')
    expect(Array.from(service?.children ?? []).map((item) => item.className)).toEqual([
      'wbx-service-header',
      'wbx-service-main',
    ])
    expect(Array.from(main?.children ?? []).slice(0, 3).map((item) => item.className)).toEqual([
      'wbx-service-section wbx-service-journey',
      'wbx-service-hero',
      'wbx-service-section wbx-service-registration',
    ])
  })

  it('presents one three-stage path from workshop to enterprise delivery', () => {
    mountServicePage()
    const stages = Array.from(document.querySelectorAll('.wbx-service-path__item'))
    const journeyHeading = document.querySelector('.wbx-service-journey .wbx-service-section__heading')
    const text = document.body.textContent ?? ''
    expect(journeyHeading?.querySelector('.wbx-service-section__title-group #service-path-title')?.textContent).toBe('从一次体验，到一个可落地项目')
    expect(journeyHeading?.querySelector('.wbx-service-section__summary')?.textContent).toBe('先体验、再诊断、后定制，让每一步投入都建立在真实问题之上。')
    expect(stages).toHaveLength(3)
    expect(stages.map((stage) => stage.getAttribute('tabindex'))).toEqual(['0', '0', '0'])
    expect(stages.map((stage) => stage.querySelector('h3')?.textContent?.trim())).toEqual(['参加实战工作坊', '完成需求诊断', '进入企业定制项目'])
    expect(stages[0].textContent).toContain('¥39')
    expect(stages[1].textContent).toContain('¥399')
    expect(stages[1].querySelector('.wbx-service-path__benefit')?.textContent).toContain('企业认证为合作伙伴将免费诊断 3 次。')
    expect(document.querySelector('.wbx-service-enterprise__benefit')?.textContent).toContain('企业认证为合作伙伴将免费诊断 3 次。')
    expect(text).not.toContain('采购 WorkBuddy 10 个席位')
    expect(text).toContain('培训、陪跑、实施与持续支持')
    expect(document.querySelector('.wbx-service-ladder')).toBeNull()
    expect(document.querySelector('.wbx-service-fde-model')).toBeNull()
  })

  it('formats hero workshop facts as deliberate two-line values without separators', () => {
    mountServicePage()
    const values = Array.from(document.querySelectorAll('.wbx-service-hero__facts dd'))
    expect(Array.from(values[0].querySelectorAll('span')).map((item) => item.textContent?.trim())).toEqual(['2026 年 8 月 29 日', '14:00–18:00'])
    expect(Array.from(values[2].querySelectorAll('span')).map((item) => item.textContent?.trim())).toEqual(['星辉 OPC', '人工智能产业园'])
    expect(values[0].textContent).not.toContain('·')
    expect(values[2].textContent).not.toContain('·')
  })

  it('uses the supplied registration poster as the live WeChat mini-program payment entry', () => {
    mountServicePage()
    const registration = document.querySelector('#workshop-registration')
    const poster = registration?.querySelector<HTMLImageElement>('img')
    expect(registration?.textContent).toContain('微信扫码报名并支付')
    expect(registration?.textContent).toContain('2026 年 8 月 29 日')
    expect(registration?.textContent).toContain('14:00–18:00')
    expect(registration?.textContent).toContain('15–25 人')
    expect(registration?.textContent).toContain('星辉 OPC · 人工智能产业园')
    expect(poster?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/workshop-registration.png')
    expect(poster?.getAttribute('alt')).toContain('小程序二维码')
    expect(poster?.getAttribute('width')).toBe('1800')
    expect(poster?.getAttribute('height')).toBe('2400')
  })

  it('keeps business logic concise and repeats meaningful conversion actions', () => {
    mountServicePage()
    expect(document.querySelectorAll('.wbx-service > header, .wbx-service-main > section')).toHaveLength(7)
    expect(document.querySelectorAll('a[href="#workshop-registration"]')).toHaveLength(2)
    expect(document.querySelectorAll('a[href="#enterprise-custom"]')).toHaveLength(1)
    expect(document.querySelectorAll('.wbx-service-problem__item')).toHaveLength(3)
    expect(document.querySelectorAll('.wbx-service-case')).toHaveLength(2)
    expect(document.body.textContent).not.toContain('报名表准备中')
    expect(document.body.textContent).not.toContain('企业采购通道准备中')
  })

  it('keeps the visual poster separate from hero copy to avoid the old collapsed grid', () => {
    mountServicePage()
    const hero = document.querySelector('.wbx-service-hero')
    const poster = hero?.querySelector('.wbx-service-hero__poster')
    expect(hero?.children).toHaveLength(2)
    expect(hero?.children[0].classList.contains('wbx-service-hero__copy')).toBe(true)
    expect(hero?.children[1].classList.contains('wbx-service-hero__media')).toBe(true)
    expect(hero?.children[0].contains(poster ?? null)).toBe(false)
  })
})
