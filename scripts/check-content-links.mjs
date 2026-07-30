import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'

const docsRoot = resolve(process.argv[2] ?? 'docs')

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : []
  })
}

function internalLinks(markdown) {
  const links = []
  const inlineLink = /(?<!!)\[[^\]]*]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g
  let match

  while ((match = inlineLink.exec(markdown))) {
    const href = match[1] ?? match[2]
    if (href.startsWith('/')) links.push(href)
  }

  return links
}

function targetCandidates(href) {
  let decodedPath

  try {
    decodedPath = decodeURIComponent(href.split('#', 1)[0].split('?', 1)[0])
  } catch {
    return []
  }

  const route = decodedPath.replace(/^\/+/, '')
  const target = resolve(docsRoot, route)
  const publicTarget = resolve(docsRoot, 'public', route)
  const relativeTarget = relative(docsRoot, target)

  if (relativeTarget === '..' || relativeTarget.startsWith(`..${sep}`)) return []
  if (decodedPath.endsWith('/')) {
    return [resolve(target, 'index.md'), resolve(publicTarget, 'index.html')]
  }
  if (target.endsWith('.md')) return [target, publicTarget]
  return [`${target}.md`, resolve(target, 'index.md'), publicTarget]
}

const broken = []
let checked = 0

for (const sourcePath of markdownFiles(docsRoot)) {
  const markdown = readFileSync(sourcePath, 'utf8')

  for (const href of internalLinks(markdown)) {
    checked += 1
    if (
      !targetCandidates(href).some(
        (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
      )
    ) {
      broken.push(
        `BROKEN_INTERNAL_LINK docs/${relative(docsRoot, sourcePath).split(sep).join('/')} -> ${href}`,
      )
    }
  }
}

if (broken.length) {
  console.error(broken.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Checked ${checked} internal Markdown link${checked === 1 ? '' : 's'}: 0 broken`)
}
