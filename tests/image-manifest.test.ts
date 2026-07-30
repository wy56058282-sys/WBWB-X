import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('required brand assets', () => {
  it('has a valid SVG logo and an 800x800 PNG QR source', () => {
    expect(existsSync('docs/public/brand/wb-x-logo.svg')).toBe(true)
    expect(readFileSync('docs/public/brand/wb-x-logo.svg', 'utf8')).toContain(
      'viewBox="0 0 512 512"',
    )
    expect(existsSync('docs/public/community/wechat-group.png')).toBe(true)
  })
})
