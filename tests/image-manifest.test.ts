import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import manifest from '../docs/.vitepress/image-manifest.generated.json'

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

      const attributionLinks = [
        '<a href="https://workbuddy.homes/">Source attribution</a>',
        '<a :href="\'https://workbuddy.homes/\'">Source attribution</a>',
      ]
      for (const attributionLink of attributionLinks) {
        writeFileSync(fixturePath, `${attributionLink}\n`)
        expect(checkAssets().status).toBe(0)
      }

      writeFileSync(fixturePath, '<a :href="\'https://workbuddy.homes/\'">Source</a>\n')
      expect(checkAssets().status).toBe(1)

      const assetReferences = [
        '![Source attribution](https://workbuddy.homes/logo.svg)',
        '<img src="https://workbuddy.homes/logo.svg" alt="Source attribution">',
        '<source srcset="https://workbuddy.homes/logo.svg" data-note="Source attribution">',
        '.logo { background: url(https://workbuddy.homes/logo.svg); } /* Source attribution */',
        "import logo from 'https://workbuddy.homes/logo.svg' // Source attribution",
        '<img :src="\'https://workbuddy.homes/logo.svg\'" alt="Source attribution">',
        '<link href="https://workbuddy.homes/styles.css" rel="stylesheet" data-note="Source attribution">',
        '<use href="https://workbuddy.homes/sprite.svg#icon" data-note="Source attribution">',
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

describe('article image replacement inventory', () => {
  it('tracks every captured article image with stable replacement paths', () => {
    const columns = [
      'id',
      'page',
      'order',
      'purpose',
      'sourceUrl',
      'calibrationPath',
      'replacementPath',
      'sourceWidth',
      'sourceHeight',
      'format',
      'status',
    ]

    expect(manifest).toHaveLength(269)
    expect(manifest.filter((item) => item.id.startsWith('ch'))).toHaveLength(235)
    expect(manifest.filter((item) => item.id.startsWith('case-'))).toHaveLength(29)
    expect(manifest.filter((item) => item.id.startsWith('community-'))).toHaveLength(4)
    expect(manifest.filter((item) => item.id.startsWith('help-'))).toHaveLength(1)
    expect(new Set(manifest.map((item) => item.id)).size).toBe(manifest.length)

    for (const item of manifest) {
      expect(Object.keys(item)).toEqual(columns)
      expect(item.id).toMatch(
        /^(?:ch\d{2}|appendix-[a-z]|case-[a-z0-9-]+|community|help)-\d{3}$/,
      )
      expect(item.sourceUrl).toMatch(/^https:\/\/workbuddy\.homes\//)
      expect(item.calibrationPath).toMatch(
        /^\/article-assets\/source-calibration\/(?:ch\d{2}|appendix-[a-z]|case-[a-z0-9-]+|community|help)\/\d{3}\.(?:png|jpg|gif)$/,
      )
      expect(item.replacementPath).toMatch(
        /^\/article-assets\/replacements\/(?:ch\d{2}|appendix-[a-z]|case-[a-z0-9-]+|community|help)\/\d{3}\.(?:png|jpg|gif)$/,
      )
      expect(item.sourceWidth).toBeGreaterThan(0)
      expect(item.sourceHeight).toBeGreaterThan(0)
      expect(item.status).toBe('awaiting-replacement')
      expect(existsSync(join('docs', 'public', item.calibrationPath))).toBe(true)
      expect(
        existsSync(dirname(join('docs', 'public', item.replacementPath))),
      ).toBe(true)
    }
  })

  it('keeps manifest order aligned with the local Markdown references', () => {
    const recordsByPage = new Map<string, typeof manifest>()
    for (const item of manifest) {
      const records = recordsByPage.get(item.page) ?? []
      records.push(item)
      recordsByPage.set(item.page, records)
    }

    for (const [page, records] of recordsByPage) {
      const indexPath = join('docs', page, 'index.md')
      const markdownPath = existsSync(indexPath)
        ? indexPath
        : join('docs', `${page.replace(/^\/|\/$/g, '')}.md`)
      const markdown = readFileSync(markdownPath, 'utf8')
      const imagePaths = [
        ...new Set(
          [
            ...markdown.matchAll(
              /!\[[^\]]*\]\(([^)\s]+)|<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi,
            ),
          ].map((match) => match[1] ?? match[2]),
        ),
      ]

      expect(imagePaths).toEqual(records.map((item) => item.calibrationPath))
      expect(records.map((item) => item.order)).toEqual(
        records.map((_, index) => index + 1),
      )
    }
  })

  it('publishes one CSV row per manifest record with an empty notes slot', () => {
    const lines = readFileSync('article-image-replacement-manifest.csv', 'utf8')
      .trimEnd()
      .split('\n')

    expect(lines[0]).toBe(
      'id,page,order,purpose,sourceUrl,calibrationPath,replacementPath,sourceWidth,sourceHeight,format,status,notes',
    )
    expect(lines).toHaveLength(manifest.length + 1)

    for (const [index, item] of manifest.entries()) {
      expect(lines[index + 1]).toMatch(new RegExp(`^${item.id},`))
      expect(lines[index + 1]).toContain(`,${item.replacementPath},`)
      expect(lines[index + 1]).toMatch(/,awaiting-replacement,$/)
    }
  })
})
