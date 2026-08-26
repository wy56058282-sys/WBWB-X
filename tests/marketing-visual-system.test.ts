import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'

const custom = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
const homeHero = readFileSync('docs/.vitepress/theme/home/home-hero.css', 'utf8')
const homeSections = readFileSync('docs/.vitepress/theme/home/home-sections.css', 'utf8')
const homeResponsive = readFileSync('docs/.vitepress/theme/home/home-responsive.css', 'utf8')
const cases = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
const enterprise = readFileSync('docs/.vitepress/theme/enterprise-services.css', 'utf8')
const tools = readFileSync('docs/.vitepress/theme/tools.css', 'utf8')
const workshop = readFileSync('docs/.vitepress/theme/workshop.css', 'utf8')
const service = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
const about = readFileSync('docs/.vitepress/theme/about.css', 'utf8')
const reading = readFileSync('docs/.vitepress/theme/reading.css', 'utf8')
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
    expect(root).toMatch(/--wbx-radius-lg:\s*16px/)

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

    expect(pageTitle).toMatch(/font-size:\s*var\(--wbx-type-page-size\)/)
    expect(pageTitle).toMatch(/font-weight:\s*var\(--wbx-weight-bold\)/)
    expect(pageTitle).toMatch(/line-height:\s*var\(--wbx-leading-page\)/)
    expect(pageLead).toMatch(/font-size:\s*var\(--wbx-type-body-size\)/)
    expect(pageLead).toMatch(/font-weight:\s*var\(--wbx-weight-regular\)/)
    expect(pageLead).toMatch(/line-height:\s*var\(--wbx-leading-body\)/)

    expect(heroTitle).toMatch(/font-size:\s*var\(--wbx-type-hero-size\)/)
    expect(heroTitle).toMatch(/font-weight:\s*var\(--wbx-weight-bold\)/)
    expect(heroTitle).toMatch(/line-height:\s*var\(--wbx-leading-hero\)/)
    expect(heroLead).toMatch(/font-size:\s*var\(--wbx-type-lead-size\)/)
    expect(heroLead).toMatch(/font-weight:\s*var\(--wbx-weight-regular\)/)
    expect(heroLead).toMatch(/line-height:\s*var\(--wbx-leading-lead\)/)

    expect(sectionTitle).toMatch(/font-size:\s*var\(--wbx-type-section-size\)/)
    expect(sectionTitle).toMatch(/font-weight:\s*var\(--wbx-weight-bold\)/)
    expect(sectionTitle).toMatch(/line-height:\s*var\(--wbx-leading-section\)/)
    expect(cardTitle).toMatch(/font-size:\s*var\(--wbx-type-card-size\)/)
    expect(cardTitle).toMatch(/font-weight:\s*var\(--wbx-weight-bold\)/)
    expect(cardTitle).toMatch(/line-height:\s*var\(--wbx-leading-card\)/)
    expect(pixelLabel).toMatch(/font-size:\s*var\(--wbx-type-eyebrow-size\)/)
    expect(pixelLabel).toMatch(/font-weight:\s*var\(--wbx-weight-medium\)/)
    expect(pixelLabel).toMatch(/line-height:\s*var\(--wbx-leading-eyebrow\)/)
  })

  it('defines one semantic typography and spacing scale', () => {
    const root = baseRule(custom, ':root')

    expect(root).toMatch(/--wbx-type-hero-size:\s*58px/)
    expect(root).toMatch(/--wbx-type-page-size:\s*52px/)
    expect(root).toMatch(/--wbx-type-section-size:\s*40px/)
    expect(root).toMatch(/--wbx-type-card-size:\s*22px/)
    expect(root).toMatch(/--wbx-type-lead-size:\s*20px/)
    expect(root).toMatch(/--wbx-type-body-size:\s*17px/)
    expect(root).toMatch(/--wbx-type-aux-size:\s*14px/)
    expect(root).toMatch(/--wbx-type-control-size:\s*15px/)
    expect(root).toMatch(/--wbx-type-eyebrow-size:\s*11px/)
    expect(root).toMatch(/--wbx-leading-hero:\s*1\.18/)
    expect(root).toMatch(/--wbx-leading-body:\s*1\.65/)
    expect(root).toMatch(/--wbx-weight-regular:\s*400/)
    expect(root).toMatch(/--wbx-weight-medium:\s*500/)
    expect(root).toMatch(/--wbx-weight-semibold:\s*600/)
    expect(root).toMatch(/--wbx-weight-bold:\s*700/)
    expect(root).toMatch(/--wbx-section-space:\s*72px/)
    expect(root).toMatch(/--wbx-section-space-compact:\s*48px/)
    expect(root).toMatch(/--wbx-section-space-hero:\s*96px/)
    expect(root).toMatch(/--wbx-heading-content-gap:\s*32px/)
    expect(root).toMatch(/--wbx-grid-gap:\s*24px/)

    expect(custom).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?:root\s*\{[^}]*--wbx-type-hero-size:\s*40px[^}]*--wbx-type-page-size:\s*38px[^}]*--wbx-type-section-size:\s*30px[^}]*--wbx-section-space:\s*48px[^}]*--wbx-section-space-compact:\s*36px[^}]*--wbx-section-space-hero:\s*64px[^}]*--wbx-heading-content-gap:\s*24px[^}]*--wbx-grid-gap:\s*16px/s)
  })

  it('uses only the approved UI font weights', () => {
    const marketingStyles = [custom, homeHero, homeSections, workshop, cases, tools, enterprise, service, about, reading].join('\n')
    expect(marketingStyles).not.toMatch(/font-weight:\s*(?:750|800|820|850)\b/)
  })

  it('uses the approved mobile type scale', () => {
    const mobile = `${custom}\n${homeHero}\n${homeSections}\n${enterprise}\n${homeResponsive}`

    expect(mobile).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?:root\s*\{[^}]*--wbx-type-hero-size:\s*40px[^}]*--wbx-type-page-size:\s*38px[^}]*--wbx-type-section-size:\s*30px[^}]*--wbx-type-card-size:\s*20px[^}]*--wbx-type-lead-size:\s*17px[^}]*--wbx-type-body-size:\s*16px[^}]*--wbx-type-aux-size:\s*13px[^}]*--wbx-type-control-size:\s*14px[^}]*--wbx-type-eyebrow-size:\s*10px/s)
  })

  it('uses the shared section rhythm on long marketing pages', () => {
    expect(baseRule(homeSections, '.wbx-section')).toMatch(/padding:\s*var\(--wbx-section-space\) 52px 0/)
    expect(baseRule(service, '.wbx-service-section')).toMatch(/padding:\s*var\(--wbx-section-space\) 52px/)
    expect(baseRule(service, '.wbx-service-heading')).toMatch(/margin-bottom:\s*var\(--wbx-heading-content-gap\)/)
    expect(baseRule(service, '.wbx-service-download')).toMatch(/padding:\s*var\(--wbx-section-space-hero\) 52px/)
    expect(baseRule(workshop, '.wbx-workshop')).toMatch(/padding:\s*var\(--wbx-section-space\) 0/)
  })

  it('keeps reading typography aligned without changing document structure', () => {
    const docTitle = baseRule(custom, '.VPDoc .vp-doc > div > h1')
    const docBody = baseRule(reading, '.wbx-reading-layout .vp-doc')
    const docSection = baseRule(reading, '.wbx-reading-layout .vp-doc h2')

    expect(docTitle).toMatch(/font-size:\s*var\(--wbx-type-page-size\)/)
    expect(docTitle).toMatch(/font-weight:\s*var\(--wbx-weight-bold\)/)
    expect(docTitle).toMatch(/line-height:\s*var\(--wbx-leading-page\)/)
    expect(docBody).toMatch(/font-size:\s*16px/)
    expect(docBody).toMatch(/line-height:\s*1\.75/)
    expect(docSection).toMatch(/margin-top:\s*48px/)
    expect(docSection).toMatch(/font-size:\s*24px/)
    expect(docSection).toMatch(/font-weight:\s*var\(--wbx-weight-semibold\)/)
    expect(docSection).toMatch(/line-height:\s*1\.35/)
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
