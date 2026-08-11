import { createContentLoader } from 'vitepress'
import { validateCaseCatalog } from './case-catalog'

export default createContentLoader('cases/submissions/*/index.md', {
  includeSrc: false,
  transform(raw) {
    return validateCaseCatalog(raw.map(({ url, frontmatter }) => ({
      route: url,
      title: frontmatter.title,
      date: frontmatter.date,
      productTag: frontmatter.productTag,
      category: frontmatter.category,
      outcome: frontmatter.outcome,
      cover: frontmatter.cover,
      coverAlt: frontmatter.coverAlt,
    })))
  },
})

export declare const data: readonly import('./case-catalog').CaseCatalogItem[]
