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
    expect(styles).toMatch(/\.wbx-service-action:focus-visible,\s*\.wbx-service-case:focus-visible,\s*\.wbx-service-business-wechat span:focus-visible,\s*\.wbx-service button:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--wbx-accent\)/s)
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
    expect(styles).not.toMatch(/\.wbx-service-offer\s*\{[^}]*border-bottom:/s)
    expect(styles).toMatch(/\.wbx-service-offer__facts\s*\{[^}]*transform:\s*translateY\(50px\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-offer__facts\s*\{[^}]*transform:\s*none/s)
    expect(styles).toMatch(/\.wbx-service-checklist\s*\{[^}]*list-style:\s*none/s)
    expect(styles).toMatch(/\.wbx-service-checklist li::marker\s*\{[^}]*content:\s*""/s)
    expect(styles).not.toMatch(/\.wbx-service-exclusions\s*\{[^}]*border-(?:top|bottom):/s)
    expect(styles).toMatch(/\.wbx-service-offer__facts > div\s*\{[^}]*border-bottom:\s*1px solid var\(--wbx-line\)/s)
    expect(styles).toMatch(/\.wbx-service-checklist li\s*\{[^}]*border-top:\s*1px solid var\(--wbx-line\)/s)
    expect(styles).toMatch(/\.wbx-service-output-list > div\s*\{[^}]*border-top:\s*1px solid var\(--wbx-line\)/s)
    expect(styles).toMatch(/\.wbx-service \.wbx-service-process li\s*\{[^}]*border-top:\s*0/s)
    expect(styles).toMatch(/\.wbx-service \.wbx-service-process li\s*\{[^}]*margin:\s*0/s)
    expect(styles).toMatch(/\.wbx-service-rules dl > div\s*\{[^}]*border-bottom:\s*1px solid var\(--wbx-line\)/s)
  })

  it('styles the service ladder and enterprise channel as distinct, unframed conversion surfaces', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/\.wbx-service-ladder__list\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/\.wbx-service-ladder__list\s*>\s*li\s*\{[^}]*border-top:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0[^}]*background:\s*transparent/s)
    expect(styles).toMatch(/\.wbx-service-enterprise\s*\{[^}]*background:\s*var\(--wbx-hover-surface\)/s)
    expect(styles).toMatch(/\.wbx-service-enterprise__channel\s*\{[^}]*border-left:\s*6px solid var\(--wbx-accent\)/s)
    expect(styles).not.toMatch(/\.wbx-service-ladder__list\s*>\s*li\s*\{[^}]*border-radius:\s*[1-9]/s)
  })

  it('keeps controls square, high-contrast, and unmistakably unavailable when disabled', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/\.wbx-service button\s*\{[^}]*min-height:\s*44px[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(styles).toMatch(/\.wbx-service button:disabled\s*\{[^}]*color:\s*var\(--wbx-ink\)[^}]*background:\s*var\(--wbx-hover-surface\)[^}]*opacity:\s*1[^}]*cursor:\s*not-allowed/s)
    expect(styles).toMatch(/\.wbx-service-action:focus-visible,[\s\S]*?\.wbx-service button:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--wbx-accent\)[^}]*outline-offset:\s*3px/s)
  })

  it('defines the 3/2/1 service ladder and related-case grids without mobile overflow escapes', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-ladder__list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-ladder__list\s*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service button,[\s\S]*?\.wbx-service-application-link\s*\{[^}]*width:\s*100%/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-offer,[\s\S]*?\.wbx-service-section\s*\{[^}]*min-width:\s*0/s)
  })
})
