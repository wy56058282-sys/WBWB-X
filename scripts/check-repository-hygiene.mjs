import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const blockedTrackedRoots = [
  '.pnpm-store/',
  '.qoder/',
  '.tools/',
  '.vercel/',
  '.vercel-tmp/',
  'node_modules/',
  'node_modules.preview-backup/',
]

const duplicateLockfiles = new Set([
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
])

const requiredRepositoryPaths = [
  'pnpm-lock.yaml',
  'README.md',
  'docs/maintenance/README.md',
  'docs/maintenance/repository-layout.md',
  'docs/maintenance/assets-and-audits.md',
  'docs/maintenance/future-optimizations.md',
  'WB-X LOGO.svg',
  '二维码.png',
  'article-image-replacement-manifest.csv',
]

function isGovernedAuditPath(path) {
  return path === 'audit/README.md'
    || /^audit\/\d{4}-\d{2}-\d{2}-[^/]+\/.+/.test(path)
    || /^audit\/archive\/[^/]+\/.+/.test(path)
}

function isBlockedTrackedPath(path) {
  return blockedTrackedRoots.some((root) => (
    path === root.slice(0, -1) || path.startsWith(root)
  ))
}

export function findRepositoryHygieneViolations(
  trackedPaths,
  existingPaths,
) {
  const violations = []
  for (const path of [...trackedPaths].sort()) {
    if (isBlockedTrackedPath(path)) {
      violations.push(`tracked local/generated path: ${path}`)
    }
    if (duplicateLockfiles.has(path)) {
      violations.push(`duplicate package-manager lockfile: ${path}`)
    }
    if (path.startsWith('audit/') && !isGovernedAuditPath(path)) {
      violations.push(
        `audit evidence must use a dated topic or archive directory: ${path}`,
      )
    }
  }
  if (existingPaths) {
    for (const path of requiredRepositoryPaths) {
      if (!existingPaths.has(path)) {
        violations.push(`required repository file is missing: ${path}`)
      }
    }
  }
  return violations
}

function trackedPaths(repositoryRoot) {
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'git ls-files failed')
  }
  return result.stdout.split('\0').filter(Boolean)
}

export function checkRepositoryHygiene(repositoryRoot = process.cwd()) {
  const paths = trackedPaths(repositoryRoot)
  return findRepositoryHygieneViolations(paths, new Set(paths))
}

if (
  process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const violations = checkRepositoryHygiene()
  if (violations.length > 0) {
    console.error(violations.map((item) => `- ${item}`).join('\n'))
    process.exitCode = 1
  } else {
    console.log('Repository hygiene checks passed.')
  }
}
