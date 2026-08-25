import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const customCss = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

describe('shared desktop navigation geometry', () => {
  it('removes the horizontal and vertical navigation dividers', () => {
    expect(customCss).toMatch(
      /\.VPNav,\s*\.VPNavBar\s*\{[^}]*border-bottom:\s*0\s*!important;/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar \.divider,\s*\.VPNavBar \.divider-line\s*\{[^}]*background:\s*transparent\s*!important;/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar :is\(\.translations, \.appearance, \.social-links\)::before\s*\{[^}]*display:\s*none;/s,
    )
  })

  it('shows the SparkX label when its navigation icon is hovered or focused', () => {
    expect(customCss).toMatch(
      /\.VPNavBarSocialLinks \.VPSocialLink\[aria-label='星火集'\]::after\s*\{[^}]*content:\s*attr\(aria-label\);[^}]*opacity:\s*0;/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBarSocialLinks \.VPSocialLink\[aria-label='星火集'\]:is\(:hover, :focus-visible\)::after\s*\{[^}]*opacity:\s*1;/s,
    )
  })

  it('uses one continuous frosted navbar without a title seam', () => {
    expect(customCss).toMatch(
      /@media \(min-width:\s*960px\)[\s\S]*?\.VPNavBar\s*\{[^}]*background:\s*color-mix\([^}]*-webkit-backdrop-filter:\s*blur\(16px\)[^}]*backdrop-filter:\s*blur\(16px\)/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar > \.wrapper > \.container > \.title\s*\{[^}]*background:\s*transparent/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar > \.wrapper > \.container \.content-body\s*\{[^}]*background:\s*transparent\s*!important/s,
    )
  })

  it('aligns the desktop navigation with the shared 1400px marketing-page baseline', () => {
    expect(customCss).toMatch(
      /@media \(min-width:\s*960px\)[\s\S]*?\.VPNavBar > \.wrapper > \.container\s*\{[^}]*max-width:\s*var\(--wbx-content-wide\)/s,
    )
  })

  it('normalizes the has-sidebar wrapper, container, title and content to the shared nav grid', () => {
    expect(customCss).toMatch(
      /@media \(min-width:\s*960px\)[\s\S]*?\.VPNavBar\.has-sidebar \.wrapper\s*\{[^}]*padding:\s*0 32px/s,
    )
    expect(customCss).toMatch(
      /\.VPNavBar\.has-sidebar \.container\s*\{[^}]*max-width:\s*var\(--wbx-content-wide\)/s,
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
