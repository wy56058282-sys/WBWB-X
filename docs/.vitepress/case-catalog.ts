export interface CaseCatalogItem {
  route: string
  title: string
  date: string
  productTag: string
  category: string
  outcome: string
  cover: string
  coverAlt: string
}

const requiredFields: readonly (keyof CaseCatalogItem)[] = [
  'route',
  'title',
  'date',
  'productTag',
  'category',
  'outcome',
  'cover',
  'coverAlt',
]

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

function normalizedLocalPath(path: string) {
  let decoded = path

  for (let attempts = 0; attempts < 8; attempts += 1) {
    if (decoded.split('/').some((segment) => segment === '.' || segment === '..')) {
      return undefined
    }

    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) {
        return `/${decoded.split('/').filter(Boolean).join('/')}${decoded.endsWith('/') ? '/' : ''}`
      }
      decoded = next
    } catch {
      return undefined
    }
  }

  return undefined
}

export function validateCaseCatalogItem(input: unknown): CaseCatalogItem {
  if (!input || typeof input !== 'object') {
    throw new Error('case catalog item must be an object')
  }

  const item = input as Record<string, unknown>
  for (const field of requiredFields) {
    if (typeof item[field] !== 'string' || !item[field].trim()) {
      throw new Error(`${field} must be a non-empty string`)
    }
  }

  const validated = item as unknown as CaseCatalogItem
  if (!isIsoDate(validated.date)) {
    throw new Error('date must be a valid ISO date')
  }
  const normalizedRoute = normalizedLocalPath(validated.route)
  if (
    !/^\/cases\/submissions\/[^/]+\/$/.test(validated.route)
    || !normalizedRoute?.startsWith('/cases/submissions/')
  ) {
    throw new Error('route must be a /cases/submissions/ route')
  }

  const normalizedCover = normalizedLocalPath(validated.cover)
  if (
    !/^\/(?:article-assets|brand)\//.test(validated.cover)
    || !normalizedCover?.match(/^\/(?:article-assets|brand)\//)
  ) {
    throw new Error('cover must be a local cover under /article-assets/ or /brand/')
  }

  return validated
}

export function validateCaseCatalog(items: readonly unknown[]): readonly CaseCatalogItem[] {
  const routes = new Set<string>()

  return items.map((item) => {
    const validated = validateCaseCatalogItem(item)
    if (routes.has(validated.route)) {
      throw new Error(`duplicate route: ${validated.route}`)
    }
    routes.add(validated.route)
    return validated
  })
}

export function filterCaseCatalog(
  items: readonly CaseCatalogItem[],
  query: string,
  category: string,
) {
  const needle = query.trim().toLocaleLowerCase('zh-CN')
  return items.filter((item) => {
    const categoryMatches = category === '全部' || item.category === category
    const haystack = [item.title, item.outcome, item.category, item.productTag]
      .join('\n')
      .toLocaleLowerCase('zh-CN')
    return categoryMatches && (!needle || haystack.includes(needle))
  })
}

export function caseCategories(items: readonly CaseCatalogItem[]) {
  return [
    '全部',
    ...Array.from(new Set(items.map((item) => item.category)))
      .sort((left, right) => left.localeCompare(right, 'zh-CN')),
  ]
}
