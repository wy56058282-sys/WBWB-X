import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { dirname, join, posix, relative, resolve } from 'node:path'

const repositoryRoot = process.cwd()
const contentRoot = join(repositoryRoot, 'docs')
const sourceDocsRoot = resolve(
  process.env.WORKBUDDY_SOURCE_DOCS ?? '/tmp/workbuddy-guide-source/docs',
)
const calibrationRoot = join(
  repositoryRoot,
  'docs',
  'public',
  'article-assets',
  'source-calibration',
)
const replacementRoot = join(
  repositoryRoot,
  'docs',
  'public',
  'article-assets',
  'replacements',
)
const jsonPath = join(
  repositoryRoot,
  'docs',
  '.vitepress',
  'image-manifest.generated.json',
)
const csvPath = join(repositoryRoot, 'article-image-replacement-manifest.csv')
const sourceOrigin = 'https://workbuddy.homes'

const manifestColumns = [
  'id',
  'page',
  'order',
  'purpose',
  'sourceUrl',
  'calibrationPath',
  'replacementPath',
  'sourceWidth',
  'sourceHeight',
  'format',
  'status',
]

const pageImagePattern =
  /(!\[([^\]]*)\]\()([^)\s]+)([^)]*\))|(<img\b[^>]*?\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi
const videoPattern =
  /(<video\b[^>]*?\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const filePath = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await filesUnder(filePath)))
    else files.push(filePath)
  }

  return files
}

function imageReferences(markdown) {
  return [...markdown.matchAll(pageImagePattern)].map((match) => {
    const type = match[1] ? 'markdown' : 'html'
    const target = match[3] ?? match[6]
    const htmlTag = type === 'html' ? `${match[5]}${target}${match[7]}` : ''
    return {
      alt:
        type === 'markdown'
          ? match[2]
          : htmlTag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? '',
      target,
      type,
    }
  })
}

function videoReferences(markdown) {
  return [...markdown.matchAll(videoPattern)].map((match) => match[2])
}

function pageDetails(markdownPath) {
  const relativePath = relative(contentRoot, markdownPath).split('/').join(posix.sep)
  const segments = relativePath.split('/')
  const chapterSegment = segments.find((segment) => /第\s*\d+\s*章/.test(segment))
  const appendixSegment = segments.find((segment) => /附录\s*[A-Z]/i.test(segment))

  if (chapterSegment) {
    const chapterNumber = Number(chapterSegment.match(/第\s*(\d+)\s*章/)[1])
    return {
      id: `ch${String(chapterNumber).padStart(2, '0')}`,
      sortOrder: chapterNumber,
    }
  }

  if (appendixSegment) {
    const appendixLetter = appendixSegment.match(/附录\s*([A-Z])/i)[1].toLowerCase()
    return {
      id: `appendix-${appendixLetter}`,
      sortOrder: 100 + appendixLetter.charCodeAt(0),
    }
  }

  if (relativePath === 'cases/index.md') {
    return { id: 'case-index', sortOrder: 1000 }
  }

  const caseSlug = relativePath.match(/^cases\/submissions\/([^/]+)\/index\.md$/)?.[1]
  if (caseSlug) {
    return { id: `case-${caseSlug}`, sortOrder: 1100 }
  }

  if (relativePath.startsWith('community/')) {
    return { id: 'community', sortOrder: 2000 }
  }

  if (relativePath.startsWith('help/')) {
    return { id: 'help', sortOrder: 3000 }
  }

  return {
    id: null,
    sortOrder: Number.POSITIVE_INFINITY,
  }
}

function sourceAssetPath(sourceMarkdownPath, sourceTarget) {
  const decodedTarget = decodeURIComponent(sourceTarget.split(/[?#]/, 1)[0])
    .replaceAll('\\', '/')
  const sourcePath = decodedTarget.startsWith('/')
    ? resolve(sourceDocsRoot, 'public', decodedTarget.slice(1))
    : resolve(dirname(sourceMarkdownPath), decodedTarget)
  const sourceRootPrefix = `${sourceDocsRoot}/`

  if (!sourcePath.startsWith(sourceRootPrefix)) {
    throw new Error(`Source image escapes the authorized docs root: ${sourceTarget}`)
  }

  return sourcePath
}

function sourceAssetUrl(sourcePath) {
  const sourceRelativePath = relative(sourceDocsRoot, sourcePath)
    .split('/')
    .join(posix.sep)
    .replace(/^public\//, '')
  return `${sourceOrigin}/${encodeURI(sourceRelativePath)}`
}

function publicPage(markdownPath) {
  const route = relative(join(repositoryRoot, 'docs'), markdownPath)
    .split('/')
    .join(posix.sep)
    .replace(/(?:^|\/)index\.md$/, '')
    .replace(/\.md$/, '')

  return `/${route}${route ? '/' : ''}`
}

function imageFormat(buffer, filePath) {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (buffer.subarray(0, pngSignature.length).equals(pngSignature)) return 'png'
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
    return 'gif'
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpg'
  throw new Error(`Unsupported article image format: ${filePath}`)
}

function imageDimensions(buffer, format, filePath) {
  if (format === 'png') {
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    if (!buffer.subarray(0, signature.length).equals(signature)) {
      throw new Error(`Invalid PNG calibration source: ${filePath}`)
    }
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]
  }

  if (format === 'gif') {
    if (!['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
      throw new Error(`Invalid GIF calibration source: ${filePath}`)
    }
    return [buffer.readUInt16LE(6), buffer.readUInt16LE(8)]
  }

  if (format === 'jpg') {
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
      throw new Error(`Invalid JPEG calibration source: ${filePath}`)
    }

    const startOfFrameMarkers = new Set([
      0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
      0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ])
    let offset = 2

    while (offset < buffer.length) {
      while (buffer[offset] === 0xff) offset += 1
      const marker = buffer[offset]
      offset += 1

      if (marker === 0xd8 || marker === 0xd9) continue
      if (offset + 1 >= buffer.length) break

      const segmentLength = buffer.readUInt16BE(offset)
      if (startOfFrameMarkers.has(marker)) {
        return [
          buffer.readUInt16BE(offset + 5),
          buffer.readUInt16BE(offset + 3),
        ]
      }
      offset += segmentLength
    }
  }

  throw new Error(`Could not read image dimensions: ${filePath}`)
}

function purposeFor(pageTitle, alt, order) {
  return alt.trim() || `${pageTitle} — image ${order}`
}

function csvCell(value) {
  if (value === null) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function csvFor(records) {
  const columns = [...manifestColumns, 'notes']
  const rows = [
    columns,
    ...records.map((record) => [
      ...manifestColumns.map((column) => record[column]),
      '',
    ]),
  ]
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}

await rm(calibrationRoot, { recursive: true, force: true })
await mkdir(calibrationRoot, { recursive: true })
await mkdir(replacementRoot, { recursive: true })

const markdownFiles = (await filesUnder(contentRoot))
  .filter((filePath) => filePath.endsWith('.md'))
  .map((filePath) => ({ filePath, ...pageDetails(filePath) }))
  .sort(
    (left, right) =>
      left.sortOrder - right.sortOrder
      || left.filePath.localeCompare(right.filePath, 'en'),
  )

const records = []
const prefixCounters = new Map()
const recordsBySourcePath = new Map()
const mediaDependencies = []

for (const { filePath: markdownPath, id: pagePrefix } of markdownFiles) {
  const currentMarkdown = await readFile(markdownPath, 'utf8')
  const currentReferences = imageReferences(currentMarkdown)
  if (currentReferences.length === 0) continue
  if (!pagePrefix) {
    throw new Error(`Cannot derive a stable chapter ID for ${markdownPath}`)
  }

  const pageRelativePath = relative(contentRoot, markdownPath)
  const sourceMarkdownPath = join(sourceDocsRoot, pageRelativePath)
  const sourceMarkdown = await readFile(sourceMarkdownPath, 'utf8')
  const sourceReferences = imageReferences(sourceMarkdown)

  if (currentReferences.length !== sourceReferences.length) {
    throw new Error(
      `${markdownPath} has ${currentReferences.length} images; source has ${sourceReferences.length}`,
    )
  }

  const pageTitle =
    currentMarkdown.match(/^#\s+(.+)$/m)?.[1].trim()
    ?? pagePrefix
  let rewrittenMarkdown = currentMarkdown
  let referenceIndex = 0
  const hrefReplacements = new Map()

  rewrittenMarkdown = rewrittenMarkdown.replace(
    pageImagePattern,
    (
      match,
      markdownPrefix,
      markdownAlt,
      markdownTarget,
      markdownSuffix,
      htmlPrefix,
      htmlTarget,
      htmlSuffix,
    ) => {
      const currentReference = currentReferences[referenceIndex]
      const sourceReference = sourceReferences[referenceIndex]
      referenceIndex += 1
      const currentTarget = markdownTarget ?? htmlTarget
      const prefix = markdownPrefix ?? htmlPrefix
      const suffix = markdownSuffix ?? htmlSuffix

      if (
        currentReference.type !== sourceReference.type
        || currentReference.alt !== sourceReference.alt
      ) {
        throw new Error(
          `${markdownPath} image ${referenceIndex} caption or markup type differs from the authorized source`,
        )
      }

      const sourcePath = sourceAssetPath(sourceMarkdownPath, sourceReference.target)
      let record = recordsBySourcePath.get(sourcePath)

      if (!record) {
        const order = (prefixCounters.get(pagePrefix) ?? 0) + 1
        prefixCounters.set(pagePrefix, order)
        const stableOrder = String(order).padStart(3, '0')
        const sourceBuffer = readFileSync(sourcePath)
        const format = imageFormat(sourceBuffer, sourcePath)
        const [sourceWidth, sourceHeight] = imageDimensions(
          sourceBuffer,
          format,
          sourcePath,
        )
        const fileName = `${stableOrder}.${format}`
        const calibrationPath =
          `/article-assets/source-calibration/${pagePrefix}/${fileName}`
        const replacementPath =
          `/article-assets/replacements/${pagePrefix}/${fileName}`

        record = {
          id: `${pagePrefix}-${stableOrder}`,
          page: publicPage(markdownPath),
          order,
          purpose: purposeFor(pageTitle, sourceReference.alt, order),
          sourceUrl: sourceAssetUrl(sourcePath),
          calibrationPath,
          replacementPath,
          sourceWidth,
          sourceHeight,
          format,
          status: 'awaiting-replacement',
          sourcePath,
        }
        records.push(record)
        recordsBySourcePath.set(sourcePath, record)
      }

      if (
        currentTarget !== sourceReference.target
        && currentTarget !== record.calibrationPath
      ) {
        throw new Error(
          `${markdownPath} image ${referenceIndex} is out of source order: ${currentTarget}`,
        )
      }

      hrefReplacements.set(currentTarget, record.calibrationPath)
      hrefReplacements.set(sourceReference.target, record.calibrationPath)
      return `${prefix}${record.calibrationPath}${suffix}`
    },
  )

  rewrittenMarkdown = rewrittenMarkdown.replace(
    /(<a\b[^>]*?\bhref\s*=\s*)(["'])([^"']+)(\2)/gi,
    (match, prefix, quote, target, suffix) => {
      const replacement = hrefReplacements.get(target)
      return replacement
        ? `${prefix}${quote}${replacement}${suffix}`
        : match
    },
  )

  const currentVideos = videoReferences(currentMarkdown)
  const sourceVideos = videoReferences(sourceMarkdown)
  if (currentVideos.length !== sourceVideos.length) {
    throw new Error(
      `${markdownPath} has ${currentVideos.length} videos; source has ${sourceVideos.length}`,
    )
  }

  let videoIndex = 0
  rewrittenMarkdown = rewrittenMarkdown.replace(
    videoPattern,
    (match, prefix, currentTarget, suffix) => {
      const sourceTarget = sourceVideos[videoIndex]
      const sourcePath = sourceAssetPath(sourceMarkdownPath, sourceTarget)
      const localPath =
        `/article-assets/source-calibration/${pagePrefix}/video-${String(videoIndex + 1).padStart(3, '0')}.mp4`

      if (currentTarget !== sourceTarget && currentTarget !== localPath) {
        throw new Error(
          `${markdownPath} video ${videoIndex + 1} is out of source order: ${currentTarget}`,
        )
      }

      mediaDependencies.push({ sourcePath, localPath })
      videoIndex += 1
      return `${prefix}${localPath}${suffix}`
    },
  )

  if (rewrittenMarkdown !== currentMarkdown) {
    await writeFile(markdownPath, rewrittenMarkdown)
  }
}

const seenIds = new Set()
const seenSourceUrls = new Set()

for (const record of records) {
  if (seenIds.has(record.id)) throw new Error(`Duplicate manifest ID: ${record.id}`)
  if (seenSourceUrls.has(record.sourceUrl)) {
    throw new Error(`Duplicate source image: ${record.sourceUrl}`)
  }
  seenIds.add(record.id)
  seenSourceUrls.add(record.sourceUrl)

  const calibrationFile = join(repositoryRoot, 'docs', 'public', record.calibrationPath)
  const replacementDirectory = dirname(
    join(repositoryRoot, 'docs', 'public', record.replacementPath),
  )

  await mkdir(dirname(calibrationFile), { recursive: true })
  await cp(record.sourcePath, calibrationFile)
  await mkdir(replacementDirectory, { recursive: true })
  await writeFile(join(replacementDirectory, '.gitkeep'), '')

  delete record.sourcePath
}

for (const media of mediaDependencies) {
  const calibrationFile = join(repositoryRoot, 'docs', 'public', media.localPath)
  await mkdir(dirname(calibrationFile), { recursive: true })
  await cp(media.sourcePath, calibrationFile)
}

await writeFile(jsonPath, `${JSON.stringify(records, null, 2)}\n`)
await writeFile(csvPath, csvFor(records))

console.log(
  `Generated ${records.length} article image records, ${mediaDependencies.length} supporting media files, calibration assets, and replacement slots.`,
)
