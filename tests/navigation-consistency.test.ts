import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const customCss = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

describe('shared desktop navigation geometry', () => {
  it('uses one frosted title surface for sidebar and non-sidebar pages', () => {
    expect(customCss).toMatch(
      /@media \(min-width:\s*960px\)[\s\S]*?\.VPNavBar > \.wrapper > \.container > \.title\s*\{[^}]*background:\s*color-mix\([^}]*-webkit-backdrop-filter:\s*blur\(16px\)[^}]*backdrop-filter:\s*blur\(16px\)/s,
    )
  })

  it('normalizes the has-sidebar wrapper, container, title and content to the shared nav grid', () => {
    expect(customCss).toMatch(
      /@media \(min-width:\s*960px\)[\s\S]*?\.VPNavBar\.has-sidebar \.wrapper\s*\{[^}]*padding:\s*0 32px/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar\.has-sidebar \.container\s*\{[^}]*max-width:\s*calc\(var\(--vp-layout-max-width\) - 64px\)/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar\.has-sidebar \.container > \.title\s*\{[^}]*position:\s*static[^}]*padding:\s*0[^}]*width:\s*auto/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar\.has-sidebar \.content\s*\{[^}]*padding-right:\s*0[^}]*padding-left:\s*0/s,
    )
  })

  it('keeps the compact mobile navbar opaque and unblurred', () => {
    expect(customCss).toMatch(
      /@media \(max-width:\s*760px\)[\s\S]*?\.VPNavBar\s*\{[^}]*background:\s*var\(--wbx-paper\) !important[^}]*backdrop-filter:\s*none/s,
    )
  })
})
