import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'

const custom = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
const homeHero = readFileSync('docs/.vitepress/theme/home/home-hero.css', 'utf8')
const homeSections = readFileSync('docs/.vitepress/theme/home/home-sections.css', 'utf8')
const homeResponsive = readFileSync('docs/.vitepress/theme/home/home-responsive.css', 'utf8')
const cases = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
const enterprise = readFileSync('docs/.vitepress/theme/enterprise-services.css', 'utf8')
const layout = readFileSync('docs/.vitepress/theme/Layout.vue', 'utf8')

describe('Uxcel-inspired marketing visual system', () => {
  it('defines the approved semantic text colors and motion timings', () => {
    const root = baseRule(custom, ':root')
    const dark = baseRule(custom, '.dark')

    expect(root).toMatch(/--wbx-text-strong:\s*#0d100d/)
    expect(root).toMatch(/--wbx-text-body:\s*#343934/)
    expect(root).toMatch(/--wbx-text-muted:\s*#656b60/)
    expect(root).toMatch(/--wbx-text-subtle:\s*#8a908b/)
    expect(root).toMatch(/--wbx-motion-fast:\s*160ms/)
    expect(root).toMatch(/--wbx-motion-base:\s*240ms/)
    expect(root).toMatch(/--wbx-motion-reveal:\s*320ms/)
    expect(root).toMatch(/--wbx-ease-standard:\s*cubic-bezier\(\.22,\s*1,\s*\.36,\s*1\)/)

    expect(dark).toMatch(/--wbx-text-strong:\s*#f3f5ed/)
    expect(dark).toMatch(/--wbx-text-body:\s*#d7dcd3/)
    expect(dark).toMatch(/--wbx-text-muted:\s*#aeb4a7/)
    expect(dark).toMatch(/--wbx-text-subtle:\s*#858c80/)
  })

  it('uses the approved desktop type scale on marketing pages', () => {
    const pageTitle = baseRule(custom, '.wbx-page-header > h1,\n.wbx-page-header > :first-child > h1')
    const pageLead = baseRule(custom, '.wbx-page-header > p:last-child,\n.wbx-page-header > :first-child > p:last-child')
    const heroTitle = baseRule(homeHero, '.wbx-hero__copy h1')
    const heroLead = baseRule(homeHero, '.wbx-hero__summary')
    const sectionTitle = baseRule(homeSections, '.wbx-section__heading h2,\n.wbx-system h2')
    const cardTitle = baseRule(enterprise, '.wbx-enterprise-service h3')
    const pixelLabel = baseRule(custom, '.wbx-pixel-label')

    expect(pageTitle).toMatch(/font-size:\s*52px/)
    expect(pageTitle).toMatch(/font-weight:\s*700/)
    expect(pageTitle).toMatch(/line-height:\s*1\.2/)
    expect(pageLead).toMatch(/font-size:\s*17px/)
    expect(pageLead).toMatch(/font-weight:\s*400/)
    expect(pageLead).toMatch(/line-height:\s*1\.65/)

    expect(heroTitle).toMatch(/font-size:\s*58px/)
    expect(heroTitle).toMatch(/font-weight:\s*700/)
    expect(heroTitle).toMatch(/line-height:\s*1\.18/)
    expect(heroLead).toMatch(/font-size:\s*20px/)
    expect(heroLead).toMatch(/font-weight:\s*400/)
    expect(heroLead).toMatch(/line-height:\s*1\.6/)

    expect(sectionTitle).toMatch(/font-size:\s*40px/)
    expect(sectionTitle).toMatch(/font-weight:\s*700/)
    expect(sectionTitle).toMatch(/line-height:\s*1\.25/)
    expect(cardTitle).toMatch(/font-size:\s*22px/)
    expect(cardTitle).toMatch(/font-weight:\s*700/)
    expect(cardTitle).toMatch(/line-height:\s*1\.35/)
    expect(pixelLabel).toMatch(/font-size:\s*11px/)
    expect(pixelLabel).toMatch(/font-weight:\s*500/)
    expect(pixelLabel).toMatch(/line-height:\s*1\.6/)
  })

  it('uses the approved mobile type scale', () => {
    const mobile = `${custom}\n${homeHero}\n${homeSections}\n${enterprise}\n${homeResponsive}`

    expect(mobile).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-page-header[^}]*h1[^}]*font-size:\s*38px/)
    expect(mobile).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-hero__copy h1\s*\{[^}]*font-size:\s*40px/)
    expect(mobile).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-section__heading h2[^}]*\{[^}]*font-size:\s*30px/)
    expect(mobile).toMatch(/@media \(max-width:\s*720px\)[\s\S]*?\.wbx-enterprise-service h3\s*\{[^}]*font-size:\s*20px/)
  })

  it('keeps motion composited, restrained, and disabled when requested', () => {
    expect(custom).toMatch(/\.wbx-marketing-reveal\[data-motion-ready\]:not\(\.is-visible\)\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY\(18px\);/s)
    expect(custom).toMatch(/\.wbx-marketing-reveal\.is-visible\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translateY\(0\);/s)
    expect(custom).toMatch(/@media \(hover:\s*hover\) and \(pointer:\s*fine\)[\s\S]*?\.wbx-interactive-card:hover[^}]*transform:\s*translateY\(-4px\)/)
    expect(custom).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.wbx-marketing-reveal[^}]*opacity:\s*1[^}]*transform:\s*none/)

    expect(homeHero).not.toMatch(/\.wbx-icon-card\s*\{[^}]*animation:/s)
    expect(homeHero).not.toMatch(/\.wbx-icon-card--(?:buddy|guide|system|cases|roles)\s*\{[^}]*rotate\(/s)
    expect(homeHero).toMatch(/\.wbx-hero__sparkx-bubble\s*\{[^}]*animation:/s)
  })

  it('uses three, two, and one-column case grids without changing filter behavior', () => {
    expect(baseRule(cases, '.wbx-cases-grid')).toMatch(/grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
    expect(cases).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
    expect(cases).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
  })

  it('adds a stable navigation scroll state at the 24px threshold', () => {
    expect(layout).toContain("'wbx-nav-scrolled': navScrolled")
    expect(layout).toMatch(/window\.scrollY\s*>\s*24/)
    expect(layout).toMatch(/addEventListener\(['"]scroll['"][^\n]*passive:\s*true/)
    expect(layout).toMatch(/removeEventListener\(['"]scroll['"]/)
    expect(custom).toMatch(/\.wbx-nav-scrolled\s+\.VPNavBar\s*\{[^}]*border-bottom:[^;]+;[^}]*box-shadow:/s)
  })
})
