import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'

const custom = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
const homeHero = readFileSync('docs/.vitepress/theme/home/home-hero.css', 'utf8')
const homeSections = readFileSync('docs/.vitepress/theme/home/home-sections.css', 'utf8')
const workshop = readFileSync('docs/.vitepress/theme/workshop.css', 'utf8')
const service = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
const about = readFileSync('docs/.vitepress/theme/about.css', 'utf8')
const enterprise = readFileSync('docs/.vitepress/theme/enterprise-services.css', 'utf8')

describe('approved visual polish', () => {
  it('uses the approved radius scale for small, standard, and large cards', () => {
    const root = baseRule(custom, ':root')

    expect(root).toMatch(/--wbx-radius-sm:\s*6px/)
    expect(root).toMatch(/--wbx-radius-md:\s*10px/)
    expect(root).toMatch(/--wbx-radius-lg:\s*16px/)
  })

  it('keeps English labels close to headings without a divider', () => {
    expect(baseRule(homeHero, '.wbx-hero__copy h1')).toMatch(/margin:\s*12px 0 18px/)
    expect(baseRule(homeSections, '.wbx-section__heading .wbx-pixel-label')).toMatch(/margin-bottom:\s*12px/)
    expect(baseRule(homeSections, '.wbx-system__intro .wbx-pixel-label')).toMatch(/margin-bottom:\s*12px/)
    expect(baseRule(workshop, '.wbx-workshop__eyebrow')).toMatch(/margin-bottom:\s*12px/)

    const serviceHeading = baseRule(service, '.wbx-service-heading h2')
    expect(serviceHeading).toMatch(/margin-top:\s*0/)
    expect(serviceHeading).toMatch(/padding-top:\s*0/)
    expect(serviceHeading).toMatch(/border-top:\s*0/)
    expect(baseRule(service, '.wbx-service-heading .wbx-service-tag')).toMatch(/margin-bottom:\s*12px/)

    const downloadHeading = baseRule(service, '.wbx-service-download h2')
    expect(downloadHeading).toMatch(/margin-top:\s*12px/)
    expect(downloadHeading).toMatch(/padding-top:\s*0/)
    expect(downloadHeading).toMatch(/border-top:\s*0/)

    const enterpriseHeading = baseRule(enterprise, '.wbx-enterprise__heading h2')
    expect(enterpriseHeading).toMatch(/margin-top:\s*0/)
    expect(enterpriseHeading).toMatch(/padding-top:\s*0/)
    expect(enterpriseHeading).toMatch(/border-top:\s*0/)

    const teamHeading = baseRule(enterprise, '.wbx-enterprise > .wbx-about .wbx-about__heading h2')
    expect(teamHeading).toMatch(/margin-top:\s*0/)
    expect(teamHeading).toMatch(/padding-top:\s*0/)
    expect(teamHeading).toMatch(/border-top:\s*0/)
  })

  it('gives mentor cards a restrained desktop hover motion', () => {
    const member = baseRule(about, '.wbx-about-member')

    expect(member).toMatch(/transition:[^;]*var\(--wbx-motion-fast\)/)
    expect(about).toMatch(/@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.wbx-about-member:hover,\s*\.wbx-about-member:focus-within\s*\{[^}]*transform:\s*translateY\(-3px\)/)
    expect(about).toMatch(/\.wbx-about-member:hover,\s*\.wbx-about-member:focus-within\s*\{[^}]*box-shadow:\s*var\(--wbx-shadow-hover\)/)
    expect(about).toMatch(/\.wbx-about-member:hover img,\s*\.wbx-about-member:focus-within img\s*\{[^}]*transform:\s*translateX\(0\) scale\(1\.5\)/)
    expect(about).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wbx-about-member:hover[\s\S]*?transform:\s*none/)
  })

  it('gives the enterprise hero and shared description deliberate widths', () => {
    expect(baseRule(enterprise, '.wbx-enterprise__hero')).toMatch(/max-width:\s*960px/)
    expect(custom).toMatch(/\.wbx-page-header > p:last-child,[^{]*\{[^}]*max-width:\s*720px/s)
  })
})
