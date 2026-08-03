// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isReadingRoute } from '../docs/.vitepress/route-state'

const layoutSource = readFileSync(
  resolve('docs/.vitepress/theme/Layout.vue'),
  'utf8',
)
const themeSource = readFileSync(
  resolve('docs/.vitepress/theme/index.ts'),
  'utf8',
)
const readingCss = readFileSync(
  resolve('docs/.vitepress/theme/reading.css'),
  'utf8',
)

describe('WB-X reading visual scope', () => {
  it('recognizes reading routes at root and GitHub Pages base paths', () => {
    expect(isReadingRoute('/wb-x/', '/')).toBe(true)
    expect(isReadingRoute('/wb-x/chapter/', '/')).toBe(true)
    expect(isReadingRoute('/WBWB-X/wb-x/', '/WBWB-X/')).toBe(true)
    expect(isReadingRoute('/WBWB-X/wb-x/chapter/', '/WBWB-X/')).toBe(true)
  })

  it('does not classify non-reading routes as WB-X reading pages', () => {
    for (const path of [
      '/',
      '/cases/',
      '/help/',
      '/reading-guide/',
      '/community/',
    ]) {
      expect(isReadingRoute(path, '/')).toBe(false)
    }
  })

  it('adds a route-scoped layout class and imports its stylesheet', () => {
    expect(layoutSource).toContain("'wbx-reading-layout': isReading")
    expect(themeSource).toContain("import './reading.css'")
  })

  it('scopes neutral sidebar interactions to reading pages', () => {
    expect(readingCss).toMatch(
      /\.wbx-reading-layout \.VPSidebarItem \.link:hover\s*{[^}]*background:\s*var\(--wbx-sidebar-hover-surface\)/,
    )
    expect(readingCss).toMatch(
      /\.wbx-reading-layout \.VPSidebarItem \.link:focus-visible\s*{[^}]*background:\s*var\(--wbx-sidebar-hover-surface\)/,
    )
    expect(readingCss).toMatch(
      /\.wbx-reading-layout \.VPSidebarItem\.is-active[\s\S]*?background:\s*var\(--wbx-accent\)/,
    )
    expect(readingCss).not.toMatch(
      /\.wbx-reading-layout \.VPSidebarItem \.link\s*{[^}]*min-height:/,
    )
    expect(readingCss).not.toMatch(
      /\.wbx-reading-layout \.VPSidebarItem \.link\s*{[^}]*padding:/,
    )
    expect(readingCss).not.toMatch(
      /\.wbx-reading-layout \.VPSidebarItem \.link\s*{[^}]*border-radius:/,
    )
  })
})
