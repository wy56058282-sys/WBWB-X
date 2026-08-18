import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { verifyPublishBoundary } from '../scripts/verify-publish-boundary.mjs'

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'publish-boundary-'))
  const dist = join(root, 'dist')
  const internalDocs = join(root, 'docs/superpowers')
  const maintenanceDocs = join(root, 'docs/maintenance')
  const searchIndex = join(
    dist,
    'assets/chunks/@localSearchIndexroot.fixture.js',
  )
  const searchLoader = join(dist, 'assets/chunks/VPLocalSearchBox.fixture.js')

  mkdirSync(dirname(searchIndex), { recursive: true })
  mkdirSync(internalDocs, { recursive: true })
  mkdirSync(maintenanceDocs, { recursive: true })
  writeFileSync(join(dist, 'index.html'), '<title>Public home</title>')
  writeFileSync(searchIndex, 'export default { public: "Public home" }')
  writeFileSync(
    searchLoader,
    'const index = () => import("./@localSearchIndexroot.fixture.js")',
  )
  writeFileSync(join(internalDocs, 'plan.md'), '# Internal Build Plan\n')
  writeFileSync(
    join(maintenanceDocs, 'guide.md'),
    '# Internal Maintenance Guide\n',
  )

  return { dist, internalDocs, maintenanceDocs, searchIndex, searchLoader }
}

describe('production content boundary', () => {
  it('provides a build-output verifier', () => {
    expect(verifyPublishBoundary).toBeTypeOf('function')
  })

  it('accepts output without internal routes or titles', () => {
    const fixture = createFixture()

    expect(() =>
      verifyPublishBoundary(
        fixture.dist,
        [fixture.internalDocs, fixture.maintenanceDocs],
      ),
    ).not.toThrow()
  })

  it('rejects a published superpowers directory', () => {
    const fixture = createFixture()
    mkdirSync(join(fixture.dist, 'superpowers'))

    expect(() =>
      verifyPublishBoundary(
        fixture.dist,
        [fixture.internalDocs, fixture.maintenanceDocs],
      ),
    ).toThrow(/superpowers directory/i)
  })

  it('rejects internal document titles in generated HTML', () => {
    const fixture = createFixture()
    writeFileSync(
      join(fixture.dist, 'leaked.html'),
      '<title>Internal Build Plan</title>',
    )

    expect(() =>
      verifyPublishBoundary(
        fixture.dist,
        [fixture.internalDocs, fixture.maintenanceDocs],
      ),
    ).toThrow(/HTML.*Internal Build Plan/i)
  })

  it('rejects internal document titles in the local search index', () => {
    const fixture = createFixture()
    writeFileSync(fixture.searchIndex, 'export default "Internal Build Plan"')

    expect(() =>
      verifyPublishBoundary(
        fixture.dist,
        [fixture.internalDocs, fixture.maintenanceDocs],
      ),
    ).toThrow(/search index.*Internal Build Plan/i)
  })

  it('rejects a missing local search index referenced by the build', () => {
    const fixture = createFixture()
    rmSync(fixture.searchIndex)

    expect(() =>
      verifyPublishBoundary(
        fixture.dist,
        [fixture.internalDocs, fixture.maintenanceDocs],
      ),
    ).toThrow(/search index.*missing/i)
  })

  it('checks a renamed local search index through its build reference', () => {
    const fixture = createFixture()
    const renamedIndex = join(dirname(fixture.searchIndex), 'private-search.data')
    renameSync(fixture.searchIndex, renamedIndex)
    writeFileSync(renamedIndex, 'export default "Internal Build Plan"')
    writeFileSync(
      fixture.searchLoader,
      'const index = () => import("./private-search.data")',
    )

    expect(() =>
      verifyPublishBoundary(
        fixture.dist,
        [fixture.internalDocs, fixture.maintenanceDocs],
      ),
    ).toThrow(/search index.*Internal Build Plan/i)
  })

  it('rejects a published maintenance directory', () => {
    const fixture = createFixture()
    mkdirSync(join(fixture.dist, 'maintenance'))

    expect(() => verifyPublishBoundary(
      fixture.dist,
      [fixture.internalDocs, fixture.maintenanceDocs],
    )).toThrow(/maintenance directory/i)
  })

  it('rejects maintenance titles in generated HTML', () => {
    const fixture = createFixture()
    writeFileSync(
      join(fixture.dist, 'leaked.html'),
      '<title>Internal Maintenance Guide</title>',
    )

    expect(() => verifyPublishBoundary(
      fixture.dist,
      [fixture.internalDocs, fixture.maintenanceDocs],
    )).toThrow(/HTML.*Internal Maintenance Guide/i)
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
