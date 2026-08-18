import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const requiredMaintenanceFiles = [
  'README.md',
  'docs/maintenance/README.md',
  'docs/maintenance/repository-layout.md',
  'docs/maintenance/assets-and-audits.md',
  'docs/maintenance/future-optimizations.md',
]

describe('maintenance documentation contract', () => {
  it('provides every maintainer entry point', () => {
    for (const path of requiredMaintenanceFiles) {
      expect(existsSync(path), path).toBe(true)
      if (path.startsWith('docs/maintenance/')) {
        expect(readFileSync(path, 'utf8')).toContain('内部维护')
      }
    }
  })

  it('uses the current production domain and pnpm-only commands', () => {
    const sources = [
      readFileSync('README.md', 'utf8'),
      readFileSync('CONTENT_INVENTORY.md', 'utf8'),
      ...requiredMaintenanceFiles.slice(1).map((path) =>
        readFileSync(path, 'utf8'),
      ),
    ].join('\n')
    expect(sources).toContain('https://wbx.sparkx.zone/')
    expect(sources).not.toContain('wbwbx.sparkx.zone')
    expect(sources).not.toMatch(/\bnpm (?:run|test|install)\b/)
  })

  it('documents non-destructive local and published asset boundaries', () => {
    const guide = readFileSync(
      'docs/maintenance/assets-and-audits.md',
      'utf8',
    )
    expect(guide).toContain('article-image-replacement-manifest.csv')
    expect(guide).toContain('docs/public/article-assets/')
    expect(guide).toContain('audit/YYYY-MM-DD-topic/')
    expect(guide).toContain('不改公开 URL')
    expect(guide).toContain('不直接删除')
  })

  it('excludes internal maintenance documents from VitePress sources', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).toContain(
      "srcExclude: ['superpowers/**', 'maintenance/**']",
    )
  })
})
