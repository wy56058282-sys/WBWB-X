import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const helpPage = readFileSync('docs/help/index.md', 'utf8')
const casesPage = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')
const servicePage = readFileSync('docs/.vitepress/theme/ServicePage.vue', 'utf8')
const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

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
    expect(casesPage).toContain('id="submit-case"')
    expect(casesPage).toContain('/article-assets/source-calibration/help/001.png')
    expect(casesPage).toContain('WorkBuddy 需求与案例投稿问卷')
    expect(casesPage).toContain('【案例投稿】')
    expect(servicePage).not.toContain('FREE CASE SUBMISSION')
    expect(servicePage).not.toContain('scenario-survey')
    expect(servicePage).not.toContain('微信支付')
    expect(servicePage).not.toContain('paymentQrPath')
  })

  it('renders the survey poster full width without a fixed height cap', () => {
    const rule = casesStyles.match(/\.wbx-cases-submit__qr img\s*{([\s\S]*?)}/)?.[1] ?? ''

    expect(rule).toMatch(/width:\s*100%/)
    expect(rule).toMatch(/height:\s*auto/)
    expect(rule).toMatch(/object-fit:\s*contain/)
    expect(rule).not.toMatch(/max-height:/)
  })

  it('uses the compact service page shell', () => {
    expect(helpPage).toContain('pageClass: custom-service-page')
    expect(helpPage).toContain('lastUpdated: false')
    expect(helpPage).toContain('title: WorkBuddy 产品能力与服务')
    expect(helpPage).toContain('多 Agent 协作、桌面执行、远程控制与技能生态')
    expect(helpPage).toContain('<ServicePage />')
    expect(casesStyles).toMatch(/\.wbx-cases-submit__qr\s*{[\s\S]*?width:\s*min\(100%,\s*280px\)/)
  })
})
