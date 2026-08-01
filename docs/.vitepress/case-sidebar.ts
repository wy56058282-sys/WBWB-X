import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { DefaultTheme } from 'vitepress'

interface CaseRecord {
  date: string
  route: string
  title: string
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

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

function readCase(sourcePath: string, folderName: string): CaseRecord {
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

  const title = scalar(frontmatter[1], 'title')
  if (!title) {
    throw new Error(`${sourcePath}: missing title`)
  }

  const date = scalar(frontmatter[1], 'date')
  if (!isIsoDate(date)) {
    throw new Error(`${sourcePath}: missing or invalid ISO date`)
  }

  return {
    date,
    route: `/cases/submissions/${encodeURI(folderName)}/`,
    title,
  }
}

export function discoverCaseSidebar(casesRoot: string): DefaultTheme.SidebarItem[] {
  const cases = readdirSync(casesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readCase(join(casesRoot, entry.name, 'index.md'), entry.name))
    .sort((left, right) => right.date.localeCompare(left.date) || left.route.localeCompare(right.route))

  return [
    { text: '案例集总览', link: '/cases/' },
    {
      text: '社区案例',
      items: cases.map(({ route, title }) => ({ text: title, link: route })),
    },
  ]
}
