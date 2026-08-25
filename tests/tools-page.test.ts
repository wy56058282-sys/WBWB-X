import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

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
