function withTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`
}

export function isHomeRoute(path: string, base: string) {
  return withTrailingSlash(path) === withTrailingSlash(base)
}
