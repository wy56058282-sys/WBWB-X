import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { readFileSync } from 'node:fs'

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))
vi.mock('../docs/.vitepress/case-catalog.data', () => ({ data: [] }))

import ToolsPage from '../docs/.vitepress/theme/ToolsPage.vue'

const apps: App[] = []

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  window.history.replaceState({}, '', '/tools/')
})

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function mountToolsPage() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(ToolsPage)
  app.mount(host)
  apps.push(app)
}

function tabs() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.wbx-tools__tabs > [role="tab"]'))
}

describe('tools page', () => {
  it('explains the product portfolio and keeps the WorkBuddy hero below the page heading', () => {
    mountToolsPage()

    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('.wbx-tools__header > p:last-child')?.textContent).toBe(
      '汇集 WorkBuddy-X 正在构建的产品，帮助你按任务与场景找到合适的 AI 工具。',
    )
    expect(document.querySelector('.wbx-service-hero__title')?.tagName).toBe('H2')
    expect(document.querySelector('.wbx-service-hero__summary')?.textContent).toBe(
      'WorkBuddy 是运行在电脑上的智能体工作台。你只需提出任务，它会规划、拆解并执行，交付可直接使用的文件与结果。',
    )
  })

  it('uses a compact soft track with a raised white selected tab instead of a filled brand tab', () => {
    const styles = readFileSync('docs/.vitepress/theme/tools.css', 'utf8')

    expect(styles).toMatch(/\.wbx-tools__tabs\s*{[^}]*display:\s*flex[^}]*width:\s*min\(760px, calc\(100% - 32px\)\)[^}]*gap:\s*6px[^}]*margin:\s*0 auto[^}]*padding:\s*6px[^}]*border-radius:\s*var\(--wbx-radius-lg\)[^}]*background:\s*var\(--wbx-section-soft\)/s)
    expect(styles).toMatch(/\.wbx-tools__tabs button\s*{[^}]*min-height:\s*44px[^}]*border:\s*1px solid transparent[^}]*border-radius:\s*var\(--wbx-radius-md\)/s)
    expect(styles).toMatch(/\.wbx-tools__tabs button\[aria-selected="true"\]\s*{[^}]*border-color:\s*var\(--wbx-line\)[^}]*background:\s*var\(--wbx-surface\)[^}]*box-shadow:\s*var\(--wbx-shadow-soft\)/s)
    expect(styles).not.toMatch(/\.wbx-tools__tabs button\[aria-selected="true"\]\s*{[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(styles).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*?\.wbx-tools__tabs\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s)
  })

  it('places product copy and the live demonstration side by side on desktop and stacks them on tablets', () => {
    const styles = readFileSync('docs/.vitepress/theme/tools.css', 'utf8')

    expect(styles).toMatch(/\.wbx-tools__panel \.wbx-service-hero\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0, \.82fr\) minmax\(540px, 1\.18fr\)[^}]*align-items:\s*center[^}]*gap:\s*48px[^}]*padding:\s*40px 32px 48px/s)
    expect(styles).toMatch(/\.wbx-tools__panel \.wbx-service-hero__copy\s*{[^}]*max-width:\s*440px[^}]*margin:\s*0[^}]*text-align:\s*left/s)
    expect(styles).toMatch(/\.wbx-tools__panel \.wbx-service-console\s*{[^}]*width:\s*100%[^}]*max-width:\s*none[^}]*margin:\s*0/s)
    expect(styles).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-tools__panel \.wbx-service-hero\s*{[^}]*grid-template-columns:\s*1fr[^}]*gap:\s*40px[^}]*padding:\s*40px 32px 48px/s)
  })

  it('widens the product canvas and tightens the spacing between its sections', () => {
    const styles = readFileSync('docs/.vitepress/theme/tools.css', 'utf8')

    expect(styles).toMatch(/\.wbx-tools__panel \.wbx-service\s*{[^}]*max-width:\s*var\(--wbx-content-wide\)/s)
    expect(styles).toMatch(/\.wbx-tools__panel \.wbx-service-section\s*{[^}]*padding:\s*48px 32px/s)
    expect(styles).toMatch(/\.wbx-tools__panel \.wbx-service-download\s*{[^}]*padding:\s*64px 32px/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-tools__panel \.wbx-service-hero\s*{[^}]*padding:\s*32px 20px 36px[^}]*}[\s\S]*?\.wbx-tools__panel \.wbx-service-section\s*{[^}]*padding:\s*36px 20px[^}]*}[\s\S]*?\.wbx-tools__panel \.wbx-service-download\s*{[^}]*padding:\s*48px 20px/s)
  })

  it('shows WorkBuddy by default and exposes three accessible product tabs', () => {
    mountToolsPage()

    expect(tabs().map((tab) => tab.textContent?.trim())).toEqual(['WorkBuddy', 'SparkX', 'SunFun'])
    expect(tabs().map((tab) => [tab.getAttribute('aria-selected'), tab.tabIndex])).toEqual([
      ['true', 0],
      ['false', -1],
      ['false', -1],
    ])
    expect(document.querySelector('.wbx-service')).not.toBeNull()
  })

  it('uses a compact, quiet placeholder for unreleased products', () => {
    const styles = readFileSync('docs/.vitepress/theme/tools.css', 'utf8')

    expect(styles).toMatch(/\.wbx-tools__placeholder\s*{[^}]*min-height:\s*240px[^}]*border-radius:\s*var\(--wbx-radius-xl\)[^}]*background:\s*var\(--wbx-section-soft\)[^}]*box-shadow:\s*none/s)
    expect(styles).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*?\.wbx-tools__placeholder\s*{[^}]*min-height:\s*200px/s)
  })

  it('restores a shared product selection and keeps placeholders factual', async () => {
    window.history.replaceState({}, '', '/tools/?product=sparkx')
    mountToolsPage()
    await nextTick()

    expect(tabs()[1]?.getAttribute('aria-selected')).toBe('true')
    expect(document.querySelector('.wbx-service')).toBeNull()
    expect(document.querySelector('[role="tabpanel"]')?.textContent).toContain('SparkX')
    expect(document.querySelector('[role="tabpanel"]')?.textContent).toContain('产品介绍筹备中')
    expect(document.querySelector('[role="tabpanel"] a')).toBeNull()
  })

  it('updates the URL and unmounts the WorkBuddy demonstration when switching', async () => {
    mountToolsPage()
    tabs()[2]?.click()
    await nextTick()

    expect(window.location.search).toBe('?product=sunfun')
    expect(document.querySelector('.wbx-service')).toBeNull()
    expect(document.querySelector('[role="tabpanel"]')?.textContent).toContain('SunFun')

    tabs()[0]?.click()
    await nextTick()
    expect(window.location.search).toBe('?product=workbuddy')
    expect(document.querySelector('.wbx-service')).not.toBeNull()
  })

  it('supports arrow, Home, and End keys and browser history', async () => {
    mountToolsPage()
    tabs()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await nextTick()
    expect(tabs()[2]?.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(tabs()[2])

    tabs()[2]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    await nextTick()
    expect(tabs()[0]?.getAttribute('aria-selected')).toBe('true')

    tabs()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    await nextTick()
    expect(tabs()[2]?.getAttribute('aria-selected')).toBe('true')

    window.history.replaceState({}, '', '/tools/?product=sparkx')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await nextTick()
    expect(tabs()[1]?.getAttribute('aria-selected')).toBe('true')
  })

  it('falls back to WorkBuddy for invalid product parameters', () => {
    window.history.replaceState({}, '', '/tools/?product=unknown')
    mountToolsPage()

    expect(tabs()[0]?.getAttribute('aria-selected')).toBe('true')
    expect(document.querySelector('.wbx-service')).not.toBeNull()
  })
})
