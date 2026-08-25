import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import { readFileSync } from 'node:fs'

vi.mock('vitepress', () => ({
  withBase: (path: string) => path,
}))

import CaseServiceCta from '../docs/.vitepress/theme/CaseServiceCta.vue'

const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
})

describe('case service CTA', () => {
  it('links similar needs to the paid diagnostic page', () => {
    const host = document.createElement('div')
    document.body.append(host)

    const app = createApp(CaseServiceCta)
    app.mount(host)
    apps.push(app)

    const cta = document.querySelector('.wbx-case-service-cta')
    const link = cta?.querySelector('a')

    expect(cta?.textContent).toContain('有类似需求？')
    expect(link?.getAttribute('href')).toBe('/services/#diagnosis')
    expect(link?.textContent).toContain('预约付费诊断')
    expect(cta?.querySelectorAll('a')).toHaveLength(1)
    expect(cta?.textContent).not.toMatch(/¥|二维码|表单/)
  })

  it('mounts exactly one CTA at the end of every case detail page', () => {
    const caseSources = [
      'annual-report-digital-transformation',
      'daily-ai-news',
      'jz-2025-showreel',
      'tea-shop-sales-analysis',
      'vibe-resume',
      'wechat-format-publish',
      'wechat-ima-knowledge',
    ].map((slug) =>
      readFileSync(`docs/cases/submissions/${slug}/index.md`, 'utf8'),
    )

    for (const source of caseSources) {
      expect(source.trimEnd()).toMatch(/<CaseServiceCta\s*\/>$/)
      expect(source.match(/<CaseServiceCta\s*\/>/g)).toHaveLength(1)
    }
  })
})
