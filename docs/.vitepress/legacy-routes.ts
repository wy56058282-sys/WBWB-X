import type { Plugin } from 'vite'

const readingGuideRoute = /^\/(?:guide\/)?reading-guide\/?([?#].*)?$/
const retiredHelpRoute = /^\/help\/?([?#].*)?$/
const retiredAboutRoute = /^\/about\/?(?:\?([^#]*))?(?:#.*)?$/

function normalizeBase(base: string) {
  const normalized = base.replace(/^\/+|\/+$/g, '')
  return normalized ? `/${normalized}/` : '/'
}

function pathWithinBase(path: string, base: string) {
  if (base === '/') return path

  const basePrefix = base.slice(0, -1)
  return path.startsWith(`${basePrefix}/`) ? path.slice(basePrefix.length) : null
}

function withBase(base: string, path: string) {
  return base === '/' ? path : `${base.slice(0, -1)}${path}`
}

export function legacyRouteTarget(path: string, base = '/') {
  const normalizedBase = normalizeBase(base)
  const basePath = pathWithinBase(path, normalizedBase)
  if (!basePath) return null

  const readingGuideMatch = basePath.match(readingGuideRoute)
  if (readingGuideMatch) {
    return withBase(
      normalizedBase,
      `/wb-x/reading-guide/${readingGuideMatch[1] ?? ''}`,
    )
  }

  const retiredHelpMatch = basePath.match(retiredHelpRoute)
  if (retiredHelpMatch) {
    return withBase(normalizedBase, `/tools/${retiredHelpMatch[1] ?? ''}`)
  }

  const retiredAboutMatch = basePath.match(retiredAboutRoute)
  if (retiredAboutMatch) {
    const search = retiredAboutMatch[1] ? `?${retiredAboutMatch[1]}` : ''
    return withBase(normalizedBase, `/services/${search}#team`)
  }

  if (!basePath.startsWith('/bluebook/')) return null
  return withBase(
    normalizedBase,
    `/wb-x/${basePath.slice('/bluebook/'.length)}`,
  )
}

export function legacyRouteRedirectPlugin(): Plugin {
  return {
    name: 'workbuddy-legacy-route-redirect',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const target = legacyRouteTarget(request.url ?? '', server.config.base)
        if (!target) {
          next()
          return
        }

        response.statusCode = 302
        response.setHeader('Location', target)
        response.end()
      })
    },
  }
}
