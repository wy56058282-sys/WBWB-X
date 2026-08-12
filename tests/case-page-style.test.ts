import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('case collection page styles', () => {
  it('uses a stable responsive card grid with constrained cards', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/)
    expect(source).toMatch(/@media \(max-width:\s*960px\)\s*\{\s*\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(source).toMatch(/@media \(max-width:\s*640px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
    expect(source).toMatch(/\.wbx-case-card__cover\s*\{[^}]*aspect-ratio:/)
    expect(source).toMatch(/\.wbx-cases-grid\s*>\s*\.wbx-case-card\s*\{[^}]*margin:\s*0/)
    expect(source).toMatch(/\.wbx-cases\s+\.wbx-cases-grid\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;[^}]*list-style:\s*none/)
    expect(source).toMatch(/\.wbx-case-card__title\s*\{[^}]*min-height:[^}]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-case-card__outcome\s*\{[^}]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPSidebar\s*\{[^}]*display:\s*none/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPLocalNav\s*\{[^}]*display:\s*none/)
    expect(source).not.toMatch(/\.wbx-cases-layout \.VPContent\.has-sidebar/)
    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.content\s*\{[^}]*max-width:\s*none;/s)
  })

  it('uses a guide-style contents rail and sizes cards for the available main column', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-shell\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(180px, 220px\)[^}]*gap:\s*48px/s)
    expect(source).toMatch(/\.wbx-cases-main\s*\{[^}]*min-width:\s*0/s)
    expect(source).toMatch(/\.wbx-cases-outline\s*\{[^}]*position:\s*sticky[^}]*top:\s*calc\(var\(--vp-nav-height\) \+ 32px\)/s)
    expect(source).toMatch(/@media \(max-width:\s*960px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-outline\s*\{[^}]*display:\s*none/s)
    expect(source).toMatch(/@media \(max-width:\s*960px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
    expect(source).toMatch(/@media \(max-width:\s*640px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*1fr/s)
  })

  it('registers the gallery and makes it the entire case-index body', () => {
    const themeSource = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const indexSource = readFileSync('docs/cases/index.md', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')
    const styles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(themeSource).toContain("import CasesPage from './CasesPage.vue'")
    expect(themeSource).toContain("app.component('CasesPage', CasesPage)")
    expect(indexSource).toContain('<CasesPage />')
    expect(indexSource).not.toContain('# WorkBuddy WB-X 案例集')
    expect(pageSource).toContain(
      '<span class="wbx-cases-brand">WorkBuddy WB-X</span> 案例集',
    )
    expect(styles).toMatch(
      /\.wbx-cases-brand\s*\{[^}]*font-weight:\s*850;/s,
    )
  })

  it('keeps the shared content width and square category controls', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')

    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.container\s*\{[^}]*max-width:\s*1104px/s)
    expect(source).not.toMatch(/\.wbx-cases-layout \.VPDoc \.content-container\s*\{[^}]*max-width:\s*none/s)
    expect(source).not.toMatch(/\.wbx-cases-layout \.VP(?:Content|Doc)[^{]*\{[^}]*padding(?:-inline|-left|-right):/s)
    expect(source).toMatch(/\.wbx-cases h1\s*\{[^}]*font-weight:\s*850[^}]*line-height:\s*1\.2[^}]*letter-spacing:\s*0/s)
    expect(source).toMatch(/\.wbx-cases-categories button,\s*\.wbx-cases-empty button\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(source).toMatch(/\.wbx-cases-categories button:hover,\s*\.wbx-cases-categories button\[aria-pressed="true"\],\s*\.wbx-cases-empty button:hover\s*\{[^}]*color:\s*#0d100d[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action:hover,\s*\.wbx-cases \.wbx-cases-action:focus-visible\s*\{[^}]*color:\s*#0d100d[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases-categories button:focus-visible,\s*\.wbx-case-card__link:focus-visible,\s*\.wbx-cases-action:focus-visible,\s*\.wbx-cases-empty button:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action,\s*\.wbx-case-service-cta \.wbx-cases-action\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action--primary,\s*\.wbx-case-service-cta \.wbx-cases-action--primary\s*\{[^}]*background:\s*var\(--wbx-accent\)/)
    expect(pageSource).toMatch(/<i\s+class="hn hn-check-circle-solid wbx-cases-category__indicator"\s+aria-hidden="true"\s*\/>/)
  })

  it('matches the reading guide outer baseline without adding horizontal gutter overrides', () => {
    const vitepressDoc = readFileSync('node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue', 'utf8')
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const serviceStyles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    const readingStyles = readFileSync('docs/.vitepress/theme/reading.css', 'utf8')

    expect(vitepressDoc).toMatch(/@media \(min-width: 960px\)\s*\{\s*\.VPDoc\s*\{\s*padding:\s*48px 32px 0/s)
    expect(vitepressDoc).toMatch(/@media \(min-width: 1440px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.VPDoc:not\(\.has-sidebar\) \.container\s*\{\s*max-width:\s*1104px/s)
    expect(readingStyles).not.toMatch(/\.wbx-reading-layout \.VPDoc[^{]*\{[^}]*padding(?:-inline|-left|-right):/s)
    expect(casesStyles).toMatch(/\.wbx-cases-layout \.VPDoc \.container\s*\{[^}]*max-width:\s*1104px/s)
    expect(serviceStyles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1104px/s)
  })

  it('contains the case submission actions within the shared page width', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*flex:\s*0 1 412px/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*width:\s*100%/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*max-width:\s*412px/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*min-width:\s*0/s)
  })
})
