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
    const hero = document.querySelector('.wbx-service-hero')
    const primary = hero?.querySelector<HTMLAnchorElement>('.wbx-service-action--primary')
    const poster = hero?.querySelector<HTMLImageElement>('.wbx-service-hero__poster')
    expect(hero?.querySelector('h1')?.textContent).toContain('先用一场工作坊')
    expect(hero?.textContent).toContain('每 2 周一期')
    expect(hero?.textContent).toContain('¥39')
    expect(primary?.getAttribute('href')).toBe('#workshop-registration')
    expect(primary?.textContent).toContain('报名最近一期')
    expect(poster?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/workshop-cover.png')
    expect(poster?.getAttribute('alt')).toContain('WorkBuddy 场景实战工作坊')
    expect(poster?.getAttribute('width')).toBe('1800')
    expect(poster?.getAttribute('height')).toBe('2400')
  })

  it('presents one three-stage path from workshop to enterprise delivery', () => {
    mountServicePage()
    const stages = Array.from(document.querySelectorAll('.wbx-service-path__item'))
    const text = document.body.textContent ?? ''
    expect(stages).toHaveLength(3)
    expect(stages.map((stage) => stage.querySelector('h3')?.textContent?.trim())).toEqual(['参加实战工作坊', '完成需求诊断', '进入企业定制项目'])
    expect(stages[0].textContent).toContain('¥39')
    expect(stages[1].textContent).toContain('¥399')
    expect(stages[1].textContent).toContain('采购 WorkBuddy 10 个席位，诊断免费')
    expect(text).toContain('培训、陪跑、实施与持续支持')
    expect(document.querySelector('.wbx-service-ladder')).toBeNull()
    expect(document.querySelector('.wbx-service-fde-model')).toBeNull()
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
    expect(document.querySelectorAll('.wbx-service > header, .wbx-service-main > section')).toHaveLength(6)
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
