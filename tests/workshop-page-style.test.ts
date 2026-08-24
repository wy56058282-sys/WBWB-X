import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('workshop and About responsive styles', () => {
  it('stacks the homepage workshop into one copy-first column on mobile', () => {
    const styles = readFileSync('docs/.vitepress/theme/home/home-responsive.css', 'utf8')
    expect(styles).toMatch(/@media \(max-width:\s*760px\)[\s\S]*?\.wbx-home-workshop\s*\{[^}]*grid-template-columns:\s*1fr[^}]*gap:\s*24px/s)
    expect(styles).toMatch(/@media \(max-width:\s*760px\)[\s\S]*?\.wbx-home-workshop__poster\s*\{[^}]*max-width:\s*min\(100%, 360px\)[^}]*justify-self:\s*start/s)
  })

  it('keeps About member images uncropped across desktop and mobile grids', () => {
    const styles = readFileSync('docs/.vitepress/theme/about.css', 'utf8')
    expect(styles).toMatch(/\.wbx-about-members\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/\.wbx-about-member img\s*\{[^}]*width:\s*100%[^}]*height:\s*auto[^}]*object-fit:\s*contain/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-about-members\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-about-members\s*\{[^}]*grid-template-columns:\s*1fr/s)
  })
})
