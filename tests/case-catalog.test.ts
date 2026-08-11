import { describe, expect, it } from 'vitest'
import {
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

  it('rejects invalid dates, routes, covers, and duplicate routes', () => {
    expect(() => validateCaseCatalogItem({ ...validItem, date: '2026-02-30' })).toThrow(/date/)
    expect(() => validateCaseCatalogItem({ ...validItem, route: '/cases/other/' })).toThrow(/route/)
    expect(() => validateCaseCatalogItem({ ...validItem, cover: '/images/cover.png' })).toThrow(/cover/)
    expect(() => validateCaseCatalog([validItem, validItem])).toThrow(/duplicate route/)
  })
})

describe('case catalog discovery helpers', () => {
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
