import { describe, expect, it } from 'vitest'
import { readHomeStyle } from './helpers/read-theme-style'

const homeCss = readHomeStyle()

describe('homepage reading heading tablet layout', () => {
  it('keeps the title on one line above mobile while limiting the description to two lines', () => {
    expect(homeCss).toMatch(
      /@media \(min-width: 761px\)[\s\S]*?\.wbx-section__heading h2\s*{[^}]*white-space:\s*nowrap;/,
    )
    const descriptionRule = homeCss.match(/\.wbx-section__heading > p\s*{([^}]*)}/s)?.[1] ?? ''
    expect(descriptionRule).toMatch(/min-width:\s*0;/)
    expect(descriptionRule).toMatch(/-webkit-line-clamp:\s*2;/)
    expect(descriptionRule).toMatch(/overflow:\s*hidden;/)
  })

  it('stacks the heading and allows the description to wrap from 761px to 900px', () => {
    expect(homeCss).toMatch(
      /@media \(min-width: 761px\) and \(max-width: 900px\)\s*{[\s\S]*?\.wbx-section__heading\s*{[\s\S]*?align-items:\s*stretch;[\s\S]*?flex-direction:\s*column;[\s\S]*?gap:\s*12px;/,
    )
    expect(homeCss).toMatch(
      /@media \(min-width: 761px\) and \(max-width: 900px\)[\s\S]*?\.wbx-section__heading h2\s*{[\s\S]*?white-space:\s*nowrap;/,
    )
    expect(homeCss).toMatch(
      /@media \(min-width: 761px\) and \(max-width: 900px\)[\s\S]*?\.wbx-section__heading > p\s*{[\s\S]*?max-width:\s*none;[\s\S]*?white-space:\s*normal;/,
    )
  })

  it('keeps the existing mobile heading stack available below 760px', () => {
    expect(homeCss).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.wbx-section__heading\s*{[\s\S]*?flex-direction:\s*column;/,
    )
  })
})
