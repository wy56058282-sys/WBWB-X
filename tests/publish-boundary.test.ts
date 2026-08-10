import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = readFileSync('docs/.vitepress/config.mts', 'utf8')

describe('production content boundary', () => {
  it('excludes internal superpowers documents from VitePress pages and search', () => {
    expect(config).toMatch(/srcExclude:\s*\[\s*['"]superpowers\/\*\*['"]\s*\]/)
  })
})
