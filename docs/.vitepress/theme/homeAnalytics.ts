export interface HomeAnalyticsConfig {
  websiteId: string
  shareUrl: string
  collectionStartedAt: number
}

export interface HomeAnalyticsSnapshot {
  todayVisits: number
  todayPageviews: number
  lifetimeVisits: number
  lifetimePageviews: number
  fetchedAt: number
}

export interface FetchHomeAnalyticsOptions {
  fetchImpl?: typeof fetch
  now?: Date
  signal?: AbortSignal
}

const SHARE_PATH = /^\/share\/([^/]+)\/?$/

export function readHomeAnalyticsConfig(
  env: Record<string, string | undefined>,
): HomeAnalyticsConfig | null {
  const websiteId = env.VITE_WBX_UMAMI_WEBSITE_ID?.trim()
  const shareUrl = env.VITE_WBX_UMAMI_SHARE_URL?.trim()
  const collectionStartedAt = Date.parse(
    env.VITE_WBX_UMAMI_COLLECTION_STARTED_AT?.trim() ?? '',
  )

  if (!websiteId || !shareUrl || !Number.isFinite(collectionStartedAt)) return null

  try {
    const url = new URL(shareUrl)
    if (url.protocol !== 'https:' || !SHARE_PATH.test(url.pathname)) return null
  } catch {
    return null
  }

  return { websiteId, shareUrl, collectionStartedAt }
}

export function shanghaiRanges(now: Date, collectionStartedAt: number) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value
  const startAt = Date.parse(`${value('year')}-${value('month')}-${value('day')}T00:00:00+08:00`)
  const endAt = now.getTime()

  return {
    today: { startAt, endAt },
    lifetime: { startAt: collectionStartedAt, endAt },
  }
}

function parseStats(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Invalid Umami stats')
  const { visits, pageviews } = value as Record<string, unknown>
  for (const metric of [visits, pageviews]) {
    if (!Number.isInteger(metric) || (metric as number) < 0) {
      throw new Error('Invalid Umami stats')
    }
  }
  return { visits: visits as number, pageviews: pageviews as number }
}

async function readJson(response: Response) {
  if (!response.ok) throw new Error(`Umami request failed (${response.status})`)
  return response.json() as Promise<unknown>
}

export async function fetchHomeAnalytics(
  config: HomeAnalyticsConfig,
  options: FetchHomeAnalyticsOptions = {},
): Promise<HomeAnalyticsSnapshot> {
  const fetchImpl = options.fetchImpl ?? fetch
  const now = options.now ?? new Date()
  const shareUrl = new URL(config.shareUrl)
  const slug = SHARE_PATH.exec(shareUrl.pathname)?.[1]
  if (!slug) throw new Error('Invalid Umami share URL')

  const apiOrigin = `${shareUrl.origin}/analytics/eu/api`
  const share = await readJson(await fetchImpl(
    `${apiOrigin}/share/${encodeURIComponent(slug)}`,
    { signal: options.signal },
  )) as Record<string, unknown>
  if (typeof share.token !== 'string' || share.token.length === 0) {
    throw new Error('Invalid Umami share token')
  }

  const headers = {
    'x-umami-share-context': '1',
    'x-umami-share-token': share.token,
  }
  const ranges = shanghaiRanges(now, config.collectionStartedAt)
  const statsUrl = (range: { startAt: number; endAt: number }) => {
    const query = new URLSearchParams({
      startAt: String(range.startAt),
      endAt: String(range.endAt),
    })
    return `${apiOrigin}/websites/${encodeURIComponent(config.websiteId)}/stats?${query}`
  }
  const [today, lifetime] = await Promise.all([
    fetchImpl(statsUrl(ranges.today), { headers, signal: options.signal }),
    fetchImpl(statsUrl(ranges.lifetime), { headers, signal: options.signal }),
  ])
  const todayStats = parseStats(await readJson(today))
  const lifetimeStats = parseStats(await readJson(lifetime))

  return {
    todayVisits: todayStats.visits,
    todayPageviews: todayStats.pageviews,
    lifetimeVisits: lifetimeStats.visits,
    lifetimePageviews: lifetimeStats.pageviews,
    fetchedAt: now.getTime(),
  }
}
