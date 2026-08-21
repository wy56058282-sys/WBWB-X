import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
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
    const panel = hero?.querySelector('.wbx-service-hero__panel')
    const promise = panel?.querySelector('.wbx-service-hero__promise')
    const primary = hero?.querySelector<HTMLAnchorElement>('.wbx-service-action--primary')
    const registrationPopover = hero?.querySelector('.wbx-service-registration-popover')
    const registrationQr = registrationPopover?.querySelector<HTMLImageElement>('img')
    const poster = hero?.querySelector<HTMLImageElement>('.wbx-service-hero__poster')
    const posterLink = hero?.querySelector<HTMLAnchorElement>('.wbx-service-hero__poster-link')
    expect(Array.from(brandTitle?.querySelectorAll('span') ?? []).map((item) => item.textContent?.trim())).toEqual(['WorkBuddy-X', '服务'])
    expect(header?.querySelector('.wbx-service-header__eyebrow')).toBeNull()
    expect(header?.querySelector('.wbx-service-header__title')?.firstElementChild).toBe(brandTitle)
    expect(header?.querySelector('.wbx-service-header__title > .wbx-service-header__summary')?.textContent).toBe('从一场工作坊验证真实问题，再进入需求诊断与企业定制落地。')
    expect(header?.querySelector(':scope > .wbx-service-header__summary')).toBeNull()
    expect(hero?.querySelector('.wbx-service-brand-title')).toBeNull()
    expect(panel?.querySelector('.wbx-service-hero__format')).toBeNull()
    expect(promise?.textContent?.trim()).toBe('场景实战工作坊')
    expect(panel?.querySelector('.wbx-service-hero__tagline')?.textContent?.trim()).toBe('掌握 AI · 掌控未来')
    expect(panel?.querySelector('.wbx-service-hero__audience')?.textContent?.trim()).toBe('面向人群：创业者、管理者、设计师、超级个体、一人公司（OPC）')
    expect(panel?.textContent).not.toContain('每 2 周一期')
    expect(document.body.textContent).toContain('¥39')
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

  it('switches complete workshop content through an accessible tab row', async () => {
    mountServicePage()
    const hero = document.querySelector('.wbx-service-hero')
    const editions = Array.from(hero?.querySelectorAll<HTMLButtonElement>('.wbx-service-edition') ?? [])
    const tablist = hero?.querySelector('.wbx-service-editions')
    const panel = hero?.querySelector('.wbx-service-hero__panel')
    const selectedLabel = () => hero?.querySelector('.wbx-service-hero__title-edition')?.textContent?.trim()
    const facts = () => Array.from(hero?.querySelectorAll('.wbx-service-hero__facts dd') ?? []).map((item) => ({
      lines: Array.from(item.querySelectorAll('span')).map((line) => line.textContent?.trim()),
      text: item.textContent?.trim(),
    }))

    expect(tablist?.getAttribute('role')).toBe('tablist')
    expect(panel?.getAttribute('role')).toBe('tabpanel')
    expect(panel?.getAttribute('aria-labelledby')).toBe('workshop-tab-829')
    expect(editions.map((edition) => edition.getAttribute('role'))).toEqual(['tab', 'tab', 'tab'])
    expect(editions.map((edition) => edition.id)).toEqual(['workshop-tab-815', 'workshop-tab-829', 'workshop-tab-912'])
    expect(editions.map((edition) => edition.getAttribute('aria-controls'))).toEqual(['workshop-panel', 'workshop-panel', 'workshop-panel'])
    expect(editions.map((edition) => edition.getAttribute('aria-label'))).toEqual([
      '查看第一期 08.15 工作坊信息',
      '查看第二期 08.29 工作坊信息',
      '查看第三期 09.12 工作坊信息',
    ])
    expect(editions[1].querySelector('small')?.textContent).toBe('当前')
    expect(editions.map((edition) => edition.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(editions.map((edition) => edition.getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])
    expect(selectedLabel()).toBe('第二期')
    expect(facts()).toEqual([
      { lines: ['2026 年 8 月 29 日', '14:00–18:00'], text: '2026 年 8 月 29 日14:00–18:00' },
      { lines: [], text: '15–25 人' },
      { lines: ['星辉 OPC', '人工智能产业园'], text: '星辉 OPC人工智能产业园' },
    ])
    expect(hero?.querySelector<HTMLImageElement>('.wbx-service-hero__poster')?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/workshop-cover.png')

    editions[0].click()
    await nextTick()
    expect(editions.map((edition) => edition.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false'])
    expect(panel?.getAttribute('aria-labelledby')).toBe('workshop-tab-815')
    expect(selectedLabel()).toBe('第一期')
    expect(facts()[0]).toEqual({ lines: ['2026 年 8 月 15 日', '14:00–18:00'], text: '2026 年 8 月 15 日14:00–18:00' })
    expect(hero?.querySelector<HTMLImageElement>('.wbx-service-hero__poster')?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/workshop-815.png')
    expect(hero?.querySelector<HTMLAnchorElement>('.wbx-service-hero__poster-link')?.getAttribute('href')).toBe('https://mp.weixin.qq.com/s/q7Bq2kEmsYlgI4pTZ59srw')

    editions[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await nextTick()
    expect(editions.map((edition) => edition.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true'])
    expect(panel?.getAttribute('aria-labelledby')).toBe('workshop-tab-912')
    expect(selectedLabel()).toBe('第三期')
    expect(facts()[0]).toEqual({ lines: ['2026 年 9 月 12 日', '14:00–18:00'], text: '2026 年 9 月 12 日14:00–18:00' })
    expect(hero?.querySelector<HTMLImageElement>('.wbx-service-hero__poster')?.getAttribute('src')).toBe('/WBWB-X/article-assets/service/workshop-912.png')
    expect(hero?.querySelector('.wbx-service-hero__poster-link')).toBeNull()
    expect(hero?.querySelector('.wbx-service-hero__poster-frame')).not.toBeNull()
  })

  it('cycles the selected workshop poster pages and resets the page when the edition changes', async () => {
    mountServicePage()
    const hero = document.querySelector('.wbx-service-hero')
    const editions = Array.from(hero?.querySelectorAll<HTMLButtonElement>('.wbx-service-edition') ?? [])
    const previous = () => hero?.querySelector<HTMLButtonElement>('.wbx-service-hero__poster-control--previous')
    const next = () => hero?.querySelector<HTMLButtonElement>('.wbx-service-hero__poster-control--next')
    const posterSource = () => hero?.querySelector<HTMLImageElement>('.wbx-service-hero__poster')?.getAttribute('src')
    const pageStatus = () => hero?.querySelector('.wbx-service-hero__poster-page')?.textContent?.trim()

    expect(previous()?.getAttribute('aria-label')).toBe('查看上一张海报')
    expect(next()?.getAttribute('aria-label')).toBe('查看下一张海报')
    expect(pageStatus()).toBe('1 / 4')

    next()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-829-agenda.png')
    expect(pageStatus()).toBe('2 / 4')

    next()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-829-benefits.png')

    next()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-829-reminder.png')

    next()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-cover.png')

    previous()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-829-reminder.png')

    editions[0].click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-815.png')
    expect(previous()?.getAttribute('aria-label')).toBe('查看上一张海报')
    expect(next()?.getAttribute('aria-label')).toBe('查看下一张海报')
    expect(pageStatus()).toBe('1 / 4')
    expect(hero?.querySelector('.wbx-service-hero__poster-navigation')).not.toBeNull()

    next()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-815-agenda.png')
    expect(pageStatus()).toBe('2 / 4')

    next()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-815-benefits.png')

    next()?.click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-815-reminder.png')

    editions[2].click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-912.png')
    expect(previous()).toBeNull()
    expect(next()).toBeNull()
    expect(pageStatus()).toBe('1 / 1')

    editions[1].click()
    await nextTick()
    expect(posterSource()).toBe('/WBWB-X/article-assets/service/workshop-cover.png')
    expect(pageStatus()).toBe('1 / 4')
  })

  it('introduces the workshop module before its edition tabs', () => {
    mountServicePage()
    const hero = document.querySelector('.wbx-service-hero')
    const copy = hero?.querySelector('.wbx-service-hero__copy')
    const heading = copy?.querySelector('.wbx-service-hero__heading')

    expect(heading?.querySelector('.wbx-service-eyebrow')?.textContent?.trim()).toBe('WORKBUDDY X WORKSHOP')
    expect(heading?.querySelector('#workshop-title')?.childNodes[0]?.textContent?.trim()).toBe('WorkBuddy X 工作坊')
    expect(heading?.querySelector('.wbx-service-hero__title-edition')?.textContent?.trim()).toBe('第二期')
    expect(heading?.querySelector(':scope > .wbx-service-section__summary')?.textContent?.trim()).toBe('先用一场工作坊，找到值得定制的真问题')
    expect(hero?.getAttribute('aria-labelledby')).toBe('workshop-title')
    expect(copy?.firstElementChild).toBe(heading)
    expect(hero?.children[0].classList.contains('wbx-service-hero__panel')).toBe(true)
    expect(hero?.children[1].classList.contains('wbx-service-editions')).toBe(true)
  })

  it('uses the approved updated poster asset for the first workshop edition', () => {
    const poster = readFileSync('docs/public/article-assets/service/workshop-815.png')
    expect(createHash('sha256').update(poster).digest('hex')).toBe('a7d1e17e3a04872878f917381d0b87a93a33584453615ad4178fbcaa9f63d058')
  })

  it('stacks the problem heading above its three-item content row', () => {
    mountServicePage()
    const section = document.querySelector('.wbx-service-problems')
    const heading = section?.querySelector(':scope > .wbx-service-section__heading')
    const titleGroup = heading?.querySelector('.wbx-service-section__title-group')
    const summary = heading?.querySelector('.wbx-service-section__summary')
    const list = section?.querySelector(':scope > .wbx-service-problem')

    expect(titleGroup?.querySelector('.wbx-service-eyebrow')?.textContent?.trim()).toBe('WHY THIS PATH')
    expect(titleGroup?.querySelector('#problems-title')?.textContent?.trim()).toBe('不同阶段，只解决当下最重要的问题')
    expect(summary?.textContent?.trim()).toBe('从体验、诊断到落地，让每一步只解决当前最关键的问题。')
    expect(section?.children[0]).toBe(heading)
    expect(section?.children[1]).toBe(list)
    expect(list?.querySelectorAll('.wbx-service-problem__item')).toHaveLength(3)
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
      'wbx-service-section wbx-service-guests',
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
    expect(stages[1].textContent).toContain('围绕真实业务场景，把目标、使用对象、流程边界、交付标准和实施风险逐项说清，形成可评估、可执行的需求方案。')
    expect(stages[0].querySelector('.wbx-service-path__benefit')?.textContent).toContain('每 2 周线下面对面交流，收集场景痛点。')
    expect(stages[1].querySelector('.wbx-service-path__benefit')?.textContent).toContain('企业认证为合作伙伴将免费诊断 3 次。')
    expect(stages[2].querySelector('.wbx-service-path__benefit')?.textContent).toContain('由专业腾讯官方签约服务商提供技术支持')
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

  it('replaces the repeated registration panel with all six supplied guest teachers', () => {
    mountServicePage()
    const guests = document.querySelector('#workshop-registration')
    const heading = guests?.querySelector(':scope > .wbx-service-section__heading')
    const images = Array.from(guests?.querySelectorAll<HTMLImageElement>('.wbx-service-guest img') ?? [])
    expect(heading?.querySelector('.wbx-service-section__title-group h2')?.textContent).toBe('场景教练和前线部署工程师（FDE）')
    expect(heading?.querySelector('.wbx-service-section__summary')?.textContent?.trim()).toBe('来自产品、设计、运营与 AI 实践的一线嘉宾，共同带你完成真实场景实战。')
    expect(guests?.textContent).not.toContain('微信扫码报名并支付')
    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/WBWB-X/article-assets/service/guest-wang-xiangxu.png',
      '/WBWB-X/article-assets/service/guest-huang-xueling.png',
      '/WBWB-X/article-assets/service/guest-li-zehui.png',
      '/WBWB-X/article-assets/service/guest-wang-jinsong.png',
      '/WBWB-X/article-assets/service/guest-liu-pengzhen.png',
      '/WBWB-X/article-assets/service/guest-ding-yihao.png',
    ])
    expect(images.map((image) => image.getAttribute('alt'))).toEqual([
      '嘉宾老师王翔旭', '嘉宾老师黄学铃', '嘉宾老师李泽慧', '嘉宾老师王劲松', '嘉宾老师刘鹏振', '嘉宾老师丁怡豪',
    ])
    expect(images.every((image) => image.getAttribute('loading') === 'lazy')).toBe(true)
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
    const panel = hero?.querySelector('.wbx-service-hero__panel')
    const poster = hero?.querySelector('.wbx-service-hero__poster')
    expect(hero?.children).toHaveLength(2)
    expect(hero?.children[0].classList.contains('wbx-service-hero__panel')).toBe(true)
    expect(hero?.children[1].classList.contains('wbx-service-editions')).toBe(true)
    expect(panel?.children[0].classList.contains('wbx-service-hero__copy')).toBe(true)
    expect(panel?.children[1].classList.contains('wbx-service-hero__media')).toBe(true)
    expect(panel?.children[0].contains(poster ?? null)).toBe(false)
  })
})
