import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'

const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

describe('WorkBuddy product service styles', () => {
  it('keeps the site design tokens for the shell', () => {
    expect(styles).toContain('var(--wbx-accent)')
    expect(styles).toContain('var(--wbx-paper)')
    expect(styles).toContain('var(--wbx-surface)')
    expect(styles).toContain('var(--wbx-pixel)')
  })

  it('keeps the original dynamic behavior while using the shared visual tokens', () => {
    expect(styles).toMatch(/\.wbx-service\s*\{[^}]*--wb-ref-bg:\s*var\(--wbx-paper\);[^}]*--wb-ref-panel:\s*var\(--wbx-surface\);[^}]*--wb-ref-acc:\s*var\(--wbx-accent\);/s)
    expect(styles).toMatch(/\.dark \.wbx-service\s*\{[^}]*--wb-ref-bg:\s*var\(--wbx-paper\);[^}]*--wb-ref-panel:\s*var\(--wbx-surface\);[^}]*--wb-ref-ink:\s*var\(--wbx-ink\);/s)
    expect(styles).not.toContain('#c8f542')
    expect(styles).not.toContain('/* Reference visuals keep the source landing page')
    expect(styles).not.toContain('.wbx-service .console-window')
    expect(styles).not.toContain('.wbx-service .net-box')
    expect(styles).not.toContain('.wbx-service .remote-stage')
    expect(styles).toMatch(/\.wbx-service-console\s*\{[^}]*box-shadow:\s*var\(--wbx-shadow-soft\)/s)
    expect(styles).toMatch(/\.wbx-service-flow span\s*\{[^}]*animation:\s*wbx-service-flow-step 5\.6s/s)
    expect(styles).toMatch(/\.wbx-service-files span\s*\{[^}]*animation:\s*wbx-service-file-scan 5\.4s/s)
    expect(styles).toMatch(/\.wbx-service-swarm__path\.is-hot\s*\{[^}]*stroke:\s*var\(--wbx-accent\)/s)
    expect(styles).toMatch(/\.wbx-service-swarm__agent\.is-active circle,[\s\S]*?stroke:\s*var\(--wbx-accent\)/s)
    expect(styles).toMatch(/\.wbx-service-remote\s*\{[^}]*grid-template-columns:\s*minmax\(220px, \.72fr\) 180px minmax\(300px, 1\.3fr\)/s)
  })

  it('keeps the first console at the original fixed height so the page does not jump', () => {
    expect(baseRule(styles, '.wbx-service-console__body')).toMatch(/height:\s*430px/)
    expect(baseRule(styles, '.wbx-service-console__body')).toMatch(/overflow-y:\s*auto/)
  })

  it('uses the shared soft product treatment across static and dynamic surfaces', () => {
    expect(baseRule(styles, '.wbx-service-button')).toMatch(/min-height:\s*var\(--wbx-control-height\)/)
    expect(baseRule(styles, '.wbx-service-button')).toMatch(/border:\s*1px solid var\(--wbx-line\)/)
    expect(baseRule(styles, '.wbx-service-button')).toMatch(/border-radius:\s*var\(--wbx-radius-md\)/)
    expect(baseRule(styles, '.wbx-service-section')).toMatch(/border-bottom:\s*0/)
    expect(baseRule(styles, '.wbx-service-section')).toMatch(/background:\s*var\(--wbx-paper\)/)
    expect(baseRule(styles, '.wbx-service-heading')).toMatch(/margin-bottom:\s*var\(--wbx-heading-content-gap\)/)
    expect(baseRule(styles, '.wbx-service-compare__card')).toMatch(/border:\s*1px solid var\(--wbx-line\)/)
    expect(baseRule(styles, '.wbx-service-compare__card')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
    expect(baseRule(styles, '.wbx-service-compare__card')).toMatch(/box-shadow:\s*var\(--wbx-shadow-soft\)/)
    expect(styles).toMatch(/\.wbx-service-console\s*\{[^}]*border:\s*1px solid var\(--wbx-line\)[^}]*border-radius:\s*var\(--wbx-radius-lg\)/s)
    expect(baseRule(styles, '.wbx-service-flow,\n.wbx-service-files')).toMatch(/border:\s*1px solid var\(--wbx-line\)/)
    expect(baseRule(styles, '.wbx-service-flow,\n.wbx-service-files')).toMatch(/border-radius:\s*12px/)
    expect(baseRule(styles, '.wbx-service-model')).toMatch(/border-radius:\s*12px/)
    expect(baseRule(styles, '.wbx-service-model')).toMatch(/box-shadow:\s*var\(--wbx-shadow-soft\)/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/border:\s*1px solid var\(--wb-ref-line\)/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/border-radius:\s*20px/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/box-shadow:\s*var\(--wbx-shadow-soft\)/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).not.toMatch(/2px solid var\(--wbx-ink\)/)
  })

  it('softens the remote-control devices without removing their motion states', () => {
    const devices = baseRule(styles, '.wbx-service-phone,\n.wbx-service-laptop')
    const phone = baseRule(styles, '.wbx-service-phone')

    expect(devices).toMatch(/border:\s*1px solid var\(--wbx-line\)/)
    expect(devices).toMatch(/box-shadow:\s*var\(--wbx-shadow-soft\)/)
    expect(phone).toMatch(/display:\s*flex/)
    expect(phone).toMatch(/height:\s*480px/)
    expect(phone).toMatch(/border-radius:\s*24px/)
    expect(baseRule(styles, '.wbx-service-phone footer')).toMatch(/margin-top:\s*auto/)
    expect(styles).toMatch(/\.wbx-service-laptop\s*\{[^}]*border-radius:\s*var\(--wbx-radius-lg\)/s)
    expect(styles).not.toMatch(/\.wbx-service-laptop\s*\{[^}]*8px 8px 0/s)
    expect(styles).toMatch(/\.wbx-service-remote\[data-stage='running'\] \.wbx-service-laptop\s*\{[^}]*transform:\s*translateY\(-2px\)/s)
  })

  it('keeps the site shell and gives the product page a wide bounded canvas', () => {
    expect(styles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1480px/s)
    expect(styles).toMatch(/\.wbx-service\s*\{[^}]*max-width:\s*1200px[^}]*overflow-x:\s*clip/s)
    expect(styles).not.toMatch(/\.custom-service-page \.VPNav\s*\{[^}]*display:\s*none/s)
    expect(styles).not.toMatch(/\.custom-service-page \.VPFooter\s*\{[^}]*display:\s*none/s)
  })

  it('lets the hero blend into the page and keeps section tags text-only', () => {
    const hero = baseRule(styles, '.wbx-service-hero')

    expect(hero).not.toMatch(/(?:^|\s)border:/)
    expect(hero).not.toMatch(/border-radius:/)
    expect(hero).not.toMatch(/(?:^|\s)background:/)
    expect(styles).not.toContain('.wbx-service-hero::before')
    expect(styles).not.toContain('.wbx-service-tag::before')
  })

  it('de-containerizes the final download call to action', () => {
    const download = baseRule(styles, '.wbx-service-download')

    expect(download).toMatch(/border:\s*0;/)
    expect(download).toMatch(/background:\s*transparent;/)
  })

  it('adapts the main diagrams and capability rows across tablet and mobile widths', () => {
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/display:\s*grid/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/grid-template-columns:\s*minmax\(260px, \.42fr\) minmax\(0, 1fr\)/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/overflow:\s*hidden/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/border:\s*1px solid var\(--wb-ref-line\)/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/border-radius:\s*20px/)
    expect(baseRule(styles, '.wbx-service-swarm-layout')).toMatch(/box-shadow:\s*var\(--wbx-shadow-soft\)/)
    expect(baseRule(styles, '#swarm > .wbx-service-heading')).toMatch(/max-width:\s*820px/)
    expect(baseRule(styles, '.wbx-service-swarm')).not.toMatch(/(?:^|\s)border:/)
    expect(baseRule(styles, '.wbx-service-swarm')).not.toMatch(/border-radius:/)
    expect(baseRule(styles, '.wbx-service-swarm')).not.toMatch(/box-shadow:/)
    expect(baseRule(styles, '.wbx-service-swarm__stats')).toMatch(/border-right:\s*1px solid var\(--wbx-line\)/)
    expect(baseRule(styles, '.wbx-service-swarm__stats > div')).toMatch(/grid-template-columns:\s*72px minmax\(0, 1fr\)/)
    expect(styles).toMatch(/\.wbx-service-compare\s*\{[^}]*grid-template-columns:\s*1fr 56px 1fr/s)
    expect(styles).toMatch(/\.wbx-service-capability\s*\{[^}]*grid-template-columns:[^}]*minmax\(0, 1fr\)[^}]*minmax\(0, 1fr\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-compare[^{]*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-swarm-layout\s*\{[^}]*grid-template-columns:\s*1fr/s)
    expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-swarm__stats\s*\{[^}]*border-right:\s*0[^}]*border-bottom:\s*1px solid var\(--wbx-line\)/s)
    expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-hero__actions[^{]*\{[^}]*align-items:\s*stretch/s)
  })

  it('provides keyboard focus and reduced-motion behavior', () => {
    expect(styles).toMatch(/\.wbx-service[^{}]*:focus-visible\s*\{[^}]*outline:\s*var\(--wbx-focus\)/s)
    expect(styles).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation-duration:\s*0\.01ms\s*!important/s)
  })

  it('contains no retired workshop, diagnosis, or team styling', () => {
    expect(styles).not.toContain('.wbx-service-edition')
    expect(styles).not.toContain('.wbx-service-registration')
    expect(styles).not.toContain('.wbx-service-path')
    expect(styles).not.toContain('.wbx-service-enterprise')
    expect(styles).not.toContain('.wbx-service-guests')
  })
})
