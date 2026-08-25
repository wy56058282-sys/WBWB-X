import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const themeSource = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
const layoutSource = readFileSync('docs/.vitepress/theme/Layout.vue', 'utf8')

describe('route-level theme loading', () => {
  it('loads page components asynchronously', () => {
    for (const component of [
      'CasesPage',
      'CaseServiceCta',
      'AboutPage',
      'ServicePage',
      'ToolsPage',
      'EnterpriseServicesPage',
      'LegacyPageRedirect',
    ]) {
      expect(themeSource).toContain(`defineAsyncComponent(() => import('./${component}.vue'))`)
      expect(themeSource).not.toContain(`import ${component} from './${component}.vue'`)
    }
    expect(layoutSource).toContain("defineAsyncComponent(() => import('./HomePage.vue'))")
  })

  it('keeps page-private styles out of the global theme entry', () => {
    for (const stylesheet of ['home', 'workshop', 'cases', 'service', 'about', 'tools', 'enterprise-services']) {
      expect(themeSource).not.toContain(`import './${stylesheet}.css'`)
    }
  })
})
