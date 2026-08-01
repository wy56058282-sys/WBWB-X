import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

describe('responsive sidebar density', () => {
  it('uses compact spacing only at the desktop breakpoint', () => {
    expect(css).toMatch(
      /@media\s*\(min-width:\s*960px\)\s*{[\s\S]*?\.VPSidebarItem \.link\s*{[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*2px 6px;[\s\S]*?}\s*}/,
    )
  })

  it('retains the larger base spacing used by mobile navigation', () => {
    expect(css).toMatch(
      /\.VPSidebarItem \.link\s*{[\s\S]*?margin:\s*2px 0;[\s\S]*?padding:\s*7px 10px;/,
    )
  })
})
