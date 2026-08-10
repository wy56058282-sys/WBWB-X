import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { legacyRouteTarget } from '../docs/.vitepress/legacy-routes'
import {
  generateLegacyRedirects,
  legacyTargetForBuiltFile,
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
      '/wb-x/第一篇/第 1 章/',
    )
    expect(legacyTargetForBuiltFile('cases/index.html')).toBeNull()
  })

  it('writes static bluebook redirects without touching other output', () => {
    const dist = mkdtempSync(join(tmpdir(), 'wbx-legacy-'))
    const built = join(dist, 'wb-x/第一篇/第 1 章/index.html')
    mkdirSync(dirname(built), { recursive: true })
    writeFileSync(built, '<!doctype html><title>chapter</title>')

    const written = generateLegacyRedirects(dist)
    const redirect = join(dist, 'bluebook/第一篇/第 1 章/index.html')

    expect(written).toContain(redirect)
    expect(readFileSync(redirect, 'utf8')).toContain('/wb-x/第一篇/第 1 章/')
    expect(readFileSync(redirect, 'utf8')).toContain('location.search + location.hash')
    expect(readFileSync(built, 'utf8')).toContain('<title>chapter</title>')
  })
})
