import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { caseCategories, type CaseCatalogItem } from '../docs/.vitepress/case-catalog'

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
])

vi.mock('vitepress', () => ({
  withBase: (path: string) => `/WBWB-X${path}`,
}))

vi.mock('../docs/.vitepress/case-catalog.data', () => ({
  data: fixtureCatalog,
}))

import CasesPage from '../docs/.vitepress/theme/CasesPage.vue'

const apps: App[] = []
const originalResizeObserver = globalThis.ResizeObserver
const originalInnerWidth = window.innerWidth
const originalInnerHeight = window.innerHeight

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  globalThis.ResizeObserver = originalResizeObserver
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight })
  vi.restoreAllMocks()
})

function mountCasesPage() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(CasesPage)
  app.mount(host)
  apps.push(app)
}

describe('case gallery', () => {
  it('defaults to the personal catalog and exposes personal and enterprise tabs', () => {
    mountCasesPage()

    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    expect(tabs.slice(0, 2).map((tab) => tab.textContent?.trim())).toEqual(['个人', '企业'])
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true')
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('false')
    expect(document.querySelector('[role="tabpanel"]')?.textContent).toContain('Excel 门店经营分析')
  })

  it('filters cases by search and category, then restores the full catalog', async () => {
    mountCasesPage()

    expect(document.querySelectorAll('.wbx-case-card')).toHaveLength(3)

    const search = document.querySelector<HTMLInputElement>('input[type="search"]')
    search?.focus()
    search?.setSelectionRange(0, 0)
    search?.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'excel', inputType: 'insertText' }))
    search!.value = 'excel'
    search?.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(document.querySelectorAll('.wbx-case-card')).toHaveLength(1)

    document.querySelector<HTMLButtonElement>('[data-category="内容创作"]')?.click()
    await nextTick()
    expect(document.body.textContent).toContain('没有找到匹配的案例')

    document.querySelector<HTMLButtonElement>('.wbx-cases-empty button')?.click()
    await nextTick()
    expect(document.querySelectorAll('.wbx-case-card')).toHaveLength(3)
  })

  it('keeps cards accessible and applies the configured base to internal links', () => {
    mountCasesPage()

    const firstCard = document.querySelector<HTMLAnchorElement>('.wbx-case-card__link')
    const firstImage = firstCard?.querySelector('img')
    const firstSource = firstCard?.querySelector('source')
    const secondImage = document.querySelectorAll<HTMLImageElement>('.wbx-case-card__cover')[1]
    const selectedCategory = document.querySelector<HTMLButtonElement>('[data-category="全部"]')

    expect(firstCard?.getAttribute('href')).toBe('/WBWB-X/cases/submissions/excel-store-analysis/')
    expect(firstCard?.getAttribute('aria-label')).toBe('查看案例：Excel 门店经营分析')
    expect(firstCard?.querySelectorAll('button, a')).toHaveLength(0)
    expect(firstImage?.getAttribute('alt')).toBe('门店经营 Excel 看板')
    expect(firstImage?.getAttribute('loading')).toBe('eager')
    expect(firstImage?.getAttribute('fetchpriority')).toBe('high')
    expect(firstSource?.getAttribute('srcset'))
      .toBe('/WBWB-X/article-assets/cases/excel-cover-card.webp')
    expect(secondImage?.getAttribute('loading')).toBe('lazy')
    expect(secondImage?.getAttribute('fetchpriority')).toBe('low')
    expect(selectedCategory?.getAttribute('aria-pressed')).toBe('true')
    expect(selectedCategory?.querySelector('[aria-hidden="true"]')?.classList.contains('hn')).toBe(true)
    expect(selectedCategory?.querySelector('[aria-hidden="true"]')?.classList.contains('hn-check-circle-solid')).toBe(true)
    expect(selectedCategory?.querySelector('[aria-hidden="true"]')?.textContent).toBe('')
    expect(selectedCategory?.textContent?.trim()).toBe('全部')
    expect(document.querySelector('.wbx-cases-categories')?.getAttribute('id')).toBe('case-gallery')
  })

  it('keeps cases in the main column and tools in the sticky side column', () => {
    mountCasesPage()

    const layout = document.querySelector('.wbx-cases-layout-grid')
    const main = layout?.querySelector(':scope > .wbx-cases-main-column')
    const tools = layout?.querySelector(':scope > .wbx-cases-tools-column')

    expect(main?.querySelector('#case-gallery-title')).not.toBeNull()
    expect(main?.querySelector('#case-gallery-heading')).toBeNull()
    expect(document.body.textContent).not.toContain('CASE GALLERY')
    expect(document.body.textContent).not.toContain('WORKBUDDY COMMUNITY')
    expect(document.body.textContent).not.toContain('CONTRIBUTE A CASE')
    expect(main?.querySelector('.wbx-cases-hero__copy > p:last-child')?.textContent)
      .toBe('从真实场景出发，找到可以带走复用的工作方法。')
    const categories = main?.querySelector('#personal-cases-panel > .wbx-cases-categories')
    expect(categories).not.toBeNull()
    expect(
      [...(categories?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
        .map((button) => button.dataset.category),
    ).toEqual(caseCategories(fixtureCatalog))
    expect(main?.querySelector('.wbx-cases-gallery-results')).not.toBeNull()
    expect(main?.querySelector('.wbx-cases-submit')).toBeNull()
    expect(tools?.firstElementChild?.classList.contains('wbx-cases-tools-stack')).toBe(true)
    expect(tools?.querySelector('.wbx-cases-tools-stack > .wbx-cases-search')).not.toBeNull()
    expect(tools?.querySelector('.wbx-cases-search > span')).toBeNull()
    expect(tools?.querySelector('.wbx-cases-search input')?.getAttribute('aria-label')).toBe('搜索案例')
    expect(tools?.querySelector('.wbx-cases-categories')).toBeNull()
    expect(tools?.querySelector('#submit-case')).not.toBeNull()
    expect(document.querySelectorAll('.wbx-cases-submit')).toHaveLength(1)
    expect(document.querySelector('.wbx-cases-outline')).toBeNull()
  })

  it('switches to a locked enterprise directory and resets enterprise filters', async () => {
    mountCasesPage()
    document.querySelector<HTMLButtonElement>('#enterprise-cases-tab')?.click()
    await nextTick()

    expect(document.querySelectorAll('.wbx-enterprise-case-card')).toHaveLength(100)
    expect(document.querySelector('.wbx-enterprise-case-card a, .wbx-enterprise-case-card button')).toBeNull()
    expect(document.querySelector('.wbx-enterprise-case-card')?.textContent).toContain('企业案例，保密')
    expect(document.querySelector('.wbx-enterprise-case-card')?.textContent).not.toContain('详情暂未开放')

    document.querySelector<HTMLButtonElement>('.wbx-enterprise-filter-group[aria-label="行业筛选"] button:nth-of-type(2)')?.click()
    await nextTick()
    expect(document.querySelectorAll('.wbx-enterprise-case-card').length).toBeLessThan(100)

    const kindTabs = document.querySelectorAll<HTMLButtonElement>('.wbx-enterprise-kind-tabs [role="tab"]')
    kindTabs[1]?.click()
    await nextTick()
    expect(kindTabs[1]?.getAttribute('aria-selected')).toBe('true')
    expect(document.querySelectorAll('.wbx-enterprise-case-card')).toHaveLength(100)
  })

  it('keeps the viewport stationary while switching audiences', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.matches('#personal-cases-panel .wbx-cases-gallery-results')) return { top: 520 } as DOMRect
      if (this.matches('#enterprise-results')) return { top: 710 } as DOMRect
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 } as DOMRect
    })
    mountCasesPage()

    document.querySelector<HTMLButtonElement>('#enterprise-cases-tab')?.click()
    await nextTick()

    expect(scrollBy).not.toHaveBeenCalled()
    expect(document.querySelector('#enterprise-cases-tab')?.getAttribute('aria-selected')).toBe('true')
  })

  it('resets filters only when the audience actually changes', async () => {
    mountCasesPage()

    document.querySelector<HTMLButtonElement>('[data-category="内容创作"]')?.click()
    await nextTick()
    expect(document.querySelector('[data-category="内容创作"]')?.getAttribute('aria-pressed')).toBe('true')

    document.querySelector<HTMLButtonElement>('#personal-cases-tab')?.click()
    await nextTick()
    expect(document.querySelector('[data-category="内容创作"]')?.getAttribute('aria-pressed')).toBe('true')

    document.querySelector<HTMLButtonElement>('#enterprise-cases-tab')?.click()
    await nextTick()
    document.querySelector<HTMLButtonElement>('#personal-cases-tab')?.click()
    await nextTick()
    expect(document.querySelector('[data-category="全部"]')?.getAttribute('aria-pressed')).toBe('true')
  })

  it('moves selection and focus between audience tabs with arrow keys', async () => {
    mountCasesPage()
    const personalTab = document.querySelector<HTMLButtonElement>('#personal-cases-tab')!
    const enterpriseTab = document.querySelector<HTMLButtonElement>('#enterprise-cases-tab')!

    personalTab.focus()
    personalTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()
    await nextTick()

    expect(enterpriseTab.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(enterpriseTab)
  })

  it('uses category-style icons for enterprise content tabs', async () => {
    mountCasesPage()
    document.querySelector<HTMLButtonElement>('#enterprise-cases-tab')?.click()
    await nextTick()

    const sceneTab = document.querySelector<HTMLButtonElement>('#enterprise-scenes-tab')!
    const caseTab = document.querySelector<HTMLButtonElement>('#enterprise-catalog-cases-tab')!

    expect(sceneTab.querySelector('i')?.classList.contains('hn-check-circle-solid')).toBe(true)
    expect(caseTab.querySelector('i')?.classList.contains('hn-briefcase-solid')).toBe(true)

    caseTab.click()
    await nextTick()

    expect(sceneTab.querySelector('i')?.classList.contains('hn-lightbulb-solid')).toBe(true)
    expect(caseTab.querySelector('i')?.classList.contains('hn-check-circle-solid')).toBe(true)
  })

  it('only fixes the tools column when it fits in the desktop viewport', async () => {
    let resizeCallback: ResizeObserverCallback | undefined
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) { resizeCallback = callback }
      observe() {}
      disconnect() {}
      unobserve() {}
    }

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })
    const nav = document.createElement('header')
    nav.className = 'VPNavBar'
    nav.getBoundingClientRect = () => ({ top: 0, bottom: 96, height: 96 } as DOMRect)
    document.body.append(nav)
    mountCasesPage()
    const tools = document.querySelector<HTMLElement>('.wbx-cases-tools-stack')!
    tools.getBoundingClientRect = () => ({ top: 260, bottom: 800, height: 540 } as DOMRect)
    resizeCallback?.([], {} as ResizeObserver)
    await nextTick()
    expect(tools.classList.contains('is-sticky')).toBe(true)
    expect(tools.style.getPropertyValue('--wbx-cases-sticky-top')).toBe('120px')

    tools.getBoundingClientRect = () => ({ top: 260, bottom: 1080, height: 820 } as DOMRect)
    resizeCallback?.([], {} as ResizeObserver)
    await nextTick()
    expect(tools.classList.contains('is-sticky')).toBe(false)

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 })
    tools.getBoundingClientRect = () => ({ top: 180, bottom: 720, height: 540 } as DOMRect)
    resizeCallback?.([], {} as ResizeObserver)
    await nextTick()
    expect(tools.classList.contains('is-sticky')).toBe(false)
  })

  it('keeps the measured sticky offset stable while filtering cases', async () => {
    let resizeCallback: ResizeObserverCallback | undefined
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) { resizeCallback = callback }
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })
    const nav = document.createElement('header')
    nav.className = 'VPNavBar'
    nav.getBoundingClientRect = () => ({ top: 0, bottom: 80, height: 80 } as DOMRect)
    document.body.append(nav)
    mountCasesPage()

    const tools = document.querySelector<HTMLElement>('.wbx-cases-tools-stack')!
    tools.getBoundingClientRect = () => ({ top: 220, bottom: 740, height: 520 } as DOMRect)
    resizeCallback?.([], {} as ResizeObserver)
    await nextTick()
    const initialOffset = tools.style.getPropertyValue('--wbx-cases-sticky-top')

    document.querySelector<HTMLButtonElement>('[data-category="内容创作"]')?.click()
    await nextTick()
    expect(tools.style.getPropertyValue('--wbx-cases-sticky-top')).toBe(initialOffset)
    expect(initialOffset).toBe('104px')
  })

  it('recomputes the sticky safe area when the rendered navigation changes while scrolling', async () => {
    let resizeCallback: ResizeObserverCallback | undefined
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) { resizeCallback = callback }
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })
    let navBottom = 64
    const nav = document.createElement('header')
    nav.className = 'VPNavBar'
    nav.getBoundingClientRect = () => ({ top: 0, bottom: navBottom, height: navBottom } as DOMRect)
    document.body.append(nav)
    mountCasesPage()

    const tools = document.querySelector<HTMLElement>('.wbx-cases-tools-stack')!
    tools.getBoundingClientRect = () => ({ top: 220, bottom: 740, height: 520 } as DOMRect)
    resizeCallback?.([], {} as ResizeObserver)
    await nextTick()
    expect(tools.style.getPropertyValue('--wbx-cases-sticky-top')).toBe('88px')

    navBottom = 80
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(tools.style.getPropertyValue('--wbx-cases-sticky-top')).toBe('104px')
  })

  it('fixes the tools to the viewport after its anchor reaches the nav safe area', async () => {
    let resizeCallback: ResizeObserverCallback | undefined
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) { resizeCallback = callback }
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })
    const nav = document.createElement('header')
    nav.className = 'VPNavBar'
    nav.getBoundingClientRect = () => ({ top: 0, bottom: 64, height: 64 } as DOMRect)
    document.body.append(nav)
    mountCasesPage()

    const column = document.querySelector<HTMLElement>('.wbx-cases-tools-column')!
    const tools = document.querySelector<HTMLElement>('.wbx-cases-tools-stack')!
    let columnTop = 180
    column.getBoundingClientRect = () => ({ top: columnTop, left: 980, width: 280, height: 1200 } as DOMRect)
    tools.getBoundingClientRect = () => ({ top: columnTop, left: 980, width: 280, height: 540 } as DOMRect)
    resizeCallback?.([], {} as ResizeObserver)
    await nextTick()
    expect(tools.classList.contains('is-fixed')).toBe(false)

    columnTop = 40
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(tools.classList.contains('is-fixed')).toBe(true)
    expect(tools.style.getPropertyValue('--wbx-cases-fixed-left')).toBe('980px')
    expect(tools.style.getPropertyValue('--wbx-cases-fixed-width')).toBe('280px')
    expect(tools.style.getPropertyValue('--wbx-cases-sticky-top')).toBe('88px')
  })
})
