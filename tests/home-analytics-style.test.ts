import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('home analytics integration', () => {
  it('places the strip between hero and reading path', () => {
    const source = readFileSync('docs/.vitepress/theme/HomePage.vue', 'utf8')
    expect(source.indexOf('<HomeAnalyticsStrip')).toBeGreaterThan(source.indexOf('</section>'))
    expect(source.indexOf('<HomeAnalyticsStrip')).toBeLessThan(source.indexOf('class="wbx-section wbx-reading"'))
  })

  it('uses the homepage visual language and mobile 2x2 layout', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*border:\s*2px solid/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*border-radius:\s*0/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*grid-template-columns:\s*160px 1fr/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*box-shadow:\s*0 8px 0 var\(--wbx-ink\)/s)
    expect(css).toMatch(/\.wbx-home-analytics__status\s*\{[^}]*border-right:\s*1px solid var\(--wbx-ink\)/s)
    expect(css).toMatch(/\.wbx-home-analytics dl > div\s*\{[^}]*border-right:\s*1px solid var\(--wbx-ink\)/s)
    expect(css).toMatch(/@media \(max-width:\s*640px\)[\s\S]*\.wbx-home-analytics dl\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  })

  it('keeps the visible status compact like the reference strip', () => {
    const source = readFileSync('docs/.vitepress/theme/HomeAnalyticsStrip.vue', 'utf8')
    expect(source).toContain('<strong>LIVE</strong>')
    expect(source).toContain('class="wbx-sr-only"')
    expect(source).not.toContain("<small>LIVE</small>")
  })
})
