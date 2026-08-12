// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const layoutSource = readFileSync(
  resolve('docs/.vitepress/theme/Layout.vue'),
  'utf8',
)
const customCss = readFileSync(
  resolve('docs/.vitepress/theme/custom.css'),
  'utf8',
)

describe('case detail layout', () => {
  it('adds a base-aware back link before case detail documents', () => {
    expect(layoutSource).toContain("'wbx-case-detail-layout': isCaseDetail")
    expect(layoutSource).toContain('<template #doc-before>')
    expect(layoutSource).toContain('v-if="isCaseDetail"')
    expect(layoutSource).toContain(':href="withBase(\'/cases/\')"')
    expect(layoutSource).toContain('返回案例集')
    expect(layoutSource).toContain('hn-arrow-left-solid')
  })

  it('removes only the case detail sidebar slot and restores document width', () => {
    expect(customCss).toMatch(
      /\.wbx-case-detail-layout \.VPSidebar\s*\{[^}]*display:\s*none;/s,
    )
    expect(customCss).toMatch(
      /\.wbx-case-detail-layout \.VPContent\.has-sidebar\s*\{[^}]*padding-left:\s*0;/s,
    )
    expect(customCss).toMatch(
      /\.wbx-case-detail-layout \.VPDoc\.has-sidebar\s*\{[^}]*padding-left:\s*0;/s,
    )
  })

  it('styles the doc-before back link at its real content-container level', () => {
    expect(customCss).toMatch(
      /\.wbx-case-detail-layout \.wbx-case-detail-back\s*\{[^}]*display:\s*inline-flex[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s,
    )
    expect(customCss).not.toMatch(/\.vp-doc \.wbx-case-detail-back\s*\{/)
  })
})
