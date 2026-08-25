// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  resolve('docs/.vitepress/theme/reading.css'),
  'utf8',
)

describe('WB-X reading surfaces', () => {
  it.each([
    '.vp-doc div[class*="language-"]',
    '.vp-doc .custom-block',
    '.vp-doc table',
    '.vp-doc .language-mermaid',
    '.vp-doc .mermaid',
  ])('gives %s one shared surface treatment', (selector) => {
    expect(css).toContain(selector)
  })

  it('uses one-pixel borders and the reading radius', () => {
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc div\[class\*="language-"\][\s\S]*?border:\s*1px solid var\(--wbx-line\)/,
    )
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc div\[class\*="language-"\][\s\S]*?border-radius:\s*var\(--wbx-reading-radius\)/,
    )
  })

  it('uses neutral table row hover rather than the brand color', () => {
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc tbody tr:hover[\s\S]*?background:\s*var\(--wbx-hover-surface\)/,
    )
  })

  it('removes nested Mermaid borders', () => {
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc \.language-mermaid pre,[\s\S]*?border:\s*0/,
    )
  })

  it('uses consistent internal spacing for tables, code blocks, and callouts', () => {
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc :is\(th, td\)\s*{[^}]*padding:\s*12px 16px/s,
    )
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc \.custom-block\s*{[^}]*padding:\s*20px 22px/s,
    )
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc div\[class\*="language-"\]\s*{[^}]*margin:\s*24px 0/s,
    )
  })
})
