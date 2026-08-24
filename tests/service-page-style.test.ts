import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

describe('WorkBuddy product service styles', () => {
  it('uses the site design tokens instead of the standalone reference palette', () => {
    expect(styles).toContain('var(--wbx-accent)')
    expect(styles).toContain('var(--wbx-paper)')
    expect(styles).toContain('var(--wbx-surface)')
    expect(styles).toContain('var(--wbx-pixel)')
    expect(styles).not.toContain('#c8f542')
    expect(styles).not.toContain('#0a0b09')
  })

  it('keeps the site shell and gives the product page a wide bounded canvas', () => {
    expect(styles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1480px/s)
    expect(styles).toMatch(/\.wbx-service\s*\{[^}]*max-width:\s*1200px[^}]*overflow-x:\s*clip/s)
    expect(styles).not.toMatch(/\.custom-service-page \.VPNav\s*\{[^}]*display:\s*none/s)
    expect(styles).not.toMatch(/\.custom-service-page \.VPFooter\s*\{[^}]*display:\s*none/s)
  })

  it('adapts the main diagrams and capability rows across tablet and mobile widths', () => {
    expect(styles).toMatch(/\.wbx-service-compare\s*\{[^}]*grid-template-columns:\s*1fr 56px 1fr/s)
    expect(styles).toMatch(/\.wbx-service-capability\s*\{[^}]*grid-template-columns:[^}]*minmax\(0, 1fr\)[^}]*minmax\(0, 1fr\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-compare[^{]*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-hero__actions[^{]*\{[^}]*align-items:\s*stretch/s)
  })

  it('provides keyboard focus and reduced-motion behavior', () => {
    expect(styles).toMatch(/\.wbx-service[^{}]*:focus-visible\s*\{[^}]*outline:\s*var\(--wbx-focus\)/s)
    expect(styles).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation-duration:\s*0\.01ms\s*!important/s)
  })

  it('contains no retired workshop, diagnosis, or team styling', () => {
    expect(styles).not.toContain('.wbx-service-edition')
    expect(styles).not.toContain('.wbx-service-registration')
    expect(styles).not.toContain('.wbx-service-path')
    expect(styles).not.toContain('.wbx-service-enterprise')
    expect(styles).not.toContain('.wbx-service-guests')
  })
})
