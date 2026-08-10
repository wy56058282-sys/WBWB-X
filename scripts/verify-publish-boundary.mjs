import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walkFiles(path)
    return entry.isFile() ? [path] : []
  })
}

function readInternalTitles(internalDocsRoot) {
  return walkFiles(internalDocsRoot)
    .filter((path) => path.endsWith('.md'))
    .map((path) => readFileSync(path, 'utf8').match(/^#\s+(.+?)\s*#?\s*$/m)?.[1])
    .filter(Boolean)
}

function findLeakedTitle(files, titles) {
  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    const title = titles.find((candidate) => content.includes(candidate))
    if (title) return { file, title }
  }
  return null
}

export function verifyPublishBoundary(
  distRoot,
  internalDocsRoot = 'docs/superpowers',
) {
  if (!distRoot || !existsSync(distRoot)) {
    throw new Error(`build output is missing: ${distRoot}`)
  }
  if (!existsSync(internalDocsRoot)) {
    throw new Error(`internal documents are missing: ${internalDocsRoot}`)
  }
  if (existsSync(join(distRoot, 'superpowers'))) {
    throw new Error('published output contains a superpowers directory')
  }

  const files = walkFiles(distRoot)
  const titles = readInternalTitles(internalDocsRoot)
  const htmlLeak = findLeakedTitle(
    files.filter((file) => file.endsWith('.html')),
    titles,
  )
  if (htmlLeak) {
    throw new Error(
      `HTML contains internal title "${htmlLeak.title}": ${htmlLeak.file}`,
    )
  }

  const searchLeak = findLeakedTitle(
    files.filter((file) => {
      const name = basename(file)
      return name.startsWith('@localSearchIndex') && name.endsWith('.js')
    }),
    titles,
  )
  if (searchLeak) {
    throw new Error(
      `local search index contains internal title "${searchLeak.title}": ${searchLeak.file}`,
    )
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  verifyPublishBoundary(
    process.argv[2] ?? 'docs/.vitepress/dist',
    process.argv[3] ?? 'docs/superpowers',
  )
}
