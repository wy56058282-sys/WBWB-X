import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('book index heading', () => {
  it('keeps the guide phrase together on a dedicated second line', () => {
    const page = readFileSync('docs/wb-x/index.md', 'utf8')
    const styles = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

    expect(page).toContain('<h1 class="wbx-book-index-heading"')
    expect(page).toContain('<span>WorkBuddy</span>')
    expect(page).toContain('<span>使用手册与实战指南</span>')
    expect(styles).toMatch(/\.wbx-book-index-heading > span\s*\{[^}]*display:\s*block/s)
  })
})
