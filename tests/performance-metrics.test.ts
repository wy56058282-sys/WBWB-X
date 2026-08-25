import { describe, expect, it, vi } from 'vitest'
import { reportPerformanceMetric } from '../docs/.vitepress/theme/performanceMetrics'

describe('performance metrics reporting', () => {
  it('sends only the metric name, rounded value, and page path', () => {
    const track = vi.fn()

    reportPerformanceMetric('LCP', 2412.7, '/tools/', { track })

    expect(track).toHaveBeenCalledWith('web-vital', {
      name: 'LCP',
      value: 2413,
      path: '/tools/',
    })
  })
})
