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
import type { ServiceChannelConfig } from '../docs/.vitepress/service-config'
import {
  assertCaseCatalogCovers,
  assertServiceChannelAssets,
} from '../docs/.vitepress/build-data-boundaries'

const configuredChannels: ServiceChannelConfig = {
  businessWechatQrPath: '/article-assets/service/business-wechat.png',
  applicationFormUrl: 'https://forms.example.com/diagnosis',
  enterpriseChannelQrPath: '/article-assets/service/enterprise-channel.png',
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
  it('allows empty channel placeholders without requiring QR assets', () => {
    const { publicRoot } = makePublicRoot()

    expect(() => assertServiceChannelAssets({
      businessWechatQrPath: '',
      applicationFormUrl: '',
      enterpriseChannelQrPath: '',
    }, publicRoot)).not.toThrow()
  })

  it('requires each configured local QR asset to be a supported image below article-assets', () => {
    const { publicRoot } = makePublicRoot()
    writeAsset(publicRoot, configuredChannels.businessWechatQrPath)
    writeAsset(publicRoot, configuredChannels.enterpriseChannelQrPath)

    expect(() => assertServiceChannelAssets(configuredChannels, publicRoot)).not.toThrow()

    expect(() => assertServiceChannelAssets({
      ...configuredChannels,
      businessWechatQrPath: '/article-assets/service/missing.png',
    }, publicRoot)).toThrow(/business WeChat QR/i)

    expect(() => assertServiceChannelAssets({
      ...configuredChannels,
      enterpriseChannelQrPath: '/article-assets/service/enterprise-channel.gif',
    }, publicRoot)).toThrow(/enterprise channel QR/i)
  })

  it('rejects configured QR symlinks that resolve outside article-assets', () => {
    const { publicRoot, root } = makePublicRoot()
    writeAsset(publicRoot, configuredChannels.enterpriseChannelQrPath)
    const outside = join(root, 'outside.png')
    writeFileSync(outside, 'outside')
    const link = join(publicRoot, 'article-assets/service/business-wechat.png')
    mkdirSync(dirname(link), { recursive: true })
    symlinkSync(outside, link)

    expect(() => assertServiceChannelAssets(configuredChannels, publicRoot)).toThrow(/business WeChat QR/i)
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

  it('wires channel asset validation into the structured VitePress build boundary', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    const catalogLoader = readFileSync('docs/.vitepress/case-catalog.data.ts', 'utf8')

    expect(config).toContain('assertServiceChannelAssets(serviceConfig')
    expect(catalogLoader).toContain('assertCaseCatalogCovers(catalog')
  })
})
