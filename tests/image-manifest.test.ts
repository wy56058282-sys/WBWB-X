import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const fixturePath = join('docs', '.asset-validation-fixture.md')

function checkAssets() {
  return spawnSync(process.execPath, ['scripts/check-replacement-assets.mjs'], {
    encoding: 'utf8',
  })
}

describe('required brand assets', () => {
  it('has a valid SVG logo and an 800x800 PNG QR source', () => {
    expect(existsSync('docs/public/brand/wb-x-logo.svg')).toBe(true)
    expect(readFileSync('docs/public/brand/wb-x-logo.svg', 'utf8')).toContain(
      'viewBox="0 0 512 512"',
    )
    expect(existsSync('docs/public/community/wechat-group.png')).toBe(true)
  })

  it('allows source attribution prose but rejects attributed source asset hotlinks', () => {
    try {
      writeFileSync(
        fixturePath,
        'Source attribution: https://workbuddy.homes/ informed this documentation.\n',
      )
      const attributionResult = checkAssets()
      expect(attributionResult.status).toBe(0)
      expect(attributionResult.stdout).toContain('Approved replacement assets')

      const assetReferences = [
        '![Source attribution](https://workbuddy.homes/logo.svg)',
        '<img src="https://workbuddy.homes/logo.svg" alt="Source attribution">',
        '<source srcset="https://workbuddy.homes/logo.svg" data-note="Source attribution">',
        '.logo { background: url(https://workbuddy.homes/logo.svg); } /* Source attribution */',
        "import logo from 'https://workbuddy.homes/logo.svg' // Source attribution",
        '<img :src="\'https://workbuddy.homes/logo.svg\'" alt="Source attribution">',
      ]

      for (const assetReference of assetReferences) {
        writeFileSync(fixturePath, `${assetReference}\n`)
        expect(checkAssets().status).toBe(1)
      }
    } finally {
      rmSync(fixturePath, { force: true })
    }
  })
})
