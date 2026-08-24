import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('custom service conversion styles', () => {
  it('styles only service content and contains no retired workshop rules', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).not.toContain('.wbx-service-hero')
    expect(styles).not.toContain('.wbx-service-edition')
    expect(styles).not.toContain('.wbx-service-registration')
    expect(styles).toMatch(/\.wbx-service-header\s*\{[^}]*min-height:\s*220px/s)
    expect(styles).toMatch(/\.wbx-service-brand-title\s*\{[^}]*font-size:\s*51\.2px[^}]*line-height:\s*58\.88px/s)
  })

  it('uses a three-column service path that stacks at tablet widths', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/\.wbx-service \.wbx-service-path\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service \.wbx-service-path\s*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/\.wbx-service-path__item > span\s*\{[^}]*font-size:\s*calc\(12px \+ 4pt\)/s)
  })

  it('keeps problem cards aligned and responsive', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/\.wbx-service-problem\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)[^}]*align-items:\s*stretch/s)
    expect(styles).toMatch(/\.wbx-service-problem__item\s*\{[^}]*height:\s*100%[^}]*grid-template-rows:\s*auto auto 1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-problem\s*\{[^}]*grid-template-columns:\s*1fr/s)
  })

  it('keeps enterprise and outcome cards readable on mobile', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/\.wbx-service-enterprise__body \.wbx-service-enterprise__benefit\s*\{[^}]*border-left:\s*6px solid var\(--wbx-accent\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-related__grid\s*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-action\s*\{[^}]*width:\s*100%/s)
  })
})
