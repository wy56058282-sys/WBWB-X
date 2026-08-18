import { readdir, stat } from 'node:fs/promises'
import { join, posix } from 'node:path'

export async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const filePath = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await filesUnder(filePath)))
    else files.push(filePath)
  }

  return files
}

export async function pathExists(path) {
  try {
    await stat(path)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

export function assertManagedPath(path, prefix, label) {
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

export function localPublicAssetPath(contentRoot, publicPath, prefix, label) {
  assertManagedPath(publicPath, prefix, label)
  return join(contentRoot, 'public', posix.relative('/', publicPath))
}

export function stagedCalibrationPath(stagedCalibrationRoot, publicPath) {
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

export function stagedReplacementPath(stagedReplacementRoot, publicPath) {
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
