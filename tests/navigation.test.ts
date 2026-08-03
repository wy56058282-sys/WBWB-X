// @vitest-environment node

import { describe, expect, it } from 'vitest'
import config from '../docs/.vitepress/config.mts'
import { nav } from '../docs/.vitepress/navigation'
import { isHomeRoute } from '../docs/.vitepress/route-state'
import { sidebar } from '../docs/.vitepress/sidebar'

describe('site navigation', () => {
  it('keeps the source top-level information architecture', () => {
    expect(nav.map((item) => item.text)).toEqual([
      '首页',
      '开始阅读',
      '案例集',
      '提需求',
      '指南',
      '交流群',
    ])
  })

  it('contains all 27 numbered chapters and both appendices', () => {
    const serialized = JSON.stringify(sidebar)
    for (let chapter = 1; chapter <= 27; chapter += 1) {
      expect(serialized).toContain(`第 ${chapter} 章`)
    }
    expect(serialized).toContain('附录 A')
    expect(serialized).toContain('附录 B')
  })

  it('uses the approved content brand in the sidebar overview', () => {
    expect(sidebar[0]).toEqual({ text: '小白书总览', link: '/wb-x/' })
  })

  it('uses /wb-x/ for every small-book sidebar route', () => {
    const serialized = JSON.stringify(sidebar)
    expect(serialized).toContain('/wb-x/')
    expect(serialized).not.toContain('/bluebook/')
  })

  it('enables dedicated sidebars for the small book, cases, and case contribution page', () => {
    const configuredSidebars = config.themeConfig?.sidebar as Record<string, unknown>

    expect(configuredSidebars['/wb-x/']).toEqual(sidebar)
    expect(configuredSidebars['/cases/']).toEqual(expect.any(Array))
    expect(configuredSidebars['/community/case-contributing']).toBe(configuredSidebars['/cases/'])
  })

  it('uses the approved SEO title for the browser title', () => {
    expect(config.title).toBe('WorkBuddy 教程与使用指南｜WorkBuddy WB-X 实战小白书')
  })

  it('keeps Git-derived update times without exposing page edit links', () => {
    expect(config.lastUpdated).toBe(true)
    expect(config.themeConfig?.editLink).toBeUndefined()
  })

  it('recognizes the homepage at root and under the GitHub Pages base path', () => {
    expect(isHomeRoute('/', '/')).toBe(true)
    expect(isHomeRoute('/WBWB-X/', '/WBWB-X/')).toBe(true)
    expect(isHomeRoute('/WBWB-X/wb-x/', '/WBWB-X/')).toBe(false)
  })
})
