import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'

const custom = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
const home = readFileSync('docs/.vitepress/theme/home/home-sections.css', 'utf8')
const workshop = readFileSync('docs/.vitepress/theme/workshop.css', 'utf8')
const cases = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
const reading = readFileSync('docs/.vitepress/theme/reading.css', 'utf8')
const about = readFileSync('docs/.vitepress/theme/about.css', 'utf8')

describe('calm soft product design system', () => {
  it('provides one semantic radius, surface, shadow, and motion contract', () => {
    const root = baseRule(custom, ':root')

    expect(root).toMatch(/--wbx-radius-sm:\s*6px/)
    expect(root).toMatch(/--wbx-radius-md:\s*10px/)
    expect(root).toMatch(/--wbx-radius-lg:\s*12px/)
    expect(root).toMatch(/--wbx-surface-soft:/)
    expect(root).toMatch(/--wbx-shadow-soft:/)
    expect(root).toMatch(/--wbx-motion-fast:\s*160ms/)
    expect(root).toMatch(/--wbx-motion-base:\s*220ms/)
  })

  it('uses the shared soft radius on representative product surfaces', () => {
    expect(baseRule(home, '.wbx-reading-card')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
    expect(baseRule(workshop, '.wbx-workshop__poster-frame')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
    expect(baseRule(cases, '.wbx-case-card__link')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
    expect(baseRule(reading, '.wbx-reading-layout .vp-doc :is(table, .custom-block)')).toMatch(/border-radius:\s*var\(--wbx-radius-md\)/)
    expect(baseRule(about, '.wbx-about-member')).toMatch(/border-radius:\s*var\(--wbx-radius-lg\)/)
  })

  it('keeps navigation and controls quiet instead of using hard offset shadows', () => {
    expect(baseRule(custom, '.VPNavBarSearch .DocSearch-Button')).toMatch(/border-radius:\s*var\(--wbx-radius-md\)/)
    expect(baseRule(custom, '.VPNavBarSearch .DocSearch-Button')).toMatch(/transition:[^;]*var\(--wbx-motion-fast\)/)
    expect(baseRule(custom, '.VPButton')).toMatch(/border-radius:\s*var\(--wbx-radius-md\)/)
    expect(baseRule(custom, '.VPButton:hover')).toMatch(/box-shadow:\s*var\(--wbx-shadow-soft\)/)
  })
})
