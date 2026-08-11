import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('case collection page styles', () => {
  it('uses a stable responsive card grid with constrained cards', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/)
    expect(source).toMatch(/@media \(max-width:\s*960px\)[\s\S]*\.wbx-cases-grid\s*\{[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(source).toMatch(/@media \(max-width:\s*640px\)[\s\S]*\.wbx-cases-grid\s*\{[\s\S]*grid-template-columns:\s*1fr/)
    expect(source).toMatch(/\.wbx-case-card__cover\s*\{[\s\S]*aspect-ratio:/)
    expect(source).toMatch(/\.wbx-cases-grid\s*>\s*\.wbx-case-card\s*\{[^}]*margin:\s*0/)
    expect(source).toMatch(/\.wbx-cases\s+\.wbx-cases-grid\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;[^}]*list-style:\s*none/)
    expect(source).toMatch(/\.wbx-case-card__title\s*\{[^}]*min-height:[^}]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-case-card__outcome[\s\S]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPSidebar\s*\{[\s\S]*display:\s*none/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPLocalNav\s*\{[\s\S]*display:\s*none/)
  })

  it('registers the gallery and makes it the entire case-index body', () => {
    const themeSource = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const indexSource = readFileSync('docs/cases/index.md', 'utf8')

    expect(themeSource).toContain("import CasesPage from './CasesPage.vue'")
    expect(themeSource).toContain("app.component('CasesPage', CasesPage)")
    expect(indexSource).toContain('<CasesPage />')
    expect(indexSource).not.toContain('# WorkBuddy WB-X 案例集')
  })
})
