import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { legacyRouteTarget } from '../docs/.vitepress/legacy-routes'
import {
  generateLegacyRedirects,
  legacyTargetForBuiltFile,
  writeLegacyMappings,
} from '../scripts/generate-legacy-redirects.mjs'

describe('legacy small-book routes', () => {
  it('redirects the overview and nested chapter paths to /wb-x/', () => {
    expect(legacyRouteTarget('/bluebook/')).toBe('/wb-x/')
    expect(legacyRouteTarget('/bluebook/第一篇/第 1 章/?from=old#开始')).toBe(
      '/wb-x/第一篇/第 1 章/?from=old#开始',
    )
  })

  it('leaves unrelated routes unchanged', () => {
    expect(legacyRouteTarget('/cases/')).toBeNull()
    expect(legacyRouteTarget('/bluebookish/')).toBeNull()
  })

  it('maps only built wb-x HTML files to clean public targets', () => {
    expect(legacyTargetForBuiltFile('wb-x/index.html')).toBe('/wb-x/')
    expect(legacyTargetForBuiltFile('wb-x/第一篇/第 1 章/index.html')).toBe(
      '/wb-x/%E7%AC%AC%E4%B8%80%E7%AF%87/%E7%AC%AC%201%20%E7%AB%A0/',
    )
    expect(legacyTargetForBuiltFile('wb-x/index 2.html')).toBe(
      '/wb-x/index%202.html',
    )
    expect(legacyTargetForBuiltFile('cases/index.html')).toBeNull()
  })

  it('rejects dot segments and safely encodes reserved URL characters', () => {
    expect(legacyTargetForBuiltFile('wb-x/../index.html')).toBeNull()
    expect(legacyTargetForBuiltFile('wb-x/%2e%2e/index.html')).toBeNull()
    expect(legacyTargetForBuiltFile('wb-x/%252e%252e/index.html')).toBeNull()
    expect(
      legacyTargetForBuiltFile('wb-x/%252e%252e%252fsecret/index.html'),
    ).toBeNull()
    expect(
      legacyTargetForBuiltFile('wb-x/%252e%252e%255csecret/index.html'),
    ).toBeNull()
    expect(legacyTargetForBuiltFile('wb-x/safe%252fsecret/index.html')).toBeNull()
    expect(legacyTargetForBuiltFile('wb-x/safe%255csecret/index.html')).toBeNull()
    expect(legacyTargetForBuiltFile('wb-x/draft?from=old#start/index.html')).toBe(
      '/wb-x/draft%3Ffrom%3Dold%23start/',
    )
  })

  it('writes one static redirect for every built wb-x HTML file', () => {
    const dist = mkdtempSync(join(tmpdir(), 'wbx-legacy-'))
    const root = join(dist, 'wb-x/index.html')
    const built = join(dist, 'wb-x/第一篇/第 1 章/index.html')
    mkdirSync(dirname(built), { recursive: true })
    writeFileSync(root, '<!doctype html><title>root</title>')
    writeFileSync(built, '<!doctype html><title>chapter</title>')

    const written = generateLegacyRedirects(dist)
    const rootRedirect = join(dist, 'bluebook/index.html')
    const redirect = join(dist, 'bluebook/第一篇/第 1 章/index.html')

    expect(written).toHaveLength(2)
    expect(written).toEqual(expect.arrayContaining([rootRedirect, redirect]))
    expect(readFileSync(rootRedirect, 'utf8')).toContain('/wb-x/')
    expect(readFileSync(redirect, 'utf8')).toContain(
      '/wb-x/%E7%AC%AC%E4%B8%80%E7%AF%87/%E7%AC%AC%201%20%E7%AB%A0/',
    )
    expect(readFileSync(redirect, 'utf8')).toContain('location.search + location.hash')
    expect(readFileSync(built, 'utf8')).toContain('<title>chapter</title>')
  })

  it('fails when the wb-x build root is missing or empty', () => {
    const missing = mkdtempSync(join(tmpdir(), 'wbx-legacy-missing-'))
    expect(() => generateLegacyRedirects(missing)).toThrow(/wb-x build root is missing/)

    const empty = mkdtempSync(join(tmpdir(), 'wbx-legacy-empty-'))
    mkdirSync(join(empty, 'wb-x'))
    expect(() => generateLegacyRedirects(empty)).toThrow(/no wb-x HTML files/)

    const rootless = mkdtempSync(join(tmpdir(), 'wbx-legacy-rootless-'))
    const nested = join(rootless, 'wb-x/chapter/index.html')
    mkdirSync(dirname(nested), { recursive: true })
    writeFileSync(nested, '<!doctype html><title>chapter</title>')
    expect(() => generateLegacyRedirects(rootless)).toThrow(/wb-x root page is missing/)
  })

  it('fails before writing when a built source cannot map one-to-one', () => {
    const dist = mkdtempSync(join(tmpdir(), 'wbx-legacy-invalid-'))
    const root = join(dist, 'wb-x/index.html')
    const unsafe = join(dist, 'wb-x/%2e%2e/index.html')
    mkdirSync(dirname(unsafe), { recursive: true })
    writeFileSync(root, '<!doctype html><title>root</title>')
    writeFileSync(unsafe, '<!doctype html><title>unsafe</title>')

    expect(() => generateLegacyRedirects(dist)).toThrow(/one-to-one legacy mapping/)
    expect(() => readFileSync(join(dist, 'bluebook/index.html'))).toThrow()
  })

  it('rejects empty, incomplete, or duplicate mappings before writing', () => {
    const dist = mkdtempSync(join(tmpdir(), 'wbx-legacy-preflight-'))
    const legacyRoot = join(dist, 'bluebook')
    const redirectPath = join(legacyRoot, 'index.html')
    const mapping = { redirectPath, target: '/wb-x/' }

    expect(() => writeLegacyMappings([], legacyRoot, 1)).toThrow(/non-empty/)
    expect(() => writeLegacyMappings([mapping], legacyRoot, 2)).toThrow(/count/)
    expect(() =>
      writeLegacyMappings([mapping, mapping], legacyRoot, 2),
    ).toThrow(/unique/)
    expect(() => readFileSync(redirectPath)).toThrow()
  })

  it('rejects an out-of-root mapping before writing valid siblings', () => {
    const dist = mkdtempSync(join(tmpdir(), 'wbx-legacy-boundary-'))
    const legacyRoot = join(dist, 'bluebook')
    const inside = join(legacyRoot, 'index.html')
    const outside = join(dist, 'outside.html')
    const mappings = [
      { redirectPath: inside, target: '/wb-x/' },
      { redirectPath: outside, target: '/wb-x/outside.html' },
    ]

    expect(() => writeLegacyMappings(mappings, legacyRoot, 2)).toThrow(
      /beneath the legacy root/,
    )
    expect(() => readFileSync(inside)).toThrow()
    expect(() => readFileSync(outside)).toThrow()
  })
})
