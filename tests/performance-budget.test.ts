import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { auditBuild } from '../scripts/check-performance-budget.mjs'

function createBuild(html: string, assets: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'wbx-performance-budget-'))
  mkdirSync(join(root, 'assets'))
  writeFileSync(join(root, 'index.html'), html)
  for (const [name, content] of Object.entries(assets)) {
    writeFileSync(join(root, 'assets', name), content)
  }
  return root
}

describe('production performance budget', () => {
  it('accepts a lightweight marketing page', () => {
    const root = createBuild(
      '<link rel="stylesheet" href="/assets/app.css"><link rel="modulepreload" href="/assets/app.js"><script type="module" src="/assets/entry.js"></script>',
      { 'app.css': '.page{}', 'app.js': 'export{}', 'entry.js': 'import"./app.js"' },
    )

    const report = auditBuild(root, ['index.html'])

    expect(report.violations).toEqual([])
    expect(report.pages[0].initialRequestCount).toBe(3)
  })

  it('rejects Mermaid preloads on ordinary pages', () => {
    const root = createBuild(
      '<link rel="modulepreload" href="/assets/mermaid.js"><script type="module" src="/assets/entry.js"></script>',
      { 'mermaid.js': 'export{}', 'entry.js': 'import"./mermaid.js"' },
    )

    const report = auditBuild(root, ['index.html'])

    expect(report.violations).toContain('index.html: Mermaid must not be preloaded')
  })

  it('counts the selected WebP picture source instead of its fallback image', () => {
    const root = createBuild(
      '<picture><source type="image/webp" srcset="/assets/cover.webp"><img loading="eager" src="/assets/original.png"></picture>',
      { 'cover.webp': 'small', 'original.png': 'this fallback is much larger' },
    )

    const report = auditBuild(root, ['index.html'])

    expect(report.pages[0].initialImages).toBe(5)
  })
})
