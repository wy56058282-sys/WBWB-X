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
})
