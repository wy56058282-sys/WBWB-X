import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readHomeStyle } from './helpers/read-theme-style'

describe('home analytics integration', () => {
  it('places the strip between hero and reading path', () => {
    const source = readFileSync('docs/.vitepress/theme/HomePage.vue', 'utf8')
    expect(source.indexOf('<HomeAnalyticsStrip')).toBeGreaterThan(source.indexOf('</section>'))
    expect(source.indexOf('<HomeAnalyticsStrip')).toBeLessThan(source.indexOf('class="wbx-section wbx-reading"'))
  })

  it('uses the homepage visual language and mobile 2x2 layout', () => {
    const css = readHomeStyle()
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*border:\s*1px solid var\(--wbx-line\)/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*width:\s*82%/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*margin:\s*32px auto 0/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*border-radius:\s*var\(--wbx-radius-lg\)/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*grid-template-columns:\s*190px 1fr/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*background:\s*var\(--wbx-surface\)/s)
    expect(css).toMatch(/\.wbx-home-analytics\s*\{[^}]*box-shadow:\s*var\(--wbx-shadow-soft\)/s)
    expect(css).toMatch(/\.wbx-home-analytics__status\s*\{[^}]*border-right:\s*1px solid var\(--wbx-line\)/s)
    expect(css).toMatch(/\.wbx-home-analytics dl > div\s*\{[^}]*border-right:\s*1px solid var\(--wbx-line\)/s)
    expect(css).toMatch(/@media \(max-width:\s*640px\)[\s\S]*\.wbx-home-analytics dl\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  })

  it('stacks each metric value, Chinese label, and English label on compact desktops', () => {
    const css = readHomeStyle()
    const compact = css.slice(
      css.indexOf('@media (max-width: 1100px)'),
      css.indexOf('@media (max-width: 640px)'),
    )

    expect(compact).toMatch(/\.wbx-home-analytics dl > div\s*{[^}]*grid-template-columns:\s*1fr;[^}]*justify-items:\s*start;[^}]*text-align:\s*left;/s)
    expect(compact).toMatch(/\.wbx-home-analytics dd\s*{[^}]*order:\s*1;/s)
    expect(compact).toMatch(/\.wbx-home-analytics dt\s*{[^}]*order:\s*2;/s)
    expect(compact).toMatch(/\.wbx-home-analytics dl small\s*{[^}]*order:\s*3;/s)
  })

  it('keeps the visible status compact like the reference strip', () => {
    const source = readFileSync('docs/.vitepress/theme/HomeAnalyticsStrip.vue', 'utf8')
    const css = readHomeStyle()
    expect(source).toContain('<strong>LIVE</strong>')
    expect(source).toContain('class="wbx-sr-only"')
    expect(source).not.toContain("<small>LIVE</small>")
    expect(css).toMatch(/\.wbx-sr-only\s*\{[^}]*position:\s*absolute[^}]*width:\s*1px[^}]*height:\s*1px[^}]*overflow:\s*hidden/s)
  })

  it('animates changed digits with stable columns and respects reduced motion', () => {
    const css = readHomeStyle()
    expect(css).toMatch(/\.wbx-flip-value__digit\s*\{[^}]*width:\s*1ch[^}]*overflow:\s*hidden/s)
    expect(css).toMatch(/\.wbx-digit-enter-active[^}]*\{[^}]*var\(--wbx-digit-duration\)[^}]*var\(--wbx-digit-delay\)/s)
    expect(css).toMatch(/\.wbx-digit-enter-from\s*\{[^}]*(?:translateY\(100%\)[^}]*opacity:\s*0|opacity:\s*0[^}]*translateY\(100%\))/s)
    expect(css).toMatch(/\.wbx-digit-leave-to\s*\{[^}]*(?:translateY\(-100%\)[^}]*opacity:\s*0|opacity:\s*0[^}]*translateY\(-100%\))/s)
    expect(css).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.wbx-digit-enter-active[^}]*\{[^}]*transition:\s*none/s)
  })
})
