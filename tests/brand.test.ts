import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { brand } from '../docs/.vitepress/brand'

describe('brand configuration', () => {
  it('contains the approved WB-X identity', () => {
    expect(brand.siteName).toBe('WorkBuddy WB-X')
    expect(brand.contentName).toBe('WorkBuddy 实战小白书')
    expect(brand.contentShortName).toBe('WorkBuddy小白书')
    expect(brand.shortMark).toBe('WBWB-X')
    expect(brand.accent).toBe('#32E6B9')
    expect(brand.origin).toBe('https://www.wbwb-x.sparkx.zone')
    expect(brand.repository).toBe('https://github.com/wy56058282-sys/WBWB-X')
    expect(brand.author).toBe('WorkBuddy WB-X Contributors')
    expect(brand.logoPath).toBe('/brand/wb-x-logo.svg')
    expect(brand.qrPath).toBe('/community/wechat-group.png')
  })

  it('renders homepage identity from the shared brand module', () => {
    const source = readFileSync('docs/.vitepress/theme/HomePage.vue', 'utf8')
    expect(source).toContain("import { brand } from '../brand'")
    expect(source).not.toContain('WorkBuddy Guide')
    expect(source).not.toContain('#d8f238')
  })

  it('loads the local Silkscreen weights used by pixel labels', () => {
    const themeSource = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const customCss = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

    expect(themeSource).toContain("import '@fontsource/silkscreen/400.css'")
    expect(themeSource).toContain("import '@fontsource/silkscreen/700.css'")
    expect(customCss).toContain('--wbx-pixel: "Silkscreen"')
  })

  it('keeps the 390px homepage on the mobile single-column contract', () => {
    const source = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const mobileRules = source.slice(source.indexOf('@media (max-width: 760px)'))
    const narrowRules = source.slice(source.indexOf('@media (max-width: 420px)'))

    expect(mobileRules).toMatch(
      /\.wbx-hero__actions\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1fr;/s,
    )
    expect(mobileRules).toMatch(
      /\.wbx-button\s*\{[^}]*width:\s*100%;[^}]*min-width:\s*0;/s,
    )
    expect(mobileRules).toMatch(
      /\.wbx-reading-grid,\s*\.wbx-task-grid\s*\{[^}]*grid-template-columns:\s*1fr;/s,
    )
    expect(narrowRules).toMatch(
      /\.wbx-hero__copy h1\s*\{[^}]*white-space:\s*normal;/s,
    )
  })
})
