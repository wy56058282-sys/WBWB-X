import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('workshop and About responsive styles', () => {
  it('keeps the full workshop panel, poster, facts, and editions in the homepage stylesheet', () => {
    const styles = readFileSync('docs/.vitepress/theme/workshop.css', 'utf8')

    expect(styles).toMatch(/\.wbx-workshop__panel\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1\.08fr\) minmax\(320px, \.92fr\)/s)
    expect(styles).toMatch(/\.wbx-workshop__poster\s*\{[^}]*width:\s*100%[^}]*aspect-ratio:\s*3 \/ 4/s)
    expect(styles).toMatch(/\.wbx-workshop__facts\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)/s)
    expect(styles).toMatch(/\.wbx-workshop__editions\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)/s)
    expect(styles).toMatch(/\.wbx-workshop__edition\[aria-selected="true"\]\s*\{[^}]*box-shadow:/s)
  })

  it('stacks the homepage workshop into one copy-first column on mobile', () => {
    const styles = readFileSync('docs/.vitepress/theme/workshop.css', 'utf8')
    const serviceStyles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-workshop__panel\s*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-home-workshop__registration\s*\{[^}]*width:\s*100%/s)
    expect(serviceStyles).not.toContain('.wbx-service-hero')
  })

  it('keeps About member images uncropped across desktop and mobile grids', () => {
    const styles = readFileSync('docs/.vitepress/theme/about.css', 'utf8')
    expect(styles).toMatch(/\.wbx-about-members\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/\.wbx-about-member img\s*\{[^}]*width:\s*100%[^}]*height:\s*auto[^}]*object-fit:\s*contain/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-about-members\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-about-members\s*\{[^}]*grid-template-columns:\s*1fr/s)
  })
})
