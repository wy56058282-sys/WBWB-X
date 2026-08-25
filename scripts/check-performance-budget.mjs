import { existsSync, readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_PAGES = [
  'index.html',
  'tools/index.html',
  'cases/index.html',
  'services/index.html',
]

const DEFAULT_BUDGETS = {
  initialRequests: 25,
  javascriptGzip: 300 * 1024,
  cssGzip: 70 * 1024,
  initialImages: 350 * 1024,
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1]
}

function localFile(distDir, url) {
  const pathname = url.split(/[?#]/, 1)[0]
  if (!pathname || /^(?:https?:)?\/\//.test(pathname) || pathname.startsWith('data:')) return undefined
  return resolve(distDir, pathname.replace(/^\//, ''))
}

function gzipSize(path) {
  return gzipSync(readFileSync(path)).byteLength
}

export function auditBuild(distDir, pages = DEFAULT_PAGES, budgets = DEFAULT_BUDGETS) {
  const report = { pages: [], violations: [] }

  for (const page of pages) {
    const pagePath = resolve(distDir, page)
    if (!existsSync(pagePath)) {
      report.violations.push(`${page}: built page is missing`)
      continue
    }

    const html = readFileSync(pagePath, 'utf8')
    const resourceUrls = []
    let javascriptGzip = 0
    let cssGzip = 0
    let initialImages = 0

    for (const tag of html.match(/<(?:link|script)\b[^>]*>/gi) ?? []) {
      const rel = attribute(tag, 'rel')
      const href = attribute(tag, 'href')
      const src = attribute(tag, 'src')
      const url = rel === 'stylesheet' || rel === 'modulepreload' ? href : src
      if (!url || (rel && rel !== 'stylesheet' && rel !== 'modulepreload')) continue
      resourceUrls.push(url)
      const file = localFile(distDir, url)
      if (!file || !existsSync(file)) continue
      if (url.endsWith('.css')) cssGzip += gzipSize(file)
      if (/\.(?:m?js)(?:[?#]|$)/.test(url)) javascriptGzip += gzipSize(file)
    }

    const pictures = html.match(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi) ?? []
    for (const picture of pictures) {
      const image = picture.match(/<img\b[^>]*>/i)?.[0]
      if (!image || attribute(image, 'loading') === 'lazy') continue
      const source = picture.match(/<source\b[^>]*type=["']image\/webp["'][^>]*>/i)?.[0]
      const srcset = source ? attribute(source, 'srcset') : undefined
      const src = srcset?.split(',', 1)[0].trim().split(/\s+/, 1)[0] || attribute(image, 'src')
      const file = src ? localFile(distDir, src) : undefined
      if (file && existsSync(file)) initialImages += statSync(file).size
    }

    const htmlWithoutPictures = html.replace(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi, '')
    for (const tag of htmlWithoutPictures.match(/<img\b[^>]*>/gi) ?? []) {
      if (attribute(tag, 'loading') === 'lazy') continue
      const src = attribute(tag, 'src')
      const file = src ? localFile(distDir, src) : undefined
      if (file && existsSync(file)) initialImages += statSync(file).size
    }

    const result = {
      page,
      initialRequestCount: resourceUrls.length,
      javascriptGzip,
      cssGzip,
      initialImages,
    }
    report.pages.push(result)

    if (resourceUrls.length > budgets.initialRequests) {
      report.violations.push(`${page}: ${resourceUrls.length} initial requests exceed ${budgets.initialRequests}`)
    }
    if (javascriptGzip > budgets.javascriptGzip) {
      report.violations.push(`${page}: initial JavaScript exceeds ${budgets.javascriptGzip} bytes gzip`)
    }
    if (cssGzip > budgets.cssGzip) {
      report.violations.push(`${page}: initial CSS exceeds ${budgets.cssGzip} bytes gzip`)
    }
    if (initialImages > budgets.initialImages) {
      report.violations.push(`${page}: initial images exceed ${budgets.initialImages} bytes`)
    }
    if (resourceUrls.some((url) => /mermaid/i.test(url))) {
      report.violations.push(`${page}: Mermaid must not be preloaded`)
    }
  }

  return report
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = auditBuild(resolve('docs/.vitepress/dist'))
  for (const page of report.pages) {
    console.log(
      `${page.page}: ${page.initialRequestCount} initial resources, ` +
        `${page.javascriptGzip} B JS gzip, ${page.cssGzip} B CSS gzip, ${page.initialImages} B eager images`,
    )
  }
  if (report.violations.length) {
    for (const violation of report.violations) console.error(violation)
    process.exitCode = 1
  }
}
