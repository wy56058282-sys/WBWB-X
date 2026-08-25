import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const casesPage = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')
const toolsPage = readFileSync('docs/.vitepress/theme/ToolsPage.vue', 'utf8')
const workBuddyProduct = readFileSync('docs/.vitepress/theme/ServicePage.vue', 'utf8')
const enterprisePage = readFileSync('docs/.vitepress/theme/EnterpriseServicesPage.vue', 'utf8')
const sharedStyles = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
const toolsStyles = readFileSync('docs/.vitepress/theme/tools.css', 'utf8')
const enterpriseStyles = readFileSync('docs/.vitepress/theme/enterprise-services.css', 'utf8')

describe('shared marketing page header', () => {
  it('uses the same label, page-name heading, and description structure', () => {
    expect(casesPage).toContain('class="wbx-cases-hero wbx-page-header"')
    expect(casesPage).toContain('<p class="wbx-pixel-label">CASE LIBRARY</p>')
    expect(casesPage).toContain('<h1 id="case-gallery-title">案例集</h1>')
    expect(casesPage).not.toContain('wbx-cases-brand')

    expect(toolsPage).toContain('class="wbx-tools__header wbx-page-header"')
    expect(toolsPage).toContain('<p class="wbx-pixel-label">PRODUCT TOOLKIT</p>')
    expect(toolsPage).toContain('<h1>工具集</h1>')
    expect(workBuddyProduct).not.toContain('<h1>')
    expect(workBuddyProduct).toContain('<h2 class="wbx-service-hero__title">一句话，')

    expect(enterprisePage).toContain('class="wbx-enterprise__hero wbx-page-header"')
    expect(enterprisePage).toContain('<p class="wbx-pixel-label">ENTERPRISE SERVICES</p>')
    expect(enterprisePage).toContain('<h1>企业服务</h1>')
    expect(enterprisePage).not.toMatch(/<h1>[\s\S]*?<br[\s/>]/)
    expect(enterprisePage).toContain('从问题梳理到场景落地，把 AI 变成可执行、可验收、可复用的工作系统。')
  })

  it('defines one shared visual contract without page-specific heading overrides', () => {
    expect(sharedStyles).toMatch(/\.wbx-page-header\s*\{[^}]*padding:\s*24px 0 36px;/s)
    expect(sharedStyles).toMatch(/\.wbx-page-header > \.wbx-pixel-label,[^{]*\{[^}]*margin:\s*0 0 12px;/s)
    expect(sharedStyles).toMatch(/\.wbx-page-header > h1,[^{]*\{[^}]*margin:\s*0 0 12px;[^}]*font-size:\s*52px;[^}]*font-weight:\s*700;[^}]*line-height:\s*1\.2;[^}]*letter-spacing:\s*-0\.03em;/s)
    expect(sharedStyles).toMatch(/\.wbx-page-header > p:last-child,[^{]*\{[^}]*max-width:\s*720px;[^}]*margin:\s*0;[^}]*font-size:\s*17px;[^}]*font-weight:\s*400;[^}]*line-height:\s*1\.65;/s)

    expect(casesStyles).not.toMatch(/\.wbx-cases h1\s*\{/)
    expect(toolsStyles).not.toMatch(/\.wbx-tools__header h1\s*\{/)
    expect(enterpriseStyles).not.toMatch(/\.wbx-enterprise__hero h1\s*\{/)
  })
})
