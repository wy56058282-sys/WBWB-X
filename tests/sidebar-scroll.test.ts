import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

afterEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('desktop sidebar scrolling', () => {
  it('keeps the logo curtain fixed and scrolls only the navigation below it', () => {
    const style = document.createElement('style')
    style.textContent = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
    document.head.append(style)
    document.documentElement.style.setProperty('--wbx-line', '#d7dbd0')

    const sidebar = document.createElement('aside')
    sidebar.className = 'VPSidebar'
    const curtain = document.createElement('div')
    curtain.className = 'curtain'
    const nav = document.createElement('nav')
    nav.className = 'nav'
    sidebar.append(curtain, nav)
    document.body.append(sidebar)

    expect(getComputedStyle(sidebar).overflowY).toBe('hidden')
    expect(getComputedStyle(curtain).borderBottomWidth).toBe('1px')
    expect(getComputedStyle(nav).overflowY).toBe('auto')
  })
})
