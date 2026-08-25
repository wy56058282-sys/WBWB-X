function withTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`
}

function stripBase(path: string, base: string) {
  const normalizedPath = withTrailingSlash(path)
  const normalizedBase = withTrailingSlash(base)

  if (normalizedBase === '/') return normalizedPath
  if (!normalizedPath.startsWith(normalizedBase)) return normalizedPath

  return `/${normalizedPath.slice(normalizedBase.length)}`
}

export function isHomeRoute(path: string, base: string) {
  return withTrailingSlash(path) === withTrailingSlash(base)
}

export function isReadingRoute(path: string, base: string) {
  const route = stripBase(path, base)
  return route.startsWith('/wb-x/') || route.startsWith('/opc/')
}

export function isCaseIndexRoute(path: string, base: string) {
  return stripBase(path, base) === '/cases/'
}

export function isCaseContributionRoute(path: string, base: string) {
  return stripBase(path, base) === '/community/case-contributing/'
}

export function isCaseDetailRoute(path: string, base: string) {
  return stripBase(path, base).startsWith('/cases/submissions/')
}
