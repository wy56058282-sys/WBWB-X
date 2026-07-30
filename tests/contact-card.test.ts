import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

afterEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('community contact QR thumbnails', () => {
  it('keeps contact images at 140px wide with automatic proportional height', () => {
    const style = document.createElement('style')
    style.textContent = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
    document.head.append(style)

    const card = document.createElement('a')
    card.className = 'wb-contact-card'
    const image = document.createElement('img')
    card.append(image)
    document.body.append(card)

    const computed = getComputedStyle(image)
    expect(computed.width).toBe('140px')
    expect(computed.height).toBe('auto')
  })
})
