import type { Plugin } from 'vite'

export function legacyRouteTarget(path: string) {
  if (!path.startsWith('/bluebook/')) return null
  return `/wb-x/${path.slice('/bluebook/'.length)}`
}

export function legacyRouteRedirectPlugin(): Plugin {
  return {
    name: 'workbuddy-legacy-route-redirect',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const target = legacyRouteTarget(request.url ?? '')
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
