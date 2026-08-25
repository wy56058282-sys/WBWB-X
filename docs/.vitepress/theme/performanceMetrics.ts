type MetricName = 'LCP' | 'CLS' | 'INP' | 'TTFB'
type Tracker = { track: (event: string, data: Record<string, string | number>) => void }

let started = false

function tracker() {
  return (window as Window & { umami?: Tracker }).umami
}

export function reportPerformanceMetric(
  name: MetricName,
  value: number,
  path = window.location.pathname,
  analytics = tracker(),
) {
  if (!analytics || !Number.isFinite(value)) return
  analytics.track('web-vital', { name, value: Math.round(value), path })
}

function observe(type: string, callback: (entries: PerformanceEntry[]) => void) {
  if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return
  const observer = new PerformanceObserver((list) => callback(list.getEntries()))
  observer.observe({ type, buffered: true } as PerformanceObserverInit)
  return observer
}

export function startPerformanceMonitoring() {
  if (started || typeof PerformanceObserver === 'undefined') return
  started = true

  let lcp = 0
  let cls = 0
  const interactions: number[] = []
  const observers = [
    observe('largest-contentful-paint', (entries) => {
      lcp = entries.at(-1)?.startTime ?? lcp
    }),
    observe('layout-shift', (entries) => {
      for (const entry of entries as Array<PerformanceEntry & { value: number, hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) cls += entry.value
      }
    }),
    observe('event', (entries) => {
      for (const entry of entries as Array<PerformanceEntry & { duration: number, interactionId?: number }>) {
        if (entry.interactionId) interactions.push(entry.duration)
      }
    }),
  ].filter(Boolean) as PerformanceObserver[]

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (navigation) reportPerformanceMetric('TTFB', navigation.responseStart)

  function flush() {
    if (lcp) reportPerformanceMetric('LCP', lcp)
    reportPerformanceMetric('CLS', cls * 1000)
    if (interactions.length) {
      interactions.sort((left, right) => left - right)
      const index = Math.max(0, Math.ceil(interactions.length * 0.98) - 1)
      reportPerformanceMetric('INP', interactions[index])
    }
    observers.forEach((observer) => observer.disconnect())
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  }, { once: true })
  window.addEventListener('pagehide', flush, { once: true })
}
