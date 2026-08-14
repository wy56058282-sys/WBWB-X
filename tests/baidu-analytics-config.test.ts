import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const configSource = readFileSync(
  resolve(process.cwd(), 'docs/.vitepress/config.mts'),
  'utf8',
)

describe('Baidu Analytics configuration', () => {
  it('loads the site tracker once over HTTPS without blocking rendering', () => {
    const trackerUrl = 'https://hm.baidu.com/hm.js?7a23a8966a0536ac9ba595d6a0544f07'

    expect(configSource.match(new RegExp(trackerUrl.replace(/[?]/g, '\\?'), 'g'))).toHaveLength(1)
    expect(configSource).toMatch(
      /\['script',\s*\{\s*src:\s*BAIDU_ANALYTICS_URL,\s*async:\s*''\s*\}\]/,
    )
  })
})
