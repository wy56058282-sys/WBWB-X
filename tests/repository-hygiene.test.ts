import { describe, expect, it } from 'vitest'
import {
  checkRepositoryHygiene,
  findRepositoryHygieneViolations,
} from '../scripts/check-repository-hygiene.mjs'

describe('repository hygiene rules', () => {
  it('reports every required maintenance or source file that is absent', () => {
    expect(findRepositoryHygieneViolations(['pnpm-lock.yaml'], new Set([
      'pnpm-lock.yaml',
    ]))).toEqual([
      'required repository file is missing: README.md',
      'required repository file is missing: docs/maintenance/README.md',
      'required repository file is missing: docs/maintenance/repository-layout.md',
      'required repository file is missing: docs/maintenance/assets-and-audits.md',
      'required repository file is missing: docs/maintenance/future-optimizations.md',
      'required repository file is missing: WB-X LOGO.svg',
      'required repository file is missing: 二维码.png',
      'required repository file is missing: article-image-replacement-manifest.csv',
    ])
  })

  it('accepts pnpm-owned source and dated audit evidence', () => {
    expect(findRepositoryHygieneViolations([
      'package.json',
      'pnpm-lock.yaml',
      'audit/README.md',
      'audit/2026-08-17-online-baseline-sync/wb-x-desktop.png',
      'audit/archive/source-assets/WB-X-LOGO-legacy.png',
    ])).toEqual([])
  })

  it('rejects generated roots, duplicate locks, and loose audit files', () => {
    expect(findRepositoryHygieneViolations([
      '.pnpm-store/v11/index/00/example',
      '.tools/bin/gh',
      '.qoder/report.json',
      'package-lock.json',
      'audit/loose.png',
    ])).toEqual([
      'tracked local/generated path: .pnpm-store/v11/index/00/example',
      'tracked local/generated path: .qoder/report.json',
      'tracked local/generated path: .tools/bin/gh',
      'audit evidence must use a dated topic or archive directory: audit/loose.png',
      'duplicate package-manager lockfile: package-lock.json',
    ])
  })

  it.each([
    ['.pnpm-store', '.pnpm-store/v11/index/00/example'],
    ['.qoder', '.qoder/report.json'],
    ['.tools', '.tools/bin/gh'],
    ['.vercel', '.vercel/output/config.json'],
    ['.vercel-tmp', '.vercel-tmp/cache.json'],
    ['node_modules', 'node_modules/package/index.js'],
    ['node_modules.preview-backup', 'node_modules.preview-backup/package/index.js'],
  ])('rejects blocked root %s and its descendants', (root, descendant) => {
    expect(findRepositoryHygieneViolations([root, descendant])).toEqual([
      `tracked local/generated path: ${root}`,
      `tracked local/generated path: ${descendant}`,
    ])
  })

  it.each([
    'package-lock.json',
    'npm-shrinkwrap.json',
    'yarn.lock',
  ])('rejects duplicate package-manager lockfile %s', (path) => {
    expect(findRepositoryHygieneViolations([path])).toEqual([
      `duplicate package-manager lockfile: ${path}`,
    ])
  })
})

describe('current repository hygiene', () => {
  it('tracks only governed project files', () => {
    expect(checkRepositoryHygiene()).toEqual([])
  })
})
