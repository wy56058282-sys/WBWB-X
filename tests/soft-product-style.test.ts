import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'

const custom = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
const home = readFileSync('docs/.vitepress/theme/home/home-sections.css', 'utf8')
const workshop = readFileSync('docs/.vitepress/theme/workshop.css', 'utf8')
const cases = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
const reading = readFileSync('docs/.vitepress/theme/reading.css', 'utf8')
const about = readFileSync('docs/.vitepress/theme/about.css', 'utf8')
const tools = readFileSync('docs/.vitepress/theme/tools.css', 'utf8')
const enterpriseServices = readFileSync('docs/.vitepress/theme/enterprise-services.css', 'utf8')
const service = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

describe('calm soft product design system', () => {
  it('provides one semantic radius, surface, shadow, and motion contract', () => {
    const root = baseRule(custom, ':root')

    expect(root).toMatch(/--wbx-paper:\s*#ffffff/)
    expect(root).toMatch(/--wbx-section-soft:\s*#f7f9f8/)
    expect(root).toMatch(/--wbx-line:\s*#e3e7e4/)
    expect(root).toMatch(/--wbx-radius-sm:\s*6px/)
    expect(root).toMatch(/--wbx-radius-md:\s*10px/)
    expect(root).toMatch(/--wbx-radius-lg:\s*16px/)
    expect(root).toMatch(/--wbx-surface-soft:/)
    expect(root).toMatch(
      /--wbx-shadow-soft:\s*0 8px 24px rgb\(13 16 13 \/ 6%\)/,
    )
    expect(root).toMatch(
      /--wbx-shadow-hover:\s*0 12px 32px rgb\(13 16 13 \/ 10%\)/,
    )
    expect(root).toMatch(/--wbx-content-wide:\s*1400px/)
    expect(root).toMatch(/--wbx-control-height:\s*48px/)
    expect(root).toMatch(/--wbx-motion-fast:\s*160ms/)
    expect(root).toMatch(/--wbx-motion-base:\s*220ms/)
  })

  it('aligns the case, tool, and enterprise-service page shells to one wide content baseline', () => {
    expect(baseRule(cases, '.wbx-cases-layout .VPDoc .container')).toMatch(/max-width:\s*calc\(var\(--wbx-content-wide\) \+ 64px\)/)
    expect(baseRule(tools, '.wbx-tools__header')).toMatch(/width:\s*min\(var\(--wbx-content-wide\), 100%\)/)
    expect(baseRule(tools, '.wbx-tools__tabs')).toMatch(/width:\s*min\(var\(--wbx-content-wide\), 100%\)/)
    expect(baseRule(tools, '.wbx-tools__placeholder')).toMatch(/width:\s*min\(var\(--wbx-content-wide\), 100%\)/)
    expect(baseRule(enterpriseServices, '.custom-enterprise-services-page .VPDoc:not(.has-sidebar) .container')).toMatch(/max-width:\s*calc\(var\(--wbx-content-wide\) \+ 64px\)/)
    expect(baseRule(service, '.wbx-service')).toMatch(/max-width:\s*1200px/)
  })

  it('keeps light page and navigation surfaces white without changing dark mode', () => {
    const root = baseRule(custom, ':root')
    const dark = baseRule(custom, '.dark')

    expect(root).toMatch(/--vp-c-bg:\s*var\(--wbx-paper\)/)
    expect(root).toMatch(/--vp-nav-bg-color:\s*rgb\(255 255 255 \/ 96%\)/)
    expect(dark).toMatch(/--wbx-paper:\s*#10120e/)
    expect(dark).toMatch(/--vp-nav-bg-color:\s*rgb\(16 18 14 \/ 94%\)/)
  })

  it('uses the shared soft radius on representative product surfaces', () => {
    expect(baseRule(home, '.wbx-reading-card')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
    expect(baseRule(workshop, '.wbx-workshop__poster-frame')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
    expect(baseRule(cases, '.wbx-case-card__link')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
    expect(baseRule(reading, '.wbx-reading-layout .vp-doc :is(table, .custom-block)')).toMatch(/border-radius:\s*var\(--wbx-radius-md\)/)
    expect(baseRule(about, '.wbx-about-member')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
  })

  it('keeps the enterprise hero compact and removes the embedded team wrapper surface', () => {
    expect(baseRule(custom, '.wbx-page-header')).toMatch(/padding:\s*24px 0 36px/)
    expect(baseRule(enterpriseServices, '.wbx-enterprise__hero')).toMatch(/max-width:\s*960px/)
    const teamRule = baseRule(enterpriseServices, '.wbx-enterprise > .wbx-about .wbx-about__team')
    expect(teamRule).toMatch(/border:\s*0/)
    expect(teamRule).toMatch(/background:\s*transparent/)
    expect(teamRule).toMatch(/box-shadow:\s*none/)
  })

  it('keeps navigation and controls quiet instead of using hard offset shadows', () => {
    expect(baseRule(custom, '.VPNavBarSearch .DocSearch-Button')).toMatch(/border-radius:\s*var\(--wbx-radius-md\)/)
    expect(baseRule(custom, '.VPNavBarSearch .DocSearch-Button')).toMatch(/transition:[^;]*var\(--wbx-motion-fast\)/)
    expect(baseRule(custom, '.VPButton')).toMatch(/border-radius:\s*var\(--wbx-radius-md\)/)
    expect(baseRule(custom, '.VPButton:hover')).toMatch(/box-shadow:\s*var\(--wbx-shadow-soft\)/)
  })
})
