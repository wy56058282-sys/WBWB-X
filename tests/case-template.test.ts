// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { validateCaseCatalogItem } from '../docs/.vitepress/case-catalog'

const guide = readFileSync('docs/community/case-contributing.md', 'utf8')
const markdownRenderer = createMarkdownRenderer(process.cwd())

async function parseCaseFrontmatter(source: string, route: string) {
  const renderer = await markdownRenderer
  const env: { frontmatter?: Record<string, unknown> } = {}
  renderer.render(source, env)
  return validateCaseCatalogItem({ route, ...env.frontmatter })
}

describe('executable GitHub case submission artifacts', () => {
  it('converts the guide frontmatter example into a valid catalog item', async () => {
    const example = guide.match(/```yaml\s*([\s\S]*?)\s*```/)?.[1]

    expect(example).toBeDefined()
    await expect(parseCaseFrontmatter(
      example ?? '',
      '/cases/submissions/guide-example/',
    )).resolves.toMatchObject({
      route: '/cases/submissions/guide-example/',
      category: '自动化',
    })
  })

  it('converts the real template into a valid catalog item with a body skeleton', async () => {
    expect(existsSync('.github/CASE_TEMPLATE.md')).toBe(true)
    if (!existsSync('.github/CASE_TEMPLATE.md')) return

    const template = readFileSync('.github/CASE_TEMPLATE.md', 'utf8')
    const renderer = await markdownRenderer
    const tokens = renderer.parse(template, {})
    const levelTwoHeadings = tokens.flatMap((token, index) => (
      token.type === 'heading_open' && token.tag === 'h2'
        ? [tokens[index + 1]?.content]
        : []
    ))

    await expect(parseCaseFrontmatter(
      template,
      '/cases/submissions/template-example/',
    )).resolves.toMatchObject({
      route: '/cases/submissions/template-example/',
    })
    expect(levelTwoHeadings).toEqual(expect.arrayContaining([
      '场景描述',
      '想要完成的任务',
      '使用的 Skill',
      '验收标准',
      '安全与限制',
    ]))
  })
})
