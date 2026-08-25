import { existsSync, readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'

vi.mock('vitepress', () => ({
  withBase: (path: string) => path,
}))

vi.mock('../docs/.vitepress/case-catalog.data', () => ({
  data: [],
}))

import CasesPage from '../docs/.vitepress/theme/CasesPage.vue'
import { serviceConfig } from '../docs/.vitepress/service-config'

const tools = readFileSync('docs/tools/index.md', 'utf8')
const servicePage = readFileSync('docs/.vitepress/theme/ServicePage.vue', 'utf8')
const cases = readFileSync('docs/cases/index.md', 'utf8')
const guide = readFileSync('docs/community/case-contributing.md', 'utf8')
const contributing = readFileSync('docs/community/contributing.md', 'utf8')

const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  serviceConfig.freeCaseFormUrl = ''
})

function mountCasesPage() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(CasesPage)
  app.mount(host)
  apps.push(app)
}

describe('low-friction case submission flow', () => {
  it('keeps the existing questionnaire QR entry available until a free form is configured', () => {
    expect(serviceConfig.freeCaseFormUrl).toBe('')
    mountCasesPage()

    const fallback = document.querySelector<HTMLAnchorElement>('.wbx-cases-submit__qr')
    const poster = fallback?.querySelector<HTMLImageElement>('img')

    expect(fallback?.getAttribute('href')).toBe('/article-assets/source-calibration/help/001.png')
    expect(fallback?.getAttribute('href')).not.toMatch(/^\/help\//)
    expect(poster?.getAttribute('src')).toBe('/article-assets/source-calibration/help/001.png')
    expect(poster?.getAttribute('alt')).toContain('需求与案例投稿问卷二维码')
    expect(tools).toContain('<ToolsPage />')
    expect(servicePage).not.toContain('需求与案例投稿问卷')
    expect(servicePage).not.toContain('scenario-survey')
  })

  it('uses the independent free form when operations config provides one', () => {
    serviceConfig.freeCaseFormUrl = 'https://forms.example.com/free-case-submission'
    mountCasesPage()

    const form = document.querySelector<HTMLAnchorElement>('.wbx-cases-submit__actions a')

    expect(form?.getAttribute('href')).toBe('https://forms.example.com/free-case-submission')
    expect(form?.getAttribute('target')).toBe('_blank')
    expect(form?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(form?.getAttribute('aria-label')).toContain('在新页面打开')
  })

  it('falls back to the questionnaire QR entry for an invalid free form URL', () => {
    serviceConfig.freeCaseFormUrl = 'http://forms.example.com/free-case-submission'
    mountCasesPage()

    const fallback = document.querySelector<HTMLAnchorElement>('.wbx-cases-submit__qr')

    expect(fallback?.getAttribute('href')).toBe('/article-assets/source-calibration/help/001.png')
    expect(fallback?.getAttribute('href')).not.toMatch(/^\/help\//)
  })

  it('keeps consult-first diagnostics separate from the free case path', () => {
    expect(serviceConfig.applicationFormUrl).toBe('')
    expect(serviceConfig).not.toHaveProperty('paidDiagnosticFormUrl')
    expect(cases).not.toContain('本地构建通过后提交 Pull Request')

    expect(guide).toContain('## 默认方式：填写问卷')
    expect(guide).toContain('/cases/#submit-case')
    expect(guide).not.toContain('/help/#scenario-survey')
    expect(guide).toContain('## 可选方式：通过 GitHub 提交')
  })

  it('references the executable GitHub template and production build script', () => {
    expect(guide).toContain('.github/CASE_TEMPLATE.md')
    expect(existsSync('.github/CASE_TEMPLATE.md')).toBe(true)
    expect(guide).toContain('pnpm run build')

    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    expect(packageJson.scripts?.build).toBeTypeOf('string')
    expect(packageJson.scripts?.build?.trim()).not.toBe('')
  })

  it('keeps GitHub as an optional advanced contribution path', () => {
    expect(guide).toContain('适合熟悉 GitHub 和 Markdown 的贡献者')
    expect(contributing).toContain('无需 GitHub')
    expect(contributing).toContain('GitHub PR 仍作为可选的高级方式')
    expect(contributing).toContain('pnpm run build')
    expect(contributing).not.toContain('npm run docs:build')
  })
})
