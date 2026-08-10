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

export function legacyTargetForBuiltFile(relativePath) {
  const segments = relativePath.split(/[\\/]/)
  if (segments[0] !== CURRENT_ROOT || segments.at(-1) !== 'index.html') return null

  const pathSegments = segments.slice(1, -1)
  return `/${[CURRENT_ROOT, ...pathSegments].join('/')}/`
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

export function generateLegacyRedirects(distRoot) {
  const currentRoot = join(distRoot, CURRENT_ROOT)
  if (!existsSync(currentRoot)) return []

  return walkHtmlFiles(currentRoot).flatMap((builtFile) => {
    const relativePath = relative(distRoot, builtFile)
    const target = legacyTargetForBuiltFile(relativePath)
    if (!target) return []

    const redirectPath = join(
      distRoot,
      LEGACY_ROOT,
      ...relativePath.split(sep).slice(1),
    )
    mkdirSync(dirname(redirectPath), { recursive: true })
    writeFileSync(redirectPath, redirectDocument(target))
    return [redirectPath]
  })
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  generateLegacyRedirects(process.argv[2] ?? 'docs/.vitepress/dist')
}
