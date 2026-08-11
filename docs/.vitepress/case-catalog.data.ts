import { resolve } from 'node:path'
import { createContentLoader } from 'vitepress'
import { assertCaseCatalogCovers } from './build-data-boundaries'
import { validateCaseCatalog } from './case-catalog'

export default createContentLoader('cases/submissions/*/index.md', {
  includeSrc: false,
  transform(raw) {
    const catalog = validateCaseCatalog(raw.map(({ url, frontmatter }) => ({
      route: url,
      title: frontmatter.title,
      date: frontmatter.date,
      productTag: frontmatter.productTag,
      category: frontmatter.category,
      outcome: frontmatter.outcome,
      cover: frontmatter.cover,
      coverAlt: frontmatter.coverAlt,
    })))
    assertCaseCatalogCovers(catalog, resolve('docs/public'))
    return catalog
  },
})

export declare const data: readonly import('./case-catalog').CaseCatalogItem[]
