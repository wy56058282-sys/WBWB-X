// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('case collection page styles', () => {
  it('left-aligns the co-creation QR card with the copy column', () => {
    const source = readFileSync('docs/cases/index.md', 'utf8')
    const rule = source.match(/\.case-co-create__qr\s*\{([^}]*)\}/)?.[1]

    expect(rule).toBeDefined()
    expect(rule).toMatch(/margin:\s*0;/)
    expect(rule).not.toMatch(/margin:\s*0\s+auto;/)
  })
})
