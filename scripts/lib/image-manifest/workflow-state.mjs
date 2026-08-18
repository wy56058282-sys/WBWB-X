import { readFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import {
  csvColumns,
  parseCsv,
} from './csv.mjs'
import {
  imageDimensions,
  imageFormat,
} from './media.mjs'
import {
  assertManagedPath,
  localPublicAssetPath,
  pathExists,
} from './paths.mjs'

export const allowedStatuses = new Set([
  'awaiting-replacement',
  'replaced',
  'approved',
])
export const userProvidedSourcePattern =
  /^user-provided:\/\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:png|jpg|gif)$/

export function supplementalRecordsForPage({
  page,
  pagePrefix,
  workflowState,
  contentRoot,
}) {
  const { manifestById, csvById } = workflowState
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
        contentRoot,
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

export async function loadWorkflowState({ jsonPath, csvPath }) {
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

export function preservedWorkflowState(
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
