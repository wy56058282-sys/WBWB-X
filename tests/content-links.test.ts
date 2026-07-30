import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { sidebar } from '../docs/.vitepress/sidebar'

const required = [
  'docs/index.md',
  'docs/reading-guide.md',
  'docs/cases/index.md',
  'docs/help/index.md',
  'docs/community/contributing.md',
]

function flattenLinks(
  entries: Array<{ link?: string; items?: Array<{ link?: string }> }>,
) {
  return entries.flatMap((entry) => [
    ...(entry.link ? [entry.link] : []),
    ...(entry.items ?? []).flatMap((item) => (item.link ? [item.link] : [])),
  ])
}

function routeToMarkdownPath(route: string) {
  const path = decodeURIComponent(route).replace(/^\/|\/$/g, '')
  return path ? `docs/${path}/index.md` : 'docs/index.md'
}

function runChecker(files: Record<string, string>) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'workbuddy-content-links-'))
  const docsRoot = join(fixtureRoot, 'docs')

  for (const [relativePath, content] of Object.entries(files)) {
    const path = join(docsRoot, relativePath)
    mkdirSync(resolve(path, '..'), { recursive: true })
    writeFileSync(path, content)
  }

  return spawnSync(
    process.execPath,
    [resolve('scripts/check-content-links.mjs'), docsRoot],
    { encoding: 'utf8' },
  )
}

describe('content inventory', () => {
  it('contains every top-level source page', () => {
    for (const path of required) expect(existsSync(path)).toBe(true)
  })

  it('contains one Markdown file for every configured sidebar route', () => {
    for (const route of flattenLinks(sidebar)) {
      expect(existsSync(routeToMarkdownPath(route)), route).toBe(true)
    }
  })
})

describe('internal content links', () => {
  it('resolves decoded directory indexes and ignores URL fragments', () => {
    const result = runChecker({
      'index.md': '[阅读章节](/蓝皮书/第一章/#开始)',
      '蓝皮书/第一章/index.md': '# 第一章',
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Checked 1 internal Markdown link')
  })

  it('reports missing internal targets with the source file and original link', () => {
    const result = runChecker({
      'wb-x/index.md': '[缺失章节](/wb-x/missing-page/)',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'BROKEN_INTERNAL_LINK docs/wb-x/index.md -> /wb-x/missing-page/',
    )
  })

  it('resolves absolute links to files served from the VitePress public directory', () => {
    const result = runChecker({
      'index.md': '[下载完整报告](/downloads/report.html)',
      'public/downloads/report.html': '<!doctype html><title>报告</title>',
    })

    expect(result.status).toBe(0)
  })

  it('rejects a bare public directory without a served file or index', () => {
    const result = runChecker({
      'index.md': '[下载目录](/downloads)',
      'public/downloads/.gitkeep': '',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'BROKEN_INTERNAL_LINK docs/index.md -> /downloads',
    )
  })
})
