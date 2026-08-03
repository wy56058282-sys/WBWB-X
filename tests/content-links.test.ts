import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
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

  it('uses the approved contribution guidance in the reading guide', () => {
    const readingGuide = readFileSync('docs/reading-guide.md', 'utf8')

    expect(readingGuide).toContain(
      '欢迎阅读[参与共创](/community/contributing)，添加发起人的企业微信或微信，提出问题，或直接提交修改错误页面。',
    )
    expect(readingGuide).not.toContain('通过 Issue 提出问题')
    expect(readingGuide).not.toContain('Pull Request 修改对应 Markdown 页面')
  })

  it('places the complete capability image immediately after the chapter-one Mermaid flowchart', () => {
    const chapter = readFileSync(
      'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 1 章 初识 WorkBuddy/index.md',
      'utf8',
    )
    const mermaidEnd = chapter.indexOf('```', chapter.indexOf('```mermaid') + 3) + 3
    const image = '![WorkBuddy 完整能力架构图](/article-assets/source-calibration/ch01/004.jpg)'
    const exampleIndex = chapter.indexOf('例如，用户可以直接告诉 WorkBuddy')

    expect(existsSync('docs/public/article-assets/source-calibration/ch01/004.jpg')).toBe(true)
    expect(chapter.slice(mermaidEnd, exampleIndex).trim()).toBe(image)
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
