import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readHomeStyle } from './helpers/read-theme-style'

const customCss = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
const homeCss = readHomeStyle()

describe('neutral hover color system', () => {
  it('defines dedicated light and dark neutral hover surfaces', () => {
    expect(customCss).toMatch(/:root\s*{[\s\S]*--wbx-hover-surface:\s*#eceee9;/)
    expect(customCss).toMatch(/\.dark\s*{[\s\S]*--wbx-hover-surface:\s*#252922;/)
  })

  it('defines dedicated light and dark green-tinted sidebar hover surfaces', () => {
    expect(customCss).toMatch(/:root\s*\{[^{}]*--wbx-sidebar-hover-surface:\s*#e4ece5;/)
    expect(customCss).toMatch(/\.dark\s*\{[^{}]*--wbx-sidebar-hover-surface:\s*#202a24;/)
  })

  it('uses the neutral surface for interactive hover backgrounds', () => {
    expect(customCss).toMatch(
      /\.wbx-book-index__entry > a:hover,[\s\S]*?background:\s*var\(--wbx-hover-surface\);/,
    )
    expect(customCss).toMatch(
      /\.VPSidebarItem \.link:hover,\s*\.VPSidebarItem \.link:focus-visible\s*\{[^{}]*background:\s*var\(--wbx-sidebar-hover-surface\);[^{}]*\}/,
    )
    expect(homeCss).toMatch(
      /\.wbx-task-grid a:hover,[\s\S]*?background:\s*var\(--wbx-hover-surface\);/,
    )
  })

  it('keeps selected and keyboard-focus states branded green', () => {
    expect(customCss).toMatch(
      /\.VPSidebarItem\.is-active > \.item \.link\s*{[\s\S]*?background:\s*var\(--wbx-accent\);/,
    )
    expect(customCss).toMatch(
      /\.VPSidebarItem \.link:focus-visible\s*{[\s\S]*?outline:\s*2px solid var\(--wbx-accent\);/,
    )
    expect(customCss).toMatch(
      /\.VPLocalSearchBox \.result\.selected\s*{[\s\S]*?background:\s*var\(--wbx-accent-soft\) !important;/,
    )
  })
})
