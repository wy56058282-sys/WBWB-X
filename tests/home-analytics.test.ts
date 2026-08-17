import { describe, expect, it, vi } from 'vitest'
import {
  fetchHomeAnalytics,
  readHomeAnalyticsConfig,
  shanghaiRanges,
} from '../docs/.vitepress/theme/homeAnalytics'

const config = {
  websiteId: '7bb7a8f2-f824-4f57-9c09-eab234e1ca7a',
  shareUrl: 'https://cloud.umami.is/share/AtTXJRYYYLCttEw2',
  collectionStartedAt: Date.parse('2026-08-12T00:00:00+08:00'),
}

describe('home analytics adapter', () => {
  it('reads only complete public configuration', () => {
    expect(readHomeAnalyticsConfig({})).toBeNull()
    expect(readHomeAnalyticsConfig({
      VITE_WBX_UMAMI_WEBSITE_ID: config.websiteId,
      VITE_WBX_UMAMI_SHARE_URL: config.shareUrl,
      VITE_WBX_UMAMI_COLLECTION_STARTED_AT: '2026-08-12T00:00:00+08:00',
    })).toEqual(config)
  })

  it('uses Asia/Shanghai day boundaries', () => {
    const now = new Date('2026-08-12T14:30:00+08:00')
    expect(shanghaiRanges(now, config.collectionStartedAt)).toEqual({
      today: { startAt: Date.parse('2026-08-12T00:00:00+08:00'), endAt: now.getTime() },
      lifetime: { startAt: config.collectionStartedAt, endAt: now.getTime() },
    })
  })

  it('exchanges the public slug and returns validated stats', async () => {
    const now = new Date('2026-08-12T14:30:00+08:00')
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'public-share-token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ visits: 12, pageviews: 34 })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ visits: 56, pageviews: 78 })))

    await expect(fetchHomeAnalytics(config, { fetchImpl, now })).resolves.toEqual({
      todayVisits: 12,
      todayPageviews: 34,
      lifetimeVisits: 56,
      lifetimePageviews: 78,
      fetchedAt: now.getTime(),
    })

    const calls = fetchImpl.mock.calls
    expect(calls[0][0]).toBe('https://cloud.umami.is/analytics/eu/api/share/AtTXJRYYYLCttEw2')
    for (const [url, init] of calls) {
      expect(String(url)).not.toMatch(/api[_-]?key|authorization/i)
      expect(JSON.stringify(init ?? {})).not.toMatch(/api[_-]?key|authorization/i)
    }
    expect(calls[1][1].headers).toEqual({
      'x-umami-share-context': '1',
      'x-umami-share-token': 'public-share-token',
    })
  })

  it.each([
    { visits: '1', pageviews: 2 },
    { visits: -1, pageviews: 2 },
    { visits: 1.2, pageviews: 2 },
    { visits: 1 },
  ])('rejects malformed stats %#', async (payload) => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'public' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(payload)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ visits: 1, pageviews: 2 })))
    await expect(fetchHomeAnalytics(config, { fetchImpl })).rejects.toThrow()
  })

  it('rejects non-2xx responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('', { status: 500 }))
    await expect(fetchHomeAnalytics(config, { fetchImpl })).rejects.toThrow('Umami')
  })
})
