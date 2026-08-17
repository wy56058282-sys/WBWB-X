// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { nav } from '../docs/.vitepress/navigation'
import { sidebar } from '../docs/.vitepress/sidebar'

const homeSource = readFileSync(
  'docs/.vitepress/theme/HomePage.vue',
  'utf8',
)

describe('published live-site alignment contract', () => {
  it('uses the published top-level navigation', () => {
    expect(nav.map((item) => item.text)).toEqual([
      '首页',
      '开始阅读',
      '案例集',
      '定制服务',
      '资料',
      '交流群',
    ])
    expect(nav.find((item) => item.text === '资料')?.link).toBe('/resources/')
  })

  it('keeps the published homepage labels, analytics strip, and download', () => {
    expect(homeSource).toContain("import HomeAnalyticsStrip from './HomeAnalyticsStrip.vue'")
    expect(homeSource).toContain('中国版 v5.3.13')
    expect(homeSource).toContain('国际版 v5.2.7')
    expect(homeSource).toContain('<HomeAnalyticsStrip')
    expect(homeSource).toContain('https://pan.quark.cn/s/4b2488289c79')
  })

  it('exposes the published canonical resource and reading-guide routes', () => {
    expect(existsSync('docs/resources/index.md')).toBe(true)
    expect(existsSync('docs/wb-x/reading-guide/index.md')).toBe(true)
    expect(sidebar.slice(0, 2)).toEqual([
      { text: '小白书总览', link: '/wb-x/' },
      { text: '阅读指南', link: '/wb-x/reading-guide/' },
    ])
  })
})
