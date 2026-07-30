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
})
