import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const helpPage = readFileSync('docs/help/index.md', 'utf8')

describe('help survey poster layout', () => {
  it('uses the approved scene collection poster', () => {
    const poster = readFileSync(
      'docs/public/article-assets/source-calibration/help/001.png',
    )

    expect(createHash('sha256').update(poster).digest('hex')).toBe(
      '80816579e797eb39697857397d68a71972f178324408f54f8a7e00f9e716a15b',
    )
  })

  it('renders the survey poster full width without a fixed height cap', () => {
    const rule = helpPage.match(/\.help-survey-card img\s*{([\s\S]*?)}/)?.[1] ?? ''

    expect(rule).toMatch(/width:\s*100%/)
    expect(rule).toMatch(/height:\s*auto/)
    expect(rule).toMatch(/object-fit:\s*contain/)
    expect(rule).not.toMatch(/max-height:/)
  })

  it('preserves the 560px responsive card width', () => {
    expect(helpPage).toMatch(
      /\.help-survey-card\s*{[\s\S]*?width:\s*min\(100%,\s*560px\)/,
    )
  })
})
