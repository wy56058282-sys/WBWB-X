import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  csvColumns,
  csvFor,
  parseCsv,
} from '../scripts/lib/image-manifest/csv.mjs'
import {
  imageDimensions,
  imageFormat,
  imageReferences,
  purposeFor,
  videoReferences,
} from '../scripts/lib/image-manifest/media.mjs'

describe('image manifest CSV primitives', () => {
  it('round-trips quoted notes using the production schema', () => {
    const record = {
      id: 'ch01-001', page: '/wb-x/demo/', order: 1,
      purpose: 'Demo', sourceUrl: 'https://workbuddy.homes/demo.png',
      calibrationPath: '/article-assets/source-calibration/ch01/001.png',
      replacementPath: '/article-assets/replacements/ch01/001.png',
      sourceWidth: 800, sourceHeight: 600, format: 'png',
      status: 'awaiting-replacement',
    }
    const csv = csvFor([record], new Map([[record.id, 'owner, "review"']]))
    const rows = parseCsv(csv, 'fixture.csv')
    expect(rows[0]).toEqual(csvColumns)
    expect(rows[1]).toHaveLength(csvColumns.length)
    expect(rows[1].at(-1)).toBe('owner, "review"')
  })

  it('rejects an unterminated quoted cell with the source path', () => {
    expect(() => parseCsv('id,notes\n1,"open', 'broken.csv'))
      .toThrow('Unterminated quoted CSV cell in broken.csv')
  })
})

describe('image manifest media primitives', () => {
  it('extracts Markdown, HTML image, and video references in order', () => {
    const source = [
      '![Markdown alt](./one.png)',
      '<img alt="HTML alt" src="./two.jpg">',
      '<video src="./demo.mp4"></video>',
    ].join('\n')
    expect(imageReferences(source)).toEqual([
      { alt: 'Markdown alt', target: './one.png', type: 'markdown' },
      { alt: 'HTML alt', target: './two.jpg', type: 'html' },
    ])
    expect(videoReferences(source)).toEqual(['./demo.mp4'])
  })

  it('reads the production PNG signature and dimensions', () => {
    const path = 'docs/public/article-assets/source-calibration/ch02/004.png'
    const buffer = readFileSync(path)
    expect(imageFormat(buffer, path)).toBe('png')
    const [width, height] = imageDimensions(buffer, 'png', path)
    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })

  it('uses alt text before the generated purpose fallback', () => {
    expect(purposeFor('Chapter', ' Diagram ', 2)).toBe('Diagram')
    expect(purposeFor('Chapter', '', 2)).toBe('Chapter — image 2')
  })
})
