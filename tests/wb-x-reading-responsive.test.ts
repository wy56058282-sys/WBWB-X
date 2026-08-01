// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve('docs/.vitepress/theme/reading.css'), 'utf8')

describe('WB-X responsive reading behavior', () => {
  it('uses neutral eight-pixel pager cards', () => {
    expect(css).toMatch(
      /\.wbx-reading-layout \.VPDocFooter \.pager-link[\s\S]*?border-radius:\s*var\(--wbx-reading-radius\)/,
    )
    expect(css).toMatch(
      /\.wbx-reading-layout \.VPDocFooter \.pager-link:hover[\s\S]*?background:\s*var\(--wbx-hover-surface\)/,
    )
  })

  it('provides mobile and reduced-motion fallbacks', () => {
    expect(css).toContain('@media (max-width: 640px)')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toMatch(/min-height:\s*44px/)
  })
})
