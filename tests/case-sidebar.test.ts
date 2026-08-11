// @vitest-environment node

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { discoverCaseSidebar } from '../docs/.vitepress/case-sidebar'

const temporaryRoots: string[] = []

function createCasesRoot() {
  const root = mkdtempSync(join(tmpdir(), 'workbuddy-cases-'))
  temporaryRoots.push(root)
  return root
}

function writeCase(root: string, folder: string, contents: string) {
  const caseDirectory = join(root, folder)
  mkdirSync(caseDirectory)
  writeFileSync(join(caseDirectory, 'index.md'), contents)
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('discoverCaseSidebar', () => {
  it('keeps the daily AI news case title free of example markers', () => {
    const dailyAiNews = readFileSync(
      'docs/cases/submissions/daily-ai-news/index.md',
      'utf8',
    )

    expect(dailyAiNews).toContain('title: 用 WorkBuddy 自动整理每日 AI 资讯')
    expect(dailyAiNews).toContain('# 用 WorkBuddy 自动整理每日 AI 资讯')
    expect(dailyAiNews).not.toContain('【示例】')
  })

  it('discovers cases in descending date order', () => {
    const root = createCasesRoot()
    writeCase(root, 'older', '---\ntitle: 较早案例\ndate: 2026-07-13\n---\n')
    writeCase(root, 'newer', '---\ntitle: 较新案例\ndate: 2026-07-25\n---\n')

    expect(discoverCaseSidebar(root)).toEqual([
      { text: '案例集首页', link: '/cases/' },
      { text: '如何提交 Case', link: '/community/case-contributing' },
      {
        text: '社区 Case',
        items: [
          { text: '较新案例', link: '/cases/submissions/newer/' },
          { text: '较早案例', link: '/cases/submissions/older/' },
        ],
      },
    ])
  })

  it('renders an optional product tag in the sidebar item', () => {
    const root = createCasesRoot()
    writeCase(
      root,
      'tagged',
      '---\ntitle: 专家团吃透十年年报\nproductTag: WorkBuddy\ndate: 2026-07-25\n---\n',
    )

    const communityCases = discoverCaseSidebar(root)[2].items
    expect(communityCases).toEqual([
      {
        text: '专家团吃透十年年报 <span class="wbx-case-product-tag">WorkBuddy</span>',
        link: '/cases/submissions/tagged/',
      },
    ])
  })

  it('uses the WorkBuddy tag in the annual-report case heading and styles both surfaces', () => {
    const contents = readFileSync(
      'docs/cases/submissions/annual-report-digital-transformation/index.md',
      'utf8',
    )
    const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

    expect(contents).toContain('productTag: WorkBuddy')
    expect(contents).toContain(
      '# 专家团吃透十年年报：一套可复用的上市公司深度研究方法 <span class="wbx-case-product-tag">WorkBuddy</span>',
    )
    expect(css).toMatch(
      /\.vp-doc h1 \.wbx-case-product-tag\s*\{[^}]*display:\s*flex;[^}]*width:\s*max-content;[^}]*margin-top:\s*12px;/s,
    )
    expect(css).toMatch(/\.VPSidebarItem \.wbx-case-product-tag\s*\{/)
  })

  it('uses the WorkBuddy tag in the tea-shop sales case heading and sidebar', () => {
    const contents = readFileSync(
      'docs/cases/submissions/tea-shop-sales-analysis/index.md',
      'utf8',
    )

    expect(contents).toContain('productTag: WorkBuddy')
    expect(contents).toContain(
      '# 用 WorkBuddy 清洗 119 份门店 Excel 并生成可交互运营看板 <span class="wbx-case-product-tag">WorkBuddy</span>',
    )

    const teaShopCase = discoverCaseSidebar(
      'docs/cases/submissions',
    )[2].items?.find(
      (item) => item.link === '/cases/submissions/tea-shop-sales-analysis/',
    )
    expect(teaShopCase?.text).toBe(
      '用 WorkBuddy 清洗 119 份门店 Excel 并生成可交互运营看板 <span class="wbx-case-product-tag">WorkBuddy</span>',
    )
  })

  it('uses the WorkBuddy tag in the JZ showreel case heading and sidebar', () => {
    const contents = readFileSync(
      'docs/cases/submissions/jz-2025-showreel/index.md',
      'utf8',
    )
    const title = '用 WorkBuddy 生成一个 GSAP 粒子球体作品集动画网站'

    expect(contents).toContain('productTag: WorkBuddy')
    expect(contents).toContain(
      `# ${title} <span class="wbx-case-product-tag">WorkBuddy</span>`,
    )

    const showreelCase = discoverCaseSidebar(
      'docs/cases/submissions',
    )[2].items?.find(
      (item) => item.link === '/cases/submissions/jz-2025-showreel/',
    )
    expect(showreelCase?.text).toBe(
      `${title} <span class="wbx-case-product-tag">WorkBuddy</span>`,
    )
  })

  it('rejects a case without a title', () => {
    const root = createCasesRoot()
    writeCase(root, 'older', '---\ndate: 2026-07-13\n---\n')

    expect(() => discoverCaseSidebar(root)).toThrow(/older\/index\.md.*title/)
  })

  it('rejects frontmatter that does not begin at byte zero', () => {
    const root = createCasesRoot()
    writeCase(root, 'older', 'intro\n---\ntitle: 较早案例\ndate: 2026-07-13\n---\n')

    expect(() => discoverCaseSidebar(root)).toThrow(/invalid frontmatter/)
  })
})
