// @vitest-environment node

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { createMarkdownRenderer } from 'vitepress'
import { describe, expect, it } from 'vitest'
import config from '../docs/.vitepress/config'
import { nav } from '../docs/.vitepress/navigation'
import { isReadingRoute } from '../docs/.vitepress/route-state'
const chapterTitles = [
  '时代浪潮：OPC 正在重塑创业版图',
  '范式转移：从「雇人」到「调度算力」',
  '中国机遇：政策、园区与本地化生态',
  'WorkBuddy 解法：从一人公司到超级团队',
  '实战图鉴：OPC × WorkBuddy 的 N 种打开方式',
  '共建生态：OPC 生产基础设施的建设路径',
]

describe('OPC reading area', () => {
  it('renders the overview title as two explicit lines', async () => {
    const markdown = await createMarkdownRenderer(resolve('docs'))
    const html = await markdown.render(readFileSync('docs/opc/index.md', 'utf8'))
    const heading = new JSDOM(html).window.document.querySelector('h1')
    const titleNodes = [...(heading?.childNodes ?? [])]
      .filter((node) => !(node instanceof node.ownerDocument!.defaultView!.HTMLAnchorElement))
      .map((node) => (node.nodeName === 'BR' ? '<br>' : node.textContent?.trim()))
      .filter(Boolean)

    expect(titleNodes).toEqual([
      'WorkBuddy OPC',
      '<br>',
      '从超级个体到超级团队',
    ])
  })

  it('exposes OPC in the primary navigation after the existing reading entry', () => {
    expect(nav.map((item) => [item.text, item.link])).toEqual([
      ['首页', '/'],
      ['开始阅读', '/wb-x/'],
      ['OPC 专区', '/opc/'],
      ['案例集', '/cases/'],
      ['工具集', '/tools/'],
      ['企业服务', '/services/'],
      ['交流群', '#community'],
    ])
  })

  it('uses the shared reading layout with overview links separated from the chapter group', () => {
    expect(isReadingRoute('/opc/', '/')).toBe(true)
    expect(isReadingRoute('/WBWB-X/opc/chapter-2/', '/WBWB-X/')).toBe(true)

    const sidebars = config.themeConfig?.sidebar as Record<string, Array<unknown>>
    expect(sidebars['/opc/']).toEqual([
      { text: 'OPC 白皮书总览', link: '/opc/' },
      { text: '阅读指南', link: '/opc/#推荐阅读方式' },
      {
        text: '章节目录',
        items: chapterTitles.map((title, index) => ({
          text: `第 ${index + 1} 章 ${title}`,
          link: `/opc/chapter-${index + 1}/`,
        })),
      },
    ])
  })

  it('publishes the overview, all six chapters, and the exact source PDF', () => {
    expect(existsSync('docs/opc/index.md')).toBe(true)

    chapterTitles.forEach((title, index) => {
      const path = `docs/opc/chapter-${index + 1}/index.md`
      expect(existsSync(path)).toBe(true)
      expect(readFileSync(path, 'utf8')).toContain(`# 第 ${index + 1} 章 ${title}`)
    })

    const pdf = readFileSync('docs/public/opc/workbuddy-opc-whitepaper.pdf')
    expect(createHash('sha256').update(pdf).digest('hex')).toBe(
      '3afbbe36da70e5028a305569232da61cec87b509db843ac78b622bfdac79dcbf',
    )
  })
})
