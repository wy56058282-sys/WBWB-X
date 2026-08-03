import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

const desktopCompactRule =
  /@media\s*\(min-width:\s*960px\)\s*{[^{}]*?\.VPSidebarItem \.link\s*{[^{}]*?margin:\s*0;[^{}]*?padding:\s*2px 6px;[^{}]*?}[^{}]*?}/
const mobileBaseRule =
  /\.VPSidebarItem \.link\s*{[^{}]*?margin:\s*2px 0;[^{}]*?padding:\s*7px 10px;/

describe('responsive sidebar density', () => {
  it('uses compact spacing only at the desktop breakpoint', () => {
    expect(css).toMatch(
      /\.VPSidebarItem \.link\s*{[^}]*border-radius:\s*6px/,
    )
    expect(css).toMatch(desktopCompactRule)
  })

  it('retains the larger base spacing used by mobile navigation', () => {
    expect(css).toMatch(
      /\.VPSidebarItem \.link\s*{[^}]*border-radius:\s*6px/,
    )
    expect(css).toMatch(mobileBaseRule)
  })

  it('rejects spacing declarations that belong to another rule', () => {
    const decoyCss = `
      @media (min-width: 960px) {
        .VPSidebarItem .link { color: red; }
        .unrelated { margin: 0; padding: 2px 6px; }
      }
      .VPSidebarItem .link { color: red; }
      .unrelated { margin: 2px 0; padding: 7px 10px; }
    `

    expect(decoyCss).not.toMatch(desktopCompactRule)
    expect(decoyCss).not.toMatch(mobileBaseRule)
  })
})
