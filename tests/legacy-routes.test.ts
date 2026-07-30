import { describe, expect, it } from 'vitest'
import { legacyRouteTarget } from '../docs/.vitepress/legacy-routes'

describe('legacy small-book routes', () => {
  it('redirects the overview and nested chapter paths to /wb-x/', () => {
    expect(legacyRouteTarget('/bluebook/')).toBe('/wb-x/')
    expect(legacyRouteTarget('/bluebook/第一篇/第 1 章/?from=old#开始')).toBe(
      '/wb-x/第一篇/第 1 章/?from=old#开始',
    )
  })

  it('leaves unrelated routes unchanged', () => {
    expect(legacyRouteTarget('/cases/')).toBeNull()
    expect(legacyRouteTarget('/bluebookish/')).toBeNull()
  })
})
