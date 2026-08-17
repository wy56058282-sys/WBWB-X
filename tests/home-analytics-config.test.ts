import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Umami tracker configuration', () => {
  it('injects the tracker only from public configuration', () => {
    const source = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(source).toContain('VITE_WBX_UMAMI_WEBSITE_ID')
    expect(source).toContain('VITE_WBX_UMAMI_SHARE_URL')
    expect(source).toContain('VITE_WBX_UMAMI_COLLECTION_STARTED_AT')
    expect(source).toContain('umamiWebsiteId && umamiShareUrl && umamiCollectionStartedAt')
    expect(source).toContain('...(umamiTrackingEnabled')
    expect(source).toContain('https://cloud.umami.is/analytics/eu/script.js')
    expect(source).toContain("'data-website-id'")
    expect(source).not.toMatch(/api[_-]?key|authorization/i)
  })
})
