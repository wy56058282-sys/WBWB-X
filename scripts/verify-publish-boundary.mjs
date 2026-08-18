import { existsSync, readFileSync, readdirSync } from 'node:fs'
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'node:path'
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

function findSearchIndexes(files, distRoot) {
  const loaders = files.filter((file) =>
    basename(file).startsWith('VPLocalSearchBox.'),
  )
  if (loaders.length === 0) {
    throw new Error('local search index loader is missing from build output')
  }

  const resolvedDistRoot = resolve(distRoot)
  const indexes = new Set()
  for (const loader of loaders) {
    const source = readFileSync(loader, 'utf8')
    for (const match of source.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) {
      const reference = match[1].split(/[?#]/, 1)[0]
      const index = resolve(dirname(loader), reference)
      const relativePath = relative(resolvedDistRoot, index)
      if (
        !reference.startsWith('.') ||
        relativePath === '..' ||
        relativePath.startsWith(`..${sep}`) ||
        isAbsolute(relativePath)
      ) {
        throw new Error(`local search index reference is invalid: ${reference}`)
      }
      if (!existsSync(index)) {
        throw new Error(`local search index is missing: ${index}`)
      }
      indexes.add(index)
    }
  }

  if (indexes.size === 0) {
    throw new Error('local search index reference is missing from build output')
  }
  return [...indexes]
}

export function verifyPublishBoundary(
  distRoot,
  internalDocsRoots = ['docs/superpowers', 'docs/maintenance'],
) {
  if (!distRoot || !existsSync(distRoot)) {
    throw new Error(`build output is missing: ${distRoot}`)
  }
  const roots = Array.isArray(internalDocsRoots)
    ? internalDocsRoots
    : [internalDocsRoots]
  for (const root of roots) {
    if (!existsSync(root)) {
      throw new Error(`internal documents are missing: ${root}`)
    }
    const directory = basename(root)
    if (existsSync(join(distRoot, directory))) {
      throw new Error(`published output contains a ${directory} directory`)
    }
  }

  const files = walkFiles(distRoot)
  const titles = roots.flatMap(readInternalTitles)
  const htmlLeak = findLeakedTitle(
    files.filter((file) => file.endsWith('.html')),
    titles,
  )
  if (htmlLeak) {
    throw new Error(
      `HTML contains internal title "${htmlLeak.title}": ${htmlLeak.file}`,
    )
  }

  const searchLeak = findLeakedTitle(findSearchIndexes(files, distRoot), titles)
  if (searchLeak) {
    throw new Error(
      `local search index contains internal title "${searchLeak.title}": ${searchLeak.file}`,
    )
  }
}

if (
  process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const internalRoots = process.argv.slice(3)
  verifyPublishBoundary(
    process.argv[2] ?? 'docs/.vitepress/dist',
    internalRoots.length > 0 ? internalRoots : undefined,
  )
}
