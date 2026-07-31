// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { createMarkdownRenderer } from 'vitepress'
import { beforeAll, describe, expect, it } from 'vitest'

const indexPath = resolve('docs/wb-x/index.md')

let document: Document

beforeAll(async () => {
  const markdown = await createMarkdownRenderer(resolve('docs'))
  const html = await markdown.render(readFileSync(indexPath, 'utf8'))
  document = new JSDOM(html).window.document
})

describe('small-book reading index', () => {
  it('renders the four reading parts and appendix as a semantic book index', () => {
    const index = document.querySelector('.wbx-book-index')
    const entries = index?.querySelectorAll('.wbx-book-index__entry')

    expect(index?.tagName).toBe('OL')
    expect(entries).toHaveLength(5)
  })

  it('gives every destination an index label, title, and reading description', () => {
    const expected = [
      ['01', '第一篇 · 使用手册', '从 0 到 1，把 WorkBuddy 用起来'],
      ['02', '第二篇 · 实战案例', '从一项真实任务到一支 AI 团队'],
      ['03', '第三篇 · 系统进阶', '把案例沉淀成可复用的工作系统'],
      ['04', '第四篇 · 行业落地', '面向岗位与行业的实践路径'],
      ['A', '附录 · 补充资料', '常用指令模板与场景速查表'],
    ]

    const entries = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        '.wbx-book-index__entry > a',
      ),
    ]

    expect(
      entries.map((entry) => [
        entry.querySelector('.wbx-book-index__number')?.textContent?.trim(),
        entry.querySelector('.wbx-book-index__title')?.textContent?.trim(),
        entry
          .querySelector('.wbx-book-index__description')
          ?.textContent?.trim(),
      ]),
    ).toEqual(expected)
  })

  it('links every entry to its published directory route', () => {
    const expectedPaths = [
      '/wb-x/%E7%AC%AC%E4%B8%80%E7%AF%87%20%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C%EF%BC%9A%E5%85%88%E6%8A%8A%20WorkBuddy%20%E7%94%A8%E8%B5%B7%E6%9D%A5/',
      '/wb-x/%E7%AC%AC%E4%BA%8C%E7%AF%87%20%E6%A1%88%E4%BE%8B%E7%AF%87%EF%BC%9A%E4%BB%8E%E4%B8%80%E9%A1%B9%E4%BB%BB%E5%8A%A1%E5%88%B0%E4%B8%80%E6%94%AF%20AI%20%E5%9B%A2%E9%98%9F/',
      '/wb-x/%E7%AC%AC%E4%B8%89%E7%AF%87%20%E8%BF%9B%E9%98%B6%E7%AF%87%EF%BC%9A%E6%8A%8A%E6%A1%88%E4%BE%8B%E5%8F%98%E6%88%90%E8%87%AA%E5%B7%B1%E7%9A%84%E5%B7%A5%E4%BD%9C%E7%B3%BB%E7%BB%9F/',
      '/wb-x/%E7%AC%AC%E5%9B%9B%E7%AF%87%20%E5%B2%97%E4%BD%8D%E4%B8%8E%E8%A1%8C%E4%B8%9A%E8%90%BD%E5%9C%B0/',
      '/wb-x/%E9%99%84%E5%BD%95/',
    ]

    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        '.wbx-book-index__entry > a',
      ),
    ].map((link) => link.getAttribute('href'))

    expect(links).toEqual(expectedPaths)
  })
})
