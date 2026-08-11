import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('custom service page styles', () => {
  it('keeps the shared visual contract for content, actions, and checklist icons', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    const source = readFileSync('docs/.vitepress/theme/ServicePage.vue', 'utf8')

    expect(styles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1280px/s)
    expect(styles).toMatch(/\.wbx-service h1,\s*\.wbx-service h2,\s*\.wbx-service h3\s*\{[^}]*letter-spacing:\s*0/s)
    expect(styles).toMatch(/\.wbx-service h1\s*\{[^}]*font-weight:\s*850[^}]*line-height:\s*1\.16/s)
    expect(styles).toMatch(/\.wbx-service-action\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(styles).toMatch(/\.wbx-service-action--primary\s*\{[^}]*background:\s*var\(--wbx-accent\)/)
    expect(styles).toMatch(/\.wbx-service-action:focus-visible,\s*\.wbx-service-case:focus-visible,\s*\.wbx-service-survey__media:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--wbx-accent\)/s)
    expect(styles).toMatch(/\.wbx-service-related__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/)
    expect(styles).toMatch(/@media \(max-width:\s*1200px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-service-related__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-service-related__grid\s*\{[^}]*grid-template-columns:\s*1fr/)
    expect(source).toMatch(/<i\s+class="hn hn-check-square-solid wbx-service-checklist__icon"\s+aria-hidden="true"\s*\/>/)
  })
})
