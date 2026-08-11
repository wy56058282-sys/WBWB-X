import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { DefaultTheme } from 'vitepress'
import { validateCaseCatalogItem, type CaseCatalogItem } from './case-catalog'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

function scalar(frontmatter: string, field: string) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, 'm'))
  if (!match) return ''

  const value = match[1]
  const quote = value[0]
  if ((quote === '"' || quote === "'") && value.at(-1) === quote) {
    return value.slice(1, -1).trim()
  }
  return value.trim()
}

function readCase(sourcePath: string, folderName: string): CaseCatalogItem {
  let contents: string
  try {
    contents = readFileSync(sourcePath, 'utf8')
  } catch {
    throw new Error(`${sourcePath}: missing index.md`)
  }

  const frontmatter = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!frontmatter) {
    throw new Error(`${sourcePath}: invalid frontmatter`)
  }

  try {
    return validateCaseCatalogItem({
      route: `/cases/submissions/${encodeURI(folderName)}/`,
      title: scalar(frontmatter[1], 'title'),
      date: scalar(frontmatter[1], 'date'),
      productTag: scalar(frontmatter[1], 'productTag'),
      category: scalar(frontmatter[1], 'category'),
      outcome: scalar(frontmatter[1], 'outcome'),
      cover: scalar(frontmatter[1], 'cover'),
      coverAlt: scalar(frontmatter[1], 'coverAlt'),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${sourcePath}: ${message}`)
  }
}

export function discoverCaseSidebar(casesRoot: string): DefaultTheme.SidebarItem[] {
  const cases = readdirSync(casesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readCase(join(casesRoot, entry.name, 'index.md'), entry.name))
    .sort((left, right) => right.date.localeCompare(left.date) || left.route.localeCompare(right.route))

  return [
    { text: '案例集首页', link: '/cases/' },
    { text: '如何提交 Case', link: '/community/case-contributing' },
    {
      text: '社区 Case',
      items: cases.map(({ productTag, route, title }) => ({
        text: productTag
          ? `${escapeHtml(title)} <span class="wbx-case-product-tag">${escapeHtml(productTag)}</span>`
          : title,
        link: route,
      })),
    },
  ]
}
