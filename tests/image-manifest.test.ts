import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import manifest from '../docs/.vitepress/image-manifest.generated.json'

const fixturePath = join('docs', '.asset-validation-fixture.md')
const csvColumns = [
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
  'notes',
] as const

function checkAssets() {
  return spawnSync(process.execPath, ['scripts/check-replacement-assets.mjs'], {
    encoding: 'utf8',
  })
}

function parseCsv(csv: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]

    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(cell)
      cell = ''
    } else if (character === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (character !== '\r') {
      cell += character
    }
  }

  expect(quoted).toBe(false)
  expect(row).toEqual([])
  expect(cell).toBe('')
  return rows
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
  it('keeps every awaiting-replacement inventory statistic aligned with the manifest', () => {
    const inventory = readFileSync('CONTENT_INVENTORY.md', 'utf8')
    const awaitingReplacementCount = manifest.filter(
      (item) => item.status === 'awaiting-replacement',
    ).length
    const reportedCounts = [
      ...inventory.matchAll(
        /(?:`awaiting-replacement`[：:]\s*(\d+)\s*条|(\d+)\s*条图片仍标记为\s*`awaiting-replacement`)/g,
      ),
    ].map((match) => Number(match[1] ?? match[2]))

    expect(reportedCounts).toHaveLength(2)
    expect(reportedCounts).toEqual([
      awaitingReplacementCount,
      awaitingReplacementCount,
    ])
  })

  it('does not retain the retired case-index calibration asset', () => {
    const retiredId = 'case-index-001'
    const retiredPublicPath =
      'docs/public/article-assets/source-calibration/case-index/001.jpg'
    const retiredPublishedPath =
      'docs/.vitepress/dist/article-assets/source-calibration/case-index/001.jpg'
    const retiredPublicUrl =
      '/article-assets/source-calibration/case-index/001.jpg'
    const inventory = readFileSync('CONTENT_INVENTORY.md', 'utf8')
    const csv = readFileSync('article-image-replacement-manifest.csv', 'utf8')
    const caseIndexSources = [
      readFileSync('docs/cases/index.md', 'utf8'),
      readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8'),
    ].join('\n')

    expect.soft(manifest.some((item) => item.id === retiredId)).toBe(false)
    expect.soft(csv).not.toContain(retiredId)
    expect.soft(inventory).not.toContain(retiredPublicPath)
    expect.soft(caseIndexSources).not.toContain(retiredPublicUrl)
    expect.soft(existsSync(retiredPublicPath)).toBe(false)
    expect.soft(existsSync(retiredPublishedPath)).toBe(false)
  })

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

    expect(manifest).toHaveLength(270)
    expect(manifest.filter((item) => item.id.startsWith('ch'))).toHaveLength(239)
    expect(manifest.filter((item) => item.id.startsWith('case-'))).toHaveLength(28)
    expect(manifest.filter((item) => item.id.startsWith('community-'))).toHaveLength(2)
    expect(manifest.filter((item) => item.id.startsWith('help-'))).toHaveLength(1)
    expect(new Set(manifest.map((item) => item.id)).size).toBe(manifest.length)
    expect(manifest.find((item) => item.id === 'ch01-004')?.sourceUrl).toBe(
      'user-provided://1783101228901_kno9pn_HMOXgjAbkAASPAl.jpg',
    )

    for (const item of manifest) {
      expect(Object.keys(item)).toEqual(columns)
      expect(item.id).toMatch(
        /^(?:ch\d{2}|appendix-[a-z]|case-[a-z0-9-]+|community|help)-\d{3}$/,
      )
      if (item.sourceUrl.startsWith('user-provided://')) {
        expect(item.sourceUrl).toMatch(
          /^user-provided:\/\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:png|jpg|gif)$/,
        )
      } else {
        expect(item.sourceUrl).toMatch(/^https:\/\/workbuddy\.homes\//)
      }
      expect(item.calibrationPath).toMatch(
        /^\/article-assets\/source-calibration\/(?:ch\d{2}|appendix-[a-z]|case-[a-z0-9-]+|community|help)\/\d{3}\.(?:png|jpg|gif)$/,
      )
      expect(item.replacementPath).toMatch(
        /^\/article-assets\/replacements\/(?:ch\d{2}|appendix-[a-z]|case-[a-z0-9-]+|community|help)\/\d{3}\.(?:png|jpg|gif)$/,
      )
      expect(item.sourceWidth).toBeGreaterThan(0)
      expect(item.sourceHeight).toBeGreaterThan(0)
      expect(['awaiting-replacement', 'replaced', 'approved']).toContain(
        item.status,
      )
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
      const componentPathByPage: Record<string, string> = {
        '/cases/': 'docs/.vitepress/theme/CasesPage.vue',
      }
      const componentPath = componentPathByPage[page]
      const markdown = [
        readFileSync(markdownPath, 'utf8'),
        componentPath ? readFileSync(componentPath, 'utf8') : '',
      ].join('\n')
      const imagePaths = [
        ...new Set(
          [
            ...markdown.matchAll(
              /!\[[^\]]*\]\(([^)\s]+)|<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi,
            ),
            ...markdown.matchAll(
              /<img\b[^>]*?:src\s*=\s*["']withBase\(["']([^"']+)["']\)["']/gi,
            ),
          ]
            .map((match) => match[1] ?? match[2])
            .filter((path) =>
              /^\/article-assets\/(?:source-calibration|replacements)\//.test(path),
            ),
        ),
      ]

      expect(imagePaths).toEqual(
        records.map((item) =>
          item.status === 'awaiting-replacement'
            ? item.calibrationPath
            : item.replacementPath,
        ),
      )
      expect(records.map((item) => item.order)).toEqual(
        records.map((_, index) => index + 1),
      )
    }
  })

  it('publishes one CSV row per manifest record with an empty notes slot', () => {
    const [header, ...rows] = parseCsv(
      readFileSync('article-image-replacement-manifest.csv', 'utf8'),
    )

    expect(header).toEqual(csvColumns)
    expect(rows).toEqual(
      manifest.map((item) => [
        ...csvColumns
          .slice(0, -1)
          .map((column) => String(item[column as keyof typeof item])),
        '',
      ]),
    )
  })

  it('keeps videos local as supporting media outside the image-only manifest', () => {
    const videoPaths = [
      '/article-assets/source-calibration/ch23/video-001.mp4',
      '/article-assets/source-calibration/ch24/video-001.mp4',
    ]

    expect(manifest.every((item) => item.format !== 'mp4')).toBe(true)
    for (const videoPath of videoPaths) {
      expect(existsSync(join('docs', 'public', videoPath))).toBe(true)
    }

    const chapter23 = readFileSync(
      join(
        'docs',
        'wb-x',
        '第三篇 进阶篇：把案例变成自己的工作系统',
        '第 23 章 其他用法补充：WorkBuddy 实操案例集',
        'index.md',
      ),
      'utf8',
    )
    const chapter24 = readFileSync(
      join(
        'docs',
        'wb-x',
        '第三篇 进阶篇：把案例变成自己的工作系统',
        '第 24 章 如何进行多 Agent 系统设计',
        'index.md',
      ),
      'utf8',
    )

    expect(chapter23).toContain(`<video controls preload="metadata" src="${videoPaths[0]}">`)
    expect(chapter24).toContain(`<video controls preload="metadata" src="${videoPaths[1]}">`)
  })
})
