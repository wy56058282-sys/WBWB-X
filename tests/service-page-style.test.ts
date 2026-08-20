import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('custom service conversion styles', () => {
  it('uses a two-column poster hero that collapses to one column on narrow screens', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    expect(styles).toMatch(/\.wbx-service-hero\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0, 1\.08fr\) minmax\(320px, 0\.92fr\)/s)
    expect(styles).toMatch(/\.wbx-service-hero__poster\s*\{[^}]*width:\s*100%[^}]*height:\s*auto[^}]*object-fit:\s*cover/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-hero\s*\{[^}]*grid-template-columns:\s*1fr/s)
  })

  it('uses a three-column funnel and removes horizontal overflow at mobile width', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    expect(styles).toMatch(/\.wbx-service-path\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-path\s*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-hero,[\s\S]*?\.wbx-service-section\s*\{[^}]*min-width:\s*0/s)
  })

  it('keeps the supplied registration poster readable and the primary action touch-sized', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    expect(styles).toMatch(/\.wbx-service-registration__poster img\s*\{[^}]*width:\s*100%[^}]*height:\s*auto/s)
    expect(styles).toMatch(/\.wbx-service \.wbx-service-action\s*\{[^}]*min-height:\s*48px/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-action\s*\{[^}]*width:\s*100%/s)
  })

  it('gives the linked hero poster equivalent hover and keyboard-focus feedback', () => {
    const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    expect(styles).toMatch(/\.wbx-service \.wbx-service-hero__poster-link\s*\{[^}]*display:\s*block[^}]*transition:[^}]*transform/s)
    expect(styles).toMatch(/\.wbx-service-hero__poster-link:hover,[\s\S]*?\.wbx-service-hero__poster-link:focus-visible\s*\{[^}]*transform:\s*translate\(-4px, -4px\)/s)
    expect(styles).toMatch(/\.wbx-service-hero__poster-link:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--wbx-accent\)/s)
  })
})
