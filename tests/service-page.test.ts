import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import type { CaseCatalogItem } from '../docs/.vitepress/case-catalog'

const fixtureCatalog = vi.hoisted((): readonly CaseCatalogItem[] => [
  {
    route: '/cases/submissions/excel-store-analysis/',
    title: 'Excel 门店经营分析',
    date: '2026-08-03',
    productTag: 'WorkBuddy',
    category: '数据分析',
    outcome: '把门店 Excel 汇总为可复用的经营看板。',
    cover: '/article-assets/cases/excel-cover.jpg',
    coverAlt: '门店经营 Excel 看板',
  },
  {
    route: '/cases/submissions/content-calendar/',
    title: '内容排期协作',
    date: '2026-08-02',
    productTag: 'WorkBuddy',
    category: '内容创作',
    outcome: '把选题、文案和发布时间汇总为内容日历。',
    cover: '/article-assets/cases/content-cover.jpg',
    coverAlt: '内容日历界面',
  },
  {
    route: '/cases/submissions/knowledge-base/',
    title: '团队知识库整理',
    date: '2026-08-01',
    productTag: 'WorkBuddy+ima',
    category: '知识管理',
    outcome: '把零散资料整理为可检索的知识库。',
    cover: '/article-assets/cases/knowledge-cover.jpg',
    coverAlt: '团队知识库目录',
  },
  {
    route: '/cases/submissions/daily-briefing/',
    title: '每日资讯自动整理',
    date: '2026-07-31',
    productTag: 'WorkBuddy',
    category: '自动化',
    outcome: '每日生成带有原始来源的行业简报。',
    cover: '/article-assets/cases/daily-cover.jpg',
    coverAlt: '每日行业资讯简报',
  },
  {
    route: '/cases/submissions/fifth-case/',
    title: '第五个案例',
    date: '2026-07-30',
    productTag: 'WorkBuddy',
    category: '自动化',
    outcome: '用于证明相关案例数量上限。',
    cover: '/article-assets/cases/fifth-cover.jpg',
    coverAlt: '第五个案例结果',
  },
])

vi.mock('vitepress', () => ({
  withBase: (path: string) => `/WBWB-X${path}`,
}))

vi.mock('../docs/.vitepress/case-catalog.data', () => ({
  data: fixtureCatalog,
}))

import { serviceConfig } from '../docs/.vitepress/service-config'
import ServicePage from '../docs/.vitepress/theme/ServicePage.vue'

const initialConfig = { ...serviceConfig }
const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  Object.assign(serviceConfig, initialConfig)
})

function mountServicePage() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(ServicePage)
  app.mount(host)
  apps.push(app)
}

describe('custom diagnostic service page', () => {
  it('renders the complete offer, boundaries, process, and rules', () => {
    mountServicePage()

    const text = document.body.textContent ?? ''
    const sectionOrder = [
      '.wbx-service-offer',
      '.wbx-service-problems',
      '.wbx-service-deliverables',
      '.wbx-service-exclusions',
      '.wbx-service-process',
      '#payment-and-application',
      '.wbx-service-rules',
      '.wbx-service-related',
    ].map((selector) => document.querySelector(selector))
    const pageBands = Array.from(document.querySelectorAll('.wbx-service > header, .wbx-service > section'))

    expect(text).toContain('WorkBuddy 需求诊断')
    expect(text).toContain('¥399 / 次')
    expect(text).toContain('45 分钟')
    expect(text).toContain('7 个自然日')
    expect(text).toContain('24 小时')
    expect(text).toContain('15 分钟')
    expect(text).toContain('诊断已经开始或完成后不退款')
    expect(text).toContain('可直接执行的提示词')
    expect(text).toContain('Skill 文件')
    expect(text).toContain('实施交付')
    expect(document.querySelector('.wbx-service-offer a')?.getAttribute('href')).toBe('#payment-and-application')
    expect(document.querySelectorAll('.wbx-service-process li')).toHaveLength(6)
    expect(sectionOrder.every(Boolean)).toBe(true)
    expect(sectionOrder.map((element) => pageBands.indexOf(element!))).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('fails closed without production payment inputs', () => {
    mountServicePage()

    const payment = document.querySelector('#payment-and-application')

    expect(payment?.textContent).toContain('暂未开放预约')
    expect(payment?.querySelector('.wbx-service-application-link')).toBeNull()
    expect(payment?.querySelector('img[alt*="支付"]')).toBeNull()
    expect(payment?.querySelector('a[href^="http"]')).toBeNull()
  })

  it('shows the production QR and secure external form link only when ready', () => {
    Object.assign(serviceConfig, {
      freeCaseFormUrl: 'https://forms.example.com/free-case-submission',
      paidDiagnosticFormUrl: 'https://forms.example.com/paid-diagnostic',
      paymentQrPath: '/article-assets/service/wechat-payment-qr.png',
      confirmationWindow: '1 个工作日内确认',
      supportContact: 'support@example.com',
    })
    mountServicePage()

    const payment = document.querySelector('#payment-and-application')
    const qr = payment?.querySelector<HTMLImageElement>('.wbx-service-payment-qr')
    const form = payment?.querySelector<HTMLAnchorElement>('.wbx-service-application-link')

    expect(qr?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/wechat-payment-qr.png')
    expect(qr?.getAttribute('alt')).toContain('微信支付')
    expect(form?.getAttribute('href')).toBe('https://forms.example.com/paid-diagnostic')
    expect(form?.getAttribute('target')).toBe('_blank')
    expect(form?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(payment?.textContent).toContain('1 个工作日内确认')
    expect(payment?.textContent).toContain('support@example.com')
    expect(payment?.textContent).toContain('同设备访问时，保存二维码，在微信“扫一扫”中从相册识别')
    expect(payment?.textContent).toContain('无法完成时联系支持人员')
    expect(payment?.textContent).not.toMatch(/支付宝|银行转账|银行卡/)
    expect(payment?.textContent).not.toContain('暂未开放预约')
  })

  it('states who can use submitted materials and how long they are retained', () => {
    mountServicePage()

    const privacyRule = document.querySelector('.wbx-service-rules')?.textContent ?? ''

    expect(privacyRule).toContain('付款截图和需求资料仅限服务人员核对、诊断使用')
    expect(privacyRule).toContain('未成交项目在诊断完成后 30 天删除')
    expect(privacyRule).toContain('成交项目按交付周期保留')
  })

  it('uses four catalog entries as accessible related-case links', () => {
    mountServicePage()

    const cases = document.querySelectorAll<HTMLAnchorElement>('.wbx-service-case')

    expect(cases).toHaveLength(4)
    expect(cases[0].getAttribute('href')).toBe('/WBWB-X/cases/submissions/excel-store-analysis/')
    expect(cases[0].querySelector('img')?.getAttribute('alt')).toBe('门店经营 Excel 看板')
    expect(cases[0].textContent).toContain('把门店 Excel 汇总为可复用的经营看板。')
  })
})
