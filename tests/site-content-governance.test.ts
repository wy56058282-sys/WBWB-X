import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const partTwo = readFileSync(
  'docs/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/index.md',
  'utf8',
)
const settingsGuide = readFileSync(
  'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/使用心得：新手工具设置（必看）/index.md',
  'utf8',
)

describe('published content governance', () => {
  it('uses the current chapter 11-to-21 sequence in the second-part map', () => {
    const mappedChapters = [...partTwo.matchAll(/^\| L[^|]*\|\s*(\d+)\./gm)].map(
      (match) => Number(match[1]),
    )
    expect(mappedChapters).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
    expect(partTwo).toContain('11. 办公三件套：Word、Excel、PPT')
    expect(partTwo).toContain('21. WorkBuddy也能做GEO专家')
    expect(partTwo).not.toContain('第一份办公产物')
    expect(partTwo).not.toContain('23. 日常办公协同工作台')
  })

  it('does not present the task-mode image as model selection', () => {
    expect(settingsGuide).not.toContain('/images/new-user-settings/03-model-selection.png')
    expect(settingsGuide).toContain('/images/new-user-settings/02-task-mode.png')
  })

  it('removes only the confirmed unreferenced assets', () => {
    const unused = [
      'docs/public/article-assets/source-calibration/community/003.jpg',
      'docs/public/article-assets/source-calibration/community/004.jpg',
      'docs/public/brand/sparkx-logo.svg',
      'docs/public/images/new-user-settings/10-custom-instruction-template.png',
    ]
    for (const path of unused) expect(existsSync(path), path).toBe(false)
  })
})
