import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

afterEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('community contact QR thumbnails', () => {
  it('renders 170px contact cards with automatic proportional image height', () => {
    const style = document.createElement('style')
    style.textContent = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
    document.head.append(style)

    const card = document.createElement('a')
    card.className = 'wb-contact-card'
    const image = document.createElement('img')
    card.append(image)
    document.body.append(card)

    expect(getComputedStyle(card).width).toBe('170px')
    expect(getComputedStyle(image).width).toBe('170px')
    expect(getComputedStyle(image).height).toBe('auto')
  })
})
