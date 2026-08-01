import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const configSource = readFileSync('docs/.vitepress/config.mts', 'utf8')

describe('Mermaid diagram rendering', () => {
  it('registers Mermaid support instead of exposing diagram source as code', () => {
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
    expect(configSource).toContain("import { withMermaid } from 'vitepress-plugin-mermaid'")
    expect(configSource).toMatch(/export default withMermaid\(defineConfig\(/)
  })
})
