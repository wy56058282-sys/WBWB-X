import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('custom service page styles', () => {
  it('keeps the shared visual contract for content, actions, and checklist icons', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    const source = readFileSync('docs/.vitepress/theme/ServicePage.vue', 'utf8')

    expect(styles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1280px/s)
    expect(styles).toMatch(/\.wbx-service h1\s*\{[^}]*font-weight:\s*850/s)
    expect(styles).toMatch(/\.wbx-service-action\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(source).toContain('class="hn hn-check-square-solid wbx-service-checklist__icon"')
    expect(source).toContain('aria-hidden="true"')
  })
})
