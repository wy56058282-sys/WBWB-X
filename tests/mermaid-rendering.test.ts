import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const configSource = readFileSync('docs/.vitepress/config.mts', 'utf8')
const themeSource = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')

describe('Mermaid diagram rendering', () => {
  it('loads Mermaid only when a diagram is rendered', () => {
    expect(packageJson.devDependencies.mermaid).toBeDefined()
    expect(packageJson.devDependencies['vitepress-plugin-mermaid']).toBeDefined()
    for (const dependency of [
      '@braintree/sanitize-url',
      'dayjs',
      'debug',
      'cytoscape-cose-bilkent',
      'cytoscape',
    ]) {
      expect(packageJson.devDependencies[dependency]).toBeDefined()
    }
    expect(configSource).toContain("import { MermaidMarkdown } from 'vitepress-plugin-mermaid'")
    expect(configSource).not.toContain('withMermaid')
    expect(configSource).toMatch(/MermaidMarkdown\(md,\s*undefined\)/)
    expect(themeSource).toContain("defineAsyncComponent(() => import('vitepress-plugin-mermaid/Mermaid.vue'))")
  })
})
