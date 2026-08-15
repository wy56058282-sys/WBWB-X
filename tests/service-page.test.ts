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
  it('renders the five-offer ladder and separate enterprise purchase boundary', () => {
    mountServicePage()

    const text = document.body.textContent ?? ''
    const sectionOrder = [
      '.wbx-service-offer',
      '.wbx-service-ladder',
      '.wbx-service-enterprise',
      '.wbx-service-problems',
      '.wbx-service-process',
      '.wbx-service-exclusions',
      '.wbx-service-rules',
      '.wbx-service-related',
    ].map((selector) => document.querySelector(selector))
    const pageBands = Array.from(document.querySelectorAll('.wbx-service > header, .wbx-service > section'))

    expect(text).toContain('WorkBuddy 需求诊断')
    expect(text).toContain('¥399')
    expect(text).toContain('45 分钟')
    expect(text).toContain('固定诊断结论摘要')
    expect(text).toContain('需求诊断')
    expect(text).toContain('定制培训')
    expect(text).toContain('FDE 现场支持')
    expect(text).toContain('项目实施')
    expect(text).toContain('持续支持')
    expect(text).toContain('¥2,999 起')
    expect(text).toContain('约 2 小时')
    expect(text).toContain('¥5,999 起')
    expect(text).toContain('半天')
    expect(text).toContain('¥12,800 起')
    expect(text).toContain('按月')
    expect(text).toContain('腾讯云企业版购买')
    expect(text).toContain('腾讯云账号注册及个人实名认证')
    expect(text).toContain('本网站不收取席位费')
    expect(text).toContain('20 个及以上席位')
    expect(text).toContain('一场或两场 90 分钟线上工作坊')
    expect(text).toContain('无需部署基础设施')
    expect(text).toContain('简单任务可能获得免费协助')
    expect(sectionOrder.every(Boolean)).toBe(true)
    expect(sectionOrder.map((element) => pageBands.indexOf(element!))).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(document.querySelector('.wbx-service')?.tagName).not.toBe('MAIN')
  })

  it('keeps every public channel independently unavailable by default', () => {
    mountServicePage()

    const businessWechat = document.querySelector('.wbx-service-business-wechat')
    const application = document.querySelector('#service-application')
    const enterprise = document.querySelector('#enterprise-purchase')

    expect(businessWechat?.textContent).toContain('商务微信即将开放')
    expect(businessWechat?.querySelector('img')).toBeNull()
    expect(application?.querySelector('button[disabled]')?.textContent).toContain('报名表准备中')
    expect(application?.querySelector('a[href^="http"]')).toBeNull()
    expect(enterprise?.querySelector('button[disabled]')?.textContent).toContain('企业采购通道准备中')
    expect(enterprise?.querySelector('img')).toBeNull()
  })

  it('renders only the configured business WeChat QR', () => {
    serviceConfig.businessWechatQrPath = '/article-assets/service/business-wechat.png'
    mountServicePage()

    const businessWechat = document.querySelector('.wbx-service-business-wechat')
    const application = document.querySelector('#service-application')
    const enterprise = document.querySelector('#enterprise-purchase')
    const businessQr = businessWechat?.querySelector<HTMLImageElement>('img')

    expect(businessQr?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/business-wechat.png')
    expect(businessQr?.getAttribute('alt')).toBe('WorkBuddy 商务微信二维码')
    expect(application?.querySelector('button[disabled]')?.textContent).toContain('报名表准备中')
    expect(enterprise?.querySelector('button[disabled]')?.textContent).toContain('企业采购通道准备中')
  })

  it('renders only the configured HTTPS application form', () => {
    serviceConfig.applicationFormUrl = 'https://forms.example.com/diagnosis'
    mountServicePage()

    const businessWechat = document.querySelector('.wbx-service-business-wechat')
    const application = document.querySelector('#service-application')
    const enterprise = document.querySelector('#enterprise-purchase')
    const applicationForm = application?.querySelector<HTMLAnchorElement>('a.wbx-service-application-link')

    expect(applicationForm?.getAttribute('href')).toBe('https://forms.example.com/diagnosis')
    expect(applicationForm?.getAttribute('target')).toBe('_blank')
    expect(applicationForm?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(businessWechat?.querySelector('img')).toBeNull()
    expect(businessWechat?.textContent).toContain('商务微信即将开放')
    expect(enterprise?.querySelector('img')).toBeNull()
    expect(enterprise?.querySelector('button[disabled]')?.textContent).toContain('企业采购通道准备中')
  })

  it('renders only the configured enterprise-channel QR', () => {
    serviceConfig.enterpriseChannelQrPath = '/article-assets/service/enterprise-channel.png'
    mountServicePage()

    const businessWechat = document.querySelector('.wbx-service-business-wechat')
    const application = document.querySelector('#service-application')
    const enterprise = document.querySelector('#enterprise-purchase')
    const enterpriseQr = enterprise?.querySelector<HTMLImageElement>('img')

    expect(enterpriseQr?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/enterprise-channel.png')
    expect(enterpriseQr?.getAttribute('alt')).toBe('WorkBuddy 企业采购渠道二维码')
    expect(businessWechat?.querySelector('img')).toBeNull()
    expect(businessWechat?.textContent).toContain('商务微信即将开放')
    expect(application?.querySelector('button[disabled]')?.textContent).toContain('报名表准备中')
  })

  it('returns to disabled placeholders after ready-state fixtures reset', () => {
    serviceConfig.businessWechatQrPath = '/article-assets/service/business-wechat.png'
    mountServicePage()
    apps.pop()?.unmount()
    document.body.replaceChildren()
    Object.assign(serviceConfig, initialConfig)
    mountServicePage()

    expect(document.querySelector('.wbx-service-business-wechat')?.textContent).toContain('商务微信即将开放')
    expect(document.querySelector('#service-application button[disabled]')?.textContent).toContain('报名表准备中')
    expect(document.querySelector('#enterprise-purchase button[disabled]')?.textContent).toContain('企业采购通道准备中')
  })

  it('uses the consult-first order and never exposes a public payment flow', () => {
    mountServicePage()

    const text = document.body.textContent ?? ''
    const process = Array.from(document.querySelectorAll('.wbx-service-process li')).map((item) => item.textContent ?? '')

    expect(process).toHaveLength(6)
    expect(process).toEqual(expect.arrayContaining([
      expect.stringContaining('提交需求'),
      expect.stringContaining('确认范围与时间'),
      expect.stringContaining('报名表'),
      expect.stringContaining('发送付款二维码'),
      expect.stringContaining('完成诊断'),
      expect.stringContaining('收到结论'),
    ]))
    expect(process.findIndex((item) => item.includes('发送付款二维码'))).toBeGreaterThan(
      process.findIndex((item) => item.includes('确认范围与时间')),
    )
    expect(text).toContain('报名表收集需求与背景、联系方式和 3 个候选时间')
    expect(text).toContain('服务方确认候选时间后，私下发送 ¥399 付款二维码；完成付款后，预约才锁定')
    expect(document.querySelector('img[alt*="支付"]')).toBeNull()
    expect(text).not.toContain('微信支付')
    expect(text).not.toContain('先支付')
  })

  it('states service exclusions and deletes unclosed materials after 30 days', () => {
    mountServicePage()

    const text = document.body.textContent ?? ''

    expect(text).toContain('不包含')
    expect(text).toContain('可直接执行的提示词')
    expect(text).toContain('Skill 文件')
    expect(text).toContain('资料仅用于本次沟通与服务评估')
    expect(text).toContain('未完成签约或未进入实施的资料将在 30 天后删除')
  })

  it('uses four catalog entries as accessible related-case links', () => {
    mountServicePage()

    const cases = document.querySelectorAll<HTMLAnchorElement>('.wbx-service-case')

    expect(cases).toHaveLength(4)
    expect(cases[0].getAttribute('href')).toBe('/WBWB-X/cases/submissions/excel-store-analysis/')
    expect(cases[0].querySelector('img')?.getAttribute('alt')).toBe('门店经营 Excel 看板')
    expect(cases[0].textContent).toContain('把门店 Excel 汇总为可复用的经营看板。')
  })

  it('renders one registered pixel checklist icon for every suitable problem', () => {
    mountServicePage()

    const rows = Array.from(document.querySelectorAll('.wbx-service-checklist > li'))

    expect(rows).toHaveLength(4)
    expect(rows.every((row) => row.querySelector('.hn.hn-check-box-solid.wbx-service-checklist__icon[aria-hidden="true"]'))).toBe(true)
    expect(rows.every((row) => row.querySelectorAll('.wbx-service-checklist__icon').length === 1)).toBe(true)
  })
})
