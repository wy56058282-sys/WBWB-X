import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('custom service page styles', () => {
  it('keeps the shared visual contract for content, actions, and checklist icons', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    const source = readFileSync('docs/.vitepress/theme/ServicePage.vue', 'utf8')
    const iconfont = readFileSync('node_modules/@hackernoon/pixel-icon-library/fonts/iconfont.css', 'utf8')

    expect(styles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1104px/s)
    expect(styles).not.toMatch(/\.custom-service-page \.VP(?:Content|Doc)[^{]*\{[^}]*padding(?:-inline|-left|-right):/s)
    expect(styles).toMatch(/\.wbx-service h1,\s*\.wbx-service h2,\s*\.wbx-service h3\s*\{[^}]*letter-spacing:\s*0/s)
    expect(styles).toMatch(/\.wbx-service h1\s*\{[^}]*font-weight:\s*850[^}]*line-height:\s*58\.88px/s)
    expect(styles).toMatch(/\.wbx-service \.wbx-service-action\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(styles).toMatch(/\.wbx-service \.wbx-service-action--primary\s*\{[^}]*background:\s*var\(--wbx-accent\)/)
    expect(styles).toMatch(/\.wbx-service \.wbx-service-action:hover,\s*\.wbx-service \.wbx-service-action:focus-visible\s*\{[^}]*color:\s*#0d100d[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(styles).toMatch(/\.wbx-service-action:focus-visible,\s*\.wbx-service-case:focus-visible,\s*\.wbx-service-survey__media:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--wbx-accent\)/s)
    expect(styles).toMatch(/\.wbx-service-related__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/)
    expect(styles).toMatch(/@media \(max-width:\s*1200px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-service-related__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(styles).not.toMatch(/@media \(max-width:\s*900px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-service-related__grid\s*\{/)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-service-related__grid\s*\{[^}]*grid-template-columns:\s*1fr/)
    const checklistIcon = source.match(/<i\s+class="hn (hn-[^\s"]+) wbx-service-checklist__icon"\s+aria-hidden="true"\s*\/>/)?.[1]
    expect(checklistIcon).toBe('hn-check-box-solid')
    expect(iconfont).toMatch(new RegExp(`\\.${checklistIcon}:before\\s*\\{[^}]*content:\\s*"\\\\[0-9a-f]+"`, 'i'))
  })

  it('uses guide-like service rhythm without native checklist markers or repeated section dividers', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/\.wbx-service h2\s*\{[^}]*font-weight:\s*600/s)
    expect(styles).toMatch(/\.wbx-service-section\s*\{[^}]*padding:\s*48px 0/s)
    expect(styles).not.toMatch(/\.wbx-service-section\s*\{[^}]*border-bottom:/s)
    expect(styles).toMatch(/\.wbx-service-checklist\s*\{[^}]*list-style:\s*none/s)
    expect(styles).toMatch(/\.wbx-service-checklist li::marker\s*\{[^}]*content:\s*""/s)
    expect(styles).not.toMatch(/\.wbx-service-exclusions\s*\{[^}]*border-(?:top|bottom):/s)
    expect(styles).toMatch(/\.wbx-service-offer__facts > div\s*\{[^}]*border-bottom:\s*1px solid var\(--wbx-line\)/s)
    expect(styles).toMatch(/\.wbx-service-checklist li\s*\{[^}]*border-top:\s*1px solid var\(--wbx-line\)/s)
    expect(styles).toMatch(/\.wbx-service-output-list > div\s*\{[^}]*border-top:\s*1px solid var\(--wbx-line\)/s)
    expect(styles).toMatch(/\.wbx-service-process li\s*\{[^}]*border-top:\s*2px solid var\(--wbx-ink\)/s)
    expect(styles).toMatch(/\.wbx-service-rules dl > div\s*\{[^}]*border-bottom:\s*1px solid var\(--wbx-line\)/s)
  })
})
