import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readHomeStyle } from './helpers/read-theme-style'

describe('homepage style entry', () => {
  it('imports four responsibility-based partials in source order', () => {
    expect(readFileSync('docs/.vitepress/theme/home.css', 'utf8')).toBe(
      "@import './home/home-foundation.css';\n"
      + "@import './home/home-hero.css';\n"
      + "@import './home/home-sections.css';\n"
      + "@import './home/home-responsive.css';\n",
    )
  })

  it('retains all four boundary selectors in aggregate order', () => {
    const css = readHomeStyle()
    const boundaries = [
      '.wbx-home-layout',
      '.wbx-hero {',
      '.wbx-value-strip',
      '@media (max-width: 1200px)',
    ]
    const offsets = boundaries.map((value) => css.indexOf(value))
    expect(offsets.every((offset) => offset >= 0)).toBe(true)
    expect(offsets).toEqual([...offsets].sort((left, right) => left - right))
  })
})
