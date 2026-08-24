import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'

const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

describe('WorkBuddy product service styles', () => {
  it('keeps the site design tokens for the shell', () => {
    expect(styles).toContain('var(--wbx-accent)')
    expect(styles).toContain('var(--wbx-paper)')
    expect(styles).toContain('var(--wbx-surface)')
    expect(styles).toContain('var(--wbx-pixel)')
  })

  it('keeps the original visuals and changes only their main accent', () => {
    expect(styles).toMatch(/\.wbx-service\s*\{[^}]*--wb-ref-bg:\s*var\(--wbx-paper\);[^}]*--wb-ref-panel:\s*var\(--wbx-surface\);[^}]*--wb-ref-acc:\s*var\(--wbx-accent\);/s)
    expect(styles).toMatch(/\.dark \.wbx-service\s*\{[^}]*--wb-ref-bg:\s*var\(--wbx-paper\);[^}]*--wb-ref-panel:\s*var\(--wbx-surface\);[^}]*--wb-ref-ink:\s*var\(--wbx-ink\);/s)
    expect(styles).not.toContain('#c8f542')
    expect(styles).not.toContain('/* Reference visuals keep the source landing page')
    expect(styles).not.toContain('.wbx-service .console-window')
    expect(styles).not.toContain('.wbx-service .net-box')
    expect(styles).not.toContain('.wbx-service .remote-stage')
    expect(styles).toMatch(/\.wbx-service-console\s*\{[^}]*box-shadow:\s*8px 8px 0 var\(--wbx-accent\)/s)
    expect(styles).toMatch(/\.wbx-service-swarm__node\.is-core circle\s*\{[^}]*fill:\s*var\(--wbx-accent\)/s)
    expect(styles).toMatch(/\.wbx-service-remote\s*\{[^}]*grid-template-columns:\s*minmax\(220px, \.72fr\) 180px minmax\(300px, 1\.3fr\)/s)
  })

  it('keeps the site shell and gives the product page a wide bounded canvas', () => {
    expect(styles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1480px/s)
    expect(styles).toMatch(/\.wbx-service\s*\{[^}]*max-width:\s*1200px[^}]*overflow-x:\s*clip/s)
    expect(styles).not.toMatch(/\.custom-service-page \.VPNav\s*\{[^}]*display:\s*none/s)
    expect(styles).not.toMatch(/\.custom-service-page \.VPFooter\s*\{[^}]*display:\s*none/s)
  })

  it('lets the hero blend into the page and keeps section tags text-only', () => {
    const hero = baseRule(styles, '.wbx-service-hero')

    expect(hero).not.toMatch(/(?:^|\s)border:/)
    expect(hero).not.toMatch(/border-radius:/)
    expect(hero).not.toMatch(/(?:^|\s)background:/)
    expect(styles).not.toContain('.wbx-service-hero::before')
    expect(styles).not.toContain('.wbx-service-tag::before')
  })

  it('de-containerizes the final download call to action', () => {
    const download = baseRule(styles, '.wbx-service-download')

    expect(download).toMatch(/border:\s*0;/)
    expect(download).toMatch(/background:\s*transparent;/)
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
