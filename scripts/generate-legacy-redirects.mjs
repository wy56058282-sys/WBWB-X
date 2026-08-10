import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const LEGACY_ROOT = 'bluebook'
const CURRENT_ROOT = 'wb-x'
const CANONICAL_ORIGIN = 'https://wbx.sparkx.zone'

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character]
  })
}

function walkHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walkHtmlFiles(path)
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : []
  })
}

function isUnsafePathSegment(segment) {
  if (!segment) return true

  let decoded = segment
  while (true) {
    if (
      decoded === '.' ||
      decoded === '..' ||
      decoded.includes('/') ||
      decoded.includes('\\')
    ) {
      return true
    }

    let next
    try {
      next = decodeURIComponent(decoded)
    } catch {
      return true
    }
    if (next === decoded) return false
    decoded = next
  }
}

export function legacyTargetForBuiltFile(relativePath) {
  const segments = relativePath.split(/[\\/]/)
  const fileName = segments.at(-1)
  if (
    segments[0] !== CURRENT_ROOT ||
    segments.length < 2 ||
    !fileName?.endsWith('.html') ||
    segments.slice(1).some(isUnsafePathSegment)
  ) {
    return null
  }

  const pageSegments = segments.slice(1)
  const isDirectoryPage = fileName === 'index.html'
  const routeSegments = isDirectoryPage ? pageSegments.slice(0, -1) : pageSegments
  const encodedPath = routeSegments.map(encodeURIComponent).join('/')
  const target = `/${CURRENT_ROOT}/${encodedPath}${encodedPath && isDirectoryPage ? '/' : ''}`
  return target.startsWith(`/${CURRENT_ROOT}/`) ? target : null
}

function redirectDocument(target) {
  const escapedTarget = escapeHtml(target)
  const scriptTarget = JSON.stringify(target)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=${escapedTarget}">
    <link rel="canonical" href="${CANONICAL_ORIGIN}${escapedTarget}">
    <title>正在跳转 | WorkBuddy WB-X</title>
    <script>location.replace(${scriptTarget} + location.search + location.hash)</script>
  </head>
  <body><a href="${escapedTarget}">前往新版 WorkBuddy 小白书</a></body>
</html>
`
}

export function writeLegacyMappings(mappings, legacyRoot, sourceCount) {
  if (mappings.length === 0) {
    throw new Error('legacy mappings must be non-empty')
  }
  if (mappings.length !== sourceCount) {
    throw new Error('wb-x source and legacy mapping counts do not match')
  }

  const resolvedLegacyRoot = resolve(legacyRoot)
  const redirectPaths = new Set()
  for (const mapping of mappings) {
    if (!mapping || typeof mapping.target !== 'string') {
      throw new Error('could not create a one-to-one legacy mapping for wb-x HTML files')
    }

    const redirectPath = resolve(mapping.redirectPath)
    if (!redirectPath.startsWith(`${resolvedLegacyRoot}${sep}`)) {
      throw new Error('every legacy redirect must remain beneath the legacy root')
    }
    if (redirectPaths.has(redirectPath)) {
      throw new Error('legacy redirect paths must be unique')
    }
    redirectPaths.add(redirectPath)
  }

  return mappings.map(({ redirectPath, target }) => {
    mkdirSync(dirname(redirectPath), { recursive: true })
    writeFileSync(redirectPath, redirectDocument(target))
    return redirectPath
  })
}

export function generateLegacyRedirects(distRoot) {
  const currentRoot = join(distRoot, CURRENT_ROOT)
  if (!existsSync(currentRoot)) {
    throw new Error(`wb-x build root is missing: ${currentRoot}`)
  }

  const builtFiles = walkHtmlFiles(currentRoot)
  if (builtFiles.length === 0) {
    throw new Error(`no wb-x HTML files found beneath: ${currentRoot}`)
  }

  const rootPage = join(currentRoot, 'index.html')
  if (!builtFiles.includes(rootPage)) {
    throw new Error(`wb-x root page is missing: ${rootPage}`)
  }

  const legacyRoot = resolve(distRoot, LEGACY_ROOT)
  const mappings = builtFiles.map((builtFile) => {
    const relativePath = relative(distRoot, builtFile)
    const target = legacyTargetForBuiltFile(relativePath)
    const redirectPath = resolve(
      distRoot,
      LEGACY_ROOT,
      ...relativePath.split(sep).slice(1),
    )

    return { builtFile, redirectPath, target }
  })

  return writeLegacyMappings(mappings, legacyRoot, builtFiles.length)
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  generateLegacyRedirects(process.argv[2] ?? 'docs/.vitepress/dist')
}
