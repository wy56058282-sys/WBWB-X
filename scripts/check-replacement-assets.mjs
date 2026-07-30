import { readdir, readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join } from 'node:path'

const brandConfig = await readFile('docs/.vitepress/brand.ts', 'utf8')
const sourceOrigin = 'https://workbuddy.homes/'
const textExtensions = new Set(['.md', '.vue', '.css', '.ts', '.json'])
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const failures = []

function publicAssetPath(key) {
  const match = brandConfig.match(new RegExp(`${key}:\\s*'(/[^']+)'`))
  if (!match) {
    failures.push(`Missing ${key} in docs/.vitepress/brand.ts`)
    return undefined
  }
  return `docs/public${match[1]}`
}

const logoPath = publicAssetPath('logoPath')
const qrPath = publicAssetPath('qrPath')

for (const requiredPath of [logoPath, qrPath]) {
  if (!requiredPath || !existsSync(requiredPath)) {
    failures.push(`Missing required asset: ${requiredPath}`)
  }
}

if (qrPath && existsSync(qrPath)) {
  const qr = await readFile(qrPath)
  if (!qr.subarray(0, pngSignature.length).equals(pngSignature)) {
    failures.push(`QR asset is not a PNG: ${qrPath}`)
  }
}

async function filesUnder(directory) {
  const entries = await readdir(directory)
  const files = []

  for (const entry of entries) {
    const filePath = join(directory, entry)
    const details = await stat(filePath)
    if (details.isDirectory()) files.push(...(await filesUnder(filePath)))
    else if (textExtensions.has(extname(filePath))) files.push(filePath)
  }

  return files
}

function isAssetReference(line) {
  return /!\[[^\]]*\]\(/.test(line)
    || /\b(?:src|srcset)\s*[:=]/.test(line)
    || /<(?:link|use|image|script|source|video|audio|object|embed)\b[^>]*(?:href|xlink:href)\s*=/.test(line)
    || /\burl\(/.test(line)
    || /\bimport\b.*['"]https:\/\/workbuddy\.homes\//.test(line)
}

function isSourceAttribution(line) {
  return /source attribution/i.test(line)
}

function isHyperlink(line) {
  return /<a\b[^>]*\b:?(?:href)\s*=/.test(line)
}

for (const filePath of await filesUnder('docs')) {
  const contents = await readFile(filePath, 'utf8')
  for (const [index, line] of contents.split(/\r?\n/).entries()) {
    if (
      line.includes(sourceOrigin)
      && (isAssetReference(line) || (isHyperlink(line) && !isSourceAttribution(line)))
    ) {
      failures.push(`${filePath}:${index + 1} hotlinks a replacement asset from ${sourceOrigin}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log('Approved replacement assets are present and contain no source hotlinks.')
}
