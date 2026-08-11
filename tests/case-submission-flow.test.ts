// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const help = readFileSync('docs/help/index.md', 'utf8')
const cases = readFileSync('docs/cases/index.md', 'utf8')
const guide = readFileSync('docs/community/case-contributing.md', 'utf8')
const contributing = readFileSync('docs/community/contributing.md', 'utf8')

describe('low-friction case submission flow', () => {
  it('uses the existing questionnaire for both needs and case submissions', () => {
    expect(help).toContain('需求与案例投稿问卷')
    expect(help).toContain('【案例投稿】')
    expect(help).toContain('无需 GitHub')
  })

  it('makes the questionnaire the primary case submission path', () => {
    expect(cases).toContain('href="/help/#scenario-survey"')
    expect(cases).toContain('填写问卷即可投稿')
    expect(cases).not.toContain('本地构建通过后提交 Pull Request')

    expect(guide).toContain('## 默认方式：填写问卷')
    expect(guide).toContain('/help/#scenario-survey')
    expect(guide).toContain('## 可选方式：通过 GitHub 提交')
  })

  it('keeps GitHub as an optional advanced contribution path', () => {
    expect(guide).toContain('适合熟悉 GitHub 和 Markdown 的贡献者')
    expect(contributing).toContain('无需 GitHub')
    expect(contributing).toContain('GitHub PR 仍作为可选的高级方式')
  })
})
