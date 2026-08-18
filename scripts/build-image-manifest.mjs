import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { dirname, join, posix, relative, resolve } from 'node:path'
import {
  csvColumns,
  csvFor,
  parseCsv,
} from './lib/image-manifest/csv.mjs'
import {
  imageDimensions,
  imageFormat,
  imageReferences,
  pageImagePattern,
  purposeFor,
  videoPattern,
  videoReferences,
} from './lib/image-manifest/media.mjs'

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

const allowedStatuses = new Set([
  'awaiting-replacement',
  'replaced',
  'approved',
])
const userProvidedSourcePattern =
  /^user-provided:\/\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:png|jpg|gif)$/


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

async function pathExists(path) {
  try {
    await stat(path)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

function assertManagedPath(path, prefix, label) {
  const relativePath = posix.relative(prefix, path)
  if (
    !path.startsWith('/')
    || relativePath === ''
    || relativePath.startsWith('..')
    || posix.isAbsolute(relativePath)
  ) {
    throw new Error(`${label} escapes ${prefix}: ${path}`)
  }
}

function localPublicAssetPath(publicPath, prefix, label) {
  assertManagedPath(publicPath, prefix, label)
  return join(contentRoot, 'public', posix.relative('/', publicPath))
}

function supplementalRecordsForPage(
  page,
  pagePrefix,
  { manifestById, csvById },
) {
  return [...manifestById.values()]
    .filter(
      (record) =>
        record.page === page
        && userProvidedSourcePattern.test(record.sourceUrl ?? ''),
    )
    .map((record) => {
      if (!new RegExp(`^${pagePrefix}-\\d{3}$`).test(record.id)) {
        throw new Error(`Invalid user-provided image ID for ${page}: ${record.id}`)
      }

      const existingCsv = csvById.get(record.id)
      if (existingCsv && existingCsv.sourceUrl !== record.sourceUrl) {
        throw new Error(
          `Conflicting user-provided provenance for ${record.id}: ${existingCsv.sourceUrl}`,
        )
      }

      const sourcePath = localPublicAssetPath(
        record.calibrationPath,
        '/article-assets/source-calibration',
        `User-provided calibration path for ${record.id}`,
      )
      const sourceBuffer = readFileSync(sourcePath)
      const format = imageFormat(sourceBuffer, sourcePath)
      const [sourceWidth, sourceHeight] = imageDimensions(
        sourceBuffer,
        format,
        sourcePath,
      )
      if (
        record.format !== format
        || record.sourceWidth !== sourceWidth
        || record.sourceHeight !== sourceHeight
      ) {
        throw new Error(`User-provided image metadata mismatch for ${record.id}`)
      }
      const stableOrder = record.id.slice(pagePrefix.length + 1)
      const expectedCalibrationPath =
        `/article-assets/source-calibration/${pagePrefix}/${stableOrder}.${format}`
      if (record.calibrationPath !== expectedCalibrationPath) {
        throw new Error(`User-provided calibration format/path mismatch for ${record.id}`)
      }
      if (!record.sourceUrl.endsWith(`.${format}`)) {
        throw new Error(`User-provided provenance format mismatch for ${record.id}`)
      }

      const preservedState = preservedWorkflowState(
        record,
        record.replacementPath,
        { manifestById, csvById },
      )
      return {
        ...record,
        status: preservedState.status,
        replacementPath: preservedState.replacementPath,
        sourcePath,
        generatedReplacementPath: record.replacementPath,
        notes: preservedState.notes,
      }
    })
}

async function loadWorkflowState() {
  const manifestById = new Map()
  const csvById = new Map()

  if (await pathExists(jsonPath)) {
    const existingManifest = JSON.parse(await readFile(jsonPath, 'utf8'))
    if (!Array.isArray(existingManifest)) {
      throw new Error(`Existing image manifest must be an array: ${jsonPath}`)
    }
    for (const record of existingManifest) {
      if (!record?.id || manifestById.has(record.id)) {
        throw new Error(`Invalid or duplicate existing manifest ID: ${record?.id}`)
      }
      manifestById.set(record.id, record)
    }
  }

  if (await pathExists(csvPath)) {
    const rows = parseCsv(await readFile(csvPath, 'utf8'), csvPath)
    const [header, ...dataRows] = rows
    if (JSON.stringify(header) !== JSON.stringify(csvColumns)) {
      throw new Error(`Existing CSV columns do not match the manifest schema: ${csvPath}`)
    }

    for (const row of dataRows) {
      if (row.length !== csvColumns.length) {
        throw new Error(`Existing CSV row has ${row.length} columns in ${csvPath}`)
      }
      const record = Object.fromEntries(
        csvColumns.map((column, index) => [column, row[index]]),
      )
      if (!record.id || csvById.has(record.id)) {
        throw new Error(`Invalid or duplicate existing CSV ID: ${record.id}`)
      }
      csvById.set(record.id, record)
    }
  }

  return { manifestById, csvById }
}

function preservedWorkflowState(
  record,
  defaultReplacementPath,
  { manifestById, csvById },
) {
  const existingManifest = manifestById.get(record.id)
  const existingCsv = csvById.get(record.id)
  const statusCandidates = [existingManifest?.status, existingCsv?.status]
    .filter((status) => status && status !== 'awaiting-replacement')

  for (const status of statusCandidates) {
    if (!allowedStatuses.has(status)) {
      throw new Error(`Invalid preserved status for ${record.id}: ${status}`)
    }
  }
  const distinctStatuses = [...new Set(statusCandidates)]
  if (distinctStatuses.length > 1) {
    throw new Error(
      `Conflicting preserved statuses for ${record.id}: ${distinctStatuses.join(', ')}`,
    )
  }

  const replacementCandidates = [
    existingManifest?.replacementPath,
    existingCsv?.replacementPath,
  ].filter(Boolean)
  for (const replacementPath of replacementCandidates) {
    assertManagedPath(
      replacementPath,
      '/article-assets/replacements',
      `Preserved replacement path for ${record.id}`,
    )
  }
  const customReplacementPaths = [
    ...new Set(
      replacementCandidates.filter(
        (replacementPath) => replacementPath !== defaultReplacementPath,
      ),
    ),
  ]
  if (customReplacementPaths.length > 1) {
    throw new Error(
      `Conflicting preserved replacement paths for ${record.id}: ${customReplacementPaths.join(', ')}`,
    )
  }

  return {
    status: distinctStatuses[0] ?? 'awaiting-replacement',
    replacementPath: customReplacementPaths[0] ?? defaultReplacementPath,
    notes: existingCsv?.notes ?? '',
  }
}

function stagedCalibrationPath(stagedCalibrationRoot, publicPath) {
  assertManagedPath(
    publicPath,
    '/article-assets/source-calibration',
    'Calibration path',
  )
  return join(
    stagedCalibrationRoot,
    posix.relative('/article-assets/source-calibration', publicPath),
  )
}

function stagedReplacementPath(stagedReplacementRoot, publicPath) {
  assertManagedPath(
    publicPath,
    '/article-assets/replacements',
    'Replacement path',
  )
  return join(
    stagedReplacementRoot,
    posix.relative('/article-assets/replacements', publicPath),
  )
}

async function replaceCandidatesAtomically(candidates, stagingRoot) {
  const backupRoot = join(stagingRoot, 'backups')
  await mkdir(backupRoot, { recursive: true })
  const applied = []

  try {
    for (const [index, { candidate, target }] of candidates.entries()) {
      await mkdir(dirname(target), { recursive: true })
      const backup = join(backupRoot, String(index))
      const hadTarget = await pathExists(target)
      if (hadTarget) await rename(target, backup)

      try {
        await rename(candidate, target)
      } catch (error) {
        if (hadTarget) await rename(backup, target)
        throw error
      }
      applied.push({ backup, hadTarget, target })
    }
  } catch (error) {
    for (const { backup, hadTarget, target } of applied.reverse()) {
      await rm(target, { recursive: true, force: true })
      if (hadTarget) await rename(backup, target)
    }
    throw error
  }
}

const sourceRootStats = await stat(sourceDocsRoot)
if (!sourceRootStats.isDirectory()) {
  throw new Error(`Source docs root is not a directory: ${sourceDocsRoot}`)
}

const workflowState = await loadWorkflowState()
const stagingRoot = await mkdtemp(join(repositoryRoot, '.image-manifest-staging-'))
const stagedCalibrationRoot = join(stagingRoot, 'source-calibration')
const stagedReplacementRoot = join(stagingRoot, 'replacements')
const stagedJsonPath = join(stagingRoot, 'image-manifest.generated.json')
const stagedCsvPath = join(stagingRoot, 'article-image-replacement-manifest.csv')

try {
  await mkdir(stagedCalibrationRoot, { recursive: true })
  if (await pathExists(replacementRoot)) {
    await cp(replacementRoot, stagedReplacementRoot, { recursive: true })
  } else {
    await mkdir(stagedReplacementRoot, { recursive: true })
  }

  const markdownFiles = (await filesUnder(contentRoot))
    .filter((filePath) => filePath.endsWith('.md'))
    .map((filePath) => ({ filePath, ...pageDetails(filePath) }))
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder
        || left.filePath.localeCompare(right.filePath, 'en'),
    )

  const records = []
  const sourcePrefixCounters = new Map()
  const pageOrderCounters = new Map()
  const recordsBySourcePath = new Map()
  const mediaDependencies = []
  const markdownCandidates = []
  const notesById = new Map()

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

    const pageTitle =
      currentMarkdown.match(/^#\s+(.+)$/m)?.[1].trim()
      ?? pagePrefix
    const page = publicPage(markdownPath)
    const supplementalRecords = supplementalRecordsForPage(
      page,
      pagePrefix,
      workflowState,
    )
    const supplementalByTarget = new Map()
    for (const record of supplementalRecords) {
      for (const target of [record.calibrationPath, record.replacementPath]) {
        if (supplementalByTarget.has(target)) {
          throw new Error(`Duplicate user-provided image target: ${target}`)
        }
        supplementalByTarget.set(target, record)
      }
    }
    const usedSupplementalIds = new Set()
    let rewrittenMarkdown = currentMarkdown
    let referenceIndex = 0
    let sourceReferenceIndex = 0
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
        referenceIndex += 1
        const currentTarget = markdownTarget ?? htmlTarget
        const prefix = markdownPrefix ?? htmlPrefix
        const suffix = markdownSuffix ?? htmlSuffix
        const supplementalRecord = supplementalByTarget.get(currentTarget)

        if (supplementalRecord) {
          if (!usedSupplementalIds.has(supplementalRecord.id)) {
            const order = (pageOrderCounters.get(pagePrefix) ?? 0) + 1
            pageOrderCounters.set(pagePrefix, order)
            const record = { ...supplementalRecord, order }
            notesById.set(record.id, record.notes)
            delete record.notes
            records.push(record)
            usedSupplementalIds.add(record.id)
          }

          const renderedPath =
            supplementalRecord.status === 'awaiting-replacement'
              ? supplementalRecord.calibrationPath
              : supplementalRecord.replacementPath
          hrefReplacements.set(supplementalRecord.calibrationPath, renderedPath)
          hrefReplacements.set(supplementalRecord.replacementPath, renderedPath)
          return `${prefix}${renderedPath}${suffix}`
        }

        const sourceReference = sourceReferences[sourceReferenceIndex]
        sourceReferenceIndex += 1
        if (!sourceReference) {
          throw new Error(
            `${markdownPath} image ${referenceIndex} is not an authorized source or preserved user-provided image: ${currentTarget}`,
          )
        }

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
          const sourceOrder = (sourcePrefixCounters.get(pagePrefix) ?? 0) + 1
          sourcePrefixCounters.set(pagePrefix, sourceOrder)
          const order = (pageOrderCounters.get(pagePrefix) ?? 0) + 1
          pageOrderCounters.set(pagePrefix, order)
          const stableOrder = String(sourceOrder).padStart(3, '0')
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
            page,
            order,
            purpose: purposeFor(pageTitle, sourceReference.alt, sourceOrder),
            sourceUrl: sourceAssetUrl(sourcePath),
            calibrationPath,
            replacementPath,
            sourceWidth,
            sourceHeight,
            format,
            status: 'awaiting-replacement',
            sourcePath,
            generatedReplacementPath: replacementPath,
          }
          const preservedState = preservedWorkflowState(
            record,
            replacementPath,
            workflowState,
          )
          record.status = preservedState.status
          record.replacementPath = preservedState.replacementPath
          notesById.set(record.id, preservedState.notes)
          records.push(record)
          recordsBySourcePath.set(sourcePath, record)
        }

        const validCurrentTargets = new Set([
          sourceReference.target,
          record.calibrationPath,
          record.generatedReplacementPath,
          record.replacementPath,
        ])
        if (!validCurrentTargets.has(currentTarget)) {
          throw new Error(
            `${markdownPath} image ${referenceIndex} is out of source order: ${currentTarget}`,
          )
        }

        const renderedPath =
          record.status === 'awaiting-replacement'
            ? record.calibrationPath
            : record.replacementPath
        for (const target of validCurrentTargets) {
          hrefReplacements.set(target, renderedPath)
        }
        return `${prefix}${renderedPath}${suffix}`
      },
    )

    if (sourceReferenceIndex !== sourceReferences.length) {
      throw new Error(
        `${markdownPath} has ${sourceReferenceIndex} authorized images; source has ${sourceReferences.length}`,
      )
    }
    if (usedSupplementalIds.size !== supplementalRecords.length) {
      const missingIds = supplementalRecords
        .filter((record) => !usedSupplementalIds.has(record.id))
        .map((record) => record.id)
      throw new Error(
        `${markdownPath} is missing preserved user-provided images: ${missingIds.join(', ')}`,
      )
    }

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
      markdownCandidates.push({
        contents: rewrittenMarkdown,
        target: markdownPath,
      })
    }
  }

  const seenIds = new Set()
  const seenSourceUrls = new Set()
  const seenCalibrationPaths = new Set()
  const seenReplacementPaths = new Set()

  if (records.length === 0) {
    throw new Error('Generated image manifest must contain at least one record')
  }

  for (const record of records) {
    if (seenIds.has(record.id)) throw new Error(`Duplicate manifest ID: ${record.id}`)
    if (seenSourceUrls.has(record.sourceUrl)) {
      throw new Error(`Duplicate source image: ${record.sourceUrl}`)
    }
    if (seenCalibrationPaths.has(record.calibrationPath)) {
      throw new Error(`Duplicate calibration path: ${record.calibrationPath}`)
    }

    assertManagedPath(
      record.calibrationPath,
      '/article-assets/source-calibration',
      `Calibration path for ${record.id}`,
    )
    assertManagedPath(
      record.replacementPath,
      '/article-assets/replacements',
      `Replacement path for ${record.id}`,
    )
    if (!record.calibrationPath.endsWith(`.${record.format}`)) {
      throw new Error(`Calibration format/path mismatch for ${record.id}`)
    }
    if (!allowedStatuses.has(record.status)) {
      throw new Error(`Invalid manifest status for ${record.id}: ${record.status}`)
    }
    if (seenReplacementPaths.has(record.replacementPath)) {
      throw new Error(`Duplicate replacement path: ${record.replacementPath}`)
    }

    seenIds.add(record.id)
    seenSourceUrls.add(record.sourceUrl)
    seenCalibrationPaths.add(record.calibrationPath)
    seenReplacementPaths.add(record.replacementPath)

    const calibrationFile = stagedCalibrationPath(
      stagedCalibrationRoot,
      record.calibrationPath,
    )
    await mkdir(dirname(calibrationFile), { recursive: true })
    await cp(record.sourcePath, calibrationFile)
    delete record.sourcePath
    delete record.generatedReplacementPath
  }

  const seenMediaPaths = new Set()
  for (const media of mediaDependencies) {
    if (seenCalibrationPaths.has(media.localPath) || seenMediaPaths.has(media.localPath)) {
      throw new Error(`Duplicate supporting media path: ${media.localPath}`)
    }
    seenMediaPaths.add(media.localPath)
    const calibrationFile = stagedCalibrationPath(
      stagedCalibrationRoot,
      media.localPath,
    )
    await mkdir(dirname(calibrationFile), { recursive: true })
    await cp(media.sourcePath, calibrationFile)
  }

  const stagedCalibrationFiles = await filesUnder(stagedCalibrationRoot)
  const expectedCalibrationFiles = records.length + mediaDependencies.length
  if (stagedCalibrationFiles.length !== expectedCalibrationFiles) {
    throw new Error(
      `Staged ${stagedCalibrationFiles.length} calibration files; expected ${expectedCalibrationFiles}`,
    )
  }

  const stagedJson = `${JSON.stringify(records, null, 2)}\n`
  const stagedCsv = csvFor(records, notesById)
  await writeFile(stagedJsonPath, stagedJson)
  await writeFile(stagedCsvPath, stagedCsv)

  const validatedJson = JSON.parse(await readFile(stagedJsonPath, 'utf8'))
  if (!Array.isArray(validatedJson) || validatedJson.length !== records.length) {
    throw new Error('Staged JSON record count does not match generated records')
  }
  const validatedCsvRows = parseCsv(
    await readFile(stagedCsvPath, 'utf8'),
    stagedCsvPath,
  )
  if (validatedCsvRows.length !== records.length + 1) {
    throw new Error('Staged CSV row count does not match generated records')
  }

  const atomicCandidates = [
    { candidate: stagedCalibrationRoot, target: calibrationRoot },
    { candidate: stagedReplacementRoot, target: replacementRoot },
    { candidate: stagedJsonPath, target: jsonPath },
    { candidate: stagedCsvPath, target: csvPath },
  ]
  for (const [index, markdown] of markdownCandidates.entries()) {
    const markdownRelativePath = relative(contentRoot, markdown.target)
    if (
      markdownRelativePath.startsWith('..')
      || posix.isAbsolute(markdownRelativePath)
    ) {
      throw new Error(`Markdown candidate escapes docs root: ${markdown.target}`)
    }
    const candidate = join(stagingRoot, 'markdown', String(index))
    await mkdir(dirname(candidate), { recursive: true })
    await writeFile(candidate, markdown.contents)
    atomicCandidates.push({ candidate, target: markdown.target })
  }

  for (const record of records) {
    const replacementDirectory = dirname(
      stagedReplacementPath(stagedReplacementRoot, record.replacementPath),
    )
    await mkdir(replacementDirectory, { recursive: true })
    await writeFile(join(replacementDirectory, '.gitkeep'), '', { flag: 'a' })
  }

  await replaceCandidatesAtomically(atomicCandidates, stagingRoot)

  console.log(
    `Generated ${records.length} article image records, ${mediaDependencies.length} supporting media files, calibration assets, and replacement slots.`,
  )
} finally {
  await rm(stagingRoot, { recursive: true, force: true })
}
