// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'

const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

beforeEach(() => {
  document.head.innerHTML = `<style>${css}</style>`
  document.body.innerHTML = ''
})

describe('documentation title typography', () => {
  it('applies the approved reference values to document H1 headings', () => {
    document.body.innerHTML = '<main class="VPDoc"><div class="vp-doc"><div><h1>第 1 章 初识 WorkBuddy</h1></div></div></main>'
    const title = document.querySelector('h1') as HTMLElement
    const style = getComputedStyle(title)

    expect(style.fontSize).toBe('var(--wbx-type-page-size)')
    expect(style.fontWeight).toBe('var(--wbx-weight-bold)')
    expect(style.lineHeight).toBe('var(--wbx-leading-page)')
    expect(style.letterSpacing).toBe('-0.03em')
    expect(style.marginBottom).toBe('34px')
  })

  it('does not apply document title values to homepage or help heroes', () => {
    document.body.innerHTML = '<section class="wbx-hero__copy"><h1>首页</h1></section><section class="help-hero"><h1>提需求</h1></section>'
    const titles = Array.from(document.querySelectorAll('h1')) as HTMLElement[]

    for (const title of titles) {
      expect(getComputedStyle(title).fontSize).not.toBe('var(--wbx-type-page-size)')
      expect(getComputedStyle(title).fontWeight).not.toBe('var(--wbx-weight-bold)')
    }
  })
})
