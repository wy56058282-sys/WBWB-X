import { describe, expect, it } from 'vitest'
import {
  enterpriseCaseCatalog,
  enterpriseFunctions,
  enterpriseIndustries,
  filterEnterpriseCaseCatalog,
} from '../docs/.vitepress/enterprise-case-catalog'

describe('enterprise case catalog', () => {
  it('contains the expected public directory boundaries', () => {
    expect(enterpriseCaseCatalog.filter((item) => item.kind === 'scene')).toHaveLength(100)
    expect(enterpriseCaseCatalog.filter((item) => item.kind === 'case')).toHaveLength(100)
    expect(enterpriseIndustries).toHaveLength(16)
    expect(enterpriseFunctions).toHaveLength(9)
    expect(enterpriseCaseCatalog.every((item) => item.access === 'locked')).toBe(true)
  })

  it('combines dataset, industry, function and search filters', () => {
    const item = enterpriseCaseCatalog.find((entry) => entry.kind === 'scene')!
    const results = filterEnterpriseCaseCatalog(
      enterpriseCaseCatalog,
      'scene',
      item.title.slice(0, 4),
      item.industry,
      item.function,
    )
    expect(results).toContainEqual(item)
    expect(results.every((entry) => entry.kind === 'scene')).toBe(true)
  })
})
