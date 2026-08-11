import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const helpPage = readFileSync('docs/help/index.md', 'utf8')
const servicePage = readFileSync('docs/.vitepress/theme/ServicePage.vue', 'utf8')
const serviceStyles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

describe('help survey poster layout', () => {
  it('uses the approved scene collection poster', () => {
    const poster = readFileSync(
      'docs/public/article-assets/source-calibration/help/001.png',
    )

    expect(createHash('sha256').update(poster).digest('hex')).toBe(
      '80816579e797eb39697857397d68a71972f178324408f54f8a7e00f9e716a15b',
    )
  })

  it('keeps the free case questionnaire entry separate from paid diagnostics', () => {
    expect(servicePage).toContain('id="scenario-survey"')
    expect(servicePage).toContain('/article-assets/source-calibration/help/001.png')
    expect(servicePage).toContain('WorkBuddy 需求与案例投稿问卷')
    expect(servicePage).toContain('【案例投稿】')
    expect(servicePage).toContain('无需 GitHub')
  })

  it('renders the survey poster full width without a fixed height cap', () => {
    const rule = serviceStyles.match(/\.wbx-service-survey__image\s*{([\s\S]*?)}/)?.[1] ?? ''

    expect(rule).toMatch(/width:\s*100%/)
    expect(rule).toMatch(/height:\s*auto/)
    expect(rule).toMatch(/object-fit:\s*contain/)
    expect(rule).not.toMatch(/max-height:/)
  })

  it('uses the compact service page shell', () => {
    expect(helpPage).toContain('pageClass: custom-service-page')
    expect(helpPage).toContain('<ServicePage />')
    expect(serviceStyles).toMatch(/\.wbx-service-survey__media\s*{[\s\S]*?width:\s*min\(100%,\s*360px\)/)
  })
})
