// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import config from '../docs/.vitepress/config.mts'
import { nav } from '../docs/.vitepress/navigation'
import {
  isCaseContributionRoute,
  isCaseDetailRoute,
  isCaseIndexRoute,
  isHomeRoute,
} from '../docs/.vitepress/route-state'
import { sidebar } from '../docs/.vitepress/sidebar'

describe('site navigation', () => {
  it('keeps the source top-level information architecture', () => {
    expect(nav.map((item) => item.text)).toEqual([
      '首页',
      '开始阅读',
      '案例集',
      '工具集',
      '企业服务',
      '交流群',
    ])
    expect(nav.find((item) => item.text === '工具集')?.link).toBe('/tools/')
    expect(nav.find((item) => item.text === '企业服务')?.link).toBe('/services/')
    expect(nav.some((item) => item.link === '/help/' || item.link === '/about/')).toBe(false)
  })

  it('documents the tools and enterprise-services entries', () => {
    const inventory = readFileSync('CONTENT_INVENTORY.md', 'utf8')

    expect(inventory).toContain('| 工具集 | `/tools/` | 展示 WorkBuddy、SparkX 与 SunFun 产品矩阵 |')
    expect(inventory).toContain('| 企业服务 | `/services/` | 展示服务概览、FDE 团队与联系入口 |')
    expect(inventory).not.toContain('| 产品能力与服务 | `/help/`')
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
    expect(sidebar.slice(0, 2)).toEqual([
      { text: '小白书总览', link: '/wb-x/' },
      { text: '阅读指南', link: '/wb-x/reading-guide/' },
    ])
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

  it('uses a Chinese label for the document outline', () => {
    expect(config.themeConfig?.outlineTitle).toBe('本页目录')
  })

  it('recognizes the homepage at root and under the GitHub Pages base path', () => {
    expect(isHomeRoute('/', '/')).toBe(true)
    expect(isHomeRoute('/WBWB-X/', '/WBWB-X/')).toBe(true)
    expect(isHomeRoute('/WBWB-X/wb-x/', '/WBWB-X/')).toBe(false)
  })

  it('only treats the exact case index as the sidebar-free gallery route', () => {
    expect(isCaseIndexRoute('/cases/', '/')).toBe(true)
    expect(isCaseIndexRoute('/WBWB-X/cases/', '/WBWB-X/')).toBe(true)
    expect(isCaseIndexRoute('/cases/submissions/excel-store-analysis/', '/')).toBe(false)
    expect(isCaseIndexRoute('/community/case-contributing/', '/')).toBe(false)
  })

  it('recognizes case detail routes without matching the gallery or contribution guide', () => {
    expect(isCaseDetailRoute('/cases/submissions/daily-ai-news/', '/')).toBe(true)
    expect(
      isCaseDetailRoute(
        '/WBWB-X/cases/submissions/daily-ai-news/',
        '/WBWB-X/',
      ),
    ).toBe(true)
    expect(isCaseDetailRoute('/cases/', '/')).toBe(false)
    expect(isCaseDetailRoute('/community/case-contributing/', '/')).toBe(false)
  })

  it('recognizes the case contribution guide at root and under the configured base', () => {
    expect(isCaseContributionRoute('/community/case-contributing/', '/')).toBe(true)
    expect(
      isCaseContributionRoute(
        '/WBWB-X/community/case-contributing/',
        '/WBWB-X/',
      ),
    ).toBe(true)
    expect(isCaseContributionRoute('/community/contributing/', '/')).toBe(false)
    expect(isCaseContributionRoute('/cases/submissions/daily-ai-news/', '/')).toBe(false)
  })
})
