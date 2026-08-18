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

describe('maintenance CI contract', () => {
  it('runs the same complete check locally and before Pages upload', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const workflow = readFileSync(
      '.github/workflows/deploy-pages.yml',
      'utf8',
    )
    expect(packageJson.packageManager).toBe('pnpm@11.9.0')
    expect(packageJson.engines.node).toBe('>=20')
    expect(packageJson.scripts.check).toBe(
      'pnpm test && pnpm run check:repo && pnpm run check:links && pnpm run check:assets && pnpm run build',
    )
    expect(workflow).toContain('version: 11.9.0')
    expect(workflow).toContain('node-version: 24')
    expect(workflow).toMatch(
      /- name: Verify\s+run: pnpm run check[\s\S]*- name: Upload Pages artifact/,
    )
    expect(workflow).not.toContain('- name: Test\n')
    expect(workflow).not.toContain('- name: Build\n')
  })

  it('keeps the inventory aligned with generated redirects, the replacement manifest, and unified CI', () => {
    const inventory = readFileSync('CONTENT_INVENTORY.md', 'utf8')

    expect(inventory).not.toContain('公网 GitHub Pages 当前返回 404')
    expect(inventory).not.toContain('replacement 文件与清单状态不一致')
    expect(inventory).not.toContain('运行测试。\n4. 构建 VitePress。')
    expect(inventory).toContain('静态跳转页仍是公网兼容的必要兜底')
    expect(inventory).toContain(
      '`community/002.jpg` 的 replacement 文件与清单均标记为 `replaced`',
    )
    expect(inventory).toContain('统一运行 `pnpm run check`')
  })
})
