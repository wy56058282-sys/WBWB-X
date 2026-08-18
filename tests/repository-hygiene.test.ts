import { describe, expect, it } from 'vitest'
import { findRepositoryHygieneViolations } from '../scripts/check-repository-hygiene.mjs'

describe('repository hygiene rules', () => {
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
})
