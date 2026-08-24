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
  it('keeps the complete workshop section out of service and points workshop actions to home', () => {
    mountServicePage()

    expect(document.querySelector('.wbx-service-hero')).toBeNull()
    expect(document.querySelector('#workshop-registration')).toBeNull()
    expect(document.querySelector('#workshop-history')).toBeNull()
    expect(document.querySelectorAll('a[href="/WBWB-X/#workshop-registration"]')).toHaveLength(1)
  })

  it('orders the service journey directly before the problem and enterprise sections', () => {
    mountServicePage()
    const service = document.querySelector('.wbx-service')
    const main = service?.querySelector(':scope > .wbx-service-main')

    expect(Array.from(service?.children ?? []).map((item) => item.className)).toEqual([
      'wbx-service-header',
      'wbx-service-main',
    ])
    expect(Array.from(main?.children ?? []).map((item) => item.className)).toEqual([
      'wbx-service-section wbx-service-journey',
      'wbx-service-section wbx-service-problems',
      'wbx-service-section wbx-service-enterprise',
      'wbx-service-section wbx-service-related',
    ])
  })

  it('keeps the three-stage path and its concrete pricing', () => {
    mountServicePage()
    const stages = Array.from(document.querySelectorAll('.wbx-service-path__item'))

    expect(document.querySelector('.wbx-service-brand-title')?.textContent).toContain('WorkBuddy-X服务')
    expect(stages.map((stage) => stage.querySelector('h3')?.textContent?.trim())).toEqual(['参加实战工作坊', '完成需求诊断', '进入企业定制项目'])
    expect(stages[0].textContent).toContain('¥39')
    expect(stages[1].textContent).toContain('¥399')
    expect(stages[2].textContent).toContain('按项目评估')
  })

  it('keeps the service problem framing and enterprise conversion content', () => {
    mountServicePage()

    expect(document.querySelectorAll('.wbx-service-problem__item')).toHaveLength(3)
    expect(document.querySelector('#problems-title')?.textContent).toBe('不同阶段，只解决当下最重要的问题')
    expect(document.querySelector('#enterprise-title')?.textContent).toBe('诊断确认后，再进入企业定制')
    expect(document.querySelector('.wbx-service-enterprise__benefit')?.textContent).toContain('免费诊断 3 次')
  })

  it('keeps two real outcome cards and the team content out of service', () => {
    mountServicePage()
    const cases = Array.from(document.querySelectorAll<HTMLAnchorElement>('.wbx-service-case'))

    expect(cases).toHaveLength(2)
    expect(cases.map((item) => item.getAttribute('href'))).toEqual([
      '/WBWB-X/cases/submissions/excel-store-analysis/',
      '/WBWB-X/cases/submissions/content-calendar/',
    ])
    expect(document.querySelector('.wbx-service-guests')).toBeNull()
    expect(document.body.textContent).not.toContain('场景教练和前线部署工程师（FDE）')
  })
})
