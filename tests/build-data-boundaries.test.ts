import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { CaseCatalogItem } from '../docs/.vitepress/case-catalog'
import type { ServiceConfig } from '../docs/.vitepress/service-config'
import {
  assertCaseCatalogCovers,
  assertPaidServiceAsset,
} from '../docs/.vitepress/build-data-boundaries'

const readyConfig: ServiceConfig = {
  freeCaseFormUrl: 'https://forms.example.com/free',
  paidDiagnosticFormUrl: 'https://forms.example.com/paid',
  paymentQrPath: '/article-assets/service/payment.png',
  confirmationWindow: '1 个工作日内确认',
  supportContact: 'support@example.com',
}

const validCase: CaseCatalogItem = {
  route: '/cases/submissions/example/',
  title: '示例案例',
  date: '2026-08-12',
  productTag: 'WorkBuddy',
  category: '自动化',
  outcome: '完成可验证的自动化结果。',
  cover: '/article-assets/cases/example.png',
  coverAlt: '示例案例结果界面',
}

const roots: string[] = []

function makePublicRoot() {
  const root = mkdtempSync(join(tmpdir(), 'wbx-build-boundary-'))
  roots.push(root)
  const publicRoot = join(root, 'docs/public')
  mkdirSync(join(publicRoot, 'article-assets'), { recursive: true })
  return { publicRoot, root }
}

function writeAsset(publicRoot: string, assetPath: string) {
  const filePath = join(publicRoot, assetPath.slice(1))
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, 'fixture')
  return filePath
}

afterEach(() => {
  roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }))
})

describe('structured build data boundaries', () => {
  it('provides file-backed service and catalog asset validators', async () => {
    const boundaryModule = '../docs/.vitepress/build-data-boundaries'
    const boundaries = await import(/* @vite-ignore */ boundaryModule).catch(() => undefined)

    expect(boundaries).toBeDefined()
  })

  it('accepts a ready paid service only when its QR is a regular supported image below article-assets', () => {
    const { publicRoot } = makePublicRoot()
    writeAsset(publicRoot, readyConfig.paymentQrPath)

    expect(() => assertPaidServiceAsset(readyConfig, publicRoot)).not.toThrow()

    for (const paymentQrPath of [
      '/article-assets/service/missing.png',
      '/article-assets/service/payment.gif',
    ]) {
      expect(
        () => assertPaidServiceAsset({ ...readyConfig, paymentQrPath }, publicRoot),
        paymentQrPath,
      ).toThrow(/payment QR/i)
    }

    mkdirSync(join(publicRoot, 'article-assets/service/directory.png'), { recursive: true })
    expect(() => assertPaidServiceAsset({
      ...readyConfig,
      paymentQrPath: '/article-assets/service/directory.png',
    }, publicRoot)).toThrow(/payment QR/i)
  })

  it('rejects a paid QR symlink that resolves outside article-assets', () => {
    const { publicRoot, root } = makePublicRoot()
    const outside = join(root, 'outside.png')
    writeFileSync(outside, 'outside')
    const link = join(publicRoot, 'article-assets/service/payment.png')
    mkdirSync(dirname(link), { recursive: true })
    symlinkSync(outside, link)

    expect(() => assertPaidServiceAsset(readyConfig, publicRoot)).toThrow(/payment QR/i)
  })

  it('does not require a QR file while the paid service remains closed', () => {
    const { publicRoot } = makePublicRoot()

    expect(() => assertPaidServiceAsset({ ...readyConfig, freeCaseFormUrl: '' }, publicRoot)).not.toThrow()
  })

  it('requires every catalog cover to resolve to a regular file below docs/public', () => {
    const { publicRoot } = makePublicRoot()
    writeAsset(publicRoot, validCase.cover)

    expect(() => assertCaseCatalogCovers([validCase], publicRoot)).not.toThrow()
    expect(() => assertCaseCatalogCovers([
      { ...validCase, cover: '/article-assets/cases/missing.png' },
    ], publicRoot)).toThrow(/cover/i)

    mkdirSync(join(publicRoot, 'article-assets/cases/directory.png'), { recursive: true })
    expect(() => assertCaseCatalogCovers([
      { ...validCase, cover: '/article-assets/cases/directory.png' },
    ], publicRoot)).toThrow(/cover/i)
  })

  it('wires both validators into their structured VitePress build boundaries', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    const catalogLoader = readFileSync('docs/.vitepress/case-catalog.data.ts', 'utf8')

    expect(config).toContain('assertPaidServiceAsset(serviceConfig')
    expect(catalogLoader).toContain('assertCaseCatalogCovers(catalog')
  })
})
