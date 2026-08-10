import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { verifyPublishBoundary } from '../scripts/verify-publish-boundary.mjs'

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'publish-boundary-'))
  const dist = join(root, 'dist')
  const internalDocs = join(root, 'docs/superpowers')
  const searchIndex = join(
    dist,
    'assets/chunks/@localSearchIndexroot.fixture.js',
  )

  mkdirSync(dirname(searchIndex), { recursive: true })
  mkdirSync(internalDocs, { recursive: true })
  writeFileSync(join(dist, 'index.html'), '<title>Public home</title>')
  writeFileSync(searchIndex, 'export default { public: "Public home" }')
  writeFileSync(join(internalDocs, 'plan.md'), '# Internal Build Plan\n')

  return { dist, internalDocs, searchIndex }
}

describe('production content boundary', () => {
  it('provides a build-output verifier', () => {
    expect(verifyPublishBoundary).toBeTypeOf('function')
  })

  it('accepts output without internal routes or titles', () => {
    const fixture = createFixture()

    expect(() =>
      verifyPublishBoundary(fixture.dist, fixture.internalDocs),
    ).not.toThrow()
  })

  it('rejects a published superpowers directory', () => {
    const fixture = createFixture()
    mkdirSync(join(fixture.dist, 'superpowers'))

    expect(() =>
      verifyPublishBoundary(fixture.dist, fixture.internalDocs),
    ).toThrow(/superpowers directory/i)
  })

  it('rejects internal document titles in generated HTML', () => {
    const fixture = createFixture()
    writeFileSync(
      join(fixture.dist, 'leaked.html'),
      '<title>Internal Build Plan</title>',
    )

    expect(() =>
      verifyPublishBoundary(fixture.dist, fixture.internalDocs),
    ).toThrow(/HTML.*Internal Build Plan/i)
  })

  it('rejects internal document titles in the local search index', () => {
    const fixture = createFixture()
    writeFileSync(fixture.searchIndex, 'export default "Internal Build Plan"')

    expect(() =>
      verifyPublishBoundary(fixture.dist, fixture.internalDocs),
    ).toThrow(/search index.*Internal Build Plan/i)
  })

  it('runs the verifier after building pages and legacy redirects', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const buildSteps = packageJson.scripts.build.split(/\s*&&\s*/)

    expect(buildSteps).toEqual([
      'vitepress build docs',
      'node scripts/generate-legacy-redirects.mjs',
      'node scripts/verify-publish-boundary.mjs',
    ])
  })
})
