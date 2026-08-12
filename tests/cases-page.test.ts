import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
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
])

vi.mock('vitepress', () => ({
  withBase: (path: string) => `/WBWB-X${path}`,
}))

vi.mock('../docs/.vitepress/case-catalog.data', () => ({
  data: fixtureCatalog,
}))

import CasesPage from '../docs/.vitepress/theme/CasesPage.vue'

const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
})

function mountCasesPage() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(CasesPage)
  app.mount(host)
  apps.push(app)
}

describe('case gallery', () => {
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
    const selectedCategory = document.querySelector<HTMLButtonElement>('[data-category="全部"]')

    expect(firstCard?.getAttribute('href')).toBe('/WBWB-X/cases/submissions/excel-store-analysis/')
    expect(firstCard?.getAttribute('aria-label')).toBe('查看案例：Excel 门店经营分析')
    expect(firstCard?.querySelectorAll('button, a')).toHaveLength(0)
    expect(firstImage?.getAttribute('alt')).toBe('门店经营 Excel 看板')
    expect(selectedCategory?.getAttribute('aria-pressed')).toBe('true')
    expect(selectedCategory?.querySelector('[aria-hidden="true"]')?.classList.contains('hn')).toBe(true)
    expect(selectedCategory?.querySelector('[aria-hidden="true"]')?.classList.contains('hn-check-circle-solid')).toBe(true)
    expect(selectedCategory?.querySelector('[aria-hidden="true"]')?.textContent).toBe('')
    expect(selectedCategory?.textContent?.trim()).toBe('全部')
    expect(document.querySelector('.wbx-cases-filter-panel')?.getAttribute('id')).toBe('case-gallery')
  })

  it('keeps cases in the main column and tools in the sticky side column', () => {
    mountCasesPage()

    const layout = document.querySelector('.wbx-cases-layout-grid')
    const main = layout?.querySelector(':scope > .wbx-cases-main-column')
    const tools = layout?.querySelector(':scope > .wbx-cases-tools-column')

    expect(main?.querySelector('#case-gallery-title')).not.toBeNull()
    expect(main?.querySelector('#case-gallery-heading')).toBeNull()
    expect(document.body.textContent).not.toContain('CASE GALLERY')
    expect(main?.querySelector('.wbx-cases-hero__copy > p:last-child')?.textContent)
      .toBe('从真实场景出发，找到可以带走复用的工作方法。')
    expect(main?.querySelector('.wbx-cases-gallery-results')).not.toBeNull()
    expect(main?.querySelector('.wbx-cases-submit')).toBeNull()
    expect(tools?.querySelector('.wbx-cases-search')).not.toBeNull()
    expect(tools?.querySelector('.wbx-cases-categories')).not.toBeNull()
    expect(tools?.querySelector('#submit-case')).not.toBeNull()
    expect(document.querySelectorAll('.wbx-cases-submit')).toHaveLength(1)
    expect(document.querySelector('.wbx-cases-outline')).toBeNull()
  })
})
