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
  'docs/wb-x/reading-guide/index.md',
  'docs/resources/index.md',
  'docs/cases/index.md',
  'docs/tools/index.md',
  'docs/services/index.md',
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
    const readingGuide = readFileSync(
      'docs/wb-x/reading-guide/index.md',
      'utf8',
    )

    expect(readingGuide).toContain(
      '欢迎阅读[参与共创](/community/contributing)，添加发起人的企业微信或微信，提出问题，或直接提交修改错误页面。',
    )
    expect(readingGuide).not.toContain('通过 Issue 提出问题')
    expect(readingGuide).not.toContain('Pull Request 修改对应 Markdown 页面')
  })

  it('uses the approved part labels without changing their routes', () => {
    const readingGuide = readFileSync(
      'docs/wb-x/reading-guide/index.md',
      'utf8',
    )

    expect(readingGuide).toContain(
      '[第一篇：基础篇《从0到1：先把 WorkBuddy 用起来》](/wb-x/%E7%AC%AC%E4%B8%80%E7%AF%87%20%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C%EF%BC%9A%E5%85%88%E6%8A%8A%20WorkBuddy%20%E7%94%A8%E8%B5%B7%E6%9D%A5/)',
    )
    expect(readingGuide).toContain(
      '[第二篇：案例篇《从一项任务到一支 AI 团队》](/wb-x/%E7%AC%AC%E4%BA%8C%E7%AF%87%20%E6%A1%88%E4%BE%8B%E7%AF%87%EF%BC%9A%E4%BB%8E%E4%B8%80%E9%A1%B9%E4%BB%BB%E5%8A%A1%E5%88%B0%E4%B8%80%E6%94%AF%20AI%20%E5%9B%A2%E9%98%9F/)',
    )
    expect(readingGuide).toContain(
      '[第三篇：进阶篇《把案例变成可复用的工作系统》](/wb-x/%E7%AC%AC%E4%B8%89%E7%AF%87%20%E8%BF%9B%E9%98%B6%E7%AF%87%EF%BC%9A%E6%8A%8A%E6%A1%88%E4%BE%8B%E5%8F%98%E6%88%90%E8%87%AA%E5%B7%B1%E7%9A%84%E5%B7%A5%E4%BD%9C%E7%B3%BB%E7%BB%9F/)',
    )
    expect(readingGuide).toContain(
      '[第四篇：实战篇《落到岗位与行业，组建AI团队》](/wb-x/%E7%AC%AC%E5%9B%9B%E7%AF%87%20%E5%B2%97%E4%BD%8D%E4%B8%8E%E8%A1%8C%E4%B8%9A%E8%90%BD%E5%9C%B0/)',
    )
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

  it('places the official-site screenshot after the WorkBuddy link', () => {
    const chapter = readFileSync(
      'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md',
      'utf8',
    )
    const officialLink = '[WorkBuddy 官网](https://www.workbuddy.ai/)'
    const screenshot =
      '![WorkBuddy 官网首页](/article-assets/source-calibration/ch02/018.png)'
    const codeBuddyLink = '[CodeBuddy 工作台](https://www.codebuddy.cn/work/)'

    expect(existsSync('docs/public/article-assets/source-calibration/ch02/018.png')).toBe(true)
    expect(chapter.indexOf(officialLink)).toBeLessThan(chapter.indexOf(screenshot))
    expect(chapter.indexOf(screenshot)).toBeLessThan(chapter.indexOf(codeBuddyLink))
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
