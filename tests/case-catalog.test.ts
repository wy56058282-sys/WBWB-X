import { describe, expect, it } from 'vitest'
import {
  caseCoverOptimizedPath,
  caseCategories,
  filterCaseCatalog,
  validateCaseCatalog,
  validateCaseCatalogItem,
  type CaseCatalogItem,
} from '../docs/.vitepress/case-catalog'

const validItem: CaseCatalogItem = {
  route: '/cases/submissions/wechat-ima-knowledge/',
  title: '微信知识库',
  date: '2026-07-14',
  productTag: 'WorkBuddy+ima',
  category: '知识管理',
  outcome: '将微信收藏整理为可检索的知识体系。',
  cover: '/article-assets/source-calibration/case-wechat-ima-knowledge/001.jpg',
  coverAlt: 'ima 知识库中的微信内容整理界面',
}

const items: readonly CaseCatalogItem[] = [
  {
    ...validItem,
    route: '/cases/submissions/tea-shop-sales-analysis/',
    title: 'Excel 门店分析',
    date: '2026-07-24',
    productTag: 'WorkBuddy',
    category: '数据分析',
    outcome: '将 119 份 Excel 汇总为运营看板。',
  },
  {
    ...validItem,
    route: '/cases/submissions/wechat-ima-knowledge/',
    title: 'WorkBuddy+ima 知识体系',
    category: '内容创作',
  },
]

describe('case catalog validation', () => {
  it('returns a valid catalog item unchanged', () => {
    expect(validateCaseCatalogItem(validItem)).toEqual(validItem)
  })

  it('rejects a missing outcome', () => {
    expect(() => validateCaseCatalogItem({ ...validItem, outcome: '' })).toThrow(/outcome/)
  })

  it('rejects a remote cover URL', () => {
    expect(() => validateCaseCatalogItem({
      ...validItem,
      cover: 'https://example.com/x.png',
    })).toThrow(/local cover/)
  })

  it('rejects categories outside the approved catalog taxonomy', () => {
    expect(() => validateCaseCatalogItem({
      ...validItem,
      category: '客户服务',
    })).toThrow(/category/)
  })

  it('rejects invalid dates, routes, covers, and duplicate routes', () => {
    expect(() => validateCaseCatalogItem({ ...validItem, date: '2026-02-30' })).toThrow(/date/)
    expect(() => validateCaseCatalogItem({ ...validItem, route: '/cases/other/' })).toThrow(/route/)
    expect(() => validateCaseCatalogItem({ ...validItem, cover: '/images/cover.png' })).toThrow(/cover/)
    expect(() => validateCaseCatalog([validItem, validItem])).toThrow(/duplicate route/)
  })

  it('rejects literal, encoded, and repeatedly encoded dot path segments', () => {
    for (const route of [
      '/cases/submissions/./',
      '/cases/submissions/../',
      '/cases/submissions/%2e/',
      '/cases/submissions/%2e%2e/',
      '/cases/submissions/%252e/',
      '/cases/submissions/%252e%252e/',
    ]) {
      expect(() => validateCaseCatalogItem({ ...validItem, route })).toThrow(/route/)
    }

    for (const cover of [
      '/article-assets/./cover.png',
      '/article-assets/../outside.png',
      '/article-assets/%2e/cover.png',
      '/article-assets/%2e%2e/outside.png',
      '/article-assets/%252e/cover.png',
      '/article-assets/%252e%252e/outside.png',
    ]) {
      expect(() => validateCaseCatalogItem({ ...validItem, cover })).toThrow(/cover/)
    }
  })

  it('allows legal Chinese and space-containing paths', () => {
    const item = {
      ...validItem,
      route: '/cases/submissions/中文 案例/',
      cover: '/article-assets/中文 资源/案例封面.png',
    }

    expect(validateCaseCatalogItem(item)).toEqual(item)
  })
})

describe('case catalog discovery helpers', () => {
  it('derives a WebP card image path without replacing the source cover', () => {
    expect(caseCoverOptimizedPath('/article-assets/cases/cover.png'))
      .toBe('/article-assets/cases/cover-card.webp')
    expect(caseCoverOptimizedPath('/article-assets/cases/cover.jpg'))
      .toBe('/article-assets/cases/cover-card.webp')
  })

  it('lists all first and sorts categories', () => {
    expect(caseCategories(items)).toEqual(['全部', '内容创作', '数据分析'])
  })

  it('filters catalog content case-insensitively across searchable fields', () => {
    expect(filterCaseCatalog(items, 'workbuddy+ima', '全部').map((item) => item.route)).toEqual([
      '/cases/submissions/wechat-ima-knowledge/',
    ])
    expect(filterCaseCatalog(items, '  excel  ', '数据分析')).toHaveLength(1)
  })
})
